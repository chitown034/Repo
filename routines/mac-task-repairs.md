# Mac task & cloud routine repairs — paste-ready

**Written 2026-09-22 by W2 (Reliability). Every document state quoted here was read live from the
Command Deck store (`https://claude.ai/code/artifact/1624daae-d683-405a-971d-c5828dce0f8d`,
collection `state`) between 14:00 and 14:40 UTC on 2026-09-22.** Where the store disagreed with the
audit that commissioned this file, the store wins and the difference is called out.

An agent may not edit, create, fire or delete a Mac task or a cloud routine, and may not write to
the store. So nothing below has been applied. Each item is written to be **one paste, one click or
one decision** — the corrected text is already written and the check that proves it worked is named.

Work top to bottom. Item 1 has a deadline.

| # | Item | Steven's action | Urgency |
|---|---|---|---|
| 1 | `strava-daily-sync` writes unwrapped | **Paste** a prompt | **Before 2026-09-23 12:20 UTC** |
| 2 | `runnerStatus` stamp is 7 h wrong | **Paste** a diagnostic sequence | This week |
| 3 | `r8-apple-health-snapshot` | **Decision** (1 line, recommended branch given) | This week |
| 4 | `r4-quantvue-sync` refused | **Paste** a check | This week |
| 5 | Strategy cycle writes nothing | **Paste** a prompt | This week |
| 6 | `isaLadder.updatedAt` stamps the future | **Paste** one line | Low |
| 7 | Nine failing cloud routines | **Read** — one root cause, not nine | This week |
| 8 | Old Pipeline Sync still lying | **Click** disable | Low, but it never stops on its own |
| 9 | Connector card has never been told anything | **Paste** a prompt (new Mac task `cli-anything-status`) | After the installer runs |

---

## 1. `strava-daily-sync` — corrupts its document every run · DEADLINE 2026-09-23 12:20 UTC

**This one has a clock on it.** The task's cron is `20 5 * * *` Mac-local Pacific = **12:20 UTC**.
The document was repaired by hand today and **the repair dies at the next run** unless the prompt is
fixed first. Fix it before 12:20 UTC tomorrow or the repair is lost and the cycle repeats.

### What is broken

Every document in collection `state` is `{v:<value>}`. This task writes the body **bare** —
`{activities, syncedAt, via}` with no `v` wrapper. The deck's own reader tolerates it; nothing else
does. The backup integrity step, the restore test and the freshness sweep all count a document whose
top level is not a single `v` key as corrupt.

### Evidence

- Live read, 2026-09-22 ~14:05 UTC — `stravaSnapshot` is **version 9 and correct**:
  `{"v":{"activities":[["Sep 12","Weight Training","—","4:05","453 cal, 1 achievement"], …],
  "syncedAt":"2026-09-22T13:05:00Z","via":"FR2 freshness pass (Strava connector, direct read)"}}`,
  document `updatedAt 2026-09-22T13:12:15.87374Z`. The hand repair is holding, and no 05:20 PT slot
  has run since it was made.
- The writer was pinned to this task, not to the cloud routine: the bare v7 landed at **12:32 UTC**
  (a 12-minute run off the 12:20 UTC slot), carried **no `via` field**, and held **1 activity**
  against a 30-day window that returns 3. The cloud routine `Command Deck — Strava activity refresh`
  (`trig_015Fm6K3R7yvyHv3SkPGXHwL`, cron `0 3,15 * * *`) is research-only by its own prompt and
  fired at 03:08Z and 15:08Z — neither is 12:32Z.
- Live `runnerStatus`: `{"cron":"20 5 * * *","enabled":true,"lastEnd":"2026-09-22T05:32:45",
  "lastStatus":"ok","nextSlot":"2026-09-23T05:20:00","task":"strava-daily-sync"}`. It reports `ok`
  while writing a corrupt shape — which is why nothing has caught it.

### The corrected prompt — paste this over the task's prompt on the Mac

> Pull Steven's recent Strava activities and write the Command Deck `stravaSnapshot` document.
>
> **1. Read.** Use the Strava connector (`list_activities`) over the last **30 days**. The 30-day
> window is deliberate: a narrower window is what made an earlier run write 1 activity when 3 were
> available. If the connector errors, **write nothing** and report the error — never write a partial
> or empty snapshot over a good one.
>
> **2. Build the value.**
> - `activities` — one row per activity, newest first. Each row is an array of exactly five strings:
>   `[date, type, distance, duration, notes]`. Use `"—"` for a field the activity does not have.
>   `date` is short form, e.g. `"Sep 12"`.
> - `syncedAt` — the **actual UTC time of this write**, ISO-8601 with a `Z`. Take it from a UTC
>   clock (`date -u`), never from the Mac's local clock. A Pacific time with a `Z` stuck on the end
>   is wrong by seven hours and has already caused one false "this task is dead" call.
> - `via` — the string `"strava-daily-sync (Strava connector, direct read)"`.
>
> **3. Write it wrapped. This is the part that has broken twice.**
>
> Every document in collection `state` is `{v:<value>}` — **no exceptions**. Send
> `data:{v:<the whole value>}`, never the bare value. A top level that is not a single `v` key is a
> bug to fix, not a shape to copy. Use `set`, not `update`, so the top level is replaced outright and
> no stray key can survive.
>
> **CORRECT — what this task must send:**
>
> ```
> ArtifactData action:"set"
>   url:        https://claude.ai/code/artifact/1624daae-d683-405a-971d-c5828dce0f8d
>   collection: "state"
>   doc_id:     "stravaSnapshot"
>   data: {
>     "v": {
>       "activities": [["Sep 12","Weight Training","—","4:05","453 cal, 1 achievement"]],
>       "syncedAt": "2026-09-23T12:21:07Z",
>       "via": "strava-daily-sync (Strava connector, direct read)"
>     }
>   }
> ```
>
> **WRONG — what this task has been sending, and what re-breaks the document every run:**
>
> ```
>   data: {
>     "activities": [["Sep 12","Weight Training","—","4:05","453 cal, 1 achievement"]],
>     "syncedAt": "2026-09-23T12:21:07Z",
>     "via": "strava-daily-sync (Strava connector, direct read)"
>   }
> ```
>
> The only difference is the `v` wrapper. That is the whole bug.
>
> **4. Read it back.** After writing, read `state/stravaSnapshot` again and confirm its top level is
> exactly one key, `v`. If it is not, say so plainly in your report and stop — do not attempt a
> second repairing write.
>
> **5. Log one row.** Append one row to `ciLog` — `{date: "<YYYY-MM-DD>", text: "<one line>"}` and no
> other shape, e.g.
> `{date: "2026-09-23", text: "strava-daily-sync — ok, <n> activities over 30 days, v-wrapped."}`.
> Read `ciLog`, append to its array, write the whole array back as `data:{v:<array>}`. Never remove
> or alter an existing row.
>
> Never invent an activity, a calorie figure or an achievement. If Strava returns nothing, write
> `activities: []` with an honest `syncedAt` and say so.

### The check Steven runs afterwards

After the 12:20 UTC run, paste this into Claude Code on the Mac:

```
Read state/stravaSnapshot on https://claude.ai/code/artifact/1624daae-d683-405a-971d-c5828dce0f8d
and tell me two things: is its top level exactly one key named v, and what does syncedAt say?
```

Wrapped and a fresh `syncedAt` means it is fixed. A top level of `activities/syncedAt/via` means the
paste did not take.

---

## 2. `runnerStatus` — the stamp is seven hours wrong; the document is NOT dead

**This item's premise changed when I read the store.** The audit that commissioned this file
recorded `runnerStatus` as having stopped at `2026-09-22T04:05:04Z`, ~9.5 h stale, and asked why the
status document died. It did not die. It is being written. What is wrong is the **timestamp inside
it**, and that is what made a live document look like a corpse.

### What the store says

- `runnerStatus` is **version 8**, `v.syncedAt = "2026-09-22T07:06:12Z"`, `v.loggedIn = true`,
  `v.running = ["fabric-deck-sync"]`, 59 tasks.
- `knowledgeFabric` is **version 7** and carries the **identical** `v.syncedAt`
  `"2026-09-22T07:06:12Z"` — same writer, same pass
  (`v.source = "fabric-deck-sync (claude-runner, hourly) via run.sh fabric"`).
- The **server** recorded that same `knowledgeFabric` write at `updatedAt
  "2026-09-22T14:07:22.431452Z"`.

`14:07:22Z − 07:06:12 = 7 h 01 m 10 s`. That is exactly the PDT offset. The writer is stamping
**Mac-local Pacific wall-clock time and appending a `Z`**. The server clock is not in dispute; it is
assigned by the database, not by the task.

So `runnerStatus` was last written at roughly **14:06 UTC today**, about an hour before I read it —
not at 04:05 UTC. Its newest `lastEnd` is `vanessa-discord-inbox 2026-09-22T07:05:00` (Pacific,
= 14:05 UTC), one minute before the write. The runner is alive and the register has been
**understating the machine by seven hours on every task it lists**.

One thing I could not reconcile and am flagging rather than guessing: the earlier `04:05:04Z`
reading fits a *correct UTC* stamp of the 21:05 PT `fabric-deck-sync` slot, while today's
`07:06:12Z` fits a *Pacific* stamp of the 07:05 PT slot. The two readings cannot both be produced by
one consistent rule. Either the stamp's source changed during the day or one of the two writes was
off-slot. Step 3 below settles it on the Mac; do not assume it is settled here.

### The diagnostic sequence — cheapest first

Run in order. Stop at the first step that explains it.

**Step 1 — free, no Mac, 10 seconds.** Confirm the offset is still there. Paste into Claude Code:

```
Read state/knowledgeFabric on https://claude.ai/code/artifact/1624daae-d683-405a-971d-c5828dce0f8d.
Print v.syncedAt and the document's own updatedAt side by side and tell me the gap in hours.
```

A gap of ~7 h means the timezone bug, not a dead task, and you can skip straight to step 3.
A gap of ~0 means the stamp is honest and the task genuinely stopped — go to step 2.

**Step 2 — is the runner running at all?** On the Mac:

```
launchctl list | grep -i claude-runner
```

Absent or a non-zero exit status in the second column means the agent is not loaded, and that is the
whole answer. If it is present, the runner is up and the problem is in what it writes.

**Step 3 — what does the stamp come from?** This is the actual fix site. Find the fabric writer and
read its timestamp line:

```
grep -rn "syncedAt" ~/Applications/ ~/.claude/ 2>/dev/null | grep -i "fabric\|runner\|date"
```

You are looking for a `date` call building `syncedAt`. The bug is `date +%Y-%m-%dT%H:%M:%SZ` — local
time with a hardcoded `Z`. The fix is `date -u +%Y-%m-%dT%H:%M:%SZ`. Note the repo names
`~/Applications/local-bridge/run.sh` for the bridge; **I could not establish the fabric runner's
script path from the repo**, so the grep is written to search both likely roots rather than assert
one.

**Step 4 — is the process's timezone the same as your shell's?** A LaunchAgent does not inherit a
login shell's `TZ`:

```
launchctl print gui/$(id -u)/com.steven.claude-runner 2>/dev/null | grep -i "TZ\|environment" -A5
```

**Step 5 — only if 1–4 do not explain it.** Pull the runner's log around 14:06 UTC / 07:06 PT today
and read what it thought it was writing.

### Why this matters more than it looks

`always-on/README.md` reads every `lastEnd` as a floor precisely because this stamp could not be
trusted. Once step 3 is applied, the register can state task health as fact instead of as a bound,
and several tasks currently marked `error` / `limited` / `never run` from a stale log can be
re-read honestly.

---

## 3. `r8-apple-health-snapshot` — a decision, not a repair

**The decision, in one line:** the Apple Health ingest daemon is down and is being replaced by the
Notion phone route, so **retire `r8-apple-health-snapshot` rather than repair it** — that is the
recommendation.

### Evidence

- `appleHealth` is version 11; its newest source row ends `"last_at": "2026-09-13 00:00:00"`
  (metric `step_count`, source `iPhone`). Nine days stale.
- Live `runnerStatus`: `{"cron":"10 5,21 * * *","enabled":true,"lastEnd":"2026-09-22T05:12:04",
  "lastStatus":"ok", …,"task":"r8-apple-health-snapshot"}`. **Note this contradicts the register**,
  which records it as erroring since 2026-09-17. It is not erroring — it is reporting `ok` twice a
  day and writing nothing, which is worse, because nothing flags it.
- The replacement already exists and is waiting: `healthNotionSync` version 2 reads
  `{"createdAt":"2026-09-22T13:18:32Z","createdBy":"cloud session (Notion connector)",
  "lastRowDate":null,"lastSyncAt":null,"status":"awaiting-first-phone-run"}`.
- `healthAnalysis` is frozen behind it — its `dataGaps` list opens "No sleep data — nothing is
  writing sleep to Apple Health." It has nothing to analyse while `appleHealth` is frozen.

### Branch A — retire it and use the phone route (recommended)

1. **Disable** the Mac task `r8-apple-health-snapshot`, and `health-full-analysis` with it until
   health data flows again — `health-full-analysis` reports `lastStatus "ok"`, `lastEnd
   2026-09-22T05:32:45` while analysing a nine-day-old document.
2. On the iPhone, open Claude and say: **"update my health stats in Notion"**. Approve the Apple
   Health read and the Notion write once.
3. Let `health-notion-sync` run; it turns those rows into the `appleHealth` document the tiles
   already render.

**Check:** `healthNotionSync.status` stops reading `awaiting-first-phone-run` and `lastRowDate` and
`lastSyncAt` stop being `null`. Then `appleHealth` gets a stamp newer than 2026-09-13.

### Branch B — keep the old path

Restart the Health Auto Export daemon on port `:8765` on the Mac and confirm it answers, then leave
`r8` enabled. **Check:** `appleHealth` gains a stamp newer than 2026-09-13 within one 05:10/21:10 PT
slot. If it does not, the daemon is not the only thing broken and Branch A is the answer anyway.

Branch A is recommended because Branch B restores a dependency on a local daemon that has already
failed silently for nine days, while Branch A removes the Mac from the path entirely.

---

## 4. `r4-quantvue-sync` — it writes `strategySnapshot`, and it is `refused`, not silent

**Two corrections to the brief, both from the store, and they collapse items 4 and 5 into one
subject.**

**First: the document is not missing.** The task was described as writing "a QuantVue document" with
no such document in the store. `r4-quantvue-sync` writes **`strategySnapshot`**, and that document
exists. From `docs/inventory/mac-task-descriptions.md:40`:

> **r4-quantvue-sync** — Re-reads the live QuantVue Google Sheet, writes strategySnapshot, and flags
> any strategy under −4% month to date.

A full listing of collection `state` (**173 documents**, read 2026-09-22 ~14:20 UTC) confirms there
is no separate QuantVue document and no gap where one should be. The only id containing "quantvue"
is `seccollapse.panel-quantvue.today-s-top-movers` — 16 bytes, a UI section-collapse flag, not data.

So **the question "what was it supposed to write" is settled from the repo and needs no question put
to Steven.** It was supposed to write `strategySnapshot`, which is live at version 4 with keys
`asOf`, `flags`, `history`, `sourceUrl`, `strategies` (28 entries), `syncedAt`, and
`sourceUrl` pointing at the QuantVue Google Sheet CSV export. Its `syncedAt` is
`2026-09-16T03:26:59Z` — the same date the task went quiet, which corroborates the pairing.

**Second: it is not silent.** Live `runnerStatus` says:

```
{"cron":"20 23 * * 1-5","enabled":true,"lastEnd":"2026-09-22T01:19:43",
 "lastStatus":"refused","nextSlot":"2026-09-22T23:20:00","task":"r4-quantvue-sync"}
```

It ran last night and was **`refused`** — which in this system means *a tool or path was not on the
allow-list* (`wiki/dashboard-ops/index.md`). It is running on schedule and being denied. That is a
far cheaper fault to fix than a silent one, and it is almost certainly the outbound fetch of the
Google Sheets CSV export.

### The check that settles it — paste on the Mac

```
Show me the r4-quantvue-sync task definition and its allow-list, then show the last run's log
around 2026-09-22T01:19:43 local. I want the exact tool or path that was refused.
```

If the refusal is the Sheets fetch, add that one host to the task's allow-list; the prompt does not
need changing. If it is something else, the log names it and no guessing is required.

**Check afterwards:** `strategySnapshot.syncedAt` moves past `2026-09-16T03:26:59Z` after the next
23:20 PT weekday slot.

---

## 5. The strategy cycle — a routine whose own prompt forbids it to write

Same subject as item 4, different writer. `strategySnapshot` has **two** broken writers: the Mac task
above, which is refused, and this cloud routine, which succeeds and writes nothing.

### Evidence

`trig_011CXFHCT3hou6uaCfb5rWkC` — "Command Deck — Trading strategy performance daily 3pm PST sync",
cron `0 22 * * 1-5` (weekdays, 3 PM PT). Last run **SUCCEEDED, fired 2026-09-21T22:03:34Z**. And
`strategySnapshot.syncedAt` is still `2026-09-16T03:26:59Z`. It succeeded yesterday and moved
nothing.

That is not a malfunction — it is doing exactly what it was told. Its own prompt says:

> This is an UNATTENDED cloud run — a human applies your findings afterward. Do NOT use Edit, Write,
> or Bash. Do NOT call Artifact with action "publish". Your only job is to fetch real data and
> report it.

and ends:

> Output your findings as your FINAL MESSAGE ONLY … Do not call Edit, Write, Bash, or
> Artifact(publish) at any point. End your turn with the JSON as your final message.

There is no write step in it at all. This is the research-only-prompt pattern, and the belief behind
it was disproved on 2026-09-22 — an unattended cloud routine **can** write the store
(`docs/CLOUD-WRITE-ARCHITECTURE.md`, `cloudWriteProbe` version 1, `"write succeeded unattended"`).

**It was created via `http_api`, so no agent can edit it. This one is Steven's**, at
https://claude.ai/code/routines/trig_011CXFHCT3hou6uaCfb5rWkC.

### The corrected prompt — paste it over the routine's prompt

> Refresh the Command Deck `strategySnapshot` document from the live QuantVue Google Sheet. This is
> an unattended cloud run and **you are expected to write**. A routine that reports success without
> moving its document is a failure, not a limitation.
>
> **1. Read the sheet.** Call Composio `GOOGLESHEETS_BATCH_GET` with
> `{"spreadsheet_id": "1uxDDZUnHYZrjDZi6mxSK1AY-LdiYE1tsP7Q8Y-TTEpc", "ranges": ["A1:S200"]}`. If
> that genuinely fails, fall back to WebFetch on the CSV export URL already recorded in the
> document's own `sourceUrl` field. Report which method worked.
>
> **2. If both fail, STOP.** Write nothing and say so. This is real trading data; inventing a
> strategy name or a return figure would be actively harmful. Never carry a stale figure forward
> under a fresh `syncedAt`.
>
> **3. Build the value in the shape the document already uses** — read the current document first and
> match it exactly. Keys: `asOf`, `flags`, `history`, `sourceUrl`, `strategies`, `syncedAt`.
> - `strategies` — one entry per strategy as `{"name": <string>, "mtdPct": <number>, "ytdPct":
>   <number>}`. Take every strategy the sheet lists; do not prune to a remembered list.
> - `flags` — one human-readable line per strategy whose month-to-date return is **under −4%**.
> - `history` — append one `{"date": "<YYYY-MM-DD>", "count": <n strategies>, "worstMtd": <number>}`
>   entry to the existing array. Do not rewrite earlier entries.
> - `asOf` — the sheet's own period, e.g. `"2026-09"`.
> - `sourceUrl` — carry the existing value through unchanged.
> - `syncedAt` — the actual UTC time of this write, ISO-8601 with a `Z`.
>
> **4. Write it wrapped.** Every document in collection `state` is `{v:<value>}` — no exceptions.
> Send `data:{v:<the whole value>}`, never the bare value. A top level that is not a single `v` key
> is a bug to fix, not a shape to copy.
>
> **CORRECT:**
>
> ```
> ArtifactData action:"set"
>   url:        https://claude.ai/code/artifact/1624daae-d683-405a-971d-c5828dce0f8d
>   collection: "state"
>   doc_id:     "strategySnapshot"
>   if_version: <the version you just read>
>   data: {
>     "v": {
>       "asOf": "2026-09",
>       "flags": ["<strategy name> is <mtd>% month to date"],
>       "history": [{"date": "2026-09-22", "count": 28, "worstMtd": -10.76}],
>       "sourceUrl": "<carried through unchanged>",
>       "strategies": [{"name": "<exact sheet name>", "mtdPct": 10.89, "ytdPct": 71.85}],
>       "syncedAt": "2026-09-22T22:04:11Z"
>     }
>   }
> ```
>
> **WRONG — the bare body, with no `v`:**
>
> ```
>   data: { "asOf": "2026-09", "strategies": [ … ], "syncedAt": "2026-09-22T22:04:11Z" }
> ```
>
> Pin the write with `if_version` set to the version you read in step 3, so a concurrent edit makes
> the write fail rather than silently win. Never force.
>
> **5. Read it back** and confirm `syncedAt` is the value you just wrote and the top level is exactly
> one key, `v`. If it is not, report that plainly.
>
> **6. Log one row** in `ciLog` — `{date: "<YYYY-MM-DD>", text: "<one line>"}` and no other shape,
> e.g. `{date: "2026-09-22", text: "quantvue-strategy-sync — ok, <n> strategies, <n> flagged under
> −4% MTD."}`. Read `ciLog`, append, write the whole array back as `data:{v:<array>}`. Never remove
> or alter an existing row.
>
> The numbers in the example above are the shapes to match, not values to write. Every figure you
> write must come from this run's read of the sheet.

**Check:** after the next weekday 22:00 UTC run, `strategySnapshot.syncedAt` is past
`2026-09-16T03:26:59Z` and a `quantvue-strategy-sync` row is in `ciLog`.

**Note the overlap with item 4.** Both this routine and `r4-quantvue-sync` target `strategySnapshot`.
Fixing both means two writers on one document. Recommendation: fix this one first — it is a paste
and needs no allow-list change — and leave `r4` disabled until you decide which owns the document.
Two writers on one key is how the `isaScorecard` and `marketingQueue` shape bugs started.

---

## 6. `isaLadder.updatedAt` — stamps a scheduled slot, never the write time

A proof-of-life field that runs ahead of the clock cannot prove liveness. I caught this twice today,
which pins the rule exactly.

### Evidence — two consecutive versions

| Version | `v.updatedAt` (what the routine wrote) | Server `updatedAt` (when it actually wrote) | Error |
|---|---|---|---|
| 2 | `2026-09-22T14:35:00Z` | `2026-09-22T13:03:31.012869Z` | **1 h 31 m in the future** — it stamped the *next* slot |
| 3 | `2026-09-22T14:30:00Z` | `2026-09-22T14:35:53.018253Z` | 5 m 53 s early — it stamped *this* slot's nominal time |

The routine is `trig_01J9xuWgAuUCHATtpLivDkgp`, cron `30 14 * * 2-6`, last fired
`2026-09-22T14:33:39Z`, finished `14:35:57Z`. Both stamps are **slot times**. Neither is a write
time. The run itself is genuine — the ladder state is coherent and `ciLog` carries its rows — so
only the stamp is wrong.

This routine was created via `meta_mcp`, so an agent can apply the change; it does not need Steven.

### The corrected line — replace the line that sets `updatedAt`

> `updatedAt` — the **actual UTC time at the moment of this write**, ISO-8601 with a `Z`, read from
> the clock when you build the document. Never the routine's scheduled slot, never `next_run_at`,
> never a rounded time. If the write happens at 14:35:53 UTC, `updatedAt` is `"2026-09-22T14:35:53Z"`
> — not `"2026-09-22T14:30:00Z"` and not `"2026-09-22T14:35:00Z"`. This field is the ladder's only
> proof of life; a stamp that disagrees with the document's own server `updatedAt` by more than the
> duration of the run makes it worthless.

**Check:** after the next weekday 14:30 UTC run, read `state/isaLadder` and confirm `v.updatedAt` is
within a minute or two of the document's own `updatedAt`, and never ahead of it.

---

## 7. Nine failing cloud routines — one root cause, not nine

Nine routines are FAILED or ABANDONED. **I checked whether this is one cause or several before
writing any prompt, and the timing says it is one: none of the nine ever reached its prompt.**
Rewriting prompts would not have fixed a single one.

### The measurement

| Routine | Created | Status | Fired | Finished | **Ran for** |
|---|---|---|---|---|---|
| Vanessa orchestrated ops review | `http_api` | FAILED | 2026-09-18T23:03:02Z | 23:03:08Z | **5.7 s** |
| Weekly Loop Engineering QA | `http_api` | FAILED | 2026-09-20T16:06:19Z | 16:06:25Z | **6.0 s** |
| Next Big Moves weekly review | `http_api` | FAILED | 2026-09-20T15:07:39Z | 15:07:44Z | **5.5 s** |
| Elite Affluent Tracker weekly | `http_api` | FAILED | 2026-09-20T16:09:32Z | 16:09:37Z | **5.5 s** |
| Ops Issue Review | `meta_mcp` | FAILED | 2026-09-18T20:08:23Z | 20:08:32Z | **9.8 s** |
| Project Risk Review | `meta_mcp` | FAILED | 2026-09-18T21:07:18Z | 21:07:28Z | **10.5 s** |
| Books Reconciliation Reminder | `meta_mcp` | FAILED | 2026-09-18T22:01:29Z | 22:01:39Z | **9.6 s** |
| Rent, Buy, or Wait refresh | `meta_mcp` | ABANDONED | 2026-09-21T15:08:09Z | *never finished* | — |
| Real Estate Weekly Brief | `meta_mcp` | ABANDONED | 2026-09-21T15:08:42Z | *never finished* | — |

Three things this shows that a status column alone does not:

1. **The durations are uniform within each cluster** — 5.5–6.0 s for all four `http_api` ones,
   9.6–10.5 s for all three `meta_mcp` ones. Routines with entirely different prompts, different
   targets and different tools cannot coincidentally fail at the same instant in their lifecycle.
   For comparison, the routines that *work* on this account run for **1 m 36 s to 8 m 47 s**. A
   six-second failure never reached any prompt logic.
2. **Three weekly routines with Monday, Tuesday and Wednesday crons all last ran on Friday
   2026-09-18**, within two hours of each other (20:08, 21:07, 22:01). Those were catch-up runs, and
   they all failed together.
3. **The two ABANDONED runs have no `finished_at` at all** and fired 33 seconds apart. ABANDONED is
   a dropped run, not a rejected one.

**And the platform is demonstrably healthy today.** Every routine that fired on 2026-09-22 succeeded
and did real work: Pipeline Sync (live) 10:09:51Z for 1 m 36 s, Weekly ecosystem backup 09:35:35Z
for 8 m 47 s, ISA ladder 14:33:39Z for 2 m 18 s.

### What this means for Steven

**Do not rewrite nine prompts.** The cheapest correct action is to let the next natural firing happen
and watch it, because that is a free test that has not been run since the platform recovered. The
next one is soon:

| Routine | Next firing |
|---|---|
| **Project Risk Review** | **2026-09-22T18:06Z — today** |
| Books Reconciliation Reminder | 2026-09-23T18:00Z |
| Ops Issue Review | 2026-09-28T18:07Z |
| Rent, Buy, or Wait · Real Estate Weekly Brief | 2026-09-28 16:37Z / 17:36Z |
| The four `http_api` ones | 2026-09-25 / 2026-09-27 |

**Check after today's 18:06Z firing:** if Project Risk Review runs longer than ~30 seconds, the
outage is over and eight of the nine need nothing. If it dies in ~10 seconds again, the fault is
live and reproducible on demand — which is a far better bug report than nine guesses.

### Two real defects that will surface once they do run

These are separate from the failures above and would not have been visible until a run succeeded.

**(a) Three of them are stock templates aimed at a business that is not Steven's.** `Ops Issue
Review`, `Project Risk Review` and `Books Reconciliation Reminder` all read `/home/claude/vault` and
directories `Ops/Issues/`, `Ops/Processes/`, `Projects/`, `Finance/Books/`, and all three check
whether `_memory/Business.md` still says "onboarding not yet completed". None of that exists in this
ecosystem. All three also end with "Present ... as your reply" — they leave **no document**, so even
a perfect run is invisible and unverifiable. They are the research-only pattern again.

**(b) `Real Estate Weekly Brief` cannot work as an agent-created routine, at all.** Its entire body
calls `FOLLOW_UP_BOSS_LIST_APPOINTMENTS`, Google Calendar `list_events` and Gmail `search_threads`.
It was created via `meta_mcp`, and per `docs/CLOUD-WRITE-ARCHITECTURE.md`, *"a routine created by an
agent stores no MCP connectors"* — so those three tools are not available to it and never were. It
also targets **Follow Up Boss**, which `wiki/dashboard-ops/index.md` records as superseded: Lofty is
the real-estate system of record as of 2026-09-22. Two independent reasons it cannot produce a
correct brief. **This is a decision for Steven, not a prompt fix** — no rewrite can give an
agent-created routine connectors. Either recreate it in the web interface (web-created routines
carry connectors) once Lofty is connected, or retire it.

`Books Reconciliation Reminder` has the same shape of problem: there is no ledger, books or finance
document anywhere in the 173-document store for it to read. Retiring it is the honest call.

### The five `meta_mcp` ones — what to actually do with each

These five were created by an agent, so an agent can update them without Steven. **Four of the five
do not need a new prompt**, and saying so is the useful answer: a prompt update is the wrong
instrument for a routine that is not executing, has no connectors, or has nothing to read.

| Routine | What is wrong | Right instrument |
|---|---|---|
| Rent, Buy, or Wait | Prompt is sound; the run was **dropped**, and it leaves only a chat report so a dropped run is invisible | **Prompt update** — add a durable trace (below) |
| Real Estate Weekly Brief | Agent-created routines carry **no connectors**; its whole body is Follow Up Boss + Calendar + Gmail. Also targets a superseded CRM | **Steven decides** — recreate in the web UI once Lofty is connected, or retire |
| Ops Issue Review | Stock template reading `/home/claude/vault`, `Ops/Issues/`; report-only, leaves no document | **Disable** pending Steven's call |
| Project Risk Review | Same template family, reads `Projects/`; report-only | **Disable** pending Steven's call |
| Books Reconciliation Reminder | Same family, reads `Finance/Books/`; **no ledger or finance document exists** in the 173-doc store | **Disable** — nothing to reconcile |

Disabling the three templates is reversible, stops three routines firing into failure every week, and
does not invent a capability nobody asked for. The Command Deck already carries `twinQueue`,
`kanbanCards` and `auditFindings` for exactly the work those three templates describe; repurposing
them would duplicate three existing surfaces. If Steven wants them repurposed rather than retired,
that is a scoping conversation, not a prompt edit.

**The one prompt update — Rent, Buy, or Wait (`trig_01EBvRQ4Rv63EgrLihjNxwiG`).** Keep its existing
prompt exactly as it stands — it correctly invokes the `rent-buy-dashboard-refresh` skill, names the
artifact, and carries the do-not-fabricate and single-`<script>` guards. **Append this to the end of
it**, and change nothing else:

> **Leave a durable trace, so a dropped run is visible.** This routine has been ABANDONED mid-run
> before, and because its only output was a chat message, nobody could tell the difference between
> "ran and found nothing to change" and "died halfway through". Fix that:
>
> - **Before** you begin the refresh, append one row to `ciLog` on
>   `https://claude.ai/code/artifact/1624daae-d683-405a-971d-c5828dce0f8d`, collection `state`,
>   doc_id `ciLog` — `{date: "<YYYY-MM-DD>", text: "rent-buy-wait — started, <weekly|monthly|annual>
>   tier."}` and no other shape. Read the array, append, write the whole array back as
>   `data:{v:<array>}`. Never remove or alter an existing row.
> - **After** you republish, append a second row: `{date: "<YYYY-MM-DD>", text: "rent-buy-wait — ok,
>   <n> figures moved, <n> checked and unchanged, <n> unverifiable."}`.
> - A start row with no matching finish row is the signal that the run was dropped. That is the
>   whole point — do not merge the two into one row at the end.
>
> Every document in collection `state` is `{v:<value>}` — no exceptions. Send `data:{v:<the whole
> array>}`, never the bare array. A top level that is not a single `v` key is a bug to fix, not a
> shape to copy.

**Check:** after its next Monday 17:30 UTC firing, `ciLog` carries a `rent-buy-wait — started` row
and a `rent-buy-wait — ok` row with the same date. A start row alone means it was dropped again, and
this time you will know.

### The four `http_api` ones — Steven's, at a URL each

No agent can edit a routine created through the web interface. These four are his:

| Routine | Link |
|---|---|
| Vanessa orchestrated ops review | https://claude.ai/code/routines/trig_01V6QrF6yENWiccduk94ubbs |
| Weekly Loop Engineering QA | https://claude.ai/code/routines/trig_013ocJfEDdmSAgDPVaiCzMZY |
| Next Big Moves weekly review | https://claude.ai/code/routines/trig_01Lb3aYRQZSLsAkcnDpZ8zEL |
| Elite Affluent Tracker weekly | https://claude.ai/code/routines/trig_01HfL39UYunpMm56NSJuh8LK |

All four already contain a write step; three of them also carry `RESEARCH-ONLY` / `FINAL MESSAGE
ONLY` instructions alongside it, so they will need the item-5 treatment once the run failure is
cleared. Clear the run failure first — there is no point correcting a prompt that is not executing.

---

## 8. The old Pipeline Sync — Steven clicks, or it keeps lying

`trig_018BSAYiYzvtyaUkpAY4SnqE`, cron `0 1,7,13,19 * * *`, created via `http_api`. It fired again
today at **13:08:44Z**, ran 1 m 31 s, and reported **SUCCEEDED** having moved nothing. Its own prompt
is research-only and it compares two `cdStateSeed` blobs that are both `{}` — equal seeds, no drift,
success, four times a day, forever.

**A disable was retried by the coordinator today and refused**: *"this routine was created via
http_api, not by an agent."* That is now the third confirmation. No agent can turn it off.

It is superseded by `trig_01M5zR1Po44gnHvTwA9ogZaB` (04/10/16/22 UTC), which genuinely writes and is
working.

**One click:** https://claude.ai/code/routines/trig_018BSAYiYzvtyaUkpAY4SnqE → disable.

A green row for work that is not being done is worse than no row at all, and this one is the reason
the register cannot use routine status as evidence anywhere.

---

## 9. `cli-anything-status` — the connector card has never been told anything, and only the Mac may tell it

**Added 2026-09-22 by P2.** This is a NEW task, not a repair of an existing one, and it is the only
thing that may ever write the `cliAnythingStatus` document.

### What is happening now, and why it is correct

The Command Deck's CLI-Anything connector card reads a document called `cliAnythingStatus`. **That
document has never been written.** With no document the card says:

> "No cliAnythingStatus document has ever been written, so nothing has ever checked any of these on
> your Mac."

That sentence is **true**, and it must stay true until something really looks at the Mac. The moment
any document exists carrying a `checkedAt`, the same card instead says *"The cliAnythingStatus
document says CLI-Anything is NOT installed (checked &lt;time&gt;)"* — which asserts that something
inspected Steven's machine at that time. **No cloud session can make that true**, so no cloud
session may write this document. The honest state today: CLI-Anything was installed and exercised
**once in a throwaway cloud sandbox on 2026-09-22**, which proves the toolchain and changes nothing
on Steven's machine; the seven read-only harness packages are pre-built in the repo and have never
run on the Mac or anywhere live.

The document's exact shape, field by field, with the page's three clamps and its write-verb
tripwire, is in **`docs/data/cliAnythingStatus.doc.json`** — a template, not a payload. Field names
there were read out of the renderer, not out of prose.

### The task

| | |
|---|---|
| **Name** | `cli-anything-status` |
| **Cron (PT)** | none at first — run it by hand after `./MAC-SETUP.sh`. Once it has run clean twice, Sundays `35 8 * * 0` PT (`35 15 * * 0` UTC), just behind `cli-anything-validate` |
| **Model** | Sonnet 5 (it inspects and reports; it decides nothing) |
| **Tools** | `Bash` (read-only argv prefixes only) · `Artifact` `write_db` for `cliAnythingStatus` |
| **Env** | `CLI_HUB_NO_ANALYTICS=1`, and `DOMSHELL_TOKEN` only if a live read is in scope |

### The prompt — paste this as the task's prompt on the Mac

> You are on Steven's Mac. Inspect what is actually installed for CLI-Anything and write the
> `cliAnythingStatus` document from what you find. **Never write a value you did not observe this
> run**, and never write this document from anywhere but this Mac: the deck's card turns your
> `checkedAt` into the sentence "checked &lt;time&gt;", which claims this machine was inspected.
> If you cannot inspect it, write nothing and say so.
>
> Read `docs/data/cliAnythingStatus.doc.json` in the repo for the exact shape and the page's clamps.
> Establish each value by looking:
> - `cli-hub --version` → `hubVersion` (null if the command is missing).
> - `claude plugin list` → is `cli-anything` present.
> - `ls ~/Applications/cli-anything-harnesses/.venv/bin/cli-anything-*` and `command -v
>   cli-anything-<target>` → which of the eight (browser engine + homes, showingtime, showami,
>   skyslope, zipforms, lofty, zoho) exist.
> - `installed: true` only if the hub, the plugin **and** the harness venv are all present. Anything
>   less is `false`.
> - Per wrapper, `cli-anything-<target> --help` → the verb groups it really exposes. **`verbsEnabled`
>   must come from that help output, never from a default, never from this prompt.**
> - `cli-anything-<target> --json recipes` → which path maps are `verified` (all ship `verified:
>   false`; a map is only true after a human spot-check against the page).
> - `cli-anything-skyslope --json gate status` and the same for zipforms → `eccReviewedAt`. Copy the
>   date the gate reports from `CLI_ANYTHING_ECC_REVIEWED_AT`; **never type a date to make a row go
>   green.** No date means `connState: "disabled-by-policy"`, which is what those two must say.
> - `lastRun` is an ISO-8601 stamp of a **real** recipe run that returned rows or an explicit empty
>   result. If nothing has run, it is `null`. `connState: "read-only-live"` without a `lastRun` is
>   clamped by the page anyway — do not claim it.
>
> **The read-only check is a WORD match.** `cli-anything-<target> --help | grep -qw act` must find
> nothing. Do not use a substring match: `my-listing-activity`, `redact`, `contact`, `interactive`
> and `exact` all contain "act" and a substring check has already produced a false failure (F-H1-04).
> If a real `act` verb ever appears, stop, write `status:"failed"` with the evidence, and escalate —
> that is the entire write surface of the browser path.
>
> **Do not put a recipe name in `verbsEnabled`.** The card tests every entry against a write-verb
> pattern and one match turns the whole card red; Showami's read recipes `my-requests`,
> `request-status` and `posted-price` all match it. List verb groups — `recipe`, `fs ls`, `fs cat`,
> `fs grep`, `fs pwd`, `page info`, `page open`, `session status` — at most 8; the card shows the
> recipe names itself.
>
> Write the document as `{v: {...}}` — the whole document under a single `v` key, never the bare
> value. Read it first (`read_db` get; missing means write a fresh one). Then tell me in one line:
> what is installed, which maps are verified, and what is still `null` and why.
>
> Do not install anything, do not sign in to anything, do not run a write, submit, send, sign or
> delete verb on any target, and do not touch SkySlope or zipForms beyond `gate status` until the
> ECC review has a sign-off date.

### The check Steven runs afterwards

Open the deck's CLI-Anything connector card. Before this task has ever run it must say *"No
cliAnythingStatus document has ever been written"*. After a clean run it must say *"CLI-Anything is
NOT installed (checked …)"* with a time that matches when you ran it — and if the card is **red**
with "WRITE VERB ENABLED", the document put a recipe name or a real write verb in `verbsEnabled`:
read the row it names, do not clear the alarm by editing the document until you know which.

---

## Related

- `always-on/README.md` — the register these repairs feed.
- `docs/CLOUD-WRITE-ARCHITECTURE.md` — why a cloud routine may now write.
- `routines/pipeline-sync-live.md` · `routines/isa-escalation-ladder.md` — the two corrected writers.
- `docs/findings/findings-W2.json` — the findings behind this file.
