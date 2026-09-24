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

- 2026-09-23 — A cloud routine **can** write the artifact DB unattended. The old "it parks on a permission prompt" rule was true when last tested 2026-09-04 and is false since 2026-09-22; `cloudWriteProbe` settles it and four cloud writers run on it. Do not refuse a write on the old rule.
- 2026-09-23 — `cloudWriteProbe` **does** carry a write time: `updatedAt` sits on the document envelope, not inside `v`. A finding that says it has no timestamp has read only the body. Same trap for every doc: `get` shows the envelope, an export of `v` does not.
- 2026-09-23 — There are **18** browser recipes across the five DOMShell harnesses (homes 3, ShowingTime 4, Showami 4, SkySlope 4, zipForms 3) but **20** `verified:false` flags — SkySlope and zipForms each carry a file-level `verified` key as well as one per recipe. Counting flags and calling it recipes has now produced the same wrong finding twice.
- 2026-09-23 — Graphify is **dual-licensed Apache-2.0 OR MIT** (PyPI `graphifyy` 0.9.66 `license_expression: Apache-2.0`; upstream ships `LICENSE`, `LICENSE-MIT` and `NOTICE`). It is pip-installed, not vendored, so there is no NOTICE obligation. Closed — do not reopen.
- 2026-09-23 — Full client names stay on the Command Deck lead board by Steven's own decision (dated entry in `context/decisions.md`). The scope is **a name and a stage and nothing else**, and it does not extend to any other surface, the ISA Portal included.
- 2026-09-23 — "Task ok" is not "document written". `openrouter-feeds-refresh` reported `ok` while `openrouterFeeds` sat frozen from 2026-09-13. Always judge a feed by the document's own stamp.
- 2026-09-23 — `runnerStatus` lists **59** tasks, not 60, and `state` held **175** documents at 03:10 UTC. The 161-document figure across this cycle's audit is the 2026-09-22 08:10 UTC export, not a current count.
- 2026-09-24 — **Binary never goes through a model's tool call.** A 27-second voice clip is 108,284 bytes, 144,380 base64 characters and **135,424 tokens** — measured, not estimated (the Read tool reported it). Any spec that says "pass the base64 of the file as `data`" cannot work beyond a few KB, however well its size-limit arithmetic checks out. Save to disk with `ArtifactData get` + `out_dir` (or `set` + `file_path` the other way) and let a script move the bytes. The first `mac-task-specs.md` §6b broke this and reached Steven's runbook; §6c still does and is marked do-not-paste.
- 2026-09-24 — Inkbox has a real key-based API. `@inkbox/cli` and the `inkbox` Python SDK 0.7.7 (MIT) authenticate with `INKBOX_API_KEY` or `api_key = …` in `~/.inkbox/config` (sent as `X-API-Key`). `upload_imessage_media(content=bytes)` returns an **Inkbox-hosted** `media_url`, which `send_imessage(conversation_id=, media_urls=[…])` attaches. That sidesteps the "Inkbox cannot fetch a private claude.ai URL" wall entirely. inkbox.ai itself is egress-blocked from cloud sessions; PyPI and npm are not, so read the SDK source instead of the docs.
- 2026-09-24 — A "reconnect Follow Up Boss" line in any brief means `r2-lead-response-watchdog`'s **Mac prompt still targets the retired CRM**, not that anything should be reconnected. `leadResponse` was rewritten at 2026-09-24T02:43Z with `source: "Follow Up Boss via Composio"`, failed, 8th consecutive time.
- 2026-09-24 — **Two cloud routines are named "Pipeline Sync"; only one moves data.** `trig_01M5zR1Po44gnHvTwA9ogZaB` (live, 04/10/16/22 UTC) carries `reClients`, `pipeline`, `isaScorecard`, `isaGradingScores`, `isaKpiSopActuals` both ways and logs `pipeline-sync — ok` rows in the deck's `ciLog`; `trig_018BSAYiYzvtyaUkpAY4SnqE` (old, web-UI) is research-only and moves nothing. The ISA Portal's Sync status panel denied the live one until R5 (2026-09-24) — check `ciLog`, not either routine's green tick.
- 2026-09-24 — **Publishing the ISA Portal needs the whole live page read first** (4,874 lines ≈ 180k tokens in ~10 reads of ≤25k tokens). Plan chunk sizes by bytes (≈0.4 tokens/byte), and batch every portal change into one publish.
- 2026-09-24 — **A test must name its temp repo when the script under test finds its repo from its own location.** `mac-sync-tests.sh` C4 called the real `mac-sync.sh pull` bare and ran a real `git pull --rebase --autostash` on the cloud checkout (aborted, nothing lost). Guard now: a non-existent repo path exported by default, plus a section that fails the run if the host repo's HEAD, reflog, stash or rebase state changed.
- 2026-09-24 — **Connection status is measured by one read-only call, never read from a stored row.** At 16:00 UTC Canva answered (`list-brand-kits`) while three deck rows said "needs reconnect", and You.com answered with a balance of **0 credits** — connected is not the same as usable.
- 2026-09-24 — **A Composio sign-in link dies ten minutes after it is made.** Generate it while Steven is at the keyboard; a link written into a report or a page he reads later is already dead. Say "ask for a fresh one — one call" instead.
