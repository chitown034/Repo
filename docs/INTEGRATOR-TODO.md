# Integrator pass — items routed to me by the engineers

Applied after all branches merge, before the splice and republish.

## From E3 (wealth)
- [ ] Base lines ~14006–14007, `SOD_ITEMS`: "then FUB for real estate" and "FUB Phone" — in panel-easop,
      E4b's region. Verify E4b caught them; if not, change to Lofty here.
- [ ] Base line ~18278 and the `cdStateSeed` seed at line 6633: `dmaicProjects` note reads "pulled from
      FUB/Zoho". The live `dmaicProjects` document says the same. Fix both the seed and the live doc —
      the speed-to-lead baseline now comes from Lofty.
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
- [ ] The Mac runner's allow-list blocks writes to `~/Shearrill-Vault`, so `ops-knowledge-graph` and
      `steve-twin-sweep` cannot populate the brain even once they are scheduled. Needs Steven to widen
      the task allow-list. Carry as a finding.

## Mine
- [ ] Fix the triple `</body></html>` at end of file (handled by the splice script).
- [ ] Re-point the `dmaicProjects` live document's speed-to-lead note to Lofty.
- [ ] Write the cycle entry into `ciLog`.
- [ ] Seed `auditFindings`, `stressTestReport`, `scaleOpportunityLog`, `weeklyBrief` into the live store.
- [ ] Check the cloud write probe result and record it as F-INT-08's test result.
