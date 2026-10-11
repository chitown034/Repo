# Setup health

Run 2026-10-11T20:39:23Z by `bash scripts/setup-health.sh --write`. Offline checks only: green here means the code and docs hold together, **not** that anything runs on Steven's Macs, the Alienware, or the live dashboards.

| Check | Result | Time | Last line |
|---|---|---|---|
| brain doctor | PASS | 1s | doctor: PASS |
| brain unit tests | PASS | 1s | Ran 66 tests in 1.467s |
| brain loop (no regression) | PASS | 3s |  |
| scout tests | PASS | 0s | Ran 6 tests in 0.015s |
| trading desk tests (paper only) | PASS | 6s | Ran 85 tests in 5.681s |
| trading desk selftest | PASS | 0s | SELFTEST RESULT: PASS |
| events scout tests | PASS | 0s | Ran 34 tests in 0.013s |
| loan pricing tests | PASS | 0s | Ran 14 tests in 0.001s |
| anydesk link tests | PASS | 0s | Ran 17 tests in 0.016s |
| alienware script lint | PASS | 0s | lint-ps1: integrations/alienware/alienware-setup.ps1: clean |
| alienware docs/secret checks | PASS | 0s | RESULT: all checks pass |
| bash syntax install-mac.sh | PASS | 0s |  |
| bash syntax install.sh | PASS | 0s |  |
| bash syntax claude-auto.sh | PASS | 0s |  |
| bash syntax install-failover.sh | PASS | 0s |  |
| failover tests (265 checks) | PASS | 35s | pass 265   FAIL 0 |
| lease tests (156 checks) | PASS | 39s | pass 156   FAIL 0 |
| dashboard: action desk runtime | PASS | 0s |  |
| dashboard: ISA portal runtime | PASS | 0s |  |

## Only Steven can finish (see docs/STEVEN-STEPS.md, steps 24-32)

- Say "publish the deck" and approve: the live Command Deck, ISA Portal, Action Desk and 2nd Brain 4D are not yet updated.
- Run the Mac installers (browser hands, skill packs, failover, mods) and the Alienware PowerShell script; paste back the status lines.
- Accounts, keys and spend: ARIVE, Zoho API permission, Apify, vidIQ, OpenRouter, AnyDesk passwords, the Ultimate Web Scraper connector. All HALT items.
- First real run of the events scout (36 sources) and real price data for the trading desk.
