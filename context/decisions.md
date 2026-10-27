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

**Superseded 2026-10-13 — WhatsApp now runs through Kapso (see the 2026-10-13 entry and `integrations/kapso/README.md`). Kept as history.**

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

**Superseded 2026-10-13 — WhatsApp now runs through Kapso (see the 2026-10-13 entry and `integrations/kapso/README.md`). Kept as history.**

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

## 2026-10-07 — Kevin everywhere; browser-use and OpenDesign added, both fenced

- **Request (Steven, verbatim).** *"replace Cole with Kevin throughout entire dashboard"*; *"install
  https://github.com/browser-use/browser-use.git"*; *"also install. https://github.com/nexu-io/open-design.git"*.
- **Decision.** The mentor seat is Kevin in the deck, the repo and the `kevin-mentor` skill (writes the deck's
  `kevinChat`). browser-use is wired to Claude Code only through a separate, hidden, logged-out Chrome
  (`agent-chrome.sh`, 127.0.0.1:9333) — upstream's own skill, which drives the everyday logged-in Chrome, is not
  installed. OpenDesign is built from source at a pinned commit, so upstream's analytics never send; its paid
  plans stay unused.
- **Why.** Both tools put page content in front of a cloud model; the HALT list forbids client PII leaving the
  local model, logins by agents, and spending money. A logged-out browser and a source build keep both inside it.
- **Owner.** Derek (automation); risk owner Elena (CISO). **Status.** Proven in the cloud sandbox; Mac install is
  `docs/STEVEN-STEPS.md` steps 6–8.

## 2026-10-20 — The 80/20 rule, Vanessa's daily Chief-of-Staff cycle, the morning brief in three channels

- **Request (Steven, verbatim).** *"…AI, automation workflows, systems, tools, resources, AI twin Steve, Vanessa
  and human ISA/EA are handling 80% of everything, leaving me to only do 20% of actions requiring me to
  personally do… enable AI agents to work in parallel and be cross functional teams with Vanessa as the Chief
  of Staff Orchestrator for everything. Also Vanessa is suppose to send me morning text and verbal imessages
  with the daily morning brief."* Also: *"update org chart when done."*
- **Decision.** One new cloud routine, not many: **Vanessa — Chief of Staff daily cycle** (weekdays 6:25 AM
  PT, `trig_019whypw6EeNu2G8xxY5xE5N`) reads the backlog, sorts every open item into Automation / AI team /
  ISA-EA / Steven, dispatches ≤8 cross-functional squads in parallel (Alexandra on any client or ad draft,
  Elena on anything that smells like fraud, Nadia and Elon proposal-only), QA's the results and writes
  `cosBrief` (≤3 Needs-Steven items, drafts, ISA instructions, the measured split), `twinQueue`,
  `vanessaRuns`, `vanessaLog`. The 6:48 AM cloud morning brief reads `cosBrief` first. The iMessage text and
  the voice note stay on the Mac (`vanessa-morning-brief-text` + `voice-reply-render`; amendment
  `integrations/mac-task-specs.md` §8) because agent-created routines carry no connectors — the API refused
  the `connectors` parameter for this organization. Map: `docs/AUTOMATION-MAP-2026-10-20.md`.
- **Why.** Budget: +5 runs/week instead of a routine per panel; the Friday Weekly Ops Review (Steven's own
  routine) and the Saturday loop stay as they are. The HALT list is the definition of Steven's 20%.
- **Found.** `runnerStatus.syncedAt` = 2026-10-13 07:13 UTC: the Mac runner has been silent seven days, so
  every Mac-owned document (iMessage text, voice, Lofty, calendar, rates, QuantVue, twin sweep) is stale.
  Nothing in the cloud can wake it — Action Desk step 1.
- **Owner.** Vanessa (cycle), Derek (automation health). **Status.** Routine live; first run 2026-10-21
  13:25 UTC; voice amendment waits on Steven's paste.

## 2026-10-20 (later) — The brain learns the toolkit: skills, plugins, connectors, routines, Mac tasks per seat

- **Request (Steven, verbatim).** *"Update 2nd brain improve add Intergration and more capabilities and update Ai org
  chart skills plugins etc."* (the 2nd Brain 4D page).
- **Decision.** Two new zero-token commands in `brain/toolkit.py`: `bin/brain toolkit [--write]` (the register of
  every skill, plugin, connector with live status, cloud routine and Mac task, filed under the org-chart seat whose
  lane claims it; `--write` regenerates `wiki/ai-team/toolkit.md`) and `bin/brain owner "<panel>"` (who keeps a
  Command Deck panel alive, by what mechanism, what stays Steven's — from `docs/AUTOMATION-MAP-*.md`). Both are MCP
  tools (`brain_toolkit`, `brain_owner`). `brain graph` adds the five as lobes, so the 3D brain shows them.
  `docs/inventory/cloud-routines-2026-10.md` lists the October routines so the register sees them.
- **Why.** The org chart named seats but not what each could use; connection status lived only in prose. Reading the
  tree costs nothing, so the register never goes stale and never burns the allowance.
- **Owner.** Derek (automation). **Status.** 67 brain tests pass; 4D page rebuilt (285 nodes); deck org chart gets a
  "Toolkit register" node.
## 2026-10-13 — Message Vanessa on WhatsApp through Kapso (personal WhatsApp and OpenWA bridge retired)

- **Request (Steven, verbatim).** *"Install Kapso and configure so I can connect and communicate using Whats App on
  Orca and my dashboard"*; *"Whats App enable me to communicate to Vanessa"*.
- **Decision.** Vanessa talks WhatsApp through **Kapso** (hosted WhatsApp Business Cloud API: free sandbox number,
  remote MCP `api.kapso.ai/mcp`, Claude Code plugin `gokapso/agent-plugins` at `a6cbfe9`, MIT). Phase 1: Steven
  messages the sandbox number from his own phone; Vanessa answers live from any Claude Code session (Terminal or
  Orca, `.claude/skills/whatsapp-kapso`) or unattended by the Mac task `vanessa-whatsapp-inbox` (§5c). The deck
  card "WhatsApp — Kapso" shows masked numbers, contact labels and counts, never a body. The 2026-09-23 personal
  WhatsApp self-chat and the 2026-09-28 OpenWA bridge (NEEDS-STEVEN 78) are retired: neither ever went live, and
  the sandbox's egress blocked the WebSocket they needed.
- **Fence.** Two Keychain items typed by Steven: `kapso` (API key) and `kapso-allow` (his own number). The reader
  returns only that number's messages; the sender refuses any other recipient before any network call. A business
  number, client messaging, templates and Pro ($25/mo) are a Needs-Steven packet (Meta verification, opt-in,
  Alexandra's templates, Elena's PII yes).
- **Owner.** Derek (automation), Elena (third-party processor), Alexandra (templates). **Status.** Built and
  tested in the sandbox 2026-10-13 (deck v194); Steven runs `go.sh` step 11 and signs in once.

## 2026-10-13 — Morning brief reaches the phone by push; Mac feed tasks are paused, not trusted

- **Request (Steven, verbatim).** *"the routine did not update news, birthdays things that happened on this day,
  morning brief nor did Vanessa message me via iMessage with this info or sent a morning brief text. Fix everything
  else not working too"*.
- **Finding.** The cloud morning feeds routine did run and write; the Mac task `openrouter-feeds-refresh` overwrote
  the whole `liveFeeds` document 28 minutes later with a stale copy (the Oct 5 pause of the three Mac feed tasks
  was never applied). The Mac's morning text task reported "ok" but no text arrived; the cloud cannot see Inkbox.
- **Decision.** (1) Cloud writers win: the morning feeds routine runs after the Mac slot (13:05 UTC) and the daily
  freshness sweep treats a backwards or typed stamp as a clobber and refills it, naming the Mac task. (2) The
  morning brief has a guaranteed cloud path: *Vanessa — morning brief to Steven's phone* (6:48 AM PT, push
  notification, full brief in the run) composed only from deck documents. (3) The three Mac feed tasks are paused
  by Steven's hand (`runnerctl pause …`), never deleted; iMessage stays the Mac's job until Inkbox is connected to
  the cloud. Record: `routines/cloud-routine-repairs.md`.
- **Owner.** Derek (automation), Vanessa (the brief). **Status.** Cloud side done and proven 2026-10-13; Mac pauses
  and the iMessage check wait on Steven (`docs/STEVEN-STEPS.md`, Start here 2026-10-13).

## 2026-10-13 — The avatars move for every reply; weather is the sweep's job once it carries AccuWeather

- **Request (Steven, verbatim).** *"Weather also suppose to be updated daily with all news worldwide and if the local
  areas. Ensure everything is updater as today all sections of the dashboard"*; *"Vanessaand Steve are suppose to be
  annimated and move as they speak in the chat"*.
- **Decision.** (1) A reply animates the presence by its text (speaking state + word-cadence nod for the reading time),
  audio or not; real audio keeps precedence (`dashboard/wave2/splice-presence-texttalk.py`, deck v195). (2) Weather is
  owned by the daily freshness sweep's STEP 2 with AccuWeather; an agent cannot attach the connector on this plan, so
  Steven adds it once in the routine's page. (3) World and local news stay with the weather & news writer (01:35/13:35
  UTC); the sweep backstops them. Record: `routines/cloud-routine-repairs.md`.
- **Owner.** Derek (automation), Harrison (deck UI). **Status.** Avatars proven headless 2026-10-13; weather written
  by hand today (v43); the connector click waits on Steven.

## 2026-10-14 — Palm Springs / Palm Desert joins the Travel panel; the Job Command Center sits in Career & Education

- **Request (Steven, verbatim).** *"Add events local to the Palm Springs/Palm Desert to the travel and experiences
  section. Add in the career and education section: https://claude.ai/artifact/FYb2UHsVZZB5bZcpU1B6eF Job Command Center"*.
- **Decision.** A twelfth city card, "Palm Springs & Palm Desert (Coachella Valley)", with 29 sourced rows (Plaza Theatre,
  McCallum Theatre, Acrisure Arena, Agua Caliente, Pride Nov 6-8, the Veterans Day parade Nov 11, the Indio Tamale
  Festival Dec 5-6, WildLights, the Aerial Tramway), same shape as the other cities so the weekly travel refresh covers
  it. The Mind panel (data-page "career") opens with a "Job Command Center" card linking the RoleCompass dashboard and
  describing its 6:40 AM PT daily routine. `dashboard/wave2/splice-travel-palmsprings.py`, deck v197.
- **Owner.** Harrison (deck UI); Sofia's events scout keeps the rows fresh. **Status.** Published 2026-10-14.

## 2026-10-14 — Las Vegas card gets nightlife, production shows, each Cirque show and dated events

- **Request (Steven, verbatim).** *"Add Day and night clubs in Vegas , shows , events , circus de solei under Vegas section of entertainment"*.
- **Decision.** 31 rows added to the top of `TRAVEL_VEGAS` (deck v199, republished as v200 after validator fixes, `dashboard/wave2/splice-travel-vegas.py`): the
  five Cirque du Soleil residents one per row ("O", Mystère, KÀ, Michael Jackson ONE, Mad Apple) replacing the old
  "all 5 resident shows" summary row; seven nightclubs (XS, Omnia, Hakkasan, Zouk, LIV, Marquee, Drai's); seven dayclubs
  (Encore Beach Club, Tao Beach, Marquee Dayclub, Palm Tree Beach Club, LIV Beach, Ayu, Liquid); Blue Man Group, Penn &
  Teller, Jabbawockeez, David Copperfield and an unverified trio (Awakening, Atomic Saloon, Magic Mike Live); dated events
  (F1 Grand Prix Nov 19-21, Tim McGraw Oct 23-Nov 7, Weezer Oct 23, Jonas Brothers Nov 28, TSO and Matt Rife Dec 4,
  Backstreet Boys at Sphere Dec 26). Clubs and shows carry "Nightly"/"Seasonal" dates so the past-date filter keeps
  them; dayclub rows say the season closes mid/late October. All rows are WebSearch snippets from 2026-10-14 and name
  their source; nothing on the deck is a booking or a price quote.
- **Owner.** Harrison (deck UI); Sofia's events scout keeps the rows fresh. **Status.** Published 2026-10-14.

## 2026-10-20 (evening) — One branch: `claude/stoic-cori-pvn3f8` carries everything

- **Request (Steven, verbatim).** *"Merge"* — after being told the repo had split into two branches worked by
  different chats (`claude/stoic-cori-pvn3f8` and `claude/gracious-newton-4hpfco`, ~400 files apart).
- **Decision.** `claude/gracious-newton-4hpfco` is merged into `claude/stoic-cori-pvn3f8`; the latter is now the
  single branch every script, Action Desk button and doc points at (`go.sh`, `go.ps1`, `connect-all.sh`,
  `STEVEN-STEPS.md`, `PASTE-TO-CLAUDE-ON-MAC.md`, the Kapso/agent-os/browser-agents guides). Nine conflicts
  resolved: append-only files kept both sides (`decisions.md`, `memory.md`), the index was regenerated, the brain
  README and the MCP tool test take the union (`brain_route` from theirs, `brain_toolkit`/`brain_owner` from
  ours), the Action Desk and Brain 6D pages keep this branch's live-merged copies, `STEVEN-STEPS.md` is theirs with
  the 2026-10-20 one-paste section first.
- **Checks.** 97 brain tests pass (both suites), `bin/brain doctor` PASS, 135 files indexed, Kapso tests pass,
  `go.sh` / `connect-all.sh` parse. The toolkit register now sees 32 skills.
- **Owner.** Derek. **Status.** Pushed. The other branch is left as history and is not pushed to.

## 2026-10-21 — Mods and skills for the architecture; one paste covers the mods too

- **Request (Steven, verbatim).** *"Create mods and skills that would support and optimize my architecture and
  integrations to run more and workflows and connections with Claude and Pabbly and anything cli also fix anything not
  working and simplify what's needed by me to simply insert in terminal to paste what you can't fix."*
- **Decision.** Two mods (`connection-beacon`: status line + `/connections` + `/owner`; `paste-desk`: `/paste`) and
  three skills (`pabbly-workflows`, `connection-doctor`, `cos-daily-cycle`), all zero-token where they can be —
  they read `bin/brain toolkit`, `bin/brain owner` and `docs/STEVEN-STEPS.md`. `connect-all.sh` gains step 8
  (install the mods) and names Pabbly in the "still yours" list. Cloud-fixable items were already fixed on 10-20;
  what remains (runner, Inkbox reconnect, Kapso sign-in, Zoho tick, sign-ins, Composio links, the Pabbly yes) is
  by nature Steven's and is the one paste plus the seven-line list.
- **Owner.** Derek. **Status.** Mods validate on Claude Code 2.1.305; 97 brain tests pass; toolkit register
  35 skills · 5 plugins.

## 2026-10-21 — 6D Brain rebuilt daily; the dashboard link renamed

- **Request (Steven, verbatim).** *"rename the following link in the dashboard list from 2nd brain in 4D with a
  timeline to 6D Brain … Also ensure the brain is live and constantly updating and timeline always updates daily and
  ensure it is comprehensive."*
- **Decision.** After the merge the full Brain 6D build (`dashboard/brain-4d/build.py`: graph with toolkit lobes,
  seats, A–Z encyclopedia, ask index) runs on this branch; it is rebuilt and republished every day at 3:30 AM PT by
  the scheduled task `trig_01MQ7HRYTh27b8uUM4BtnFXE` (fires into this session, which holds the repo and the
  Artifact tool), after `bin/brain reindex`, `loop` and `toolkit --write`, so the build date, the timeline and the
  loop report move daily. The GitHub `brain-loop` check now also runs daily (10:20 UTC) as the model-free backstop.
  Command Deck v204: menu item "6D Brain — the brain in 3D: timeline, freshness, seats, encyclopedia".
- **Owner.** Derek. **Status.** Page v7 published (320 nodes, 135 encyclopedia entries).

## 2026-10-22 — Transaction coordinator and showing assistant on a schedule; Kapso app plan agreed in Pabbly

- **Request (Steven, verbatim).** *"yes build the kapso connection. add automations workflows, systems, goal is to
  have 80% done by ai agents, claude, transaction coordinator, showing assistant, systems, AI twin and human ISA/EA
  leaving me to do 20%"*.
- **Decision.** New cloud routine **Transaction & Showing desk** (weekdays 7:10 AM PT, `trig_011iofWVNizNQ1SNujNcp5tL`):
  the `ca-transaction-coordinator` and `showing-coordinator` seats run every weekday — deal timelines only from dates
  in the TC intake (`tcDeals`, never default form periods), checklists, deadline alerts, reminder and confirmation
  drafts, showing prep and route; Alexandra gates drafts; writes `tcDesk`, ISA instructions, ≤3 packets. The daily
  cycle now reads `tcDesk` and folds it into the ≤3 and the split. Today `tcDeals`, `dealChecklists` and
  `showingSchedule` are empty, so the first runs will ask the ISA to enter open deals — that intake is the one
  manual step the desk needs. Pabbly: plan recorded with his words; Check Auth built; waiting on his Kapso key.
- **Owner.** Victor (desk), Derek (automation). **Budget.** +5 runs/week.

## 2026-10-22 — ISA Portal gets Vanessa's daily ISA list
The daily Chief-of-Staff cycle now copies `cosBrief.isaInstructions` (plus the ISA's step-by-step drafts and four standing duties) into the ISA Portal's own store as `isaToday`; the portal's Panel 01 opens with a "Today from Vanessa" card. Rates on the portal re-mirrored from the deck the same day (the Mac rates task has been silent since 2026-10-13). Org chart: Transaction & Showing desk shown under Victor; the Broker Command Center seats another session added the same day kept, with Winston moved back inside Alexandra's reports.

## 2026-10-22 — Fixing the usage-limit failures and the frozen Mac runner
All 14 failed cloud routines failed on USAGE_LIMIT_REACHED (none for another reason). Sunday weekly jobs ran before the weekly allowance reset (~20:00 UTC Sunday), so they are moved after it: backup Sun 21:07 UTC, its watchdog Sun 23:41 UTC; four http_api-created Sunday loops need Steven to move (docs/STEVEN-STEPS.md). The Mac runner's last report (2026-10-13 07:13 UTC) showed it logged in and stuck "running" fabric-deck-sync, so connect-all.sh now restarts it unconditionally and installs a caffeinate -s LaunchAgent (no sleep on the charger). 6D Brain routine now commits docs/reports/ENCYCLOPEDIA.md.

## 2026-10-22 — Push-button system: one Vanessa queue, pods, inbox buttons, morning brief across dashboards
Steven asked for "the best automated push button system", cross-functional parallel teams, mods, Gondola, and a daily
morning brief across the three dashboards by iMessage and voice. Built: `vanessaQueue` (single queue; deck buttons,
Vanessa's queue_task tool, `/queue`, the ISA Portal's vanessaOutbox, routines) worked first by the 6:25 cycle; Command
Deck push-buttons (Today from Vanessa, Run cycle now, TC desk + intake, follow-up drafts, Inbox & Meetings via the
page's Gmail/Fieldy connectors — routines cannot carry connectors on this account); seven standing pods in
`wiki/ai-team/cross-functional.md` that `bin/brain route` wakes in one parallel wave; mods `push-buttons` and
`ops-pulse`; morning brief moved to 6:34 AM PT, reads Command Deck + ISA Portal (+ Broker Command Center, browser-only
for now) and writes `morningBrief {text, voiceScript}` that the Mac sends by iMessage and voice (§8b); Gondola MCP
(`https://mcp.gondola.ai/mcp`) in connect-all 4b. Drafts only everywhere; nothing sends, books or quotes.

## 2026-10-22 (evening) — more capabilities: desk seats, skills pack, routines, Inkbox and Zoom on the deck
Steven: "update add more capabilities, tools, resources, integrations, automations and workflows and AI agents."
Added seven Sonnet desk seats (Refi Watch Analyst, Sphere Nurture Coordinator, Voicemail & Inbox Triage, Document
Intake Clerk, Open House Captain, Travel Desk, Meeting Scribe — `wiki/ai-team/desk-seats.md`) and a Client Care Pod;
11 skills (eight workflow skills + one seat tool each for Apex, James, Nadia — 35 → 46); two light routines (Refi
watch Mondays, Sphere touches monthly), both drafts-only into `vanessaQueue`; Inkbox reconnected (email active,
iMessage line ready — Steven texts `connect @vanessa-shearrill` to +1 650 484 9720 once), so the Command Deck got
"Text me this brief" (to his own mobile only, kept in localStorage, never the shared store) and Zoom joined Fieldy in
"Recap my meetings"; Gondola in connect-all 4b; Kapso instant triggers built as manual webhooks because Kapso's docs
publish no unsubscribe endpoint. Rule kept: every new seat, skill and routine drafts; nothing sends, books, quotes,
signs or writes to a client-facing system.

## 2026-10-22 (late) — depth pass: playbooks, data dictionary, list intake on both pages
Five new brain leaves (open house, post-close care, sphere nurture, refi review prep, push-button system) and a data
dictionary row for every 2026-10-22 document. Refi and sphere lists can be entered on the Command Deck (v230) or the
ISA Portal (v48, `listOutbox`); the 6:25 cycle moves ISA rows to the deck. The Monday refi routine writes
`refiWatchDesk` — `refiWatch` stays the older hand-entered rate-watch list on the Ops Radar panel (a name collision the
deck build caught). Another session's Capability Pack section on the ISA Portal was kept; it asks for the `downloads`
capability without declaring it, so its Download button falls back to copy — their call, not changed here.

## 2026-10-22 (night) — The Bot Crew aligned to the org chart; Brain 6D updated
Steven: "continue add more in depth and update 6D brain and update AI org chart with all changes." The Bot Crew
(355 agents, `wiki/ai-team/bot-crew.md`) now mirrors this chart: Kevin replaces Cole there too (same card id, so notes
carry over), Maxwell and Elon got cards, the 14 named seats and seven desk seats became one group, the eight standing
pods run as workflows (Alexandra gates, Vanessa last), and an org-chart panel shows which crew groups roll up to
which executive. Vanessa is the first card, Chief of Staff, with `consult_agent` and `start_workflow`. The crew went on
the org chart as a surface under Vanessa, not a seat. Rule kept: drafts only, approval cards for every write.

## 2026-10-23 — NotebookLM gets the brain as a source pack, not a live connection

NotebookLM (consumer/Workspace) has no public API; only NotebookLM Enterprise does. The Drive rule (nothing writes to
Drive) stands. So `bin/brain export notebooklm` writes 13 masked markdown sources (no client pages) that Steven uploads
to a "Second Brain" notebook; the 6D Brain is included as text. Browser-automation "connectors" stay out (session
cookies in plain text). Revisit only if Steven chooses the Drive route or Google ships a consumer API.
`integrations/notebooklm/README.md`.

## 2026-10-23 — NotebookLM connected through Drive; the brain's layers must sync evenly

Steven: "connect and sync notebook lm", "another layer of redundancy", "ensure all data syncs evenly across all
layers — Notion, Google Drive, NotebookLM and more". Decisions: (1) one scoped exception to the Drive read-only rule —
`SECOND BRAIN/` is written by the weekly sync, nothing else in Drive; (2) NotebookLM is recall level 4 (the mirror),
never a first stop; (3) `bin/brain layers` is the measure of "even": every layer inside its own cadence from its own
stamp; (4) the community NotebookLM MCP stays opt-in on the Mac. Pages: `wiki/ai-team/second-brain-layers.md`,
`integrations/notebooklm/README.md`, `docs/reports/LAYERS.md`.

## 2026-10-23 — NotebookLM direct connector: opt-in taken

Steven: "setup and connect everything for me" after the risk was stated (browser-session material stored on the Mac,
undocumented API). Installed by `connect-all.sh` 6f on his Macs; `nlm login` stays his; non-sensitive notebooks only;
first thing removed if it breaks. Supersedes "stays opt-in" in the 06:10 entry.

## 2026-10-23 — Approve on the 6D Brain executes; the morning brief falls back to e-mail

Steven: "allow the big moves to automatically execute when I hit the approve button." The 6D page now declares the `mcp`
capability (Claude Code Remote, `fire_trigger` only) and, after writing the decision to its db, fires the Big-moves task with
"EXECUTE NOW big move <id>"; the task records the approval and runs the plan at once for executor "vanessa", or leaves the plan
standing by for executor "steven". Without the connector the approval still lands and the 6:05 AM run picks it up. The HALT
list is unchanged: execution never sends, pays, signs or writes to a client-facing system.

Same day, "vanessa did not send morning brief today with voice imessage": root cause is that Vanessa's iMessage line has no
linked phone (Steven never sent the one connect text), so iMessage sends were dropped silently. Decision: the brief goes by
e-mail to his own address (Inkbox) whenever the line is unlinked — cloud routine for the text, Mac task for the voice note —
and the connect text is click A of the simplified steps. Never any other address.

Steps simplified to three pastes + four clicks; everything else that used to be an "only you" item is now a big move.

## 2026-10-23 — Apple Health: the Drive export was never broken; the sync moves to the cloud

Steven: "fix auto health export and sync." Found: Health Auto Export has been writing a daily JSON file into a Google Drive
folder all along; only the Mac daemon (:8765 → DuckDB) that turned it into the deck document died on 2026-09-13. Decision: the
sync is a cloud routine in the orchestrator session (6:15 AM PT) that reads the Drive files and merges them into `appleHealth`
with `scripts/health-drive-sync.py` — no Mac, no daily phone prompt. The daemon's history is kept, metric keys are never invented,
a missing day stays a gap. Health data stays in that one document. The Notion path is optional; `r8-apple-health-snapshot` is to
be disabled on the Mac so it cannot overwrite the document. Also added to the deck: links to the Fitness Dashboard and the
Famous Stoics pages (Health & Wellness → Related dashboards) and to `bin/brain links`.
Same day, "update and sync strava daily with health auto export daily and myfitnesspal": Strava joins the 6:15 AM cloud sync
(the Strava connector writes `stravaSnapshot`; the Mac task is retired). MyFitnessPal gets no connector — it reaches the deck
through Apple Health and the same export file once Steven switches the nutrition metrics on in Health Auto Export (click E).

## 2026-10-23 — Four courses of action on the 6D Brain, loop engineering as a standing lane

- **Request (Steven, verbatim).** *"add 4 COA recommendfations for 6d brain for next big moves, self improvement, things to do and implement, anticipated risks or actions to take or recommended things to do, opportunities to pursue and things to do, answers to potentional questions i may have actionable items to do. incorporate loop engineerring to always find way to improve and add additional capabilities and more"*
- **Decision.** `bin/brain recs` keeps one scored pool and sorts it into four lanes of four — **big-move** (money, clients, connections), **improve** (self-improvement: what the weekly loop, the decision ledger and Nadia's scout say the system should change in itself), **risk** (stale, failing or silent, with the action that heads it off), **opportunity** (marketing, presence, new capabilities) — plus a **questions** block: one answer per leading move and six standing questions answered by the brain's own zero-token recall, page and section named. `brain/recs.py::coa_of` decides the lane (an explicit `coa` on a live signal wins); `_improve_candidates` is the loop-engineering source (loop not run in 7 days → run it; failing gold questions → fix them; ≥10 stale pages → sweep; tune proposals → judge them; ≥5 declines in 14 days → retune the weights; scout older than 14 days → run it). Output: `brain/recs/big-moves.json {items, coas, questions}` and `docs/reports/BIG-MOVES.md`; the 6D panel draws the four lanes and the questions; the Big-moves cloud task (6:05 AM PT, trig_014…) learns, executes approved Vanessa-items in any lane, mirrors to the deck (`bigMoves`, `vanessaRecommendations` with a `lane`), republishes the page, and runs `bin/brain loop` itself when the improve lane is empty and the last loop is older than 7 days.
- **Why.** One ranked list hid the system's own work and the risks behind the revenue items. Four lanes keep each kind visible every day; the loop lane means the brain always carries at least one way to get better, and an approved improve-move is a repo change with a line in `docs/reports/BRAIN-LOOP.md`, never a live-prompt edit.
- **Owner.** Vanessa (lanes, execution); Nadia (scout opportunities); Derek (risk repairs). **Status.** Live 2026-10-23 (6D v51).

## 2026-10-23 — One paste for everything that needs Steven; Jarvis becomes Vanessa and holds the brain

- **Request (Steven, verbatim).** *"help fix everything broken or not working and make a new script that i can cut and paste into the terminal to fix whatever requiring my actions. make simple and limit how many back and forth required of me"* · *"connect Jarvis with Vanessa replacing it with her voice and persona and laya, Orca and all my ai team to Orca, and whatever else not connected"* · *"connect these with my 6d 2nd brain"*.
- **Decision.** `scripts/fix-mine.sh` is the single paste for Steven's side: idempotent, every secret typed hidden and written only to `~/.config/<tool>/.env` (mode 600), prompts never land in a file, a `--check` mode changes nothing, and it ends with a REPORT plus a lettered only-you list. It calls the existing per-tool scripts rather than duplicating them. Jarvis gets Vanessa's persona through OpenJarvis's named-persona files (`integrations/jarvis/vanessa-persona.sh`), her recorded voice through `jarvis-setup.sh`, and the brain's pages in its memory from a staging copy that excludes `wiki/clients`, `memory/` and `docs/findings` (the vector-index exclusion rule applies to Jarvis too). Laya, Orca and the Agent OS installers are re-run by the same paste; `brain os check` is the proof; the 6D layers row and the toolkit register show the result.
- **Why.** Each earlier round produced a new paste and a new back-and-forth; the keys were skipped because the prompts came mid-script. One script, run as often as needed, that only asks for what is still missing and prints the human list once, is what "limit the back and forth" means in practice.
- **Owner.** Vanessa (script), Derek (runner, Jarvis), Steven (the lettered list). **Status.** Scripts tested in the cloud against throwaway homes (12 + 20 tests); first real run is Steven's paste.

## 2026-10-23 — Every channel to Vanessa gets a cloud fallback; Jarvis is Vanessa, the single point of contact

- **Request (Steven, verbatim).** *"i texted both Vanessa on imessage and on kapso whatsapp with no response. fix all communication to include discord and chatbox"* · *"orca setup and integrate all ai agents from my org chart into Orca"* · *"also do the same with Jarvis where Vanessa is the primary POC to replace jarvis and integrate with all ai agents"*.
- **Found.** iMessage: Inkbox holds no linked phone and no conversation — the connect text never arrived (a plain text does not link). WhatsApp: the Kapso number exists but no task reads it; the two runner tasks were specified on 2026-10-13 and never registered; the Kapso sign-in is pending. Discord: no bot token anywhere. Chat box: answers only through the viewer's own Claude permission in the page.
- **Decision.** One hourly cloud routine, *Vanessa inbox sweep (cloud)*, answers what the Mac pollers did not: iMessage through the Inkbox connector (only inside an existing conversation, only after the Mac's 10-minute window), the deck chat thread (appends Vanessa's answer to `vanessaChat`), Discord #vanessa through Composio once the bot is connected (only Steven's own user id). WhatsApp stays Mac-only (Kapso has no cloud path here); `fix-mine.sh` installs the Kapso plugin + MCP, stores the Discord bot token in the Keychain at a hidden prompt, and prints the runner task catalog so the two WhatsApp tasks can be registered next round. Orca: the Agent OS already carries all 180 roster seats (`integrations/agent-os`, `brain os check` 180/180); fix-mine re-runs its installer; pairing the phone is Steven's. Jarvis: Vanessa's persona now includes the full roster from `agents.json`, so she is the single point of contact and dispatches to seats with `brain os run` / `orca-launch.sh`.
- **Owner.** Vanessa (sweep, persona), Derek (runner tasks), Steven (connect text, bot token, sign-ins). **Status.** Routine live; first run 00:17 UTC 2026-10-24.

## 2026-10-24 — Military Family Office page joins the deck and the links registry

- **Context.** Steven: "in the dashboard add: Military Family Office" (the Sentinel Military Family Office page, a concept prototype of his own). It was already one line in the deck's Pages menu, which is easy to miss.
- **Decision.** Panel 17 (Family Office) opens with a *Related dashboards* card: Military Family Office first, then the Veterans Benefits Dashboard and the Military Rent vs Buy tree, all from the Pages menu's own list. The page is also a `bin/brain links` row, so the 6D links panel and the Notion directory show it. Pattern reused from Health & Wellness (2026-10-23).

## 2026-10-24 — Vanessa answers at any hour; the cloud sweep is 24/7, the Mac window is widened per task

- **Context.** Steven: "enable all messages to respond when message is sent anytime of day." The cloud inbox sweep ran 6 AM–10 PM PT; every Mac runner task carries the window `07-22`, so the 10-minute pollers sleep overnight.
- **Decision.** The cloud sweep runs hourly, 24/7 (`17 * * * *`, PT). A 20-minute cadence was tried and refused: a cloud routine's floor is one hour, so the Mac pollers stay the fast path. `scripts/fix-mine.sh` widens the window to `00-24` for the five message tasks only, never the runner-wide default (nightly and weekly tasks keep their hours and the usage cap), and backs out if `runnerctl dry` does not confirm the new window.
- **Consequence.** Overnight answers arrive within the hour now and within 10 minutes once the paste has run; a night-time question still gets the same HALT handling (no quote, no eligibility call, no client send).

## 2026-10-24 — Voice rides every Vanessa text reply, from the cloud too

- **Request (Steven, verbatim).** *"vanessa voice is suppose to speak with a voice message on top of the text"*
- **Decision.** The cloud inbox sweep queues a `voiceReplyQueue` item (mac-task-specs §6a shape, 40–700 spoken characters, no HALT answer, no client data) after every iMessage text it sends and after every deck chat answer; the Mac's `voice-reply-render` renders her recorded voice and sends the note into the same thread. `fix-mine.sh` puts the two things that task needs on the Mac at a hidden prompt (Inkbox API key) and from the paste line (`VANESSA_THREAD`, the one allow-listed thread). The thread id is not a secret but is kept out of the repo on purpose (`voice-setup.sh` rule). Text always goes first; voice never blocks or replaces it.
- **Owner.** Vanessa (sweep), Derek (render task, §6a in the Mac poller), Steven (paste). **Status.** First real voice item queued 00:28 UTC 2026-10-24; delivery proof is `voiceReplyStatus` on the deck.

## 2026-10-24 — SkySlope by REST, read-only, from the Mac

- **Request (Steven, verbatim).** *"setup skyslope i have an api key"*
- **Decision.** A stdlib, GET-only client (`integrations/skyslope/skyslope_cli.py`) using SkySlope's documented login (HMAC-SHA256 of `ClientId:ClientSecret:Timestamp` keyed by the user's Access Secret, `Authorization: ss <AccessKey>:<hmac>`, `Timestamp` header, JSON body with the Client pair → `Session` ticket, ~2 h) replaces the browser harness as the primary SkySlope path. Keys live only in `~/.config/skyslope/.env`; `fix-mine.sh` collects all four hidden and proves the login. Default output is a summary (file id, type, status, street, dates); `--full` shows the record. Transaction data is client data: terminal only, never into the brain, a report or a message. Writes to SkySlope stay HALT (no write verb exists in the client; a test enforces it).
- **Open.** Steven's "API key" is the user pair; SkySlope's API also needs the partner-level Client ID/Secret. The proof step tells which is missing.
- **Owner.** Carmen (desk use), Derek (client), Steven (keys). **Status.** Built and tested in the cloud 2026-10-24; first real login is the paste.

## 2026-10-26 — Process coverage: one writer, one cadence, one owner per deck document; Nova owns the register

- **Request (Steven, verbatim).** *"update AI org chart on command deck when done. update and assign AI agents to the org
  chart to cover what is missing. Ensure automation, worklows, streamline, expanded capabilities are provided for the
  respected Ai agents. Update AI org chart and AI brain. Ensure all data is live and synced and look for gaps in the
  process to automate and have an ai agent facilate to ensure complete coverage of all proccesses listed and identified
  within the dahboard, and command deck dashboards"*; and *"fix all errors with the chitown REPo to include … Run failed:
  brain-loop"*.
- **Decision.** Coverage is measured per document, from the document's own stamp, never from a task status. The register
  (`brain/coverage/writers.json`, 266 rows) names a writer, cadence, owner seat and pod for every document the deck reads;
  `bin/brain coverage` scores it against a database export and writes `docs/inventory/process-coverage.md`; the deck's
  `processCoverage` document and the Process coverage card (Orchestration 39.0) compute the same statuses live in the
  browser; the freshness sweep's STEP 1b reports gaps with owners; Nova (Coverage & Process Auditor, reporting to Owen in Derek's line) owns it
  on both dashboards and is on the deck's ORG_CHART (added there the same afternoon by the Broker Command Center session; the splice skips the seat when it is already present). 26 gaps on day one, each with its fix owner
  (`wiki/dashboard-ops/process-coverage.md`). Seats are assigned, never invented: every gap maps to an existing seat.
- **CI.** `brain-loop` and `setup-health` were red on every push since 2026-10-23 for two reasons: the layers test
  hard-coded the Drive manifest date (now read from the manifest) and commits landed without `bin/brain reindex` (index
  regenerated). Both pass on this commit.
- **Owner.** Nova (register, card, sweep step); Sam/Ezra/Apex/Bianca own the day-one fixes. **Status.** Deck published,
  register written, sweep updated 2026-10-26.

## 2026-10-27 — One paste: `setup.sh` is the single Mac entry point

- **Request (Steven, verbatim).** *"fix everything not working and simplify whatever steps required of me for setup via
  scripts that I can cut and paste into my mac terminal. make this easy and simple and minimal action for me. ensure
  connectivity with Arive, discord, kapso whatsapp, anydesk, orca with my entire ai org chart integrated, Jarvis configured
  with Vanessa, connect Arive, showingTime, showami, homes.com, tidycal, skyslope, ticor title property search using
  composio, cli anything … connect myfitness pal, strava, bodypark, Hume … pabbly connect"*; then *"also connect zoho crm"*.
- **Decision.** No new installers: the repo already had every scripted step across `connect-all.sh` and
  `scripts/fix-mine.sh`, and seven competing "Start here" sections. `setup.sh` wraps the two in order, asks every key once
  (hidden, Enter skips), adds the two optional keys (Hume, Composio) to the Keychain, and ends with one REPORT and one
  numbered only-you list; `--check` is the plan. The scripts take the branch from `git` (`FIX_MINE_BRANCH`,
  `CONNECT_ALL_BRANCH`, `REPO_SYNC_BRANCH`) instead of a hard-coded name. `docs/STEVEN-STEPS.md` keeps one Start-here; the
  older rounds are demoted, not deleted. What a script cannot do is written as such: Zoho's profile tick, the sign-ins,
  Discord's bot, the three phone toggles, Pabbly's editor, Ticor's rep, Hume (spend → HALT).
- **Owner.** Derek (scripts), Nova (the register row per connection). **Status.** Written and tested 2026-10-27; the Mac
  REPORT is the proof once Steven runs it.

