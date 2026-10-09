# E5 — life (health, career, rewards, ventures, travel, marketing)
Branch `e5-life` · worktree `scratchpad/wt-e5-life/command-deck.html`
Baseline 2026-09-12 · verified 2026-09-22 · Loop Cycle 6

Panels owned: panel-work, panel-kevin, panel-wellness, panel-mind, panel-loyalty, panel-nonprofit,
panel-pedefense, panel-eliteaffluent, panel-nextmoves, panel-travel, panel-marketing, panel-dreamempire.

---

## 1. The stravaSnapshot shape bug — confirmed, and what was done about it

**Confirmed.** `scratchpad/db/state/stravaSnapshot.json` has top-level keys `activities` / `syncedAt` /
`via` and no `{v: …}` wrapper. `applyRemoteSnapshot()` (deck line ~6867) drops it:

```js
var data = change.doc.data();
if (!data || typeof data !== "object" || !("v" in data)) return;
```

That is the **only** ingest path — `initSync()` → `dbApi.collection(DB_COLLECTION).onSnapshot()` →
`applyRemoteSnapshot()` — so the Strava document could never reach `localStorage`, `lsGet("stravaSnapshot")`
always returned `null`, and the card always rendered the baked-in 2026-09-07 seed. A Strava sync has been
invisible to this page for as long as the document has had that shape.

**Fixed at the reader, not the engine** (per instruction). New `stravaDoc()` accepts *both* shapes and is
used at all three Strava read sites: `renderStravaActivity()`, the `LIVE_FEED_ISO["Strava activity"]` stamp,
and Kevin's live-dashboard context line. Smoke-tested end-to-end under a Node DOM shim against: no document,
unwrapped, wrapped, `null`, `[]`, `{}`, `"string"`, `activities:"nope"`, and an activities array containing
`null` and a number — **no throw in any case**, and the correct row count in each.

**The writer is still wrong** — escalated as **F-E5-02 (halt)**. The Sep 20 write came from a Claude Code
session (`via`: "claude-code-session (Strava connector, direct read)"), i.e. a `write_db set … file_path`
handing over a raw JSON body. Fix at the writer (`{v:{…}}`, one line, no engine risk), or relax the engine.
Every other task that writes a doc from a file should be audited for the same mistake.

## 2. Seeds re-baked (rule 5.4)

| Seed | Was | Now | Source |
|---|---|---|---|
| `STRAVA_SYNC_AT` + `STRAVA_RECENT_ACTIVITIES` | 2026-09-07, 2 rows | **2026-09-20, 3 rows** | `stravaSnapshot` (syncedAt 2026-09-20T21:03:00Z) |
| `MARKETING_SYNCED_AT` | 2026-09-07 "entered by hand … unverified" | **2026-09-21**, verified | live cloud-routine listing (pulled 2026-09-22 08:09 UTC) |

**Not re-baked, and why.** `ELIT_SCAN` / `PEDEFENSE` / `ELITE_AFFLUENT` / `OPP_RADAR` curated arrays: the
2026-09-22 `liveFeeds` entries are prose summaries plus citations, a different shape from the curated rows,
and already render separately through `orPaintFeed()` with their own stamps. Rewriting a curated table from a
feed summary would be inventing data. Their *notes* were corrected instead (curated vs live, with each
routine's real name and last-success time). `uscDeadlines` and `grantPipeline` seeds are byte-identical to
their live documents — verified, nothing to do. `TRAVEL_*`: the weekly routine succeeds but writes no
document, so the 2026-09-03 seed stands and now says so.

## 3. Bugs found and fixed beyond the assignment

- **Marketing queue rendered a real drafted post as "—"** (F-E5-14). `r14-content-pipeline` writes
  `{topic, body, channel, variants, complianceNotes, status:"awaiting Steven", ts}`; the renderer only knew
  `{text, status}`. The one live item — a finished VA-myths post with a completed compliance review — showed
  as an em dash with a dropdown silently reading "Idea". Now renders the real title, status, channel and
  draft date, with the copy and Alexandra's verdict one click away.
- **Strava chart plotted time and calories as miles** (F-E5-05). It read column 3 (moving time / kcal) as
  distance; distance is column 2. The axis read "494.0 mi" for weight-training sessions. Fixed, with an
  honest message when no row carries a distance.
- **Strava table header had one column more than the document contract** (F-E5-06) — every live row
  displayed one column to the left of its heading.
- **`STRAVA_LAST_30D_COUNT` was hard-coded** at 2; truth on 2026-09-22 is 3. Now derived from the rows.
- **Two green badges on stale data** (F-E5-09, F-E5-21): the Apple Health export badge was green on a
  nine-day-old export; the Elite rewards badge was green "Synced 2026-09-07" on a fifteen-day-old scan of
  offers and deadlines. Both now age-coloured, with the age printed.

## 4. Honest-status corrections

Apple Health card (daemon down, last real ingest 2026-09-13, r8 runs and writes nothing, plus the
Notion replacement route labelled "spec written, first phone run pending"); Strava card ("refreshes twice
daily" → the failing task and the research-only routine); Next Big Moves COA stamp (weekly review FAILED
2026-09-20); the "15 recurring cloud routines … not aspirational" claim (→ 50 exist / 46 enabled, the daily
cadence holding, ten failures Sep 18–20 and two abandonments named, plus the permission-prompt constraint);
PE & Defense and Opportunity Radar "no standing routine" (false — corrected, curated vs live); Elite Affluent
(its weekly routine failed); Travel; USC (R19 succeeds but writes no deadline document); the Steve-twin
"working today" claim (refused vault write, disabled cloud routine).

## 5. Verified, no change needed

- **Travel passed-event logic** — extracted and run under Node against the real seed strings: `Sep 19, 2026,
  8:00 PM` → passed, `Sep 18-20, 2026` → passed (resolves to the range **end**), `Sep 15-30, 2026` →
  upcoming, `Sep 2026` → upcoming (month-end), `Year-round`/`Ongoing` → evergreen. `showPassed` defaults
  false, so the nine Sep 18/19 events are auto-hidden and counted. Correct.
- **USC deadlines** — seed matches the live doc exactly; Week 4 Sep 23/27 and the Oct 19 final render
  past-due/days-left dynamically.
- **Nonprofit grant pipeline** and **panel-loyalty incentives** — both genuinely live (`incentivePrograms`
  updatedAt 2026-09-22T02:22:43Z, 66 programs, badge derived from the doc).
- **You.com sweep of all E5 regions** — zero call sites, zero credits, no button that silently fails.

## 6. Needs Steven (4 halts)

1. **F-E5-02** — correct the Strava writer to `{v:{…}}` (or relax the sync engine). Until then no Strava sync
   reaches the page through the normal path.
2. **F-E5-08** — restart the `apple-health-mcp` ingest daemon on the Mac (port 8765), or abandon it for the
   Notion route. Three downstream tasks read that document.
3. **F-E5-11** — run the Claude-iOS → Notion health loop once to prove it.
4. **F-E5-12** — mentor naming: the deck says **Kevin** (`kevinChat`), the Desktop skill is `cole-mentor`
   (`coleChat`). The card's claim of a `kevin-mentor` skill and "the same shared thread" was false on both
   counts and has been corrected. Kevin is kept on the deck as instructed. Rename the skill, or rename the
   seat, then point both at one document — both threads are empty today, so nothing is lost yet.

## 7. For the integrator

- One E5 edit sits in shared infrastructure: `LIVE_FEED_ISO["Strava activity"]` (≈ line 7613 post-edit),
  three lines below E4a's `"Follow Up Boss import"` entry in the same object literal. Watch that merge.
- Residual Cole naming outside E5 regions: the HTML comment `<!-- PANEL: COLE — HIGH-VALUE MAN MENTOR -->`
  above panel-kevin, and a JS comment listing `apex-trader, kevin-mentor` in the shared chat wiring
  (≈ line 22755 post-edit). Both non-visible; route with F-E5-12's outcome.
- **Source conflict, unresolved (F-E5-15):** `routineHealth` says "2 drafted posts still awaiting Steven's
  review"; the live `marketingQueue` document holds exactly **1**, ts 2026-09-13. The page renders the
  document's own count. Derek to confirm the doc-to-task wiring.
- Not touched, as assigned elsewhere: the licence/membership tracker in panel-mind (E3/E4b), `OUTPUT_WATCH`,
  `FRESH_FEEDERS`, `execSyncRegistry`, `panelStampRegistry`, `PAGE_DEFS`, the footer build stamp.

## 8. Gate

`python3 tests/quickcheck.py` — every line PASS except the known false-positive
"called-but-undefined" line, whose name list is **byte-identical to the 5fbe844 baseline**
(diffed), so no new name was introduced. Inline script extracted and `node --check` clean.
All 17 element ids referenced by changed JS exist exactly once. Diff: **+205 / −54**, one file,
all hunks inside E5 regions.
