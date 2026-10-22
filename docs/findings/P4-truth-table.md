# P4 — Advertised vs. actually true

**QA / Verification Engineer · audit run 2026-09-22, 23:20–00:10 UTC, in the Linux cloud sandbox.**
Every row below was produced by running something. Nothing here is read off a status page.

**Key.** **Working** = executed here and did what it says. **Spec-only** = the document exists and is
correct, but nothing has ever run. **Blocked-on-Steven** = correct and finished up to a credential,
permission or click only Steven can supply. **Broken** = it claims to work and does not.

**One standing caveat on scope.** This session runs on Linux. It cannot see the Mac. So no claim of the
form *"X is installed on the Mac"* was verifiable from here, and none is marked Working on that basis —
`mac-verify.sh` said so itself in its first line before reporting 9 FAILs. What I could verify is the
code, the scripts, the published artifacts, the live document store and the cloud routines.

---

## The headline capabilities

| Advertised capability | Actually true? | What the run showed |
|---|---|---|
| **homes.com wrapper** (read-only) | **Spec-only** | Installs and passes — 67 passed / 8 skipped — but only after `cli-anything-browser` is installed into the same venv first. Standalone `pip install .` fails. 3 of its recipes ship `verified: false`; no live call has ever been made. |
| **ShowingTime wrapper** | **Spec-only** | 70 passed / 11 skipped, same prerequisite. 4 recipes, all `verified: false`. |
| **Showami wrapper** | **Spec-only** | 70 passed / 11 skipped, same prerequisite. 4 recipes, all `verified: false`. |
| **SkySlope wrapper** | **Blocked-on-Steven** | Installs standalone, 68 passed / 3 skipped. Every live command refuses with **exit 3** until the ECC review is signed off — verified by execution. 5 recipes, all `verified: false`. |
| **zipForms / Lone Wolf wrapper** | **Blocked-on-Steven** | Installs standalone, 67 passed / 3 skipped. Same ECC gate, same exit 3, verified. 4 recipes, all `verified: false`. |
| **Lofty harness** (REST, GET-only) | **Blocked-on-Steven** | Installs standalone, 37 passed. Source sweep confirms `requests.get` only — no write path exists. Waiting on one API key. |
| **Zoho harness** (REST, GET-only) | **Blocked-on-Steven** | Installs standalone, 42 passed / 1 skipped. `requests.get` only. Blocked on a Zoho profile permission. |
| **"Read-only by construction"** | **Broken** | True of the seven wrappers, false of the engine underneath them. `cli-anything-browser act --help` lists **click** and **type**, with no ECC gate anywhere in that package, and `MAC-SETUP.sh` symlinks it onto `~/.local/bin`. Disclosed in `VENDORED.md`; not mitigated. |
| **OmniRoute failover** | **Spec-only** | `claude-auto.sh` and `probe.sh` pass `bash -n`; H3/H3b executed them against stubs and closed the PII-gate bypasses. Nothing runs on the Mac: `mac-verify.sh` reports omniroute not installed, `claude-auto` and `probe.sh` not in `~/.local/bin`, and no route mode has ever been written. |
| **Second-brain unification** | **Broken (in one store)** | Five of six stores count: Second Brain 71 rows, Vault 832, Jarvis 1,761, Graph 750 nodes / 1,104 edges, Ruflo 238. The sixth, the Google Drive folder, reads **0 files** — as it has every time it has been sampled. The deck counts a store nothing can reach. Already logged as NEVER ADDRESSED in `CONNECTIONS.md`. |
| **Apple Health → Notion** | **Blocked-on-Steven** | The Notion Health Log database exists (`healthNotionSync`, created 2026-09-22) but `lastRowDate` and `lastSyncAt` are both **null** — not one row has ever synced. The old pipeline is 9 days dead: newest `appleHealth` reading is 2026-09-10, `healthAnalysis` is stuck at 2026-09-13. The deck does **not** hide this — it dates the tiles 2026-09-12 and flags itself "Apple Health snapshot is 9 days stale". |
| **WhatsApp CLI** | **Spec-only** | Spec written 2026-09-22. `mac-verify.sh`: not built at `~/Applications/whatsapp-cli/.venv/bin/whatsapp-cli`. Needs a dedicated number, Full Disk Access and Accessibility before it can run once by hand. |
| **Vanessa's voice on iMessage** | **Spec-only** | The render path was proven **once, on 2026-09-12**, and not since: `voiceReplyStatus` holds a single item, id `teststeve01`, `renderedAt 2026-09-12T22:01:44Z`, status `ready`, and `voiceReplyQueue` holds that same test utterance. No production reply has ever been rendered. |
| **Remote access from both Macs** | **Spec-only** | Reading is genuinely solved — both dashboards are private artifacts on one login, and `deviceRoster` lists more than one device. But the primary/standby lease that stops two Macs double-writing 59 tasks **does not exist**: `taskLease` is absent from all 174 documents in the store. `REMOTE-ACCESS.md` says so honestly. Until it exists, enabling Mac #2's runner would double-write every feed. |
| **The deck's live panels** | **Working, with stale inputs** | Command Deck v147 runs clean: 0 exceptions, 0 safeRun failures, 338 containers (344 with the live store), 0 missing ids. I read 15 panels back as rendered **text**, not as innerHTML counts. Two render empty — `loftyStageStats`, `zhDealsStats` — and both are correct by design, with the honest message on the sibling element. The panels are sound; several of the documents feeding them are not. |
| **The ISA seat** | **Blocked-on-Steven** | The portal runs clean (47 containers, 0 exceptions). The seat does not: `isaLadder` records **3 consecutive business-day misses** (Sep 15, 16, 22), `lastIsaMessageAt: null`, "no ISA-authored message ever", and packet `tw_isa_seat_20260922` sitting open as needs-steven. `isaScorecard` is an empty array; `isaKpi` was written once and its compiling task has never run. |
| **Backup / restore drill** | **Working (drill) · Broken (schedule)** | The drill is real: 173/173 documents restored, page rendered 344 containers, 0 parse failures, 0 exceptions, and a 5.32 MB / 174-file bundle re-hashed after write with every hash matching. The schedule is not: `weeksKept: 1`, the note says "still the only backup date on record", `r6-weekly-backup` has **never run** and missed its 2026-09-20 slot, and the Sunday verification watchdog has no run recorded. The advertised "8-week rolling" has one week behind it. |

---

## The three worst

1. **15 named client leads are published in Command Deck v147.** `ZH_SEED` at
   `command-deck.html:16421-16427` holds real first and last names, lead stage and two timestamps
   each, and `zhDoc()` falls back to it whenever no `zohoLeads` document exists — which is now, since
   a live read of the store returned 174 documents and `zohoLeads` is not one of them. This is the
   same defect F-L1-02 fixed for the 39 retired-CRM rows; it was missed for Zoho. **HALT.**
2. **"Read-only by construction" is false of the binary that goes on PATH.** The seven wrappers have
   no write verbs. The engine they all run on has `act click` and `act type`, ungated, while SkySlope
   and zipForms refuse a mere `fs ls` with exit 3.
3. **Nearly one enabled cloud routine in three is not completing.** 57 routines, 53 enabled, and of
   those **17 are not succeeding** — 10 FAILED, 2 ABANDONED, 5 never run. Among the failures is the
   feed-freshness watchdog that was built *because* feeds were rotting unnoticed.

*(One finding resolved mid-audit: the vendored browser package was untracked when I started — P1 committed it at 8da7316 before I finished, so a fresh clone now carries it. `MAC-SETUP.sh` itself was still uncommitted at 00:10 UTC; the two need to land together.)*

---

## What is HALT-blocked on Steven — one action each

| # | Action |
|---|---|
| 1 | **Decide what to do about the 15 published client names** in Command Deck v147 (`ZH_SEED`, lines 16421-16427) — and whether prior deck versions and backups get purged too. |
| 2 | **Open Claude on the iPhone, say "update my health stats in Notion", approve the Apple Health read and the Notion write once.** Unfreezes 9-day-old health tiles. |
| 3 | **Zoho CRM → Setup → Security Control → Profiles → the connected user's profile → enable "Zoho CRM API Access".** Unblocks `zohoLeads` and `zohoDeals`, which retires the seed in action 1. |
| 4 | **Lofty → Settings → Integrations → API: generate a key, put it in `~/.config/lofty/.env` as `LOFTY_API_KEY`, run `lofty-crm-sync` once by hand.** |
| 5 | **Click disable on the old "Pipeline Sync" routine** (`trig_018BSAYiYzvtyaUkpAY4SnqE`) at claude.ai/code/routines. It is `http_api`-created, three agent attempts have been refused, and a duplicate live one already covers the work. |
| 6 | **Decide the ISA seat** — packet `tw_isa_seat_20260922` has been open through three missed business days with no ISA-authored message ever sent. |
| 7 | **Decide Google Drive**: wire it, or drop the 0-file store from the fabric counts so the deck stops implying a feed that does not exist. |

---

## What I could not verify, and why

- **Anything on the Mac.** No Homebrew, no `launchctl`, no `runnerctl`, no keychain, no MCP servers in
  this sandbox. `mac-verify.sh` ran and reported 9 FAILs, all correct for this box and all meaningless
  as statements about Steven's Mac. Every "installed on the Mac" claim is therefore **unverified**, not
  false — it needs one `mac-verify.sh` run on the machine itself.
- **Whether the seven wrappers can actually drive their sites.** All 20 recipes ship `verified: false`,
  no credentials are present, and reaching a live logged-in site is both a credential use and outside
  read-only testing. The unit suites prove the code; they prove nothing about the sites.
- **Why 10 cloud routines are failing.** The platform returns
  `ROUTINE_RUN_FAILURE_REASON_UNSPECIFIED` for every one of them. Diagnosis needs the session logs.
- **The OmniRoute gate on real traffic.** H3b's sandbox execution is the strongest evidence that exists;
  the PII canary is explicitly reserved for Steven and the security steward.
- **Nothing was left half-run.** All eight harness suites, both HTML runtime passes, the full 291-second
  stress sweep and the live store read completed. No step was skipped for time or disk.

---

*Method: `bash -n` on all 7 shell scripts · `MAC-SETUP.sh --dry-run` end to end · `mac-verify.sh` ·
8 harness suites each in its own freshly created empty virtualenv · `runtime-harness.js` on both
published pages, with `--dump-text` to read rendered text rather than trust innerHTML counts ·
`stress-sweep.js` in full · a read-only pull of all 174 documents in collection `state` ·
`list_triggers` across all 57 cloud routines. Nothing was written to any store.*
