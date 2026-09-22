# OmniRoute failover — subscription first, free providers only while limited, never with client data

**Written 2026-09-22 · design + scripts · not yet installed on the Mac.** Owner: Integration Engineer
(under CTO Innovator). Security lens: Elena / ecc-security-steward. Replaces the older `claude-auto`
already on the Mac (`docs/inventory/mac-task-descriptions.md`: "Claude subscription first; when its limit
is hit, Claude Code runs on FREE providers via OmniRoute (loopback :20128, combo free-only) with a
client-data guard hook") whose guard coverage the audit could not verify — **F-E8-60**.

**Hardened 2026-09-22 by H3 (Security Engineer)** after the verification pass (`docs/findings/findings-V2.json`
F-V2-07..18) executed the first draft and proved its PII gate failed open. Every change below is sandbox-tested
against a stub `claude`; the exact before/after runs are in `docs/findings/findings-H3.json`.

Steven's requirement, verbatim: *"Ensure model switch to the OmniRoute free LLM models when subscription
runs out and then switches back to subscription model when subscription refreshes."*

## Files
| File | Role |
|---|---|
| `claude-auto.sh` | Launcher. Decides the route per invocation, publishes the mode, gates client-data work — **closed by default**. Drop-in for `claude`: `claude-auto [--task NAME] [--pii\|--no-pii] [--force …] [--] <claude args>`; the options are recognised in any position before `--` |
| `probe.sh` | Every 15 min: if the route is not `subscription`, probes the subscription with one 1-turn, no-tool call and restores it. Four inconclusive probes in a row → `state/NEEDS-STEVEN` + fall back to plain `claude` |
| `~/.config/omniroute/.env` | On the Mac only, `chmod 600`. Holds `OMNIROUTE_API_KEY` (the key OmniRoute's dashboard issues for its own loopback endpoint). **Never a provider key, never committed** |
| `~/.config/omniroute/free-ok-tasks.txt` | Optional. Task-name glob patterns **permitted on a free provider**, one per line, `#` comments. Adds to `DEFAULT_FREE_OK_TASKS` in the launcher. A name goes in here only with the security steward's sign-off |
| `~/.config/omniroute/pii-tasks.txt` | Optional. Client-data glob patterns, one per line. Adds to `DEFAULT_PII_TASKS`. A match here wins over the allow-list and over `--no-pii` |
| `~/.config/omniroute/state/` (mode 700) | `mode` (one word), `route.env` (parsed, never sourced), `claude-auto.log`, `probe.log`, `limit-samples.log` (exit status + hash per detected limit, never task output), `probe-failures` (consecutive inconclusive probes), `NEEDS-STEVEN` (escalation marker — its presence is a `NEED` in `mac-verify.sh`) |

## How it works
```
claude-auto ──reads──▶ state/mode ─┬─ subscription  → plain `claude`, OAuth login, no proxy env at all
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
4. LaunchAgent `~/Library/LaunchAgents/com.stevenshearrill.omniroute-probe.plist`: `ProgramArguments` = `/bin/bash`, `$HOME/.local/bin/probe.sh`; `StartInterval` = `900`; `EnvironmentVariables.PATH` = `$HOME/.npm-global/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin` (where `claude` lives). `launchctl load` it.
5. `claude-auto --status` → `mode=subscription`. `claude-auto --force free --no-pii -p 'say hi' --output-format json` → the reply comes from OmniRoute (its `X-OmniRoute-Decision` response header names the provider; `omniroute health` shows the call). `probe.sh --now` → mode back to `subscription`. `mac-verify.sh` → `claude-auto` and `probe.sh` "match the repo copy", route mode `ok subscription`.
   A forced mode holds until the next probe finds the subscription healthy — at most 15 min with the LaunchAgent loaded — so run a forced test within that window or re-force before each step; `--force` stamps the state as freshly probed so the launcher itself does not undo it on the next call.
6. **Run the PII canary below with the security steward before enabling the runner on `claude-auto`.**

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
- Known residual (F-H3b-02, **not** fixed): `LIMIT_RE` is matched against the error envelope, and in `--output-format json` that envelope includes the CLI's `result` field, which on a failed run is the model's own text. A task that both **fails** and produces text such as "the escrow usage limit reached its cap" still flips the route to `free-fallback`. It cannot leak anything — the gate is closed on the new route and client tasks defer — and the 15-minute probe restores the subscription, so it costs one deferred cycle. Narrowing it further means guessing at the real limit wording, which this file has said twice is unconfirmed; tighten it from `limit-samples.log`'s `branch=` field once a real hit is recorded on the Mac, not before.
- Not verified: the exact wording of today's usage-limit message as `claude -p` prints it on the Mac — `LIMIT_RE` is built from the strings in the 2.1.278 binary, and `limit-samples.log` records which branch fired on each real hit, so it can be tightened from the log; whether a free combo answers Claude Code's tool-use format well enough for the runner's prompts (expect degraded, not equal, output); OmniRoute's local-Ollama provider id for Jarvis (set `OMNIROUTE_LOCAL_MODEL` only after `omniroute providers list` shows it).
