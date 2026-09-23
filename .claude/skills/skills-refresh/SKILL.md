---
name: skills-refresh
description: "Weekly audit of every installed skill against the Command Deck's AI Team toolkit table: frontmatter that will not load, dead paths, duplicates, and skills the dashboard advertises but the machine does not have. Reports only — never installs, prunes or edits a skill. Use for the Sunday skills audit or when Steven asks whether a skill the deck shows is actually installed."
---

# skills-refresh — installed skills vs. what the deck claims

Seat: report seat — run on **Claude Sonnet 5**. Findings that need a judgment call are handed up to
the Capability Engineer (Opus 5); Vanessa (Claude Fable 5.1) chairs the cycle that consumes them.

## Trigger
- Mac task `skills-refresh-weekly`, cron `0 7 * * 0` = **Sunday 7:00 AM PT**. Status as of
  2026-09-22: enabled, **never run** — do not describe its findings as current until it has run once.
- On demand when Steven asks "is <skill> actually installed?" or before a loop cycle promotes a skill.

## Inputs
- On the Mac: every `SKILL.md` under the skill roots — user skills (`~/.claude/skills/`), synced
  skills, plugin skills, and any skill referenced by a scheduled task's prompt.
- `toolkitSnapshot` doc (written by `toolkit-deck-sync`, cron `15 6 * * *`, status **limited**, last
  end 2026-09-16): `v.counts` (`skills`, `agents`, `tasks`, `tools`, `mcpServers`, `mcpConnected`)
  and `v.skills[]`. Note the export carries **400 names against a count of 1,400** — absence from
  `v.skills[]` is not proof a skill is missing; confirm on disk before calling anything missing.
- The deck's AI Team toolkit table (`AI_TEAM_TOOLBOX` rows) — what the dashboard advertises.
- `runnerStatus` / the task list — which tasks name which skill.

## Data access
`Artifact` tool against `https://claude.ai/code/artifact/1624daae-d683-405a-971d-c5828dce0f8d`:
`read_db`, `db_op:"get"`, `collection:"state"`, `doc_id`; `write_db`, `db_op:"set"` (not `update`),
`data:{v:<whole doc>}`. Read before write; append, never clobber. **Every doc is `{v:<value>}` — no exceptions:** send
`data:{v:<whole doc>}`, never the bare value. A top level that is not a single `v` key is a bug to
fix, not a shape to copy. From a cloud routine the write now succeeds (proven 2026-09-22), but an
agent-created routine carries no connectors — so report in the run output and leave the write to the
Mac.

## Procedure
1. **Enumerate** every `SKILL.md` on disk with its root, path, mtime and size. Count them. This
   on-disk count, not `toolkitSnapshot.counts.skills`, is the number you report.
2. **Validate frontmatter** per file: delimiters present and closed; `name` present, lowercase,
   hyphenated, matching its directory name; `description` present, non-empty, ≤1024 characters and
   written as *when to use this*; no tabs; YAML parses. Any failure = `frontmatterOk:false` with the
   exact reason — a skill whose frontmatter will not parse does not load at all.
3. **Dead paths**: every relative path a skill references (`references/`, `scripts/`, assets, other
   skills) must exist. Record each miss as `deadPath` with the referencing line number.
4. **Duplicates and drift**: same `name` in two roots; directory name ≠ frontmatter `name`; two
   skills describing the same trigger. Record, do not resolve.
5. **Deck cross-check**, both directions:
   - advertised-but-absent — a row in the AI Team toolkit table with no `SKILL.md` on disk;
   - installed-but-unlisted — a skill on disk that the table never mentions;
   - task-orphan — a scheduled task whose prompt names a skill that is not installed.
6. **Known gaps to confirm, not assume** (brief §2, 2026-09-22): present — `continuous-process-improvement`,
   `automation-audit`, `automation-audit-ops`, `ai-ecosystem-backup`, `deck-backup`, `fub-followups`
   (a legacy client-follow-up template library whose merge/send fields target the previous CRM —
   flag it as *needs porting to Lofty*, not as healthy; match it on disk by that exact folder name,
   which Steven has not renamed). Not present in the snapshot — `interview-me`, `prompt-master`,
   `vanessa-orchestrator`, `loop-engineering`, `scale-growth-engine`. `skills-refresh` exists as the
   Sunday **task**, and as this repo skill; check whether the repo skills have been installed on the
   Mac yet before reporting them as live.
7. **Report.** Write `skillsAudit`, print the summary, and open a Needs-Steven packet only for
   advertised-but-absent rows (the dashboard is claiming a capability that does not exist).

## Outputs (exact shapes)
`skillsAudit` (new doc — the dashboard's skills card reads `v.counts` and `v.drift`):
```json
{"v":{"ranAt":"<ISO>","source":"skills-refresh on <host>","onDiskCount":0,
 "counts":{"valid":0,"invalidFrontmatter":0,"deadPaths":0,"duplicates":0,
           "advertisedNotInstalled":0,"installedNotListed":0,"taskOrphans":0},
 "rows":[{"name":"","path":"","root":"user|synced|plugin","frontmatterOk":true,
          "issues":[],"inDeckTable":true,"usedByTasks":[],"status":"ok|invalid|dead-path|duplicate"}],
 "drift":[{"kind":"advertisedNotInstalled|installedNotListed|taskOrphan|nameMismatch",
           "name":"","detail":"","priority":"P1|P2|P3"}]}}
```
Findings for the loop cycle use the standard finding row (`category:"Skill"`,
`status:"New|Broken|Missing|Recommended|Stale"`, `owner:"Capability Engineer"`).

## Guardrails
- **Report only.** Never install, update, move, rename, prune or edit a skill, and never run
  `/plugin install`. A recommendation is the deliverable.
- Never delete anything. The standing loop halt "skill prune — destructive" applies to this skill.
- Never read a skill's contents beyond frontmatter, referenced paths and headings — no bulk copying
  of skill bodies into the deck or the report.
- Never report a skill as missing on the strength of `toolkitSnapshot.skills[]` alone (400 of 1,400).
- No secrets: if a skill embeds a key or token, record `issues:["secret-in-file"]` with the path and
  line number only — never the value — and raise it to Elena (CISO) as P1.
- Counts in the report are what you counted this run; do not carry forward last week's numbers.

## HALT conditions
Escalate **"anything irreversible, outside scope, needing credentials/permissions/money, or a human
decision."** Here that means halt and write a packet when:
- the audit implies removing or replacing a skill (destructive — Steven's call);
- a skill contains a plaintext credential (P1, Elena);
- the deck advertises a capability that does not exist on disk (the dashboard is making a false
  claim until Steven installs it or the copy is corrected);
- the skill roots cannot be read (permissions) — report "could not audit", never an empty pass.

Packet: append to `twinQueue` — `{id:"tw_<epoch-ms>", ts:<ISO>, from:"vanessa",
priority:"p1"|"p2", status:"needs-steven", task:"<one line>", note:"<what, where, recommendation>"}`.

## Logging
- `skillsAudit` — one full document per run (replaced each run; it is a snapshot, not a log).
- `ciLog` — append `{date:"<YYYY-MM-DD>", text:"skills-refresh: <n> skills audited, <n> invalid,
  <n> advertised-but-absent"}` only when drift was found, so the deck's change log stays meaningful.
- Needs-Steven packets → `twinQueue` as above.

## Self-test (`selftest:skills-refresh`, nightly suite, Functional)
Offline, ≤30 s, no network, no sub-agents (the nightly suite already fails on timeout, exit 124,
last error 2026-09-15).
1. Frontmatter validator against four fixtures: valid; missing `description`; unclosed `---`; `name`
   not matching the directory. Expect Pass, Fail, Fail, Fail — any other result is a Fail.
2. Dead-path detector on a fixture skill referencing `references/missing.md`; expect one `deadPath`.
3. Self-audit: run the validator over this file; `name: skills-refresh` must match its directory.
4. Output shape: build a `skillsAudit` document in memory and assert every key above exists and
   `counts` are integers. Do not write it to the deck.
Report `{id:"selftest:skills-refresh", category:"Functional", result, detail}` into `selfTest`.
