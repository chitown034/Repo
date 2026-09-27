#!/usr/bin/env python3
"""import_pack.py — a safe importer for third-party skill packs (e.g. 77skills.ai).

Stdlib only, no PyYAML, no network calls of its own.

    python3 integrations/skill-packs/import_pack.py <zip-or-dir> --pack 77skills [--apply]

Dry-run by default: scans, validates and reports; writes nothing. With `--apply`, copies ONLY
the skills that pass every check to `.claude/skills-staged/<pack>/<name>/` — never the live
`.claude/skills/` — and writes a report to
`integrations/skill-packs/reports/<pack>-<date>.md`. Promoting a staged skill to a live one is a
human step (ECC / Elena security review -> Steven), never something this script does.

What it checks, per `SKILL.md` found (recursively) in the pack:

  1. YAML frontmatter has non-empty `name` and `description` fields (a small hand-rolled
     parser handles the simple `key: value` / `key: "quoted value"` shape these files use —
     no PyYAML dependency).
  2. `name` does not collide with an existing skill under `.claude/skills/*/SKILL.md`.
  3. No file inside the skill's own folder looks dangerous: a script extension
     (.sh/.py/.js/.applescript), a shebang line, a `curl ... | bash`-style pipe-to-shell,
     a network call, an `rm -rf`, or a path under a credential directory (~/.ssh, ~/.aws).
     Any hit flags the skill for ECC security review rather than blocking the scan outright.
  4. `description` length, flagged when it is unusually large — every extra description
     character is paid again out of every session's context, whether the skill is ever used
     that session or not.

A skill that fails 1-3 is never copied, even with --apply. An oversized description (4) is a
warning only; it does not block copying, because it is a cost concern, not a safety one.
"""
from __future__ import annotations

import argparse
import datetime
import os
import re
import shutil
import sys
import tempfile
import zipfile
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
LIVE_SKILLS_DIR = REPO_ROOT / ".claude" / "skills"
STAGED_ROOT = REPO_ROOT / ".claude" / "skills-staged"
REPORTS_DIR = Path(__file__).resolve().parent / "reports"

SCRIPT_EXTENSIONS = {".sh", ".py", ".js", ".applescript", ".command", ".bash", ".zsh"}
SHEBANG_RE = re.compile(rb"^#!")
PIPE_TO_SHELL_RE = re.compile(rb"(curl|wget)\b[^\n]*\|\s*(sudo\s+)?(sh|bash|zsh)\b")
NETWORK_CALL_RE = re.compile(
    rb"\b(curl|wget)\b|"
    rb"\brequests\.(get|post|put|delete)\(|"
    rb"\burllib\.request\b|"
    rb"\bfetch\(|"
    rb"https?://"
)
RM_RF_RE = re.compile(rb"rm\s+-[a-z]*r[a-z]*f|rm\s+-[a-z]*f[a-z]*r")
CREDENTIAL_PATH_RE = re.compile(rb"~?/\.(ssh|aws)(/|\b)")

# Advisory only, not a security check: an oversized description costs tokens on every
# session regardless of whether the skill is used. ~30-60 tokens per skill description is
# the going estimate this pack's own README uses; ~4 chars/token is the usual rule of thumb.
OVERSIZED_DESCRIPTION_CHARS = 600


class SkillFinding:
    def __init__(self, skill_dir: Path, skill_md: Path):
        self.skill_dir = skill_dir
        self.skill_md = skill_md
        self.name: str | None = None
        self.description: str | None = None
        self.frontmatter_errors: list[str] = []
        self.collision_with: str | None = None
        self.risky_files: list[tuple[str, list[str]]] = []
        self.oversized = False

    @property
    def clean(self) -> bool:
        return (
            not self.frontmatter_errors
            and self.collision_with is None
            and not self.risky_files
        )

    @property
    def display_name(self) -> str:
        return self.name or f"<unnamed: {self.skill_dir.name}>"


def parse_frontmatter(text: str) -> dict:
    """A minimal `key: value` YAML-frontmatter parser — just enough for SKILL.md's shape.

    Handles a leading `---` block, one `key: value` per line, values optionally wrapped in
    single or double quotes. Multi-line block scalars (`|`, `>`) are not supported; a
    SKILL.md using one will simply not have that field recognised, which surfaces as a
    frontmatter error rather than a silent misparse.
    """
    lines = text.splitlines()
    if not lines or lines[0].strip() != "---":
        return {}
    fields: dict[str, str] = {}
    for line in lines[1:]:
        stripped = line.strip()
        if stripped == "---":
            break
        if not stripped or stripped.startswith("#"):
            continue
        if ":" not in line:
            continue
        key, _, value = line.partition(":")
        key = key.strip()
        value = value.strip()
        if len(value) >= 2 and value[0] == value[-1] and value[0] in ("'", '"'):
            value = value[1:-1]
        if key and key not in fields:
            fields[key] = value
    return fields


def existing_skill_names() -> set[str]:
    names: set[str] = set()
    if not LIVE_SKILLS_DIR.is_dir():
        return names
    for skill_md in LIVE_SKILLS_DIR.glob("*/SKILL.md"):
        try:
            fields = parse_frontmatter(skill_md.read_text(errors="replace"))
        except OSError:
            continue
        name = fields.get("name")
        if name:
            names.add(name)
    return names


def scan_file_for_risk(path: Path) -> list[str]:
    reasons: list[str] = []
    try:
        data = path.read_bytes()
    except OSError:
        return reasons
    if path.suffix.lower() in SCRIPT_EXTENSIONS:
        reasons.append(f"script file ({path.suffix})")
    if SHEBANG_RE.match(data):
        reasons.append("shebang line")
    if PIPE_TO_SHELL_RE.search(data):
        reasons.append("curl|wget piped to a shell")
    if NETWORK_CALL_RE.search(data):
        reasons.append("network call")
    if RM_RF_RE.search(data):
        reasons.append("rm -rf pattern")
    if CREDENTIAL_PATH_RE.search(data):
        reasons.append("credential path (~/.ssh or ~/.aws)")
    if os.name != "nt" and path.exists():
        try:
            if path.stat().st_mode & 0o111 and path.suffix.lower() not in {".md"}:
                reasons.append("executable bit set")
        except OSError:
            pass
    return reasons


def find_skill_md_files(root: Path) -> list[Path]:
    return sorted(root.rglob("SKILL.md"))


def evaluate_skill(skill_md: Path, known_names: set[str]) -> SkillFinding:
    skill_dir = skill_md.parent
    finding = SkillFinding(skill_dir, skill_md)

    try:
        text = skill_md.read_text(errors="replace")
    except OSError as exc:
        finding.frontmatter_errors.append(f"could not read SKILL.md: {exc}")
        return finding

    fields = parse_frontmatter(text)
    name = fields.get("name", "").strip()
    description = fields.get("description", "").strip()

    if not name:
        finding.frontmatter_errors.append("missing or empty 'name' in frontmatter")
    if not description:
        finding.frontmatter_errors.append("missing or empty 'description' in frontmatter")

    finding.name = name or None
    finding.description = description or None

    if name and name in known_names:
        finding.collision_with = name

    if description and len(description) > OVERSIZED_DESCRIPTION_CHARS:
        finding.oversized = True

    for path in sorted(skill_dir.rglob("*")):
        if path.is_dir() or path == skill_md:
            continue
        reasons = scan_file_for_risk(path)
        if reasons:
            finding.risky_files.append((str(path.relative_to(skill_dir)), reasons))

    return finding


def render_report(pack: str, source: str, findings: list[SkillFinding], applied: bool) -> str:
    today = datetime.date.today().isoformat()
    clean = [f for f in findings if f.clean]
    blocked = [f for f in findings if not f.clean]
    oversized = [f for f in findings if f.oversized]

    lines = [
        f"# Skill-pack import report — {pack} ({today})",
        "",
        f"Source: `{source}`",
        f"Mode: {'APPLIED (staged copy made)' if applied else 'DRY RUN (nothing copied)'}",
        "",
        f"Skills found: {len(findings)} · clean: {len(clean)} · blocked: {len(blocked)} · "
        f"oversized description: {len(oversized)}",
        "",
        "## Clean (eligible for staging)",
        "",
    ]
    if clean:
        for f in clean:
            flag = " (oversized description — token-cost warning only)" if f.oversized else ""
            lines.append(f"- **{f.display_name}** — `{f.skill_dir}`{flag}")
    else:
        lines.append("_None._")

    lines += ["", "## Blocked — needs ECC security review or a rename before staging", ""]
    if blocked:
        for f in blocked:
            lines.append(f"### {f.display_name} — `{f.skill_dir}`")
            for err in f.frontmatter_errors:
                lines.append(f"- frontmatter: {err}")
            if f.collision_with:
                lines.append(
                    f"- name collision with an existing live skill: `{f.collision_with}`"
                )
            for rel_path, reasons in f.risky_files:
                lines.append(f"- `{rel_path}`: {', '.join(reasons)}")
            lines.append("")
    else:
        lines.append("_None._")

    lines += ["", "## Oversized descriptions (token-cost warning, not blocking)", ""]
    if oversized:
        for f in oversized:
            n = len(f.description or "")
            lines.append(
                f"- **{f.display_name}** — {n} chars (~{n // 4} tokens) — "
                f"consider trimming before promoting to a live skill"
            )
    else:
        lines.append("_None._")

    lines += [
        "",
        "## Next step",
        "",
        "Staged skills live at `.claude/skills-staged/<pack>/<name>/`, never in the live "
        "`.claude/skills/`. Promotion to live is a human step: ECC (Elena) security review, "
        "then Steven's go-ahead, one skill at a time.",
        "",
    ]
    return "\n".join(lines) + "\n"


def resolve_source(source_arg: str, extract_dir: Path) -> Path:
    source_path = Path(source_arg).expanduser()
    if source_path.is_dir():
        return source_path
    if source_path.is_file() and zipfile.is_zipfile(source_path):
        with zipfile.ZipFile(source_path) as zf:
            zf.extractall(extract_dir)
        return extract_dir
    raise SystemExit(f"error: '{source_arg}' is neither a directory nor a zip file")


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("source", help="a directory or .zip containing SKILL.md folders")
    parser.add_argument("--pack", required=True, help="pack name, e.g. 77skills")
    parser.add_argument(
        "--apply", action="store_true", help="copy clean skills to .claude/skills-staged/<pack>/"
    )
    args = parser.parse_args(argv)

    known_names = existing_skill_names()

    with tempfile.TemporaryDirectory(prefix="skill-pack-") as tmp:
        root = resolve_source(args.source, Path(tmp) / "extracted")
        skill_md_files = find_skill_md_files(root)

        if not skill_md_files:
            print(f"No SKILL.md files found under '{args.source}'.")
            return 1

        findings = [evaluate_skill(p, known_names) for p in skill_md_files]

        if args.apply:
            staged_pack_dir = STAGED_ROOT / args.pack
            for finding in findings:
                if not finding.clean:
                    continue
                dest = staged_pack_dir / finding.name
                if dest.exists():
                    shutil.rmtree(dest)
                dest.mkdir(parents=True, exist_ok=True)
                shutil.copytree(finding.skill_dir, dest, dirs_exist_ok=True)

        report_text = render_report(args.pack, args.source, findings, applied=args.apply)

    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    report_path = REPORTS_DIR / f"{args.pack}-{datetime.date.today().isoformat()}.md"
    report_path.write_text(report_text)

    print(report_text)
    print(f"Report written to: {report_path}")
    if args.apply:
        print(f"Clean skills staged under: {STAGED_ROOT / args.pack}")
    else:
        print("Dry run — nothing copied. Re-run with --apply to stage the clean skills.")

    return 0


if __name__ == "__main__":
    sys.exit(main())
