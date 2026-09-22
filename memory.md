# memory.md — auto-memory scaffold

**Empty on purpose.** This file is the Claude Code auto-memory store for the Second Brain project.
It fills itself as sessions run. Do not seed it with facts that belong in the wiki, in
`context/decisions.md`, or in a live DB doc.

## Turning it on

- Claude Code: `/memory on` in the project. Claude then appends here itself.
- **Codex and other agents do not get it automatically.** `AGENTS.md` instructs them to read this
  file explicitly at the start of every task.

## What goes in

One dated line each, newest at the bottom:

- A durable preference. *"Steven wants staleness stated before the number, not after."*
- A correction that must not be repeated. *"Every deck doc is `{v:…}` — no exceptions. `stravaSnapshot`
  was written bare until 2026-09-22; readers tolerate both shapes, but never write the bare shape."*
- A routing shortcut learned the hard way. *"Lead-count questions: `loftyLeads`, not the deck panel."*
- A dead end worth remembering. *"clianything.cc is egress-blocked from the sandbox."*

## What does NOT go in

| Not this | It belongs in |
|---|---|
| A decision Steven made | `context/decisions.md` (dated entry) |
| Topic knowledge | `wiki/<topic>/` |
| A live number or status | The DB doc that owns it |
| A client fact | `wiki/clients/<client>.md`, on the Mac, full context |
| A credential, key, account number | **Nowhere.** Mac keychain or `.env`. |

## Hygiene

- **Append, never edit.** A superseded line gets a new line that says it is superseded.
- One line per entry, dated `YYYY-MM-DD`. If it needs a paragraph, it is a wiki page.
- **Cap: 100 lines.** At the cap, `brain-weekly-verify` promotes the durable lines into the wiki and
  prunes the rest. Memory that grows without a cap quietly becomes the most expensive file loaded on
  every single task.
- Anything sensitive waits for the Sunday review gate. Never straight to Notion.

---

## Entries

<!-- 2026-09-22 — scaffold created; no entries yet. Append below this line. -->
