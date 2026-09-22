# L5 — Always-on

What keeps the brain current while nobody is watching. Everything here runs under **`claude-runner`**
on the Mac (headless, pre-approved tools, 60 tasks).

**Status source:** the `runnerStatus` doc, `syncedAt 2026-09-22T04:05:04Z`. Crons are Mac local (PT).
"Last end" is the last completion the runner recorded — **not** proof that today's slot ran.

## The brain's own tasks

| Task | Cron (PT) | Does | Last end | Status |
|---|---|---|---|---|
| `brain-deck-sync` | `20 7-22 * * *` — hourly :20, 7 AM–10 PM | Copies every Second Brain row (name, summary, type, status, tags, link) from Notion into the deck's `secondBrain` doc | 2026-09-21 20:24 | **ok** |
| `brain-learn-daily` | `50 22 * * *` — 10:50 PM daily | Distills Steven's own words (chat transcripts) and the Drive "Second Brain" folder into Second Brain rows; flagged items wait for review | 2026-09-15 22:56 | **ok, but no completion recorded since 2026-09-15** |
| `brain-weekly-verify` | `0 16 * * 0` — **Sunday 4:00 PM** | The **review gate**: what the brain learned this week (Notion Inbox rows) plus the sensitive items held back; re-indexes the vault | 2026-09-14 02:34 | **ok** |
| `fabric-deck-sync` | `5 7-21/2 * * *` — every 2 h at :05, 7 AM–9 PM | Counts every store (Second Brain rows, vault notes, Jarvis docs, graph nodes, Ruflo entries) into the deck's knowledge-fabric tiles | 2026-09-21 19:58 | **error** (was mid-run at the 04:05 snapshot) |
| `ops-knowledge-graph` | `45 5 * * 0` — Sunday 5:45 AM | Graphs the dashboard export, playbooks, decisions and agent roster into the vault | — | **never run under the runner** |

## The self-improvement pair

| Task | Cron (PT) | Does | Last end | Status |
|---|---|---|---|---|
| `loop-engineering-weekly` | `30 4 * * 6` — Saturday 4:30 AM | The full cycle: nine parallel audit passes, Nadia's disruption brief, the CTO Innovator's feasibility gate, the CPI and Scale logs | — | **never run under the runner** |
| `nightly-self-test` | `0 23 * * *` — 11:00 PM daily | Functional + integration check across every skill, task, agent and connector; self-heals routine breakage | 2026-09-15 23:32 | **error — timeout, exit 124** |

## Tasks the brain depends on

| Task | Cron (PT) | Why the brain cares | Status |
|---|---|---|---|
| `vanessa-research-queue` | `30 7-21 * * *` — hourly :30 | Answers queued research (recall level 3) with Perplexity + the AI team | **ok**, 2026-09-21 20:31 |
| `local-bridge-queue` | `25 6-21 * * *` — hourly :25 | Runs queued read-only verbs through the local bridge allow-list | **ok**, 2026-09-21 20:25 |
| `toolkit-deck-sync` | `15 6 * * *` — 6:15 AM | Rebuilds `toolkitSnapshot` (tools, agents, skills, tasks, MCP servers) | **limited**, 2026-09-16 17:59 |
| `skills-refresh-weekly` | `0 7 * * 0` — Sunday 7:00 AM | Audits every SKILL.md for bad frontmatter and dead paths | **never run** |
| `steve-twin-sweep` | `55 12 * * 1-5` — weekdays 12:55 PM | Twin work; writes into the vault | **refused** — Bash write to `~/Shearrill-Vault` not allow-listed |
| `r6-weekly-backup` | `0 5 * * 0` — Sunday 5:00 AM | Backs up both stores + redacted config + findings | **never run**; missed Sep 20 |

## The Sunday review gate

`brain-weekly-verify` is the only path by which something the brain learned becomes something the
brain asserts. It presents: what was learned this week, and **what was held back because it was
flagged sensitive**. Steven approves or rejects. Nothing sensitive moves to Notion, to the wiki, or
into the graph without passing through it. If the gate has not run, learnings **queue** — they do not
promote themselves.

## The uptime bound — say it out loud

**Everything on this page is bounded by the Mac being awake and logged in.** `claude-runner` is
headless, but it is still a process on one laptop. If the Mac sleeps, none of this runs, no doc gets
a new stamp, and the deck keeps showing yesterday's numbers with yesterday's timestamp. That is the
single largest availability risk in the brain, and it is why every recall reports the age of what it
returns rather than assuming freshness.

Cloud routines are **not** a fallback: an unattended cloud run's artifact-DB write parks on a
permission prompt (confirmed three times), so cloud routines are research-only by design.

## What the weekly loop must check here

Recall hit rate · cache hit % · tokens per answer · **stale-store alerts** (a store whose `builtAt`
or `syncedAt` is older than its own cadence). See `OPTIMIZATION.md`.
