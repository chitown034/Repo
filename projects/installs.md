# Installs tracked through this repo

| What | How | Where |
|---|---|---|
| Codex plugin (`codex@openai-codex`) | `.claude/settings.json` marketplace + enabledPlugins | commit a8643ac |
| Orca CLI (stablyai/orca) | `.claude/hooks/session-start.sh` clones and builds it on every remote session, symlinks `/usr/local/bin/orca` | PR #1, commit 6e7b43d |
| laya 0.3.5 (multilingual typed-decision engine) | `requirements.txt` | commit 0ec718a |
| securo (self-hosted personal finance app, AGPL-3.0) | vendored source in `securo/` at upstream d7aa27e; run with `docker compose up --build` | commit 5739115 |

Declined: `elder-plinius/G0DM0D3` (a jailbreak toolkit that targets Claude by name) — not installed.
