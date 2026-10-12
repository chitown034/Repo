# Claude Code — LLM Gateway Setup Reference

Prepared because you asked to "set up" Claude Code against a gateway
(you named `https://ghostcli.cloud`). I have **not** verified that domain
and have not sent anything to it. Do not point real credentials at an
endpoint you haven't independently verified — this doc gives you the
mechanism; the trust decision on the destination is yours.

## 1. The hard tradeoff, first

Switching Claude Code to an API-key/gateway connection and keeping your
current claude.ai Connectors/Skills/Plugins are **mutually exclusive**:

- claude.ai Connectors (Gmail, Notion, Slack, Google Drive, Canva, etc.),
  synced Skills, and synced Plugins only load under a **claude.ai
  subscription login**.
- The moment Claude Code authenticates via `ANTHROPIC_API_KEY`,
  `ANTHROPIC_AUTH_TOKEN`, `apiKeyHelper`, or a cloud provider
  (Bedrock/Vertex/Foundry), those all become unavailable. Remote Control
  and voice dictation drop too.
- There is no setting that keeps both. This is by design, not a gap.

So before setting this up anywhere, decide: do you actually want to trade
away the ~90 connectors currently enabled on this account for a
gateway-routed API connection? If not, this isn't the right move.

## 2. How a gateway connection is actually configured (per machine)

Set one of these, either as shell exports or in the `env` block of
`~/.claude/settings.json` (all projects) or `.claude/settings.local.json`
(one project, gitignored — never commit a credential):

| Key | Purpose |
|---|---|
| `ANTHROPIC_BASE_URL` | The gateway's URL |
| `ANTHROPIC_AUTH_TOKEN` | Sent as `Authorization: Bearer <value>` |
| `ANTHROPIC_API_KEY` | Sent as `X-Api-Key: <value>` |
| `ANTHROPIC_CUSTOM_HEADERS` | Extra `Name: Value` headers, `\n`-separated |
| `apiKeyHelper` (settings.json key, not env var) | Command that prints the credential; cached 5 min (`CLAUDE_CODE_API_KEY_HELPER_TTL_MS`) |

Precedence order Claude Code checks: cloud provider selector →
`ANTHROPIC_AUTH_TOKEN` → `ANTHROPIC_API_KEY` → `apiKeyHelper` →
`CLAUDE_CODE_OAUTH_TOKEN` → configured profiles → `/login`.

Credentials are stored per machine (macOS Keychain, or
`~/.claude/.credentials.json` elsewhere) — there's no portable "backup
file" for this; each install is configured independently, or an org
pushes it centrally via managed settings.

## 3. Cloud-provider gateway modes (Bedrock / Vertex / Foundry)

If "gateway" means routing through AWS Bedrock, GCP Vertex, or Azure
Foundry rather than a generic proxy:

- `CLAUDE_CODE_USE_BEDROCK` / `CLAUDE_CODE_USE_VERTEX` / (Foundry
  equivalent) to select the provider
- `ANTHROPIC_BEDROCK_BASE_URL` / `ANTHROPIC_VERTEX_BASE_URL` /
  `ANTHROPIC_FOUNDRY_BASE_URL`
- `CLAUDE_CODE_SKIP_BEDROCK_AUTH=1` / `CLAUDE_CODE_SKIP_VERTEX_AUTH=1` if
  the provider's own SDK auth handles credentials
- `ANTHROPIC_AUTH_TOKEN` if a token is still required on top of that

## 4. What this repo's own `.claude/` actually contains (for reference)

```
.claude/settings.json        — plugin marketplace entry (openai/codex-plugin-cc), SessionStart hook registration
.claude/hooks/session-start.sh — bootstraps an unrelated internal tool ("orca"); only runs when CLAUDE_CODE_REMOTE=true
```

Neither file contains API keys, gateway URLs, or connector config — there
is nothing gateway-related to "back up" from this repo.

## 5. Official docs (for whoever actually runs this setup)

- https://code.claude.com/docs/en/llm-gateway
- https://code.claude.com/docs/en/llm-gateway-connect
- https://code.claude.com/docs/en/authentication
- https://code.claude.com/docs/en/env-vars
- https://code.claude.com/docs/en/settings
