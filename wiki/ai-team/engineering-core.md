# Engineering Core — harness, graph and loop engineering

Owner: Atlas (Systems Engineer, reports to Elon). Where: Broker Command Center → System → Engineering Core.
Vanessa tool: `engineering_core` (actions: loops, graph, harness, connections).

## Harness

One channel for every AI call in the dashboard. Per call it records page, speed, success or error, output size and
retries. A rate-limited call is retried once after 2.5 s. Each text output is checked, without being changed, for:

| Check | Why |
|---|---|
| Specific rate or APR quoted | No rate claims outside a Loan Estimate |
| Guarantee of approval, rate, sale or price | No approval or outcome promises |
| Possible fair-housing language | Fair Housing Act and FEHA steering terms |
| Referral fee or thing of value for referrals | RESPA §8 |
| Outbound draft without DRE/NMLS | License disclosure on outbound drafts |

Daily budget of 300 calls (warning only). A 12-case self-test runs on load and from the page.

## Graph

Nodes: people, deals, loans, partners, open tasks, AI seats, 411 areas. Edges: client, borrower, referred, about,
owner, wants, managed by. Broken links become owned tasks (max 15 a day):

- open client with no next step → Bennett
- buyer without a loan file (and not cash) → Isabel
- under contract with no deal record → Carmen
- open escrow with no open tasks → Carmen
- partner not touched in 60+ days → Riley

## Loops

| Loop | Target | Owner | Bounded adjustment at L2+ |
|---|---|---|---|
| Speed to lead | ≥ 90% same-day first touch | Bennett | autopilot every 30 min instead of 60 |
| Follow-up standard | ≥ 85% SLA score | Aria | Power Hour list 35 instead of 25 |
| Overdue backlog | ≤ 5 tasks | Juliet | stale-work digest every 6 h instead of 12 |
| Self-heal backlog | ≤ 3 open | Nova | health re-check every 30 min |
| ISA draft approval rate | ≥ 70% | Sienna | proposal only |
| Power Hour conversion | ≥ 10% booked | Bennett | proposal only |
| Command Deck freshness | ≤ 36 h | Quincy | deck snapshot every 15 min |
| AI harness health | ≤ 10% failed or flagged | Atlas | proposal only |
| Graph integrity | ≤ 5 broken links | Atlas | proposal only |
| Setup completion | ≥ 90% | Quincy | proposal only |

Trust: L1 proposes only. 7 met days in a row earn L2 (one bounded adjustment, tested 7 days, promoted if the metric
beat its 7-day baseline, otherwise reverted). 14 days earn L3. Every adjustment and verdict is logged on the page and
in the Command Deck metrics. A loop with no data shows "no data yet", never a made-up value.
