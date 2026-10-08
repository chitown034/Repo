# Task catalog

The Mac's scheduled tasks under `claude-runner` — headless, pre-approved tools — and how to read whether one actually did its job. For the status vocabulary itself see `wiki/dashboard-ops/index.md`'s "one rule."

## Daily rhythm (PT)

Weather + news refresh (morning and evening) · incentives scan · lead triage ahead of the ISA's noon huddle · Vanessa's sweep and Steve's sweep (weekdays, back to back) · showing sync (three times a day, Mon–Sat) · the ISA comms bridge (hourly through the workday) · the research queue (hourly through the workday) · brain-deck-sync (hourly through the workday) · the local-bridge queue (hourly) · the iMessage inbox check (every 10 minutes).

## Weekly / monthly / gated rhythm

Coach's weekly coaching recommendations (Monday) · Vanessa's ops review (Friday night, executives in parallel) · the engineering self-update loop (Friday night: audit → verify last week's builds → capped proposals, human-in-the-loop) · the week-in-review (Friday night) · loop-engineering-weekly (Saturday) · ops-knowledge-graph rebuild (Sunday) · skills-refresh (Sunday) · the weekly backup (Sunday) · access & credential audit (1st of the month) · month-end close prep (28th).

**Read this list as the schedule, not a record of what has run.** Several of these slots have a documented history of never completing under the runner — always check the current `runnerStatus` doc for the real per-task history before repeating a task's schedule as if it were a completion.

## How to read a task's status — never take "ok" at face value

Per `wiki/dashboard-ops/index.md`'s rule, every task's status is one of: `ok, last <date/time>` · `failed <date>: <reason>` · `limited` · `refused` (a tool or path was not on the runner's allow-list) · `never run under the runner`. A task reporting `ok` still needs its target document's own stamp checked (`wiki/dashboard-ops/db-docs.md`) — a silent no-write success is a documented failure mode here, not a hypothetical one.

## What pins a task to the Mac specifically

Anything needing local files, the local model, or the keychain must run under `claude-runner` on the Mac — it cannot run as a cloud routine. **If the Mac is asleep, none of this runs.** That is the single biggest availability risk in this whole automation layer; see `always-on/README.md` for the full picture.

## Where the live table actually is

The per-task cron expression, last-write target, and current status are read from `runnerStatus` at its own sync stamp — this page describes the categories and the rhythm, not a maintained row-by-row table, because that table drifts within the same day it's written. Ask the doc.

## See also

- `wiki/dashboard-ops/routine-catalog.md` — the cloud-side equivalent, and what a routine still cannot do that a Mac task can.
- `wiki/dashboard-ops/db-docs.md` — how to verify a task's claimed write actually happened.

Source: Command Deck, "Mac scheduled tasks" toolbox card (`AI_TEAM_TOOLBOX`) and `runnerStatus` doc structure as read via `projects/command-deck.md`.
