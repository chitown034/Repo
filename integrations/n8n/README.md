# n8n — Steven's Mac, loopback only

**What this is not:** a connector for Zoho, Lofty, Showami, ShowingTime, homes.com, CRMLS,
zipForms, SkySlope or dotloop. The R9 routing table (`$S/r9/C2-routing.md`, merged into
`integrations/CONNECTIONS.md` by the integrator) gives all nine of those one existing owner
each — Composio or a CLI-Anything harness — and Apple Health a tenth: the existing
`health-notion-sync` Mac task. Building any of those again in n8n would be a second path to the
same data, which the R9 brief names as the thing to avoid. See that table for why, system by
system.

**What this is:** an n8n instance for the two things nothing else already owns —

1. `workflows/openwa-selfchat-to-vanessa.json` — OpenWA's self-chat webhook → filter to
   Steven's own chat → append to a local queue file. It never replies and never calls a
   client-facing endpoint; the Vanessa inbox logic itself stays in the existing Claude-side Mac
   task (`integrations/mac-task-specs.md` §5a), coordinated with lane C1.
2. `workflows/cli-anything-scheduled-feeds.json` — a daily cron that runs one read-only recipe
   from each of the five browser-backed CLI-Anything harnesses that has no Mac task of its own
   yet, and writes each one's output to a local file. It stops there on purpose: turning that
   output into a Command Deck doc is a `read_db`/`write_db` call only Claude Code can make (see
   the workflow's own sticky note) — not a second n8n path into those docs.

Both workflows ship `"active": false` and need a credential n8n does not ship with (see each
file's sticky note). Read `.env.example` before `install.sh`.

## Tested here (R9, 2026-09-28, cloud sandbox — nothing below ran on a Mac)

- **Node >= 24 is required, not optional.** n8n 2.40.7's expression engine
  (`isolated-vm@7.0.1`) ships prebuilt native addons only for Node's ABI137 (Node 24) and newer
  — none for ABI127 (Node 22, this sandbox's default). Under Node 22 it crashes at `Start.init`
  with an `IsolatePool`/"vm expression engine" error that never names Node as the cause. Under
  Node 24 it starts clean. `install.sh` now checks the Node major version itself instead of only
  checking that `npm` exists, so a too-old Node fails with a clear message instead of that
  opaque crash.
- Started the already-installed n8n (`n8n start`, Node 24) with `N8N_HOST`/
  `N8N_LISTEN_ADDRESS=127.0.0.1`: `GET /healthz` → `200` on `127.0.0.1:5678`; the same request to
  the container's other address refused outright — confirmed loopback-only, not `0.0.0.0`.
- Imported both workflow files with `n8n import:workflow --separate --input=workflows/`:
  "Successfully imported 2 workflows." (Note for whoever imports next: a *single*-file
  `--input=file.json` import, without `--separate`, fails in this n8n version if the file has no
  `id` field — neither shipped file does, on purpose, since a hardcoded id would collide across
  installs. The UI's own "Import from File" button, which is what Steven actually uses per the
  NEXT block below, does not have this problem — it always assigns a fresh id.)
- Ran each imported workflow with its credential missing and confirmed a clean failure, not a
  crash:
  - **OpenWA bridge**: activated it, restarted n8n, then `POST /webhook/openwa-selfchat-inbound`
    with a synthetic (non-real) body → `500`, `No authentication data defined on node!` — n8n
    resolved the route, then refused cleanly because the `OpenWA webhook token` credential does
    not exist yet. Deactivated again afterward.
  - **CLI-Anything scheduled feeds**: its Execute Command nodes hold no n8n credential object at
    all — their real dependency is the Mac-only `cli-anything-*` console scripts. Ran all five
    nodes' exact command text in this sandbox: every one exits `127`, `command not found`,
    exactly as the workflow's own sticky note says it will off a Mac.
  - Full log: `$S/r9/work-C2-fabric/NOTES-C2-fabric.md` and `n8n-test/*.log` (scratchpad, not
    this repo — no secret or credential value in any of them).
- Killed the process both times when done; no n8n process was left running.

## Install on Steven's Mac

Run `./install.sh` (npm-global, default) or `./install.sh --docker`, then follow the "NEXT"
block it prints: create the owner account yourself in the first-run wizard, import every file in
`workflows/` from the UI, create the credentials each workflow's sticky note names, and
coordinate the OpenWA webhook URL/secret with the OpenWA install. Nothing here is connected,
installed or running until Steven does that on his own Mac.
