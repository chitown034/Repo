# Remote access — every live path

How Steven reaches the brain, and how the brain reaches him, from anywhere, on **either Mac**. Each
row says what it can actually do: "connected" and "can write" are not the same thing.

## The paths

| Path | What it is | Can it write? |
|---|---|---|
| **Vanessa Live** | A Claude Code session on a Mac with **Remote Control**, driven from claude.ai or the phone app. Full tool access, as that Mac | **Yes** — full, as Steven's machine |
| **Command Deck** | The published artifact, on any device with his login | Yes, interactively (a human is present to approve) |
| **iMessage** | `+1 650-484-9720`, via Inkbox. `vanessa-imessage-inbox` polls every 10 min; `voice-reply-render` renders replies in-persona | Reads and replies; queues work |
| **Discord `#vanessa`** | Via the local bot + Inkbox. `vanessa-discord-inbox` every 5 min | Reads and replies |
| **WhatsApp** | **Steven's own number** in the WhatsApp desktop app on the Mac, read by `whatsapp-cli` in his **Message Yourself** thread; `vanessa-whatsapp-inbox` every 10 min. **Spec only — §5a written 2026-09-23, install pending, not live.** Decided 2026-09-23 over a dedicated number, with the Full Disk Access cost accepted (`context/decisions.md`) | Will read and reply once installed; needs that Mac unlocked and a GUI session to send |
| **Cloud routines** | `claude.ai/code/routines` — **57 total, 53 enabled** (counted 2026-09-23) | **Yes, unattended — proven 2026-09-22** (below). No MCP connectors when an agent creates the routine |
| **Local Bridge queue** | `localBridgeQueue` doc → `local-bridge-queue` task (hourly :25, 6 AM–9 PM PT) → `~/Applications/local-bridge/run.sh` | **Read-only verbs**, enforced by an allow-list |
| **Research queue** | `vanessaResearch` doc → `vanessa-research-queue` (hourly :30, 7:30 AM–9:30 PM PT) | Writes answers back to the doc |
| **Push / text** | `vanessa-significant-alerts` (11 AM, 3 PM, 7 PM PT) and the morning text | Outbound only |

## Which path for which job

- **"Answer me"** → iMessage or Discord. Cheapest, already running.
- **"Look something up I cannot see"** → Local Bridge queue (read-only) or the research queue.
- **"Do something on a Mac"** → **Vanessa Live.** The only path with real write access to files.
- **"Run this while I sleep"** → a **cloud routine** if it needs only the web and the artifact DB; a
  `claude-runner` task on the PRIMARY Mac if it needs a local file, a local model, DuckDB, a logged-in desktop app, the Keychain, or an MCP connector.

## The correction — cloud routines CAN write the artifact DB

This file used to say, under "Honest limits": *"Cloud routines cannot write to the artifact DB
unattended. Anything that must persist runs on the Mac."* **That line was wrong**, and it is why
~50 feeds were pinned to one laptop. It was true when written (last tested 2026-09-04) and was never re-tested after Claude Code 2.1.277 (2026-09-18) changed the behaviour. A one-shot probe routine fired at **09:05 UTC on 2026-09-22** with nobody present and left the `cloudWriteProbe` document in the Command Deck store — version 1, `updatedAt 2026-09-22T09:05:56Z`, `result: "write succeeded unattended"`. It did not exist before that firing; re-read from the store 2026-09-22. Write-up: `docs/CLOUD-WRITE-ARCHITECTURE.md`.

**What did not change: the credential path.** A routine an agent creates stores **no MCP connectors**. Zoho, Lofty, Gmail, Calendar, Strava, Notion and Inkbox still run where those credentials live — on a Mac, or in a routine Steven creates in the web interface himself.

## Both Macs — what the second machine needs

Both are private claude.ai artifacts, so any device on Steven's login opens them and sees the same data. Reading is already solved; nothing to install. Three levels:

| Level | What Mac #2 needs | Proof it worked |
|---|---|---|
| **(i) Read the dashboards** | The claude.ai login. Nothing else | The sync badge reads **"Synced across devices"**, and the **Devices** card in Toolkit & Remote Access (panel 38) lists both Macs |
| **(ii) Drive Vanessa** | Claude Code installed and `/login`-ed · a clone of this repo · the MCP servers the work needs (15 configured on Mac #1) · the `~/.config/**/.env` files, by variable name only | `claude mcp list` shows them connected; one routing-table question opens exactly one leaf file |
| **(iii) Run the scheduled tasks — on BOTH Macs** | Everything in (ii), plus `claude-runner` with the 59 tasks, the `claude-auto` launcher, and **one line in `~/.config/claude-runner/role`: `peer`** on both machines — see the lease below | `runnerctl status` lists the tasks on both; whichever Mac does **not** currently hold the lease exits **75** on a manual run with `standby: lease held by <other Mac>` and writes nothing; `claude-auto --take-lease` / `--release-lease` move the lease between them on demand, no waiting |

*Corrected 2026-09-24 (R6):* level (iii) used to mean "install the tasks and leave them lease-blocked
forever on one Mac." **Goal now: two equal Macs — both run the schedule, both can take over.** Level (iii) is
complete only once **both** Macs are `peer`, both have the schedule enabled, and a failover has actually been
proved — the runbook in `docs/SECOND-MAC-SETUP.md` ends on exactly that proof.

**The "same information" half** — repo parity, role, lease verdict, and counts of MCP servers, plugins,
skills and runner tasks, on one screen — is `integrations/mac-sync/mac-sync.sh status`. `pull`/`export`/`diff`
keep the two Macs' config in sync without ever committing a secret or a task prompt. Full reference:
`integrations/mac-sync/README.md`. Your vault (`~/Shearrill-Vault`) is a separate question from the git repo —
see `docs/SECOND-MAC-SETUP.md` -> *Your vault on both Macs*.

Step by step: `docs/SECOND-MAC-SETUP.md`.

## Primary / standby — one writer, enforced

*Corrected 2026-09-24 (R6):* this section used to make PRIMARY a fixed, human-assigned role — one Mac
permanently trusted to keep working when the check can't complete, the other permanently not. Steven's
words were **"both of my MacBooks... equally have control of this dashboard setup infrastructure"**, and a
fixed primary is not equal control, it is a favourite with a name. Both Macs now run the role **`peer`**:
symmetric, no permanently-favoured machine. The fix is **sticky leadership, not an open or closed default** —
whichever Mac most recently, provably held the lease keeps working through a blip *of its own*, and the other
Mac, which was not holding it, still defers on a blip of its own. `primary` and `standby` keep working exactly
as documented below, as **legacy values** nothing that reads them today has to change for — the installer
just no longer writes either one.

Two Macs running the same 59 tasks would double-write the same documents: duplicate `ciLog` rows, `isaLine`
messages sent twice, churn on `sectionEdits` (already at version 3104). Make it a lease, not a convention.

Lease document: `taskLease` in the Command Deck store (`1624daae-d683-405a-971d-c5828dce0f8d`), `{v:{holder, hostname, acquiredAt, expiresAt}}` — **unchanged shape**, peer included. `holder` is a short stable id per machine; `hostname` is `scutil --get ComputerName`, for humans. TTL **90 minutes**. The first real run on a Mac creates it; never seed it from the cloud.

**Where the check actually runs, since 2026-09-22: in the launcher, not in 59 prompts.** This file used to say "put this at the top of every task prompt". That was correct and it was never going to happen — editing 59 live task prompts is a HALT an agent cannot perform and a chore that does not finish, so Mac #2 stayed off. `integrations/omniroute-failover/claude-auto.sh` is already the one launcher in front of every `claude-runner` task: it already takes `--task NAME`, already decides whether a task may run, and already defers with exit 75. The same five steps — same document, same TTL, same `if_version` pin, same step-4 re-read — run there, once, for every task, on **either** Mac. **Steven's whole remaining job per Mac is one line in a file, and it is the SAME line on both:**

```bash
mkdir -p ~/.config/claude-runner && printf 'peer\n' > ~/.config/claude-runner/role   # the SAME word on both Macs
claude-auto --lease-check                                                            # prove it, on each Mac
```

**Already on `primary` or `standby`? One line changes it — R6, 2026-09-24:**
```bash
printf 'peer\n' > ~/.config/claude-runner/role
```
That is the whole migration. The lease document, the decision cache and everything else about the mechanism
are unchanged; `peer` just reads the same `taskLease` the old roles did. `mac-verify.sh` reports the new word
as an ordinary role, not a problem.

Absent or unreadable, the role reads as **standby** — the safe direction for a freshly imaged Mac. The role decides one thing only: what happens when the check itself cannot complete. It never overrides a conclusive answer (`HELD`/`ACQUIRED`/`FOREIGN`/`RACE` behave identically on every role):
- **`peer`** (both Macs) is **sticky**: fails OPEN only if *this* Mac held the lease at *its own* last real check and that lease has not yet expired; otherwise fails CLOSED, same as standby. Leadership follows the lease, not a file — there is no permanent primary. Exact rule and why: `integrations/omniroute-failover/README.md` → *Peer — sticky leadership*.
- **`primary`** (legacy) fails OPEN unconditionally — a blip must never stop all the automation; the 90-minute TTL exists so it can work through one.
- **`standby`** (legacy, and the default for an absent role file) fails CLOSED unconditionally — a standby that guesses is the double-write this prevents.

A live foreign lease defers on **every** role. The decision is cached for 30 minutes, so the real check costs about 48 `claude -p` turns a day rather than one per task invocation (733 of those a day across the 59 crons). Mechanism, precedence against the PII gate, and the executed tests: `integrations/omniroute-failover/README.md` → *The task lease*.

**Explicit control, no waiting on a check, from either Mac — R6, 2026-09-24:**
```bash
claude-auto --take-lease       # immediate takeover: writes with NO if_version, reads it back, busts this Mac's cache
claude-auto --release-lease    # hand back now: expiresAt = now, pinned, only if this Mac holds it; busts the cache
```
Both print one clear line (`TOOK the lease — holder=… expires=…` / `RELEASED the lease — it is free as of …`).
This is the one-command version of the manual promotion prompt below, for any Mac running `claude-auto`.

**Per-Mac status, both Macs, every conclusive check — R6, 2026-09-24.** `claude-auto` also writes this Mac's
own `macHeartbeat.<machineId>` document in the same turn as the lease check: role, verdict, lease holder and
expiry, `claudeAutoVersion`, a runner task count when `runnerctl` is on `PATH`, repo branch/behind/ahead when
`CLAUDE_RUNNER_REPO_DIR` is set. Best effort — it can never block or fail the task it rides along with. Shape
and what is null and why: `integrations/omniroute-failover/README.md` → *The per-Mac heartbeat*. For the
"same information" half — repo parity, MCP/plugin/skill/runner-task counts, `.env` variable names, all on one
screen for either Mac — see `integrations/mac-sync/mac-sync.sh status` (`integrations/mac-sync/README.md`).

**The block below stays the fallback** for any writer that does **not** go through `claude-auto` — a cloud routine, a hand-run Claude Code session, a future task runner. Paste it at the top of that writer's prompt, before any work:

```
LEASE CHECK — first, and do nothing else if it fails.  MY_ID = "<this Mac's id>"  # different on each Mac
1. ArtifactData get state/taskLease on artifact 1624daae-d683-405a-971d-c5828dce0f8d.
2. If it exists AND v.holder != MY_ID AND v.expiresAt > now(UTC):
      print "standby: lease held by " + v.holder; EXIT 0, write nothing. (Success, not failure.)
3. Else acquire/renew: ArtifactData set state/taskLease
      data = {"v":{"holder":MY_ID,"hostname":"<scutil --get ComputerName>",
                   "acquiredAt":"<now ISO-8601 Z>","expiresAt":"<now+90min ISO-8601 Z>"}}
      if_version = <the version from step 1>    # omit ONLY if the document did not exist
   A refused write means the other Mac moved first -> EXIT 0, write nothing.
4. Re-read state/taskLease. If v.holder != MY_ID -> EXIT 0.  # both-created-it-at-once race
5. Only now do the task's real work.
```

The `if_version` pin is what makes this a lease and not a hope: a write pinned to a version that has already moved is refused and writes nothing; step 4 covers the one case a pin cannot. The launcher's gate is the same five steps and preserves both semantics. **Promote the standby — one command,** pasted into Claude Code on the Mac taking over (unchanged, and it still works on its own — this is exactly what `claude-auto --take-lease` now automates for a Mac that has the launcher):

```
Take the task lease: ArtifactData set state/taskLease on artifact 1624daae-d683-405a-971d-c5828dce0f8d to
{"v":{"holder":"<this Mac's id>","hostname":"<scutil --get ComputerName>","acquiredAt":"<now Z>","expiresAt":"<now+90m Z>"}}
with no if_version, then read it back and show me the holder.
```

The old primary's next run reads a lease it does not hold and exits quietly. Nothing to turn off, nothing double-writes in between; hand back by running the same line on the other Mac, or `claude-auto --release-lease` there.

**On `peer`, the role file itself never needs to flip** — both Macs stay `peer` permanently; only the lease document moves, via `--take-lease`/`--release-lease` or the prompt above, and either one busts the local decision cache immediately (no 30-minute wait). The paragraph below is for the **legacy** `primary`/`standby` pair only, where the role file *is* the thing that flips:

```bash
printf 'primary\n' > ~/.config/claude-runner/role    # legacy only — on the Mac taking over
printf 'standby\n' > ~/.config/claude-runner/role    # legacy only — on the Mac handing over
```

Skip it and both legacy Macs still converge, but for up to 30 minutes the old primary can keep running on a cached decision — a bounded overlap, not a silent one: `claude-auto --status` shows the cached verdict and its age on both machines.

## What should move to the cloud now, and what cannot

**Move — web plus the artifact DB, no credential, no local file.** The feeds that died when one laptop slept: `openrouter-feeds-refresh` (error since 2026-09-17), `feeds-weekly` and `feeds-market-close` (stale since 2026-09-17/15), `weather-news-refresh`, `r5-rates-market-refresh` and `r9-feed-freshness-sweep` (**never run**), `r1-morning-brief`, `r3-eod-rollup`, `r10-automation-health`, the ISA comms bridge, and the weekly backup — which **already moved** and took the 2026-09-22 backup with no laptop involved.

**Cannot move, by reason.** *Local files or a local daemon:* Apple Health ingest (Health Auto Export on `:8765` + DuckDB), `r7-plaid-balances`, `openterminal-remote-queue`, `toolkit-deck-sync` and `nightly-self-test` (they measure the machine they run on). *Vault files and the local model:* `local-bridge-queue`, `brain-learn-daily`, `brain-weekly-verify`, `ops-knowledge-graph`, `fabric-deck-sync`, `steve-twin-sweep`. *A connector or a Keychain/.env credential:* `r4-quantvue-sync` (Google Sheet), `lofty-crm-sync` (`lofty-bridge` MCP + `LOFTY_API_KEY` in `~/.config/lofty/.env`), Zoho, `calendar-daily-sync`, `r12-inbox-triage`, `strava-daily-sync`, and the iMessage / Discord / WhatsApp inboxes — WhatsApp also needs a logged-in desktop app. `health-full-analysis` is blocked behind the ingest, not by the cloud: it can move once `appleHealth` is fresh again.

## Honest limits

- **A routine is proven by the document it leaves, never by its run status.** The old web "Pipeline Sync" routine reports SUCCEEDED four times a day and has never moved a document.
- **The Local Bridge is read-only on purpose.** A verb outside the allow-list is refused, not escalated. `steve-twin-sweep` was refused on exactly this: a Bash write to `~/Shearrill-Vault`.
- **Everything still on a Mac is bounded by that Mac being awake.** See `always-on/README.md`.
- **The human ISA** works Mon–Fri 12–4 PM PT, reached only through Vanessa on the ISA line. The Mac `isa-comms-bridge-local` runs hourly :37, 7:37 AM–9:37 PM PT (last ok 2026-09-21 20:38 PT); the cloud escalation ladder runs weekdays 14:30 UTC and does write.
- **No remote path may carry a credential or client PII in its prompt.** Sensitive answers come from the local model (Jarvis) on the Mac, and stay there.

## Sending work in from the phone

1. Text Vanessa what you want. She queues it — she does not act on a licensed decision.
2. Anything on the HALT list comes back as a **Needs-Steven packet**, not as an attempt.
3. If it needs a credential or a permission (the Zoho API grant, the Lofty key), it stops and says so. Two retries maximum, then it stops.
