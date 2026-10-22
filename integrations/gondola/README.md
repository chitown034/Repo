# Gondola — travel updates (hotel, flight, car; points vs cash) (2026-10-22)

Steven, 2026-10-22: "connect gondola ai for travel updates." Gondola publishes an official MCP server:
`https://mcp.gondola.ai/mcp` (Streamable HTTP). Search and points-vs-cash comparison work with no account; loyalty
balances, trips, saved profiles and booking use OAuth (Steven signs in once, in the browser window it opens).

| Where | How it is connected | Who |
|---|---|---|
| Claude Code on the Mac (every project, Orca agents included) | `connect-all.sh` step 4b: `claude mcp add --transport http --scope user gondola https://mcp.gondola.ai/mcp` | the paste |
| claude.ai (cloud sessions, Vanessa in chat, dashboard buttons later) | Settings → Connectors → Add custom connector → name `Gondola`, URL above → Connect | Steven, once |

Owner: the Travel panel (Command Deck) and the weekly travel routine; seat Marcus (points value) with Vanessa.
HALT: Gondola can book. Every booking, cancellation or points redemption is Steven's yes — agents search, compare,
watch prices and draft itineraries only. Not verified from the cloud container (its proxy blocks mcp.gondola.ai);
the first real call happens on the Mac or in claude.ai after Steven connects it.

Source: Gondola's own MCP page and blog (gondola.ai/mcp, gondola.ai/blog/best-travel-mcp-server), read 2026-10-22.
