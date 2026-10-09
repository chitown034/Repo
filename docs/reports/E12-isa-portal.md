# E12 — ISA Portal

File: `scratchpad/isa/isa-portal.html` (git `master`, base `508ebae`, commit **`d012e2e`**)
Published at https://claude.ai/code/artifact/4348b34d-afa0-4d2e-8214-29b1319cf041
Baseline 2026-09-12 · verified 2026-09-22. 25 findings, `audit/findings-E12.json`.

---

## 1. Republish with this capabilities object

```json
{"db": {}, "sample": {}}
```

`mcp` is gone. There are now **zero** `mcp.callTool` / `mcp.watchTool` sites in the file, so the
You.com grant would be a retired connector declared for nothing. `db` stays — it is cross-device
sync and the ISA line. `sample` stays — the Vanessa and Steve chats are live and still needed.

---

## 2. The sync truth, measured

Both databases were read directly on 2026-09-22 (collection `state`). Nothing below is inferred
from a status badge.

**What is synced: one thing.** `isaLine` + `isaLineRead`, carried by `isa-comms-bridge-local`, a
task on Steven's Mac, hourly 7:37 AM – 9:37 PM PT, only while his Mac is awake. Last ok
2026-09-21 8:38 PM PT. Both copies held the same 9 messages, byte for byte. It genuinely works.

**The hourly CLOUD comms bridge is DISABLED.** The Mac task is the only path. If his Mac sleeps,
the ISA's messages sit here and he never sees them.

**The cloud "Command Deck ↔ ISA Portal — Pipeline Sync" routine is a false green.** It succeeds
four times a day and has never synced anything: an unattended cloud run cannot write an artifact
database — the write parks on a permission prompt — so it reads, finds nothing it can do, and
exits clean. The empty `pipeline` and missing `reClients` on Command Deck are the proof.

### Measured drift

| Document | ISA Portal | Command Deck | Verdict |
|---|---|---|---|
| `isaLine` / `isaLineRead` | 9 messages (v9 / v2) | identical 9 messages (v20 / same) | **In sync** |
| `isaDailySchedule` | present (v1) | identical (v6) | Matching — but copied by hand |
| `isaKpi` | week ending 2026-09-13 (v1) | identical (v1) | Matching — and **read by neither page** |
| `pipeline` | 2 deals: R. Alvarez $480,000 Underwriting; T. Nguyen $355,000 Clear to close | `[]`, v3, untouched since 2026-09-12 | **NOT synced** |
| `reClients` | 2: J. Whitfield (buyer, Active search); M. Delgado (seller, Consult scheduled) | **document does not exist** | **NOT synced** |
| `ratesSnapshot` | was 2026-09-13T14:35-07:00, 4 rates (v1) | 2026-09-22T02:24:25Z, 6 rates + benchmarks (v9) | Two copies; his is fresher and authoritative |
| `isaGradingScores`, `isaKpiSopActuals` | referenced by the page | **exist on neither store** | **NOT synced** — Steven cannot see her self-grades |
| `showingSchedule` / `showingRoute` / `showingSyncRequests` | nothing saved | `null` / `null` / `[]` | No drift only because both are empty |

ISA Portal store: 13 documents. Command Deck store: 161.

### Writes to close the drift (you perform these — I wrote nothing)

Collection `state` in both cases.

1. **Command Deck** `1624daae-d683-405a-971d-c5828dce0f8d` → `set` doc `pipeline`,
   `if_version: 3`, from `audit/E12-write-cd-pipeline.json`:
   `{"v":[{"client":"R. Alvarez","amount":480000,"stage":"Underwriting"},{"client":"T. Nguyen","amount":355000,"stage":"Clear to close"}]}`
2. **Command Deck** → `set` doc `reClients`, no `if_version` (it does not exist yet), from
   `audit/E12-write-cd-reClients.json`:
   `{"v":[{"name":"J. Whitfield","type":"Buyer","stage":"Active search"},{"name":"M. Delgado","type":"Seller","stage":"Consult scheduled"}]}`
3. **ISA Portal** `4348b34d-afa0-4d2e-8214-29b1319cf041` → `set` doc `ratesSnapshot`,
   `if_version: 1`, from `audit/E12-write-isa-ratesSnapshot.json` (Command Deck's live v9 value,
   verbatim). Optional today because no ISA code reads it, but leaving a 9-day-old copy there is
   a trap for anything that later does.

Do **not** write `loftyLeads`. It must come from a real Lofty sync, not from me.

These close today's drift; nothing keeps it closed. The durable fix is extending
`isa-comms-bridge-local` to carry `pipeline` and `reClients` the way it carries `isaLine` — it has
to be a Mac task, because a cloud routine cannot write either store.

---

## 3. What changed in the file

**You.com — all 8 references retired.** Removed `wireLiveNewsList`, `wireLivePropertySearch` and
`renderAiFitRecommendation`. Three buttons now say what they do and queue instead of failing:
*"Queue research (answered by Vanessa)"*, *"Queue a comparable-property search (answered by
Vanessa)"*, *"Queue a tax-record lookup (answered by Vanessa)"*. Each writes an item to
`vanessaResearch` **and** posts a `#research` message on the ISA line — because the line is the
only thing that actually crosses — and the confirmation text says which of the two succeeded. The
market-update and builder-incentive feeds now carry plain text naming `mortgage-rates-daily` and
`incentives-daily-scan` and explaining that both write to Command Deck's store, which this page
cannot read. No button silently fails.

**Follow Up Boss → Lofty.** The live card reads `loftyLeads` (BRIEF §4 shape) and handles
`ok` / `not-configured` / `error` / absent. Absent shows "Awaiting first Lofty sync" and never
borrows the FUB numbers. The 2026-09-07 import is kept, collapsed, under *"Last Follow Up Boss
import — 2026-09-07 (retired, kept as history)"* with the auth-failure date; it was not
relabelled. Re-pointed: chat chips, both AI personas, the SOP checklists, the tech-stack table,
the workflow pipeline, the showings integrations, the KPI card and the connectivity card. The FUB
calling number and forwarding email are amber-flagged, not deleted — see §4.
"Zoho CRM is the system of record for mortgage" is kept everywhere it appears, with the 403
NO_PERMISSION and the exact Zoho-side fix added wherever the page implied live Zoho data.

**Four reliability fixes**, each verified against the base commit by unit test:

| Fix | Baseline behaviour | Now |
|---|---|---|
| `isaLineMergeArrays` | merging a 1-msg and 2-msg array with a shared id-less message returned **1** — one lost, nothing logged | deterministic `noid-<hash>` from `ts\|from\|text`; returns **2**, identical relays still collapse, `lsShapeWarn` records it |
| `lsSetLocal` | empty catch — a quota failure looked exactly like a save | returns false, records `LS_WRITE_FAILURES`, surfaced in Sync status naming the unsaved keys |
| `applyRemoteSnapshot` no-`{v}` | document dropped, local store left **empty** | document kept as the value, shape warned |
| identical replay | `changed` set on any JSON difference | set only when the value differs **and** the write landed — first write `true`, replay `false`, blocked store `false` |

**Stale content.** Rates re-baked from `ratesSnapshot` 2026-09-22 02:24 UTC: Conventional 30
7.038, Conventional 15 6.257, VA 30 6.751, FHA 30 6.799, **USDA 30 6.71 (new)**, Jumbo 30 7.032
(all Optimal Blue via FRED, week ending Sep 18), plus 4 benchmark rows. APR reads "—" on re-baked
rows on purpose — the document publishes no APR, and an APR from a different pull beside a new
rate is an unsourced quote. **Rows the document lacks and that I kept:** VA 30-yr refinance
(Veterans United, Sep 9), VA 15-yr fixed (Navy Federal, Sep 2), Jumbo 15-yr fixed (Bankrate,
Sep 2) — each labelled "NOT in the daily snapshot" in its Source column. Market: San Diego County
re-baked to Aug 2026 ($961,781 / 28 DOM / +5.7%), Temecula confirmed unchanged, **Murrieta added**
($659,670 / 44 DOM / −3.7%) with its missing sale-to-list left blank rather than guessed.
`PROGRAM_FACTS` (2026-09-07) left alone — no newer source — with an age and "nothing refreshes
this" added. `FUB_SYNC_AT` left at 2026-09-07 as history. **`LOAN_PROGRAMS` = 39 and
`LENDER_DIRECTORY` = 61, unchanged** (counted after editing). Footer build stamp → 2026-09-22.

---

## 4. Needs Steven (7 halts)

1. **Zoho API access** — Zoho CRM → Setup → Security Control → Profiles → the connected user's
   profile → enable "Zoho CRM API Access". Nobody else can. Until then there is no live Zoho data
   on either dashboard.
2. **Lofty API key** — Lofty → Settings → Integrations → API, onto the Mac. Until then there are
   no live real-estate lead numbers anywhere.
3. **The (619) 651-9845 line and steven.shearrill@followupboss.me** — were these migrated to
   Lofty? The portal told the human ISA to use them on every lead call; now it tells her to
   confirm with him first.
4. **The "Pipeline Sync" cloud routine** — replace with a Mac task or disable it. A routine that
   reports success for work it cannot do is worse than no routine.
5. **The ISA line has one path** — his Mac. Accept that, or fund something that survives it
   sleeping.
6. **The ISA's self-grades reach nobody.** `isaGradingScores` and `isaKpiSopActuals` exist on
   neither store.
7. **Republish** with `{"db":{},"sample":{}}`.

---

## 5. Tests

- `python3 tests/quickcheck.py isa-portal.html` — identical failure set to base `508ebae`: the
  duplicate-id check hits the JS template string `' + id + '` (no real duplicate id exists —
  verified separately), the `<div>` balance reads open 1 / close 0 exactly as at baseline, and the
  undefined-function list went 145 → 137 names with **zero NEW names** (set difference against the
  base commit). Comments and copy were reworded specifically so no new prose word looks like a
  call.
- `node tests/runtime-harness.js isa-portal.html` — **PASS**. 0 exceptions, 0 `safeRun` failures,
  0 missing ids, 48 containers rendered, 0 reloads requested. Also run with `--store` seeded with
  a populated `loftyLeads` document: the live Lofty branch renders stage totals, the 90-day lead
  row and speed-to-lead, 2/2 docs restored, still 0 exceptions.
- Four targeted unit tests extracted the patched functions and ran them beside the base commit's
  versions; results in the table in §3.
