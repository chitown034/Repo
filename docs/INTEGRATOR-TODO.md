# Integrator pass — items routed to me by the engineers

Applied after all branches merge, before the splice and republish.

**Status re-checked 2026-09-23 03:10 UTC against the live store and `runnerStatus` (reads only).**
Boxes ticked below were ticked on that evidence, and the evidence is named beside each one. The
unticked ones were re-confirmed still open on the same pass — none of them is stale bookkeeping.

## From E3 (wealth)
- [ ] Base lines ~14006–14007, `SOD_ITEMS` in panel-easop (E4b's region): the two real-estate CRM
      items — the start-of-day CRM step and the CRM phone step — must read **Lofty**. Verify E4b
      caught them; if not, change them here.
- [ ] Base line ~18278 and the `cdStateSeed` seed at line 6633: the `dmaicProjects` speed-to-lead
      note names the wrong CRM as its source, and the live `dmaicProjects` document says the same.
      Fix both the seed and the live doc — the speed-to-lead baseline comes from **Lofty**, which is
      not connected yet.
- [ ] `MEMBERSHIP_ASSOC` (~line 4940) has no date evaluation at all, so every row reads as upcoming.
      Reuse E3's new `membershipExpiryNote()` helper rather than writing a second one.

## From E11a (orchestration skills)
- [x] Confirm render agreement for `trustLevels`, `scaleOpportunityLog`, `stressTestReport`.
      Done: `trustLevels` had two shapes (this panel's array under `loops`, the skill's map keyed by
      capability) and `scaleOpportunityLog` names the receiving owner `owner`, not `delegateTarget`.
      The panel now normalises both, verified against the harness with each shape.
- [ ] `skillsAudit` is a new document the skills-refresh skill writes. Nothing renders it yet.
      Decide: add a row to the Toolkit panel, or leave it to the weekly brief.

## From E10 (second brain)
- [ ] **Half closed, 2026-09-23.** `steve-twin-sweep` is no longer refused — `runnerStatus` reads
      `ok`, last end 2026-09-22 13:10. `ops-knowledge-graph` has **still never run**, and
      `knowledgeGraph` has not moved off its 2026-09-13 build (`feedFreshness` marks it stale at
      ~216 h). So the allow-list question is now about one task, not two, and it still needs Steven
      to widen it on the Mac — `docs/NEEDS-STEVEN.md` item 42.

## Mine
- [ ] Fix the triple `</body></html>` at end of file (handled by the splice script).
- [ ] **Still open.** Re-point the `dmaicProjects` live document's speed-to-lead note to Lofty.
      Re-read 2026-09-23: `dmaicProjects` d3 still says *"pulled from FUB/Zoho"* — one mention of
      the retired CRM, zero mentions of Lofty. This needs an artifact-DB write, which no read-only
      pass may make.
- [x] Write the cycle entry into `ciLog`. `ciLog` is at version 221, 26 rows.
- [x] Seed `auditFindings`, `stressTestReport`, `scaleOpportunityLog`, `weeklyBrief` into the live
      store. All four exist: `auditFindings` v3, `stressTestReport` v6, `scaleOpportunityLog` v1,
      `weeklyBrief` v1 (`state` listing, 2026-09-23 03:10 UTC).
- [x] Check the cloud write probe result and record it as F-INT-08's test result. `cloudWriteProbe`
      exists at version 1, envelope `updatedAt 2026-09-22T09:05:56Z`, body
      `result: "write succeeded unattended"`; written up in `docs/CLOUD-WRITE-ARCHITECTURE.md`.
