# What each `state` doc means and who writes it

What each `state` doc means and who writes it. **Not full context — a pointer plus highlights.**

**Full inventory:** `docs/inventory/db-docs.md` — every doc name, byte size and stamp, **161 docs,
exported 2026-09-22 ~08:10 UTC.** That snapshot is already known to be behind the live count:
`wiki/dashboard-ops/index.md`'s own standing facts put it at **175** documents at the 2026-09-23
03:10 UTC read (174 earlier the same day). Read the inventory file for the full list; this page
does not repeat it.

**The one rule, restated:** every doc here is shaped `{v: <value>}`. A bare-body write
(`stravaSnapshot`, once; `marketingQueue`, still) is a defect, not a second valid shape — see
`always-on/README.md`.

## Docs this round's reading actually surfaced, with what each one is (2026-09-28)

| Doc | Means | Written by |
|---|---|---|
| `runnerStatus` | Per-task last-end/last-status for all 59 Mac tasks under `claude-runner` | The runner itself, on every task completion |
| `knowledgeFabric` | Store counts: Second Brain rows, vault notes, Jarvis docs, graph nodes/edges, Ruflo entries, Drive files | `fabric-deck-sync`, every 2 h at :05, 7 AM–9 PM PT |
| `secondBrain` | Every Second Brain row copied out of Notion | `brain-deck-sync`, hourly :20, 7 AM–10 PM PT |
| `backupStatus` | Last backup date, verified flag, doc counts | The cloud weekly-backup writer, Sun 11:00 UTC |
| `taskLease` | Which Mac holds the one-writer lease, and until when | Either Mac's `claude-auto`, on a lease check/take/release |
| `cloudWriteProbe` | Proof that a cloud routine can write the DB unattended | A one-shot probe routine, fired 2026-09-22 |
| `feedFreshness` | Per-feed fresh/late/stale/unknown/missing verdict, 26 feeds | The feed-freshness watchdog, daily 16:12 UTC |
| `isaLadder` | The ISA line's reply-check and escalation state | The ISA escalation-ladder routine, weekdays 14:30 UTC |
| `appleHealth` | Apple Health vitals | Old: `r8-apple-health-snapshot` (writes nothing live — see `always-on/README.md`). New: `health-notion-sync`, spec only |
| `stravaSnapshot` | Latest Strava activity | `strava-daily-sync`, `20 5 * * *` PT — bare-write defect, see above |
| `loftyLeads` / `zohoLeads` / `zohoDeals` | Real-estate / mortgage pipeline | `lofty-crm-sync` / `zoho-crm-sync` skills — both blocked on a credential as of 2026-09-24 |
| `isaKpi` | ISA scorecard actuals | The live Pipeline Sync cloud routine, 04/10/16/22 UTC |
| `realEstateBrief` | Weekly Monday brief | The "Real Estate Weekly Brief" cloud routine — proving run has hung twice, see `always-on/README.md` |
| `strategySnapshot` | QuantVue-style strategy state | Contested by two writers, `r4-quantvue-sync` (refused) and a cloud routine (writes nothing) — see `always-on/README.md` |

Not a complete list — 14 of ~175. For anything else, read `docs/inventory/db-docs.md` for the name
and stamp, then the panel or task that names it.
