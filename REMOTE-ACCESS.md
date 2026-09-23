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
| **(iii) Run the scheduled tasks** | Everything in (ii), plus `claude-runner` with the 59 tasks, the `claude-auto` launcher, and **one line in `~/.config/claude-runner/role`** — see the lease below | `runnerctl status` lists the tasks; a manual run exits **75** with `standby: lease held by <other Mac>` and writes nothing |

Step by step: `docs/SECOND-MAC-SETUP.md`.

## Primary / standby — one writer, enforced

Two Macs running the same 59 tasks would double-write the same documents: duplicate `ciLog` rows, `isaLine` messages sent twice, churn on `sectionEdits` (already at version 3104). Make it a lease, not a convention. **PRIMARY** = the Mac that has the tasks today; **STANDBY** = the second Mac, tasks installed, identical, lease-blocked.

Lease document: `taskLease` in the Command Deck store (`1624daae-d683-405a-971d-c5828dce0f8d`), `{v:{holder, hostname, acquiredAt, expiresAt}}`. `holder` is a short stable id per machine; `hostname` is `scutil --get ComputerName`, for humans. TTL **90 minutes**. **The document does not exist yet** — re-read from the store 2026-09-22 — and the first real run on a Mac creates it; never seed it from the cloud.

**Where the check actually runs, since 2026-09-22: in the launcher, not in 59 prompts.** This file used to say "put this at the top of every task prompt". That was correct and it was never going to happen — editing 59 live task prompts is a HALT an agent cannot perform and a chore that does not finish, so Mac #2 stayed off. `integrations/omniroute-failover/claude-auto.sh` is already the one launcher in front of every `claude-runner` task: it already takes `--task NAME`, already decides whether a task may run, and already defers with exit 75. The same five steps — same document, same TTL, same `if_version` pin, same step-4 re-read — now run there, once, for every task. **Steven's whole remaining job per Mac is one line in a file:**

```bash
mkdir -p ~/.config/claude-runner && printf 'primary\n' > ~/.config/claude-runner/role   # 'standby' on Mac #2
claude-auto --lease-check                                                               # prove it, on each Mac
```

Absent or unreadable, the role reads as **standby** — the safe direction for a freshly imaged Mac. The role decides one thing only: what happens when the check itself cannot complete. **Primary fails OPEN** (a blip must never stop all the automation; the 90-minute TTL exists so it can work through one), **standby fails CLOSED** (a standby that guesses is the double-write this prevents). A live foreign lease defers on *both* roles. The decision is cached for 30 minutes, so the real check costs about 48 `claude -p` turns a day rather than one per task invocation (733 of those a day across the 59 crons). Mechanism, precedence against the PII gate, and the executed tests: `integrations/omniroute-failover/README.md` → *The task lease*.

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

The `if_version` pin is what makes this a lease and not a hope: a write pinned to a version that has already moved is refused and writes nothing; step 4 covers the one case a pin cannot. The launcher's gate is the same five steps and preserves both semantics. **Promote the standby — one command,** pasted into Claude Code on the Mac taking over (unchanged, and it still works on its own):

```
Take the task lease: ArtifactData set state/taskLease on artifact 1624daae-d683-405a-971d-c5828dce0f8d to
{"v":{"holder":"<this Mac's id>","hostname":"<scutil --get ComputerName>","acquiredAt":"<now Z>","expiresAt":"<now+90m Z>"}}
with no if_version, then read it back and show me the holder.
```

The old primary's next run reads a lease it does not hold and exits quietly. Nothing to turn off, nothing double-writes in between; hand back by running the same line on the other Mac.

With the launcher gate in play, add one line on each machine so the change lands on the next task instead of within the 30-minute cache window — flipping the role file busts the cache immediately:

```bash
printf 'primary\n' > ~/.config/claude-runner/role    # on the Mac taking over
printf 'standby\n' > ~/.config/claude-runner/role    # on the Mac handing over
```

Skip it and both Macs still converge, but for up to 30 minutes the old primary can keep running on a cached decision — a bounded overlap, not a silent one: `claude-auto --status` shows the cached verdict and its age on both machines.

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
