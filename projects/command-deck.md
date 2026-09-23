# Project — Command Deck

**What.** Steven's single-file personal/business dashboard, published as a claude.ai artifact.
~4 MB, ~25.6k lines, one HTML file with an inline script and a seed JSON block.

**Status (2026-09-22).** Live. Last build stamp in the footer: 2026-09-15 02:19 PT. Latest CI-log
entry 2026-09-20. This cycle is Loop Cycle 6.

## Where the live data lives

Not in this repo. The deck reads an **artifact database, collection `state`** — **175 documents** at
a read on 2026-09-23 03:10 UTC (the 2026-09-22 08:10 UTC export that most of this cycle's audit was
written against held 161; anything quoting 161 is an artefact of that export, not a current count).
Ask the doc, never the page source, for a current number.

| Question | Doc |
|---|---|
| Weather / news / feeds | `weatherSnapshot`, `newsSnapshot`, `liveFeeds` |
| Calendar (next 7 days) | `calendarSnapshot` |
| Mortgage rates | `ratesSnapshot` |
| Markets, strategies | `marketSnapshot`, `strategySnapshot`, `openTerminalSnapshot` |
| Real-estate CRM leads | `loftyLeads` (exists at v1 and carries an honest *blocked* body — no sync has run, the API key is not installed; never read a lead number off it), `leadTriage`, `leadResponse` |
| Mortgage CRM | `zohoSync` (exists at v1, body is the 403 `NO_PERMISSION` block); `zohoLeads` and `zohoDeals` **do not exist** — the Deals module has never been read |
| Health | `appleHealth` (last real ingest 2026-09-13), `healthAnalysis` |
| Knowledge stores | `knowledgeFabric`, `secondBrain`, `toolkitSnapshot` |
| Automation truth | `runnerStatus`, `routineHealth`, `ciLog`, `backupStatus` |

Every doc is `{"v": ...}` — **no exceptions.** Write `data:{v:<whole doc>}`, never the bare value.
`stravaSnapshot` was written bare (top-level `activities`/`syncedAt`/`via`) until 2026-09-22, when it
was repaired to `{v:{activities,syncedAt,via}}`. Readers still accept both shapes defensively, but a
doc whose top level is not a single `v` key is a **writer bug to fix**, not a shape to reproduce.

## Rules for working on it

- Edit only an assigned region. Locate by element id or marker text, never by line number.
- Never touch the footer build stamp, `var PAGE_DEFS`, `function panelStampRegistry`, the
  `<!-- PANEL: MASTER PLAN -->` marker, or the final `</script>` line.
- A seed array plus its `*_SYNCED_AT` constant is a fallback. Re-bake it from the live doc **only**
  when the doc is newer, keeping the seed's exact structure.
- Validate before commit: the static quickcheck, `node --check` on the extracted inline script, and
  a grep that every element id the JS references exists.

## Known open items (listed 2026-09-22 · re-verified 2026-09-23 03:10 UTC)

- `stravaSnapshot`: the document was repaired to `{v:…}` on 2026-09-22 and **is still wrapped** at
  version 9 (`syncedAt 2026-09-22T13:05:00Z`). The Mac task `strava-daily-sync` (`20 5 * * *` PT)
  still writes it bare and its prompt is on the Mac, so only Steven can fix the cause. A cloud
  routine, *Command Deck — Strava wrapper guard* (`47 12 * * *`, enabled, created 2026-09-22
  23:27 UTC), now stands behind it and repairs a bare write 27 minutes after the task fires; it has
  **never run** — its first firing is 2026-09-23 12:47 UTC.
- `openrouterFeeds` is frozen at 2026-09-13 while its writer `openrouter-feeds-refresh` reports
  `ok` — a silent no-write success, found by the first `feedFreshness` sweep (2026-09-23 00:50 UTC).
  Four documents are stale by that sweep: `appleHealth`, `strategySnapshot`, `openrouterFeeds`,
  `knowledgeGraph`.
- Still broken on the runner at the 2026-09-23 02:10 UTC `runnerStatus`: `nightly-self-test`
  (error), and `r4-quantvue-sync`, `lead-triage-daily`, `feeds-weekly` (refused). 18 weekly/monthly
  slots have still never run.
- The Orca card says "Not installed yet". The stack reports "Orca Computer Use" v1.4.203 (Stably AI)
  installed on the Mac as a standalone computer-use app, with the IDE/worktree integration **not**
  done — but that install has never been verified from anywhere but the Mac (`./mac-verify.sh`).
- **Closed since this list was written:** `r17-trading-day-log` is no longer failing (`ok`,
  last end 2026-09-22); and the old line here — "cloud routines cannot write to the artifact DB
  unattended" — is **disproved**, see `README.md` and `docs/CLOUD-WRITE-ARCHITECTURE.md`.
