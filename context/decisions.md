# Decisions log

Append-only. One line per decision: date, the call, why, link to the Second Brain row. Newest at the bottom. Open items at the end.

- 2026-09-12 — The Second Brain is a personal operating system, not a knowledge vault: six layers (inputs → Vanessa intake and triage → Notion Mission Control → specialist agent council → human/system execution → learning and governance). Notion is not the source of truth for everything. https://app.notion.com/p/3d9c1760a7498129afc1d24be2b0713b
- 2026-09-13 — One recall verb (`run.sh recall`) reads the Second Brain, the Obsidian vault, Jarvis, Graphify and Ruflo; client and deal folders are counted, never named; fan-out bounded by `roster-tiers.json`. https://app.notion.com/p/3dbc1760a74981b49861f68aad5051de
- 2026-09-14 — Dispatch rule lives in one place (vanessa-orchestrator, Dispatch (standing)): mastermind, do not labour; recall before you decompose; every package to a sub agent on its own model; interview when ambiguous; prompt-optimizer pass on every brief. Agent file cut 44% to 22.2 KB. https://app.notion.com/p/3dcc1760a749817c9f67ca2fdb5e0e5e
- 2026-09-14 — Model policy: Vanessa alone on Fable 5.1; research and judgement seats Opus 5; everyone else Sonnet 5; research on Perplexity. Enforced by `lint_agents.py --models`. https://app.notion.com/p/3dcc1760a7498103b5cdf9d01dbcae55
- 2026-09-15 — iMessage: Sonnet answers simple texts, an Opus specialist takes expertise questions, Vanessa on Fable takes the hardest; Discord stays on Sonnet. Same row as above.
- 2026-09-22 — Steven accepted the 22.2 KB agent file; approved merging `skills-refresh-weekly` into the live Mac schedule (merge itself still pending Mac-side); confirmed prompt-master means the existing prompt-optimizer pass. Recorded on the 09-14 dispatch row.
- 2026-09-22 — The pasted five-level second-brain framework (router → wikis → vector search → knowledge graphs → autonomous brain) already has a running counterpart at every level; not new build work. https://app.notion.com/p/3e3c1760a74981059ea6ec4d2b61aad5
- 2026-09-22 — Ruflo CVE-2026-59726 (CVSS 10.0, fixed in 3.16.3; AgentDB poisoning does not self-heal) logged as a security watch item. https://app.notion.com/p/3e3c1760a74981f69109c89144557dd3
- 2026-09-22 — Orca is Stably AI's Orca (stablyai/orca), installed on this repo's default branch via a SessionStart hook (PR #1). Not a memory store; it runs parallel coding agents in isolated git worktrees.
- 2026-09-22 — This repo is the Level 1–2 router foundation for remote Claude Code sessions: `CLAUDE.md`/`AGENTS.md` route to the Second Brain in Notion; `interview-me`, `prompt-optimizer` and `skills-refresh` installed as project skills; a weekly report-only skills-refresh Routine covers the account's reachable skills.

## Open
- Ruflo: confirm the Mac's version is 3.16.3 or later and audit `vanessa-ops-graph` for patterns nobody recognizes. Mac-side.
- Jarvis full-context rule: "read the source whole for anything needing full context" is a standing rule in `CLAUDE.md` here; still to be added to the Mac's vanessa-orchestrator recall guidance.
- `skills-refresh-weekly`: approved; the schedule merge happens on the Mac (claude-runner).
- Who owns renaming the 73 misnamed bulk-installed skills: default is whoever owns `skills-refresh-weekly`, unless Steven names someone else.
- Router on the default branch: this router lives on `claude/admiring-planck-u1qu64`; it auto-loads for every session only once merged into the default branch (`claude/install-codex-plugin-o2qdmp`).
