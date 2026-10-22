# Command Deck — Stress Test Report

**Engineer:** E7 — Stress Test Engineer · **Cycle:** Loop Cycle 6 · 2026-09-22 · **Run:** 2026-09-22T09:46:19.463Z
**Baseline 2026-09-12 · verified 2026-09-22**

| | |
| --- | --- |
| Deck under test | `command-deck.html` |
| sha256 | `bbd64191b5de095812e9a424578be697…` |
| Lines | 27127 |
| Provenance | git master commit 5fbe844 (the published build 2026-09-15 02:19 PT), pinned to tests/baseline-5fbe844.html so every line number in this report stays valid while seven engineers edit their worktrees |
| Harness | `tests/runtime-harness.js` + `tests/dom-shim.js` (pure Node, no npm, no jsdom) · Node v22.22.2 |
| Result | **55 Pass · 7 Degraded · 0 Fail** of 62 tests |

## What these numbers are, and what they are not

The harness executes the deck's inline script under a **DOM shim written in JavaScript**, not in a browser.
It proves, exactly: that the script reaches its last line; which container ids receive `innerHTML`; which
`$()` targets have no element; which renderer throws on which document shape, with the function name and the
line; and the relative cost of each render.

`node harness-selftest.js` proves the harness is doing that job: it rebuilds the 2026-09-03 regression (a
function still called but no longer defined — the exact bug `node --check` and `quickcheck.py` both wave
through), and the harness catches it as `updateHeaderClock is not defined @ html:18204`, with only 195 of
318 containers rendered before the halt. 6 of 6 self-tests pass.

It does **not** prove layout, CSS, real clipboard / speech / canvas behaviour, cross-origin fetches, or the
real artifact `db` capability (`window.claude` is absent unless a test injects it). **Treat every millisecond
below as a relative, worst-case figure, not a browser measurement** — `querySelectorAll` and `innerHTML`
parsing are native in a browser and are plain JavaScript here, so shim-side work inflates them. What the
numbers are good for is comparison: baseline vs. load, and one render against another in the same run.

`Fix Applied` and `Re-test Result` are deliberately empty / Pending: **E7 does not edit the deck.** Nothing in
this table is marked Resolved on the strength of a fix — only on the strength of a test that passed.

## Results

| Capability | Test Type | Result | Weakness Found | Engineer Assigned | Fix Applied | Re-test Result | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Whole page — published seed, no synced docs | Functional | Pass | — | — | — | Pending | Resolved |
| Element wiring — $() targets that do not exist in the document | Regression | Degraded | 6 ids are looked up but never exist: vanessaVoiceToggle, steveVoiceToggle, vanessaMicBtn, steveMicBtn, isaPbTracker, isaPbVip. Every call site is null-guarded so nothing throws — the features simply never wire up (voice toggles, both mic buttons, the ISA power-block tracker + VIP tiles). | Capability Engineer | — | Pending | Escalated |
| Travel panel — 'N showing' count on first paint | Regression | Degraded | renderTravelPage reads $('travelVisibleCount') one line BEFORE renderTravelFilters() creates that span, so the count is empty on the first paint and only fills on a later re-render. | Reliability Engineer | — | Pending | Open |
| Automation health board (routineHealth) | Volume | Pass | — | — | — | Pending | Resolved |
| Task board (kanbanCards) | Volume | Pass | — | — | — | Pending | Resolved |
| ISA direct line (isaLine) | Volume | Degraded | slowest render renderNotifications (final pass) 638 ms · one innerHTML write of 5.11 MB into #isaLineThread — no display cap on this list | Efficiency Engineer | — | Pending | Monitoring |
| Live research feeds (liveFeeds) | Volume | Pass | — | — | — | Pending | Resolved |
| Whole page under all four volume payloads at once | Volume | Degraded | page time 7260 ms vs 979 ms baseline (7.4x); 5.02 MB of documents against the ~5 MB localStorage budget a browser gives one origin (1.00x — at the cap, so the next document written is the one that fails), and nothing on the page measures its own storage footprint | Efficiency Engineer | — | Pending | Monitoring |
| Document `weatherSnapshot` (malformed input) | Edge | Pass | — | — | — | Pending | Resolved |
| Document `liveFeeds` (malformed input) | Edge | Degraded | 1 of 7 malformed shapes (wrong-typed fields) reach a renderer and throw: renderNews @html:22332; renderOrFeeds @html:22332. safeRun catches each one, so the page stays up but those panels render empty with no on-page reason. | Reliability Engineer | — | Pending | Open |
| Document `calendarSnapshot` (malformed input) | Edge | Pass | — | — | — | Pending | Resolved |
| Document `stravaSnapshot` (malformed input) | Edge | Pass | — | — | — | Pending | Resolved |
| Document `strategySnapshot` (malformed input) | Edge | Pass | — | — | — | Pending | Resolved |
| Document `leadTriage` (malformed input) | Edge | Pass | — | — | — | Pending | Resolved |
| Document `loftyLeads` (malformed input) | Edge | Pass | Not an edge failure — all 7 malformed shapes were handled. Separate observation: this document is not in the 161-document export at all, so the deck reads it but no task has ever written it. | Integration Engineer | — | Pending | Escalated |
| Document `zohoSync` (malformed input) | Edge | Pass | Not an edge failure — all 7 malformed shapes were handled. Separate observation: this document is not in the 161-document export at all, so the deck reads it but no task has ever written it. | Integration Engineer | — | Pending | Escalated |
| Document `twinBrief` (malformed input) | Edge | Pass | — | — | — | Pending | Resolved |
| Document `twinLog` (malformed input) | Edge | Pass | — | — | — | Pending | Resolved |
| Document `vanessaBrief` (malformed input) | Edge | Pass | — | — | — | Pending | Resolved |
| Document `vanessaRuns` (malformed input) | Edge | Pass | — | — | — | Pending | Resolved |
| Document `revenueScan` (malformed input) | Edge | Pass | Not an edge failure — all 7 malformed shapes were handled. Separate observation: this document is not in the 161-document export at all, so the deck reads it but no task has ever written it. | Integration Engineer | — | Pending | Escalated |
| Document `improvementProposals` (malformed input) | Edge | Pass | — | — | — | Pending | Resolved |
| Document `loopLog` (malformed input) | Edge | Pass | — | — | — | Pending | Resolved |
| Document `cpiCycles` (malformed input) | Edge | Pass | — | — | — | Pending | Resolved |
| Document `routineHealth` (malformed input) | Edge | Pass | — | — | — | Pending | Resolved |
| Document `backupStatus` (malformed input) | Edge | Pass | — | — | — | Pending | Resolved |
| Document `ratesSnapshot` (malformed input) | Edge | Pass | — | — | — | Pending | Resolved |
| Document `isaScorecard` (malformed input) | Edge | Pass | — | — | — | Pending | Resolved |
| Document `appleHealth` (malformed input) | Edge | Pass | — | — | — | Pending | Resolved |
| Document `healthAnalysis` (malformed input) | Edge | Pass | — | — | — | Pending | Resolved |
| Document `healthCoaching` (malformed input) | Edge | Pass | Not an edge failure — all 7 malformed shapes were handled. Separate observation: this document is not in the 161-document export at all, so the deck reads it but no task has ever written it. | Integration Engineer | — | Pending | Escalated |
| Document `toolkitSnapshot` (malformed input) | Edge | Pass | — | — | — | Pending | Resolved |
| Document `knowledgeFabric` (malformed input) | Edge | Pass | — | — | — | Pending | Resolved |
| Document `aiTeamRoster` (malformed input) | Edge | Pass | — | — | — | Pending | Resolved |
| Document `runnerStatus` (malformed input) | Edge | Pass | — | — | — | Pending | Resolved |
| Document `marketingQueue` (malformed input) | Edge | Pass | — | — | — | Pending | Resolved |
| Document `zohoLeads` (malformed input) | Edge | Pass | Not an edge failure — all 7 malformed shapes were handled. Separate observation: this document is not in the 161-document export at all, so the deck reads it but no task has ever written it. | Integration Engineer | — | Pending | Escalated |
| Document `twinQueue` (malformed input) | Edge | Pass | — | — | — | Pending | Resolved |
| Document `vanessaRecommendations` (malformed input) | Edge | Pass | — | — | — | Pending | Resolved |
| Claude capability handshake (initSync / claudeUse) | FailureInjection | Pass | — | — | — | Pending | Resolved |
| Claude capability handshake — rejected promise | FailureInjection | Pass | — | — | — | Pending | Resolved |
| Local persistence — write path | FailureInjection | Pass | — | — | — | Pending | Resolved |
| Local persistence — read path | FailureInjection | Pass | — | — | — | Pending | Resolved |
| Local persistence — quota exhausted part-way through hydration | FailureInjection | Pass | — | — | — | Pending | Resolved |
| Local persistence — 5 MB browser quota with the real store | FailureInjection | Pass | — | — | — | Pending | Resolved |
| Published seed hydration (hydrateFromSeed) | FailureInjection | Pass | — | — | — | Pending | Resolved |
| Cross-device merge — 200-change burst (applyRemoteSnapshot) [db-connected] | Concurrency | Pass | — | — | — | Pending | Resolved |
| Merge idempotence — identical burst replayed [db-connected] | Concurrency | Pass | — | — | — | Pending | Resolved |
| ISA line conflict merge (isaLineMergeArrays) [db-connected] | Concurrency | Pass | — | Reliability Engineer | — | Pending | Resolved |
| Cross-device merge — 200-change burst (applyRemoteSnapshot) [local-only] | Concurrency | Pass | — | — | — | Pending | Resolved |
| Merge idempotence — identical burst replayed [local-only] | Concurrency | Pass | — | — | — | Pending | Resolved |
| ISA line conflict merge (isaLineMergeArrays) [local-only] | Concurrency | Degraded | 40 ID'd message(s) never reached the document (49 stored vs 90 expected) — NOT the merge's doing: the isaLine branch calls syncKeyToDb, which with no db capability queues a pendingDbWrites entry, and the very next guard (`!dbReady && pendingDbWrites[key]`, html:6881) then discards every later isaLine change in the session · 1 of 2 message(s) WITHOUT an `id` were discarded by the merge — on a two-way channel with a person that is lost correspondence, not a rounding error | Reliability Engineer | — | Pending | Open |
| Restore all 161 exported documents and run the page | BackupRecovery | Degraded | 4 watched documents were never written by their task and therefore cannot be restored: loftyLeads, zohoSync, revenueScan, healthCoaching | Integration Engineer | — | Pending | Escalated |
| OUTPUT_WATCH freshness board after a full restore | BackupRecovery | Pass | — | — | — | Pending | Resolved |
| Backup bundle backup/2026-09-22 (sha256 manifest) | BackupRecovery | Pass | — | — | — | Pending | Resolved |
| Runtime gate — wt-e1-daily/command-deck.html | Regression | Pass | — | — | — | Pending | Resolved |
| Runtime gate — wt-e2-markets/command-deck.html | Regression | Pass | — | — | — | Pending | Resolved |
| Runtime gate — wt-e3-wealth/command-deck.html | Regression | Pass | — | — | — | Pending | Resolved |
| Runtime gate — wt-e4a-crm/command-deck.html | Regression | Pass | — | — | — | Pending | Resolved |
| Runtime gate — wt-e4b-realestate/command-deck.html | Regression | Pass | — | — | — | Pending | Resolved |
| Runtime gate — wt-e5-life/command-deck.html | Regression | Pass | — | — | — | Pending | Resolved |
| Runtime gate — wt-e6-aiteam/command-deck.html | Regression | Pass | — | — | — | Pending | Resolved |

## Weakness dossier — for the Reliability / Efficiency / Capability / Integration Engineers

Line numbers are lines of the pinned baseline (`tests/baseline-5fbe844.html`, identical to
`deck/command-deck.html` at git commit 5fbe844); the inline script starts at line 6937.

**W1 · Element wiring — $() targets that do not exist in the document** — *Regression / Degraded / Capability Engineer*  
6 ids are looked up but never exist: vanessaVoiceToggle, steveVoiceToggle, vanessaMicBtn, steveMicBtn, isaPbTracker, isaPbVip. Every call site is null-guarded so nothing throws — the features simply never wire up (voice toggles, both mic buttons, the ISA power-block tracker + VIP tiles).  
*Evidence:* voice toggles html:23626 · presenceAttachMic('vanessaMicBtn'…) html:23631 · presenceAttachMic('steveMicBtn'…) html:23632 · renderIsaPlaybook trackEl/vipEl html:25039

**W2 · Travel panel — 'N showing' count on first paint** — *Regression / Degraded / Reliability Engineer*  
renderTravelPage reads $('travelVisibleCount') one line BEFORE renderTravelFilters() creates that span, so the count is empty on the first paint and only fills on a later re-render.  
*Evidence:* html:17776 reads the id, html:17778 calls renderTravelFilters() which emits it (html:17719)

**W3 · ISA direct line (isaLine)** — *Volume / Degraded / Efficiency Engineer*  
slowest render renderNotifications (final pass) 638 ms · one innerHTML write of 5.11 MB into #isaLineThread — no display cap on this list  
*Evidence:* payload 2539 KB · page 5426 ms (+4447 ms vs baseline) · 335 containers · largest single innerHTML write 5237 KB into #isaLineThread

**W4 · Whole page under all four volume payloads at once** — *Volume / Degraded / Efficiency Engineer*  
page time 7260 ms vs 979 ms baseline (7.4x); 5.02 MB of documents against the ~5 MB localStorage budget a browser gives one origin (1.00x — at the cap, so the next document written is the one that fails), and nothing on the page measures its own storage footprint  
*Evidence:* slowest: renderNotifications (final pass) 834ms, renderExecBrief (final pass) 386ms, renderNotifications 139ms

**W5 · Document `liveFeeds` (malformed input)** — *Edge / Degraded / Reliability Engineer*  
1 of 7 malformed shapes (wrong-typed fields) reach a renderer and throw: renderNews @html:22332; renderOrFeeds @html:22332. safeRun catches each one, so the page stays up but those panels render empty with no on-page reason.  
*Evidence:* null:guarded []:guarded {}:ok "string":guarded wrong-typed fields:throw row is a number:guarded truncated JSON:guarded

**W6 · Document `loftyLeads` (malformed input)** — *Edge / Pass / Integration Engineer*  
Not an edge failure — all 7 malformed shapes were handled. Separate observation: this document is not in the 161-document export at all, so the deck reads it but no task has ever written it.  
*Evidence:* null:ok []:ok {}:ok "string":ok wrong-typed fields:ok row is a number:ok truncated JSON:ok

**W7 · Document `zohoSync` (malformed input)** — *Edge / Pass / Integration Engineer*  
Not an edge failure — all 7 malformed shapes were handled. Separate observation: this document is not in the 161-document export at all, so the deck reads it but no task has ever written it.  
*Evidence:* null:ok []:ok {}:ok "string":ok wrong-typed fields:ok row is a number:ok truncated JSON:ok

**W8 · Document `revenueScan` (malformed input)** — *Edge / Pass / Integration Engineer*  
Not an edge failure — all 7 malformed shapes were handled. Separate observation: this document is not in the 161-document export at all, so the deck reads it but no task has ever written it.  
*Evidence:* null:ok []:ok {}:ok "string":ok wrong-typed fields:ok row is a number:ok truncated JSON:ok

**W9 · Document `healthCoaching` (malformed input)** — *Edge / Pass / Integration Engineer*  
Not an edge failure — all 7 malformed shapes were handled. Separate observation: this document is not in the 161-document export at all, so the deck reads it but no task has ever written it.  
*Evidence:* null:ok []:ok {}:ok "string":ok wrong-typed fields:ok row is a number:ok truncated JSON:ok

**W10 · Document `zohoLeads` (malformed input)** — *Edge / Pass / Integration Engineer*  
Not an edge failure — all 7 malformed shapes were handled. Separate observation: this document is not in the 161-document export at all, so the deck reads it but no task has ever written it.  
*Evidence:* null:ok []:ok {}:ok "string":ok wrong-typed fields:ok row is a number:ok truncated JSON:ok

**W11 · ISA line conflict merge (isaLineMergeArrays) [local-only]** — *Concurrency / Degraded / Reliability Engineer*  
40 ID'd message(s) never reached the document (49 stored vs 90 expected) — NOT the merge's doing: the isaLine branch calls syncKeyToDb, which with no db capability queues a pendingDbWrites entry, and the very next guard (`!dbReady && pendingDbWrites[key]`, html:6881) then discards every later isaLine change in the session · 1 of 2 message(s) WITHOUT an `id` were discarded by the merge — on a two-way channel with a person that is lost correspondence, not a rounding error  
*Evidence:* isaLineMergeArrays take() at html:24534; doc held 8 messages, burst added 80 with an id and 2 without; 49 stored afterwards vs 90 if nothing were lost; ISA_LINE_MAX=300 cap at html:24524

**W12 · Restore all 161 exported documents and run the page** — *BackupRecovery / Degraded / Integration Engineer*  
4 watched documents were never written by their task and therefore cannot be restored: loftyLeads, zohoSync, revenueScan, healthCoaching  
*Evidence:* 161/161 restored · 863 KB · 341 containers rendered · 0 exceptions

## Baseline digest

- Ran to completion in **979 ms**, **335 container ids** received innerHTML, **0 exceptions**, **0 safeRun failures**, **0 shape warnings**.
- `document.getElementById` was called 1426 times and missed 7 distinct ids.
- Slowest renders (shim time): `renderPanelStamps` 42 ms · `renderKanban` 23 ms · `renderWeather` 19 ms · `renderTechStack` 16 ms · `renderDreamProperties` 16 ms · `renderDreamFeatures` 15 ms
- Timers: 84 of 94 drained.

## Volume digest

| Payload | Bytes | Page time | vs baseline | Slowest render | Largest single innerHTML write |
| --- | --- | --- | --- | --- | --- |
| routineHealth · 5,000 routine rows | 1093 KB | 2016 ms | +1037 ms | `renderPanelStamps` 79 ms | 815 KB → `#autoHealthBody` |
| kanbanCards · 2,000 cards | 237 KB | 1337 ms | +358 ms | `renderKanban` 119 ms | 61 KB → `#eliteTaxStrategyRows` |
| isaLine · 10,000 messages | 2539 KB | 5426 ms | +4447 ms | `renderNotifications (final pass)` 638 ms | 5237 KB → `#isaLineThread` |
| liveFeeds · 50 feeds x 200 citations | 1270 KB | 1532 ms | +553 ms | `renderPanelStamps` 65 ms | 61 KB → `#eliteTaxStrategyRows` |
| **all four at once** | 5140 KB | 7260 ms | — | `renderNotifications (final pass)` 834 ms | — |

## Edge digest — 7 malformed shapes per document

Variants: `null` · `[]` · `{}` · `"string"` · wrong-typed fields · a row that is a number · truncated JSON.
`guarded` means `lsGetSeeded` caught the shape and fell back to the seed with a recorded SHAPE_MISMATCH;
`throw` means the value reached a renderer and `safeRun` had to catch it, blanking that panel.

| Document | In the 2026-09-22 export | Variants that threw | Function(s) reached |
| --- | --- | --- | --- |
| `weatherSnapshot` | yes | 0/7 | — |
| `liveFeeds` | yes | 1/7 (wrong-typed fields) | `renderNews` @ html:22332 · `renderOrFeeds` @ html:22332 |
| `calendarSnapshot` | yes | 0/7 | — |
| `stravaSnapshot` | yes | 0/7 | — |
| `strategySnapshot` | yes | 0/7 | — |
| `leadTriage` | yes | 0/7 | — |
| `loftyLeads` | **no — never written** | 0/7 | — |
| `zohoSync` | **no — never written** | 0/7 | — |
| `twinBrief` | yes | 0/7 | — |
| `twinLog` | yes | 0/7 | — |
| `vanessaBrief` | yes | 0/7 | — |
| `vanessaRuns` | yes | 0/7 | — |
| `revenueScan` | **no — never written** | 0/7 | — |
| `improvementProposals` | yes | 0/7 | — |
| `loopLog` | yes | 0/7 | — |
| `cpiCycles` | yes | 0/7 | — |
| `routineHealth` | yes | 0/7 | — |
| `backupStatus` | yes | 0/7 | — |
| `ratesSnapshot` | yes | 0/7 | — |
| `isaScorecard` | yes | 0/7 | — |
| `appleHealth` | yes | 0/7 | — |
| `healthAnalysis` | yes | 0/7 | — |
| `healthCoaching` | **no — never written** | 0/7 | — |
| `toolkitSnapshot` | yes | 0/7 | — |
| `knowledgeFabric` | yes | 0/7 | — |
| `aiTeamRoster` | yes | 0/7 | — |
| `runnerStatus` | yes | 0/7 | — |
| `marketingQueue` | yes | 0/7 | — |
| `zohoLeads` | **no — never written** | 0/7 | — |
| `twinQueue` | yes | 0/7 | — |
| `vanessaRecommendations` | yes | 0/7 | — |

## Failure-injection digest

| Injected failure | Page | Containers | LS_UNAVAILABLE raised | Shape warnings | Console warnings |
| --- | --- | --- | --- | --- | --- |
| window.claude present, use() throws | ran to completion | 335 | false | 1 | 1 |
| window.claude present, use() rejects | ran to completion | 335 | false | 0 | 0 |
| localStorage.setItem throws (quota) | ran to completion | 335 | false | 0 | 439 |
| localStorage.getItem throws (disabled) | ran to completion | 335 | true | 0 | 0 |
| localStorage 100 KB quota (writes fail part-way) | ran to completion | 335 | false | 0 | 2 |
| localStorage 5 MB quota + all 161 live docs | ran to completion | 341 | false | 0 | 0 |
| cdStateSeed block removed | ran to completion | 335 | false | 0 | 0 |

## Concurrency digest

| Mode | Burst | Apply | Replay | changed on replay | Keys rewritten on replay | isaLine stored / expected | ID'd lost | id-less dropped | Order-independent |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| db-connected | 200 changes | 10 ms | 6 ms | false | 0 | 90 / 90 | 0 | 0 | true |
| local-only | 200 changes | 8 ms | 5 ms | false | 0 | 49 / 90 | 40 | 1 | true |

The burst is 200 document changes replayed through `applyRemoteSnapshot` — every exported document plus TWO CONFLICTING `isaLine` arrays
in the same snapshot (40 messages from each side, each side also sending one message with no `id`).
"expected" = what the document would hold if nothing were lost: what it already held, plus every message in the burst.

## Backup / recovery digest

- Restored **161 of 161** exported documents (863 KB) into the shim's localStorage under `commandDeck.`, then ran the page.
- Parse failures: **0** · documents with no `v` wrapper: **1 (stravaSnapshot)**
- All **28** OUTPUT_WATCH documents are read by `outputWatchRows()`; **4** of them do not exist in the export (loftyLeads, zohoSync, revenueScan, healthCoaching).
- Containers rendered from the restored store: **341** (seed-only baseline: 335); lost vs seed-only: 0; gained: 6 (hfReqStatus, marketUpdateLiveList_murrieta-ca, newsLocalList_san-diego-ca, newsLocalList_temecula-ca, sbL5Status, sessionReadSrc).
- **Verdict: PASS WITH EXCEPTIONS** — written to `backup/restore-test.json`.
- Bundle: `backup/2026-09-22/` — 161 documents + the deck, 162 files, 4.87 MB, sha256 per file recomputed from disk after write, 0 integrity failures.

## Drift check — the files this cycle is editing (point in time)

Snapshots taken while seven engineers were still editing, so these are advisory, not a gate.

| File | sha256 | Page | Containers (Δ vs baseline) | New safeRun failures | New dead ids |
| --- | --- | --- | --- | --- | --- |
| `deck/command-deck.html (working tree)` | `bbd64191b5de` | identical to baseline — not re-run | — | — | — |
| `wt-e1-daily/command-deck.html` | `f85a73c2bffe` | ran to completion | 318 (-17) | none | none |
| `wt-e2-markets/command-deck.html` | `8f3afaa288a1` | ran to completion | 320 (-15) | none | none |
| `wt-e3-wealth/command-deck.html` | `4cf3891cadf0` | ran to completion | 318 (-17) | none | none |
| `wt-e4a-crm/command-deck.html` | `2bd714512600` | ran to completion | 322 (-13) | none | none |
| `wt-e4b-realestate/command-deck.html` | `2d4b60a0b40e` | ran to completion | 319 (-16) | none | none |
| `wt-e5-life/command-deck.html` | `c91460ff4de0` | ran to completion | 319 (-16) | none | none |
| `wt-e6-aiteam/command-deck.html` | `cabb1bafe36a` | ran to completion | 318 (-17) | none | none |

## How to rerun

```bash
cd scratchpad/tests

# 1. one file, end to end — exit 0 = the script reached its last line, exit 2 = it halted
node runtime-harness.js ../deck/command-deck.html
node runtime-harness.js ../wt-e5-life/command-deck.html --out /tmp/e5.json

# 2. with every live document restored into localStorage
node runtime-harness.js ../deck/command-deck.html --store ../db/state

# 3. failure injection (inline JSON or a file path)
node runtime-harness.js ../deck/command-deck.html --inject '{"claude":"throwing"}'
node runtime-harness.js ../deck/command-deck.html --inject '{"setItemThrows":true}'
node runtime-harness.js ../deck/command-deck.html --inject '{"removeSeed":true}'
node runtime-harness.js ../deck/command-deck.html --inject '{"localStorage":{"liveFeeds":{"feeds":{"aiNewsList":{"citations":{"not":"an array"}}}}}}'

# 4. the whole sweep (~20 min under load; writes this report, the findings input and the backup bundle)
node stress-sweep.js baseline-5fbe844.html      # pinned 5fbe844 — reproduces this report exactly
node stress-sweep.js                            # whatever ../deck/command-deck.html holds now

# 5. prove the harness still catches the bug it exists for (6 self-tests)
node harness-selftest.js

# 6. regenerate just the write-ups / the backup bundle
node write-reports.js
node make-findings.js            # -> ../audit/findings-E7.json
node make-backup.js              # -> ../backup/2026-09-22/{state,command-deck.html,manifest.json}
```
