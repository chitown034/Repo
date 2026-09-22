# scripts

## `openbot-install.sh`

Installs [OpenBot](https://github.com/CopilotKit/OpenBot) into a Claude Code web session and starts
the parts of it that run without Docker. Safe to re-run: every step checks before it acts, so a
session resume restarts what died rather than rebuilding from scratch.

It clones the repository to `/root/.openbot-src`, runs PostgreSQL 16 directly on the host with
pgvector, applies the migrations to both `openbot` and `openbot_test`, installs the workspace and
the four sub-packages that root test discovery imports, and serves the app on
<http://localhost:3010>.

### Wiring it into session start

The script is not registered as a hook. To have it run on every session, add it to
`.claude/settings.json` alongside the existing `session-start.sh` entry:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          { "type": "command", "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/session-start.sh" },
          { "type": "command", "command": "$CLAUDE_PROJECT_DIR/scripts/openbot-install.sh" }
        ]
      }
    ]
  }
}
```

Until then, run it by hand:

```sh
CLAUDE_CODE_REMOTE=true bash scripts/openbot-install.sh
```

### Credentials

The API server on port 3001 throws at boot on a missing Intelligence key rather than degrading, so
the script starts it only once both of these are set. It reads them from the session environment
and writes them into `/root/.openbot-src/.env`, so they can be configured once as environment
variables rather than edited in on every fresh container.

- `INTELLIGENCE_API_KEY` — the `cpk-...` runtime key from
  `npx --yes copilotkit@latest login && npx --yes copilotkit@latest project select`.
- `OPENAI_API_KEY` — the model key the shipped Bots use.

The app front-end needs neither and comes up either way.

### What does not run here

Each Bot gets a container of its own, built by the supervisor, and there is no Docker daemon in
this environment. The Bots, their browsers and their workspaces are therefore unavailable; the app,
the API server and the database are not.
