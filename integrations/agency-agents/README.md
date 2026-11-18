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
| Revenue | Victor | 13 | 3 | 1 |
| Marketing | Sofia | 28 | 10 | 17 |
| Executive Office | Vanessa | 19 | 5 | 15 |
| Finance | Marcus | 5 | 4 | 0 |
| Compliance | Alexandra | 2 | 1 | 2 |
| Technology | Derek | 43 | 12 | 26 |
| Security | Elena | 16 | 0 | 1 |
| AI Strategy | Nadia | 6 | 1 | 4 |
| Innovation | Elon | 5 | 0 | 44 |
| **Total** | | **137** | **36** | **110** |

- **Active (137)**: installed on the Mac as `agency-<slug>` subagents. Vanessa (or any session) calls them by name.
- **Already covered (36)**: a seat already does this job (for example The Agency's Chief Financial Officer is Marcus,
  its Code Reviewer is `code-reviewer`, its Real Estate Buyer & Seller is `buyers-agent-elite`). Not installed, so
  there are no duplicate seats (the rule from 2026-11-01).
- **Parked (110)**: off-lane for a broker / MLO / Navy program manager: China-market platforms, game engines, GIS,
  healthcare billing, blockchain and so on. They are on the squad's bench, listed on the wiki page, and installed only
  with `--all`.

The rules (which division goes to which department, the duplicates, the parked list) live in `brain/agency.py`.
`bin/brain agency` checks that `roster.json` and the wiki page match them; `bin/brain agency --refresh <clone>`
rebuilds both from a clone of the repo; `bin/brain org` carries the squad summary to the Command Deck.

## Install (on the Mac)

```sh
bash integrations/agency-agents/install.sh            # the 137 active agents
bash integrations/agency-agents/install.sh --all      # also the 110 parked ones
bash integrations/agency-agents/install.sh status
bash integrations/agency-agents/install.sh uninstall  # removes every agency-*.md, nothing else
```

Each installed file gets `name: agency-<slug>`, `model: opus`, a description cut to 160 characters, and the CLAUDE.md
HALT list in front of the original text. The installer only writes and removes files named `agency-*.md`; your own
agent files are never touched.

**Token cost.** Claude Code loads every installed agent's description into each session: 137 short descriptions are
roughly 6-7k tokens per session. `--all` roughly doubles that. `uninstall` takes them all out.

## Verified here (cloud sandbox, 2026-11-18) / not verified

- `install.sh` into a throwaway home folder: 137 files written, a pre-existing agent file left untouched; `--all`
  wrote 247; running the plain install again removed the 110 parked ones; `status` reported 137 at `8ae6164`.
- `bin/brain agency`: roster and page current; 6 unit tests in `brain/tests/test_agency.py`.
- **Not verified (Mac only):** Claude Code on the Mac loading the files and Vanessa dispatching one of them.
