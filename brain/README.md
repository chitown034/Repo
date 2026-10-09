# brain — deterministic recall for the second brain

Plain Python 3.10+, standard library only, no model calls. Run from any directory: `bin/brain <command>`
(after `scripts/brain-sync.sh`, just `brain <command>`).

## Commands

| Command | What it does |
|---|---|
| `brain recall "<question>" [--json] [--top N]` | The retrieval ladder below. Prints the evidence with `file § section`, bytes read, estimated tokens and time. `--top N` also lists the N best-scoring candidates. |
| `brain remember "<fact>" [--topic X] [--source S]` | Appends one dated line to `memory.md` (or `memory/X.md`) and refreshes `INDEX.md` + `brain/index.json` in the same step. Refuses API keys, tokens, SSNs, card and account numbers, passwords, and third-party contact details. |
| `brain reindex` | Rebuilds `INDEX.md` and `brain/index.json` from the tree. |
| `brain doctor` | Exits non-zero if the index is stale, a path `CLAUDE.md` routes to is missing, or an `INDEX.md` line points at a missing file. |
| `brain bench [--write]` | Runs `brain/bench/questions.json` three ways and compares tokens, time and correctness; `--write` writes `docs/reports/BRAIN-BENCH.md`. |
| `brain gaps` | What was asked and not answered, most-asked first, with the nearest files (from the local keyword-only recall log; `BRAIN_NOLOG=1` turns the log off). |
| `brain orgcheck` | Does every seat in `wiki/ai-team/org-chart.md` resolve to a brain page; is Jarvis verified, stale or failing. Exits non-zero on a miss. |
| `brain pack "<q>" [--budget N]` | Best section from several files under a token budget, as one paste for any platform. |
| `brain route "<request>" [--json]` | The AI team's dispatch plan from the org chart: lead seat, seats that join, parallel waves (≤8, ≤4 web research), gates (Alexandra, ECC, Vanessa last), HALTs, and the brain section each seat starts from. Rules: `wiki/ai-team/cross-functional.md`. |
| `brain loop` | reindex → doctor → bench → gaps → orgcheck → routing self-test (`brain/bench/routes.json`) → pages no gold question tests → `docs/reports/BRAIN-LOOP.md`, compared with the last run in `brain/loop-history.jsonl`; exit 1 on a regression. |
| `brain mcp` | The brain as a stdio MCP server (`brain_recall`, `brain_pack`, `brain_gaps`, `brain_stale`, `brain_related`, `brain_route`, `brain_remember`) for Claude Code, Claude Desktop, Codex, Cursor. Registering it in a client is Steven's approval, never automatic. |

## The ladder (`recall`)

1. Strip the question to keywords (stopwords dropped, a short synonym map in `synonyms.py`).
2. Score every indexed file from `brain/index.json` alone: BM25 over stored per-section term counts,
   path/title/heading/description boosts, the `CLAUDE.md` routing table, an authority prior, and the
   optional Laya hint. No file is opened to rank it.
3. Open the top file. If runners-up score within 15% of it, the code also opens them (at most three)
   and keeps the file whose best section is strongest. That is a disk read; the model still gets one section.
4. Split by headings and keep the best section (a bonus when one line or sentence holds the question's
   terms together; ≤ 60 lines, ≤ ~3.5k chars, longer sections trimmed to their best window).
5. Follow at most one pointer: a repo path the section defers to, or "item N" of the same file.
6. Return the evidence. If nothing clears the bar: `file: null`, "not in the brain" — never a guess.

## JSON contract (`recall --json`)

`{"query", "keywords", "file", "section", "pointer_followed", "pointer_file", "evidence",
"bytes_read", "est_tokens", "candidates_scored", "ms", "confidence"}` — `est_tokens` is chars ÷ 4.

## Optional Laya hint

`export BRAIN_ROUTER=laya` makes step 2 ask `integrations/laya/laya_route.py` for a path prefix and boost
files under it. Any failure or a wait over 2 s is ignored; retrieval never depends on it.

## Tests and benchmark

```bash
python3 -m unittest discover -s brain/tests   # runs against a temp copy, never the real repo
bin/brain bench --write
```

Current result: `docs/reports/BRAIN-BENCH.md`.
