# Remote access — every live path

How Steven reaches the brain, and how the brain reaches him, from anywhere. Each row says what it
can actually do, because the difference between "connected" and "can write" is where this system
breaks.

## The paths

| Path | What it is | Can it write? |
|---|---|---|
| **Vanessa Live** | A Claude Code session on the Mac with **Remote Control**, driven from claude.ai or the phone app. Full tool access, as the Mac | **Yes** — full, as Steven's machine |
| **Command Deck** | The published artifact, on any device with his login | Yes, interactively (a human is present to approve) |
| **iMessage** | `+1 650-484-9720`, via Inkbox. `vanessa-imessage-inbox` polls every 10 min; `voice-reply-render` renders replies in-persona | Reads and replies; queues work |
| **Discord `#vanessa`** | Via the local bot + Inkbox. `vanessa-discord-inbox` every 5 min | Reads and replies |
| **Cloud routines** | `claude.ai/code/routines` — 50 total, 46 enabled | **Research only.** An unattended write parks on a permission prompt — confirmed three times |
| **Local Bridge queue** | `localBridgeQueue` doc → `local-bridge-queue` task (hourly :25, 6 AM–9 PM PT) → `~/Applications/local-bridge/run.sh` | **Read-only verbs**, enforced by an allow-list |
| **Research queue** | `vanessaResearch` doc → `vanessa-research-queue` (hourly :30, 7:30 AM–9:30 PM PT) | Writes answers back to the doc |
| **Push / text** | `vanessa-significant-alerts` (11 AM, 3 PM, 7 PM PT) and the morning text | Outbound only |

## Which path for which job

- **"Answer me"** → iMessage or Discord. Cheapest, already running.
- **"Look something up I cannot see"** → Local Bridge queue (read-only) or the research queue.
- **"Do something on the Mac"** → **Vanessa Live.** It is the only path with real write access.
- **"Run this while I sleep"** → a `claude-runner` task on the Mac. Not a cloud routine.

## Honest limits

- **Cloud routines cannot write to the artifact DB unattended.** Anything that must persist runs on
  the Mac. A cloud routine that reports success may have written nothing — check the doc's stamp.
- **The Local Bridge is read-only on purpose.** A queued verb outside the allow-list is refused, not
  escalated. `steve-twin-sweep` was refused on exactly this: a Bash write to `~/Shearrill-Vault`.
- **Everything on the Mac is bounded by the Mac being awake.** See `always-on/README.md`.
- **The human ISA** works Mon–Fri 12–4 PM PT and is reached only through Vanessa on the ISA line.
  The cloud hourly ISA bridge is **disabled**; the Mac `isa-comms-bridge-local` runs hourly :37,
  7:37 AM–9:37 PM PT (last ok 2026-09-21 20:38 PT). Nothing has been posted since 2026-09-16.
- **No remote path may carry a credential or client PII in its prompt.** Sensitive answers come from
  the local model (Jarvis) on the Mac, and stay there.

## Sending work in from the phone

1. Text Vanessa what you want. She queues it — she does not act on a licensed decision.
2. Anything on the HALT list comes back as a **Needs-Steven packet**, not as an attempt.
3. If it needs a credential or a permission (the Zoho API grant, the Lofty key), it stops and says
   so. Two retries maximum, then it stops.
