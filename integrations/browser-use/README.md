# browser-use — Claude Code drives a browser (added 2026-10-07)

Steven, 2026-10-07: *"install https://github.com/browser-use/browser-use.git"*.

**What it is.** An open-source tool (MIT licence) that lets Claude Code open web pages, read them, click, type
and take screenshots. It runs as a command line (`browser-use`) and as an MCP server with two tools,
`browser_exec` (runs short Python steps such as `new_tab(url)`, `page_info()`, `js(...)`) and
`browser_screenshot`. Version **0.13.11**. Claude Code is the brain; browser-use needs no API key of its own
for this path.

**Where it stands (2026-10-07).**

| Place | State |
|---|---|
| Cloud sandbox | Installed and proven with headless Chromium: the command line opened a test page and read it back; the MCP server listed its two tools and ran one `browser_exec` call against a separate profile; telemetry off. When the agent Chrome is not running, browser-use stops with an error — it does not fall back to another browser. |
| Steven's Mac | **Not installed yet — one command, below.** Nothing here has run on a Mac. |

## Steven: one command on the Mac

In Terminal, from your Repo folder:

    git pull && bash integrations/browser-use/install-mac.sh

It installs `uv` (if missing) and browser-use 0.13.11, switches telemetry off, sets up a separate, hidden
**agent Chrome** with its own empty profile (none of your logins, cookies or bookmarks), runs a self-test, and
registers browser-use with Claude Code for all projects, pinned to that agent Chrome. There is nothing to click:
the agent Chrome has no window and needs no "Allow remote debugging" approval. Then, in a new Claude Code
session: *"use browser-use to open <a public web page> and summarise it."*

Close the agent Chrome any time: `~/Applications/browser-use/agent-chrome.sh stop` (it starts again with the
next Claude Code session). Undo everything:
`claude mcp remove -s user browser-use; uv tool uninstall browser-use; rm -rf ~/Applications/browser-use`.

**Deliberately not done.** `browser-use skill install` — upstream's default skill drives your everyday Chrome,
where you are signed in to Gmail, Lofty, Zoho and your bank. `browser-use auth login` — Browser Use Cloud is a
separate paid account (HALT: spends money). Either is your call, after Elena (CISO) reviews the risk.

## Rules for every agent that uses it

1. **Agent Chrome only.** Connect through the registered MCP server or `BU_CDP_URL=http://127.0.0.1:9333`.
   Never attach to Steven's everyday Chrome, and never run `browser-use mac-approve` for it.
2. **Look, don't act.** Opening and reading public pages and taking screenshots is fine. Submitting a form,
   sending, posting, buying, booking, signing, accepting terms or changing a setting is a HALT item: stop and
   write a Needs-Steven packet.
3. **No client data.** Never open a page that shows a client's information (CRM, transaction systems,
   email, lender portals). Whatever browser-use reads goes to the cloud model, and client PII must not leave
   the local model.
4. **No logins.** Never type a password, one-time code or API key into the agent Chrome, and never sign it in
   to anything. A page that needs a login is the CLI-Anything harnesses' job, on the Mac, read-only.
5. **Telemetry stays off** (`browser-use telemetry status` shows `"enabled": false`). Action recordings stay
   off (the default; `browser-use recordings` shows `auto-recording: off`).

Owner: Derek (automation). Risk owner: Elena (CISO). Upstream: <https://github.com/browser-use/browser-use>.
