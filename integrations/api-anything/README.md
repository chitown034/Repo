# API Anything — teach Claude a website once, then call it like an API (added 2026-10-08)

Steven, 2026-10-08: *"Install https://github.com/goodnight000/api-anything.git"*.

**What it is.** An open-source tool (MIT, by Tianjun Zheng) that watches a website's own page make a data
request, learns which parts are your inputs, and saves that as an **operation**. Claude then calls the operation
with new inputs and gets JSON back over plain HTTP — faster and cheaper than driving a browser (the project's own
benchmark: 1.5–2× sooner, about half the tokens). Version **0.1.0**, pinned to commit `0b556c3`. Claude Code reaches
it through an MCP server with four tools: `list_sites`, `list_operations`, `call_operation`, `login`. It ships ready
operations for Hacker News, Goodreads, Google Flights, YouTube, Amazon, Airbnb, LinkedIn, Instagram and X.

**Where it stands (2026-10-08).**

| Place | State |
|---|---|
| Cloud sandbox | Built and installed from source. A plain-HTTP (tier 1) call returned JSON in 345 ms (a GitHub search smoke test; the bundled sites' hosts are blocked by this sandbox's network). The MCP server listed its four tools, also when started with a bare PATH the way Claude Code starts it. Project tests: 316 pass, 11 fail — all eleven need Chrome's cookie store or a real browser, which the sandbox lacks. |
| Steven's Mac | **Not installed yet — one command, below.** Nothing here has run on a Mac. |

## Steven: one command on the Mac

    git pull && bash integrations/api-anything/install-mac.sh

It makes sure Node 22.13+ is present (via `fnm` if needed), builds API Anything from its pinned source, runs a
self-test call, registers the MCP server with Claude Code (with real paths, so it starts even outside Terminal) and
installs its skill. Then restart Claude Code and ask: *"What sites can API Anything call?"* Google Chrome is needed
only to teach it new sites.

## Rules for every agent that uses it

1. **Read-only operations only.** Call an operation only when its spec says `"readOnly": true`. Never teach or call an
   operation that submits, posts, sends, books, buys or changes anything — that is a HALT item.
2. **`login` is Steven's, every time.** `login` copies a site's cookies out of a Chrome profile — a credential. Never
   call it without Steven's explicit yes for that site; never for his bank, CRM (Lofty, Zoho), transaction systems
   (SkySlope, zipForms) or email. Credentials stay in `~/.api-anything`; specs hold references, never values.
3. **No client data.** Never call an operation that returns a client's information; responses go to the cloud model.
4. **Personal social accounts (LinkedIn, Instagram, X)** need Steven's login and may conflict with those sites' terms —
   Alexandra drafts a terms review and Steven decides before any of them is used.
5. **Relation to CLI-Anything.** For the read-only real-estate sites (homes.com, ShowingTime, Showami) an API Anything
   operation may replace the slower browser path. That is a proposal for Elon (CTO Innovator) to measure, not a
   decision; the CLI-Anything harnesses stay the sanctioned path until then.

Owner: Derek (automation). Risk owner: Elena (CISO). Upstream: <https://github.com/goodnight000/api-anything>.
