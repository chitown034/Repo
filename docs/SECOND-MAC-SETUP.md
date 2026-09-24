# Both Macs — setup runbook

*Corrected 2026-09-24 (R6):* this file used to bring a second Mac up as a permanent, lease-blocked
**standby** — install everything, then leave it unable to run a single task, forever, unless Steven
performed a manual "promotion." That was never what he asked for. His words, verbatim: **"Ensure both of
my MacBooks can access the same information and equally have control of this dashboard setup
infrastructure."** Two equal Macs, not one primary and one permanent spare. This file now ends with both
Macs on the **same role** (`peer`), the **same schedule enabled**, and a proof that either one can take
over from the other — not with one of them parked.

Bringing a Mac up to the same brain, in order. Every step has a check and the output it should
print. **Do them in order** and stop at the first check that does not match — a later step will
otherwise hide the failure. Run this file on **both** Macs; nothing in it is "do this only on Mac #1."

Rules that hold throughout: **no credential value appears in this file, in a prompt, in a task, in a
log or in the deck** — only the file it lives in and the variable's NAME.

**What changed on 2026-09-22, and again on 2026-09-24:** standing by no longer means editing 59 task
prompts (2026-09-22 — the lease check moved into `claude-auto`, the one launcher every task already goes
through). And a second Mac no longer means *standing by* at all (2026-09-24) — it means running the **same**
role, `peer`, as the first one. Installing one script and writing one word — the **same** word on both
Macs — is the whole of what makes two equal Macs safe.

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
the other Mac. Rename either row to whatever you call that machine; the name syncs to the other Mac.
A row registers at most **once an hour**, so give it that long before calling it missing.

---

## Level (ii) — drive Vanessa from this Mac

### 5. Install Claude Code and log in

```bash
npm install -g @anthropic-ai/claude-code     # or the installer you used on the other Mac
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

If you keep the tree inside the vault on the other Mac (`~/Shearrill-Vault/00-Brain`), mirror that here and
symlink rather than keeping two copies — see `MAC-INSTALL.md` §0, and *Your vault on both Macs* (step 6b)
right below, which is a related but **separate** question: this step is about the git repo; that one is
about `~/Shearrill-Vault` itself, which is not a git repo Steven wants synced the same way (see why below).

**Check the router loads:**

```bash
cd ~/Projects/second-brain && claude -p "Which one file answers 'what runs when, and did it run'? Name the file only."
```

**Expect:** `always-on/README.md` — one file, not a list. That proves `CLAUDE.md` is being read.

### 6b. Your vault on both Macs — a decision, and one option costs money

`~/Shearrill-Vault` holds `00-Brain` (the repo, if you chose option A in `MAC-INSTALL.md` §0), the Jarvis
index source, and everything `steve-twin-sweep` writes. **No document before this one said how it reaches a
second Mac** — `MAC-INSTALL.md` §0 describes it on one Mac only. It matters even if you chose option B (a
plain clone at `~/Projects/second-brain`, symlinked in): the vault still exists, still holds Jarvis's index
and the twin's output, and those still need to agree between your two Macs the same way the repo does.

Three ways, and the choice is **yours** — it is not this runbook's to make, because one of them is not free:

| Way | Cost | What it is |
|---|---|---|
| **iCloud Drive** | Free | Put the vault folder where iCloud Drive syncs it; Apple's own sync, Obsidian reads a folder like any other |
| **Obsidian Sync** | **Paid** (Obsidian's own subscription) | Versioned, end-to-end encrypted, built for exactly this — the "just works" option, at a monthly cost |
| **Git** | Free | Works, but conflict-prone for prose notes (no line-based diff reads like one), and manual — you `pull`/`push` it yourself |

**If you pick iCloud Drive**, the exact move:
```bash
mkdir -p "$HOME/Library/Mobile Documents/com~apple~CloudDocs/Shearrill-Vault"
# with the vault NOT open in Obsidian and no task running against it:
rsync -av --remove-source-files "$HOME/Shearrill-Vault/" \
  "$HOME/Library/Mobile Documents/com~apple~CloudDocs/Shearrill-Vault/"
find "$HOME/Shearrill-Vault" -type d -empty -delete
ln -s "$HOME/Library/Mobile Documents/com~apple~CloudDocs/Shearrill-Vault" "$HOME/Shearrill-Vault"
```
Then, on the **other** Mac, once the folder has synced down through iCloud (check the Files app or Finder —
iCloud, not this Mac's local disk): `ln -s "$HOME/Library/Mobile Documents/com~apple~CloudDocs/Shearrill-Vault" "$HOME/Shearrill-Vault"`
there too, so both Macs open the **same** symlink name and Obsidian never notices the difference.

**If you pick Obsidian Sync:** turn it on in Obsidian's own Settings → Sync on this Mac, sign in on the
other Mac's Obsidian, and choose "Connect to existing vault" there rather than creating a second one.
Nothing on the filesystem needs to move for this option.

**Never put this repo's `.git` inside an iCloud-synced folder — that is a different question from the vault,
and the answer is no.** iCloud syncs file-by-file, mid-write, with no notion of git's object store as a
single atomic unit; a `.git` directory caught mid-sync is a well-documented way to corrupt a repository, and
recovering from it is worse than not doing it. Keep the repo at `~/Projects/second-brain` (a plain clone,
**not** inside iCloud Drive) and symlink it into the vault if you want Obsidian to see it — exactly what
`MAC-INSTALL.md` §0 option B already sets up, and exactly why option B, not option A, is the default this
runbook assumes. If the vault itself (not the repo) is ever made a git repo for some other reason, the same
warning applies to it too, and `mac-sync.sh status`/`diff` will flag `icloud+git` together for exactly this
reason — see `integrations/mac-sync/README.md`.

**Check:** `mac-sync.sh status` (from the repo, once you have reached step 11 below) reports this Mac's
`vault sync` method, and `mac-sync.sh diff` flags it if the two Macs' methods do not match.

**Needs Steven:** pick one of the three ways above — this runbook installs nothing for the vault on its
own, on purpose; it is a data-location decision, not a script's to make.

### 7. Turn on auto-memory

In Claude Code from the project root: `/memory on`.
**Expect:** the session appends to `memory.md` in this repo, not to a new file elsewhere.

### 8. MCP servers — install what this Mac will actually use

The first Mac has **15 connected** (`toolkitSnapshot`, 2026-09-22 13:15 UTC): `filesystem`, `fetch`,
`memory`, `git`, `perplexity`, `notion-brain`, `openrouter`, `openterminal`, `lofty`, `tradingview`,
`apination`, `apple-health`, `apple-health-xml`, `health-export`, `plugin:ruflo-core:ruflo`.

You do **not** need all of them on a second Mac. Take them in three groups:

| Group | Servers | Install here too? |
|---|---|---|
| **Needed for any real work** | `filesystem`, `fetch`, `git`, `memory` | **Yes** |
| **Needed to answer like Vanessa** | `perplexity` (research), `notion-brain` (Second Brain), `plugin:ruflo-core:ruflo` (recall) | **Yes** |
| **Tied to the first Mac's data or hardware** | `lofty`, `apple-health`, `apple-health-xml`, `health-export`, `openterminal`, `tradingview`, `apination`, `openrouter` | Only if this Mac will read those same local daemons, local files or a machine-local key. **Equal control does not mean identical hardware** — a Mac without the Apple Watch nearby still cannot be the one reading Health data, whatever its lease role says |

`plugin:ruflo-core:ruflo` arrives with the `ruflo-core` plugin, not as a standalone server. For the wider tooling set, `./MAC-SETUP.sh --dry-run` then `./mac-verify.sh` cover it.

```bash
claude mcp list
```

**Expect:** every server you installed prints `connected`. A server listed but not connected is
worse than one absent — it makes the deck advertise a capability this Mac does not have.

### 9. Credential files — by NAME only, never a value

Create each file on **this** Mac by hand, `chmod 600`, and never paste a value into a prompt, a task
definition, a skill, a log or the deck (`integrations/CONNECTIONS.md` rule 5).

| File | Variable NAMES it holds | Needed here |
|---|---|---|
| `~/.config/lofty/.env` | `LOFTY_API_KEY` | Only if this Mac runs `lofty-crm-sync` (see the hardware note in step 8 — this is now about which Mac happens to run that task at a given moment, not a fixed role) |
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
is nothing per-machine to install for those. Anything installed globally on the other Mac (the personal
`~/.claude/skills`) does **not** travel with the repo — `mac-sync.sh status`/`diff` (step 11) is how you
see that drift, since those are exactly the globally-installed skills that can differ between your two Macs.

```bash
ls ~/Projects/second-brain/.claude/skills | wc -l
```

**Expect:** `22`. Then ask a session to name the skills it can see; if one is missing, its
frontmatter will not load on this machine — run the `skills-refresh` audit rather than guessing.

---

## Level (iii) — the scheduled tasks, as an EQUAL peer

### 11. Install claude-runner and the tasks — on both Macs, not just one

Install `claude-runner` and copy the task set from the Mac that already has it (or build it fresh if
neither does yet). The `runnerStatus` doc stamped 2026-09-22T04:05:04Z lists **59** tasks and the toolkit
snapshot counts **60** — reconcile against the runner that already has them, not against either document.

```bash
runnerctl status
scutil --get ComputerName
```

**Expect:** `runnerctl status` lists the tasks; the computer name is **different** from your other Mac's.
Two machines with the same lease id defeats the whole mechanism, and the id is derived from that name unless
you write `~/.config/claude-runner/id` yourself.

### 11b. The lease — one script and one word, the SAME word on both Macs

Nothing goes into the 59 task prompts. Install the launcher, declare the role, prove it.

```bash
# from the repo clone
cp integrations/omniroute-failover/claude-auto.sh ~/.local/bin/claude-auto
cp integrations/omniroute-failover/probe.sh       ~/.local/bin/probe.sh
chmod +x ~/.local/bin/claude-auto ~/.local/bin/probe.sh

mkdir -p ~/.config/claude-runner
printf 'peer\n' > ~/.config/claude-runner/role     # the SAME word on the OTHER Mac too — not 'primary'/'standby'

claude-auto --status
claude-auto --lease-check
```

(`./MAC-SETUP.sh --only omniroute` does the two copies and the role file for you. It writes `peer` when no
role file exists, and **never overwrites one that already exists** — so a Mac still on the old `primary`/
`standby` pair from before 2026-09-24 keeps working exactly as before until you change it yourself:
`printf 'peer\n' > ~/.config/claude-runner/role` is the entire migration, on either Mac, any time.)

**Expect on whichever Mac checks first:** `--status` prints `lease_role=peer` and `lease_cached=none`.
`--lease-check` prints `verdict=ACQUIRED` and exits **0** — this is the run that **creates**
`state/taskLease`. It must be a Mac that does it, never the cloud.
**Expect on the second Mac to check:** `verdict=FOREIGN holder=<the first Mac's id>` and exits **0** — that
is correct, not a failure: the lease now has a holder, and this Mac is not it, yet.
**If either prints `verdict=INCONCLUSIVE`**, the check could not reach the store: `claude` is not logged in
on this Mac, or the artifact-DB tool is not named `ArtifactData` in this CLI build (override with
`CLAUDE_RUNNER_LEASE_TOOLS`). Do not enable the schedule until it is conclusive.

Then point the runner's task wrapper at `~/.local/bin/claude-auto` and make sure **every task passes
`--task <its name>`**: an invocation with no `--task` is not lease-gated, by design (that is what keeps
interactive Vanessa Live working on this Mac — see step 12b). Never put `--no-lease` in a task definition.
**Enable the schedule on this Mac now** — that is the point of `peer`. It does not need to wait for the
other Mac, and it does not need "promoting" first.

### 12. Prove the lease actually does its job — run this on BOTH Macs, back to back

While **both** Macs are awake:

```bash
claude-auto --task r10-automation-health -p 'say hi'; echo "exit $?"
```

**Expect:** on the Mac that does **not** currently hold the lease, stderr says `standby: lease held by <the
other Mac's id>`, and `exit 75` — the runner's "retry later," having written nothing. (The prompt-level
block in `REMOTE-ACCESS.md` exits 0 instead; in the launcher it is 75 because that is the code
`claude-runner` already understands.) On the Mac that **does** hold it, the task runs and exits 0. Both are
correct — `peer` means whichever Mac holds the lease writes, not that both refuse or both write.
**If both exit 75 or both write**, something is wrong: run `claude-auto --lease-check` on each and compare
`holder=` — they must agree on exactly one machine, or the lease document has not settled yet (give it a
few seconds and re-check).

### 12a. Prove either Mac can take over — the failover this whole file exists for

On the Mac that does **not** currently hold the lease:

```bash
claude-auto --take-lease
```

**Expect:** one line, `claude-auto: TOOK the lease — holder=<this Mac's id> expires=<...>`. Immediately
re-run the step-12 command **on the Mac that used to hold it** — it now gets `exit 75`, and on **this** Mac
the same command now runs and exits 0. No role file was touched. Nothing was "promoted." The lease simply
moved, because you told it to.

Hand it back the same way, from either Mac:

```bash
claude-auto --release-lease
```

**Expect:** `claude-auto: RELEASED the lease — it is free as of <...>`. The next `claude-auto --lease-check`
on **either** Mac now returns `verdict=ACQUIRED` — the lease is free, and whichever Mac checks (or runs a
task) next becomes the new holder. That is sticky leadership: it follows whoever actually did the work most
recently, not a file either of you have to remember to flip.

**This is the proof "both Macs equally have control" actually asked for.** Level (iii) is not complete
until you have run this step for real, on both Macs, and watched the lease move both ways.

### 12b. Prove Vanessa still works here, on both Macs, regardless of who holds the lease

```bash
claude-auto -p 'name the file that answers "what runs when, and did it run"'
```

**Expect:** it answers — `always-on/README.md`. An invocation with **no `--task`** is deliberately not
lease-gated on any role: a human is present, it is not one of the 59 scheduled writers, and this is what
lets both Macs drive Vanessa interactively regardless of which one currently holds the task lease.

### 13. mac-sync.sh — the "same information" half

The lease (steps 11b–12a) is "equal control." This is "same information": a one-screen parity report, a
safe way to keep the repo current, and names-only manifests either Mac can compare against the other's.

```bash
integrations/mac-sync/mac-sync.sh status     # repo/role/lease/vault/counts, all on one screen
integrations/mac-sync/mac-sync.sh pull       # git pull --rebase --autostash; refuses on a real conflict, says why
integrations/mac-sync/mac-sync.sh export     # writes mac-config/<this Mac's id>/ — names only, commits locally
integrations/mac-sync/mac-sync.sh diff       # what THIS Mac lacks, vs the other Mac's last export
```

**Expect:** `status` prints cleanly with no error; run `export` on one Mac, `pull` then `diff` on the other,
and `diff` reports either `no gaps found` or a specific, named list of what to go install. Full reference,
including the two LaunchAgent templates that run `pull` every 30 minutes and `export` daily on their own:
`integrations/mac-sync/README.md`.

**Runner task *definitions* (prompts), not just names — read this before assuming a script can copy them.**
This repo does not document where `claude-runner` stores a task's prompt, only its CLI surface — so
`mac-sync.sh export` deliberately never touches one, and there is no safe scripted way to copy one either.
The exact manual steps, and why: `integrations/mac-sync/README.md` → *Runner task definitions*.

---

## The 60-second proof that both Macs see the same DASHBOARD data

This is a **different** kind of "same information" from step 13 — that one is config (MCP servers,
skills, `.env` names); this one is the live artifact database both Macs' browsers read. Do this with both
machines open side by side. It tests the real path, not the badge.

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
