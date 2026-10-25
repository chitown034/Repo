# Source documents and external systems

Second Brain export for NotebookLM · as of 2026-10-23 · bundle `09-references`.
Every section below begins with `# FILE: <path>` naming the page in the repo (chitown034/Repo, branch claude/stoic-cori-pvn3f8).
Client pages are never exported; phone numbers and e-mails are masked. Facts carry the page's own dates, not today's.


---

<!-- source file: references/backend-folder-structure.md -->
# FILE: references/backend-folder-structure.md

# Backend folder structure — the layered layout every new service follows

Source: the "Backend folder structure & use" diagram Steven saved on 2026-10-12 (Instagram, @smart_coder_hacker;
the same pattern as the Node/Express convention). Recorded here as the house rule for any backend the AI team
builds or vets (OpenStock, n8n flows, an ISA API, the brain's own code), and as the vocabulary `bin/brain layout`
uses to check the brain against it.

## The eight layers (request flows top to bottom)

| Folder | Job | Rule of thumb |
|---|---|---|
| `src/config/` | Database, environment and system configuration | Reads `.env`; nothing else touches environment variables |
| `src/models/` | Structure and validation of database collections or tables | Schema and validation only; no business logic |
| `src/middlewares/` | Processes a request **before** the controller: auth, logging, validation | Every gate is a middleware, so a controller never checks permissions itself |
| `src/controllers/` | Receives the request, validates input, sends the final response | Thin: parse, call a service, respond |
| `src/services/` | Business logic, data persistence, external service calls | The only layer that talks to models and third parties |
| `src/routes/` | Defines API endpoints (URLs) and maps them to controllers | One file per resource; no logic |
| `src/utils/` | Reusable helpers: loggers, string formatters, date math | Pure functions; no I/O that depends on a request |
| `test/unit/` + `test/integration/` | Tests for every backend component | A service without a test is unfinished |

Root files: `.env` (secrets, never committed), `.gitignore` (lists `.env` and `node_modules`), `package.json` and
`package-lock.json` (pinned dependencies), `server.js` (boots config, mounts middlewares and routes), `Dockerfile`
(reproducible build). `node_modules/` is generated, never edited.

## How the second brain maps onto it (checked by `bin/brain layout`)

| Layer | Brain equivalent |
|---|---|
| config | `brain/state/`, `brain/synonyms.py`, `brain/synonyms-learned.json`, `.env`-free by design |
| models | `brain/indexer.py` (the index schema), `brain/bench/*.json` (gold shapes) |
| middlewares | the HALT list in `CLAUDE.md` and the gates in `brain/route.py` (Alexandra, ECC, Vanessa) |
| controllers | `brain/__main__.py` (parse the command, call one module, print) |
| services | `brain/recall.py`, `ask.py`, `pack` in `loop.py`, `learn.py`, `passages.py`, `agentos.py`, `encyclopedia.py` |
| routes | the routing table in `CLAUDE.md` and `INDEX.md` (one line per file) |
| utils | `brain/text.py`, `brain/stopwords.py` |
| tests | `brain/tests/` (84+ tests), `scripts/setup-health.sh` |

## Rules that follow from it
- A new integration ships with the same shape: config (what it reads), a model (what it stores), the gate it
  passes (HALT or ECC), a thin entry point, the service that does the work, and a test. `integrations/n8n/library`
  and `integrations/openstock` already follow it; `bin/brain layout` says which brain services lack a test.
- Secrets only in `.env`-style files outside the repo (`chmod 600`), never in config files that are committed.
- Validation happens twice on purpose: the model validates shape, the middleware validates the caller.


---

<!-- source file: references/company-brain-blueprint.md -->
# FILE: references/company-brain-blueprint.md

# Company Brain Blueprint (AI Horizon / @gobi_automates) — mapped onto Steven's second brain

**Source:** `Company_Brain_Blueprint_AI_Horizon.docx` in Steven's Google Drive (read through the Drive connector 2026-10-12; a
public course flyer, not client material). Its one-sentence architecture: *files are the source of truth; a vector database
retrieves meaning; an entity graph captures relationships; a cache keeps high-value context close; agents execute on top.*
It ends with a paid community link (skool.com "AI Horizon") — **not joined; spending is Steven's call (HALT).**

## Layer by layer — what the blueprint asks for and what this brain already has

| Blueprint layer | What it asks for | This brain, as of 2026-10-12 | Gap |
|---|---|---|---|
| 1. Files as source of truth | A readable folder tree per department; repeatable jobs as workflow files | `wiki/`, `projects/`, `context/`, `memory.md`; 29 skills in `.claude/skills/` plus 172 agent files in `integrations/agent-os/agents/`; CLAUDE.md routes to one leaf | Department folders are by *topic* (mortgage, real-estate, ai-team, dashboard-ops), not by seat; fine — the dispatch planner maps seat → folder |
| 2. Vector database | Chunk + embed documents; retrieve passages | `vector-index/README.md` is a **spec**: which corpora qualify (transcripts, disclosures, playbook bodies) and which never do (`wiki/clients/**`, decisions.md, anything with PII). Not built. Level 3 of recall, by design | **Open.** Build only for the four playbooks (~1,700 pages) first; never client pages |
| 3. Entity graph | People, projects, tools, clients, decisions as typed relationships | Graphify in the Obsidian vault (750 nodes / 1,104 edges, built 2026-09-13); schema and entity stubs in `knowledge-graph/`; `bin/brain graph` draws the page-level graph the 6D view shows | Running on the Mac, stale (Sept 13); weekly Ruflo summary is the cheap read |
| 4. Context cache | Brand rules, current projects, offers, constraints, agent instructions kept warm | `recall-cache.md` (TTL 4 h / 24 h), `memory.md` (100-line cap), `INDEX.md` one line per page, Laya's zero-token routing | Matches; the cache is the brain's cheapest level and is enforced |
| 5. Agent runtime | Specialised agents retrieve shared context, call tools, write outcomes back | Agent OS: `bin/brain ask` (retrieve, auto-escalate), `bin/brain route` (lead + joins + gates + HALT), `bin/brain os run` → Orca sessions, `bin/brain remember` (write back) | Matches. The blueprint's "124 workers, one brain" is this repo's "172 seats, one router" |

## The blueprint's agent loop, as it runs here

| Blueprint step | Here |
|---|---|
| 1 Receive task | `bin/brain route "<task>"` names the lead seat, who joins, the gates and any HALT |
| 2 Read workflow file | the seat's starting page (`wiki/ai-team/cross-functional.md` "Starts from") or a skill |
| 3 Retrieve company context | `bin/brain ask` — level 1 one section, level 2 several, level 3 queue research |
| 4 Resolve related entities | `bin/brain related`, the 6D seat lens, Graphify summary via Ruflo |
| 5 Use cached high-value context | `memory.md`, `recall-cache.md`, INDEX line |
| 6 Call tools | the capability matrix (`wiki/ai-team/capability-matrix.md`): browser hands, loan agents, scout, trading desk |
| 7 Produce output | through the gates: Alexandra (client-facing), ECC (changes), Vanessa last |
| 8 Write the outcome back | `bin/brain remember "<fact>"` — index updated in the same step; the secret guard refuses keys |

## The "build challenge", answered for one department

The blueprint says: prove it with one department and one agent before building the whole brain. The department here is
**Sofia's growth/marketing lane**, because it has the clearest repeatable jobs and the most workflow files already.

| # | Challenge step | Status here |
|---|---|---|
| 1 | Choose one department | Sofia (CMO): content, campaigns, social |
| 2 | 10 repeatable workflow files | 50 marketing skills (coreyhaines, drafts only) + Instagram/LinkedIn/YouTube packs + humanizer, all in `install-mac.sh`; `skills-refresh` audits them weekly |
| 3 | Index the files into a vector DB | **not done** — and not needed for skills (they are short); the playbooks are the first real candidate |
| 4 | Extract entities and relationships | Graphify (Mac) + `bin/brain graph`; marketing entities (channels, offers, partners) are thin — a `knowledge-graph/entities/` pass is the gap |
| 5 | Cache frequently reused context | brand facts live in `context/about-me.md` and the deck's bio cards; a one-page `wiki/real-estate-playbooks/brand-voice.md` would close it |
| 6 | One agent with shared memory and tools | `claude --agent cmo-sofia` (generated file) + the gates; Orca shows it |
| 7 | Run one real task end to end | **waiting on the Mac** (paste A) |
| 8 | Write the outcome back | `bin/brain remember`, then the weekly loop re-tests |

## What this brain does differently, on purpose

- **Clients are never vectorised or graphed** (CLAUDE.md HALT; `vector-index/README.md`). The blueprint has no such rule; a
  mortgage broker's brain must.
- **One leaf per question, cache before store, store before sweep** — the blueprint's "cache" layer is this brain's whole
  token discipline, measured every loop (`docs/reports/BRAIN-LOOP.md`).
- **Proposal-only seats and licensed decisions stop at a Needs-Steven packet** — the blueprint's step 7 "produce output" has
  no gate; here Alexandra and Vanessa are gates by rule.

Register line: `references/index.md`. Owner: Nadia (AI tooling) with Elon for anything built from it.


---

<!-- source file: references/drive-second-brain-notes.md -->
# FILE: references/drive-second-brain-notes.md

# Drive Second Brain notes (screened)

Steven's Notion Second Brain rows as exported to Google Drive, synced 2026-09-22. Screened by `integrations/google-drive/redact_export.py`: 53 of 69 rows kept; client-tagged rows left out; emails, phones and long numbers masked. The Notion database is the record — these are a dated copy. Source: `references/google-drive.md`.

## The pasted five-level second-brain framework (router, wikis, vector search, knowledge graphs, autonomous brain) already has a named, running counterpart at every level — the open gap is whether Jarvis is ever used for a task that needs full context  
Reference · Inbox · ai-automation, ops  
  
Steven pasted a five-level second-brain framework (Router Foundation, Wikis + Auto-Memory, Semantic/Vector Search, Knowledge Graphs, Always-On Autonomous Brain) on 2026-09-22 and asked to incorporate it; mapped level by level it already has a running counterpart (vanessa-orchestrator, Second Brain + vault, Jarvis, Graphify, skills-refresh-weekly) so this is a reconciliation, not new build work. Search terms: five level framework, router foundation, wikis auto-memory, vector search, knowledge graphs, always-on autonomous brain, Gbrain, Nate Herk, framework mapping, second brain maturity, Jarvis full context gap.  
  
https://app.notion.com/p/The-pasted-five-level-second-brain-framework-router-wikis-vector-search-knowledge-graphs-autono-3e3c1760a74981059ea6ec4d2b61aad5

## Free mode fails closed: the guard blocks whole folders (vault, ~/.config, Google Drive, health, transcripts) and refuses anything it cannot screen  
Reference · Inbox · ai-automation, ops, compliance  
  
Claude free mode (claude-auto, OmniRoute, free third-party models) is guarded by ~/Applications/claude-fallback/free_mode_guard.py. Rebuilt 2026-09-13 after a stress sweep found it failing open: it now blocks whole roots instead of leaf folders so a glob, a wildcard, $HOME, a url-encoded or relative path or a symlink cannot step around it; blocks when the hook input is unreadable, when redact.py is missing, or when the environment drifted off the free-only OmniRoute combo; and refuses an OmniRoute base URL without the free-mode flag. If free mode blocks a command, that is the guard working: rephrase without client, financial or health data, or wait for the subscription. Search terms: free mode blocked, why is free mode refusing, guard hook, claude-auto, OmniRoute, off limits folder, fails closed, environment drifted.  
  
https://app.notion.com/p/Free-mode-fails-closed-the-guard-blocks-whole-folders-vault-config-Google-Drive-health-tran-3dac1760a[phone masked]fd621198b9bfc

## Every agent answers from four sources in a fixed order, the Second Brain is read live everywhere, and it learns from chat history  
Decision · Active · ai-automation, ops  
  
Architecture decision set 2026-09-12. Every agent and session answers from four sources in order, stopping at the first that is enough. First Steven's Second Brain for his decisions, rules and preferences. Second his live systems like the dashboard, CRM and calendar for his current state. Third the internet through Perplexity for current external facts, cited and dated. Fourth Claude's own expertise, labelled and never the source of a figure or date. Notion stays the only copy of the brain and every runtime reads it live. Main sessions use the Notion connector, all 168 agents use a local read only MCP server, and the dashboard chats search a synced copy because the artifact cannot reach Notion. Writes go only through slash brain. A capture tool pulls Steven's own words from chat transcripts twice a day, redacted, and slash brain learn distills them into rows. Search terms: knowledge sources, source order, live brain access, agents read Notion, internet and brain, Perplexity, learn from chat history, brain learner, notion-brain, recall_brain, personalization architecture.  
  
https://app.notion.com/p/Every-agent-answers-from-four-sources-in-a-fixed-order-the-Second-Brain-is-read-live-everywhere-an-3d9c1760a7498181a746cae4110918d8

## Vanessa runs on Fable 5.1 and masterminds; research and judgement seats run Opus 5; every other agent runs Sonnet 5, with Perplexity doing the searching  
Decision · Inbox · ai-automation, ops  
  
Decided 2026-09-14: the AI team model policy is three tiers. vanessa-orchestrator is the only agent on Fable 5.1 (model: fable) and does the masterminding, decomposition and consolidation, dispatching sub agents for the heavy lifting. Research and judgement seats (the C-suite, tier 1, and any agent whose name or description says research, analyst, analytics, scout, intelligence, underwriter, guideline, auditor, reviewer, hunter, mining, optimizer or market) run Opus 5; everything else runs Sonnet 5. Research still runs on Perplexity. Applied by set_models.py, enforced by lint_agents.py --models. Added 2026-09-15: when Steven texts Vanessa on iMessage, Sonnet 5 answers simple texts, questions needing expertise go to a specialist on Opus 5, and the most difficult requests go to Vanessa on Fable 5.1; Discord stays on Sonnet. Search terms: agent models, which model does an agent use, fable, opus, sonnet, model tier, orchestrator model, sub agents, dispatch, escalation, escalate, token cost, cheaper agents, AI team page, org chart, iMessage, text Vanessa, texting Vanessa, Vanessa's phone replies, who answers my texts, inbox model, Discord model.  
  
https://app.notion.com/p/Vanessa-runs-on-Fable-5-1-and-masterminds-research-and-judgement-seats-run-Opus-5-every-other-agen-3dcc1760a7498103b5cdf9d01dbcae55

## Slack connector is read-only — no automated posts, replies, reactions or DMs, ever  
ai-automation, ops, compliance  
  
  
  
https://app.notion.com/p/Slack-connector-is-read-only-no-automated-posts-replies-reactions-or-DMs-ever-3dcc1760a74981698090cdaef287fe84

## Scheduled AI tasks run through claude-runner on the Mac instead of desktop approvals, and the only gate is one Claude CLI login (runnerctl login)  
Decision · Inbox · ai-automation, ops  
  
Decided 2026-09-13: every desktop scheduled task was turned off in the desktop app, and all 57 recurring AI tasks now run through claude-runner. The runner executes each task headlessly with claude -p, its own tool allow-list and a secret-file deny list, fired on its schedule by the com.stevenshearrill.claude-runner LaunchAgent, so Steven never approves tasks again. Nothing runs until the Claude CLI is logged in once with runnerctl login (claude auth login, keychain); a token saved with runnerctl save-token loads no claude.ai connectors, so calendar prep and iMessage would not work. Search terms: approve tasks, stop approving, permission prompts, scheduled tasks stuck, hung tasks, desktop scheduler, claude-runner, runnerctl, runner login, OAuth session expired, no approvals, headless, claude -p, Vanessa Live.  
  
https://app.notion.com/p/Scheduled-AI-tasks-run-through-claude-runner-on-the-Mac-instead-of-desktop-approvals-and-the-only-g-3dbc1760a74981419a79eb8defa5a9b3

## Vanessa works as one system: Fable 5.1 masterminds, sub agents on Sonnet or Opus do the research and heavy lifting, the knowledge fabric is recalled once, and a weekly skills audit keeps the skill tree honest  
Decision · Inbox · ai-automation, ops  
  
Decided 2026-09-14: the dispatch rule for the whole AI team lives in one place, the Dispatch (standing) section of the vanessa-orchestrator skill. Vanessa (Fable 5.1) recalls the knowledge fabric (Second Brain on Notion and Google Drive, the Obsidian vault, Jarvis, Graphify, Ruflo) with one brief recall call, decomposes the goal, briefs each work package, and dispatches sub agents that run on the model in their own agent file (Opus 5 for research and judgement seats, Sonnet 5 for the rest); research goes only to seats that carry Perplexity. Ambiguous requests are interviewed with the interview-me skill, every brief gets a prompt-optimizer pass, and a spawned sub agent is never a finished package. Her agent file was cut 44 percent (39.6 KB to 22.2 KB, about 4,350 tokens per turn) without dropping any standing block. A new Sunday task, skills-refresh-weekly, audits every SKILL.md and writes proposals to the dashboard. Live and remote access stays the vanessa launcher (Claude app, Code, session Vanessa). Search terms: Vanessa dispatch, sub agents, orchestrator, Fable masterminds, token usage, token diet, Jarvis Ruflo second brain graphify obsidian as one, knowledge fabric, recall, skills refresh, interview me, prompt master, prompt optimizer, remote access, Vanessa live.  
  
https://app.notion.com/p/Vanessa-works-as-one-system-Fable-5-1-masterminds-sub-agents-on-Sonnet-or-Opus-do-the-research-and-3dcc1760a749817c9f67ca2fdb5e0e5e

## Zoho CRM API access is blocked for the connected profile (NO_PERMISSION Crm_Implied_Api_Access); the Command Deck carries a Leads kanban mirror until Zoho is fixed  
Reference · Inbox · mortgage, ai-automation, ops  
  
Reference as of 2026-09-14: Zoho CRM refuses every API call from the connected account with NO_PERMISSION: Crm_Implied_Api_Access. That is a Zoho-side setting (Setup, Users and Control, Profiles, enable API access for the profile, or confirm the CRM edition includes API access), so no sync task can read mortgage leads yet. Until then the Command Deck's Mortgage section shows a Zoho Leads kanban mirror: the fourteen Lead Stage columns (NEW, Contact Established, Application Sent, Application Complete, Docs Requested, Docs Received, Pre-Approved, Opened Escrow/Converted, Old Database, Credit Repair, Refi Watch list, DEAD LEAD, From Prior Database, UnAccounted), the Zoho filter sidebar (System Defined Filters, Filter By Fields, Filter By Related Modules — 76 filters), record search, sort and a deck-only Create Lead. The board holds what Steven pasted from Zoho on 2026-09-14 (15 leads), not a live feed. Search terms: Zoho, Zoho CRM, Zoho leads, mortgage leads, kanban, lead stages, API access, NO_PERMISSION, Crm_Implied_Api_Access, Composio Zoho, Command Deck mortgage, dashboard Zoho.  
  
https://app.notion.com/p/Zoho-CRM-API-access-is-blocked-for-the-connected-profile-NO_PERMISSION-Crm_Implied_Api_Access-the-3dcc1760a749812cb9d6f404559386d4

## LinkedIn skills are onboarded to seven AI Team seats at draft-only Tier 0; no agent ever posts, connects or messages on LinkedIn  
Decision · Inbox · marketing, ai-automation, compliance  
  
Decided 2026-09-14: the LinkedIn skill pack (profile optimizer, post writer, content planner, hook extractor, humanizer, repurposer, comment drafter, reply handler, thread monitor, engager analytics, employee advocacy) is attached to seven agents: the Model Match networker, LPT recruiting downline, realtor reciprocity, social media manager, PR media relations, brand strategist and content writer. Every LinkedIn output is a draft Steven posts himself. No agent posts, schedules, reacts, connects, messages, endorses or logs in, because LinkedIn's user agreement forbids automated engagement and because the standing guardrail is draft-only. Declined for the vendor network manager (a public vendor endorsement is a RESPA section 8 question) and for Maxwell the broker coach (out of his lane). The LinkedIn MCP server and scraper stay read-only and are not registered. Search terms: LinkedIn, LinkedIn posts, LinkedIn profile, networker agent, Model Match, recruiting downline, social media manager, content writer, Publora, Apify token, draft only.  
  
https://app.notion.com/p/LinkedIn-skills-are-onboarded-to-seven-AI-Team-seats-at-draft-only-Tier-0-no-agent-ever-posts-conn-3dcc1760a74981c29788de39aca38583

## A backup that passes integrity can still be stale, and a database can be empty on disk while its data lives in the WAL — check currency, not only soundness  
Note · Inbox · ai-automation, ops  
  
Found 2026-09-13 by the stress sweep and fixed by the reliability engineer: the ecosystem backup reported integrityCheck pass while 8 live files were missing (1 agent, 5 scheduled tasks, 2 hooks); backup.py now reports currency: current or stale (N missing) beside the integrity verdict on run, verify and restore-test, and compares against the previous backup's manifest. Same night, the Apple Health DuckDB main file was 12 KB from Sep 7 while six days of data sat in a 1 MB write-ahead log; DuckDB only checkpoints at 16 MiB or on a clean close and the daemon never closed — a file copy would have captured an empty database. ingest.py now checkpoints after every batch, at startup and on shutdown (12 KB → 3.4 MB, WAL gone). Search terms: backup stale, currency, integrityCheck pass, WAL, checkpoint, duckdb empty, health database 12 KB, copy captured empty, lastRunAt is not output.  
  
https://app.notion.com/p/A-backup-that-passes-integrity-can-still-be-stale-and-a-database-can-be-empty-on-disk-while-its-dat-3dbc1760a749815a861ec04d39d2c3e1

## The knowledge fabric: one recall verb reads the Second Brain, the vault, Jarvis, the Graphify graph and Ruflo — and client notes are counted, never named  
Reference · Inbox · ai-automation, ops  
  
Since 2026-09-13 Vanessa, every agent and the Command Deck Toolkit tab ask one command first: ~/Applications/local-bridge/run.sh recall "term". It prints five labelled sections (Second Brain index from the Drive folder, Obsidian vault notes, Jarvis semantic index, Graphify knowledge graph explain, Ruflo memory) and says plainly when a store has nothing or cannot be read. Client and deal folders (10-Clients, 20-Deals) are only counted — names never reach a phone-sized answer. Vanessa's fan-out is bounded by roster-tiers.json: 169 agents in three tiers (17 dispatched directly, 78 pulled by 9 leads, 74 by name only), at most 8 parallel, hard cap 12, at most 4 research-tool users per wave. The AI Team panel now lists all 169 agents with role and lead. Search terms: recall, knowledge fabric, operate as one, second brain vault jarvis graphify ruflo, roster tiers, fan-out, org chart, how many agents, 169.  
  
https://app.notion.com/p/The-knowledge-fabric-one-recall-verb-reads-the-Second-Brain-the-vault-Jarvis-the-Graphify-graph--3dbc1760a74981b49861f68aad5051de

## Ruflo CLI aborts on Node 24.19 because of a Node bug, not Ruflo; the MCP plugin works and a wrapper runs the CLI on Node 22  
Reference · Inbox · ai-automation, ops  
  
Any short-lived ruflo command (ruflo memory list, store) on this Mac exits 134 with Assertion failed (env) \!= nullptr in RemoveEnvironmentCleanupHook. Cause found 2026-09-13: Node 24.19.0 added cleanup hooks to node::ObjectWrap (nodejs/node#63642) and better-sqlite3 statements finalised by the garbage collector now abort; the Node fix (#65042) was still an open backport, so upgrading Ruflo, better-sqlite3 or Node 24 does not help. The Ruflo MCP plugin is a long-lived process and is unaffected: memory_store, memory_search and memory_delete all work, and every automation writes through it. Fix for the CLI: brew install node@22 (keg-only, leaves the system Node alone); ~/.local/bin/ruflo already runs the CLI on it. Search terms: ruflo crash, ruflo memory crash, Node 24, assertion env nullptr, better-sqlite3, node@22, exit 134, swarm memory.  
  
https://app.notion.com/p/Ruflo-CLI-aborts-on-Node-24-19-because-of-a-Node-bug-not-Ruflo-the-MCP-plugin-works-and-a-wrapper--3dac1760a749819888d0eb80c3ed203d

## Scheduled tasks hang, not die — the concurrency deadlock and why a restart alone does not fix it  
Reference · Active · ops, ai-automation  
  
Desktop scheduled tasks hang instead of dying, and a restart alone does not fix it. The chain starts with missing approvals and ends in a concurrency deadlock. When approvedPermissions is null the runner launches without the tools its skill needs, hits a permission prompt with no UI attached, and blocks instead of aborting. On 2026-09-12 transcripts showed 16 scheduled runs across 13 tasks and zero writes, with reads getting through and writes blocking. Runner processes come in pairs, so count runs not processes. lastRunAt is stamped at launch so the registry reads green over a hung run. The Desktop fix script adds only one Read rule and on its own gets zero of 48 tasks through a full run. Pilot one task with Run now, approve each tool, confirm output, then repeat. An agent cannot grant these permissions. Search terms: scheduled tasks not working, tasks hang, deadlock, approvedPermissions, fix script not enough, pilot one task, run now, task never produces output.  
  
https://app.notion.com/p/Scheduled-tasks-hang-not-die-the-concurrency-deadlock-and-why-a-restart-alone-does-not-fix-it-3d9c1760a749818086beee3a50b64628

## What the Command Deck actually holds — 134 documents, 86 populated and 48 empty, and most of the empty ones are fed by tasks that never launched  
Reference · Inbox · ai-automation, ops  
  
A direct read of the Command Deck database on 2026-09-12 found 134 documents, of which 86 carry data and 48 are empty shells. The empty list is not random. Pipeline, ISA scorecard, refi watch, referral partners, deal checklists, showing schedule, showing route, recruit pipeline, review pipeline, webinar funnel, marketing queue, subscriptions, all three nonprofit counters, both GCI deal counts and sixteen of the income line items are all empty. Improvement proposals is empty too, so the weekly self update has never produced a proposal. Most of these are fed by scheduled tasks that have never launched, or that launched and hung without output, so the panels are not broken, they have never been filled. Pipeline, deal checklists, referral partners and the income lines are hand maintained and no task will fill them. Search terms: what is on my dashboard, empty panels, why is this panel blank, deck documents, populated versus empty, pipeline empty, no improvement proposals, dashboard inventory, which panels have data.  
  
https://app.notion.com/p/What-the-Command-Deck-actually-holds-134-documents-86-populated-and-48-empty-and-most-of-the-emp-3d9c1760a74981d5ae0ff1e6af4e591b

## The real automation layer as of 2026-09-12 — fifty scheduled tasks, eighteen have launched, thirty-two never have, and a launch is not proof of work  
Note · Inbox · ai-automation, ops  
  
A live inventory of the desktop scheduled task tier on 2026-09-12 found fifty tasks, all marked enabled. Eighteen carry a lastRunAt timestamp and thirty-two have none. lastRunAt is stamped when a run launches, not when it finishes, so it proves a launch and nothing more. A check that afternoon found twelve of thirteen live task runners launched without Bash, Read, Write or Artifact, the oldest running more than three hours, and zero vault files written that day, which is the same hang on a permission prompt recorded in the deadlock row. None of the fifty is proven to be producing output, including the eighteen that launched, and there are no backups. This corrects the older figure of forty two of forty four and corrects this row's own first version, which wrongly treated lastRunAt as proof a task ran. Search terms: scheduled tasks, which tasks are running, task never ran, lastRunAt, launched but no output, enabled but not running, automation health, why is my dashboard stale, run now, approved permissions, fix script, task inventory.  
  
https://app.notion.com/p/The-real-automation-layer-as-of-2026-09-12-fifty-scheduled-tasks-eighteen-have-launched-thirty-t-3d9c1760a74981ffbde9eae9d450d3ee

## Mapping the operating system design onto the 168 agents that already exist — nine of twelve proposed agents are already built, three are genuinely missing  
Note · Inbox · ai-automation, ops  
  
The proposed personal operating system was checked against the real roster on 2026-09-12. Of twelve recommended specialist agents, nine already exist under the current C suite. Only three are genuinely missing, an MBSE Program agent, an SOP Engineer, and a Personal Chief of Staff. The real gaps are not agents at all. They are the missing Universal Inbox, Decision Ledger, Commitments Register, Preference Cards and Interaction Feedback Log, plus the absence of any tier field on the 168 agents so nothing limits how many fire on a request. The hard blocker is the scheduled task tier, fifty tasks, thirty two never launched, and the ones that launched hang on a permission prompt without producing output, so none of the daily loop can run until the permissions are fixed. Search terms: what do I already have, agent gap analysis, which agents are missing, MBSE agent, SOP engineer, personal chief of staff, org chart mapping, do not duplicate agents, tiering gap, why nothing runs.  
  
https://app.notion.com/p/Mapping-the-operating-system-design-onto-the-168-agents-that-already-exist-nine-of-twelve-proposed-3d9c1760a74981ff8e7bf60fe5200181

## Nine operating techniques harvested from published system prompts, and where each one plugs into the existing 168-agent stack  
Reference · Inbox · ai-automation, ops  
  
Seven published system prompts were mined on 2026-09-12 for transferable technique, Perplexity voice, Comet browser assistant, deep research, Perplexity AI, Perplexity Computer, Claude Cowork and Claude Fable 5.1. Nine techniques transfer. The most important is the unattended operation rule, when working with nobody watching do not stop to ask a question that will go unanswered for hours, take the most reasonable interpretation, state it plainly at the top of the work, and carry on, which is exactly how the scheduled task tier should behave. Perplexity Computer independently states the same rule Steven set, always call the tool list before claiming you cannot access something. Also harvested, a mandatory verification step on every non trivial task, anti retry discipline, citation anchor text rules, and the warning never to use in process cron for scheduled work because it dies with the session. Search terms: prompt engineering patterns, system prompt techniques, unattended operation, verification step, do not brute force retry, citation format, anchor text, cron versus scheduled task, agentic persistence, todo discipline.  
  
https://app.notion.com/p/Nine-operating-techniques-harvested-from-published-system-prompts-and-where-each-one-plugs-into-the-3d9c1760a74981a7ba71e131aa10a1ec

## Standing output rule: every decision or scenario gets four courses of action and a recommendation, never a single answer  
Decision · Inbox · ops, ai-automation  
  
For any decision or scenario, the required output is four distinct courses of action weighed against each other, followed by one clear recommendation with the reasoning. A single answer is not acceptable because it hides the alternatives that were silently discarded and gives Steven nothing to push back against. The four COAs must be genuinely different approaches, not one plan at four levels of effort, and each carries cost, time, risk, reversibility and what has to be true for it to work. The recommendation names which COA, why it beats the others, what would change the answer, and the first concrete step. This is Maxwell the broker coach's existing format, priorities then four COAs then recommendation then implement this week, promoted to a standing rule for every agent and for Claude itself. Search terms: four COAs, courses of action, options, give me options, recommendation, decision format, how should agents answer, weigh the options, military staff format, do not give me one answer.  
  
https://app.notion.com/p/Standing-output-rule-every-decision-or-scenario-gets-four-courses-of-action-and-a-recommendation-n-3d9c1760a74981159d71ea3d87bceb94

## The ten highest-ROI automations for this stack, and the efficiency rule that a process repeated three times becomes an SOP and five times becomes automation  
Process · Inbox · ai-automation, ops  
  
The best automations remove status chasing, duplicate entry, context switching and forgotten commitments, not just clicks. Ten are specified against the real stack, calendar to brief, meeting to execution, CRM exception surfacing that shows only exceptions, document to obligation extraction, voice to structured capture, decision to follow through, delegation quality gating before Isa receives anything, SOP mining, relationship maintenance and subscription and vendor review. The compounding rule is that a manual process done three times triggers a proposed SOP and done five times triggers an automation eligibility review. Architecture should be event driven, validate, normalize, deduplicate, enrich, score, route, audit, rather than scheduled scans, because Notion supports connection webhooks for workspace changes. Search terms: automations to build, highest ROI automation, what should I automate, event driven, webhooks, SOP mining, three times rule, five times rule, CRM exceptions, meeting to tasks, subscription audit, stop status chasing.  
  
https://app.notion.com/p/The-ten-highest-ROI-automations-for-this-stack-and-the-efficiency-rule-that-a-process-repeated-thre-3d9c1760a74981248ca4f74049487abf

## Standing rule: when something is called impossible, classify the constraint as physics, funding or legal — if it is none of those, it is solvable  
Decision · Inbox · ops, ai-automation  
  
When Steven challenges a no, or when an agent reports that something cannot be done, the answer is not accepted until the constraint is named and classified. There are only three hard categories. Physics, meaning a real technical boundary that no amount of money or permission removes. Funding, meaning it costs money that has not been spent. Legal, meaning a law, licence, regulation or contract forbids it. Anything that is not one of those three is a habit, an unapproved permission, a missing configuration, an untried workaround or simple inertia, and it is solvable. Applying this test on 2026-09-12 reclassified four blockers that had been reported as limits, the scheduled tasks, Time Machine, video transcription and the Lofty key, all four are solvable and none are hard limits. Search terms: is this actually impossible, constraint triage, physics funding legal, challenge the no, what is really blocking this, cannot be done, workaround, hard limit versus habit, verify the blocker.  
  
https://app.notion.com/p/Standing-rule-when-something-is-called-impossible-classify-the-constraint-as-physics-funding-or-l-3d9c1760a749815ba54ff8c335119ba8

## The priority score and the seven decision-authority categories, mapped to the guardrails the agents already carry  
Process · Inbox · ai-automation, ops, compliance  
  
Priority stops meaning whichever message arrived first. A weighted score makes Vanessa able to explain why something rose to the top, thirty percent revenue or value, twenty five percent urgency, twenty percent risk reduction, fifteen percent strategic alignment, ten percent relationship importance, each scored zero to five, then modifiers for deadlines inside twenty four hours, blocking others, reversibility and whether it needs his license. Work that Isa, an SOP or automation can do is removed from his queue entirely rather than ranked lower. Separately, seven decision categories set who may act, from inform where AI may complete, through prepare and internal execute, to regulated and irreversible where a human must approve every time. This matches the standing guardrail every agent already carries, draft only, never send, sign, spend, book, trade or quote. Search terms: priority score, how is priority decided, what should I do first, decision authority, who can approve, can the AI send this, irreversible actions, human in the loop, escalation thresholds, weighted scoring.  
  
https://app.notion.com/p/The-priority-score-and-the-seven-decision-authority-categories-mapped-to-the-guardrails-the-agents--3d9c1760a74981ef958bf97538f4cefd

## The agent council needs tiers and authority, not 41 agents all running on every request — Vanessa routes, specialists recommend, humans execute  
Process · Inbox · ai-automation, ops  
  
The governing rule is that a specialist recommends, Vanessa synthesizes, and a human or approved workflow executes. Agents are organized into five tiers so they do not all fire on every request. Tier zero is always on capture. Tier one is daily operations. Tier two is domain specialists activated only when the domain is relevant. Tier three is quality and challenge including Steve and compliance. Tier four is human authority for high risk, external, regulated or irreversible actions. Vanessa is intake, classification, context assembly and routing, not a broad agent that does everything. Steve is a preference model and challenger trained only on approved structured evidence, and his job is to identify what Steven would challenge, not just what he would prefer. Isa is a workflow owner with a work acceptance standard, and a task without a definition of done does not enter her queue. Search terms: agent council, tiers, which agent, Vanessa role, Steve challenger, Isa delegation, definition of done, work acceptance standard, escalation, who approves, new agents to build, specialist routing.  
  
https://app.notion.com/p/The-agent-council-needs-tiers-and-authority-not-41-agents-all-running-on-every-request-Vanessa-ro-3d9c1760a7498154b32ef8b3bc425b38

## The Second Brain becomes a personal operating system, not a knowledge vault — six layers, and Notion is deliberately not the source of truth for everything  
Decision · Inbox · ai-automation, ops  
  
The target state is that anything enters once, gets classified once, is routed to the right owner or system, and resurfaces only when action or a decision is required. Six layers, inputs, then Vanessa intake and triage, then Notion Mission Control, then the specialist agent council, then human or system execution, then learning and governance. The load bearing decision is that Notion is not the source of truth for everything. The CRM stays source of truth for leads and contacts, the lender and loan systems for loan data, TransactionDesk for transaction documents, the calendar for availability. Notion owns cross system context, governance, work orchestration, decisions, SOPs and dashboards. Search terms: second brain architecture, personal operating system, operating model, six layers, source of truth, system of record, what owns what, Vanessa control plane, capture once route once, four layer leverage model.  
  
https://app.notion.com/p/The-Second-Brain-becomes-a-personal-operating-system-not-a-knowledge-vault-six-layers-and-Notion-3d9c1760a7498129afc1d24be2b0713b

## The Ultimate Realtor Playbook is not third-party material — it is Steven's own 602-page operating manual, prepared for him by name  
Source · Inbox · real-estate, marketing  
  
This document is easy to mistake for a purchased course. It is not. The title page reads PREPARED FOR Steven K. Shearrill, MBA, PMP, with his DRE [number] and NMLS 2449246, branded SPACE Real Estate Team, June 2026, Edition 1.0. That changes how it should be filed and how it should be used. It is his bespoke operating manual, so its templates are meant to be published under his name, which is why the missing Equal Housing marks and missing company NMLS matter. It also asserts production claims about the team and brokerage caps that are load bearing for its economic argument and are not sourced to any primary document. Search terms: Ultimate Realtor Playbook, my playbook, SPACE Real Estate Team, prepared for me, whose document is this, 602 pages, is this mine or purchased, operating manual.  
  
https://app.notion.com/p/The-Ultimate-Realtor-Playbook-is-not-third-party-material-it-is-Steven-s-own-602-page-operating-ma-3d9c1760a74981abbdb7fe9d5da0575a

## The Beer and Cheplak team manifesto is one program across two editions, not two separate systems — and the three mortgage playbooks were written by an AI  
Note · Inbox · real-estate, mortgage  
  
Two attribution findings that change how these documents get filed. First, the 7 Steps booklet from Agent Academy by Jon Cheplak and Daniel Beer, May 2022, is the same program as the earlier Dan Beer CEO document from April 2017, with one new Step 7 on recruiting added. They are two editions of one system, so they belong in one row, not two. Second, all three mortgage playbooks, the Ultimate Mortgage Broker SOP, the Complete Loan Programs Playbook and the VA Loan Mastery Playbook, list the author as Perplexity Computer. They are AI generated works branded for Patriot Pacific, which explains both their breadth and their inconsistent figures, and means their citations need checking rather than trusting. Search terms: Dan Beer, Jon Cheplak, Agent Academy, 7 steps, team manifesto, same program, who wrote the mortgage playbooks, Perplexity Computer, AI generated, attribution, is this a real source.  
  
https://app.notion.com/p/The-Beer-and-Cheplak-team-manifesto-is-one-program-across-two-editions-not-two-separate-systems-a-3d9c1760a74981bdb848d0c5d971c612

## The 17 trading playbooks are 16 documents from one vendor, and the three schools in them give opposite orders on the same bar  
Note · Inbox · trading  
  
All 17 files are TradeZella published playbooks on the same template, so agreement between two of them is not independent corroboration. One file is a byte identical duplicate misnamed as SMT Divergence and PO3 when it is actually the Low Volume Node playbook. The three schools disagree directly. The liquidity and smart money camp sells above a high that was just run, calling it a trap. The auction and order flow camp either buys that same continuation or requires a reclaim back inside value first. Break and retest buys the continuation of the same break. On one NQ chart at 9:35 these place opposite orders at the same price. Search terms: trading playbooks, TradeZella, liquidity sweep, order flow, auction theory, break and retest, contradiction, which strategy, duplicate file, SMT PO3 wrong file.  
  
https://app.notion.com/p/The-17-trading-playbooks-are-16-documents-from-one-vendor-and-the-three-schools-in-them-give-opposi-3d9c1760a74981b89cc9dc20eda52078

## The VA Lender's Handbook PDF on the Mac is a KnowVA scrape whose Chapter 8 funding fee tables expired in 2017 and predate the Blue Water Navy Act  
Reference · Inbox · mortgage, compliance  
  
The 565 page combined VA Pamphlet 26-7 file is not an official single VA document. It is a scrape of the VA KnowVA portal assembled on 2026-06-12, and each chapter carries its own change date. Chapter 8, the funding fee chapter, was last revised 2012-11-08 and its own note says the rates run only through 2017-09-30. It still shows a separate Reserves and National Guard rate, which the Blue Water Navy Vietnam Veterans Act of 2019 removed. Nothing in the 565 pages states any funding fee percentage set after 2019. Use this file for chapter structure and procedure, never for a live fee quote. Search terms: VA Lenders Handbook, Pamphlet 26-7, VAP26-07, funding fee table, Chapter 8, stale, Blue Water Navy, Reserve differential, where is residual income, entitlement restoration, Tidewater.  
  
https://app.notion.com/p/The-VA-Lender-s-Handbook-PDF-on-the-Mac-is-a-KnowVA-scrape-whose-Chapter-8-funding-fee-tables-expire-3d9c1760a74981888a64de33cbdec690

## Capture calibration for the Second Brain — if it was fetched or generated it goes in the answer, not the brain, and only what Steven confirms is durable  
Process · Inbox · ai-automation, ops  
  
The sharpest capture rules harvested from published system prompts on 2026-09-12. Anything fetched from a search, a connector or a tool, and anything an agent generated such as a recommendation or an option list, belongs in the answer and not in a stored row, because searchable data is requeryable and suggestions are rederivable, while memory is for what is neither. What makes it durable is Steven confirming it. Calibrate the claim to the evidence, one mention is mentioned once and never becomes enthusiast. A brief sounds good confirms the shape of a proposal, not each of the ten details inside it. Prefer durable phrasing over precise figures that go stale. The horizon test is whether the line would still be true and worth reading a month from now in a conversation about something else. Search terms: what should go in the brain, when to write a row, capture rules, do not save this, horizon test, already filed, calibration, stated versus inferred, avoid stale figures, split by destination.  
  
https://app.notion.com/p/Capture-calibration-for-the-Second-Brain-if-it-was-fetched-or-generated-it-goes-in-the-answer-not-3d9c1760a749819a9fdecef5608873a0

## Notion Mission Control needs a database architecture, not a page hierarchy — sixteen databases, a relation map, and a 24 hour inbox rule  
Reference · Inbox · ai-automation, ops  
  
Pages are views, dashboards, SOPs and documentation. Databases are the operating memory. Sixteen core databases are specified, Universal Inbox, Action Hub, Projects and Outcomes, Decision Ledger, Commitments Register, Contacts and Relationships, Meetings and Conversations, Knowledge Vault, SOP and Playbook Library, Agent Registry, Interaction and Feedback Log, Risk and Compliance Register, Metrics and Scorecards, Opportunities and Ideas, People and Delegation Board, and Personal OS. The single biggest improvement is relational context, every record links to other records so Claude reads an evidence graph instead of inferring from long unstructured pages. Nothing stays in the Universal Inbox more than twenty four hours, amber at twenty four, red at seventy two. Search terms: Notion database structure, mission control, which database, universal inbox, action hub, decision ledger, commitments register, knowledge vault, SOP library, agent registry, relation map, inbox processing rules, time in inbox.  
  
https://app.notion.com/p/Notion-Mission-Control-needs-a-database-architecture-not-a-page-hierarchy-sixteen-databases-a-re-3d9c1760a74981709257dd046f1074b3

## Only about seven ideas in the trading library can be written as a rule with a number in it, and every order flow trigger is not one of them  
Note · Inbox · trading  
  
Applying a strict test, could this be coded as a condition with a number, sorts the 16 trading playbooks into three tiers. Tier one is codeable today and includes Trader Kane's NQ versus ES divergence, TG Capital's Trident setfile, Tanja's session governor limits, Scarface's One Candle and First Candle rules, Desiano's No Trade Zone, Rajan Dhall's moving average alignment filter and Tori Trades' touchpoint discipline. Tier three is not mechanizable at all and covers every order flow trigger in the library. Absorption, liquidity walls, trapped sellers and aggression overwhelming absorption are described but not one document gives a contract count, a delta threshold, an imbalance ratio or a time at level. Search terms: which trading strategy can I automate, backtest, bot rules, setfile, mechanizable, order flow not codeable, SMT divergence NQ ES, Trident, no trade zone, session limits.  
  
https://app.notion.com/p/Only-about-seven-ideas-in-the-trading-library-can-be-written-as-a-rule-with-a-number-in-it-and-ever-3d9c1760a749815e9b0fcdf6e90f7f95

## Equal Housing and the company NMLS appear nowhere in 823 pages of Steven's own marketing playbooks — a live advertising gap  
Note · Inbox · compliance, marketing, mortgage, real-estate  
  
The Ultimate Realtor Playbook was prepared for Steven and carries 602 pages of marketing templates, farming mail, ad copy, social content and listing collateral. The phrase Equal Housing appears zero times in it. Only his personal NMLS 2449246 appears, never the company NMLS 1921615, and his own standing rule is that both belong on any advertisement. The Ultimate Mortgage Broker SOP has a 13 page marketing chapter and the words triggering terms, Equal Housing and NMLS ID appear zero times in all 221 pages. Any template lifted from either document ships short of required identifiers. Search terms: Equal Housing, NMLS on ads, advertising compliance, triggering terms, Reg Z, marketing template, disclosure missing, ad copy, farming mail, social post compliance.  
  
https://app.notion.com/p/Equal-Housing-and-the-company-NMLS-appear-nowhere-in-823-pages-of-Steven-s-own-marketing-playbooks--3d9c1760a74981d7afc2f0cca1b313da

## Version traps in the DAU guidebook set — four files print a date that is not their real one, and the whole set descends from a retired parent  
Note · Inbox · ops, compliance  
  
Before citing anything from the DAU guidebooks, check these. The Defense Acquisition Guidebook was retired in 2022 so anything citing the DAG is superseded. The PSM guidebook prints May 2022 on every page but was revalidated June 2024 as version 1.01. The Requirements for Digital Capabilities cover says February 2022 but the change record shows version 1.01 in December 2023. The Systems Engineering Guidebook has an empty change record since February 2022 while its sibling is on Change 2 October 2024. The HSI guidebook cites two different instruction numbers for the same thing and one of them is wrong. Title 10 citations in the older files are pre-recodification. Search terms: is this current, superseded, outdated guidebook, wrong version, DAG retired, Title 10 renumbered, which version, citation check.  
  
https://app.notion.com/p/Version-traps-in-the-DAU-guidebook-set-four-files-print-a-date-that-is-not-their-real-one-and-the-3d9c1760a74981a3a29fca15b0f1c7d1

## Ten frameworks from the DAU guidebooks that transfer directly to running a solo business — risk registers, gate criteria, should-cost, and the SLA checklist  
Process · Inbox · ops  
  
The defense acquisition guidebooks contain process discipline that works outside defense. Split risk into three separate registers because an issue has already happened and has no likelihood. Write risks as if event then consequence. Give every gate a named product list and a named person who closes it. Trace every requirement both directions so there are no orphaned children and no childless parents. Set the affordability ceiling top down before anyone estimates bottom up. Make cost analysis reproducible by a stranger. Use the nine point service level agreement checklist for vendors. Rank what is critical before spending on protecting it. Search terms: risk register, issue vs risk, if then, stage gate, tollgate, DMAIC, requirements traceability, RTM, should cost, will cost, affordability, vendor agreement, SLA, criticality analysis, flow metrics, Kaizen.  
  
https://app.notion.com/p/Ten-frameworks-from-the-DAU-guidebooks-that-transfer-directly-to-running-a-solo-business-risk-regi-3d9c1760a74981d88239df1f28a47f42

## Which system owns what — the ISA technology stack, and the four tools deliberately removed from it  
Reference · Inbox · ops, ai-automation, mortgage, real-estate  
  
The system-of-record map from Steven's ISA SOP: Zoho CRM with Arive for everything mortgage, Follow Up Boss for everything real estate, Arive for the loan pipeline and AUS, Dotloop or SkySlope for transaction documents, Notion for SOPs and the decision log, n8n and Pabbly for automation, Otter for meeting transcription, and YLOPO plus Zillow and Fello for lead generation. Four tools were deliberately removed: ElevenLabs, HeyGen and Vapi.ai for synthetic voice, avatar and AI outbound calling, and Handwrytten for automated cards. Search terms: tech stack, what tool do we use, system of record, Zoho, Arive, Follow Up Boss, Dotloop, SkySlope, n8n, Pabbly, Otter, YLOPO, removed tools, ElevenLabs, HeyGen, Vapi, Handwrytten.  
  
https://app.notion.com/p/Which-system-owns-what-the-ISA-technology-stack-and-the-four-tools-deliberately-removed-from-it-3d9c1760a749817cb04dca34a3fb100e

## The dual-capacity radius rule — Steven double-ends as agent and loan officer only inside San Diego / Temecula–SW Riverside, everything outside refers out at 25 percent  
Decision · Inbox · compliance, mortgage, real-estate  
  
From his own ISA SOP. Real estate is secondary to mortgage prospecting. He acts as both the agent and the loan officer on the same deal only within the San Diego County and Temecula / Southwest Riverside County radius. Any real-estate need outside that radius is referred to a vetted partner agent for a 25 percent referral fee through approved brokerage procedures. His mortgage footprint is five states: California, Nevada, Arizona, Illinois and Florida, subject to current licensing. Search terms: dual capacity, double end, both sides, agent and loan officer, referral fee, 25 percent, out of area, which states am I licensed, footprint, radius, refer out.  
  
https://app.notion.com/p/The-dual-capacity-radius-rule-Steven-double-ends-as-agent-and-loan-officer-only-inside-San-Diego--3d9c1760a74981ab9f25d57d1815e96a

## VA Loan Mastermind Las Vegas event is 2026-10-15 and Steven owes $2,575 three business days before it  
Reference · Inbox · marketing, mortgage  
  
A dated marketing plan for a VA homebuyer class and live webinar in Las Vegas near the Nellis AFB corridor, Thursday 15 October 2026, doors 5:30 PM and programme 6:30 to 9:00 PM. Total executed budget is $5,150 and Steven's half is $2,575, due three business days before the event. Lead split on company-generated closed business was revised up to 75 percent under a signed agreement. Target is 80 to 100 registrations, 35 to 45 percent show rate, 8 to 15 percent webinar-to-application. Search terms: VA Loan Mastermind, Las Vegas webinar, Nellis, homebuyer class, event budget, lead split, October 15, registration target, show rate, marketing plan, money due.  
  
https://app.notion.com/p/VA-Loan-Mastermind-Las-Vegas-event-is-2026-10-15-and-Steven-owes-2-575-three-business-days-before-i-3d9c1760a74981449568f579d9c259c8

## The CORE Training (Rick Ruby) system Steven runs — theme days, the Top 50 VIP list, the time block and the Greatness Tracker are one system, not four handouts  
Source · Inbox · real-estate, mortgage, ops  
  
Four of the training files are pieces of one method from Rick Ruby and The CORE Training Inc, and they only work together. Theme days assign each weekday a single prospecting focus. The Top 50 VIP list is chosen by relationship depth rather than transaction history. The time block is a blank weekly grid that puts the theme day into actual hours. The Greatness Tracker counts the leading activity metrics: calls, face to face, hours prospected and meals. This is licensed third-party material and is attributed, never presented as Steven's own. Search terms: Rick Ruby, CORE Training, theme days, Top 50, VIP list, time block, Greatness Tracker, prospecting, LOTH, letter of the heart, past client database, activity metrics.  
  
https://app.notion.com/p/The-CORE-Training-Rick-Ruby-system-Steven-runs-theme-days-the-Top-50-VIP-list-the-time-block-a-3d9c1760a7498150bb43da443cee7492

## The nine non-negotiable standards in Steven's Virtual EA/ISA SOP — 5-minute lead response, a documented next step on every lead, zero missed deadlines  
Process · Inbox · ops, mortgage, real-estate, compliance  
  
His own written operating standard for the Virtual Executive Assistant / Inside Sales Agent seat. Nine measurable non-negotiables including under-five-minute new-lead response during coverage hours, a documented next action on 100 percent of active leads, daily review of every open file, immediate consent suppression for do-not-call and unsubscribe, and human approval of AI-generated external content. Also defines the dual-CRM split: Zoho plus Arive for mortgage, Follow Up Boss for real estate, never blended. Search terms: ISA SOP, EA job description, VA assistant, five minute rule, speed to lead, lead response time, next action, dual CRM, Zoho, Follow Up Boss, standards, KPI scorecard, escalation.  
  
https://app.notion.com/p/The-nine-non-negotiable-standards-in-Steven-s-Virtual-EA-ISA-SOP-5-minute-lead-response-a-documen-3d9c1760a74981d889c2dc0debe70474

## How the trading desk is actually wired — two separate stacks, futures on QuantVue and forex on Archangel X, joined only by copy-trading  
Reference · Inbox · trading, ops  
  
The trading operation is two independent stacks, not one. Futures run on NinjaTrader and Tradovate with the QuantVue QZeus bot, fanned out across many prop accounts by TradeSyncer. Forex runs on Archangel X trading US30 and USD, fanned out by Traders Connect. Archangel X has its own course library and a Setfile Optimizer, and a setfile change moves every connected forex account at once. Search terms: trading setup, prop firms, TradeSyncer, QuantVue, QZeus, Archangel X, setfile, copy trading, forex bot, futures bot, how is my trading wired.  
  
https://app.notion.com/p/How-the-trading-desk-is-actually-wired-two-separate-stacks-futures-on-QuantVue-and-forex-on-Archa-3d9c1760a749812e924ef845f19620f2

## How to reach the AI team from outside the dashboard — iMessage works, Discord needs a bot token, WhatsApp is not possible  
Process · Inbox · ai-automation, ops  
  
The Command Deck is a published artifact with no server, so nothing can call into it; every outside channel has to go through a Claude Code session that writes a database document the page then reads. iMessage is live through Inkbox and answers with full deck and agent access. Discord needs a bot token because user OAuth has no message tools at all. Personal WhatsApp cannot be connected and was removed from the dashboard rather than left showing not-connected forever. Search terms: text Vanessa, iMessage Vanessa, Discord Vanessa, talk to my agents from my phone, WhatsApp, why cant I connect WhatsApp, message bridge, agent inbox.  
  
https://app.notion.com/p/How-to-reach-the-AI-team-from-outside-the-dashboard-iMessage-works-Discord-needs-a-bot-token-Wha-3d9c1760a74981479305d2a06d7c835b

## Some public listings still show Steven at eXp Realty, but he has been at LPT Realty since December 2024  
Note · Inbox · compliance, real-estate, marketing  
  
Public search results are stale about which brokerage Steven works under. temeculahomefinder.com lists him as "Steven Shearrill of eXp Realty of California, Inc." and a Google Calendar he owns is still named "Appointments on Facebook for Steven Shearrill - Realtor Brokered by EXP Realty of California, Inc". He moved to LPT Realty in December 2024. For a licensed broker, advertising or appearing under a former brokerage is a consumer-confusion and licensing-advertising problem, not just an outdated bio. Search terms: eXp Realty, LPT Realty, wrong brokerage, old brokerage, stale listing, brokerage attribution, DRE advertising.  
  
https://app.notion.com/p/Some-public-listings-still-show-Steven-at-eXp-Realty-but-he-has-been-at-LPT-Realty-since-December-2-3d9c1760a74981868e3dddfb9210d4bc

## VA funding fee: the 3.30% subsequent-use tier is the one that gets left off tables  
Reference · Active · mortgage, compliance  
  
2026 VA funding fee tiers: 2.15% first use and 3.30% subsequent use when under 5% down; 1.50% at 5 to 9.99% down; 1.25% at 10% or more down. Waived for veterans on VA disability compensation, Purple Heart recipients, and qualifying surviving spouses. Deductible again on Schedule A for tax year 2026. The ISA Portal table omitted the 3.30% subsequent-use tier entirely and read as a smooth scale from 2.15% downward, which understates the fee for a repeat-use veteran by about 6,900 dollars on a 600,000 dollar loan. Check any funding fee table for the subsequent-use row specifically.  
  
https://app.notion.com/p/VA-funding-fee-the-3-30-subsequent-use-tier-is-the-one-that-gets-left-off-tables-3d9c1760a7498112ad95eaf016bf6812

## Two Claude sessions editing one artifact will silently revert each other — the build stamp is the fix  
Process · Active · ai-automation, ops  
  
When two Claude sessions edit the same published artifact, a republish from a stale baseline silently drops the other session's changes with no error and no warning to either side. This happened on the Command Deck on 2026-09-11: three security and accessibility fixes disappeared and only turned up because the live-update watch prompted a re-read. The fix is a build stamp rendered in the page footer so any reader can tell which build they are looking at, plus the merge discipline of re-reading the live version and applying changes onto it rather than republishing your own copy over it.  
  
https://app.notion.com/p/Two-Claude-sessions-editing-one-artifact-will-silently-revert-each-other-the-build-stamp-is-the-fi-3d9c1760a74981568668c8fc20d89b71

## Model Match targeting: sort agents by lender wallet share into locked, split, and gap  
Process · Active · real-estate, mortgage, marketing  
  
How to work the Model Match database for realtor partner development instead of just pulling a list and dialing it. Model Match agent production reports show which lenders sit behind an agent's financed transactions and at what share. Sort candidates into locked, meaning one lender above roughly 70 percent share, deprioritise those; split, meaning business spread across three or more lenders, that is the winnable middle; and gap, meaning real VA or government volume going to a lender with weak VA execution, that is the highest value because there is a concrete reason to switch rather than a generic value proposition.  
  
https://app.notion.com/p/Model-Match-targeting-sort-agents-by-lender-wallet-share-into-locked-split-and-gap-3d9c1760a7498178b27ee5c61546b223

## START HERE — duplicate this row to teach the brain something  
Process · Active · ops  
  
Fill-in-the-blank starter row. Duplicate this row in Notion on any device — phone, laptop, browser — then overwrite the Name and Summary with your own. Answer the four prompts in the body. This is how to train the second brain without Claude, without a terminal, without remembering any schema.  
  
https://app.notion.com/p/START-HERE-duplicate-this-row-to-teach-the-brain-something-3d9c1760a74981f28190cf314f21c5bb

## ISA rate scraper removed; client NPI cleared from published HTML; seed-clobber data loss fixed  
Decision · Active · compliance, ai-automation, ops, mortgage  
  
Second remediation pass on the two dashboards, 2026-09-11. Removed wireLiveMortgageRates from the ISA Portal, which scraped the first percentage out of any web search snippet and printed it under a green Live badge beside a stale APR on a licensed MLO surface. Cleared four seeded client names and loan amounts out of both pages published HTML. Fixed hydrateFromSeed on the Command Deck, which destroyed every local edit on reload when the database capability was unavailable. Added error isolation around 24 ISA renders, real buttons and live regions for keyboard and screen reader users, honest copy replacing three false automation claims, and a build stamp on both pages so concurrent editors can see which build they are on.  
  
https://app.notion.com/p/ISA-rate-scraper-removed-client-NPI-cleared-from-published-HTML-seed-clobber-data-loss-fixed-3d9c1760a74981439878fde95d22d45d

## Dashboard + agent ecosystem audit — XSS, ungated buttons, VA funding fee error, wildcard upload permission  
Decision · Active · ai-automation, ops, compliance, mortgage  
  
Full verification of Command Deck and ISA Portal with five engineering agents plus the dashboard-selftest harness on 2026-09-11. Fixed and republished both dashboards: 8 cross-site-scripting injection points in the ISA Portal where live web-search results were written raw into innerHTML, 4 more on the Command Deck, 6 ungated destructive and outward buttons, sandbox-blocked confirm() and window.open() that failed silently, WCAG AA contrast failures, a mangled string literal printing raw JavaScript on the refi panel, and a wrong VA funding fee table missing the 3.30 percent subsequent-use tier. Also removed a wildcard curl upload permission from settings.json, scoped 8 unscoped agents to least privilege, and corrected an agent that documented a PostToolUse hook that does not exist.  
  
https://app.notion.com/p/Dashboard-agent-ecosystem-audit-XSS-ungated-buttons-VA-funding-fee-error-wildcard-upload-perm-3d9c1760a749815b873dfd4b2b4a4c5a

## Cross-agent collaboration layer: declared hand-offs, the HAND-OFFS line, and the graph-rebuild trap  
Process · Active · ai-automation, ops  
  
How the 163 AI agents hand work to each other. 103 carry a Who you work with (standing) block with real partner lists derived from the actual cross-reference graph; 72 carry a HAND-OFFS line in the output contract and the other 31 carry a self-contained equivalent. Vanessa keeps a hand-off ledger written to the collabLedger document, and is required to record what did NOT happen as well as what did. Critical trap: the block's boilerplate contains the literal cco-alexandra, so rebuilding the reference graph from the patched files inflates that agent to ~89 upstream instead of 18 — strip the block before any graph work.  
  
https://app.notion.com/p/Cross-agent-collaboration-layer-declared-hand-offs-the-HAND-OFFS-line-and-the-graph-rebuild-trap-3d9c1760a749814c9ddae1855c74b3bd

## Doc-beats-seed: a dashboard document must override the seed's TIMESTAMP, not just its data  
Process · Active · ops, ai-automation, mortgage  
  
The Command Deck pattern for letting a scheduled-task document replace baked-in seed data. Three rules learned the hard way: the document must override the stamp as well as the values, or fresh data renders under a stale date and is indistinguishable from a broken feed; a row the document refreshed must be visually distinguishable from a row still on the seed (Live vs Seed badge); and when a document overrides a rate, the seed's APR must be DROPPED because an APR computed against a different rate is a wrong number. Out-of-band values are refused rather than rendered.  
  
https://app.notion.com/p/Doc-beats-seed-a-dashboard-document-must-override-the-seed-s-TIMESTAMP-not-just-its-data-3d9c1760a749817f9fffcdade22c3e07

## A published artifact cannot make external calls — what that rules out permanently  
Reference · Active · ai-automation, ops  
  
The Command Deck dashboard is a published Claude artifact, and its CSP blocks every external host. This is not a configuration to fix; it is the platform boundary, and it permanently rules out several things that keep getting requested. The page cannot call openrouter.ai, cannot reach a speech service to voice arbitrary text, cannot pull live MLS or CRM data, and cannot receive inbound messages. Everything live on the deck arrives the same way: a scheduled task on the Mac writes a document, and the page re-reads it.  
  
https://app.notion.com/p/A-published-artifact-cannot-make-external-calls-what-that-rules-out-permanently-3d9c1760a74981cf9440e4f885107c80

## Model Match partner-network agent added; Fable 5.1 attached as pointer not inline  
Decision · Active · ai-automation, real-estate, mortgage, ops  
  
Added modelmatch-partner-network AI agent that uses the Model Match database (modelmatch.com) agent production reports and lender wallet-share data to find and network with realtors, on two lanes: preferred lender for their buyers, and preferred realtor for inbound referrals. Decided to attach claude-fable-5.1.md to all 163 agent profiles as a short pointer block referencing ~/.claude/reference/claude-fable-5.1.md rather than inlining the 414 KB file, because inlining would have added 68 MB and about 104k tokens of unrelated chat-product system prompt per agent and overridden each agent's own guardrails and output contract.  
  
https://app.notion.com/p/Model-Match-partner-network-agent-added-Fable-5-1-attached-as-pointer-not-inline-3d9c1760a7498119b0a2e652e05df72b

## NotebookLM has no public API — second brain runs on Notion instead  
Decision · Active · ai-automation, ops  
  
NotebookLM (renamed Gemini Notebook in 2026) exposes no public API for creating notebooks, adding sources, or querying them. Community MCP servers for it work by browser automation or undocumented internal RPCs, so the second brain was built on Notion, which has a real supported API.  
  
https://app.notion.com/p/NotebookLM-has-no-public-API-second-brain-runs-on-Notion-instead-3d9c1760a74981b19965ff6aef7ae0d1

## Notion plan limits: no ai_search, one data source per query  
Reference · Active · ops, ai-automation  
  
This Notion workspace cannot use ai_search semantic search or query_multiple_data_sources; both need a higher plan. Keyword search and single-data-source SQL queries are what actually work, which is why the second brain is one database instead of several.  
  
https://app.notion.com/p/Notion-plan-limits-no-ai_search-one-data-source-per-query-3d9c1760a74981d592f8f370f6f89471


---

<!-- source file: references/google-drive.md -->
# FILE: references/google-drive.md

# Google Drive — what the brain can reach (catalogue + screened notes)

As of 2026-10-09. Read-only, through the claude.ai Google Drive connector on Steven's own sign-in.
Full spec and rules: `integrations/google-drive-brain.md`.

| Folder | File | What it is | Size | Last synced | Link |
|---|---|---|---|---|---|
| Second Brain | `_Second Brain index.md` | Export of the Notion Second Brain database, 69 rows (ideas, references, decisions) | 78 KB | 2026-09-22 (stale: 17 days on 2026-10-09) | https://drive.google.com/file/d/1asxPtsI6KEemVXGDPvR-wtOJlx_P6oBA/view |

The Second Brain folder: https://drive.google.com/drive/folders/1oi_c-wJ59J6KEcNnMOxzE3okYecsVkr3

## How a question uses Drive

1. `bin/brain recall` first — Drive is never level 1.
2. The Notion Second Brain database is the record; this Drive file is a copy of it. Ask Notion for the
   live row; use Drive only if Notion is unreachable, and say its age.
3. **Indexed, screened (Steven approved 2026-10-09):** `references/drive-second-brain-notes.md` holds 53 of
   the 69 rows. 13 rows tagged `personal` and 3 with client wording were left out; long numbers outside
   links are masked. Rebuild after a new export: read the file through the connector, then
   `python3 -I integrations/google-drive/redact_export.py <saved export> references/drive-second-brain-notes.md`
   and `bin/brain reindex`. The screen prints counts only.

## Rules

Read-only — nothing writes to Drive. No client personal data into the brain, the vector index or the
knowledge graph. Scope stays this one folder. Anything learned from it goes through the Sunday review gate.


---

<!-- source file: references/index.md -->
# FILE: references/index.md

# References — the register of source documents

This is a **register, not a library.** It records what a source is, where it lives and how current it
is. It never holds the content. A page here is a pointer plus enough description that a router can
decide whether opening the source is worth the tokens.

## Playbooks (digitised, 2026.1 editions, ~1,700 pages combined)

| Source | Pages | What it decides |
|---|---|---|
| The Ultimate Mortgage Broker SOP | 221 | The ARIVE-platform loan flow, end to end |
| The VA Loan Mastery Playbook | 362 | VA deal structuring — the core of the book of business |
| The Complete Loan Programs Mastery Playbook | 526 | Program-selection decision trees |
| The Ultimate Realtor Playbook | 602 | The SPACE / LPT operating manual |

Only extracted content is on the deck. These are the **primary** source for any program or process
question — cite the playbook and the chapter, and say when you are working from the deck's extract
rather than the full document.

## Live systems (pointers, not stores)

| System | What it is | Where its state is reported |
|---|---|---|
| Command Deck | The dashboard artifact | `projects/command-deck.md` |
| ISA Portal | The ISA-facing artifact | `projects/isa-portal.md` |
| Obsidian vault | Visual layer + Jarvis's index source (`50-AI-Team`, `60-Knowledge`, `70-Briefs`) | `OPTIMIZATION.md` |
| Notion Second Brain DB | **The record.** Synced by `brain-deck-sync` | `always-on/README.md` |
| Company Brain Blueprint (AI Horizon flyer, Drive) | Files → vector → entity graph → cache → agents; mapped layer by layer to this brain, with the one-department build challenge answered | `references/company-brain-blueprint.md` |
| Google Drive "Second Brain" folder | Read-only mirror of the Notion DB (1 file, synced 2026-09-22), reached through the claude.ai connector | `references/google-drive.md` |
| Jarvis (OpenJarvis `memory.db`) | Local index + on-device voice; verify with `integrations/jarvis/jarvis-setup.sh` | `integrations/jarvis/README.md` |
| Graphify | The knowledge graph in `vault/60-Knowledge` | `knowledge-graph/README.md` |
| Ruflo | Research-and-memory bench; weekly graph summaries | `OPTIMIZATION.md` |

## External directories (pointers only)

| Source | What it is | How current | Why you would open it |
|---|---|---|---|
| openalternative.co/alternatives/ | A public directory of open-source alternatives to commercial software (Steven's description; site egress-blocked from the cloud on 2026-09-22, not yet read) | Live site, unverified | When a paid SaaS comes up for renewal, or CTO Innovator wants a self-hosted option. Nothing to install. |

## Tools and candidates (2026-09-28)

Same four facts as any other row here — **no content copied, pointers only.**

| Source | What it is | How current | Why you would open it |
|---|---|---|---|
| **Laya** | `integrations/laya/` in this repo (the built package); upstream `github.com/NandhaKishorM/laya` (Apache-2.0, Convai Innovations), docs at `nandhakishorm.github.io/laya`, model `convaiinnovations/laya` on Hugging Face | 0.3.21, cloned `$S/r11/laya` 2026-09-28; **installed and proven in the R11 sandbox only — not on the Mac.** Hugging Face is blocked from this sandbox; see `integrations/laya/README.md` | Before changing `router-questions.json` or `laya_route.py`, or before running `integrations/laya/install.sh` on the Mac |
| **Orca** | `github.com/stablyai/orca` (MIT) — "the AI Orchestrator": runs Claude Code and Codex side by side in worktrees, with an iOS/Android **mobile companion** to monitor and steer agents | Mac reports **v1.4.220 — unverified from the cloud** (its own 2026-10-05 snapshot; v1.4.203 on 2026-09-16) (F-V2-23; confirm with Section 3 of `integrations/mac-fix-all-2026-10-05.md` — `./mac-verify.sh` has no Orca check) | Before wiring the mobile companion as the phone view for parallel sub-agents — see `OPTIMIZATION.md`'s dispatch layer and `REMOTE-ACCESS.md` |
| **77 Skills** (77skills.ai) | 77 business-principle skills as Markdown, packaged for Claude Code; **one-time purchase, no subscription** | **Candidate only, 2026-09-28.** `77skills.ai` is egress-blocked from this sandbox — not read, contents unverified | Only after Steven decides to buy it (**HALT: spends money**); then `skills-refresh` plus an ECC security review, before anything from it is enabled |
## Research notes (internal)
| `references/memory-projects.md` | Read of four open-source memory/knowledge projects (Karpathy's LLM-wiki gist, qmd, gbrain, Graphify) against this repo's five levels — steal/skip calls, not a library | Written 2026-09-27, one-time research pass | Before extending `vector-index/`, `knowledge-graph/` or the `brain/` retrieval engine's ingest/lint verbs — see what's already proven elsewhere first |

## Registering a source

One row, four facts: **what it is · where it lives · how current · why you would open it.** If you
cannot write the last one in a clause, it does not need registering.

## Rules

- **No content is copied here.** A register that grows content becomes a fourth copy to maintain.
- **No credentials, no URLs with tokens, no account identifiers.** Name the system; the key lives in
  the Mac keychain or a `.env` that is never read into a prompt.
- **Version and date everything.** "2026.1 edition" and "synced 2026-08-28" are part of the fact.
- A source that nothing has opened in a quarter gets a note, not a deletion — knowing something is
  unused is itself useful to the weekly loop.

## Engineering conventions

| Source | What it decides |
|---|---|
| `vibe-coding-learning.md` | awesome-vibe-coding (CC0 list + dictionary + skills shelf) and Easy-Vibe (CC BY-NC-SA four-stage curriculum), read online, cited by the engineers |
| `../integrations/code-validation/vibebreaker/` | VibeBreaker 20-pass adversarial audit protocol (MIT, vendored 2026-10-12) — the code-validator agent's method |
| `backend-folder-structure.md` | The eight-layer backend layout (config, models, middlewares, controllers, services, routes, utils, tests) every service follows; `bin/brain layout` checks the brain against it |
| `../integrations/openmontage/README.md` | OpenMontage, the agentic video studio installed on the Mac 2026-10-12 (skill `openmontage-video`) |
| NotebookLM source pack | `integrations/notebooklm/README.md` | the brain as 13 uploadable sources; `bin/brain export notebooklm` |


---

<!-- source file: references/memory-projects.md -->
# FILE: references/memory-projects.md

# Memory projects — what's proven, what to steal, what to skip

Principle 2 of Steven's guide: stand on proven shoulders before inventing a mechanism this repo
already needs. Four open-source memory/knowledge projects, read from their real README/code
(sources noted per project — one was read via the gist page's own rendering, not a raw fetch,
because `gist.githubusercontent.com` is egress-blocked from this session; the other three were
verified against a fresh `git clone --depth 1` of the actual repo, not a summarized fetch alone).
Context this maps against: the deterministic retrieval engine going into `brain/` in parallel
(keyword → INDEX.md score, no file opens → open one file → best section → one pointer hop → model
once, then `bin/brain remember` to write back) and the five levels this router (`CLAUDE.md`)
already defines: L1 router, L2 wiki + `memory.md`, L3 `vector-index/`, L4 `knowledge-graph/`,
L5 `always-on/`.

---

## 1. Karpathy's LLM wiki (gist, plain markdown)

**Read:** the gist's own page (rendered markdown), not the raw file — raw gist fetches are
blocked from this session, so treat this as read-but-not-quoted-verbatim.

**What it actually does:** no code at all — it's a pattern description. An LLM maintains a
small, hand-written-by-the-model wiki of markdown pages instead of re-retrieving raw source
documents every time. Three layers: **raw sources** (immutable, the LLM reads but never edits
them), **the wiki** (entity/concept pages the LLM writes and revises), and **the schema** (a
doc describing the wiki's own conventions). The workflow has three verbs: **ingest** (a new
source updates 10–15 existing pages and flags contradictions), **query** (answer from wiki
pages, cite them, and good answers can themselves become new pages), and **lint** (a periodic
pass for stale claims, orphan pages, missing cross-refs). The pitch: humans let wikis rot because
the bookkeeping is tedious; an LLM's bookkeeping cost is near zero, so knowledge compounds instead
of scattering across chat history.

**Steal:**
- The **ingest verb literally is `bin/brain remember`** — this repo already committed to the
  same shape (a session writes what it learned back into the wiki/memory, not just reads it).
  Make ingest explicitly rewrite 10–15 *existing* pages when relevant, not just append a new one —
  that's the compounding mechanism, not the appending.
- **Lint as a scheduled pass**, not a one-off: this repo has no periodic "find orphan wiki pages /
  stale claims / missing index lines" job. `brain-weekly-verify` (already named in `AGENTS.md`)
  is the natural home for it.

**Skip:** the gist has no retrieval engine, no scoring, no code — it's a philosophy of *what a
wiki is for*, not *how to search it fast*. This repo's `brain/` already goes further (deterministic
scoring before any file open). Don't import "the LLM decides what's relevant" as a replacement for
that determinism; use the gist only for the write-back shape.

**Maps to:** L2 (`wiki/` + `memory.md`) almost exactly — this repo's L2 already *is* Karpathy's
wiki layer. The gap is L2's lint/compounding discipline, not its existence.

---

## 2. qmd — Tobi Lütke (`github.com/tobi/qmd`, cloned and read `README.md` directly, 1383 lines)

**What it actually does:** a local, on-device hybrid search engine over markdown notes, meeting
transcripts and docs. Pipeline (its own README diagram): a query is expanded into typed
sub-queries — `lex` (BM25 keyword variants), `vec` (dense semantic variants), `hyde` (a
hypothetical-answer expansion) — routed so lexical expansions only ever hit BM25/FTS5 and
semantic expansions only ever hit the vector index, both run in parallel, fused with **Reciprocal
Rank Fusion**, then the top candidates go through an **LLM reranker**. All three models
(embedding, reranking, expansion) are local GGUF models via `node-llama-cpp` — nothing leaves the
machine. A distinctive feature: `qmd context add <collection> "<description>"` attaches
hand-written context to a whole collection or path, which every match under it returns alongside
the hit — the README calls this "the key feature… don't sleep on it," because it gives an LLM
caller the *scope* of a hit, not just its text.

**Steal:**
- **The `context add` idea** — a one-line, hand-written description attached to a directory/
  collection, returned with every hit from under it. This repo's `references/index.md` already
  does something close (one line per source), but `vector-index/` and `knowledge-graph/` don't
  yet attach a per-collection description to their own chunks; worth doing before either grows.
- **Typed query routing** (lexical → keyword engine, semantic → vector engine, never cross-fed)
  is the right shape for `brain/`'s "keyword → score from INDEX.md" step if a semantic layer is
  ever added on top of it — keep the two paths separate rather than blending them into one score.

**Skip:** the local-GGUF-model stack (embedding + reranker + expansion models, `node-llama-cpp`)
is real infrastructure to run and maintain — a bigger bet than this repo's `brain/` needs today,
which is deliberately zero-model until the last step ("model once"). RRF fusion across two engines
only pays for itself once there are two engines; don't build it speculatively.

**Maps to:** L3 (`vector-index/`) is qmd's whole territory. If `vector-index/` ever needs semantic
search over a large corpus, qmd's architecture (not necessarily its code) is the reference design.

---

## 3. gbrain — Garry Tan (`github.com/garrytan/gbrain`, cloned and read `README.md` directly,
455 lines)

**What it actually does:** a personal-agent memory system ("give the agent you already use a
memory you control"), Bun-based, **not** on npm (its README explicitly warns the npm package
named `gbrain` is unrelated). Two axes: "brains" (databases — PGLite/Postgres+pgvector) and
"sources" (repositories inside a brain). Two optional layers on top of plain keyword/semantic
retrieval: a **synthesis layer** that returns actual cited prose instead of a list of chunks —
its README's worked example answers "what do I need to know before my meeting with Alice" with a
paragraph, three open items, and a citation per claim, plus an explicit **gap-analysis line**
("nothing's been added to the brain about Alice since April 22 — she may have replied through a
channel the brain doesn't see") — and a **typed knowledge graph** used for relationship queries
("who works at acme-example?"). The self-cleaning claim in the task prompt is real: background
cron jobs run "deduplication, citation fixes, and contradiction detection" overnight, and trusted
local writes auto-extract graph edges without an LLM call.

**Steal:**
- **The gap-analysis line.** Every synthesized answer names what it does *not* know and why (a
  channel the brain doesn't see, a stale source) instead of silently answering from what it has.
  This repo's HALT rules already say "report staleness instead of guessing" — gbrain's move is to
  make that a *visible line in every answer*, not just a rule to remember. Cheap to adopt at L2/L4
  synthesis time.
- **Cited synthesis over raw chunks** is the difference between `brain/`'s "open one file → best
  section" step and something a person can actually read — worth keeping that step's *output*
  framed as an answer-with-citation, not a pasted section.

**Skip:** the whole database-and-cron-daemon architecture (PGLite/Postgres, 66 cron jobs, a
155,795-page production brain) is built for Garry Tan's scale and multi-agent sharing model. This
repo's HALT rules explicitly forbid an always-on daemon making unreviewed writes to shared state
("Editing a live system prompt, a live task… outside an assigned region") — gbrain's autonomous
overnight consolidation is the opposite trust model from this repo's L1→L2→L3 graduation rule.
Don't import the daemon; import the *shape* of what it produces.

**Maps to:** L4 (`knowledge-graph/`) for the typed-graph piece, and the synthesis layer maps
across L2–L4 wherever this repo answers instead of pointing.

---

## 4. Graphify — (`github.com/safishamsi/graphify`, cloned; resolves to the `Graphify-Labs/graphify`
README, read directly, 962 lines) — **already installed** as a Claude Code skill building Steven's
Obsidian vault's knowledge graph

**What it actually does:** `/graphify .` maps a project (code, docs, PDFs, images, video) into a
knowledge graph instead of a set of files to grep. Code is parsed with **tree-sitter AST** —
deterministic, no LLM, nothing leaves the machine; docs/PDFs/images/video get a semantic pass from
the calling assistant's own model. Every edge is tagged **`EXTRACTED`** (found directly in the
source) or **`INFERRED`** (resolved by graphify) — the README's own framing: "you can tell what
was read directly from what was inferred." Explicitly **not a vector index** — no embeddings, a
real graph you traverse (shortest-path queries between two concepts, `graphify explain "X"`).
Output is three files: `graph.html` (interactive, force-directed), `GRAPH_REPORT.md` (key
concepts, surprising connections, suggested questions), `graph.json` (queryable without
re-reading source files) — and the README claims 71.5x fewer tokens per query on larger corpora
versus reading raw files.

**Steal:**
- **`EXTRACTED` vs `INFERRED` edge tagging** is the single most portable idea here, and directly
  fixable in this repo's own `knowledge-graph/` today regardless of Graphify's code: any edge this
  repo's L4 records should say whether a source stated the relationship or an agent inferred it.
  Right now `knowledge-graph/schema.md` (not read in this pass — out of scope, but worth a follow-
  up check) should be checked for this distinction if it doesn't already have it.
- **The graph is already there in Graphify's own framing** — "notes already form a graph; use the
  links" (the task's own note). Since Graphify is already running against Steven's Obsidian vault
  producing `graph.json`, the practical move for `brain/`'s "one pointer hop" step is to let it
  *read* Graphify's existing `graph.json` for a cheap, deterministic hop between two named entities
  — no new extraction, just reusing an artifact this repo's toolchain already produces weekly.

**Skip:** don't stand up a second, competing graph builder inside `brain/` — Graphify already runs
this job for the vault. Re-implementing tree-sitter/NetworkX/Leiden extraction inside `brain/`
would duplicate what's already scheduled and maintained.

**Maps to:** L4 (`knowledge-graph/`) directly — Graphify is the working implementation of this
level for the vault side; `brain/`'s pointer-hop step should consume its output rather than
re-deriving it.

---

## One line per level

| Level | What's already proven elsewhere that applies |
|---|---|
| L1 router | None of the four touch this — it's this repo's own invention (a router that holds no facts). |
| L2 wiki + `memory.md` | Karpathy's ingest/query/lint verbs; gbrain's gap-analysis line on synthesis. |
| L3 `vector-index/` | qmd's typed-expansion, two-engines-never-cross-fed design, if/when this repo needs semantic search over volume. |
| L4 `knowledge-graph/` | Graphify's `EXTRACTED`/`INFERRED` tagging, and reusing its `graph.json` rather than re-building one; gbrain's typed-graph relationship queries as a longer-term stretch. |
| L5 `always-on/` | gbrain's cron-based self-cleaning is the cautionary example, not the model — this repo's trust-graduation rule (L1→L2→L3, 7 clean runs) is the deliberate opposite of gbrain's always-write daemon. |

**Honesty note:** all four sources were read from their actual README/gist content (three via a
fresh clone, one via the gist's rendered page since the raw file is egress-blocked). No claim
above is from training-data memory of these projects; where a repo redirected (`safishamsi/graphify`
resolves to `Graphify-Labs/graphify`'s content) that's noted rather than silently treated as the
same thing.


---

<!-- source file: references/vibe-coding-learning.md -->
# FILE: references/vibe-coding-learning.md

# Vibe-coding learning shelf — awesome-vibe-coding and Easy-Vibe (recorded 2026-10-12)

Two reading resources Steven asked to install on 2026-10-12. Neither is a tool; both are registers of knowledge, so
they live here as pointers (the references rule: a register, not a library) and the engineers cite them by section.

## awesome-vibe-coding (awesome-vibe-coding/awesome-vibe-coding, CC0, commit 46d0f0d, 2026-08-13)
A curated list plus a Hugo site: web builders (Bolt, Lovable, v0), editors and IDEs, CLI tools, task management,
monitoring and cost tracking, and three parts worth the engineers' time:
- `content/dictionary/` — 27 one-page definitions (agent skill, agentic loop, context rot, context window, diff review,
  git worktree, headless mode, MCP, plan mode, prompt caching, prompt injection, repo map, RAG, sandboxing, subagent,
  tool use). The brain's encyclopedia uses the same vocabulary; cite the dictionary page when a term is new to Steven.
- `content/skills/` — 70 packaged skills (Anthropic's open skill standard, AWS skills, brand guidelines, canvas design,
  artifacts builder). Any pick goes through `integrations/skill-packs/` vetting first; nothing here is auto-installed.
- `content/mcp-servers/` and `content/tools/` — the comparison shelf for Nadia's tooling calls.
Read online: https://github.com/awesome-vibe-coding/awesome-vibe-coding (clone is 1.7 MB, safe to pull on the Mac).

## Easy-Vibe (datawhalechina/easy-vibe, CC BY-NC-SA 4.0, commit 130e9b7, 2026-08-25)
A ten-language curriculum "from first idea to real product", four stages: I beginner (AI tools, finding ideas,
prototypes, integrating AI, a complete project; appendices on product thinking, user research — Double Diamond, Jobs
to Be Done, the Mom Test — and common errors); II junior/mid developer (frontend: Figma/MasterGo, UI design, component
libraries, design-to-code; backend: databases, deployment); III senior (cross-platform: mini-programs, Android, MCP);
plus "vibe stories". 1.1 GB with images, so it is read online, not cloned: https://datawhalechina.github.io/easy-vibe/welcome.html
(English path `/en/`). Non-commercial license: fine for Steven's own learning and for the team's internal study plan;
not for resale or client training material.

## How the team uses them
- Steven's own study order: Easy-Vibe stage I → the awesome dictionary → Easy-Vibe stage II backend, alongside
  `references/backend-folder-structure.md`.
- Engineers (Derek's and Elon's seats) cite the dictionary for definitions and the Easy-Vibe appendix "What to do if
  you encounter errors" in debugging packets; the code-validation gate (`.claude/skills/code-validation-gate`) is
  what turns "it works" into evidence.
