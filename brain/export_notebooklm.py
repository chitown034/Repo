"""NotebookLM source pack — the brain exported as a handful of clean markdown sources (2026-10-23).

NotebookLM (consumer / Workspace) has no public API (references/drive-second-brain-notes.md), and the Drive rule
(integrations/google-drive-brain.md §Rules 1) says nothing writes to Drive. So the bridge is a *pack*: `bin/brain export
notebooklm` writes ≤ 20 markdown files under exports/notebooklm/ that Steven drags into a notebook as sources
(NotebookLM: 50 sources free, 300 on Plus; 500k words each). Rerun after the brain changes; re-upload the changed files.

Never exported: wiki/clients/** (CLAUDE.md HALT: client PII never leaves the Mac), brain/state, docs/reports, the deck
HTML, anything under integrations other than README/CONNECTIONS/WORKFLOWS pages. Phone numbers and e-mail addresses
are masked except the allow-listed business lines. Stdlib only.
"""
from __future__ import annotations

import re
from datetime import date
from pathlib import Path

from . import graph, indexer

LIMIT_CHARS = 350_000  # well under NotebookLM's 500k-word source cap; split beyond this
ALLOW = {"vanessa-shearrill@inkboxmail.com", "licensing@crmls.org", "+1 650 484 9720", "(202) 474-5223", "650 484 9720", "202) 474-5223"}
PHONE_RE = re.compile(r"(?<!\d)(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}(?!\d)")
EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
EXCLUDE_PREFIX = ("wiki/clients/", "brain/", "docs/reports/", "dashboard/", ".claude/")
# operational logs, not knowledge: repair diaries and the rolling needs-Steven ledger (each 35-60k chars)
EXCLUDE_FILES = {"docs/NEEDS-STEVEN.md", "routines/mac-task-repairs.md", "routines/cloud-routine-repairs.md",
                 "docs/inventory/mac-task-descriptions.md"}

# (file name, title, predicate on repo path) — order is the reading order in NotebookLM
BUNDLES: list[tuple[str, str]] = [
    ("01-router-and-index", "Router (CLAUDE.md) and the index of every page"),
    ("02-who-and-decisions", "Who Steven is, standing decisions, remembered facts"),
    ("03-projects", "Projects and their status"),
    ("04-wiki-ai-team", "AI team: org chart, seats, pods, toolkit, push-button system"),
    ("05-wiki-mortgage-programs", "Mortgage programs and guidelines (prep only, never a quote)"),
    ("06-wiki-real-estate-playbooks", "Real-estate playbooks"),
    ("07-wiki-dashboard-ops", "Dashboard operations: panels, DB docs, Mac tasks, routines"),
    ("08-wiki-events-networking", "Events and networking"),
    ("09-references", "Source documents and external systems"),
    ("10-always-on-and-automation", "What runs when: schedule, automation map, routine budget, Steven's steps"),
    ("12-integrations", "Integrations: connections register, Pabbly workflows, per-integration READMEs"),
]


def bundle_of(path: str) -> str | None:
    if path.startswith(EXCLUDE_PREFIX) or "/clients/" in path or path in EXCLUDE_FILES:
        return None
    if path in ("CLAUDE.md", "INDEX.md", "README.md", "AGENTS.md", "REMOTE-ACCESS.md", "OPTIMIZATION.md", "recall-cache.md",
                "knowledge-graph/README.md", "knowledge-graph/schema.md", "vector-index/README.md"):
        return "01-router-and-index"
    if path.startswith("context/") or path.startswith("memory/") or path == "memory.md":
        return "02-who-and-decisions"
    if path.startswith("projects/"):
        return "03-projects"
    if path.startswith("wiki/ai-team/"):
        return "04-wiki-ai-team"
    if path.startswith("wiki/mortgage-programs/"):
        return "05-wiki-mortgage-programs"
    if path.startswith("wiki/real-estate-playbooks/"):
        return "06-wiki-real-estate-playbooks"
    if path.startswith("wiki/dashboard-ops/"):
        return "07-wiki-dashboard-ops"
    if path.startswith("wiki/events-networking/") or path == "wiki/index.md":
        return "08-wiki-events-networking"
    if path.startswith("references/"):
        return "09-references"
    if path.startswith("always-on/") or path.startswith("routines/") or path.startswith("docs/AUTOMATION-MAP") \
            or path.startswith("docs/ROUTINE-BUDGET") or path in ("docs/STEVEN-STEPS.md", "docs/SECOND-MAC-SETUP.md", "docs/NEEDS-STEVEN.md") \
            or path.startswith("docs/inventory/"):
        return "10-always-on-and-automation"
    if path.startswith("integrations/") and (path.endswith("/README.md") or path in ("integrations/CONNECTIONS.md",)
                                             or path.endswith("WORKFLOWS.md")):
        return "12-integrations"  # mac-task-specs.md (task prompts, ~200k chars) stays out: operational, not knowledge
    return None


def mask(text: str) -> tuple[str, int]:
    """Mask phone numbers and e-mails not on the allow-list. Returns (text, masked count)."""
    n = 0

    def _phone(m: re.Match) -> str:
        nonlocal n
        s = m.group(0)
        if any(a in s or s in a for a in ALLOW):
            return s
        n += 1
        return "[phone masked]"

    def _mail(m: re.Match) -> str:
        nonlocal n
        s = m.group(0)
        if s.lower() in ALLOW:
            return s
        n += 1
        return "[e-mail masked]"

    text = EMAIL_RE.sub(_mail, text)
    text = PHONE_RE.sub(_phone, text)
    return text, n


def brain_map(root: Path, today: date) -> str:
    """The 6D Brain as text: every node by lobe, with its description and strongest links."""
    g = graph.build(root, today=today)
    by_group: dict[str, list[dict]] = {}
    for n in g["nodes"]:
        by_group.setdefault(n["gl"], []).append(n)
    strongest: dict[str, list[tuple[float, str]]] = {}
    for l in g["links"]:
        strongest.setdefault(l["s"], []).append((l["w"], l["t"]))
        strongest.setdefault(l["t"], []).append((l["w"], l["s"]))
    out = [f"# 6D Brain map — {len(g['nodes'])} nodes, {len(g['links'])} links, generated {g['generated']}",
           "", "Each lobe below is a region of the 6D Brain (https://claude.ai/artifact/VoWHW4YuKUCyNqGZMikEv8). A node is a page,",
           "a store, a tool, a routine or a pod; 'links' are the three strongest keyword or structural connections.", ""]
    for gl in sorted(by_group, key=lambda s: (s != "Live stores", s)):
        nodes = sorted(by_group[gl], key=lambda n: n["t"].lower())
        out.append(f"## {gl} ({len(nodes)})"); out.append("")
        for n in nodes:
            links = sorted(strongest.get(n["id"], []), reverse=True)[:3]
            ltxt = "; ".join(t for _, t in links)
            seat = f" · seat: {n['seat']}" if n.get("seat") else ""
            span = f" · dated {n['a']} → {n['z']}" if n.get("a") else ""
            out.append(f"- **{n['t']}** (`{n['id']}`){seat}{span}: {n['d'] or '—'}" + (f" · links: {ltxt}" if ltxt else ""))
        out.append("")
    return "\n".join(out)


def export(root: Path, out_dir: Path | None = None, today: date | None = None) -> dict:
    today = today or date.today()
    out_dir = out_dir or (root / "exports" / "notebooklm")
    out_dir.mkdir(parents=True, exist_ok=True)
    for old in out_dir.glob("*.md"):
        old.unlink()
    ix = indexer.load(root)
    files = sorted(ix["files"], key=lambda f: f["path"])
    parts: dict[str, list[str]] = {b: [] for b, _ in BUNDLES}
    included, skipped, masked = [], [], 0
    for f in files:
        p = f["path"]
        b = bundle_of(p)
        if b is None:
            skipped.append(p)
            continue
        try:
            text = (root / p).read_text(encoding="utf-8")
        except OSError:
            skipped.append(p)
            continue
        text, n = mask(text)
        masked += n
        included.append(p)
        parts[b].append(f"\n\n---\n\n<!-- source file: {p} -->\n# FILE: {p}\n\n{text.strip()}\n")
    titles = dict(BUNDLES)
    written: list[dict] = []
    for b, _ in BUNDLES:
        body = "".join(parts[b])
        if not body.strip():
            continue
        head = f"# {titles[b]}\n\nSecond Brain export for NotebookLM · as of {today.isoformat()} · bundle `{b}`.\n" \
               f"Every section below begins with `# FILE: <path>` naming the page in the repo (chitown034/Repo, branch claude/stoic-cori-pvn3f8).\n" \
               f"Client pages are never exported; phone numbers and e-mails are masked. Facts carry the page's own dates, not today's.\n"
        chunks = _split(head, body)
        for i, chunk in enumerate(chunks):
            name = f"{b}.md" if len(chunks) == 1 else f"{b}-part{i + 1}.md"
            (out_dir / name).write_text(chunk, encoding="utf-8")
            written.append({"file": name, "chars": len(chunk)})
    bm = brain_map(root, today)
    (out_dir / "11-6d-brain-map.md").write_text(bm, encoding="utf-8")
    written.append({"file": "11-6d-brain-map.md", "chars": len(bm)})
    written.sort(key=lambda w: w["file"])
    readme = _readme(today, written, included, skipped, masked)
    (out_dir / "00-START-HERE.md").write_text(readme, encoding="utf-8")
    written.insert(0, {"file": "00-START-HERE.md", "chars": len(readme)})
    return {"out": str(out_dir), "files": written, "included": len(included), "skipped": len(skipped), "masked": masked}


def _split(head: str, body: str) -> list[str]:
    if len(head) + len(body) <= LIMIT_CHARS:
        return [head + body]
    chunks, cur = [], head
    for piece in body.split("\n\n---\n\n"):
        piece = "\n\n---\n\n" + piece if piece else piece
        if len(cur) + len(piece) > LIMIT_CHARS and cur != head:
            chunks.append(cur)
            cur = head + " (continued)\n" + piece
        else:
            cur += piece
    chunks.append(cur)
    return chunks


def _readme(today: date, written: list[dict], included: list[str], skipped: list[str], masked: int) -> str:
    lines = [f"# Second Brain → NotebookLM — start here (as of {today.isoformat()})", "",
             "This folder is the Second Brain of Steven Shearrill (Broker Associate, LPT Realty · MLO, Patriot Pacific Financial, NMLS 1921615)",
             "exported as NotebookLM sources. Upload every `.md` file in this folder to ONE notebook. Ask the notebook as you would ask Vanessa.",
             "", "## Rules the notebook must keep",
             "- Never a rate quote, an eligibility call or a client send: those are licensed decisions Steven makes (CLAUDE.md HALT list).",
             "- State the age of every fact as the page's own date, never today's.",
             "- If the answer is not in these sources, say 'not in the brain' instead of guessing.",
             "- No client pages are here (first names only elsewhere); phone numbers and e-mails are masked except Vanessa's business lines.",
             "", "## Files", "", "| File | Size |", "|---|---|"]
    lines += [f"| {w['file']} | {w['chars'] // 1000} k chars |" for w in written]
    lines += ["", f"Pages included: {len(included)} · left out on purpose: {len(skipped)} · phone/e-mail masks applied: {masked}.",
              "", "## Left out (by rule)", ""] + [f"- {p}" for p in skipped[:80]]
    if len(skipped) > 80:
        lines.append(f"- … and {len(skipped) - 80} more")
    lines += ["", "## Refresh", "", "On the Mac: `bin/brain export notebooklm` (or `bash scripts/notebooklm-export.sh`, which also opens the folder).",
              "Then in NotebookLM delete the changed source and upload the new file. The 6D Brain map (11-6d-brain-map.md) is",
              "regenerated every time from the live index."]
    return "\n".join(lines) + "\n"


def format_summary(r: dict) -> str:
    lines = [f"NotebookLM source pack -> {r['out']}: {len(r['files'])} files, {r['included']} pages in, {r['skipped']} left out, {r['masked']} masks"]
    lines += [f"  {w['file']:<40} {w['chars'] // 1000:>5} k chars" for w in r["files"]]
    return "\n".join(lines)
