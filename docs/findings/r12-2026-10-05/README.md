# R12 — stale, broken, not connected (2026-10-05)

Steven: *"look for everything thoriughout the dashboard that is stale, not working , not connected and have
engineers fix them"*, and *"ensure everything is working and connected to include: Orca … Notes / knowledge
graph …"* (`ORCA-request.md`).

| Lane | Scope | Output | Where it landed |
|---|---|---|---|
| E1 | Deck panels, lines 1494–3619 | 57 replacements (rates, Econoday, Bears, capital-at-risk exceptions) | Command Deck v172 |
| E2 | Deck panels, lines 3620–5911 | 59 replacements (Master Plan, loyalty offers, tax facts, Apple Health tiles, health-log junk rows) | Command Deck v172 |
| E3 | Chrome and panels 5912–6878 | 58 replacements (bell alerts, NMLS date, Next Big Moves, stored-text repairs) | Command Deck v172 |
| E4 | Every status claim, Orca, graph; ISA spot-check | 129 deck + 2 ISA replacements | Command Deck v172, ISA Portal v40 |
| E5 | The Mac | `integrations/mac-fix-all-2026-10-05.md` | Steven pastes it on the Mac |
| E6 | Routines | `routines/fixes-2026-10-05/` (backup, both watchdogs; Steven's routine list; re-run plan) | Applied 19:08–19:09 UTC; backup GREEN 19:12 UTC |

The integrator added 7 deck edits (the backup owner is the cloud routine, the ISA-ladder label, the build
stamp), extended the cloud market-close writer to refresh `marketSnapshot`, corrected five docs that said
`./mac-verify.sh` checks Orca (it has no Orca check), and aligned the docs and the Mac paste-in with the Mac's
own 2026-10-05 toolkit snapshot. Gates: `quickcheck.py` same as baseline, runtime harness on the 182 real
documents 0 exceptions, real-browser run 42 known issues before and after (no new ones).
Steven's actions: `docs/NEEDS-STEVEN.md` items 86–95. `FACTS.md` is the measured ground truth the engineers
worked from (18:05–18:20 UTC).
