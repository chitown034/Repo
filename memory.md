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
- 2026-09-28 — **Eight parallel sub-agents use up the 5-hour usage window in about 50 minutes.** It happened three times in R8 (and the weekly limit once), and a stopped agent loses everything it had not committed. Run at most four at a time and have each one commit after every gated change.
- 2026-09-28 — **A refused artifact publish says what to do next; do exactly that.** Deck v157: another session had added `#brainEngineCard` to the live page, so it was merged in verbatim and then published. ISA v35: Read every line of the saved live file, diff it against your build, and if the live version is already inside it, send the same file again — the second send goes through.
- 2026-09-28 — **`.panel{content-visibility:auto}` adds paint containment.** Text that runs past a panel's edge is clipped out of sight, not absent, so the ui-browser `offscreen` check treats the panel itself as the clipper. A blank panel screenshot was the capture tool, not the page: cold panels paint on the first frame after a jump (measured), so the rule stays.
- 2026-09-28 — **A stale `runnerStatus` does not mean the Mac runner is dead.** Before calling it silent, read Vanessa's outbound iMessages (Inkbox thread, read-only): on 2026-09-28 a brief went out at 01:19 UTC while `runnerStatus` was still stamped 2026-09-24. The failing parts were the dashboard syncs and the account's usage limits, not the runner.
- 2026-09-28 — **Budget the shared usage allowance before fanning out.** Engineers, cloud routines, Mac tasks and Steven draw on one allowance; when parallel engineers plus research-only routines exhausted it (Sep 24–28), 34 of 66 routines failed and the dashboard went stale. Cap: 3 engineers at once (decisions.md 2026-09-28).
- 2026-09-28 — **Routine write paths, measured.** Agents cannot `update_trigger` a routine made in the web UI. Agent-created routines CAN write via ArtifactData — the first writer wrote at 07:43 UTC, 5 min after its session looked idle; judge a routine by its document's `updatedAt`, not its session status. `ArtifactData update` is a deep merge (shared docs like `liveFeeds` take `{v:{feeds:{key:{…}}}}`). WebSearch "current" temperatures can be yesterday's daytime values — require an observation stamped within 2 h. Routine tool results echo the prompt 3× — keep routine calls few.
- 2026-09-28 — **Routine "FAILED" with no reason = check the session.** `get_session` on the run's `session_id` shows `post_turn_summary.status_detail`; the 31 overnight failures all read "You've hit your session limit · resets 6am (UTC)" (5-hour plan limit), with fired_at == finished_at. Heavy build sessions and 69 routines share one allowance.
- 2026-09-28 — **Claude Code facts, read from the installed 2.1.283 binary:** the `opus` alias defaults to `claude-opus-5-5` since 2.1.280; settings.json `env` is applied with `Object.assign(process.env, …)`, i.e. it overrides the shell — never put a model remap there that a launcher must override.
- 2026-09-28 — **Steven's Mac session is reachable only through the Claude app**, not by SendMessage from a cloud session (ListAgents showed nothing; send failed). Mac-side work is Steven's to paste or run.
- 2026-09-28 — **Declaring the `mcp` capability on the Command Deck was denied by auto mode ("Create RCE Surface").** Do not retry it in another form; it is Steven's decision (NEEDS-STEVEN 81). The deck's LIVE DATA block (Calendar list_events + host:openterminal market_tape) stays dormant until he says yes.
- 2026-09-28 — **A routine has no clock; left alone, it makes the time up.** The first writer runs stamped news 03:59 UTC for a 13:57 write, and three `liveFeeds` notes hours in the future. Routine sessions run in auto mode (`get_session` → `permission_mode: auto`), where a read-only `date -u +%Y-%m-%dT%H:%M:%SZ` is allowed, so every writer prompt now copies that command's output. To check a stamp, compare it with the run's `last_run.fired_at`/`finished_at`. `list_triggers` rows also carry each stored prompt at `derived_state.prompt`, so they can be diffed against the repo without `get_trigger`.
- 2026-09-28 — **The cloud environment blocks every weather source** (api.open-meteo.com, api.weather.gov, wttr.in, accuweather.com: CONNECT 403). `curl -sS "$HTTPS_PROXY/__agentproxy/status"` lists each refusal under `recentRelayFailures`. Weather refreshes only through an AccuWeather connector session until Steven allows Open-Meteo and NWS (NEEDS-STEVEN 74).
- 2026-10-05 — **The usage allowance is the binding constraint, not broken routines.** The weekly allowance ran out on Oct 1, three days early; 33 cloud routines and 10 Mac tasks then stopped at startup until the Oct 4 20:00 UTC reset. `get_session` → `post_turn_summary.status_detail` names the limit ("weekly limit" / "session limit"), and `rate_limit_info.status: allowed_warning` on any run is the early warning. An agent cannot switch off a routine Steven made ("Agents can only update routines they created"). The error says a routine's own session may disable itself, but steering it there with `fire_trigger` text would launder a refused action — don't; give Steven the direct `claude.ai/code/routines/<id>` links.
- 2026-10-05 — **The Mac runner is alive and writes some of the same documents as the cloud writers:** `weather-news-refresh` (8:05 AM/PM PT, weather via wttr.in) → `weatherSnapshot`/`newsSnapshot`; `openrouter-feeds-refresh` (~6 AM PT) → `econodayLiveList` and five other feeds; a nightly task → `eliteAffluentLiveList`. `runnerStatus.tasks[].lastEnd` is Mac local time (no `Z`). The cloud writers for those three now run only as backups, after a freshness check.
- 2026-10-05 — **Other sessions publish the Command Deck too** (v161 became version 1791212583-fbf2 on Oct 4: +30 KB, a Military Base card, Apple-refine CSS, a corrected weather note). Before any publish, read the live page to a file (`Artifact read`, `path: index.html`) and diff it against the master; build on the live version, never over it.
- 2026-10-05 — **Perplexity is gone; the Claude cloud writers are the primary writers again** (Steven: *"remove everything running on Perplexity and replace with Claude subscription"*). This reverses the "backups" sentence two lines up. The Mac's duplicate feed tasks get paused by Steven's paste-in (`integrations/mac-claude-only.md`). Weather is the exception: the Mac's wttr.in task keeps it until Open-Meteo/NWS are allowed or a UI-made routine carries the AccuWeather connector.
- 2026-10-05 — **The ISA Portal gets the deck's live notes by copy, never by read:** the builder-incentives writer and the morning weather & news run send their identical entries to the ISA's own `liveFeeds` doc right after writing the deck (ISA v39 renders them). To mirror another feed, change that feed's writer prompt as well as the page.
- 2026-10-05 — **After a refused publish, the live version counts as "viewed" only once every line of the saved copy has been Read** (≈46 KB per Read stays under the limit). Being byte-identical to your own base is not enough; read it all, then republish your merged file.
- 2026-10-05 — **The cloud backup moves its export through files** (`list … out_dir` → a stdlib helper → `set … file_path`); the old "never write it to a file" rule made a 182-document export impossible. First verified run 2026-10-05 19:12 UTC: GREEN, 182 + 15 documents in 6 + 1 parts. A failed run deletes nothing, so the last good copy always survives.
- 2026-10-05 — **The Mac's own toolkit snapshot (`state/toolkitSnapshot`) is the truth for what is installed on the Mac**; repo docs lag it (Orca 1.4.220, not 1.4.203; OpenWA native with no Docker; Laya 0.3.27 in `~/Applications/laya-venv`; Bonsai already running). Read it before writing any Mac step.
- 2026-10-05 — **`marketSnapshot` (the index tiles) is written by the cloud market-close writer**, weekdays 21:20 UTC, and only when all three closes have two agreeing sources; the Mac's `feeds-market-close` used to write it and is being paused.
- 2026-10-05 — **Subagents cannot write report `.md` files** (the harness refuses: "subagents return findings as text"); they return findings in the hand-back and the integrator saves them (`docs/findings/r12-2026-10-05/`).
- 2026-10-08 — **Speed to lead is unmeasured because Lofty's lead list returns no id.** Per Lofty's docs (search summary), ids are 64-bit integers (keep as strings) and `/v1.0/leads/{id}/activities` is site activity only; calls/texts/emails are `/v2.0/leads/{id}/activities`. Do not compute first response until the Verified field map in `.claude/skills/lofty-crm-sync/SKILL.md` is filled from a probe on the Mac.
- 2026-10-08 — **The content pipeline is `r14-content-pipeline` (Mac, Tue–Fri 05:45 PT) → `marketingQueue` rows "awaiting Steven" → Steven sets Approved/Declined in the deck.** It works; posting stays a human step (client-facing, Tier 3).
- 2026-09-28 — Laya route hint measured 2026-09-28 on the Mac: the resident laya-serve answers in 0.10 s on the Metal GPU (vs 2.8 s loaded per call), but BRAIN_ROUTER=laya added 4.4% tokens with no accuracy gain on the 20-question bench, so leave BRAIN_ROUTER unset and do not install the LaunchAgent for recall. (source: Mac session run, 2026-09-28 06:27 UTC)
- 2026-10-09 — API Anything (integrations/api-anything/) is the site-to-API tool: read-only operations only, login only on Steven's yes, never for client-data systems (ShowingTime, Showami, SkySlope, zipForms); sites are taught on the Mac because the cloud sandbox cannot reach them (source: Steven 2026-10-09; cloud checks 2026-10-08/09)
- 2026-10-09 — 2026-10-09 Steven answered the five questions: USC Weeks 5-7 yes (add to study list); Week 4 done; five-state licensing line (CA NV AZ FL IL) current; Rent/Buy/Wait weekly refresh keep. LPT Realty CA DRE number and entity name left BLANK - still needed, both queued posts wait on it.
- 2026-10-09 — 2026-10-09 Steven's personal CA DRE licence number is 01988316 (broker associate, LPT Realty). LPT Realty's own brokerage DRE number and exact entity name are still open - unclear if he meant it as the answer; confirm.
