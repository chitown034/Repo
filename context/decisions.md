# Decisions — append-only, dated

One entry per decision. **Append, never edit and never delete.** A reversal is a new entry that
names the entry it reverses. Format: `## YYYY-MM-DD — <decision>` then Decision / Why / Owner /
Status. Read the entry you need, not the file.

Seeded 2026-09-22 with the decisions made in Loop Cycle 6. Everything before that date lives in the
deck's CI log and the loop log; this file starts here on purpose.

---

## 2026-09-22 — Lofty is the real-estate CRM

> **[Annotation added 2026-09-22 23:31 UTC — do not read this entry without the last entry in this
> file.]** This entry was rewritten in place, and its claim that the retired CRM *"is not referenced
> anywhere in the brain"* is false. See **`2026-09-22 — Correction: the Lofty entry above was edited
> in place, and it overstated`** at the end of this file for the measured numbers. Nothing else in
> this entry has been touched since; the annotation adds a line and changes no word below it.

- **Decision.** **Lofty** (formerly Chime) is the real-estate system of record as of 2026-09-22.
  It is the only real-estate CRM any task, document or surface may read or name. The previous
  real-estate CRM path is retired and is not referenced anywhere in the brain.
- **Why.** Steven's call, 2026-09-22 (restated the same day: remove the old CRM everywhere and
  replace it with Lofty). The prior path had stopped authenticating and its dependencies are gone.
- **No Lofty number is live.** Until the first `lofty-crm-sync` run succeeds, every real-estate
  lead figure reads "not connected yet". Never carry another system's figure under a Lofty label.
- **How Lofty is reached.** The Mac has `lofty-bridge` (read-only MCP over Lofty's REST API; key
  expected in `~/.config/lofty/.env` as `LOFTY_API_KEY`, obtained at Lofty → Settings →
  Integrations → API) and
  `lofty-cli` (npm `@loftyai/lofty-cli`). Composio has **no** Lofty toolkit. Whether the key is
  actually present cannot be verified from the cloud.
- **Owner.** Integration Engineer (under Elon) for the rewiring; Steven for the API key.
- **Status.** Decided. First Lofty sync pending — the `loftyLeads` doc has not been written yet.

## 2026-09-22 — Zoho CRM API access is Steven's to grant

- **Decision.** The Zoho fix is Zoho-side and only Steven can do it:
  **Zoho CRM → Setup → Security Control → Profiles → the connected user's profile → enable
  "Zoho CRM API Access".**
- **Why.** The Composio connection is ACTIVE (account `zoho_talite-spike`, created 2026-09-21), but
  every CRM call returns HTTP 403 `NO_PERMISSION` / `Crm_Implied_Api_Access` — verified
  2026-09-22 08:17 UTC against ZOHO_LIST_LEADS and ZOHO_LIST_DEALS.
- **Until then.** Zoho data on the deck stays the 2026-09-14 paste. A cloud routine re-tests every
  few hours and writes `zohoSync`; `zohoLeads` and `zohoDeals` fill automatically the moment the
  permission lands.
- **Owner.** Steven. **Status.** Blocked on Steven. HALT condition — do not work around it.

## 2026-09-22 — Model tiering

- **Decision.** Vanessa runs on **Claude Fable 5.1 masterminds** (orchestration, council chair,
  final synthesis). Executive / judgment seats on **Claude Opus 5**. Execution and report seats on
  **Claude Sonnet 5**. Research heavy lifting on **Perplexity**. Vanessa dispatches one sub-agent
  per agent, **≤8 parallel, ≤4 Perplexity per wave**.
- **Owner.** Steven, implemented by Vanessa. **Status.** Active.

## 2026-09-22 — Backup specification

- **Decision.** Backups go to `Documents/AI-Ecosystem-Backups/YYYY-MM-DD`, **every Sunday 00:00
  local**, rolling **8 weeks**, with an integrity check, **one** auto-retry, escalation after two
  consecutive failures, and a log entry for every run.
- **Honest current state.** Last verified backup **2026-09-14** (7,931 docs across both stores,
  109 MB, integrity pass; restore test 13/13 on 2026-09-15), `weeksKept` 3. The Mac task
  `r6-weekly-backup` (Sun 05:00 PT) **has never run under the runner** and missed Sep 20.
- **Owner.** Reliability Engineer to build; Steven to confirm the first real run.
- **Status.** Spec written this cycle. Not yet proven.

## 2026-09-22 — Apple Health moves to the Notion recipe

- **Decision.** Adopt the phone-first recipe (Jenna Redfield, "I Built an Automated Health Dashboard
  in Claude (Apple Health Sync) Using Notion Data", 2026-06-30): the **Claude iOS app** reads Apple
  Health on the phone → Claude writes the day's stats into **Notion** databases → the dashboards read
  Notion. Daily loop: open Claude on the phone → "update my health stats" → approve.
- **Why.** The existing pipeline (Health Auto Export → ingest daemon on LaunchAgent :8765 → DuckDB →
  apple-health MCP) is down: the daemon is not responding, the `appleHealth` doc's last real ingest is
  **2026-09-13**, and `r8-apple-health-snapshot` runs and writes nothing.
- **Status.** Spec written 2026-09-22; **first phone run pending**. The daemon stays as an optional
  second source, not the primary. Notion is connected.

## 2026-09-22 — You.com is retired

- **Decision.** The You.com connection is replaced by the Claude subscription. Research now runs
  only on WebSearch/WebFetch inside scheduled tasks and cloud routines, plus Perplexity for deep
  research. No page may leave a button that silently calls a retired service.
- **Why.** Steven's call; the free tier returned "limit exceeded" at 08:40 UTC on 2026-09-22.
- **Status.** Active. Connector lists read "You.com — retired 2026-09-22".

## 2026-09-22 — Mentor naming drift: open, Steven's call

- **Situation.** The deck's personal-development mentor seat is **Kevin** (`panel-kevin`, `kevinChat`).
  The claude.ai Desktop skill for the same role is `cole-mentor` ("Cole").
- **Decision so far.** Kevin stays on the deck. Renaming the skill or the seat is **Steven's call**.
- **Status.** Open. Recorded so the next session does not "fix" one side silently.

## 2026-09-22 — Correction: the Lofty entry above was edited in place, and it overstated

- **What happened.** The `2026-09-22 — Lofty is the real-estate CRM` entry at the top of this file
  was **rewritten in place** later the same day, by the coordinating session, to strip the retired
  CRM's brand name out of it. This file's own rule — *"Append, never edit and never delete"* — makes
  that wrong. The original wording is not recoverable from here. This entry stands in its place as
  the record, and the rule holds from here: a change is a new dated entry, never a rewrite.
- **The overstatement.** That entry claims the retired path *"is not referenced anywhere in the
  brain."* That was not true when written and is not true now. Measured **2026-09-22 23:29 UTC**
  across `*.md`, `*.json`, `*.sh`, `*.py` in this repo: **1,038 matches in 47 files.**
- **Where they actually are** — the distinction that matters:

  | Area | Matches | What they are |
  |---|---|---|
  | `wiki/`, `context/`, `integrations/`, `always-on/`, `references/` | **0** | every leaf the L1 router sends a question to — clean |
  | `docs/findings`, `docs/data`, `docs/MASTER-FINDINGS.md`, `docs/reports`, `docs/ENGINEERING-BRIEF.md`, `docs/inventory` | **910** | dated audit records of what was true on those dates |
  | `.claude/skills` (2), `projects/ai-team.md` (1), `routines/mac-task-repairs.md` (3), `docs/NEEDS-STEVEN.md` (1) | **7** | name the Mac skill folder `fub-followups` literally, or record the retirement itself |

  So the honest claim is: **no surface the router reads carries the retired CRM.** The residue is
  the audit trail and a folder that is really called that on the Mac.

- **Decision — the audit trail keeps its names.** The 910 matches under `docs/` are dated findings,
  reports and logs. Rewriting them would falsify the record of what was true on the day each was
  written, which is a worse fault than a stale brand name and contradicts this brain's standing rule
  to state the age of every fact. They stay. Where one is quoted forward into a live surface, the
  live surface says Lofty and, if a number came from the old system, says so by name and date.
- **Decision — the saved-state keys stay too.** Both dashboards keep the internal keys `c.fub`,
  `sel.fub` and the `"fub"` sync-target id. Verified the same hour: the published Command Deck and
  ISA Portal contain **zero** visible `Follow Up Boss` text and **zero** standalone `FUB` — the only
  hits are those identifiers plus base64 noise. Renaming a persisted key orphans every value already
  saved in every browser profile on both Macs unless a migration reads the old key first, and it
  needs a matching change to the `showing-sync` Mac task, which is Steven's. It buys nothing a user
  can see. Keep.
- **Steven can overrule either call.** Purging the audit trail is one sweep; migrating the keys is a
  migration plus a Mac task edit. Neither is started.
- **Owner.** Coordinating session. **Status.** Active. Supersedes the "not referenced anywhere"
  sentence in the first entry of this file.

## 2026-09-22 — `act` is allowed in the CLI-Anything browser engine, never in a site harness

- **Decision.** The read-only guarantee on the CLI-Anything wrappers is enforced as a **word match on
  `act`** in each package's `--help`, and it applies to the **seven site harnesses only** — homes.com,
  ShowingTime, Showami, SkySlope, zipForms, Lofty, Zoho. `act` appearing in any of those **fails**
  `mac-verify.sh`. The `cli-anything-browser` **engine** is exempt: it genuinely ships an `act` group
  (`act click`, `act type`) at `browser_cli.py:308-336`, because that is DOMShell's write surface and
  the reason the engine exists. The engine instead **reports its `act` group by name on every run**,
  as an information line.
- **Why not simply fail the engine too.** A check that is red forever is a check everyone learns to
  scroll past, and it would take the seven real checks down with it. Naming the write surface out
  loud on every run keeps it visible without training Steven to ignore the verifier.
- **Why a word match and not a substring.** Measured against all eight real `--help` outputs on
  2026-09-22: a bare `grep -q act` matches **all seven** site harnesses — `interactive` everywhere,
  `action` in SkySlope and zipForms, `redact`/`redacted` in Lofty and Zoho. `grep -qw act` is the
  version that means what it says.
- **What the guarantee actually rests on.** Denying `act` denies every outward verb on all five web
  targets at once: every showing request, every Showami booking, every e-sign send is an
  `act click`/`act type` underneath. `page open` stays allowed but URL-allow-listed, because a
  crafted URL can itself perform an action on some sites.
- **Owner.** Build Engineer proposed; coordinating session confirmed. **Status.** Active, implemented
  in `mac-verify.sh` 2026-09-22 and proven on all five branches (ok · engine-info · `act` on a site
  harness ⇒ FAIL · `--help` non-zero ⇒ FAIL · missing ⇒ FAIL). Never run on macOS — see the
  verification caveats in `docs/findings/findings-P1.json`.

## 2026-09-22 — CLI-Anything is Apache 2.0, and `setup.py` saying MIT does not change that

- **Decision.** Upstream HKUDS/CLI-Anything is governed by **Apache License 2.0**. Its
  `browser/agent-harness/setup.py:29` declares `license="MIT"` with an OSI MIT classifier; that
  string is **wrong and is left exactly as upstream wrote it**, because the vendored tree is
  unmodified and a provenance record that quietly "corrects" upstream is no longer a provenance
  record.
- **Why Apache governs.** The repository's own `LICENSE` file is 201 lines of verbatim Apache 2.0,
  `README.md` and `cli_anything/browser/README.md` both agree, and Apache is the stricter of the two
  on attribution — so it is also the safe reading if the ambiguity is ever tested.
- **What compliance required.** `LICENSE` vendored beside the tree byte-identical to upstream; no
  NOTICE file exists upstream, so there is none to carry; no upstream file modified, so §4(b)
  modified-file notices did not arise **at the time of vendoring**. If any file is later patched,
  §4(b) applies and `VENDORED.md` must stop claiming the tree is unmodified.
- **Owner.** Build Engineer. **Status.** Active. Upstream commit `34f5195`, fetched 2026-09-22.

## 2026-09-23 — Full client names belong on the Command Deck lead board

- **Decision.** The Command Deck's Zoho lead board shows **full first and last names**. Steven's
  explicit call, made after being shown the alternatives (label form `J. Whitfield`, first name plus
  last initial, or full names) and the tradeoff. He chose full names, and chose to **recover the 15
  rows removed earlier the same day** rather than re-enter them, with Zoho filling in from here.
- **What this overrules, and how far.** `wiki/clients/index.md` says *"Use a label, not a full legal
  name"* and the HALT list guards client PII. That default stands everywhere else — the ISA Portal,
  the vector index, the knowledge graph, any research call, any prompt that leaves the machine, any
  report. It is overruled for **this one board**, on the reasoning that the artifact is private, the
  clients are his, and the call is his to make. A future session must not "fix" this back.
- **What it does NOT license.** A name and a stage is the whole of what was agreed. No address, loan
  amount, rate, credit detail, account number or document identifier goes on this board. Aggregates
  remain the rule for every other surface.
- **What Steven accepted with it.** Names travel into every published artifact version and into the
  weekly deck backups under `Documents/AI-Ecosystem-Backups/`. They cannot be removed from a version
  already published — an agent can delete a whole artifact but not one version of it. If the link is
  ever shared, the names go with it. The earlier record of the removal stays dated and intact.
- **Why the board now states its own age.** The seed is a fixed 2026-09-14 paste and does not expire
  on its own, so an unsynced board could read as today's pipeline. The card now says outright that
  the rows are the page's seed, frozen at that date, replaced outright rather than merged when a
  `zohoLeads` document first appears.
- **Owner.** Steven. **Status.** Active, live in Command Deck v151.

## 2026-09-23 — Vanessa reaches Steven on his personal WhatsApp, not a dedicated number

**Decision.** Steven links **his own personal WhatsApp**, and reaches Vanessa in his own
**"Message Yourself"** thread. The dedicated-number design written on 2026-09-22 is superseded.

**Offered and declined, with the reasons given at the time.** He was shown three shapes: a dedicated
number he texts from his normal WhatsApp app (recommended); his personal WhatsApp in a note-to-self
thread; and his personal WhatsApp read-only with replies on iMessage. He chose the second after being
told both costs below. This entry exists so the trade-off is not relitigated as a finding.

**Cost 1 — Full Disk Access is an OS grant, not a per-chat one.** `ChatStorage.sqlite` is his entire
personal WhatsApp history in plaintext SQLite. Once Terminal and the runner's launchd context hold
FDA, anything running as him on that Mac can read all of it. The task's `--chat` scoping is enforced
inside the tool and does not narrow what the OS opened. If clients ever message him on WhatsApp, that
history includes client PII — a compliance surface for an MLO, not only a privacy one. Mitigations,
both his and neither a blocker: audit what already holds FDA before granting it to two more things,
and FileVault on.

**Cost 2 — §5 could not run in a self-chat at all.** It kept only rows with `is_from_me: false`; in a
note-to-self thread every message is from him, so the filter dropped everything. Inverting it makes
Vanessa's own replies indistinguishable from his messages, which is a reply loop on his personal
number. `integrations/mac-task-specs.md` §5a is the amendment: a `[V] ` authorship marker, echo
detection against the last 20 outbound texts, a strictly-monotonic `lastSeenPk`, a per-poll cap of 3
and a daily ceiling of 20 sends that stops and reports on iMessage rather than WhatsApp.

**What is NOT changed by this decision.** The HALT list, one allow-listed sender, no group chats, no
`monitor auto-reply`, no `export` into the vault, brain, vector index or knowledge graph, and the task
created disabled until one manual run exists.

**Unmeasured, and named as such.** That a self-chat's rows all carry `is_from_me: true` is reasoned
from WhatsApp's data model, not observed — no self-chat has ever been read by this tooling and it
cannot be from a cloud session. §5a opens with the one-command probe that settles it; if a field
distinguishes the two sides, that field replaces the text marker and the design gets simpler.

**Send-side risk is close to nil in this shape** and is recorded so it is not overstated later: every
outbound goes to his own note-to-self thread, and WhatsApp's automated-messaging enforcement targets
unsolicited outbound to other people.

- **Owner.** Steven. **Status.** Active, spec written 2026-09-23, nothing installed or run.

## 2026-09-24 — CRM roles restated; Follow Up Boss removed from everything; GoHighLevel added

**Decision (Steven, 2026-09-24).** *"Lofty CRM replaced it as my primary CRM for real estate. Zoho is
my primary CRM for mortgages."* — and remove Follow Up Boss "from all routines, and everything". Also:
connect GoHighLevel.

| System | Role | State at 2026-09-24 |
|---|---|---|
| **Lofty** | Primary CRM, **real estate** (since 2026-09-22) | Not connected. No Composio toolkit exists for it; the path is `LOFTY_API_KEY` in `~/.config/lofty/.env` on the Mac (runbook B3). |
| **Zoho CRM** (+ Arive) | Primary CRM, **mortgage** | Composio connection ACTIVE, but every CRM call still returns **403 NO_PERMISSION** (re-tested 2026-09-24). Steven reports having an API key; the key is not the blocker — the profile's "Zoho CRM API Access" permission is, and it refuses every key and token for that user until switched on (runbook B2). |
| **GoHighLevel** | Role **not yet stated** | Composio `highlevel` connection initiated 2026-09-24 (`highlevel_lairy-apios`), waiting on Steven's sign-in. Read-only use only until he says what it is for and approves any write verb. |
| **Follow Up Boss** | **Retired** 2026-09-22 | Composio connection **removed** 2026-09-24. Account and data untouched on its side. |

**Never blended.** Real-estate figures come from Lofty and mortgage figures from Zoho; a number from
one is never reported under the other's label, and a number from the retired CRM is never carried
forward under either.

**What "everything" was taken to mean** — every place the old CRM is *configuration* (a routine prompt,
a connection, a role description, a system-of-record entry), not every place it is *history*. Chat logs,
dated measurements and dated audit records say what was true at the time; rewriting them would falsify
the record of the change. The full split, and the three web-UI routine edits only Steven can make, are in
`routines/fub-removal-2026-09-24.md`.

- **Owner.** Steven. **Status.** Active.

## 2026-09-28 — Laya becomes the zero-token System-1 hop, not a fine-tuning candidate

- **Decision.** Laya (`laya` 0.3.21, Apache-2.0, Convai Innovations) is adopted as the always-on
  first hop in front of Vanessa's recall order — a local, zero-token classifier that answers
  CLAUDE.md's own router questions (which leaf, which lane, which tier, client PII or not, how
  urgent) in about 33 ms once its checkpoint is cached, and escalates below its own confidence
  threshold. This supersedes the 2026-09-22 evaluation recorded in `MAC-INSTALL-tooling.md` §17
  ("not now — local PII-safe triage classifier only after fine-tuning"): the verdict here is
  narrower and different, and does not need fine-tuning to be useful as a router.
- **What was actually proven, and what was not.** `integrations/laya/` (package, install script,
  the five typed questions, the routing script) was built and its install was proven in the R11
  sandbox: `laya[mcp]==0.3.21` installs cleanly from PyPI and imports correctly. Hugging Face —
  needed for the one-time checkpoint download `--predict`/`Router()` requires — was blocked from
  that sandbox (403 Forbidden at the egress proxy, confirmed several ways; see
  `integrations/laya/README.md`). So the routing/threshold/PII-override logic was proven against a
  deterministic offline stub instead, on a 20-request, 16-class holdout
  (`integrations/laya/sample-requests.jsonl`) — that is a proof of the harness, not of Laya's real
  accuracy, and neither this entry nor any other file should read it as one.
- **What this does NOT authorize.** Installing Laya on the Mac, registering its MCP server, or
  running the weekly accuracy check proposed in `always-on/README.md` — all three need Steven, and
  are one Needs-Steven row in `docs/NEEDS-STEVEN.md`. Nothing here is live.
- **Owner.** Steven (install decision pending). **Status.** Proposed — repository-side package built
  and proven in sandbox 2026-09-28; not installed, not connected, not running anywhere.

## 2026-09-28 — Research-only feed routines become dashboard writers; at most 3 engineers at once

- **Decision (Steven, via the chat's question card).** *"Make them update the dashboard"*: each cloud routine
  that researches a dashboard feed must end by writing its document to the Command Deck's database (collection
  `state`), the same way the 12 routines that already write do. Duplicates of a converted routine are disabled,
  not deleted. The old prompts are kept, so any conversion can be undone.
- **Decision (Steven).** *"At most 3 at a time"*: no more than three engineer sub-agents run at once, because
  engineers, routines, Mac tasks and Steven share one usage allowance, and 34 of 66 routines failed when it ran
  out (Sep 24–28).
- **Why.** 19 enabled feed routines (~22.7 runs a day) produced research nobody applied, while the dashboard's
  feeds went stale. Writing on schedule is the only way the feeds stay current without a manual pass.
- **Owner.** Derek (automation health). **Status.** Decided 2026-09-28; the conversions are being applied —
  `routines/` records each one when it is.

## 2026-09-28 — Update (same day): feed writers recreated as new routines; the old ones are Steven's to switch off

- Agents cannot edit routines made in the web UI, so the writers were recreated as agent-owned routines
  (`routines/feed-writers-2026-09-28/README.md`). An earlier note here said agent-created routines could not
  write — **wrong**: the first writer wrote at 07:43 UTC, five minutes after its session looked idle.
- Rates waits on the network allowance (NEEDS-STEVEN 74); Strava and calendar go into Steven's own routines,
  which carry their connectors. **Owner.** Steven (switch-off), Derek (follow-up).

## 2026-09-28 — OmniRoute routes the research and local tiers; the subscription stays direct

- **Request (Steven, verbatim, model name elided).** *"configure omni route Setup orca / Local LLM and token
  optimization Omniroute / PrismML's Bonsai 27B: with Perplexity and [top-tier model] md"*.
- **Decision.** The top, executive and worker tiers run on the subscription, direct — never through OmniRoute.
  Anthropic's terms (code.claude.com/docs/en/legal-and-compliance → "Authentication and credential use", read
  2026-09-28) keep subscription sign-in for Claude Code and Anthropic's own apps. Perplexity does research
  through OmniRoute's `research` combo (≤4 per wave). Client-data (PII-gated) requests get one home: Bonsai 27B
  behind a single-target `local` combo, on the Mac, never a cloud fallback — and that route stays off until a
  real test on the Mac proves it fails closed (`integrations/omniroute/README.md`, NEEDS-STEVEN 75).
- **Laya** now prints a `route` with its decision (`integrations/omniroute/route-map.json`); a PII decision
  always maps to `local`.
- **Not decided — HALT.** A top tier behind OmniRoute would need a pay-per-token key (money): NEEDS-STEVEN 77.
- **Owner.** Derek (automation), Elena (the PII gate). **Status.** Built 2026-09-28; nothing installed on the Mac.

## 2026-09-28 — WhatsApp: Vanessa answers through a local bridge, not n8n or a runner task

- **Request (Steven, verbatim).** *"also connect whats app to my phone now"*.
- **Decision.** `integrations/openwa/vanessa-bridge.py`, run by a LaunchAgent on the Mac that runs OpenWA.
  It polls the self-chat every 20 s with Vanessa's chat-fenced key. The read costs nothing, and Claude
  runs only for a new message (`claude -p --agent vanessa-orchestrator` from the Repo, read-only tools).
  It replies in the same chat with the §5a rules: `[V] ` marker, echo hashes, 3 per poll, 20 a day.
  n8n and the 10-minute runner task were both rejected: n8n adds Node 24, a webhook secret and a UI wizard
  for no gain, and a runner task would call a model 144 times a day to find nothing new.
- **Why not in the cloud.** The cloud sandbox's egress proxy blocks the WebSocket connection WhatsApp
  needs, and a cloud container is ephemeral. The link must live on the Mac.
- **Privacy.** Message ids (which embed the phone number) and Vanessa's replies are stored only as
  hashes. The log holds no message text. Messages reach Claude on stdin, not the command line.
- **Owner.** Derek (automation), Elena (the fence). **Status.** Built and tested in the sandbox
  2026-09-28; Steven links the phone (NEEDS-STEVEN 78).

## 2026-09-28 — Executives (and every seat on Opus 5) move to Claude Opus 5.5

- **Request (Steven, verbatim).** *"in the AI team replace Opus 5 with opus 5.5"*.
- **Decision.** The executive/judgment tier is Claude Opus 5.5 (`claude-opus-5-5`: same 1M context as
  Opus 5, $4/$20 per million tokens vs $5/$25). Updated in `CLAUDE.md`, `wiki/ai-team/index.md`, eight
  skills, the routine docs, the Command Deck and the live `secondBrain` doc. Findings, reports and briefs
  keep "Opus 5" because they record what was true when they were written.
- **On the Mac.** Claude Code 2.1.280 made Opus 5.5 the default for the `opus` alias, which almost every
  agent file uses, so those seats moved with the CLI update. Only explicit `claude-opus-5` pins remain;
  `integrations/ai-team/opus-5-5-on-mac.sh` finds and switches them (NEEDS-STEVEN 79). Deliberately NOT
  done: setting `ANTHROPIC_DEFAULT_OPUS_MODEL` in settings.json, because Claude Code applies settings env
  over the shell's and would break OmniRoute's free-route remap.
- **API behaviour to remember** (only if code calls the API directly; nothing in this repo does today):
  Opus 5.5 cannot disable thinking, its effort default is `medium` (Opus 5's was `high`), and forced
  `tool_choice` returns a 400.

## 2026-10-05 — Perplexity removed; all research and feeds run on the Claude subscription

- **Request (Steven, verbatim).** *"remove everything running on Perplexity and replace with Claude
  subscription"*.
- **Decision.** Nothing runs on Perplexity. Research heavy lifting is **Claude web research — Sonnet 5
  with WebSearch/WebFetch on Steven's Claude subscription**, capped at **≤4 web-research sub-agents per
  wave** (≤8 in parallel, unchanged). Recall level 3 (`recall_research` / `request_research`) and the
  `vanessa-research-queue` Mac task answer with Claude WebSearch. The dashboard feeds are written by
  Claude cloud routines — agent-created, running on the subscription
  (`routines/feed-writers-2026-09-28/README.md`, `routines/feed-writers-2026-10-05/`). The Composio
  `perplexityai` connection and the Mac's `perplexity` MCP are no longer used.
- **OmniRoute.** Its `research` combo and Perplexity provider are withdrawn. The research tier routes
  `subscription`, direct, like every other Claude tier — the subscription never goes through OmniRoute
  (`integrations/omniroute/README.md` §Hard rule). OmniRoute keeps the `local` route only.
  NEEDS-STEVEN 76 (the Perplexity key) is withdrawn.
- **Reverses, in part.** The research row of `2026-09-22 — Model tiering`; "plus Perplexity for deep
  research" in `2026-09-22 — You.com is retired`; the research half of `2026-09-28 — OmniRoute routes
  the research and local tiers; the subscription stays direct`. Those entries stay as written.
- **Why.** Perplexity is out of credit — in the week to 2026-10-05 every Mac task that called it logged
  `Perplexity 401 insufficient_quota` and fell back to Claude WebSearch — and Steven wants one
  subscription, not two.
- **What still needs the Mac.** One prompt Steven pastes into his Mac Claude session
  (`integrations/mac-claude-only.md`). It pauses the Mac's Perplexity feed tasks, switches the runner's
  research provider to Claude only, and removes the Mac's `perplexity` MCP server. Until then those
  tasks try Perplexity first, get the 401 and fall back to WebSearch.
- **Owner.** Steven (the Mac paste), Derek (automation). **Status.** Active — repository side done
  2026-10-05; the Mac side waits on the paste.

## 2026-10-05 — The ISA Portal mirrors the deck's Claude-written notes

- **Request (Steven, verbatim).** *"ensure ISA portal also is update and mirrors command deck and only
  uses Claude subscription for feeds"*.
- **Decision.** The two writers whose notes the ISA Portal shows copy them there themselves: the
  builder-incentives writer and the morning run of weather & news write their Command Deck entries, then
  send the identical entries (same `checkedAt`) to the ISA Portal's own `liveFeeds` document with a pinned
  `update`. The ISA page (v39) renders them under the builder and market cards, with sources, checked
  time and an overdue warning, and redraws in place when a copy lands. Rates and market figures already
  reached both pages through `ratesSnapshot` (since 2026-10-04).
- **Why the writers, not a separate mirror routine or Pipeline Sync.** No page can read another page's
  store, so something has to copy. A mirror routine would cost one more session a day on an allowance
  that ran out early the week before. Pipeline Sync carries client data both ways, and a feed step in it
  would put that routine at risk for a non-client feature. Each writer already holds the entry it just
  wrote, so the copy costs it two calls and keeps both pages on the same stamp.
- **Owner.** Derek (automation). **Status.** Active 2026-10-05 — ISA `liveFeeds` created with that day's
  four notes. The prompts are `routines/feed-writers-2026-09-28/01-weather-news.prompt.txt` and
  `06-builder-incentives.prompt.txt`, MIRROR STEP.

## 2026-10-05 — The cloud backup stages its export through files

- **Request (Steven, verbatim).** *"look for everything thoriughout the dashboard that is stale, not working ,
  not connected and have engineers fix them"*.
- **Decision.** The weekly cloud backup (Sundays 11:00 UTC) exports both databases with `ArtifactData list …
  out_dir` into a staging folder in its own sandbox, builds the backup documents with a standard-library
  helper embedded in its prompt, writes them with `set … file_path`, reads them back the same way and verifies
  every document, then deletes the staging folder. The copies still live only in the Command Deck's `backups`
  collection. A failed run deletes nothing; `docCount` always describes the last good backup, and
  `liveDocCount` and a date-derived `consecutiveFailures` were added.
- **Why.** The old prompt held all 182 documents in the conversation while a hard rule forbade writing them
  to a file, so the Oct 5 18:14 UTC run stopped RED ("too large to export without local files"), and the last
  good backup was 2026-09-22. Moving the bytes through files also keeps client data out of the model's context.
  The client-data rule now names the staging folder as the only place the data may touch outside the databases.
- **Owner.** Derek (automation). **Status.** Active — re-run on demand 2026-10-05 19:09 UTC and verified GREEN
  at 19:12 UTC (182 + 15 documents, 6 + 1 parts, 2 weekly copies kept). Prompt:
  `routines/fixes-2026-10-05/backup.prompt.txt`; the backup watchdog reads the new shape.
