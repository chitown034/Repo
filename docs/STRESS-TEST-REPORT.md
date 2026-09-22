# Command Deck — Stress Test Report

**Engineer:** E7 — Stress Test Engineer · **Cycle:** Loop Cycle 6 · **Run:** 2026-09-22T09:03:17.290Z
**Baseline 2026-09-12 · verified 2026-09-22** · Deck under test: `tests/baseline-5fbe844.html`  
sha256 `1a9e203b1a08c5596e828a5765500bc2…` · 25595 lines · git master commit 5fbe844 (the published build 2026-09-15 02:19 PT), pinned to tests/baseline-5fbe844.html so every line number in this report stays valid while seven engineers edit their worktrees · Node v22.22.2
**Harness:** `tests/runtime-harness.js` (pure Node DOM shim — no npm, no jsdom) + `tests/dom-shim.js`

Result counts: **48 Pass · 12 Degraded · 1 Fail** of 61 tests.

`Fix Applied` and `Re-test Result` are deliberately empty/Pending: E7 does not edit the deck. Nothing here is
marked Resolved on the strength of a fix — only on the strength of a test that passed.

| Capability | Test Type | Result | Weakness Found | Engineer Assigned | Fix Applied | Re-test Result | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Whole page — published seed, no synced docs | Functional | Pass | — | — | — | Pending | Resolved |
| Element wiring — $() targets that do not exist in the document | Regression | Degraded | 6 ids are looked up but never exist: vanessaVoiceToggle, steveVoiceToggle, vanessaMicBtn, steveMicBtn, isaPbTracker, isaPbVip. Every call site is null-guarded so nothing throws — the features simply never wire up (voice toggles, both mic buttons, the ISA power-block tracker + VIP tiles). | Capability Engineer | — | Pending | Escalated |
| Travel panel — 'N showing' count on first paint | Regression | Degraded | renderTravelPage reads $('travelVisibleCount') one line BEFORE renderTravelFilters() creates that span, so the count is empty on the first paint and only fills on a later re-render. | Reliability Engineer | — | Pending | Open |
| Automation health board (routineHealth) | Volume | Pass | — | — | — | Pending | Resolved |
| Task board (kanbanCards) | Volume | Pass | — | — | — | Pending | Resolved |
| ISA direct line (isaLine) | Volume | Degraded | slowest render renderNotifications (final pass) 732 ms · one innerHTML write of 5.11 MB into #isaLineThread — no display cap on this list | Efficiency Engineer | — | Pending | Monitoring |
| Live research feeds (liveFeeds) | Volume | Pass | — | — | — | Pending | Resolved |
| Whole page under all four volume payloads at once | Volume | Degraded | page time 8990 ms vs 1466 ms baseline (6.1x); 5.0 MB of documents is ~1.0x the 5 MB localStorage budget | Efficiency Engineer | — | Pending | Monitoring |
| Document `weatherSnapshot` (malformed input) | Edge | Pass | — | — | — | Pending | Resolved |
| Document `liveFeeds` (malformed input) | Edge | Degraded | 1 of 7 malformed shapes (wrong-typed fields) reach a renderer and throw: renderNews @html:21367; renderOrFeeds @html:21367. safeRun catches each one, so the page stays up but those panels render empty with no on-page reason. | Reliability Engineer | — | Pending | Open |
| Document `calendarSnapshot` (malformed input) | Edge | Pass | — | — | — | Pending | Resolved |
| Document `stravaSnapshot` (malformed input) | Edge | Pass | — | — | — | Pending | Resolved |
| Document `strategySnapshot` (malformed input) | Edge | Pass | — | — | — | Pending | Resolved |
| Document `leadTriage` (malformed input) | Edge | Pass | — | — | — | Pending | Resolved |
| Document `twinBrief` (malformed input) | Edge | Pass | — | — | — | Pending | Resolved |
| Document `twinLog` (malformed input) | Edge | Pass | — | — | — | Pending | Resolved |
| Document `vanessaBrief` (malformed input) | Edge | Pass | — | — | — | Pending | Resolved |
| Document `vanessaRuns` (malformed input) | Edge | Pass | — | — | — | Pending | Resolved |
| Document `revenueScan` (malformed input) | Edge | Pass | Doc is not in the 161-doc export at all — the deck reads it but no task has ever written it. | Integration Engineer | — | Pending | Escalated |
| Document `improvementProposals` (malformed input) | Edge | Pass | — | — | — | Pending | Resolved |
| Document `loopLog` (malformed input) | Edge | Pass | — | — | — | Pending | Resolved |
| Document `cpiCycles` (malformed input) | Edge | Pass | — | — | — | Pending | Resolved |
| Document `routineHealth` (malformed input) | Edge | Pass | — | — | — | Pending | Resolved |
| Document `backupStatus` (malformed input) | Edge | Pass | — | — | — | Pending | Resolved |
| Document `ratesSnapshot` (malformed input) | Edge | Pass | — | — | — | Pending | Resolved |
| Document `isaScorecard` (malformed input) | Edge | Pass | — | — | — | Pending | Resolved |
| Document `appleHealth` (malformed input) | Edge | Pass | — | — | — | Pending | Resolved |
| Document `healthAnalysis` (malformed input) | Edge | Pass | — | — | — | Pending | Resolved |
| Document `healthCoaching` (malformed input) | Edge | Pass | Doc is not in the 161-doc export at all — the deck reads it but no task has ever written it. | Integration Engineer | — | Pending | Escalated |
| Document `toolkitSnapshot` (malformed input) | Edge | Pass | — | — | — | Pending | Resolved |
| Document `knowledgeFabric` (malformed input) | Edge | Pass | — | — | — | Pending | Resolved |
| Document `aiTeamRoster` (malformed input) | Edge | Pass | — | — | — | Pending | Resolved |
| Document `runnerStatus` (malformed input) | Edge | Pass | — | — | — | Pending | Resolved |
| Document `marketingQueue` (malformed input) | Edge | Pass | — | — | — | Pending | Resolved |
| Document `zohoLeads` (malformed input) | Edge | Pass | Doc is not in the 161-doc export at all — the deck reads it but no task has ever written it. | Integration Engineer | — | Pending | Escalated |
| Document `twinQueue` (malformed input) | Edge | Pass | — | — | — | Pending | Resolved |
| Document `vanessaRecommendations` (malformed input) | Edge | Pass | — | — | — | Pending | Resolved |
| Claude capability handshake (initSync / claudeUse) | FailureInjection | Fail | P1 — the whole page dies. `(function initSync(){...})` calls `window.claude.use("db").then(...)` at html:6921 with NO try/catch; only the promise is `.catch()`ed. A SYNCHRONOUS throw from claude.use propagates out of the IIFE and halts every remaining top-level statement, so 0 of 318 containers render — a blank dashboard, exactly the 2026-09-03 CI-log regression class. Exception: claude.use('db') exploded (injected failure) @ html:6921. Fix: wrap the use() call in try/catch and fall back to setSyncStatus("Local only (this device)","off"). | Reliability Engineer | — | Pending | Escalated |
| Claude capability handshake — rejected promise | FailureInjection | Pass | — | — | — | Pending | Resolved |
| Local persistence — write path | FailureInjection | Degraded | Every write is silently swallowed by lsSetLocal's empty catch — the page renders normally and the sync pill still reads 'Local only (this device)'. A user typing into any panel loses the edit with no warning. | Reliability Engineer | — | Pending | Open |
| Local persistence — read path | FailureInjection | Pass | — | — | — | Pending | Resolved |
| Local persistence — quota exhausted part-way through hydration | FailureInjection | Degraded | localStorage fills up part-way through hydrateFromSeed and every later write throws QuotaExceededError into lsSetLocal's empty catch. The page renders, but half the seed never persists and NOTHING on the page says a write failed — LS_UNAVAILABLE is only set on a failing READ (lsGetSeeded, html:6724), never on a failing write. | Reliability Engineer | — | Pending | Open |
| Local persistence — 5 MB browser quota with the real store | FailureInjection | Pass | — | — | — | Pending | Resolved |
| Published seed hydration (hydrateFromSeed) | FailureInjection | Pass | — | — | — | Pending | Resolved |
| Cross-device merge — 200-change burst (applyRemoteSnapshot) [db-connected] | Concurrency | Pass | — | — | — | Pending | Resolved |
| Merge idempotence — identical burst replayed [db-connected] | Concurrency | Degraded | replaying the identical snapshot reported changed=true and rewrote 0 keys () — a second device echoing the same documents back can loop the 30 s location.reload() throttle. | Reliability Engineer | — | Pending | Open |
| ISA line conflict merge (isaLineMergeArrays) [db-connected] | Concurrency | Degraded | 2 messages WITHOUT an `id` were silently discarded — isaLineMergeArrays' take() returns early on `!m.id`, so any relay that omits an id vanishes with no warning anywhere | Reliability Engineer | — | Pending | Open |
| Cross-device merge — 200-change burst (applyRemoteSnapshot) [local-only] | Concurrency | Pass | — | — | — | Pending | Resolved |
| Merge idempotence — identical burst replayed [local-only] | Concurrency | Degraded | replaying the identical snapshot reported changed=true and rewrote 0 keys () — a second device echoing the same documents back can loop the 30 s location.reload() throttle. | Reliability Engineer | — | Pending | Open |
| ISA line conflict merge (isaLineMergeArrays) [local-only] | Concurrency | Degraded | 40 ID'd messages lost in the merge · 2 messages WITHOUT an `id` were silently discarded — isaLineMergeArrays' take() returns early on `!m.id`, so any relay that omits an id vanishes with no warning anywhere | Reliability Engineer | — | Pending | Open |
| Restore all 161 exported documents and run the page | BackupRecovery | Degraded | stravaSnapshot has no `v` wrapper, so applyRemoteSnapshot skips it and a restore silently loses it (160/161 restored) · 2 watched documents were never written by their task and therefore cannot be restored: revenueScan, healthCoaching | Integration Engineer | — | Pending | Escalated |
| OUTPUT_WATCH freshness board after a full restore | BackupRecovery | Pass | — | — | — | Pending | Resolved |
| Backup bundle backup/2026-09-22 (sha256 manifest) | BackupRecovery | Pass | — | — | — | Pending | Resolved |
| Runtime gate — deck/command-deck.html (working tree) | Regression | Pass | — | — | — | Pending | Resolved |
| Runtime gate — wt-e1-daily/command-deck.html | Regression | Pass | — | — | — | Pending | Resolved |
| Runtime gate — wt-e2-markets/command-deck.html | Regression | Pass | — | — | — | Pending | Resolved |
| Runtime gate — wt-e3-wealth/command-deck.html | Regression | Pass | — | — | — | Pending | Resolved |
| Runtime gate — wt-e4a-crm/command-deck.html | Regression | Pass | — | — | — | Pending | Resolved |
| Runtime gate — wt-e4b-realestate/command-deck.html | Regression | Pass | — | — | — | Pending | Resolved |
| Runtime gate — wt-e5-life/command-deck.html | Regression | Pass | — | — | — | Pending | Resolved |
| Runtime gate — wt-e6-aiteam/command-deck.html | Regression | Pass | — | — | — | Pending | Resolved |

## Evidence per row

**1. Whole page — published seed, no synced docs** (Functional · Pass) — 318 container ids received innerHTML; 1466 ms; 0 exceptions
**2. Element wiring — $() targets that do not exist in the document** (Regression · Degraded) — presenceAttachMic('vanessaMicBtn'…) html:23632 · presenceAttachMic('steveMicBtn'…) html:23633 · voice toggles html:23627 · renderIsaPlaybook trackEl/vipEl html:25040
**3. Travel panel — 'N showing' count on first paint** (Regression · Degraded) — html:17776 reads the id, html:17778 calls renderTravelFilters() which emits it (html:17719)
**4. Automation health board (routineHealth)** (Volume · Pass) — payload 1093 KB · page 2613 ms (+1147 ms vs baseline) · 318 containers · largest single innerHTML write 814 KB into #autoHealthBody
**5. Task board (kanbanCards)** (Volume · Pass) — payload 237 KB · page 1727 ms (+261 ms vs baseline) · 318 containers · largest single innerHTML write 61 KB into #eliteTaxStrategyRows
**6. ISA direct line (isaLine)** (Volume · Degraded) — payload 2539 KB · page 6694 ms (+5228 ms vs baseline) · 318 containers · largest single innerHTML write 5237 KB into #isaLineThread
**7. Live research feeds (liveFeeds)** (Volume · Pass) — payload 1270 KB · page 2059 ms (+593 ms vs baseline) · 320 containers · largest single innerHTML write 61 KB into #eliteTaxStrategyRows
**8. Whole page under all four volume payloads at once** (Volume · Degraded) — slowest: renderNotifications (final pass) 803ms, renderExecBrief (final pass) 471ms, renderKanban 187ms
**9. Document `weatherSnapshot` (malformed input)** (Edge · Pass) — null:ok []:ok {}:ok "string":ok wrong-typed fields:ok row is a number:ok truncated JSON:ok
**10. Document `liveFeeds` (malformed input)** (Edge · Degraded) — null:guarded []:guarded {}:ok "string":guarded wrong-typed fields:throw row is a number:guarded truncated JSON:guarded
**11. Document `calendarSnapshot` (malformed input)** (Edge · Pass) — null:ok []:ok {}:ok "string":ok wrong-typed fields:ok row is a number:ok truncated JSON:ok
**12. Document `stravaSnapshot` (malformed input)** (Edge · Pass) — null:ok []:ok {}:ok "string":ok wrong-typed fields:ok row is a number:ok truncated JSON:ok
**13. Document `strategySnapshot` (malformed input)** (Edge · Pass) — null:ok []:ok {}:ok "string":ok wrong-typed fields:ok row is a number:ok truncated JSON:ok
**14. Document `leadTriage` (malformed input)** (Edge · Pass) — null:ok []:ok {}:ok "string":ok wrong-typed fields:ok row is a number:ok truncated JSON:guarded
**15. Document `twinBrief` (malformed input)** (Edge · Pass) — null:ok []:ok {}:ok "string":ok wrong-typed fields:ok row is a number:ok truncated JSON:guarded
**16. Document `twinLog` (malformed input)** (Edge · Pass) — null:ok []:ok {}:ok "string":ok wrong-typed fields:ok row is a number:ok truncated JSON:ok
**17. Document `vanessaBrief` (malformed input)** (Edge · Pass) — null:ok []:ok {}:ok "string":ok wrong-typed fields:ok row is a number:ok truncated JSON:ok
**18. Document `vanessaRuns` (malformed input)** (Edge · Pass) — null:ok []:ok {}:ok "string":ok wrong-typed fields:ok row is a number:ok truncated JSON:ok
**19. Document `revenueScan` (malformed input)** (Edge · Pass) — null:ok []:ok {}:ok "string":ok wrong-typed fields:ok row is a number:ok truncated JSON:ok
**20. Document `improvementProposals` (malformed input)** (Edge · Pass) — null:guarded []:ok {}:guarded "string":guarded wrong-typed fields:guarded row is a number:ok truncated JSON:ok
**21. Document `loopLog` (malformed input)** (Edge · Pass) — null:ok []:ok {}:ok "string":ok wrong-typed fields:ok row is a number:ok truncated JSON:ok
**22. Document `cpiCycles` (malformed input)** (Edge · Pass) — null:guarded []:ok {}:guarded "string":guarded wrong-typed fields:guarded row is a number:ok truncated JSON:guarded
**23. Document `routineHealth` (malformed input)** (Edge · Pass) — null:ok []:ok {}:ok "string":ok wrong-typed fields:ok row is a number:ok truncated JSON:ok
**24. Document `backupStatus` (malformed input)** (Edge · Pass) — null:ok []:ok {}:ok "string":ok wrong-typed fields:ok row is a number:ok truncated JSON:ok
**25. Document `ratesSnapshot` (malformed input)** (Edge · Pass) — null:ok []:ok {}:ok "string":ok wrong-typed fields:ok row is a number:ok truncated JSON:ok
**26. Document `isaScorecard` (malformed input)** (Edge · Pass) — null:guarded []:ok {}:guarded "string":guarded wrong-typed fields:guarded row is a number:ok truncated JSON:ok
**27. Document `appleHealth` (malformed input)** (Edge · Pass) — null:ok []:ok {}:ok "string":ok wrong-typed fields:ok row is a number:ok truncated JSON:ok
**28. Document `healthAnalysis` (malformed input)** (Edge · Pass) — null:ok []:ok {}:ok "string":ok wrong-typed fields:ok row is a number:ok truncated JSON:ok
**29. Document `healthCoaching` (malformed input)** (Edge · Pass) — null:ok []:ok {}:ok "string":ok wrong-typed fields:ok row is a number:ok truncated JSON:ok
**30. Document `toolkitSnapshot` (malformed input)** (Edge · Pass) — null:ok []:ok {}:ok "string":ok wrong-typed fields:ok row is a number:ok truncated JSON:ok
**31. Document `knowledgeFabric` (malformed input)** (Edge · Pass) — null:ok []:ok {}:ok "string":ok wrong-typed fields:ok row is a number:ok truncated JSON:ok
**32. Document `aiTeamRoster` (malformed input)** (Edge · Pass) — null:ok []:ok {}:ok "string":ok wrong-typed fields:ok row is a number:ok truncated JSON:ok
**33. Document `runnerStatus` (malformed input)** (Edge · Pass) — null:ok []:ok {}:ok "string":ok wrong-typed fields:ok row is a number:ok truncated JSON:ok
**34. Document `marketingQueue` (malformed input)** (Edge · Pass) — null:guarded []:ok {}:guarded "string":guarded wrong-typed fields:guarded row is a number:ok truncated JSON:guarded
**35. Document `zohoLeads` (malformed input)** (Edge · Pass) — null:ok []:ok {}:ok "string":ok wrong-typed fields:ok row is a number:ok truncated JSON:ok
**36. Document `twinQueue` (malformed input)** (Edge · Pass) — null:guarded []:ok {}:guarded "string":guarded wrong-typed fields:guarded row is a number:ok truncated JSON:guarded
**37. Document `vanessaRecommendations` (malformed input)** (Edge · Pass) — null:guarded []:ok {}:guarded "string":guarded wrong-typed fields:guarded row is a number:ok truncated JSON:guarded
**38. Claude capability handshake (initSync / claudeUse)** (FailureInjection · Fail) — page HALTED · 0 containers · 0 shape warnings · 0 console warnings
**39. Claude capability handshake — rejected promise** (FailureInjection · Pass) — page ran to completion · 318 containers · 0 shape warnings · 0 console warnings
**40. Local persistence — write path** (FailureInjection · Degraded) — page ran to completion · 318 containers · 0 shape warnings · 0 console warnings
**41. Local persistence — read path** (FailureInjection · Pass) — page ran to completion · 318 containers · 0 shape warnings · 0 console warnings
**42. Local persistence — quota exhausted part-way through hydration** (FailureInjection · Degraded) — page ran to completion · 318 containers · 0 shape warnings · 0 console warnings
**43. Local persistence — 5 MB browser quota with the real store** (FailureInjection · Pass) — page ran to completion · 322 containers · 0 shape warnings · 0 console warnings
**44. Published seed hydration (hydrateFromSeed)** (FailureInjection · Pass) — page ran to completion · 318 containers · 0 shape warnings · 0 console warnings
**45. Cross-device merge — 200-change burst (applyRemoteSnapshot) [db-connected]** (Concurrency · Pass) — 200 doc changes applied in 10 ms, no throw; 163 keys in localStorage afterwards
**46. Merge idempotence — identical burst replayed [db-connected]** (Concurrency · Degraded) — changed(first)=true changed(replay)=true keys rewritten=0
**47. ISA line conflict merge (isaLineMergeArrays) [db-connected]** (Concurrency · Degraded) — html:24531 isaLineMergeArrays take(); 88 of 82 messages survived; ISA_LINE_MAX=300 cap
**48. Cross-device merge — 200-change burst (applyRemoteSnapshot) [local-only]** (Concurrency · Pass) — 200 doc changes applied in 8 ms, no throw; 163 keys in localStorage afterwards
**49. Merge idempotence — identical burst replayed [local-only]** (Concurrency · Degraded) — changed(first)=true changed(replay)=true keys rewritten=0
**50. ISA line conflict merge (isaLineMergeArrays) [local-only]** (Concurrency · Degraded) — html:24531 isaLineMergeArrays take(); 48 of 82 messages survived; ISA_LINE_MAX=300 cap
**51. Restore all 161 exported documents and run the page** (BackupRecovery · Degraded) — 160/161 restored · 863 KB · 322 containers rendered · 0 exceptions
**52. OUTPUT_WATCH freshness board after a full restore** (BackupRecovery · Pass) — all 26 OUTPUT_WATCH docs are read by outputWatchRows(); autoHealthBody rendered=true
**53. Backup bundle backup/2026-09-22 (sha256 manifest)** (BackupRecovery · Pass) — 161 docs + the deck, 4.71 MB, every file re-hashed after write and matched
**54. Runtime gate — deck/command-deck.html (working tree)** (Regression · Pass) — sha256 cc85ed1f4b9d · 325 containers · 1055 ms · point-in-time snapshot taken during the cycle, files were still being edited
**55. Runtime gate — wt-e1-daily/command-deck.html** (Regression · Pass) — sha256 f85a73c2bffe · 318 containers · 1122 ms · point-in-time snapshot taken during the cycle, files were still being edited
**56. Runtime gate — wt-e2-markets/command-deck.html** (Regression · Pass) — sha256 8f3afaa288a1 · 320 containers · 1228 ms · point-in-time snapshot taken during the cycle, files were still being edited
**57. Runtime gate — wt-e3-wealth/command-deck.html** (Regression · Pass) — sha256 4cf3891cadf0 · 318 containers · 1146 ms · point-in-time snapshot taken during the cycle, files were still being edited
**58. Runtime gate — wt-e4a-crm/command-deck.html** (Regression · Pass) — sha256 2bd714512600 · 322 containers · 1053 ms · point-in-time snapshot taken during the cycle, files were still being edited
**59. Runtime gate — wt-e4b-realestate/command-deck.html** (Regression · Pass) — sha256 2d4b60a0b40e · 319 containers · 1161 ms · point-in-time snapshot taken during the cycle, files were still being edited
**60. Runtime gate — wt-e5-life/command-deck.html** (Regression · Pass) — sha256 c91460ff4de0 · 319 containers · 1104 ms · point-in-time snapshot taken during the cycle, files were still being edited
**61. Runtime gate — wt-e6-aiteam/command-deck.html** (Regression · Pass) — sha256 cabb1bafe36a · 318 containers · 1156 ms · point-in-time snapshot taken during the cycle, files were still being edited

## Weakness dossier — for the Reliability / Efficiency / Capability / Integration Engineers

Every line below is reproducible with the command in the next section. Line numbers are lines of
`deck/command-deck.html` as shipped (commit 5fbe844); the inline script starts at line 6635.

**W1 · Element wiring — $() targets that do not exist in the document** — *Regression / Degraded / Capability Engineer*  
6 ids are looked up but never exist: vanessaVoiceToggle, steveVoiceToggle, vanessaMicBtn, steveMicBtn, isaPbTracker, isaPbVip. Every call site is null-guarded so nothing throws — the features simply never wire up (voice toggles, both mic buttons, the ISA power-block tracker + VIP tiles).  
*Evidence:* presenceAttachMic('vanessaMicBtn'…) html:23632 · presenceAttachMic('steveMicBtn'…) html:23633 · voice toggles html:23627 · renderIsaPlaybook trackEl/vipEl html:25040

**W2 · Travel panel — 'N showing' count on first paint** — *Regression / Degraded / Reliability Engineer*  
renderTravelPage reads $('travelVisibleCount') one line BEFORE renderTravelFilters() creates that span, so the count is empty on the first paint and only fills on a later re-render.  
*Evidence:* html:17776 reads the id, html:17778 calls renderTravelFilters() which emits it (html:17719)

**W3 · ISA direct line (isaLine)** — *Volume / Degraded / Efficiency Engineer*  
slowest render renderNotifications (final pass) 732 ms · one innerHTML write of 5.11 MB into #isaLineThread — no display cap on this list  
*Evidence:* payload 2539 KB · page 6694 ms (+5228 ms vs baseline) · 318 containers · largest single innerHTML write 5237 KB into #isaLineThread

**W4 · Whole page under all four volume payloads at once** — *Volume / Degraded / Efficiency Engineer*  
page time 8990 ms vs 1466 ms baseline (6.1x); 5.0 MB of documents is ~1.0x the 5 MB localStorage budget  
*Evidence:* slowest: renderNotifications (final pass) 803ms, renderExecBrief (final pass) 471ms, renderKanban 187ms

**W5 · Document `liveFeeds` (malformed input)** — *Edge / Degraded / Reliability Engineer*  
1 of 7 malformed shapes (wrong-typed fields) reach a renderer and throw: renderNews @html:21367; renderOrFeeds @html:21367. safeRun catches each one, so the page stays up but those panels render empty with no on-page reason.  
*Evidence:* null:guarded []:guarded {}:ok "string":guarded wrong-typed fields:throw row is a number:guarded truncated JSON:guarded

**W6 · Document `revenueScan` (malformed input)** — *Edge / Pass / Integration Engineer*  
Doc is not in the 161-doc export at all — the deck reads it but no task has ever written it.  
*Evidence:* null:ok []:ok {}:ok "string":ok wrong-typed fields:ok row is a number:ok truncated JSON:ok

**W7 · Document `healthCoaching` (malformed input)** — *Edge / Pass / Integration Engineer*  
Doc is not in the 161-doc export at all — the deck reads it but no task has ever written it.  
*Evidence:* null:ok []:ok {}:ok "string":ok wrong-typed fields:ok row is a number:ok truncated JSON:ok

**W8 · Document `zohoLeads` (malformed input)** — *Edge / Pass / Integration Engineer*  
Doc is not in the 161-doc export at all — the deck reads it but no task has ever written it.  
*Evidence:* null:ok []:ok {}:ok "string":ok wrong-typed fields:ok row is a number:ok truncated JSON:ok

**W9 · Claude capability handshake (initSync / claudeUse)** — *FailureInjection / Fail / Reliability Engineer*  
P1 — the whole page dies. `(function initSync(){...})` calls `window.claude.use("db").then(...)` at html:6921 with NO try/catch; only the promise is `.catch()`ed. A SYNCHRONOUS throw from claude.use propagates out of the IIFE and halts every remaining top-level statement, so 0 of 318 containers render — a blank dashboard, exactly the 2026-09-03 CI-log regression class. Exception: claude.use('db') exploded (injected failure) @ html:6921. Fix: wrap the use() call in try/catch and fall back to setSyncStatus("Local only (this device)","off").  
*Evidence:* page HALTED · 0 containers · 0 shape warnings · 0 console warnings

**W10 · Local persistence — write path** — *FailureInjection / Degraded / Reliability Engineer*  
Every write is silently swallowed by lsSetLocal's empty catch — the page renders normally and the sync pill still reads 'Local only (this device)'. A user typing into any panel loses the edit with no warning.  
*Evidence:* page ran to completion · 318 containers · 0 shape warnings · 0 console warnings

**W11 · Local persistence — quota exhausted part-way through hydration** — *FailureInjection / Degraded / Reliability Engineer*  
localStorage fills up part-way through hydrateFromSeed and every later write throws QuotaExceededError into lsSetLocal's empty catch. The page renders, but half the seed never persists and NOTHING on the page says a write failed — LS_UNAVAILABLE is only set on a failing READ (lsGetSeeded, html:6724), never on a failing write.  
*Evidence:* page ran to completion · 318 containers · 0 shape warnings · 0 console warnings

**W12 · Merge idempotence — identical burst replayed [db-connected]** — *Concurrency / Degraded / Reliability Engineer*  
replaying the identical snapshot reported changed=true and rewrote 0 keys () — a second device echoing the same documents back can loop the 30 s location.reload() throttle.  
*Evidence:* changed(first)=true changed(replay)=true keys rewritten=0

**W13 · ISA line conflict merge (isaLineMergeArrays) [db-connected]** — *Concurrency / Degraded / Reliability Engineer*  
2 messages WITHOUT an `id` were silently discarded — isaLineMergeArrays' take() returns early on `!m.id`, so any relay that omits an id vanishes with no warning anywhere  
*Evidence:* html:24531 isaLineMergeArrays take(); 88 of 82 messages survived; ISA_LINE_MAX=300 cap

**W14 · Merge idempotence — identical burst replayed [local-only]** — *Concurrency / Degraded / Reliability Engineer*  
replaying the identical snapshot reported changed=true and rewrote 0 keys () — a second device echoing the same documents back can loop the 30 s location.reload() throttle.  
*Evidence:* changed(first)=true changed(replay)=true keys rewritten=0

**W15 · ISA line conflict merge (isaLineMergeArrays) [local-only]** — *Concurrency / Degraded / Reliability Engineer*  
40 ID'd messages lost in the merge · 2 messages WITHOUT an `id` were silently discarded — isaLineMergeArrays' take() returns early on `!m.id`, so any relay that omits an id vanishes with no warning anywhere  
*Evidence:* html:24531 isaLineMergeArrays take(); 48 of 82 messages survived; ISA_LINE_MAX=300 cap

**W16 · Restore all 161 exported documents and run the page** — *BackupRecovery / Degraded / Integration Engineer*  
stravaSnapshot has no `v` wrapper, so applyRemoteSnapshot skips it and a restore silently loses it (160/161 restored) · 2 watched documents were never written by their task and therefore cannot be restored: revenueScan, healthCoaching  
*Evidence:* 160/161 restored · 863 KB · 322 containers rendered · 0 exceptions

## How to reproduce

```bash
cd 
node runtime-harness.js ../deck/command-deck.html                 # baseline
node runtime-harness.js ../deck/command-deck.html --store ../db/state   # with all 161 live docs
node runtime-harness.js <file.html> --inject '{"claude":"throwing"}'   # failure injection
node stress-sweep.js                                              # the whole sweep
```
