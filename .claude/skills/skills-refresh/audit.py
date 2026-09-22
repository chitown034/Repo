#!/usr/bin/env python3
"""skills-refresh audit: report-only scan of SKILL.md files.

Usage: audit.py [--roots DIR ...] [--max-kb N] [--out FILE]

Never edits a skill. Exit code is always 0 so a scheduler treats findings as
a report, not a failure.
"""
import argparse
import datetime as dt
import os
import pathlib
import re
import sys

DEFAULT_ROOTS = [".claude/skills", "~/.claude/skills"]
# Relative paths with an extension, e.g. scripts/run.py or ./references/x.md
PATH_RE = re.compile(r"(?<![\w/:~])((?:\./)?(?:[A-Za-z0-9_.-]+/)+[A-Za-z0-9_.-]+\.[A-Za-z0-9]{1,6})")
CATEGORY_HELP = {
    "name-mismatch": "rename the folder or the frontmatter `name` so they match",
    "dead-path": "fix the reference or drop it; the file is not in the skill folder",
    "oversize": "move long material into references/ and link it from SKILL.md",
    "missing-frontmatter": "add a --- block with name and description",
    "missing-name": "add `name:` matching the folder",
    "missing-description": "add `description:` saying what the skill does and when to use it",
    "long-description": "shorten the description; over 1024 characters weakens triggering",
    "unreadable": "check permissions or encoding",
}


def parse_frontmatter(text):
    if not text.startswith("---"):
        return {}, False
    end = text.find("\n---", 3)
    if end == -1:
        return {}, False
    fm = {}
    for line in text[3:end].splitlines():
        m = re.match(r"^\s*([A-Za-z_][\w-]*)\s*:\s*(.*)$", line)
        if m:
            key, val = m.group(1), m.group(2).strip()
            if len(val) >= 2 and val[0] == val[-1] and val[0] in "\"'":
                val = val[1:-1]
            fm[key] = val
    return fm, True


def find_skills(roots):
    seen = set()
    for root in roots:
        root = pathlib.Path(os.path.expanduser(root))
        if not root.exists():
            continue
        for p in sorted(root.rglob("SKILL.md")):
            rp = p.resolve()
            if rp in seen:
                continue
            seen.add(rp)
            yield p


def referenced_paths(text, skill_dir):
    """Paths the SKILL.md claims to ship: first segment must be an existing
    directory inside the skill folder, or the path starts with ./ ."""
    out = []
    for m in PATH_RE.finditer(text):
        s = m.group(1)
        if "://" in s or s.startswith("~"):
            continue
        first = s.lstrip("./").split("/")[0]
        if s.startswith("./") or (skill_dir / first).is_dir():
            if s not in out:
                out.append(s)
    return out


def audit(roots, max_kb):
    findings = []
    skills = list(find_skills(roots))
    for p in skills:
        d = p.parent
        try:
            text = p.read_text(encoding="utf-8", errors="replace")
        except Exception as e:  # noqa: BLE001
            findings.append((d, "unreadable", str(e)))
            continue
        fm, has_fm = parse_frontmatter(text)
        if not has_fm:
            findings.append((d, "missing-frontmatter", ""))
        else:
            name = fm.get("name", "")
            if not name:
                findings.append((d, "missing-name", ""))
            elif name != d.name:
                findings.append((d, "name-mismatch", f"frontmatter `{name}` vs folder `{d.name}`"))
            desc = fm.get("description", "")
            if not desc:
                findings.append((d, "missing-description", ""))
            elif len(desc) > 1024:
                findings.append((d, "long-description", f"{len(desc)} chars"))
        kb = p.stat().st_size / 1024
        if kb > max_kb:
            findings.append((d, "oversize", f"{kb:.1f} KB > {max_kb} KB"))
        for rp in referenced_paths(text, d):
            if not (d / rp).exists():
                findings.append((d, "dead-path", rp))
    return skills, findings


def render(roots, max_kb, skills, findings):
    now = dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    counts = {}
    for _, cat, _ in findings:
        counts[cat] = counts.get(cat, 0) + 1
    lines = [f"# skills-refresh report — {now}", ""]
    lines.append(f"Roots: {', '.join(roots)} · size cap {max_kb} KB · report-only, nothing was changed.")
    lines.append("")
    lines.append(f"**{len(skills)} skills scanned, {len(findings)} findings, {len({d for d, _, _ in findings})} skills affected.**")
    lines.append("")
    if counts:
        lines.append("| Finding | Count | Smallest fix |")
        lines.append("|---|---|---|")
        for cat in sorted(counts, key=lambda c: -counts[c]):
            lines.append(f"| `{cat}` | {counts[cat]} | {CATEGORY_HELP.get(cat, '')} |")
        lines.append("")
        lines.append("## Findings")
        lines.append("")
        lines.append("| Skill | Finding | Detail |")
        lines.append("|---|---|---|")
        for d, cat, detail in findings:
            lines.append(f"| `{d}` | `{cat}` | {detail} |")
    else:
        lines.append("No findings.")
    lines.append("")
    lines.append("## Skills scanned")
    lines.append("")
    for p in skills:
        lines.append(f"- `{p.parent}` ({p.stat().st_size / 1024:.1f} KB)")
    lines.append("")
    lines.append("Proposals above need a human before anything is edited.")
    return "\n".join(lines) + "\n"


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--roots", nargs="+", default=DEFAULT_ROOTS)
    ap.add_argument("--max-kb", type=float, default=16.0)
    ap.add_argument("--out")
    a = ap.parse_args(argv)
    skills, findings = audit(a.roots, a.max_kb)
    report = render(a.roots, a.max_kb, skills, findings)
    if a.out:
        out = pathlib.Path(a.out)
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(report, encoding="utf-8")
        print(f"wrote {out} ({len(skills)} skills, {len(findings)} findings)")
    else:
        sys.stdout.write(report)
    return 0


if __name__ == "__main__":
    sys.exit(main())
