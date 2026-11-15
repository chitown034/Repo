# OpenMausBot: the AI org as a team of chat bots

Steven, 2026-11-15: "install https://github.com/milind-soni/OpenMausBot.git and wire my AI org to be structured
within Mausbots".

[OpenMausBot](https://github.com/milind-soni/OpenMausBot) (Apache-2.0, also called MausBot) is a desktop chat app
(macOS, Windows, Ubuntu) where every contact is a real agent: Claude Code running locally on your own sign-in,
with its own standing instructions, model and approval level. Bots live in **teams** (each with one **Chief of
Staff**) and talk in **rooms**. Data stays on the Mac in `~/.openmausbot`.

## How the org maps

`build-team.py` turns `integrations/agent-os/agents.json` into `team.yaml`, the file OpenMausBot's
`openmausbot team apply` reads.

| OpenMausBot | AI org |
|---|---|
| Team **Executive Office**, Chief **Vanessa** (Fable 5.2), manages every other team | Vanessa and the seats that report straight to her |
| Teams **Finance, Marketing, Technology, Compliance, AI Strategy, Revenue, Security, Innovation** | One per executive: Marcus, Sofia, Derek, Alexandra, Nadia, Victor, Elena, Elon (Opus 5.5), each its Chief |
| A bot's team | The department of the executive above it in its reporting line |
| A bot's soul (standing instructions) | Its agent file in `integrations/agent-os/agents/` (CLAUDE.md first, HALT list, gates) |
| Room **Exec council** (Vanessa answers) | Vanessa + the eight executives |
| Room **<Team> room** (the Chief answers) | Everyone in that department |

**The 100-bot limit.** An OpenMausBot workspace holds at most 100 bots (`MAX_WORKSPACE_BOTS`, OpenMausBot
0.1.160), and the org has 185 seats. So 91 seats get bots: all tier-1 seats, all named seats, every seat that
leads others, and the tier-2 seats of Revenue, Executive Office, Marketing and Finance. That leaves 9 slots for
bots you add yourself. The other 94 seats are on their department Chief's **specialist bench**: listed in the
Chief's soul (`souls/<chief>.md`) and dispatched as Claude Code subagents by name. `integrations/agent-os/install-mac.sh`
links all 185 agent files into `~/.claude/agents`, so the subagents are there.

| Team | Bots | On the Chief's bench |
|---|---|---|
| Executive Office | 24 | 1 |
| Revenue | 32 | 2 |
| Marketing | 17 | 3 |
| Finance | 10 | 0 |
| Compliance | 3 | 11 |
| Technology | 2 | 57 (the code-review and engineering specialists) |
| AI Strategy | 1 | 10 |
| Security | 1 | 6 |
| Innovation | 1 | 4 |

## Guardrails (CLAUDE.md HALT list)

Every bot starts on approval **Ask** (each action waits for your yes), with **no computer** and **no browser**.
No key, connector or routine is created; connectors stay off until you approve them in the app. Each team's brief
repeats the rules: nothing sent, paid, signed or written to a client-facing system; first names only; client data
stays on the local model.

## Install (on the Mac)

```sh
bash integrations/openmausbot/install.sh          # the pinned CLI (0.1.160) + the bots' browser engine
# open the OpenMausBot desktop app, or: openmausbot start
bash integrations/openmausbot/install.sh plan     # what would be created (changes nothing)
bash integrations/openmausbot/install.sh apply    # create the org; safe to run again, it only applies changes
```

After a change to the roster (`bin/brain os agents --write`), run `apply` again: it rebuilds `team.yaml` and
updates only what changed. Bots are matched by name; nothing is deleted unless a team is marked `prune: true`.

## Verified here (cloud sandbox, 2026-11-15) / not verified

- `openmausbot` 0.1.160 from npm; `openmausbot serve` on a throwaway data folder: `doctor` ready, engine `claude`.
- First version of the file (185 bots) was refused at bot 101 ("this workspace is limited to 100 bots"), which is
  why the core and benches exist.
- Current `team.yaml`: `--dry-run` plan, then apply: **110 created** (9 teams, 91 bots, 10 rooms), exit 0. Second
  apply with `--check`: **No changes**, exit 0. Vanessa listed as Chief of Executive Office on Fable 5.2; each
  executive as Chief of their team on Opus 5.5; every bot on Ask with computer off.
- **Not verified (Mac only):** the desktop app, the bots answering on your Claude Code sign-in, and
  `claude-fable-5-2` / `claude-opus-5-5` appearing in its model list (`openmausbot models`). If a model is not
  offered there, change `MODELS`/`DEFAULT_MODEL` in `build-team.py` to one it lists and run `plan` again.
