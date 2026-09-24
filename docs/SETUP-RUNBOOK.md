# SETUP-RUNBOOK — what only Steven can do

**Written 2026-09-23.** The browsable version, with tick-boxes that sync across your devices, is the
artifact **https://claude.ai/artifact/CGVZVfanFrRFb374HB22Le**. This file is the same runbook as text,
so the commands are on the Mac after a `git pull` without needing a browser.

Everything here is on this list for exactly one reason: it needs a **credential**, an **account
change**, a **physical Mac**, or a **licensed decision**. Those are the four things a cloud session
cannot do — by design, not by limitation.

**Ordering.** A, B and C are independent of each other. D depends on A. E depends on D. F depends on
E. G and H depend on nothing. **Do H1 today** (it is on a clock).

---

## Before you start — four things you should know

**1. The Command Deck's own page source carries your financial detail.** `cdStateSeed` and
`PROPERTIES_DEFAULT` hold **3 street addresses with loan balance, lender and rate; 20 membership
account numbers; 17 balances; 5 liabilities with APRs**. All of it is yours, not a client's — which is
why no rule stopped it — but it is in a published artifact, so anyone the link is ever shared with
reads it. **Not changed.** It can move to the artifact's private database, where the page still
renders it but the source does not carry it. Your call.

**2. The ISA Portal's live store documents still hold client surnames with loan amounts.** The
`pipeline` and `reClients` documents render on every load. The 2026-09-23 name decision covered the
**Command Deck lead board only** — a name and a stage, nothing else — so the portal has no exemption
and this sits outside it. Purge, or extend the decision in writing.

**3. A third surface, found 2026-09-23 and verified twice.** The **live `auditFindings` document in
the Command Deck's store** (version 3, 288,849 bytes, `syncedAt 2026-09-22`) pairs **two client
identifiers with loan amounts and stages** — and the deck renders it. X2's 2026-09-22 redaction
reached `docs/MASTER-FINDINGS.md` and `docs/data/auditFindings.json`, both of which are clean; it
never reached the published store. Exactly two rows differ: **`F-E12-11` and `F-E12-12`**, each
carrying a name-shaped token its redacted twin row does not, and each twin row already carrying the
redaction marker.

`docs/NEEDS-STEVEN.md` item 26 covers this, but it says "the audit corpus", which reads as *files* —
so the live document has been sitting under a closed-sounding item. **This is the one thing on this
page I would do first.**

The fix is one surgical write per row — replacing the two live rows with their already-redacted twin
versions, leaving the other 283 rows untouched. The source rows survive in
`docs/findings/findings-E12.json`, so nothing is lost. **I have not run it:** it changes what a
published artifact shows, which is on the HALT list. Say the word and it is one call.

**4. Do not run the OmniRoute step.** Its PII gate fails open, and two paths would strand the Mac on
free providers with no alarm. Use `--skip omniroute`, keep the runner on plain `claude`, and do not
paste the four provider key values until the widened canary passes with the security steward
(`integrations/omniroute-failover/README.md`).

---

## A — Get the Mac to a known state

### A1. Look before you install — this whole block changes nothing (~15 min)
```bash
cd ~/path/to/Repo

./MAC-SETUP.sh --list                        # the 25 step names, and what it refuses outright
./MAC-SETUP.sh --dry-run                     # every command it would run — read it
./MAC-SETUP.sh --dry-run --only codeburn     # step selection, proved without installing
./MAC-SETUP.sh --dry-run --skip omniroute    # exactly what A2 will do
./mac-verify.sh                              # the "before" picture
```
`--dry-run` installs nothing and writes no log of its own. `mac-verify.sh` here is a baseline, not a
pass/fail — almost everything is expected to be absent.

*Corrected 2026-09-23.* An earlier version of this step had lines 3 and 4 **without** `--dry-run`.
That was wrong: `./MAC-SETUP.sh --skip omniroute` is not a flag demonstration, it is the entire
install — 43 commands, two git clones, four virtualenvs, a global npm install, a Playwright Chromium
download, and a `claude plugin install` into the live Claude Code user scope. And
`--only codeburn` needs node, so on a Mac without Homebrew it exits 1 at `FAILED npm missing`
before any prerequisite step has run.

### A2. Now run it for real (~30 min)
```bash
./MAC-SETUP.sh --skip omniroute       # the default set, minus the one step that is not safe yet
./mac-verify.sh
```
**Expect `mac-verify.sh` to exit 1 with exactly these four rows, and do not read them as breakage:**
```
FAIL  omniroute           not installed
FAIL  claude-auto         not in ~/.local/bin
FAIL  probe.sh            not in ~/.local/bin
NEED  claude-runner role  no ~/.config/claude-runner/role — claude-auto treats this Mac as STANDBY
```
`omniroute` is the only step that installs `claude-auto`, `probe.sh` and the role file, so skipping it
produces all four. They are correct output, and they clear when the OmniRoute canary passes and that
step is allowed to run.

**Check:** every other row is green, and `MAC-SETUP.sh` prints its own NEEDS-STEVEN list (Homebrew,
LaunchAgents, key values, `~/.local/bin` on PATH). That printed list is the rest of this runbook. The
real run logs to `~/Library/Logs/vanessa-setup/<date>.log`.

> **One thing to decide before you run it.** A plain `./MAC-SETUP.sh` runs
> `claude plugin install cli-anything@cli-anything` **unattended, into your live Claude Code user
> scope** — every session on that Mac gains it. The same script *refuses* `claude-code-setup` and
> `ponytail` for exactly that reason and never argues the exception. It may well be the right
> exception; it has just never been stated. Either accept it knowingly, or gate it behind
> `--only cli-anything` the way `strix` and `higgsfield` already are.

### A3. Telemetry off before the first `cli-hub` command, and PATH (2 min)
CLI-Hub's analytics are **opt-out**. They fire on install, uninstall, launch and every call, and
report this Mac's **hostname**.
```bash
echo 'export CLI_HUB_NO_ANALYTICS=1' >> ~/.zprofile
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zprofile
exec zsh -l
```
Add the same `CLI_HUB_NO_ANALYTICS=1` to the cli-anything runner task's environment — a shell profile
does not reach a launchd job.

**Check:** `echo $CLI_HUB_NO_ANALYTICS` prints `1` in a brand-new Terminal window; `which cli-hub`
resolves.

### A4. Runner LaunchAgent + write allow-list (10 min)
Without the LaunchAgent, scheduled tasks only fire while the desktop app is open — which is why
several "enabled" tasks have never run.

Separately, the write allow-list on `~/Shearrill-Vault`. **This is now one task, not two**
(re-checked 2026-09-23): `steve-twin-sweep` is no longer refused. Only `ops-knowledge-graph` is, and
it has still never run.

**Check:** a task with a slot in the next ten minutes leaves a **document** behind. A green status row
is not proof.

### A5. `taskLease` before Mac #2's runner is enabled (15 min) — do not skip
Nothing currently stops two Macs running the same 59 tasks and double-writing `ciLog`, `isaLine` and
every feed.
- Create the `taskLease` document.
- Add the **LEASE CHECK** block from `REMOTE-ACCESS.md` to the top of every task prompt.
- Bring Mac #2 up as **STANDBY** (`docs/SECOND-MAC-SETUP.md` steps 11–12).

> **The role file is the trap, and it is stale in the expensive direction.** `SECOND-MAC-SETUP.md`
> says the role file is yours to write. It is not any more — **the installer writes it as `standby`**
> and never overwrites an existing one. So the by-hand step is the **promotion of Mac #1 to
> `primary`**, not the creation of the file.
>
> Get that wrong and **Mac #1 defers every scheduled task with exit 75 while looking installed and
> perfectly healthy** — and neither script can tell a deliberate standby from an un-promoted primary,
> so nothing will tell you. Set `~/.config/claude-runner/role` to `primary` on Mac #1 and leave Mac #2
> at `standby`.

The task count is **settled: 59.** `runnerStatus` is the authority and was re-read on 2026-09-23; the
60 on the older deck row was wrong and is corrected. Nothing to reconcile.

**Check:** `claude-auto --lease-check` on Mac #1 reports it holds the lease and runs; on Mac #2 it
reports STANDBY and declines. If **both** say STANDBY, Mac #1 was never promoted.

---

## B — The two credentials that unblock the most

### B1. Composio first (10 min) — before B2
Composio disclosed an incident on 2026-05-21. Re-authorising Zoho onto un-rotated credentials would
hand the new permission to the old grant.
- **Rotate** the Composio credentials and re-authorise.
- ~~Delete the retired real-estate CRM connection~~ — **done 2026-09-24**: removed from Composio at
  your instruction. Still yours: revoke its API key on the Follow Up Boss side, if the account still
  exists.

### B2. Zoho CRM — one checkbox (5 min) · account change, yours only
> **You have an API key — good, but it is not what's blocking Zoho.** Re-tested 2026-09-24: still
> **403 `NO_PERMISSION`**. That refusal comes from a permission on your Zoho *user profile*, and it
> rejects every key and token for that user until the switch below is on. Flip the switch first; a key
> only matters after that.

Every Zoho call has returned **HTTP 403 `NO_PERMISSION` / `Crm_Implied_Api_Access`** for a week, so
the mortgage board has been showing the 2026-09-14 paste the whole time. No credential fixes this.
```
Zoho CRM → Setup → Security Control → Profiles
  → the connected user's profile
  → Developer Permissions
  → enable "Zoho CRM API Access"
```
Then re-authorise the Composio connection **once** so the new permission is picked up, and from the
Mac:
```bash
cli-anything-zoho selftest --json
```
**Check:** `selftest` stops reporting `status:"blocked"` / `httpCode:403` and returns rows. Exit code
**4** means the toggle did not take — the harness never retries into that 403, by design.

The OAuth refresh grant is a POST and this harness is GET-only by construction, so it cannot mint its
own token. `integrations/cli-anything-harnesses/zoho/tools/mint-access-token.sh` (outside the pip
package) does that from `~/.config/zoho/.env` and prints the one-hour token to stdout — it never
writes a file and never prints the secret.

### B3. Lofty API key (5 min)
No real-estate lead number exists anywhere until this key does. It gates `lofty-crm-sync`, the first
live run of `cli-anything-lofty`, and the four prompts in B4.

Get it from **Lofty → Settings → Integrations → API**. Open the file in an editor rather than echoing
it — a key on a command line lands in shell history.
```bash
nano ~/.config/lofty/.env        # MAC-SETUP.sh already created it, chmod 600
# add exactly one line:   LOFTY_API_KEY=<paste>

chmod 600 ~/.config/lofty/.env
cli-anything-lofty --json me     # read-only probe
```
Then run `lofty-crm-sync` once by hand. `lofty-bridge` stays the primary path — `cli-anything-lofty`
is the same API and the same key file, not a second source of truth.

### B4. Point four Mac task prompts at Lofty — this one is texting you wrong instructions (15 min)
**Moved up in importance on 2026-09-24.** Vanessa's morning iMessage on the 23rd told you to
*"reconnect Follow Up Boss/Composio — leads unmonitored since 9/16."* You retired that CRM on the 22nd.
She was not confused; she was faithfully reporting a document. The store's `leadResponse` was written
at **02:43 UTC on the 24th** with `source: "Follow Up Boss via Composio"`, `status: "failed"`, and the
reason *"composio proxy to /v1/people exited 137 (killed) — 8th consecutive occurrence."*

So `r2-lead-response-watchdog` is **still calling the retired CRM every day**, failing, and every
brief that reads its document tells you to fix the wrong thing. Two things keep it alive, and both
are yours:

- **The live prompt still names the old CRM.** The repo's mirrors already say Lofty; the prompt on
  your Mac does not. Four prompts: `lead-triage-daily`, `r2-lead-response-watchdog`,
  `r11-isa-kpi-compile`, `showing-sync`. Replacement text: `docs/inventory/mac-task-descriptions.md`.
- **The old CRM's Composio connection is still ACTIVE** (B1) — which is why the watchdog gets far
  enough to be killed instead of refused.

Until both are done, read any "reconnect Follow Up Boss" line in a brief as *"the watchdog's prompt
still points at the retired CRM"* — never as an instruction to reconnect it. Twenty-four live store
documents still name the old CRM; most are chat history and should stay, which is decision I5.

### B5. GoHighLevel — sign in, and say what it is for (5 min)
Composio has a GoHighLevel toolkit, and a connection was opened for you on 2026-09-24
(`highlevel_lairy-apios`). Sign in through the link I gave you in chat; a Composio sign-in link
expires after ten minutes, so if it has, ask for a fresh one — it takes one call.

Then **say what GoHighLevel is for.** Lofty is real estate and Zoho is mortgage, never blended; GHL has
no stated role yet, so nothing reads from it until it has one, and nothing writes to it — no SMS, no
campaigns, no contact edits — until you approve that verb in writing. Its consent screen may ask for
broad scopes; the connection's scopes are not the safety model, the task rules are.

---

## C — Finish WhatsApp

### C1. DECIDED 2026-09-23 — personal WhatsApp, message-yourself
Steven chose to link **his own personal WhatsApp** rather than a dedicated number, after being told
what it costs. He reaches Vanessa in his own **"Message Yourself"** thread: he types there, she
answers there. The amended task spec is `integrations/mac-task-specs.md` **§5a**, which supersedes
§5's transport half.

**What he accepted, recorded so it is not rediscovered as a finding.** Reading a self-chat needs
**Full Disk Access** — an OS-level grant, not a per-chat one. `ChatStorage.sqlite` is his entire
personal WhatsApp history in plaintext SQLite, and once Terminal and the runner's launchd context
hold FDA, anything running as him on that Mac can read all of it. The `--chat` scoping is enforced
*inside the tool*; it does not narrow what the OS opened.

Two things reduce it, neither a blocker:
- **Audit what already holds Full Disk Access** before granting it to two more things
  (System Settings → Privacy & Security → Full Disk Access). The OSINT tooling F-E8-61 flagged is the
  specific worry.
- **FileVault on**, so the history is not readable from the disk at rest.

**Send-side risk is close to nil here**, which is worth saying because it is the fear this design
usually attracts: every outbound goes to his own note-to-self thread. WhatsApp's automated-messaging
enforcement targets unsolicited outbound *to other people*. Nothing in this design ever messages
anyone but him.

### C2. Install `whatsapp-cli` — from the clone, never from PyPI (10 min)
```bash
brew install uv
git clone https://github.com/marcelrgberger/whatsapp-cli ~/Applications/whatsapp-cli
uv venv --python 3.12 ~/Applications/whatsapp-cli/.venv
uv pip install --python ~/Applications/whatsapp-cli/.venv/bin/python \
  ~/Applications/whatsapp-cli/agent-harness
ln -sf ~/Applications/whatsapp-cli/.venv/bin/whatsapp-cli ~/.local/bin/whatsapp-cli
```
**Two traps, both real.**
1. `pip install whatsapp-cli` installs **somebody else's package** — an unrelated project at 0.1.3.
   The command above installs from the clone's `agent-harness` directory. Never "simplify" it.
2. The code needs Python **3.12**. The README's "3.10+" is wrong — on 3.11 it dies with
   `SyntaxError: f-string expression part cannot include a backslash` (`whatsapp_cli.py:1232`).

**Do not** run `claude plugins install whatsapp-cli` in the business profile: the plugin adds a
`/whatsapp` skill that lets *any* Claude Code session on that Mac read and send WhatsApp. The task
needs only the CLI.

### C3. macOS permissions and the link (10 min)
**Audit before you grant.** Open System Settings → Privacy & Security → **Full Disk Access** and read
the list that is already there. You are about to add two more entries to a permission that hands the
holder your entire WhatsApp history in plaintext, so it is worth thirty seconds knowing who else
already has it. Turn off anything you do not recognise or no longer use.

Then:
- **Full Disk Access** — for the shell that runs it: Terminal *and* the runner's launchd context.
  Reads work headless. This is the grant that exposes `ChatStorage.sqlite`.
- **Accessibility** — for `osascript` / System Events. Sends need a GUI session: Mac awake, logged in.
- Link **your own number** in WhatsApp Desktop and leave it logged in.
- **FileVault on**, if it is not already, so the history is not readable from the disk at rest.

### C4. Settle the one assumption everything else rests on (5 min) — do this first
The self-chat design assumes **every message in a note-to-self thread carries `is_from_me: true`**,
because there is no other party. That is reasoned from WhatsApp's data model, **not measured** — no
self-chat has ever been read by this tooling, and it cannot be from a cloud session.

Open WhatsApp on the phone, send two or three messages in your own thread, then run **one
command** — it does the whole probe, reads the answer for you, and prints the seed document with your
real values already in it:

```bash
./integrations/whatsapp-selfchat-setup.sh "+1XXXXXXXXXX"     # your own number
```

It writes nothing, sends nothing and **never prints a message body, a contact name or any number but
the one you pass** — it reports shapes and counts, so its output is safe to paste back here.

It ends on one of three verdicts:
- **"build §5a as written"** — `is_from_me` is true on every row and no field discriminates. The
  `[V] ` marker is doing real work.
- **"do NOT build §5a as written yet"** — it found a field with more than one distinct value, very
  likely the two devices. **Send me the field name and the counts** (not the values): that beats a
  text marker outright and §5a gets *simpler*.
- **"report before building"** — what came back does not match the spec's assumption. Guessing here
  costs messages on your personal number.

If you would rather run it by hand, it is these three calls plus the reading:
```bash
whatsapp-cli --json session status
whatsapp-cli --json chat find "<your own number>"
whatsapp-cli --json message get "<that chat>" --after 2026-09-01T00:00:00Z | head -40
```

**Check:** you have the self-chat's name/JID and a seed document. The name becomes both `chatName`
and `allowFrom` in `whatsappInboxState`.

### C4b. Prove the round trip, screen unlocked (5 min)
```bash
whatsapp-cli message send "<that chat>" "[V] test from Vanessa"
```
**Check:** it arrives in your own WhatsApp thread on the phone, with the `[V] ` marker visible.

That marker is not decoration. In a self-chat, Vanessa's replies and your messages are
indistinguishable — same sender, same `is_from_me`, same thread — so the marker is how the task knows
which is which, and the reason it will not sit answering its own replies. **Cost, stated plainly: if
you ever type a message starting with `[V] `, it is ignored.**

### C5. Seed `whatsappInboxState`, then create the task **disabled** (10 min)
Spec: `integrations/mac-task-specs.md` **§5a** — the self-chat amendment, not §5. The paste-ready
prompt is in §5a. Polls every 10 minutes under claude-runner once enabled.

Seed the state document first, or the task has no cursor and no breaker:
```json
{"v": {
  "chatName": "<the self-chat name from C4>",
  "allowFrom": "<your own JID from C4>",
  "selfChat": true,
  "lastSeenTime": "<now, ISO-8601 UTC>",
  "lastSeenPk": <the newest pk you saw in C4>,
  "pending": [],
  "recentOutbound": [],
  "sentToday": {"date": "2026-09-23", "count": 0}
}}
```

Unchanged from §5 and not negotiable:
- One allow-listed sender — **you**. Everything else logged as ignored.
- **No group chats. No `monitor auto-reply`** — it shells out to `claude -p` on its own, outside the
  handler and outside the HALT list.
- **No `export`** into the vault, the brain, the vector index or the knowledge graph.
- The HALT list applies exactly as on iMessage.

**The three things that keep a self-chat from looping**, because this is the part that can actually
cost you something:
1. **Per-poll cap of 3.** A runaway answers 3 messages per 10 minutes, not an unbounded burst.
2. **Daily ceiling of 20 sends.** At 20 it stops for the day and tells you *on iMessage*, not on
   WhatsApp. Twenty is roughly twice a heavy day of real use — **if you ever see that message, read
   it as a bug, not a busy day.**
3. **`lastSeenPk` is monotonic** and is advanced past Vanessa's own sends immediately after she
   sends, so her outbound is behind the cursor before the next poll starts.

Each is independent of the `[V] ` marker. Two would have to fail together before a loop reaches your
phone more than three times.

**Check:** run it by hand once with one message waiting. Expect exactly one inbound and one outbound
`channel:"whatsapp"` item in `agentInbox`, `sentToday.count` at 1, and `lastSeenPk` advanced past your
own message *and* past Vanessa's reply. Then enable it.

The deck's "Reach Vanessa" row can only stop saying *"spec written · Mac install pending · not yet
live"* once that run exists.

---

## D — CLI-Anything, the browser targets

The install is scripted. **The path maps are the work.** All 18 browser recipes ship
`verified: false` and **no site has ever been reached** from the build sandbox, so nothing they return
may drive a decision before a spot-check against the screen.

### D1. Install the eight harnesses — browser first, one command (10 min)
```bash
export CLI_HUB_NO_ANALYTICS=1                        # already in ~/.zprofile from A2
pip install cli-anything-hub                         # 0.4.1
claude plugin marketplace add HKUDS/CLI-Anything
claude plugin install cli-anything@cli-anything
./MAC-SETUP.sh --only cli-anything-harnesses         # all eight, browser first, one uv command

cli-hub list && cli-anything-homes --help            # self-test: both exit 0
```
**Why browser first, same command:** the five web packages pin `cli-anything-browser>=1.0.0` and
import it at module level — and that package is **not on PyPI**; it is vendored in this repo. Resolve
them separately and uv goes to PyPI for a package that is not there, and the venv then fails at
`--help` rather than at call time.

### D2. Chrome, DOMShell, and an accepted risk (15 min)
DOMShell is a third-party Chrome extension with page-content access, driving a Chrome already logged
into the CRM, the transaction file system and the forms library. A deliberate risk to accept in
writing, not a detail.
- Install the DOMShell Chrome extension.
- **Sign in to every target by hand.** The harnesses cannot sign in; MFA/SSO is a HALT, not a puzzle —
  and ShowingTime is MLS-SSO'd in CRMLS.
- Export `DOMSHELL_TOKEN` in the harness shell. It is a credential the scripts never touch.

**Open finding, unfixable by any wrapper:** `DOMSHELL_TOKEN` is passed to `domshell-proxy` in **argv**,
so it is visible in `ps` to anything running as the same user. The proxy reads argv only — no env
fallback (F-P1-03).

### D3. Posture, and drive through the launcher — never bare (5 min)
```bash
integrations/cli-anything-harnesses/browser/runtime/posture.sh install
integrations/cli-anything-harnesses/browser/runtime/posture.sh check
```
Green **and** "posture is inherited" is the precondition. Then run every recipe through
`browser/runtime/run-browser-harness.sh`: it sets `CLI_ANYTHING_BROWSER_BLOCK_PRIVATE=true` *before
the interpreter starts* (SSRF blocking is off by default and read at import time) and pins DOMShell.
Started any other way, **both are off**.

Read-only means the verb is **absent** from the built harness, not switched off in config. Check it
with a **word** match — a substring match false-trips on `my-listing-activity`, `redact`, `contact`,
`interactive` and `exact`:
```bash
cli-anything-homes --help | grep -qw act && echo "FAIL: write verb present" || echo "ok: read-only"
```

### D4. homes.com first — 3 recipes, public data, lowest blast radius (45 min)
```bash
cli-anything-homes paths init      # copies the packaged map to ~/.config/cli-anything/homes-paths.json

# for EACH of: search-listings · saved-searches · listing-detail
cli-anything-homes --json recipe search-listings --discover --text
#   → find the container that holds the rows in the dumped tree
#   → edit ~/.config/cli-anything/homes-paths.json:  root, rows.prefix, fields.<f>.prefix / regex
cli-anything-homes --json recipe search-listings          # until the rows match the screen
```
Resolution order: `$CLI_ANYTHING_HOMES_PATHS` → `~/.config/cli-anything/homes-paths.json` → the
packaged default.

| Exit | Means | What to do |
|---|---|---|
| `3` | `path_map_error` — configured `root` missing | Run `--discover`. Do not guess values. |
| `4` | `url_rejected` | The URL is not on the allow-list for that target. |
| auth `unknown` | Signed in, but the page shows none of `auth.logged_in_markers` | `--discover --text`, find text only a signed-in page shows, add it to your copy. |

**Stop, do not continue** if any `fs` output carries a `!! SECURITY:` banner or
`"prompt_injection_suspected": true` — read the page yourself; the page tried to talk to the agent.
The guard has never seen a real listing page, so expect false positives on ordinary copy.

**The gate that makes it trustworthy:** its numbers must match the UI. Silent scrape drift is the
failure that poisons decisions — a wrong number is worse than no number.

### D5. ShowingTime — 4 recipes (45 min)
`todays-showings` · `showing-status` · `feedback-inbox` · `my-listing-activity`. Same loop as D4.

ShowingTime+ is Zillow-owned and SSO'd through the MLS in many markets, CRMLS included. If the sign-in
wants MFA or a CAPTCHA, that is a **HALT** — stop, do not work around it.

There is no individual-agent API here: ShowingTime's documented APIs are MLS- and broker-licensed
*listing data* feeds, not appointments. Treat "no agent API" as the working assumption and the browser
path as the design.

### D6. Showami — 4 recipes (45 min)
`my-requests` · `request-status` · `assistant-feedback` · `posted-price`.

**One credential location, no exceptions.** All five web logins live in
`~/.config/cli-anything/.env` — **Showami included**. The `~/.config/showing-sync/.env` path the
deck's old row still shows is **superseded**; nothing creates or reads it.

| Target | Keychain service | or `.env` variables |
|---|---|---|
| homes.com | `cli-anything.homes` | `HOMES_USER` / `HOMES_PASS` |
| ShowingTime | `cli-anything.showingtime` | `SHOWINGTIME_USER` / `SHOWINGTIME_PASS` |
| Showami | `cli-anything.showami` | `SHOWAMI_USER` / `SHOWAMI_PASS` |
| SkySlope | `cli-anything.skyslope` | `SKYSLOPE_USER` / `SKYSLOPE_PASS` |
| zipForms | `cli-anything.zipforms` | `ZIPFORMS_USER` / `ZIPFORMS_PASS` |

If a harness ever asks for a password typed into a prompt, that harness is wrong. `SHOWAMI_API_KEY` is
reserved and unused — add it only if the account is ever granted Showami API automation.

---

## E — The ECC gate: SkySlope and zipForms

### E1. Hold the review, then record the real date (1 h) · licensed risk
Both harnesses enforce this themselves — exit **3**, `connState: disabled-by-policy`, on every live
command until `CLI_ANYTHING_ECC_REVIEWED_AT` holds a real, past-or-today date. The deck's connector
card clamps them for the same reason.

The review answers three questions per harness: **what it can reach**, **what it stores**, **what a
prompt-injected page could make it do**.
```bash
export CLI_ANYTHING_ECC_REVIEWED_AT=YYYY-MM-DD   # in the runner's env — the real date
```
Record the same date as `eccReviewedAt` in `cliAnythingStatus`. **Do not set the date to make a
command run.** Alexandra's terms-and-robots.txt check for homes.com, SkySlope and zipForms belongs in
the same sitting.

### E2. SkySlope — 4 recipes, after the date exists (45 min)
`transactions` · `transaction-detail` · `document-index` · `checklist-status`.

`document-index` **lists** documents. It does not download them. A download lands client PII on disk —
allowed only into a path Steven names, and **never** into the vector index or the knowledge graph.

### E3. zipForms / Lone Wolf — 3 recipes (30 min)
`form-index` · `form-detail` · `packet-index`.

### E4. What stays off, and why one deny covers all of it
Every outward verb is an `act click` or `act type` underneath. **Denying `act` denies all of them at
once.** Put that in the task's Bash allow-list as literal permitted argv prefixes; do not ask a
wrapper to behave.

| Verb, if it existed | How far the damage goes |
|---|---|
| ShowingTime `showing confirm` | **Commits a seller to letting people into their home at a time.** Worst single verb here for a listing client. |
| ShowingTime `showing request` | Sends an appointment request to a listing agent and, through them, a seller. A stranger acts on it. |
| ShowingTime `feedback submit` | Writes an opinion **attributed to Steven** into a record the listing agent and seller read. Can read as representation advice. |
| Showami `showing post` | **Hires a licensed person and charges the card.** Money plus a third party at a stranger's door. Irreversible once accepted. |
| SkySlope `esign send` | Signature request to a client or co-op agent. Licensed act, legally binding, unrecallable once opened. |
| SkySlope `checklist item complete` | Falsely marks a compliance item done — the failure nobody notices until an audit. |
| zipForms `packet send` | Delivers a contract packet to a client or the other side. |
| zipForms `form fill` | Writes contract terms. A wrong price or date in a draft that is later sent is a real-money error. |
| Lofty `text send` / `email send` | Outbound consumer messaging. TCPA/consent exposure, and it reaches a client. |

Each needs **written approval for that one verb on that one target** — one verb at a time, never a
blanket unlock.

---

## F — Tell the dashboard the truth

### F1. Run the `cli-anything-status` task once by hand (10 min)
The card currently says *"nothing has ever checked any of these on your Mac"* — which is true. Any
document carrying a `checkedAt` claims this Mac was inspected at that time, and no cloud session can
make that true. That is why this step is Steven's.

Paste-ready task: `routines/mac-task-repairs.md` §9. Shape, field by field:
`docs/data/cliAnythingStatus.doc.json`.

A wrapper that has never run is `"planned"` / `"not-installed"`. Never `"enabled"` or
`"read-only-live"` without a real `lastRun`; never either for SkySlope or zipForms without an
`eccReviewedAt`. `readOnly:false` is an error, not a state.

**List verb *groups*, never recipe names.** The card tests every `verbsEnabled` string against a
write-verb pattern and turns the whole card red on one match — Showami's `my-requests`,
`request-status` and `posted-price` all match it innocently (F-P2-15).

---

## G — Vanessa speaks when she writes

`voiceReplyQueue` is written by the Command Deck page **and by nothing else**. So away from the Mac,
she answers in text, silently. The renderer is healthy — `voice-reply-render` runs every 10 minutes,
`lastStatus ok` — it has simply had nothing to render since 2026-09-12, because the only writer is a
browser tab.

### G1. Make her speak on iMessage — CORRECTED 2026-09-24 (~25 min)

> **The first version of this step was wrong, and it was my error.** It told you to paste §6a and §6b
> and said a voice note would arrive ten minutes later. §6b could never have done that. It asked the
> task to put the MP3's base64 straight into a tool call, and I measured the one real clip in the
> store: **27 seconds of her voice is 135,424 tokens.** No model can emit that in one call, and it
> would cost ~270K tokens per voice note if it could. Two engineers had stopped at a 1,532-byte
> prefix for exactly this reason; I put it on your runbook without catching it. If you already
> pasted the old §6b, replace it — it will fail on every voice note.

**The fix: the model decides what to voice, a script moves the bytes.** Inkbox publishes a Python
SDK (MIT, 0.7.7), and its own docstring gives the path: `upload_imessage_media` takes raw bytes and
returns an **Inkbox-hosted** URL, which `send_imessage` attaches by conversation id — so no phone
number is ever handled, and the public-URL wall R4 hit on the 23rd does not apply. The script is
`integrations/vanessa-voice-send.py`; it passed **55 of 55** checks against the real SDK code path,
on the real clip and a synthesized one. It has never touched live Inkbox — that is your first run.

**1. Install the SDK** (skip if A2 already ran it):
```bash
./MAC-SETUP.sh --only inkbox-voice
```

**2. Create an Inkbox API key** — Inkbox dashboard → API keys. Put it in the file the SDK reads,
because a launchd job does not inherit your shell's variables:
```bash
mkdir -p ~/.inkbox && nano ~/.inkbox/config      # one line:  api_key = <paste>
chmod 600 ~/.inkbox/config
```

**3. Allow-list your Vanessa thread** — the script refuses to send to any conversation not in this
file, before any network call. A queue item is shared-store data; this file is local to your Mac.
```bash
mkdir -p ~/.config/inkbox && nano ~/.config/inkbox/voice-allow   # one line: the conversation UUID
```
The UUID is your iMessage thread with Vanessa (+1 650-484-9720). It is in the chat where I handed
you this step — it is deliberately not written into the repo.

**4. Prove it before trusting it** — no network, nothing sent:
```bash
~/Applications/inkbox-voice/.venv/bin/python integrations/tests/test_vanessa_voice_send.py
./mac-verify.sh      # four rows: inkbox SDK · inkbox api_key · voice allow-list · voice send self-test
```

**5. Paste §6a and the REWRITTEN §6b** from `integrations/mac-task-specs.md` — §6a onto
`vanessa-imessage-inbox`, §6b onto `voice-reply-render`. §6b now saves the audio to disk with
`out_dir` and runs the script; the model only ever reads its one line of JSON.

**Check:** text Vanessa from your phone. Her text reply arrives first, as today. Within one render
poll (≤10 min) her voice note lands on the same thread, and
`voiceReplyStatus.items[<id>].delivered.ok` is `true`. If it is `false`, the `error` field carries the
script's exit reason verbatim: **5** = allow-list, **6** = Inkbox said no, **7** = SDK missing.

> §6c, the email version, has the same defect and is marked *do not paste*. It stays a design record
> until you decide on G3.

### G2. Where she can and cannot speak — tested 2026-09-23, and the count went up
Steven asked that Vanessa speak when she replies **across all communication platforms**. Measured,
not assumed:

| Channel | Text reply | Her voice | Evidence |
|---|---|---|---|
| **Dashboard** | yes | **yes, today** | The page plays her own rendered audio with the face moving. |
| **iMessage** | yes | **yes, after G1** | Delivery by `vanessa-voice-send.py` + the Inkbox SDK: 55/55 against the real SDK code path on the real 27 s clip, 2026-09-24. Not yet run against live Inkbox. |
| **Email** | yes | **possible, after G3 — not built** | Inkbox accepts `audio/mpeg` attachments (staged 2026-09-23). But §6c as written has G1's old defect and needs the same script treatment before it can work. |
| **Discord** | yes | **never** | `DISCORDBOT_CREATE_MESSAGE` has no file or attachment parameter of any kind. |
| **WhatsApp** | yes | **never** | `message send` is `whatsapp://send?phone=…&text=…`. There is no parameter an MP3 can occupy. |
| **SMS** | — | — | No channel at all: `phone.assigned: false`, `sms_available: false`. |

**Discord and WhatsApp are "never", not "not yet".** On both, the send mechanism itself has nowhere to
put a file. That is not a quota, a permission or a missing credential.

**The link workaround was tested and is a no for a shared channel.** The artifact asset store
**refuses audio outright** — its accepted list has no mp3, m4a, wav or ogg on it — and what it returns
for an accepted type is a **relative path** (`/_blob/<id>`), not a URL anything could carry. A clip
*can* be carried inside a private artifact page, and that page's URL is genuinely private: two
unauthenticated fetchers were refused (a bare `curl` got HTTP 403, and Inkbox's own public-URL fetch
mode returned `url_fetch_failed`). So it is a tappable link **that only opens in a browser already
signed in to your account** — the Claude app, or Safari with a live session. Signed out, you get a
sign-in wall instead of the clip. Useless for Discord-with-other-people; workable for you alone.

*Not proven:* that a signed-in browser actually plays it. The bytes were verified present, correct
and private; no browser was available, so no playback was ever observed.

### G3. Decide whether you want a `vanessa-email-inbox` task
This is the gate on the only **new** speaking channel, and it is the top of R4's list.

Email has been treated as background all along and was never tested as a delivery channel. It is live
on the Inkbox identity, and unlike Discord and WhatsApp it has an attachment parameter. Better than
iMessage in one respect: the upload returns a `content_hash` equal to the sha256 computed before the
call, so the renderer can **verify** the staged file is its own clip — on the iMessage path that hash
is an opaque token and `size_bytes` is the only check.

**Nothing reads that mailbox today.** `vanessa-imessage-inbox`, `-discord-inbox` and `-whatsapp-inbox`
exist; there is no email equivalent. A task that answers a live mailbox is a **new outbound write path
on a client-capable channel**, so it is your call, with the same one-sender allow-list as the others.
Spec is `integrations/mac-task-specs.md` §6c, inert until you say so.

*Caveat, stated plainly:* nothing was ever sent. The staged payload was a frame-aligned 1,532-byte
prefix, not the whole clip. The **encoding and content type are proven accepted**; a full-clip stage is
not claimed.

**Optional, no hurry (§6d):** the private-link path for Discord and WhatsApp. Inert until either is
connected, and neither is. If you ever want it: one artifact rewritten in place, never a new artifact
per reply, capped at the newest 10 clips (≈1.45 MB at rest, matching the cap `voiceReplyQueue` already
keeps) and pruned in the same run that writes.

---

## H — One click or one paste

### H1. `strava-daily-sync` — **before 12:20 UTC / 05:20 PT today**
The task writes `stravaSnapshot` without the `{v:…}` wrapper and will overwrite the hand repair on its
next run. The prompt lives only on the Mac. **Paste** `routines/mac-task-repairs.md` §1 over the
task's prompt, then after the 12:20 run ask a Mac session the one-line check in §1.

*Re-checked 2026-09-23:* `stravaSnapshot` is **still correctly wrapped at v9** — the overwrite has not
happened yet. A cloud **Strava wrapper guard** now stands behind the Mac task as a backstop, but it
has **never run**; its first firing is today at **12:47 UTC**, which is *after* the 12:20 slot it is
meant to catch. Treat the guard as untested and do the paste.

### H2. Disable the old "Pipeline Sync" cloud routine — one click (1 min)
It reports SUCCEEDED four times a day and syncs nothing; its own prompt is research-only. Created
through the web UI, so every agent attempt to disable it was refused — three times.
**Click disable** at https://claude.ai/code/routines/trig_018BSAYiYzvtyaUkpAY4SnqE

### H3. Strategy-cycle routine (3 min)
`trig_011CXFHCT3hou6uaCfb5rWkC` succeeds every weekday and has no write step, so `strategySnapshot`
has been frozen since 2026-09-16. Web-UI-created, so only Steven can edit it. **Paste**
`routines/mac-task-repairs.md` §5 over its prompt. Leave `r4-quantvue-sync` disabled until one writer
is chosen.

### H4. Press **Run now** on the two weekly tasks that have never run (15 min)
`revenue-scan-weekly` and `health-coaching-weekly` are registered, enabled, and show `lastEnd: null`.
Their documents have never existed — the last Degraded row on the stress sweep. Both were already
registered at the 2026-09-16 sync, so the 09-20 slots passed with nothing run: **waiting for 09-27
will not fix it.**

Open the desktop app's **Scheduled** section, press **Run now** on each, and **approve every tool as
it asks** — approvals from a Claude session do not transfer, and a scheduled run cannot ask anyone.
Then paste `routines/mac-task-repairs.md` §10 and §11 onto the two prompts.

Run health coaching first even though Apple Health is down: with the ingest dead, the correct result
is a brief that says so, and the card has a banner built for exactly that.

### H5. Fix the runner's seven-hour clock lie (10 min)
`runnerStatus` stamps write Pacific wall-clock time with a `Z` on the end. That made a live Mac look
dead for an entire audit. **Paste** the diagnostic sequence in `routines/mac-task-repairs.md` §2. The
fix is `date -u`.

### H6. Three more found 2026-09-23 — same failure shape as H4
All three are the output-not-execution failure: a green row over a document that has not moved.

- **`openrouterFeeds` has been frozen since 2026-09-13** while its writer keeps reporting `ok`. The
  worst current instance of the pattern.
- **`brain-weekly-verify` has not run since 2026-09-14**, so the **2026-09-20 gate passed silently**.
  It is in neither the error set nor the never-run set, which is exactly why no finding caught it —
  it looks healthy from every angle except the document's own date.
- **The eight `~/.cli-anything-*/history` paths have no backup or encryption home.** They will hold
  whatever the browser harnesses read once Phase D runs, so decide where they live *before* D4, not
  after.

### Not urgent after all — the cloud-routine outage
`docs/NEEDS-STEVEN.md` item 2 asked you to watch Project Risk Review's 18:06Z firing as a free test of
whether a live startup outage was killing cloud routines. **It ran: SUCCEEDED, fired 2026-09-22T18:07.**
The outage is not live, and the four web-UI routines it pointed at are not urgent.

Nine routines are still FAILED and stable since 09-20 — but **two of them are agent-created**
(`meta_mcp`: Ops Issue Review, Books Reconciliation Reminder), so those two are not yours at all. The
real ask is smaller than item 2 made it sound.

---

## I — Decisions nobody else can make

- **ISA seat — by Fri 2026-09-25.** Nine messages on the line, all Steven's, zero ISA-authored ever.
  **Send** the outreach draft in `docs/ISA-SEAT-DECISION.md`, **pick** a course of action (the packet
  recommends 1, today), **retime or switch off** `r3-eod-rollup` which posts the nudge as Steven.
- **Apple Health — Branch A or B.** `r8-apple-health-snapshot` reports ok twice a day and writes
  nothing (ingest daemon died 2026-09-13). Branch A (recommended): retire r8 and
  `health-full-analysis`, use the phone. Branch B: restart the daemon.
  `routines/mac-task-repairs.md` §3. Then the first phone run (open Claude on the iPhone, say "update
  my health stats", grant the Apple Health read and Notion write once), then create and enable
  `health-notion-sync` (`integrations/mac-task-specs.md` §3).
- **Google Drive.** Never wired: no connector, no key, no row — while two Mac tasks claim to read a
  Drive "Second Brain" folder and the fabric tile counts it at 0 files. That zero is a false green,
  not an empty folder. Wire it read-only (`integrations/google-drive-brain.md`) or drop the line.
- **Re-enable the cloud ISA bridge and the Steve twin — but edit the twin first.** Its prompt still
  calls the retired CRM your real-estate system and reads it through Composio. Three exact
  find-and-replace lines are in `routines/fub-removal-2026-09-24.md` §3; make them, then enable.
  Same file, §1 and §2: two more web-UI routines (the Friday ops review, the weekly loop) need a
  one-line edit each.
- *(original entry)* **Re-enable the cloud ISA bridge and the Steve twin.** Both were disabled on a belief disproved by
  measurement on 2026-09-22. `trig_01VpcvVPTrbdfvdbXn1mD7hB` (bridge) and
  `trig_0174717mnSfAk1LtQQVJhH7r` (twin). **Both just need enabling — neither needs recreating.**
  Read live on 2026-09-23: the bridge is `http_api` with **11 connectors**, the twin is `http_api`
  with **9**, and the twin's list already includes **Gmail**. An earlier version of this line said the
  twin needed rebuilding in the web UI because its Gmail step had no connector. That was wrong, and it
  rested on a rule that is itself wrong — see below.
- **Retired-CRM residue.** 392 lines / 716 mentions across 33 dated audit records under `docs/`, plus
  the saved-state keys in both dashboards, the skill folder on the Mac, the legacy calendar name
  inside Google, and lead rows that may persist in deck backups and the artifact DB. *My read: purge
  the live surfaces, leave the dated records alone — rewriting a dated audit record is its own kind of
  lie.*
- **Weekly backup.** The cloud writer took a verified backup on 2026-09-22 and `backupStatus` reads
  GREEN — but beside that GREEN it reads **`weeksKept: 1`**. One week of history is not a backup
  rotation, whatever colour the card is. Decide that the cloud schedule and root replace the "Sunday
  00:00 local, Documents/AI-Ecosystem-Backups" spec, disable `r6-weekly-backup` (which has still
  never run), and say what the real retention should be.
- **Mentor naming** — the deck says Kevin, the installed skill says Cole. Pick one.
- **Licence renewal dates** — only Steven can confirm them from the source documents. Writing them
  from a second store would be a guess on a licensing surface, so nothing has been written.
- **Cloud egress** — every freshness pass on 2026-09-22/23 ran blind (lender, agency, weather and news
  domains blocked). Allow-list a handful of primary domains for cloud sessions, or keep those
  refreshes on the Mac tasks.

---

## One rule that was wrong everywhere, corrected 2026-09-23

Four files in this brain — and an earlier version of this runbook — stated that **"an agent-created
routine carries no connectors"**, and used it to escalate work to Steven that did not need him.

**It is false as a blanket rule.** `list_triggers` returns `mcp_connections` per routine. Read live
across all 57 on 2026-09-23: **14 `meta_mcp` routines carry 11 connectors each** (Gmail and Google
Calendar among them) and **7 carry none**. Connectors are inherited from the session that created the
routine; `created_via` implies nothing either way.

**The rule is: read `mcp_connections` on the routine in front of you.** Corrected in
`wiki/dashboard-ops/index.md`, `docs/CLOUD-WRITE-ARCHITECTURE.md`, `routines/mac-task-repairs.md`
§7(b) and three skill files. The visible consequence: `Real Estate Weekly Brief` was escalated to
Steven as a recreate-in-the-web-UI decision on this false premise, and it has had Gmail and Calendar
the whole time.

---

Sources, each carrying its own date: `MAC-INSTALL-comms-data.md` ·
`.claude/skills/cli-anything-connectors/SKILL.md` · `integrations/vanessa-voice-everywhere.md` ·
`docs/NEEDS-STEVEN.md` · `integrations/CONNECTIONS.md` ·
`integrations/cli-anything-harnesses/*/agent-harness/`. Nothing here is stamped with today's date
unless it was checked today.
