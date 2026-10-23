# MCP servers — every Model Context Protocol server the brain reaches (as of 2026-10-23)

One row per server. `bin/brain toolkit` reads this table (the last "## MCP servers" section) and the 6D Brain draws
one node per row. Status words start with **registered**, **connected**, **installed** or **pending**; "where" is the
host that runs it. No key or URL with a token ever goes here.

## MCP servers

| Server | Where | What it gives | Status | Owner |
|---|---|---|---|---|
| laya | Mac 1, Mac 2 (connect-all 6) | zero-token local router in front of Vanessa (lane, tier, HALT words) | registered — real engine answering on Mac 1 (2026-10-23) | Vanessa |
| kapso | Mac 1 (connect-all 3) | WhatsApp Business Cloud API read/answer (sandbox number first) | registered — needs Steven's sign-in (`/mcp` → kapso) | Victor |
| gondola | Mac 1, Mac 2 (connect-all 4b); claude.ai custom connector | travel: hotels, flights, points vs cash, trips | registered on the Macs; claude.ai connector is Steven's click | Vanessa |
| notebooklm | Mac 1 (connect-all 6f, `nlm`) | NotebookLM notebooks and sources (community tool, opt-in) | connected — signed in 2026-10-23, 5 notebooks | Vanessa |
| playwright | Mac 1 (`integrations/browser-agents/install.sh`, pinned @playwright/mcp@0.0.83) | browser automation for sites with no API | installed | Derek |
| browser-use | Mac 1 (agent Chrome) | second browser agent path (DOMShell-backed) | installed | Derek |
| api-anything | Mac 1 (`integrations/api-anything`) | turns any documented REST API into tools | installed | Derek |
| openflowkit | Mac 1, Mac 2 (connect-all 6g; `npx -y openflowkit mcp`, local stdio, no key) | architecture, flow, sequence and ER diagrams the agent draws and saves as `.openflow.json` | pending — step added 2026-10-23, runs on the next paste | Derek |
| github (cloud) | this claude.ai session | repository read/write, PRs, issues | connected | Derek |
| Composio (cloud) | claude.ai connector | Zoho CRM, Google Docs, GitHub tool calls through Composio | connected — Zoho 403 until the API box is ticked | Marcus |
| Fieldy · Gmail · Google Calendar · Google Drive · Notion · Slack · Zoom · WhisperAI · Inkbox · Context7 · Strava (cloud) | claude.ai connectors | the connector set every cloud routine and the Command Deck page can call | connected (see `integrations/CONNECTIONS.md`) | Vanessa |
