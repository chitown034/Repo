# The Agency — 283 specialist agents as squads under Vanessa

Steven, 2026-11-18: "install https://github.com/msitarzewski/agency-agents.git ... add to ai org chart and put in
respective department to operate under vanessa opus 5.5 as cross functional teams".

[The Agency](https://github.com/msitarzewski/agency-agents) (MIT, commit `8ae6164`) is a library of 283 agent prompt
files in 18 divisions (engineering, marketing, sales, security, design, finance ...). It ships no code that runs on
its own; each file is a Claude Code subagent.

## How it fits the org

Every agent is placed in one department squad, led by that department's executive, all reporting to Vanessa and all
running on Opus 5.5. The full list, squad by squad, is `wiki/ai-team/agency-teams.md`.

| Squad | Lead | Active | Already covered by a seat | Parked |
|---|---|---|---|---|
| Revenue | Victor | 12 | 3 | 2 |
| Marketing | Sofia | 27 | 10 | 18 |
| Executive Office | Vanessa | 18 | 4 | 17 |
| Finance | Marcus | 3 | 5 | 1 |
| Compliance | Alexandra | 0 | 2 | 3 |
| Technology | Derek | 37 | 13 | 31 |
| Security | Elena | 14 | 1 | 2 |
| AI Strategy | Nadia | 6 | 1 | 4 |
| Innovation | Elon | 5 | 0 | 44 |
| **Total** | | **122** | **39** | **122** |

- **Active (122)**: installed on the Mac as `agency-<slug>` subagents. Vanessa (or any session) calls them by name.
- **Already covered (39)**: a seat already does this job (for example The Agency's Chief Financial Officer is Marcus,
  its Code Reviewer is `code-reviewer`, its Real Estate Buyer & Seller is `buyers-agent-elite`, its Legal Document
  Review is Alexandra). Not installed, so
  there are no duplicate seats (the rule from 2026-11-01).
- **Parked (122)**: off-lane for a broker / MLO / Navy program manager: China-market platforms, game engines, GIS,
  healthcare billing, blockchain, payment-executing and law-firm agents and so on. They are on the squad's bench, listed on the wiki page, and installed only
  with `--all`.

The rules (which division goes to which department, the duplicates, the parked list) live in `brain/agency.py`.
`bin/brain agency` checks that `roster.json` and the wiki page match them; `bin/brain agency --refresh <clone>`
rebuilds both from a clone of the repo; `bin/brain org` carries the squad summary to the Command Deck.

## Install (on the Mac)

```sh
bash integrations/agency-agents/install.sh            # the 122 active agents
bash integrations/agency-agents/install.sh --all      # also the 122 parked ones
bash integrations/agency-agents/install.sh status
bash integrations/agency-agents/install.sh uninstall  # removes every agency-*.md, nothing else
```

Each installed file gets `name: agency-<slug>`, `model: opus`, a description cut to 160 characters, and the CLAUDE.md
HALT list in front of the original text. The installer only writes and removes files named `agency-*.md`; your own
agent files are never touched.

**Token cost.** Claude Code loads every installed agent's description into each session: 122 short descriptions are
roughly 6k tokens per session. `--all` roughly doubles that. `uninstall` takes them all out.

## Verified here (cloud sandbox, 2026-11-18) / not verified

- `install.sh` into a throwaway home folder: 122 files written, a pre-existing agent file left untouched (also with a space in the
  home path), every written file parses as YAML; `uninstall` on an empty home exits cleanly; a roster with an
  unsafe name is refused before anything is written; `--refresh` refuses a clone not at `8ae6164`.
- `bin/brain agency`: roster and page current; 8 unit tests in `brain/tests/test_agency.py`.
- **Not verified (Mac only):** Claude Code on the Mac loading the files and Vanessa dispatching one of them.
