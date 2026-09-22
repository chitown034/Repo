# Second Mac — setup runbook

Bringing Mac #2 up to the same brain, in order. Every step has a check and the output it should
print. **Do them in order** and stop at the first check that does not match — a later step will
otherwise hide the failure.

Rules that hold throughout: **no credential value appears in this file, in a prompt, in a task, in a
log or in the deck** — only the file it lives in and the variable's NAME. And Mac #2 finishes as
**STANDBY**: tasks installed and identical, but the `taskLease` keeps them from running — see
`REMOTE-ACCESS.md` → *Primary / standby*.

**What changed on 2026-09-22:** standing by no longer means editing 59 task prompts. The lease check moved
into `claude-auto`, the one launcher every task already goes through, so this Mac becomes a safe standby by
**installing that one script and writing one word into one file** (step 11b). An absent role file already
reads as `standby`, so the failure direction of forgetting is "this Mac does nothing", not "both Macs write".

---

## Level (i) — read the dashboards  (2 minutes, nothing to install)

### 1. Sign in to claude.ai in the browser you will actually use

Use one browser profile per Mac and keep to it: the deck's device identity and its per-device
settings live in that profile's local storage.

**Check:** claude.ai loads signed in as Steven.

### 2. Open both artifacts and pin them

- Command Deck — `https://claude.ai/code/artifact/1624daae-d683-405a-971d-c5828dce0f8d`
- ISA Portal — `https://claude.ai/code/artifact/4348b34d-afa0-4d2e-8214-29b1319cf041`
- Toolbox dashboard — `https://claude.ai/code/artifact/256ccb1b-85af-4f98-97a0-af3478259883`

**Check:** each opens with data already in it. Nothing to install, nothing to import.

### 3. Confirm the sync badge

Top of the Command Deck, the pill next to the title.

**Expect:** `Synced across devices`.
**If it says `Local only (this device)`** the page has no database capability in this browser —
edits will stay on this Mac. Reload once; if it persists, open it outside a private window.
**If it says `Read-only — changes stay on this device`** the artifact's db permission was revoked
for this login. That is a **HALT**: it needs an account change, not a workaround.

### 4. Confirm both Macs appear

Command Deck → **Toolkit & Remote Access** (panel 38) → *Devices attached to this dashboard*.

**Expect:** a row for this Mac marked **this device**, and within a few minutes a second row for
Mac #1. Rename either row to whatever you call that machine; the name syncs to the other Mac.
A row registers at most **once an hour**, so give it that long before calling it missing.

---

## Level (ii) — drive Vanessa from this Mac

### 5. Install Claude Code and log in

```bash
npm install -g @anthropic-ai/claude-code     # or the installer you used on Mac #1
claude --version
claude       # then: /login
```

**Expect:** `claude --version` prints a version; `/login` completes in the browser and `claude`
starts a session without asking again.

### 6. Clone the brain repo

```bash
mkdir -p ~/Projects && git clone https://github.com/chitown034/Repo ~/Projects/second-brain
cd ~/Projects/second-brain && ls CLAUDE.md AGENTS.md wiki always-on REMOTE-ACCESS.md
```

**Expect:** all five names echo back with no `No such file` line.

If you keep the tree inside the vault on Mac #1 (`~/Shearrill-Vault/00-Brain`), mirror that here and
symlink rather than keeping two copies — see `MAC-INSTALL.md` §0.

**Check the router loads:**

```bash
cd ~/Projects/second-brain && claude -p "Which one file answers 'what runs when, and did it run'? Name the file only."
```

**Expect:** `always-on/README.md` — one file, not a list. That proves `CLAUDE.md` is being read.

### 7. Turn on auto-memory

In Claude Code from the project root: `/memory on`.
**Expect:** the session appends to `memory.md` in this repo, not to a new file elsewhere.

### 8. MCP servers — install what this Mac will actually use

Mac #1 has **15 connected** (`toolkitSnapshot`, 2026-09-22 13:15 UTC): `filesystem`, `fetch`,
`memory`, `git`, `perplexity`, `notion-brain`, `openrouter`, `openterminal`, `lofty`, `tradingview`,
`apination`, `apple-health`, `apple-health-xml`, `health-export`, `plugin:ruflo-core:ruflo`.

You do **not** need all of them on Mac #2. Take them in three groups:

| Group | Servers | Install on Mac #2? |
|---|---|---|
| **Needed for any real work** | `filesystem`, `fetch`, `git`, `memory` | **Yes** |
| **Needed to answer like Vanessa** | `perplexity` (research), `notion-brain` (Second Brain), `plugin:ruflo-core:ruflo` (recall) | **Yes** |
| **Tied to Mac #1's data or hardware** | `lofty`, `apple-health`, `apple-health-xml`, `health-export`, `openterminal`, `tradingview`, `apination`, `openrouter` | **Only if this Mac becomes PRIMARY.** They read local daemons, local files or a machine-local key |

`plugin:ruflo-core:ruflo` arrives with the `ruflo-core` plugin, not as a standalone server. For the wider tooling set, `./MAC-SETUP.sh --dry-run` then `./mac-verify.sh` cover it.

```bash
claude mcp list
```

**Expect:** every server you installed prints `connected`. A server listed but not connected is
worse than one absent — it makes the deck advertise a capability this Mac does not have.

### 9. Credential files — by NAME only, never a value

Create each file on **this** Mac by hand, `chmod 600`, and never paste a value into a prompt, a task
definition, a skill, a log or the deck (`integrations/CONNECTIONS.md` rule 5).

| File | Variable NAMES it holds | Needed on Mac #2 |
|---|---|---|
| `~/.config/lofty/.env` | `LOFTY_API_KEY` | Only if this Mac runs `lofty-crm-sync` (i.e. is PRIMARY) |
| `~/.config/omniroute/.env` | `OMNIROUTE_API_KEY`, `OPENROUTER_API_KEY`, `NVIDIA_API_KEY`, `BYTEZ_API_KEY` | Only if you install the OmniRoute **free-provider failover** here. `claude-auto` itself does **not** need this file to hold the lease: with no `.env` the route simply stays `subscription` |
| `~/.config/higgsfield/.env` | `HF_API_KEY_ID`, `HF_API_KEY_SECRET` | Optional; media tooling only |
| macOS Keychain | everything else | As needed |

**Check — no value ever lands in the tree:**

```bash
cd ~/Projects/second-brain
grep -rniE 'api[_-]?key|secret|token|password|bearer ' --include='*.md' . | grep -v 'keychain\|\.env\|never\|NAME'
ls -l ~/.config/*/.env 2>/dev/null
```

**Expect:** the grep prints nothing, and every `.env` listed shows `-rw-------`.

### 10. Skills

The 22 skills in `.claude/skills/` come with the clone and load from the project directory — there
is nothing per-machine to install for those. Anything installed globally on Mac #1 (the personal
`~/.claude/skills`) does **not** travel with the repo.

```bash
ls ~/Projects/second-brain/.claude/skills | wc -l
```

**Expect:** `22`. Then ask a session to name the skills it can see; if one is missing, its
frontmatter will not load on this machine — run the `skills-refresh` audit rather than guessing.

---

## Level (iii) — the scheduled tasks, as STANDBY

### 11. Install claude-runner and the tasks, then leave them blocked

Install `claude-runner` and copy the task set from Mac #1. The `runnerStatus` doc stamped
2026-09-22T04:05:04Z lists **59** tasks and the toolkit snapshot counts **60** — reconcile against
the runner on Mac #1, not against either document. **Do not enable the schedule yet.**

```bash
runnerctl status
scutil --get ComputerName
```

**Expect:** `runnerctl status` lists the tasks; the computer name is **different** from Mac #1's. Two
machines with the same lease id defeats the whole mechanism, and the id is derived from that name unless
you write `~/.config/claude-runner/id` yourself.

### 11b. The lease — one script and one word (this is the whole of it)

Nothing goes into the 59 task prompts. Install the launcher, declare the role, prove it.

```bash
# from the repo clone
cp integrations/omniroute-failover/claude-auto.sh ~/.local/bin/claude-auto
cp integrations/omniroute-failover/probe.sh       ~/.local/bin/probe.sh
chmod +x ~/.local/bin/claude-auto ~/.local/bin/probe.sh

mkdir -p ~/.config/claude-runner
printf 'standby\n' > ~/.config/claude-runner/role     # 'primary' ONLY on the Mac that runs the tasks today

claude-auto --status
claude-auto --lease-check
```

(`./MAC-SETUP.sh --only omniroute` does the two copies for you; the role file is yours to write.)

**Expect:** `--status` prints `lease_role=standby` and `lease_cached=none`. `--lease-check` prints
`verdict=FOREIGN holder=<Mac #1's id>` and exits **0** — that is the standby working.
**If it prints `verdict=INCONCLUSIVE`**, the check could not reach the store: `claude` is not logged in on
this Mac, or the artifact-DB tool is not named `ArtifactData` in this CLI build (override with
`CLAUDE_RUNNER_LEASE_TOOLS`). Do not enable the schedule until it is conclusive — a standby that cannot
prove anything defers every task, which is safe but useless.
**If it prints `verdict=ACQUIRED` while Mac #1 is awake and running tasks**, Mac #1 is not holding the
lease — go and run `claude-auto --lease-check` there first. That is the run that creates the document.

Then point the runner's task wrapper at `~/.local/bin/claude-auto` and make sure **every task passes
`--task <its name>`**: an invocation with no `--task` is not lease-gated, by design (that is what keeps
interactive Vanessa Live working on this Mac — see step 12b). Never put `--no-lease` in a task definition.

### 12. Prove the standby actually stands by

Run any one task by hand on Mac #2 while Mac #1 is awake.

```bash
claude-auto --task r10-automation-health -p 'say hi'; echo "exit $?"
```

**Expect:** stderr says `standby: lease held by <Mac #1's id>`, and `exit 75` — the runner's "retry later",
having written nothing. (The prompt-level block in `REMOTE-ACCESS.md` exits 0 instead; in the launcher it is
75 because that is the code `claude-runner` already understands, and the code the PII gate already uses.)
**If it does the work instead**, this Mac thinks it holds the lease — re-run `claude-auto --lease-check`
here and on Mac #1 before enabling the schedule, or both Macs will double-write `ciLog`, `isaLine` and
every feed document.

### 12b. Prove Vanessa still works here

```bash
claude-auto -p 'name the file that answers "what runs when, and did it run"'
```

**Expect:** it answers — `always-on/README.md`. An invocation with **no `--task`** is deliberately not
lease-gated: a human is present, it is not one of the 59 scheduled writers, and level (ii) of this runbook
depends on it. The residual is honest: a human at this Mac can still write documents by hand. Only the
scheduled tasks are held back.

To make this Mac PRIMARY later, use the one-command promotion in `REMOTE-ACCESS.md` and flip **both** role
files (`primary` here, `standby` there) — the role flip is what makes the switch land on the next task
instead of within the 30-minute decision cache. Do not simply disable the other runner: the lease is what
stops the double write, not the schedule.

---

## The 60-second proof that both Macs see the same data

Do this with both machines open side by side. It tests the real path, not the badge.

1. **Mac A** — Command Deck → *Quick tasks* (or any editable list). Add a row: `sync test <time>`.
2. **Mac A** — the sync pill goes `Syncing…` then `Synced across devices`. If it sticks on
   `Sync pending…`, click the pill once to flush.
3. **Mac B** — wait up to ~30 seconds. The row appears, or the page reloads and then shows it.
   (A remote change refreshes the view at most once every 30 s per tab, by design.)
4. **Mac B** — delete the row. **Mac A** — it disappears within ~30 seconds.
5. **Both** — panel 38 → *Devices*: two rows, each with a recent **Last seen**, one marked
   **this device** on each machine.

**All five true → both Macs are live on the same data.**

If step 3 fails but the badge on both says `Synced across devices`, the two browsers are signed into
**different logins** — check the account menu on each before touching anything else.

**What is still device-local by design, and will not appear on the other Mac:** `deviceId` (that is
the point), `ahLogFilledFor`, `hlAutoTried`, `openTerminalSnapshot` (a live local read, never written
back to the shared store) and `voicePlayed` (per viewer). Everything else syncs — including
`hlPrefs`, the health-lab metric/range/auto choices, which moved to the synced path on 2026-09-22.
