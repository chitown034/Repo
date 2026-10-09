# Command Deck "Remote Control" card - data contract (no poller)

Needs only what the deck page already has: read/write one database doc, HTML-escape, copy-to-clipboard, relative-age ("as of"), a button, a text input. Exact helper names in the deck are not verified from here; use the existing equivalents.

## Document `remoteControl`

```json
{ "v": { "macs": [
  { "id": "mac-1", "label": "Steven MacBook Pro", "url": "https://claude.ai/code/...",
    "startedAt": "2026-10-09T17:00:00Z", "checkedAt": "2026-10-09T17:05:00Z", "note": "" }
] } }
```

- `id`: stable key, derived on paste from `host` (lowercase, `[a-z0-9-]`). Paste from the same Mac replaces its row; a new host appends. Maximum 4 rows.
- `label`, `url`, `startedAt`, `checkedAt`: copied from the pasted report. `note`: free text Steven can edit (default "").
- Nothing else is stored. No tokens, no paths.

## Paste box (the only refresh path)

One text input + "Save" button. Steven runs `bash rc-agent.sh report` on a Mac and pastes the single line:

`{"host":"..","label":"..","url":"..","startedAt":"..","checkedAt":".."}`

Validate in the page before writing:
1. `JSON.parse` succeeds, value is an object, input length <= 2000.
2. Keys present as strings: host, label, url, startedAt, checkedAt. Ignore any extra keys (do not store them).
3. `host` and `label` match `^[A-Za-z0-9 ._()@+-]{1,40}$`.
4. `url` is empty or starts with `https://` and the hostname ends with `claude.ai`; otherwise reject with "link must be https on claude.ai". Never render a non-https value as a link.
5. `startedAt`, `checkedAt` empty or ISO-8601 UTC (`^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$`).
6. Stamp: store `checkedAt` as given, and add the page's own `savedAt` (now) inside the row if the deck convention wants an "as of"; age is computed from `checkedAt`. Reject a `checkedAt` more than 5 minutes in the future.
Then upsert by `id`, write the doc, re-render. Show the validation error inline; write nothing on error.

## Each Mac row shows

- Label, host, and "as of <age of checkedAt>" (e.g. "as of 3 h ago"). Colour: under 12 h neutral, 12-48 h amber "stale - re-run report", over 48 h red. An empty `url` shows "no live session at last check" (the agent was not running or captured no link) and still offers the buttons below.
- Started: `startedAt` relative.
- **Open** button: enabled only when `url` is https on claude.ai; opens in a new tab with `rel="noopener noreferrer"`. If `url` is empty, the button reads "Open session list" and links to `https://claude.ai/code` (a real page; the session is named after the label).
- **Copy start command**: copies `cd ~/Repo && bash integrations/remote-control/rc-agent.sh install` (adjust the path to where the lead places the script). Subtext: "run once by hand first: `claude remote-control`, answer y, Ctrl+C".
- **Copy doctor command**: copies `bash integrations/remote-control/rc-agent.sh doctor`.
- **Copy report command**: copies `bash integrations/remote-control/rc-agent.sh report` (this is what is pasted back).

## "How to control Claude Desktop" note (plain text, as verified)

- Verified in Anthropic's Remote Control docs: the Desktop app's Code tab supports `/remote-control` (or `/rc`); once connected the session is listed at claude.ai/code and in the phone app. Settings > Claude Code > "Connect new sessions to Remote Control" does it for every Desktop session. Run `/remote-control` again to disconnect.
- So: to control Claude Desktop, turn that setting on (or type `/remote-control` in the session); to control Claude Code in the Repo folder, use the rc-agent session. They are separate sessions in one list.
- Not verified: remote driving of the Desktop window itself (clicking its UI). Remote Control steers sessions, not the app chrome. Treat as unsupported.

## Optional push-button start via the hourly local bridge - OFF by default

Show as a collapsed section titled "Optional - off", with this exact honesty:

- Today the local bridge (`localBridgeQueue`, task `local-bridge-queue`, hourly at :25, 6 AM-9 PM PT, read-only allow-list) is the only deck-to-Mac path. A deck button cannot start anything instantly; it can only queue a verb the next hourly run picks up.
- Proposed verb: `rc-status` (read-only): runs `rc-agent.sh report` and writes the line back to the queue result, so the card refreshes without pasting. Needs the verb added to the allow-list in `~/Applications/local-bridge/run.sh` by Steven (a live task: not edited by the script or by Claude).
- A start verb (`rc-start`) is NOT proposed: it would be a write verb and the bridge is read-only by design. Starting stays a command Steven runs, or the always-on LaunchAgent.
- Usage cost: the bridge task already runs hourly, 16 runs/day, whether or not a verb is queued; `rc-status` adds work inside those existing runs, no new poller and no extra scheduled runs. The reply can lag up to ~1 h. Enabling it means 0 new runs/day if the bridge is already on; if the bridge is switched off to save usage, turning it on again costs up to 16 runs/day, so leave it off unless wanted.
- Toggle in the card: a disabled checkbox "Enable rc-status via bridge (not enabled)". It does nothing until the verb exists; the card shows "off" and never queues anything.

## Out of scope for the card

No auto-refresh, no timers, no network calls to the Mac, no storing of anything beyond the contract above.

# Orca block (same Remote Control card)

The card cannot reach Orca, a Mac, or a network. It shows only what Steven pastes. Say this on the card: "Orca status shown here is whatever you last pasted; it is not live."

## Data: extend `remoteControl.v` with `orca`

```json
{ "v": { "macs": [ ... ],
  "orca": [ { "id": "mac-1", "label": "Steven MacBook Pro", "orcaVersion": "1.4.214",
              "runtimeReachable": true, "pairedEnvironments": ["mac-2"],
              "checkedAt": "2026-10-09T17:05:00Z" } ] } }
```

Max 4 rows, upsert by `id` derived from `host` (same rule as the Mac rows). Stored fields are exactly those shown; nothing else is kept.

## Paste box (second input in the Orca block)

Input for the single line from `bash orca-remote.sh report`:
`{"host":"..","label":"..","orcaVersion":"..","runtimeReachable":true,"pairedEnvironments":["name"],"checkedAt":".."}`

Validate before writing (same rules as the Mac paste box: JSON.parse, length <= 2000, ignore unknown keys, write nothing on error), plus:
1. `host`, `label` match `^[A-Za-z0-9 ._()@+-]{1,40}$`; `orcaVersion` matches `^[A-Za-z0-9._ -]{0,30}$`.
2. `runtimeReachable` is a boolean.
3. `pairedEnvironments` is an array of at most 8 strings, each `^[A-Za-z0-9._-]{1,40}$`.
4. `checkedAt` ISO-8601 UTC, not more than 5 minutes in the future.
5. **Secret guard (reject, never store, never echo back):** if the raw input contains `orca://`, `code=`, `pair?`, or any dotted-quad IPv4 address, refuse with "That looks like a pairing link or an address - not saved. Never paste those here." Clear the input box immediately in both the accept and reject cases. (The Orca report line carries none of these by design; this catches a wrong paste.)

## Each Orca row shows

Label, version, "as of <age of checkedAt>" (same amber/red ages as the Mac rows), "runtime reachable: yes/no at last check", and the paired names ("controls: mac-2" or "no paired Mac"). No link, no Open button: Orca is opened in the Orca app or CLI, not from this page.

## Buttons (all COPY text only; nothing runs)

- **Copy serve command** (run on the Mac to be controlled): `bash integrations/remote-control/orca-remote.sh serve`; second button **Copy serve (phone)**: `... serve --phone`.
- **Copy pair command** (run on the controlling Mac): `bash integrations/remote-control/orca-remote.sh pair`.
- **Copy status command**: `bash integrations/remote-control/orca-remote.sh status`.
- **Copy report command**: `bash integrations/remote-control/orca-remote.sh report` (the line pasted back).
- (Adjust the path to where the lead places the scripts.)

## Warnings printed on the block (static text)

- "A pairing link is a secret equal to remote control of that Mac's agents. Pair only on the home LAN or your private network. Never paste a link into chat, this page, or the repo."
- "This card cannot start, stop or reach Orca. It cannot verify that a pairing works; only 'orca-remote.sh status' on the Mac can."
- Not verified from the cloud: whether Orca's desktop app has its own paired-server UI that replaces `serve`; the card makes no claim either way.
