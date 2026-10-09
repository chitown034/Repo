# OmniRoute failover — subscription first, free providers only while limited, never with client data

**Written 2026-09-22 · design + scripts · not yet installed on the Mac.** Owner: Integration Engineer
(under CTO Innovator). Security lens: Elena / ecc-security-steward. Replaces the older `claude-auto`
already on the Mac (`docs/inventory/mac-task-descriptions.md`: "Claude subscription first; when its limit
is hit, Claude Code runs on FREE providers via OmniRoute (loopback :20128, combo free-only) with a
client-data guard hook") whose guard coverage the audit could not verify — **F-E8-60**.

**Extended 2026-09-22 by P7 (Platform Engineer)** with the PRIMARY/STANDBY **task lease** — see *The task
lease* below. It moves `REMOTE-ACCESS.md`'s 59-prompt LEASE CHECK into this one launcher, so installing one
script becomes the whole of what makes a second Mac safe. It is an **additional** gate in front of the PII
gate and changes nothing about it.

**Extended 2026-09-24 by R6** for Steven's *"ensure both of my MacBooks can access the same information and
equally have control"*: a symmetric `peer` role with **sticky leadership** (no permanent primary), explicit
`--take-lease`/`--release-lease` control from either Mac, and a per-Mac heartbeat document — see *The task
lease* below. `primary`/`standby` keep working exactly as before, as legacy values; a live foreign lease still
defers on every role, unchanged. The "same information" half of the ask is a new tool,
`integrations/mac-sync/mac-sync.sh`, documented on its own.

**Hardened 2026-09-22 by H3 (Security Engineer)** after the verification pass (`docs/findings/findings-V2.json`
F-V2-07..18) executed the first draft and proved its PII gate failed open. Every change below is sandbox-tested
against a stub `claude`; the exact before/after runs are in `docs/findings/findings-H3.json`.

Steven's requirement, verbatim: *"Ensure model switch to the OmniRoute free LLM models when subscription
runs out and then switches back to subscription model when subscription refreshes."*

## Files
| File | Role |
|---|---|
| `claude-auto.sh` | Launcher. Decides the route per invocation, publishes the mode, gates client-data work — **closed by default** — and holds the **task lease** (below): `peer` by default, `primary`/`standby` kept as legacy roles. Drop-in for `claude`: `claude-auto [--task NAME] [--pii\|--no-pii] [--force …] [--lease\|--no-lease\|--lease-check\|--take-lease\|--release-lease] [--] <claude args>`; the options are recognised in any position before `--` |
| `lease-tests.sh` | The executed test harness for the lease gate, plus a regression pass over the PII gate and the limit detection. Drives `claude-auto.sh` against a stub `claude` that implements the five lease steps (plus the step-6 heartbeat, and the take/release protocols) against a fake document, `if_version` pin included. `./lease-tests.sh` — 158 assertions, no Mac, no login, no network |
| `failover-tests.sh` | Executed tests for the three-tier chain, `--doctor`, the installer and `--interactive-free` (stub `claude`/`curl`/`omniroute`/`launchctl`/`runnerctl`, temp `HOME`, a pty): 248 assertions |
| `install-failover.sh` | Asks y/N per change (default N, `--dry-run`): installs both scripts, role file, empty key file, probe LaunchAgent; prints the runner-task lines; runs `--doctor` |
| `probe.sh` | Every 15 min: if the route is not `subscription`, probes the subscription with one 1-turn, no-tool call and restores it. Four inconclusive probes in a row → `state/NEEDS-STEVEN` + fall back to plain `claude` |
| `~/.config/omniroute/.env` | On the Mac only, `chmod 600`. Holds `OMNIROUTE_API_KEY` (the key OmniRoute's dashboard issues for its own loopback endpoint). **Never a provider key, never committed** |
| `~/.config/omniroute/free-ok-tasks.txt` | Optional. Task-name glob patterns **permitted on a free provider**, one per line, `#` comments. Adds to `DEFAULT_FREE_OK_TASKS` in the launcher. A name goes in here only with the security steward's sign-off |
| `~/.config/omniroute/pii-tasks.txt` | Optional. Client-data glob patterns, one per line. Adds to `DEFAULT_PII_TASKS`. A match here wins over the allow-list and over `--no-pii` |
| `~/.config/claude-runner/role` | **One word: `peer` (both of Steven's Macs, R6 2026-09-24), or the legacy `primary`/`standby`.** Absent or unreadable = `standby`. This is the entire per-machine configuration a Mac needs |
| `~/.config/claude-runner/id` | Optional. A short stable lease id for this machine; absent, it is derived from the computer name |
| `CLAUDE_RUNNER_REPO_DIR` (optional env var) | This Mac's brain-repo checkout path, for the heartbeat's `repo.*` fields only (below). The installed launcher has no other way to know it — a plain clone, or symlinked into the vault (`MAC-INSTALL.md` §0) |
| `~/.config/omniroute/state/` (mode 700) | `mode` (one word), `route.env` (parsed, never sourced), `claude-auto.log`, `probe.log`, `limit-samples.log` (exit status + hash per detected limit, never task output), `probe-failures` (consecutive inconclusive probes), `NEEDS-STEVEN` (escalation marker — its presence is a `NEED` in `mac-verify.sh`), `lease.env` (the cached lease decision, parsed never sourced — carries the verdict/holder/expires **forward** across a run of inconclusive checks on `peer`, unlike `primary`/`standby`), `lease.lock` (transient) |

## How it works
```
claude-auto ─▶ LEASE GATE (--task invocations only) ─┬─ HELD / ACQUIRED ─────▶ on to the route
            │                                       ├─ FOREIGN / RACE ──────▶ exit 75, nothing written
            │                                       └─ inconclusive ─┬ PRIMARY ▶ on (fails OPEN)
            │                                                        └ STANDBY ▶ exit 75 (fails CLOSED)
            └─reads─▶ state/mode ─┬─ subscription  → plain `claude`, OAuth login, no proxy env at all
                                  ├─ free-fallback → ANTHROPIC_BASE_URL=http://127.0.0.1:20128
                                  │                  ANTHROPIC_AUTH_TOKEN=$OMNIROUTE_API_KEY
                                  │                  ANTHROPIC_MODEL=auto/coding:free (+ every alias)
                                  │                  CLAUDE_CODE_OAUTH_TOKEN / ANTHROPIC_API_KEY unset
                                  │                  --task on the free-OK allow-list, or --no-pii? → run there
                                  │                  anything else (no task, unknown task, client task) → exit 75 (deferred) or local model
                                  └─ local-only     → same proxy, model pinned to OMNIROUTE_LOCAL_MODEL (Jarvis)
probe.sh (LaunchAgent, 15 min) ──▶ subscription usable again? → state/mode = subscription
                                   4 × inconclusive in a row? → state/NEEDS-STEVEN, state/mode = subscription (plain claude)
```
The route is fixed when a process starts. A headless task that hits the limit mid-run is detected, the
state flips, and the task exits **75** so `claude-runner` retries it on the new route. An interactive
Vanessa Live session cannot be re-pointed mid-conversation: Steven sees the limit message, types
`vanessa` again, and the launcher routes the new session — and because that session has no `--task`, it is
**deferred while the route is free** unless the `vanessa` launcher passes `--no-pii`, which it must not:
a Vanessa Live session is client conversation by nature. That is a real limit, stated on purpose.

## The detection signal (exact)
There is no documented "usage limit" event for `claude -p`; the docs say a failure inside the run is
printed as the result on stdout and the exit code is non-zero (`code.claude.com/docs/en/headless`, read
2026-09-22). So the launcher treats a subscription run as limited when **both** hold:
1. the run failed — exit code ≠ 0, or the JSON result carries `"is_error": true`; and
2. the **error envelope** matches `LIMIT_RE` (case-insensitive). The envelope is the only text the regex
   ever sees: with `--output-format json|stream-json` it is the `result`, `error…`, `message` and `subtype`
   fields of the `{"type":"result"…}` object; in text mode it is stderr plus the **last three lines** of stdout,
   and only when the exit code is non-zero. A task's own output is never scanned (F-V2-10: `$429,000` used
   to flip the route).

`LIMIT_RE` is built from the strings inside the Claude Code 2.1.278 binary itself (grep, 2026-09-22):
`usage limit`, `you've hit your … limit`, `usage|rate|spend|weekly|session|monthly limit reached`,
`out of (extra) usage`, `rate_limit` / `rate_limit_error` (the API's 429 body type), `rate limited`, and
`429` **only** next to `API Error` / `HTTP` / `status` / `code` or `Too Many Requests`. There is no bare
`resets at|in`, no bare `limit reached` and no bare `429`: prose matches those. `API Error: 401 … /login`
(login expiry), `529 overloaded` and "fast mode" messages are not limits and do not flip the route.

An epoch after the CLI's own `limit reached|<unix time>` (older builds) becomes `reset_at` **only if it lies
between now − 1 h and now + 48 h**; anything else is a parse failure and becomes `0`, which makes the probe
poll (F-V2-12: a far-future value used to silence the probe forever). Every detected limit appends one line
to `state/limit-samples.log` — timestamp, task, exit status, which regex branch fired, byte count and the
sha256 of the envelope. **Not the text**: the tasks most likely to fail are the client-data ones (F-V2-14).
The probe's own inconclusive samples do carry a redacted 200-byte head, because the probe's prompt is fixed
text that can hold nothing of a client's. Claude Code's own `--fallback-model` covers overload, not usage limits.

## Switch-over (what actually changes)
Only environment variables, only for that process: `ANTHROPIC_BASE_URL` = the OmniRoute root (no `/v1` —
OmniRoute's own Claude Code guide, `docs/reference/CLI-TOOLS.md`), `ANTHROPIC_AUTH_TOKEN` = OmniRoute's
key, `ANTHROPIC_MODEL` and `ANTHROPIC_DEFAULT_{OPUS,SONNET,HAIKU,FABLE}_MODEL` = the free combo, and an
explicit `--model X` argument rewritten to the combo so the runner's seat names resolve. The subscription
credential is unset so it can never be sent to the proxy. `~/.claude/settings.json` is **not** edited.

## Switch-back (the probe)
`probe.sh` runs every 15 min. In `subscription` mode it exits immediately (no cost). Otherwise, unless
`reset_at` is still in the future **and** the last probe is less than 6 h old, it runs `claude -p 'Reply with
exactly: OK' --max-turns 1 --disallowedTools '*' --no-session-persistence --output-format json` with the
proxy variables stripped. `is_error:false` → mode back to `subscription`, failure counter cleared, any
`NEEDS-STEVEN` marker removed; a limit match → stay, refresh `reset_at`, counter cleared; anything else →
inconclusive: mode kept, counter +1, exit 1. **Four inconclusive probes in a row (one hour)** → the probe
writes `state/NEEDS-STEVEN` (what failed, what to check), sets the route back to `subscription` so tasks
run on plain `claude` again, and logs `ESCALATED` (F-V2-11: a CLI flag drift or an expired login used to
strand the Mac on free providers silently and permanently). The launcher also re-probes itself when the state
is older than 25 min and `reset_at` has passed, or older than 6 h regardless; it logs the probe's exit
status, and if `probe.sh` is missing next to it, it writes the marker instead of failing quietly.

## PII policy — not optional, and closed by default
While the route is anything but `subscription`, **no prompt that contains client PII, loan-file text,
CRM records, ISA-line content, credit data or health data may leave the Mac.** Free tiers are paid for
with your prompts: OmniRoute's own free-tier guide notes at least one provider logs every request.

The gate is an **allow-list** (F-V2-08/09). A deny-list of client tasks fails open on every new or renamed
task; an allow-list fails closed. Both exist, and the deny-list wins:
| Invocation on `free-fallback` | Result |
|---|---|
| `--task` matches a client-data pattern (`DEFAULT_PII_TASKS` in the launcher: `lofty-*`, `zoho-*`, `*crm*`, `isa-*`, `lead-*`, `*inbox*`, `showing-*`, `steve-twin-*`, `vanessa-imessage-*`, `health-*`, `strava-*`, `calendar-*`, `r7-plaid-*`, `*client*`, `*loan*`, `*borrower*`, … plus `pii-tasks.txt`), **matched case-insensitively** | **Deferred** — exit 75, even with `--no-pii`. If `OMNIROUTE_LOCAL_MODEL` names the local Jarvis model as an OmniRoute provider, runs there instead (`mode=local-only`, `VANESSA_PII_OK=1`) |
| `--task` on the free-OK allow-list (`DEFAULT_FREE_OK_TASKS`: `weather-news-refresh`, `mortgage-rates-daily`, `r5-rates-market-refresh`, `feeds-market-close`, `feeds-weekly`, `openrouter-feeds-refresh`, `incentives-daily-scan`, `skills-refresh-weekly`, `r9-feed-freshness-sweep`, `r10-automation-health`, `toolkit-deck-sync` — public or system data only — plus `free-ok-tasks.txt`), matched **case-sensitively** | Runs on the free combo (`VANESSA_PII_OK=0`) |
| explicit `--no-pii` (in any position) and no client-data pattern objects | Runs on the free combo — the caller has asserted there is no client data |
| **everything else**: no `--task`, an unknown task, a new task nobody has classified yet, an interactive session | **Deferred** — exit 75 with the reason on stderr and in `claude-auto.log` (`task=… pii=1 (…)`) |

The case asymmetry in rows 1 and 2 is deliberate (F-H3b-01). Shell globs are case-sensitive, so while both
lists were matched as written, a client task renamed `Lofty-CRM-Refresh` did **not** match `lofty-*`, and one
broad pattern in `free-ok-tasks.txt` that happened to match its case was enough to send it to a free provider.
The task name and the deny patterns are now folded to lower case before the deny check — which can only ever
catch more — while the allow check is left unfolded — which can only ever admit fewer. `WEATHER-NEWS-REFRESH`
is therefore *not* allow-listed and defers; `Lofty-CRM-Refresh` is caught by `lofty-*`. Both errors fall the
same way: towards deferring.

The flag every task can read: `VANESSA_ROUTE_MODE` (`subscription` / `free-fallback` / `local-only`),
`VANESSA_PII_OK` (`1` / `0`), and the file `~/.config/omniroute/state/mode`. Task prompts add one line:
*"If `VANESSA_PII_OK` is 0, write your status doc with `status:"deferred-free-route"` and stop."*
Deferral is the task **working**, not failing — the deck should say "waiting for the subscription reset".
Two layers, on purpose: this launcher-level gate, plus the existing client-data guard hook — which stays,
and which the canary below tests. The launcher sees task names, not prompt text: an allow-listed task whose
prompt drags in a client file is the hook's job. Neither replaces the HALT list in `CLAUDE.md`.

## The task lease — one writer across two Macs (P7, 2026-09-22; peer role R6, 2026-09-24)

Two Macs running the same 59 `claude-runner` tasks double-write the same artifact documents: duplicate
`ciLog` rows, `isaLine` messages sent twice, churn on `sectionEdits`. `REMOTE-ACCESS.md` specifies the cure
as a lease, and originally as a five-step **LEASE CHECK** block pasted at the top of **all 59 task prompts**.
That is a HALT an agent cannot perform (editing live task prompts) and a chore that in practice never
finishes — so Mac #2 stayed off and the "both Macs" capability stayed blocked.

`claude-auto.sh` is already the single choke point in front of every task: it already takes `--task NAME`,
already decides whether a task may run, and already defers with **exit 75**. So the same five steps run
**here** instead — same document, same 90-minute TTL, same `if_version` pin, same step-4 re-read.
**Installing one script is now the whole of what makes a second Mac safe.** The prompt-level block stays
documented in `REMOTE-ACCESS.md` as the fallback for any writer that does **not** go through this launcher
(a cloud routine, a hand-run Claude Code session, a future non-`claude-auto` task runner).

### What it reads and writes
| Thing | Where | Notes |
|---|---|---|
| Role | `~/.config/claude-runner/role` | First non-comment line, case-insensitive: `peer` (what both of Steven's Macs run), or the legacy `primary`/`standby`. **Absent, unreadable, not owned by this user, group/world-writable, or holding anything else → `standby`** — the safe direction for a freshly imaged Mac. `# comments` and blank lines are allowed |
| Holder id | `~/.config/claude-runner/id` (optional) | A short stable id per machine. Absent → derived from `scutil --get ComputerName`, else `hostname`, lower-cased and reduced to `[a-z0-9._-]`, 40 chars. **Two Macs with the same id defeats the mechanism** — `SECOND-MAC-SETUP.md` §11 checks the names differ |
| Lease | `state/taskLease` on artifact `1624daae-d683-405a-971d-c5828dce0f8d` | `{v:{holder, hostname, acquiredAt, expiresAt}}`, TTL **90 min**. Shape fixed by `REMOTE-ACCESS.md`; Steven's promotion command writes the same document. **The document does not exist yet** (re-read from the store 2026-09-22) — the first real run on a Mac creates it |
| Decision cache | `~/.config/omniroute/state/lease.env` (mode 600) | `decision= verdict= role= checked_at= expires_iso= holder= fails=`. Parsed with `sed` and validated, **never sourced**; a file that is not plain, owner-only and owned by this user is discarded, not trusted (same rule as `route.env`, F-V2-18) |
| Check lock | `~/.config/omniroute/state/lease.lock` | A `mkdir` lock. 59 tasks firing in the same minute pay for **one** check, not 59. A lock older than `LEASE_TIMEOUT + 60 s` is treated as a leftover and removed |

### How the check runs
A bash script cannot read the artifact DB — there is no HTTP API for it, only the Claude tool layer. So the
check is **one `claude -p` turn**, in the same shape `probe.sh` uses: `--max-turns 8 --output-format json
--no-session-persistence`, the proxy variables stripped with `env -u` so it can never reach OmniRoute, and a
tool allow-list of exactly one — `--allowedTools ArtifactData` plus an explicit `--disallowedTools` for
Bash/Task/WebFetch/WebSearch/Write/Edit/NotebookEdit. The prompt carries only the artifact id, this machine's
id and hostname, and two timestamps the **shell** computed (the model is never asked what time it is). No
credential, no client data, no task name.

The reply must be exactly one line — `LEASE HELD|ACQUIRED|FOREIGN|RACE holder=… expires=…` — and only the
CLI's own `result` field is parsed, never the prompt we sent. Anything else (no verdict, two contradictory
verdicts, a `HELD` that names a different machine, a non-zero exit, a timeout) is **inconclusive**.

### The asymmetry — the important design decision
The role decides exactly one thing: **what to do when the check itself cannot complete.** It never overrides
a conclusive answer.

| | PRIMARY | STANDBY (and unset/unreadable) | PEER |
|---|---|---|---|
| `HELD` / `ACQUIRED` | run | run — it is the writer now | run — it is the writer now |
| `FOREIGN` (a live lease someone else holds) | **exit 75** | **exit 75** | **exit 75** |
| `RACE` (the pinned write was refused, or the step-4 re-read shows another holder) | **exit 75**, nothing written | **exit 75**, nothing written | **exit 75**, nothing written |
| check inconclusive — network down, `claude` not logged in, a timeout | **runs the task. FAILS OPEN.** | **exit 75. FAILS CLOSED.** | **sticky — see below** |

**Why open on the primary:** a blip must never silently stop all of Steven's automation. The lease has a
90-minute TTL precisely so the machine that holds it can work through one. The cost of being wrong is a
double-write window; the cost of being right-but-down is every feed going stale, which is what put ~50 feeds
on one sleeping laptop in the first place.
**Why closed on the standby:** a standby that cannot *prove* it should take over and guesses is exactly the
double-write this exists to prevent. A "primary" row that ignored a live foreign lease would make the whole
mechanism pointless, which is why `FOREIGN` defers on **every** role, peer included.

### Peer — sticky leadership, no permanent primary (R6, 2026-09-24)
`peer` is symmetric: both Macs run it, and there is no machine that is structurally "more allowed" to work
than the other. What decides who runs, moment to moment, is the lease document itself — whichever Mac's last
conclusive check said `HELD`/`ACQUIRED` for it. The only place role still matters is the inconclusive case,
and there it is **sticky, not open-by-default and not closed-by-default**:

> A peer fails OPEN on an inconclusive check only if **this same Mac** was the conclusive holder (`HELD` or
> `ACQUIRED`, naming this machine) at **its own last real check**, and the `expiresAt` from that check has
> **not yet passed**. Otherwise it fails CLOSED — same as standby.

That memory lives in the decision cache (`state/lease.env`) and, for `peer` only, is **carried forward rather
than blanked** across a run of inconclusive checks — a string of blips does not erase who was holding the
lease, but the memory still lapses on its own the moment the remembered `expiresAt` passes, without needing a
new check to notice. `primary`/`standby` are unaffected: their inconclusive writes still blank `holder`/
`expires` exactly as before this addition, because their answer never depended on those fields.

The practical effect: whichever Mac is currently the writer keeps working through a blip on *that* Mac, for
up to the lease's own 90-minute TTL, exactly like a primary would — but the *other* Mac, which was never the
holder, still fails closed on a blip of its own, exactly like a standby would. Leadership follows the lease,
not a file Steven has to remember to flip back. There is deliberately no "peer that is always allowed to run
no matter what" — that would just be primary wearing a different name.

### Explicit control — `--take-lease` / `--release-lease` (R6, 2026-09-24)
Either Mac, any time, no waiting on a check:
- **`claude-auto --take-lease`** — an immediate, unconditional takeover. Writes `state/taskLease` with **no**
  `if_version` (whatever is there, however live, is overwritten), reads it back to confirm the holder is now
  this machine, and busts this Mac's local decision cache so the very next task re-checks for real instead of
  serving a stale cached defer. One `claude -p` turn. Prints exactly one line:
  `claude-auto: TOOK the lease — holder=… expires=…`.
- **`claude-auto --release-lease`** — hand back now. Reads the document; if this Mac is **not** the current
  holder it refuses and changes nothing (`cannot release — this Mac does not hold the lease`); otherwise it
  sets `expiresAt` to *now*, pinned with `if_version`, and busts the cache the same way. One `claude -p` turn.
  Prints exactly one line: `claude-auto: RELEASED the lease — it is free as of …`.

This replaces hand-pasting the "Promote the standby" prompt from `REMOTE-ACCESS.md` for a `peer` Mac — that
prompt still works (it is the same unconditional-write shape `--take-lease` now automates), and is still the
right tool for a writer that does not go through `claude-auto` at all.

### The per-Mac heartbeat (R6, 2026-09-24)
Every **conclusive** lease check (`HELD`/`ACQUIRED`/`FOREIGN`/`RACE`) also writes this Mac's own
`state/macHeartbeat.<machineId>` document, in the **same** `claude -p` turn as the check itself — step 6 of
the prompt in *How the check runs* above, after the model has already decided its one-line answer. It is
strictly best effort: the instruction tells the model to ignore any error from that call and never let it
change the line it was already going to print, so a failed heartbeat write can never turn a `run` into a
`defer` or vice versa. A check that is itself inconclusive writes no heartbeat at all — there is no turn to
attach it to.

Shape, fixed for the deck engineer to build against (times ISO-8601 Z; a value this Mac cannot determine is
JSON `null`, never guessed):
```json
{"v":{"machineId":"…","hostname":"…","role":"…","checkedAt":"…","verdict":"…","leaseHolder":"…",
      "leaseExpiresAt":"…","claudeAutoVersion":"…",
      "runner":{"tasks":…,"scheduleEnabled":null},
      "repo":{"branch":…,"head":…,"behind":…,"ahead":…,"checkedAt":"…"}}}
```
`machineId`/`hostname`/`role`/`checkedAt`/`verdict`/`leaseHolder`/`leaseExpiresAt`/`claudeAutoVersion` are
filled by the shell before the turn starts — cheap, and no LLM guesswork involved. `runner.tasks` is a count
from `runnerctl list`, present only when `runnerctl` is on this Mac's `PATH`. `runner.scheduleEnabled` is
always `null` from this launcher: no documented signal exists to tell "paused" from "running" short of parsing
`runnerctl status` prose, which this file declines to guess at (`mac-sync.sh status`, below, is where a human
glance at that belongs instead). `repo.*` is populated only when `CLAUDE_RUNNER_REPO_DIR` is set to a real
checkout — the installed launcher (`~/.local/bin/claude-auto`) otherwise has no way to know where Steven put
his clone, since `MAC-INSTALL.md` §0 deliberately allows either a plain clone or a vault symlink. `taskLease`
itself is untouched: still exactly `{v:{holder, hostname, acquiredAt, expiresAt}}`, never seeded or reshaped
by this. **A Mac writes only its own heartbeat document** — the id in the path is this machine's, always.

### Precedence against the existing gates
```
1. argument validation            exit 64   (unchanged, still first — an illegal --task never reaches a check)
2. --force / route read / self-probe        (unchanged)
3. --status  /  --lease-check     exit 0/1  (diagnostics: they spend nothing and take no lease)
4. THE LEASE GATE                 exit 75   <-- new
5. route dispatch -> OmniRoute health -> .env mode -> THE PII GATE   exit 75 / 78  (unchanged)
6. run
```
The lease gate sits **in front of** the PII gate, never inside it. They compose as **AND** — a task runs only
if the lease says this Mac may work *and* the route/PII gate says this data may go where the route points —
and both fail towards exit 75. The lease path sets no variable the PII gate reads, so a lease *allow* leaves
the PII decision byte-identical. Lease first, for three reasons:
- "May this Mac do work at all" is strictly broader than "which provider may see this data".
- A lease deferral must not depend on route state: a standby defers identically on the subscription route,
  where the PII gate is not consulted at all.
- **Reversed, it would leak a takeover.** A client task on a limited subscription defers at the PII gate. If
  that happened before the lease gate, a busy primary whose subscription went free would stop renewing its
  lease, it would expire after 90 minutes, and the standby would take over while the primary was merely
  waiting for a reset. Renewing on the primary regardless of the PII outcome is correct, and only lease-first
  gives it.
One thing deliberately **not** shared: the lease check's own output is never matched against `LIMIT_RE`. Only
a real task run may move the route (F-V2-10). A lease check that fails with "Usage limit reached" leaves
`state/mode` exactly where it was — tested.

### Cost control
A `claude -p` per task invocation is unaffordable: the 59 enabled crons in
`docs/inventory/mac-runner-status.md` fire **733 task invocations a day** (`*/5` Discord inbox alone is 288).
The decision is therefore cached for `LEASE_CACHE_TTL`, **1800 s (30 minutes)**, which bounds real checks at
`1440 / 30 = 48 a day` however many tasks fire — measured at exactly `ceil(elapsed / TTL)` on a compressed
clock, independent of invocation count. 30 minutes also gives **three renewals inside every 90-minute lease**,
so a primary survives two missed windows before its lease can lapse.
The cache is invalidated early, never late, by four rules:
- **the role file changed** — flipping `primary`↔`standby`↔`peer` takes effect on the very next task, at no cost;
- **a cached `FOREIGN` never outlives the lease it saw** — the moment that lease's `expiresAt` passes, the
  standby (or a non-holding peer) re-checks and takes over rather than waiting the cache out;
- **an untrusted `lease.env`** is discarded;
- **`--take-lease` and `--release-lease` bust the cache explicitly**, on top of the writes they make.
An *inconclusive* check backs off 5 → 10 → 20 → 30 min (`fails=` in the cache) so a sustained outage cannot
turn into hundreds of retried checks, while a single blip recovers within five minutes.

### Scope — what is not gated, on purpose
An invocation with **no `--task`** is not lease-gated. It is not one of the 59 scheduled writers: it is
interactive Vanessa Live or a one-off, with a human present — the same reasoning the Command Deck uses. This
is what lets Mac #2 reach level (ii) "drive Vanessa" while still standing by at level (iii). The residual is
stated plainly: a human at the standby can still write documents by hand. `--lease` gates a no-task
invocation anyway; `--no-lease` skips the gate and is logged as a `WARN` with the task name and the user —
for a deliberate one-off or recovery, **never in a task definition**.

### Diagnostics and knobs
`claude-auto --status` adds `lease_role=`, `lease_role_src=`, `lease_id=`, `claude_auto_version=` and the
cached decision with its age. It spends nothing and takes no lease. `claude-auto --lease-check` forces one
real check, prints `verdict=… holder=… expires=… decision=…`, exits **0** when conclusive and **1** when not —
and when it is inconclusive it says what a task on this role *would* do (for `peer`, the same sticky rule
above, evaluated against the cache as it stood just before the forced check). Run it on each Mac before
enabling the runner. Environment overrides, none of them required:
`CLAUDE_RUNNER_CFG`, `CLAUDE_RUNNER_LEASE_ARTIFACT`, `CLAUDE_RUNNER_LEASE_TTL` (fixed at 90 min by spec),
`CLAUDE_RUNNER_LEASE_CACHE_TTL`, `CLAUDE_RUNNER_LEASE_FAIL_TTL`, `CLAUDE_RUNNER_LEASE_TIMEOUT`,
`CLAUDE_RUNNER_LEASE_MODEL`, `CLAUDE_RUNNER_LEASE_TOOLS`, `CLAUDE_RUNNER_LEASE_TIMEOUT_BIN`,
`CLAUDE_RUNNER_REPO_DIR` (heartbeat `repo.*` only), `CLAUDE_AUTO_VERSION_OVERRIDE`.

### Lease canary — peer (the shape both of Steven's Macs actually run, R6 2026-09-24)
1. Both Macs: `~/.config/claude-runner/role` says `peer` (the installer writes this on a fresh Mac — see
   `MAC-SETUP.sh`). `claude-auto --status` on each → `lease_role=peer`, `lease_cached=none` before the first check.
2. **Mac A**: `claude-auto --lease-check` → `verdict=ACQUIRED decision=run`. This is the run that **creates**
   `state/taskLease`; it must be a Mac that does it, never the cloud.
3. **Mac B**: `claude-auto --lease-check` → `verdict=FOREIGN holder=<Mac A's id>`, exit 0.
4. **Mac B**: `claude-auto --task r10-automation-health -p 'say hi'` → **exit 75**, stderr
   `standby: lease held by <Mac A's id>`, and nothing written — `peer` behaves exactly like a standby whenever
   the answer is conclusive.
5. **Mac B**: `claude-auto -p 'say hi'` (no `--task`) → **runs**. Vanessa Live is not lease-gated on any role.
6. **Mac B**: `claude-auto --take-lease` → `TOOK the lease`, prints the new holder/expires. **Mac A**'s next
   `--task` run now exits 75; **Mac B**'s next `--task` run now runs. No role file was touched — the lease
   itself moved.
7. **Mac B**: `claude-auto --release-lease` → `RELEASED the lease`. **Mac A**'s next `--lease-check` now sees
   `ACQUIRED` again (the document is free) rather than a foreign holder.
8. Read each Mac's `macHeartbeat.<its id>` document from the store (`mac-sync.sh status` gives a one-screen
   version of the same read) and confirm both are recent, and each names the right `machineId`.
9. Both Macs: `mac-sync.sh status` and `mac-sync.sh diff` — see `integrations/mac-sync/README.md`.

**Legacy canary (unchanged, primary/standby):** the same shape still works with `primary`/`standby` in place
of `peer` and the one-command promotion in `REMOTE-ACCESS.md` in place of `--take-lease` — proved by
`lease-tests.sh` sections B-E, which run unmodified against the current script and still pass.

## Why the free route may not "kick in" — doctor, installer, interactive opt-in (2026-10-09)

Steven: "fix whatever is preventing OmniRoute from kicking in when I hit my Claude token limit." OmniRoute running
on `:20128` is only one of the preconditions. The launcher is **design + scripts, not installed on the Mac**; the Mac
still runs the older `claude-auto` / `free_mode_guard.py` under `~/Applications/claude-fallback`. The likely blockers,
in the order `claude-auto --doctor` checks them:

1. OmniRoute does not answer the health URL the launcher uses. It used `/healthz` only; it now accepts `/healthz` **or** `/api/health` (launcher, probe, tier selection), so an OmniRoute that serves only one of them no longer defers every free run with exit 75.
2. `~/.config/omniroute/.env` missing, not `chmod 600`, or `OMNIROUTE_API_KEY=` empty (the launcher exits 78).
3. No free provider configured in OmniRoute (the route would exist but go nowhere).
4. `claude-auto` / `probe.sh` not installed next to each other in `~/.local/bin`, stale versus the repo, or an older `claude-auto` earlier in `PATH` (the old `~/Applications/claude-fallback` launcher still being the one that runs).
5. The probe LaunchAgent not written or not loaded (nothing restores the subscription; stale modes).
6. No role file (this Mac is `standby`: a `--task` run whose lease check cannot complete is deferred).
7. Runner tasks still calling plain `claude`, or `claude-auto` without `--task <name>` (a limit is never *detected* for plain `claude`; an unnamed task is deferred on the free route by the PII gate).
8. **The interactive session.** A running interactive session cannot be re-pointed, and a new one with no `--task` is deferred on the free route by design. That is what `--interactive-free` (below) is for.

**`claude-auto --doctor`** — read-only (writes no file, calls no `claude`, prints no secret value). One line per check:
`PASS`, `WARN` or `FAIL` with `| fix: <the exact line>`; exit 0 when there is no `FAIL`. It checks: OmniRoute health;
`omniroute --version` (>= 3.8.50); `.env` exists, mode 600, key NAME set; `omniroute providers list` shows >= 1 provider;
`claude-auto` + `probe.sh` installed side by side and identical to the source copy (set `CLAUDE_RUNNER_REPO_DIR`, or run
the doctor from the repo copy); `which claude` / `which claude-auto` and whether the old `claude-fallback` launcher is on
`PATH` or referenced from a shell profile or LaunchAgent; the probe LaunchAgent plist and whether `launchctl` has it
loaded; the role file; `state/mode` and its age; the last 5 `claude-auto.log` lines (that log never holds task output; each is cut to 160 characters); whether `runnerctl list` lines use `claude-auto` and `--task`; whether any limit was ever recorded in `limit-samples.log`.

**`install-failover.sh [--dry-run]`** — macOS bash 3.2 safe. Asks y/N before **each** change, default N (Enter, EOF or anything
but y/yes = no). `--dry-run` asks and changes nothing. On a yes it: copies `claude-auto.sh` -> `~/.local/bin/claude-auto` and
`probe.sh` -> `~/.local/bin/probe.sh` (an existing different copy is kept as `.bak.<time>`); writes `~/.config/claude-runner/role`
= `peer`; creates an **empty** `~/.config/omniroute/.env` (`OMNIROUTE_API_KEY=`, `chmod 600`) and tells Steven to paste the
value himself; writes the probe LaunchAgent plist (every 900 s) and `launchctl load -w` it. It never touches the Claude login or
settings, never asks for or writes a key value, never edits `PATH`, a profile or a runner task (it prints the exact
`claude-auto --task <name> -p ...` replacement for him to apply), and never removes the old launcher. It ends by running `--doctor`.

**`claude-auto --interactive-free [claude args]`** — a person starts a **new** interactive session on the free route, on purpose.
Default off: nothing calls it, and a plain `claude-auto` interactive session on the free route is still deferred.
It starts only if **all** hold: stdin and stdout are a terminal; not headless (`-p`); no `--pii`; `--task`, if given, does not match
the client-data patterns (`DEFAULT_PII_TASKS` + `pii-tasks.txt`, case-insensitive, same list the PII gate uses); the current
directory does not look like client data (`wiki/clients`, CRM, ISA, loan, borrower ...); OmniRoute answers; the key loads.
It then prints `FREE ROUTE - no client data, nothing from CRM/ISA/loan files`, and the session starts only if he types `FREE`.
The session is launched with `--settings state/interactive-free-settings.json`, which registers **`claude-auto --guard-hook`**
as a `UserPromptSubmit` and `PreToolUse` hook: it reads the hook JSON (prompt and tool input only), and exits 2 (block) when it sees
a client-data pattern (client wiki paths, Lofty/Zoho/CRM/ISA names, loan-file/borrower words, SSN shapes, `.config/omniroute|openrouter|claude-runner`, `.env`), and also when it cannot read its input (fails closed). It logs that it
blocked, never what. It is a net, not a proof (prompt text can still say anything not on its list) - the same stance as the
launcher-level gate. Tier 3 (OpenRouter) is **not** offered to interactive sessions. The route state is not changed: when he closes the session
the next `claude` is the subscription again. The existing `free_mode_guard.py` lives only on the Mac and its hook interface is not in this repo, so this guard is a new, self-contained one; chaining the old one in is a decision for the Mac.

Tests: `./failover-tests.sh` covers all of the above (stub `claude`/`curl`/`omniroute`/`launchctl`/`runnerctl`, temp `HOME`, a pty via `script(1)` for the interactive cases).
**Not verifiable without the Mac:** that `omniroute providers list` is the real command and prints a countable list; the
`runnerctl list` output shape; that Claude Code's `--settings` flag merges the hook settings with Steven's own and that
`UserPromptSubmit`/`PreToolUse` hooks exit-2 blocking behaves as assumed in his build; whether `launchctl load -w` is accepted
by his macOS version (newer systems prefer `bootstrap`); what the old `claude-fallback` actually is and whether anything else
(a Shortcut, an alias, a function) still calls it; and the real usage-limit wording at the Mac.

## Three-tier failover (2026-10-09) — subscription, then free, then a capped paid backup

Steven's rule: free tokens the moment the Claude subscription is exhausted, back to the subscription when it
resets, and OpenRouter (paid) only as a **third** backup after Claude is out **and** OmniRoute has stopped
working — with a spending cap. Tiers 1 and 2 are the machinery above, unchanged. Tier 3 is new, **off by default**.

```
                       every invocation (bash, per process; the route is fixed when claude starts)
                                          |
 client-data / unknown task / no --task ──┴──▶ NEVER tier 2 or 3: local model if configured, else exit 75
                                          |   (the PII gate above, evaluated first; local-only mode never reaches tier 3)
 T1  Claude subscription  ── plain `claude`, OAuth, no proxy env. NEVER through OmniRoute or OpenRouter
        |  limit detected (exit 75 → runner retries)          ▲ probe.sh every 15 min: subscription usable → mode=subscription
        ▼                                                      │   (also clears the exhaustion streak; the spend ledger stays)
 T2  OmniRoute free combo ── 127.0.0.1:20128, auto/coding:free. FreeAPI-catalogue providers are added
        |                    INSIDE OmniRoute (providers add …), not as a second router.      mode=free-fallback
        |  OmniRoute /healthz fails   OR   free combo returns 429 / 5xx / all-providers-exhausted FREE_FAIL_N (3) times in a row
        |  AND  ~/.config/openrouter/enabled exists  AND  OPENROUTER_MONTHLY_CAP_USD > 0  AND  ledger spent + headroom <= cap
        ▼                                                      ▲ checked on EVERY invocation: healthz up and combo not in a streak
 T3  OpenRouter (paid) ── https://openrouter.ai/api, key as ANTHROPIC_AUTH_TOKEN,     │  → back to T2 at once (mode=free-fallback).
                          ANTHROPIC_API_KEY="" (blank, not unset).  mode=paid-backup   │  An exhausted-but-up combo is re-tried every
                          Any condition above false → exit 75 (deferred), nothing sent │  FREE_RETRY (300 s) so T3 cannot stick.
```

**Where each file lives (names only; values never in the repo, a log, `--status` or a command line)**
| File | Holds |
|---|---|
| `~/.config/openrouter/enabled` | Empty file. Its existence is Steven's switch for tier 3. Delete it to turn tier 3 off instantly |
| `~/.config/openrouter/.env` (`chmod 600`) | `OPENROUTER_API_KEY=…`, `OPENROUTER_MONTHLY_CAP_USD=25` (example; unset or `0` = tier 3 never used), optional `OPENROUTER_MODEL=…` |
| `~/.config/omniroute/state/openrouter-ledger.env` | `month=` (UTC) `spent_usd=` `updated_at=`. Owner-only. Unreadable, wrong owner or garbled = tier 3 **refuses** (it is never silently reset). A new UTC month starts at 0 |
| `~/.config/omniroute/state/free-fails` | `<streak> <epoch of last>` — consecutive exhaustion-class failures of the free combo. Removed on the first free success and on a subscription restore |
| `state/mode`, `route.env` | gain the value `paid-backup` (one word, same file as before) |

**The two cap layers.** (1) *Local ledger.* Before a tier-3 run the launcher refuses when `spent + headroom > cap`
(`OPENROUTER_HEADROOM_USD`, default 1.00 = the most one invocation is assumed to cost). After the run it settles:
if OpenRouter's key endpoint can be read, `spent = max(ledger, usage_monthly)`; if not, `spent += headroom` (a
deliberate over-estimate). The ledger can only be wrong on the safe side. It is a *launcher-level* cap: it cannot stop
one runaway invocation from spending past the headroom, and it does not see use of the key from anywhere else except
through `usage_monthly`. (2) *OpenRouter's own limit on the key plus a small prepaid balance* — this is the layer that
actually cannot be exceeded; the ledger is the early-warning in front of it. Steven sets both.

**Steps Steven performs (nothing here is done by an agent; each is an account, credential or spend action)**
1. Create an OpenRouter account; create an **API key dedicated to this launcher** (name it e.g. `claude-auto-backup`).
2. On that key, set its **credit limit to $25** (monthly reset if the dashboard offers one). Cap value is Steven's decision of 2026-10-09.
3. Load **no more than $25** of prepaid credit — a small balance, so the account itself cannot be drained even if the key limit is misconfigured. Turn auto-top-up **off**.
4. `mkdir -p ~/.config/openrouter && chmod 700 ~/.config/openrouter`, then create `~/.config/openrouter/.env` containing the two lines `OPENROUTER_API_KEY=<paste>` and `OPENROUTER_MONTHLY_CAP_USD=25`; `chmod 600` it. (Optional third line `OPENROUTER_MODEL=<an OpenRouter model id>`; the default in the script, `anthropic/claude-sonnet-4.5`, is **unverified** — pick a cheap id you have checked in the dashboard.)
5. Deploy the patched `claude-auto.sh` and `probe.sh` per *Install on the Mac*; confirm `claude-auto --status` shows `tier3_enabled_file=no` and `tier3_cap_usd=25`.
6. Only when ready to allow spending: `touch ~/.config/openrouter/enabled`. To stop: `rm` that file.
7. First live check (costs a few cents): `claude-auto --force free --no-pii -p 'say hi'` with OmniRoute stopped and `enabled` present → the reply comes through OpenRouter (Activity page shows it), `claude-auto --status` shows a non-zero `tier3_spent_usd_this_month`. Restart OmniRoute → the next call goes to OmniRoute again. `claude-auto --force subscription` afterward.
8. Add FreeAPI-catalogue providers to **OmniRoute** (`omniroute providers add … --credential-env …`, as in *Free-key sources*) — not as a second router. Do not add the Claude subscription to OmniRoute.

**Hysteresis and how each hop reverses.** T1 comes back only through `probe.sh` (unchanged logic, plus it clears the streak). T2 beats T3 *per invocation*: the launcher checks OmniRoute's `/healthz` live before every non-client run, so the first call after OmniRoute is healthy goes to T2 and rewrites the mode to `free-fallback`; `probe.sh` does the same while still limited. If OmniRoute is up but the free combo is exhausted, T3 covers it and the combo is re-tried every `FREE_RETRY` seconds — one success clears the streak. Tier 3 therefore never stays on once either T1 or T2 is available, bounded by that retry interval.

**Behaviour to know.** A headless run on tier 2 that fails with the exhaustion class now exits **75** (like a detected subscription limit) so the runner retries on the next route; other failures keep their exit code. Interactive sessions cannot be re-pointed mid-run, and a tier-3 session is a **child process** of the launcher (not `exec`) so the ledger can be settled when it ends. `--status` prints the cap, the month's spend and the streak, never the key. Logs say `route=paid-backup`, counts, USD and the trigger reason — never task output or a key.

**Verified here (sandbox 2026-10-09)** — `./failover-tests.sh` (248 assertions, including doctor/installer/interactive-free) and the untouched `./lease-tests.sh` (158) pass; `bash -n` and `/usr/bin/shellcheck` clean on all four scripts. Executed against a stub `claude`, a stub `curl` and a temp `HOME`: T1 default; limit → T2 on the next call; T2 down → T3 only with enabled file + cap; refusal with no enabled file, no/zero/non-numeric cap, `.env` not `chmod 600`, over cap, exactly-at-cap allowed, key endpoint nearly spent, garbled ledger, old-month ledger ignored; client-data tasks (renamed, unknown, no task, `--no-pii` override, `--pii`, interactive, `local-only`, `paid-backup` mode) never reach T2 or T3; exhaustion streak of 3 → T3, 2 → not; T3 → T2 on health and on retry; probe T3 → T2; probe restore to T1 from both modes; the key never appears in logs, status, output or a curl argument.

**Read from OpenRouter's docs (via web search; the OpenRouter site itself was egress-blocked from the sandbox, so these are search-result excerpts of the official pages, not a direct read)**: Claude Code works against `https://openrouter.ai/api` with the OpenRouter key as `ANTHROPIC_AUTH_TOKEN` and `ANTHROPIC_API_KEY` set to an empty string (unset may fall back to Anthropic); a cached Anthropic login can conflict (`/logout`); `GET https://openrouter.ai/api/v1/key` with a Bearer header returns the key's `limit`, `limit_remaining`, `limit_reset`, `usage`, `usage_daily/weekly/monthly` (USD; `null` limit = unlimited); a 402 means the key limit or balance is spent. OpenRouter recommends Anthropic models for Claude Code and only guarantees the Anthropic first-party provider.

**Could not be verified without the Mac (or an OpenRouter account) — mark each "to verify on the Mac"**
- That a real OpenRouter key works end to end with the installed Claude Code build, including whether the cached subscription login in the Mac's Claude Code conflicts with `ANTHROPIC_AUTH_TOKEN` (the same question already open for tier 2) and whether the launcher's child process needs the `/logout` workaround.
- The default model id `anthropic/claude-sonnet-4.5`; and that `ANTHROPIC_DEFAULT_*_MODEL` carries an OpenRouter id correctly.
- The exact dashboard steps and field names for the key credit limit and its reset period, and whether `usage_monthly` is present and in USD in the response today (the script falls back to the headroom estimate if it is missing).
- That the key's limit stops spend at the cap (the layer the ledger relies on to backstop it), and whether OpenRouter deducts failed requests.
- The exact text OmniRoute returns when every free provider is exhausted — `FREE_EXH_RE` covers 429/5xx and "all providers exhausted"-style wording but is built from OmniRoute's documented behaviour, not a recorded hit; tighten from `limit-samples.log` (`branch=`) after the first real one.
- That the OmniRoute free combo, and OpenRouter, handle Claude Code's tool-use format well enough for the runner's prompts.
- That `mac-verify.sh` (not in this folder) tolerates `mode=paid-backup`; check its allowed-mode list before deploying.
- `launchd` environment for the probe is unchanged; nothing new there, but tier 3 reads `$HOME/.config/openrouter`, so the runner's `HOME` must be Steven's.

## State-file hygiene
`state/` is created mode 700 and every file in it 600 (`umask 077`). `route.env` is a data file: the six
known keys are read with `sed` and validated (`mode` must be one of three words, numbers must be digits, the
reason is charset-limited) — it is **never sourced** (F-V2-18: it used to be, so anything that could write it
had shell execution in the launcher). A `route.env` that is not a plain file owned by the user with mode
600/400 is discarded and reset to `subscription`. The `.env` mode check reads GNU `stat -c` first and
validates the result as octal before trying BSD `stat -f` (F-V2-15: the BSD-first form prints a filesystem
report on Linux).

## Free-key sources (names only — values live in OmniRoute's encrypted store, never here)
OmniRoute 3.8.50 does **not** read provider keys from environment variables (grep of its source,
2026-09-22: no `OPENROUTER_API_KEY`/`BYTEZ_API_KEY` reader). Keys enter through the dashboard at
`http://127.0.0.1:20128` or the CLI, which reads the value from an env var name and never echoes it:
```bash
set -a; . ~/.config/omniroute/.env; set +a          # the file holds NAME=value lines, chmod 600, Mac only
omniroute providers add openrouter --credential-env OPENROUTER_API_KEY
omniroute providers add nvidia     --credential-env NVIDIA_API_KEY
omniroute providers add bytez      --credential-env BYTEZ_API_KEY
omniroute providers test-all
```
| Source Steven listed | OmniRoute provider id | Env NAME in `~/.config/omniroute/.env` | Verified today |
|---|---|---|---|
| openrouter.ai/models?q=free | `openrouter` (free model set `openrouter-free`) | `OPENROUTER_API_KEY` | page **egress-blocked**; OmniRoute's catalog: 50 req/day free, 1000/day after a one-time $10 top-up |
| build.nvidia.com/models | `nvidia` / `nvidia-nim` | `NVIDIA_API_KEY` | page **egress-blocked**; OmniRoute README: ~40 RPM free |
| bytez.com/models | `bytez` | `BYTEZ_API_KEY` | page **egress-blocked**; provider id present in the catalog |
| github.com/tashfeenahmed/freellmapi | not a key source — a second local aggregator (Docker, `:3001`, keys via its own dashboard) | — | README read; redundant next to OmniRoute, skip |
| github.com/cheahjs/free-llm-api-resources | catalogue only | — | **404 on GitHub 2026-09-22** — use OmniRoute's `docs/reference/FREE_TIERS.md` (audited 2026-09-03) instead |
Free-tier keys are still credentials: a leaked one burns the quota and, on some providers, a card on file.

## Install on the Mac (Steven, ~15 minutes) — HALT items in bold
1. `npm install -g omniroute@3.8.50` (already present per the inventory; `omniroute --version` must print 3.8.50 or newer). Start it, open `http://127.0.0.1:20128`, **create the dashboard password and an API key** → `~/.config/omniroute/.env` as `OMNIROUTE_API_KEY=…`, then `chmod 600` that file.
2. **Add the free providers** with the `providers add … --credential-env` lines above. Do not add the Claude subscription as an OmniRoute provider (its OAuth-in-a-gateway path keeps the subscription token inside a third-party process — not for the business Mac).
3. Copy `claude-auto.sh` and `probe.sh` to `~/.local/bin/` (as `claude-auto` and `probe.sh`, the same directory — the launcher finds the probe next to itself), `chmod +x`, and point the `vanessa` launcher and the runner's task wrapper at `claude-auto` (the current one is replaced, not run beside it). **Every runner task passes `--task <its name>`**; a task with no name is deferred whenever the route is free. Tasks that should keep running on free providers go on the allow-list (`free-ok-tasks.txt`) **only after the security steward has read what they read**.
3b. **Declare this Mac's role** — one line, and it is the whole of what makes the second Mac safe:
   `mkdir -p ~/.config/claude-runner && printf 'primary\n' > ~/.config/claude-runner/role` on the Mac that runs
   the tasks today, `standby` on the other. **Do this before pointing the runner at `claude-auto`**: an absent
   role file reads as `standby`, so a Mac with no role file whose lease check cannot complete will defer every
   task — loudly and safely, but it will defer. Then `claude-auto --lease-check` on each Mac; the one on the
   primary is the run that creates `state/taskLease`. Full runbook: `docs/SECOND-MAC-SETUP.md`.
4. LaunchAgent `~/Library/LaunchAgents/com.stevenshearrill.omniroute-probe.plist`: `ProgramArguments` = `/bin/bash`, `$HOME/.local/bin/probe.sh`; `StartInterval` = `900`; `EnvironmentVariables.PATH` = `$HOME/.npm-global/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin` (where `claude` lives). `launchctl load` it.
5. `claude-auto --status` → `mode=subscription`. `claude-auto --force free --no-pii -p 'say hi' --output-format json` → the reply comes from OmniRoute (its `X-OmniRoute-Decision` response header names the provider; `omniroute health` shows the call). `probe.sh --now` → mode back to `subscription`. `mac-verify.sh` → `claude-auto` and `probe.sh` "match the repo copy", route mode `ok subscription`.
   A forced mode holds until the next probe finds the subscription healthy — at most 15 min with the LaunchAgent loaded — so run a forced test within that window or re-force before each step; `--force` stamps the state as freshly probed so the launcher itself does not undo it on the next call.
6. **Run the PII canary below with the security steward before enabling the runner on `claude-auto`**, and the
   lease canary in *The task lease* above on **both** Macs.

## PII canary (the test that closes F-E8-60 — every bypass V2 found, not only the ordering that already passed)
`~/.config/omniroute/canary/client-canary.txt` holds an obviously fake record: `CANARY CLIENT Jane Q.
Sample · SSN 000-00-0000 · loan CANARY-0001`. `P='Summarize ~/.config/omniroute/canary/client-canary.txt'`.
With OmniRoute's request log open and the probe LaunchAgent **unloaded for the duration** (a healthy probe
would restore the subscription mid-canary), run each line; **every one of 1–8 must exit 75 and zero requests
may reach `:20128`**; 9 and 10 must reach it (the legitimate path); 11 is the hook's test:
1. `claude-auto --force free --task lofty-crm-sync -p "$P"` — client task, options first (the ordering the first draft handled).
2. `claude-auto --force free -p "$P" --task lofty-crm-sync` — the same task with `--task` **after** the claude arguments (F-V2-07).
3. `claude-auto --force free -p "$P"` — no `--task` at all (F-V2-08).
4. `claude-auto --force free --task lofty-crm-sync-v2 -p "$P"` — a renamed client task (F-V2-09).
5. `claude-auto --force free --task some-brand-new-task -p "$P"` — a task nobody has classified.
6. `claude-auto --force free --task lofty-crm-sync --no-pii -p "$P"` — `--no-pii` on a client task: the deny-list must win.
7. `claude-auto --force free` (interactive, no `-p`, no task) — must defer, not open a session on a free provider.
8. `printf '%s\n' '*Refresh*' >> ~/.config/omniroute/free-ok-tasks.txt`, then `claude-auto --force free --task Lofty-CRM-Refresh -p "$P"` — a client task in **different case** against a broad allow-list entry (F-H3b-01). The log must read `matches client-data pattern 'lofty-*'`, not `not on the free-OK allow-list`. **Remove that line from `free-ok-tasks.txt` again before step 9.**
9. `claude-auto --force free --task weather-news-refresh -p 'say hi' --output-format json` — allow-listed: the reply must come **from OmniRoute** (`X-OmniRoute-Decision`), with `VANESSA_PII_OK=0` in the task's env.
10. `claude-auto --force free -p 'say hi' --no-pii` — explicit `--no-pii`, no task: from OmniRoute.
11. `claude-auto --force free --task weather-news-refresh -p "$P"` — an allow-listed task whose **prompt** drags in the canary: the launcher cannot see prompt text, so **the existing guard hook must block this** before any request; grep OmniRoute's log for `CANARY` — it must be absent.
12. `claude-auto --force subscription`. Record all results in `docs/MASTER-FINDINGS.md` under F-E8-60. Fail any → the runner stays on plain `claude` until fixed.

## Verified in the sandbox (2026-09-22) / not verified
- `npm --prefix /tmp/fr5b-npm install omniroute` → 3.8.50, MIT, exit 0; `omniroute --version` → `3.8.50`; provider ids `openrouter`, `openrouter-free`, `nvidia`, `nvidia-nim`, `bytez` present in its catalog; `auto/<category>:free` tier documented; `/healthz` documented; `providers add --credential-env` documented; Claude Code root URL without `/v1` documented.
- Both scripts pass `bash -n` and `shellcheck` (H3: 0.11.0; H3b re-ran 0.9.0 — both default and `-S style`, no output). **Executed** in the cloud sandbox by V2, H3 and H3b with a stub `claude`, a dead `:20128`, a live stand-in `/healthz` and a throwaway `HOME` — no `claude` login, no Mac, no OmniRoute server: every case in the canary above, the six false-positive strings from F-V2-10, a broken probe binary (escalation at the 4th run), a year-2100 `reset_at`, a world-writable and a shell-injected `route.env`, and the `.env` mode check on Linux. The `env -u` and `mktemp` forms are the macOS ones with GNU fallbacks; the `stat` form is GNU-first-then-BSD, validated (F-V2-15).
- H3b (2026-09-22) re-ran every one of those cases against the **pre-fix scripts restored from git** as well as the current ones, so each claim above has a recorded before *and* after rather than an after alone. Doing so found one bypass H3's rewrite left open — the case-sensitive deny-list, F-H3b-01, now fixed and canary step 8 — and one residual the regex cannot close: see the next bullet.
- The lease gate (P7, 2026-09-22) is **executed**, not reviewed: `./lease-tests.sh` runs 102 assertions against
  a stub `claude` that implements the five lease steps against a fake document — so the `if_version` pin really
  is refused when the version moves, rather than being asserted. Covered: primary holds → runs; standby with a
  live foreign lease → 75 with nothing written; standby with an **expired** foreign lease → acquires and runs;
  the pinned-write race and the step-4 race → 75 with the other Mac's write left standing; check fails on
  PRIMARY → runs; check fails on STANDBY → defers; an absent, world-writable or junk role file → standby; a
  timeout on both the `timeout(1)` and the built-in-watchdog paths; the cache serving four tasks from one check;
  a cached FOREIGN expiring with the lease it saw; a role flip busting the cache; two concurrent invocations
  paying for one check; and a full regression pass over F-V2-07/08/09/10, F-H3b-01, the `--no-pii` override, the
  `route.env` injection and the state-file modes. Recorded in `docs/findings/findings-P7.json`. **Not** covered:
  anything that needs a real Mac — see that file's F-P7-10.
- Known residual (F-H3b-02, **not** fixed): `LIMIT_RE` is matched against the error envelope, and in `--output-format json` that envelope includes the CLI's `result` field, which on a failed run is the model's own text. A task that both **fails** and produces text such as "the escrow usage limit reached its cap" still flips the route to `free-fallback`. It cannot leak anything — the gate is closed on the new route and client tasks defer — and the 15-minute probe restores the subscription, so it costs one deferred cycle. Narrowing it further means guessing at the real limit wording, which this file has said twice is unconfirmed; tighten it from `limit-samples.log`'s `branch=` field once a real hit is recorded on the Mac, not before.
- Not verified: the exact wording of today's usage-limit message as `claude -p` prints it on the Mac — `LIMIT_RE` is built from the strings in the 2.1.278 binary, and `limit-samples.log` records which branch fired on each real hit, so it can be tightened from the log; whether a free combo answers Claude Code's tool-use format well enough for the runner's prompts (expect degraded, not equal, output); OmniRoute's local-Ollama provider id for Jarvis (set `OMNIROUTE_LOCAL_MODEL` only after `omniroute providers list` shows it).
