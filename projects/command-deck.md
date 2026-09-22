# Project — Command Deck

**What.** Steven's single-file personal/business dashboard, published as a claude.ai artifact.
~4 MB, ~25.6k lines, one HTML file with an inline script and a seed JSON block.

**Status (2026-09-22).** Live. Last build stamp in the footer: 2026-09-15 02:19 PT. Latest CI-log
entry 2026-09-20. This cycle is Loop Cycle 6.

## Where the live data lives

Not in this repo. The deck reads an **artifact database, collection `state`** — 161 documents as of
the 2026-09-22 export. Ask the doc, never the page source, for a current number.

| Question | Doc |
|---|---|
| Weather / news / feeds | `weatherSnapshot`, `newsSnapshot`, `liveFeeds` |
| Calendar (next 7 days) | `calendarSnapshot` |
| Mortgage rates | `ratesSnapshot` |
| Markets, strategies | `marketSnapshot`, `strategySnapshot`, `openTerminalSnapshot` |
| Real-estate CRM leads | `loftyLeads` (new — not yet written), `leadTriage`, `leadResponse` |
| Mortgage CRM | `zohoLeads`, `zohoDeals`, `zohoSync` |
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

## Known open items (2026-09-22)

- `r17-trading-day-log` failing since 2026-09-17 — the deck still claims a daily trading log.
- `stravaSnapshot`: the document was repaired to `{v:…}` on 2026-09-22, but the Mac task
  `strava-daily-sync` (`20 5 * * *` PT) still writes it bare and will undo the repair on its next
  run — the task prompt is on the Mac and only Steven can edit it (P1).
- The Orca card says "Not installed yet". Truth: "Orca Computer Use" v1.4.203 (Stably AI) **is**
  installed on the Mac as a standalone computer-use app; the IDE/worktree integration is **not** done.
- Cloud routines cannot write to the artifact DB unattended — the write parks on a permission prompt.
  Confirmed three times. Cloud routines are therefore research-only by design.
