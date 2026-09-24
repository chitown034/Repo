# R6 — CLI-Anything feeds, two equal Macs, two new links, 2026-09-24

Steven's instructions, verbatim:

1. *"Use Anything CLI tool installed to assist in connecting the sites and feeds that aren't in Composio or have an API"*
2. *"Ensure both of my MacBooks can access the same information and equally have control of this dashboard setup infrastructure"*
3. *"Add the DAWIA test prep under the NAVWAR program manager link in the OPS page."*
4. *"Add this link to track my marketing performance against competitors where appropriate within dashboard."*

Three engineers worked in parallel, each in its own worktree and on its own files: `cli`, `macs`, and the
deck's `links` + `devices`. The integrator merged all three and published.

## What now exists

### 1. Feeds with no API — a ninth CLI-Anything harness

- **`publicfeeds`** (`integrations/cli-anything-harnesses/publicfeeds/`) reads eight public pages:
  - three Redfin market pages;
  - two lender-rate pages (Veterans United, Navy Federal);
  - three builder-incentive pages (D.R. Horton, Lennar, Richmond American).
- It is read-only by construction. Every recipe ships `verified: false`.
- Each of its three groups is **disabled by policy** until a terms-of-service review date is recorded, one
  per group. Alexandra drafts the question, and Steven decides it (NEEDS-STEVEN 59). Tests: 117 passed.
- **`connect.sh`** walks install → posture → `--discover` → pending sign-ins → the paste-ready
  `cli-anything-status` prompt in one idempotent command. `--dry-run` touches nothing.
- `integrations/CONNECTIONS.md` is the honest map of what reaches what.
- `integrations/mac-task-specs.md` §7 specifies `cli-anything-feeds`, the task that turns a verified,
  gate-open recipe into `ratesSnapshot` / `liveFeeds`.
- **Nothing has run on a Mac yet.** There is no `cliAnythingStatus` document. Every sign-in, terms review
  and first `--discover` is Steven's.

### 2. Two equal Macs

- **One role for both Macs: `peer`, with sticky leadership.** Whichever Mac most recently held
  `taskLease` keeps working through a blip of its own. Either Mac can take over on purpose with
  `claude-auto --take-lease`, and hand back with `--release-lease`.
- Each check writes a `macHeartbeat.<machine>` document.
- `taskLease` is created by the first real check on a Mac. It is never seeded from the cloud.
- The old `primary` / `standby` values still work, as legacy values.
- Lease tests: **158 pass, 0 fail**.
- **`integrations/mac-sync/`** keeps the same information on both Macs:
  - `status`, `pull`, `export --push` and `diff` compare MCP servers, runner tasks, skills, role and vault
    method, per Mac;
  - two LaunchAgents run an hourly pull and a daily export;
  - tests: **66 pass, 0 fail** (see the incident below).
- `MAC-SETUP.sh` now installs `peer` by default, and `mac-verify.sh` checks the role, the lease and
  mac-sync.
- `REMOTE-ACCESS.md`, `docs/SECOND-MAC-SETUP.md` and runbook A5 were rewritten to match.
- How the Obsidian vault syncs (iCloud or git) is Steven's call.

### 3. The Command Deck — published as version 154

- **DAWIA test prep** is indented under the NAVWAR program-manager line in *Tools & links* (Ops page). It
  links to the APM field guide artifact.
- **VA Command Center** is at the top of *Marketing*: a card linking the competitor-tracking artifact. It
  says plainly that its ticks save in that browser only, and that any ad needs LPT / Patriot Pacific
  compliance sign-off.
- **Devices and Macs**, in *Tool kit*:
  - "Name this device" turns anonymous browser rows into named ones.
  - The roster is capped at 24: it keeps this device, then named devices, then the most recently seen.
  - A Macs card reads `taskLease` and the heartbeats, and says honestly that neither exists yet.

### 4. The setup runbook — published as version 9 on 2026-09-24

- The lease step now describes two peers and a proven handover. It no longer says standby or "create
  `taskLease`".
- Nine harnesses, not eight.
- A new D1a (`connect.sh`) and a new D7 (`publicfeeds` and its three terms gates).
- The Google Drive sign-in is noted, and b4 notes the Follow Up Boss connection's removal.
- 42 steps became 44. Saved ticks carry over, because every step id was kept.

## Incident — a test touched the checkout it lived in

- **What happened.** `mac-sync-tests.sh` case C4 called the real `mac-sync.sh pull` without naming a
  repo. The script finds its repo from its own location, so in the cloud checkout it ran a real
  `git pull --rebase --autostash`, which stopped mid-rebase.
- **Recovery.** It was aborted (`git rebase --abort`) back to the same commit, with a clean tree and an
  empty stash. Nothing was lost. The change never reached origin or either Mac.
- **The fix.**
  - Every call now inherits a guard repo path that does not exist, so a call that forgets its temp repo
    is refused.
  - The dead unguarded call became C4a, which proves the guard refuses.
  - A new section Z fails the run if the host repo's HEAD, reflog, stash or rebase state changed.
- **Verified.** With the guard removed, C4a fails twice (a mutation check). The real repo's HEAD and reflog
  were unchanged through both runs.

## Gates on the merged tree

| Suite | Result |
|---|---|
| `lease-tests.sh` | 158 pass, 0 fail |
| `mac-sync-tests.sh` | 66 pass, 0 fail (run in a scratch clone) |
| Nine harness pytest suites | 740 passed, 41 skipped (Mac-only), 0 failed |
| `bash -n` on six shell scripts | clean |
| Command Deck (v154 build) | quickcheck PASS except the known false positive; harness PASS on the empty store and the live store |
| Stress sweep on the v154 build (scratch commit `f5022c7`, sha256 `a220b0da…` — the same bytes that were published) | 56 Pass · 1 Degraded · 0 Fail |

## Still Steven's

`docs/NEEDS-STEVEN.md` items 55–62, plus the dated corrections on items 37 and 38. In short:
- three Composio sign-ins (GoHighLevel, Google Drive, the Discord bot);
- You.com funding;
- Zoho's profile checkbox (unchanged, 403);
- a runner that last synced at 02:06 UTC;
- three terms reviews;
- the hands-on two-Mac steps;
- one slot check;
- the VA rates refresh.
