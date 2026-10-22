# Drive Second Brain notes (screened)

Steven's Notion Second Brain rows as exported to Google Drive, synced 2026-09-22. Screened by `integrations/google-drive/redact_export.py`: 53 of 69 rows kept; client-tagged rows left out; emails, phones and long numbers masked. The Notion database is the record — these are a dated copy. Source: `references/google-drive.md`.

## The pasted five-level second-brain framework (router, wikis, vector search, knowledge graphs, autonomous brain) already has a named, running counterpart at every level — the open gap is whether Jarvis is ever used for a task that needs full context  
Reference · Inbox · ai-automation, ops  
  
Steven pasted a five-level second-brain framework (Router Foundation, Wikis + Auto-Memory, Semantic/Vector Search, Knowledge Graphs, Always-On Autonomous Brain) on 2026-09-22 and asked to incorporate it; mapped level by level it already has a running counterpart (vanessa-orchestrator, Second Brain + vault, Jarvis, Graphify, skills-refresh-weekly) so this is a reconciliation, not new build work. Search terms: five level framework, router foundation, wikis auto-memory, vector search, knowledge graphs, always-on autonomous brain, Gbrain, Nate Herk, framework mapping, second brain maturity, Jarvis full context gap.  
  
https://app.notion.com/p/The-pasted-five-level-second-brain-framework-router-wikis-vector-search-knowledge-graphs-autono-3e3c1760a74981059ea6ec4d2b61aad5

## Free mode fails closed: the guard blocks whole folders (vault, ~/.config, Google Drive, health, transcripts) and refuses anything it cannot screen  
Reference · Inbox · ai-automation, ops, compliance  
  
Claude free mode (claude-auto, OmniRoute, free third-party models) is guarded by ~/Applications/claude-fallback/free_mode_guard.py. Rebuilt 2026-09-13 after a stress sweep found it failing open: it now blocks whole roots instead of leaf folders so a glob, a wildcard, $HOME, a url-encoded or relative path or a symlink cannot step around it; blocks when the hook input is unreadable, when redact.py is missing, or when the environment drifted off the free-only OmniRoute combo; and refuses an OmniRoute base URL without the free-mode flag. If free mode blocks a command, that is the guard working: rephrase without client, financial or health data, or wait for the subscription. Search terms: free mode blocked, why is free mode refusing, guard hook, claude-auto, OmniRoute, off limits folder, fails closed, environment drifted.  
  
https://app.notion.com/p/Free-mode-fails-closed-the-guard-blocks-whole-folders-vault-config-Google-Drive-health-tran-3dac1760a7498165952fd621198b9bfc

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
