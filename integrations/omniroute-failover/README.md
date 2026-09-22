# OmniRoute failover — subscription first, free providers only while limited, never with client data

**Written 2026-09-22 · design + scripts only · not yet installed on the Mac.** Owner: Integration Engineer
(under CTO Innovator). Security lens: Elena / ecc-security-steward. Replaces the older `claude-auto`
already on the Mac (`docs/inventory/mac-task-descriptions.md`: "Claude subscription first; when its limit
is hit, Claude Code runs on FREE providers via OmniRoute (loopback :20128, combo free-only) with a
client-data guard hook") whose guard coverage the audit could not verify — **F-E8-60**.

Steven's requirement, verbatim: *"Ensure model switch to the OmniRoute free LLM models when subscription
runs out and then switches back to subscription model when subscription refreshes."*

## Files
| File | Role |
|---|---|
| `claude-auto.sh` | Launcher. Decides the route per invocation, publishes the mode, gates client-data work. Drop-in for `claude`: `claude-auto [--task NAME] [--pii] -- <claude args>` |
| `probe.sh` | Every 15 min: if the route is not `subscription`, probes the subscription with one 1-turn, no-tool call and restores it |
| `~/.config/omniroute/.env` | On the Mac only, `chmod 600`. Holds `OMNIROUTE_API_KEY` (the key OmniRoute's dashboard issues for its own loopback endpoint). **Never a provider key, never committed** |
| `~/.config/omniroute/state/` | `mode` (one word), `route.env`, `claude-auto.log`, `probe.log`, `limit-samples.log` (redacted) |

## How it works
```
claude-auto ──reads──▶ state/mode ─┬─ subscription  → plain `claude`, OAuth login, no proxy env at all
                                   ├─ free-fallback → ANTHROPIC_BASE_URL=http://127.0.0.1:20128
                                   │                  ANTHROPIC_AUTH_TOKEN=$OMNIROUTE_API_KEY
                                   │                  ANTHROPIC_MODEL=auto/coding:free (+ every alias)
                                   │                  CLAUDE_CODE_OAUTH_TOKEN / ANTHROPIC_API_KEY unset
                                   │                  client-data task? → exit 75 (deferred) or local model
                                   └─ local-only     → same proxy, model pinned to OMNIROUTE_LOCAL_MODEL (Jarvis)
probe.sh (LaunchAgent, 15 min) ──▶ subscription usable again? → state/mode = subscription
```
The route is fixed when a process starts. A headless task that hits the limit mid-run is detected, the
state flips, and the task exits **75** so `claude-runner` retries it on the new route. An interactive
Vanessa Live session cannot be re-pointed mid-conversation: Steven sees the limit message, types
`vanessa` again, and the launcher routes the new session. That is a real limit, stated on purpose.

## The detection signal (exact)
There is no documented "usage limit" event for `claude -p`; the docs say a failure inside the run is
printed as the result on stdout and the exit code is non-zero (`code.claude.com/docs/en/headless`, read
2026-09-22). So the launcher treats a subscription run as limited when **both** hold:
1. the run failed — exit code ≠ 0, or the JSON result carries `"is_error": true`; and
2. stdout+stderr match `LIMIT_RE` (case-insensitive): `usage limit`, `hit your … limit`, `limit reached`,
   `out of usage`, `resets at/in`, `rate_limit` / `rate_limit_error` (the API's 429 body type), or a bare 429.

An epoch after a `|` in the message (older CLI builds printed `…limit reached|<unix time>`) becomes
`reset_at`; otherwise `reset_at=0` and the probe simply polls. **Every real hit is appended, redacted, to
`state/limit-samples.log` — after the first genuine hit on the Mac, tighten `LIMIT_RE` to that text.** A
529 "overloaded" or a plain network error is not a limit and does not flip the route; Claude Code's own
`--fallback-model` covers overload, not usage limits (CLI reference, read 2026-09-22).

## Switch-over (what actually changes)
Only environment variables, only for that process: `ANTHROPIC_BASE_URL` = the OmniRoute root (no `/v1` —
OmniRoute's own Claude Code guide, `docs/reference/CLI-TOOLS.md`), `ANTHROPIC_AUTH_TOKEN` = OmniRoute's
key, `ANTHROPIC_MODEL` and `ANTHROPIC_DEFAULT_{OPUS,SONNET,HAIKU,FABLE}_MODEL` = the free combo, and an
explicit `--model X` argument rewritten to the combo so the runner's seat names resolve. The subscription
credential is unset so it can never be sent to the proxy. `~/.claude/settings.json` is **not** edited.

## Switch-back (the probe)
`probe.sh` runs every 15 min. In `subscription` mode it exits immediately (no cost). Otherwise, unless
`reset_at` is still in the future, it runs `claude -p 'Reply with exactly: OK' --max-turns 1
--disallowedTools '*' --no-session-persistence --output-format json` with the proxy variables stripped.
`is_error:false` → mode back to `subscription`; a limit match → stay, refresh `reset_at`; anything else →
mode kept, sample logged, exit 1 (never guess). The launcher also re-probes itself if the state is older
than 25 min and `reset_at` has passed, so a stopped LaunchAgent cannot strand the Mac on free providers.

## PII policy — not optional
While the route is anything but `subscription`, **no prompt that contains client PII, loan-file text,
CRM records, ISA-line content, credit data or health data may leave the Mac.** Free tiers are paid for
with your prompts: OmniRoute's own free-tier guide notes at least one provider logs every request.
| Task class | On `free-fallback` |
|---|---|
| Client / loan / CRM / ISA / health tasks (`DEFAULT_PII_TASKS` in the launcher, plus `~/.config/omniroute/pii-tasks.txt`, one name per line) | **Deferred** — exit 75, runner retries after the reset. If `OMNIROUTE_LOCAL_MODEL` names the local Jarvis model as an OmniRoute provider, they run there instead (`mode=local-only`, `VANESSA_PII_OK=1`) |
| Deck syncs, feeds, weather, news, rates, backups, self-tests, coding | Run on the free combo (`VANESSA_PII_OK=0`) |

The flag every task can read: `VANESSA_ROUTE_MODE` (`subscription` / `free-fallback` / `local-only`),
`VANESSA_PII_OK` (`1` / `0`), and the file `~/.config/omniroute/state/mode`. Task prompts add one line:
*"If `VANESSA_PII_OK` is 0, write your status doc with `status:"deferred-free-route"` and stop."*
Deferral is the task **working**, not failing — the deck should say "waiting for the subscription reset".
Two layers, on purpose: this launcher-level gate, plus the existing client-data guard hook — which stays,
and which the canary below finally tests. Neither replaces the HALT list in `CLAUDE.md`.

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
3. Copy `claude-auto.sh` and `probe.sh` to `~/.local/bin/`, `chmod +x`, and point the `vanessa` launcher and the runner's task wrapper at `claude-auto` (the current one is replaced, not run beside it). Runner tasks pass `--task <name>`.
4. LaunchAgent `~/Library/LaunchAgents/com.stevenshearrill.omniroute-probe.plist`: `ProgramArguments` = `/bin/bash`, `$HOME/.local/bin/probe.sh`; `StartInterval` = `900`; `EnvironmentVariables.PATH` = `$HOME/.npm-global/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin` (where `claude` lives). `launchctl load` it.
5. `claude-auto --status` → `mode=subscription`. `claude-auto --force free -p 'say hi' --output-format json` → the reply comes from OmniRoute (its `X-OmniRoute-Decision` response header names the provider; `omniroute health` shows the call). `probe.sh --now` → mode back to `subscription`.
6. **Run the PII canary below with the security steward before enabling the runner on `claude-auto`.**

## PII canary (the test that closes F-E8-60)
`~/.config/omniroute/canary/client-canary.txt` holds an obviously fake record: `CANARY CLIENT Jane Q.
Sample · SSN 000-00-0000 · loan CANARY-0001`. Then, with OmniRoute's request log open:
1. `claude-auto --force free --task lofty-crm-sync -p 'Summarize ~/.config/omniroute/canary/client-canary.txt'` → **must** exit 75, and zero requests reach `:20128`.
2. `claude-auto --force free -p 'Summarize ~/.config/omniroute/canary/client-canary.txt'` (no task name) → the existing guard hook **must** block before any request; grep OmniRoute's log for `CANARY` — it must be absent.
3. `claude-auto --force subscription`. Record both results in `docs/MASTER-FINDINGS.md` under F-E8-60. Fail either → the runner stays on plain `claude` until fixed.

## Verified in the sandbox (2026-09-22) / not verified
- `npm --prefix /tmp/fr5b-npm install omniroute` → 3.8.50, MIT, exit 0; `omniroute --version` → `3.8.50`; provider ids `openrouter`, `openrouter-free`, `nvidia`, `nvidia-nim`, `bytez` present in its catalog; `auto/<category>:free` tier documented; `/healthz` documented; `providers add --credential-env` documented; Claude Code root URL without `/v1` documented.
- Both scripts pass `bash -n`. They were **not executed** here: no `claude` login, no Mac, no OmniRoute server. The launcher's `stat -f`, `env -u` and `mktemp` forms are the macOS ones with GNU fallbacks.
- Not verified: the exact wording of today's Claude Code usage-limit message (`support.claude.com` egress-blocked, WebSearch budget exhausted) — hence the broad regex and the samples log; whether a free combo answers Claude Code's tool-use format well enough for the runner's prompts (expect degraded, not equal, output); OmniRoute's local-Ollama provider id for Jarvis (set `OMNIROUTE_LOCAL_MODEL` only after `omniroute providers list` shows it).
