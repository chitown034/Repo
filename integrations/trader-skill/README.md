# The Trader skill pack (installed 2026-11-23)

Source: https://github.com/Jakeschincariol/trader-skill (MIT, LICENSE here), pinned at commit `5189e79` (v1.0,
2026-10-14). Steven, 2026-11-23: "install this skill". The 11 skills live in `.claude/skills/trader-*` and reach the
Mac with the normal brain sync. Their own test suite (175 tests, offline fixtures) passed at the pinned commit before
install.

| Skill | Job | Network it reads |
|---|---|---|
| trader-copycat | rebuild an investor's portfolio from their 13F | SEC EDGAR, OpenFIGI |
| trader-news | headlines and 8-Ks for held stocks | news feeds, SEC |
| trader-budget | size positions to a budget, cash buffer, cap | none |
| trader-pelosi | House members' trade disclosures (PTRs) | House Clerk (needs `pdftotext`) |
| trader-analyst | reported numbers from SEC XBRL | SEC |
| trader-screener | screen against your own rules | none |
| trader-risk | block any order over your limits | none |
| trader-broker | render an approved order as a ticket and record the yes | none — never places orders |
| trader-tax | lots, gains/losses, harvesting, wash sales | none |
| trader-alerts | price targets, stops, the NYSE calendar | Yahoo Finance, Stooq |
| trader-rebalance | back to target weights past a drift band | none |

**Seats.** James (wealth) owns the equity side, with Apex for trading discipline, both under Vanessa. Marcus sees
anything touching the net-worth numbers.

**Guardrails (CLAUDE.md HALT).** Paper only. No brokerage connector (Alpaca, IBKR) is connected by an agent or from a
cloud session; connecting one, entering keys, or going live is Steven's own act on his Mac. `trader-broker` carries a
standing-rules block saying so, and no scheduled task calls it. Nothing here is investment advice.

**Before first use (Steven).** SEC asks each script to identify itself: put your own name and e-mail in
`trader/config.json` (`"sec_user_agent": "Name email"`) or the `SEC_USER_AGENT` environment variable on the Mac. The
skills write their working files to a `trader/` folder in the project where they run. `trader-pelosi` needs
`pdftotext` (Homebrew `poppler`).
