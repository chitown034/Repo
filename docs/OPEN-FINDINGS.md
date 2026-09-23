# Open findings — the real remaining surface

**Produced 2026-09-23 by the Findings Closer.** Every finding in `docs/findings/` was parsed, the
recorded-open set was re-verified against the repo as it stands, the live artifact store and the live
routine listing, and each row was given a verdict in `docs/findings/findings-R2.json`. This page is
the residue: **what is still open, and who is the only one who can close it.**

Reads only. No artifact-database write, no routine touched, no credential read, nothing spent.
Live evidence behind this page: routine listing **2026-09-23 03:05 UTC**, `state` listing and document
reads **2026-09-23 03:10 UTC**, `runnerStatus` **at its own 2026-09-23 02:10 UTC stamp**,
`feedFreshness` **at its own 2026-09-23 00:50 UTC stamp**.

Read this next to `docs/NEEDS-STEVEN-R2.append.md`, which carries the corrections to
`docs/NEEDS-STEVEN.md` items 0–48 by name. **No item was renumbered.**

---

## The headline

| Verdict | Rows | What it means |
|---|---:|---|
| `already-closed` | 48 | Recorded open. Was not open. |
| `fixed-now` | 10 | Fixed in this pass, each proved by re-reading the file or the live source. |
| `halt` | 169 | Steven's — a credential, an account change, a live task or routine, a decision, or a licensed call. |
| `unfixable-here` | 138 | Needs macOS, a signed-in browser, an upstream change, or the published deck HTML, which is not in this repo. |
| **Total triaged** | **365** | Out of 787 recorded findings across 46 files. |

**48 of 365 were bookkeeping, not breakage** — about one in eight of the "remaining" surface had
already been dealt with and nobody went back to the finding. The concentration is worth knowing:
**10 of the 48 are in a single file**, `findings-P4.json`, written on the last night of the
engagement, and six more are in `findings-P2.json`. Late audits re-report what earlier ones fixed.

The 169 halts are not 169 problems. **144 of them are already collected on `docs/NEEDS-STEVEN.md`** —
the same twenty-odd blockers cited by up to ten findings each. The genuinely uncollected HALT surface
is small, and it is §1 below.

---

## 1. Steven — nothing else moves until he does

Worst first. Anything already on `docs/NEEDS-STEVEN.md` is named by its item number rather than
repeated; **the corrections to those items are in `docs/NEEDS-STEVEN-R2.append.md` and should be read
first**, because two of them save a trip.

### 1.1 — PII on published surfaces (three, not two)

Two were already disclosed to him. **The third is new to the list** and is the one that reads least
like PII, which is why it survived:

| Surface | State on 2026-09-23 |
|---|---|
| Deck `cdStateSeed` / `PROPERTIES_DEFAULT` | Disclosed. His own addresses, balances, lenders, rates, account numbers, APRs — in page source, in every published version and every backup. Explicitly **not** covered by the 2026-09-23 lead-board decision. |
| ISA Portal `pipeline` / `reClients` store | Disclosed. Client surnames with loan amounts; the portal is **not** exempted by that decision. |
| **Live `auditFindings` document, Command Deck store** | **NEW ROW.** v3, 288,849 bytes, `syncedAt 2026-09-22`. Still carries two client identifiers in initial-plus-surname form, each paired with a loan amount and a stage. X2's redaction reached `docs/MASTER-FINDINGS.md` and `docs/data/auditFindings.json` — both verified clean — and **did not reach the published store**. The deck renders this document. `docs/findings/findings-E12.json` carries the same two rows. |

`docs/NEEDS-STEVEN.md` item 26 covers this, but says "the audit corpus", which reads as files. The
point is that one of them is a document the published dashboard renders. *No identifier or amount is
reproduced anywhere in this pass's output.*

### 1.2 — Clocked

1. **Today, 12:47 UTC — the Strava wrapper guard's first firing ever** (item 1). `stravaSnapshot` is
   still correctly wrapped at v9 as of 03:10 UTC. The Mac task still writes it bare and its prompt is
   his; the new cloud guard should catch that 27 minutes later. Nobody knows yet whether the guard
   works.
2. **By Fri 2026-09-25 — the ISA seat** (item 3). Unchanged: no ISA-authored message has ever
   existed, `isaScorecard` is still `[]`, `isaLadder` still reads `rung: "halted"` with three
   consecutive misses and an open needs-Steven packet.
3. **By 2026-09-30 — the Q3 multi-state licensing window** (item 4). Business, not ecosystem, and
   only the licensee can file.

### 1.3 — One credential or one click, highest value first

4. **Lofty API key** (item 6). `loftyLeads` exists and says so honestly — *"no sync has yet written
   this document"*. **No real-estate lead number anywhere in this system is live.**
5. **Zoho CRM API Access toggle** (item 5). `zohoSync` v1 carries the 403 and the click path.
   `zohoLeads` and `zohoDeals` **do not exist at all** — the Deals module has never been read.
6. **The duplicate Pipeline Sync** (item 7). Re-verified: **both are enabled and both report
   SUCCEEDED** — the old `http_api` one (`0 1,7,13,19`, last 2026-09-23T01:07) beside the real
   `meta_mcp` one (`0 4,10,16,22`, last 2026-09-22T22:08). One provably moves nothing and produces
   four green rows a day.
7. **`r4-quantvue-sync` is refused** (items 8, 9). Still `refused` on the runner; `strategySnapshot`
   is ~165 hours stale. Two writers, one disabled, one refused.
8. **`isaLadder.updatedAt` stamps the slot, not the write** (item 12). Now proved rather than
   asserted — body `14:30:00Z` = the cron slot, run fired `14:33:39Z`, envelope `14:35:53Z`. A
   freshness sweep reading the envelope passes it.
9. **`runnerStatus` stamps Pacific wall-clock with a `Z`** (item 10). Still true: the document's
   internal `updatedAt` reads `2026-09-22T19:05:47` beside a `syncedAt` of `2026-09-23T02:10:00Z`.
10. **`CLI_HUB_NO_ANALYTICS=1` before the first `cli-hub` command** (item 11).

### 1.4 — Decisions, each one line

11. **Apple Health** (item 14) — `appleHealth` is ~218 hours stale; the daemon is the cause and the
    phone route is built and waiting on one run.
12. **Google Drive — wire it or drop it** (item 15). `knowledgeFabric` still counts a *"Drive folder,
    0 files"* beside five real stores. A 0-file store rendered as a live store is a false green.
13. **ECC security review sign-off date** (item 39) — SkySlope and zipForms refuse every live command
    until it exists, and it is a licensed-risk call.
14. **Do not enable the OmniRoute failover yet** (item 36) — the canary has never run against a real
    CLI, a real login or a real store.
15. **His own financial detail in the deck's page source** (F-Q3-10) — see §1.1.
16. **`context/decisions.md` append-only violation** (item 19), **Composio credential rotation**
    (item 20), **retired-CRM residue** (item 21), **mentor naming** (item 27), **licence renewal
    dates** (item 28) — all unchanged.
17. **Nine cloud routines still FAILED**, stable since 2026-09-20 and listed in the R2 append. Seven
    are `http_api` and only he can edit them; **two are `meta_mcp`** and an agent could retire or
    re-point them if he says so.

---

## 2. A Mac session — his hands, but not his judgement

18. **`openrouterFeeds` frozen since 2026-09-13 while its writer reports `ok`.** ⚠ The worst thing on
    this page that nobody had written down. The task stopped erroring and started succeeding without
    writing. A failing task is visible; this is not. Found by the first `feedFreshness` sweep.
19. **`brain-weekly-verify` has not run since 2026-09-14** on a Sunday cron, so the 09-20 gate passed
    with nothing run. Not in the error set, not in the never-run set — which is why no finding covers
    it. It is the gate responsible for promoting memory and triaging the Second Brain inbox.
20. **`nightly-self-test` is the only task still in error** (exit 124, timeout). No `selfTest`
    document has ever existed, so the stack's only runtime-regression gate is off.
21. **`lead-triage-daily` and `feeds-weekly` are refused** — new states since the audit, both now
    blocked rather than failing.
22. **`ops-knowledge-graph` has still never run**; `knowledgeGraph` is frozen on its 2026-09-13 build
    (item 42, now a one-task problem — `steve-twin-sweep` recovered).
23. **18 weekly/monthly slots have still never run**, including `revenue-scan-weekly` and
    `health-coaching-weekly` (item 43), `r11-isa-kpi-compile`, `r5`, `r6-weekly-backup`, `r9`,
    `loop-engineering-weekly`, `vanessa-ops-review`, `skills-refresh-weekly`.
24. **Neither `MAC-SETUP.sh` nor `mac-verify.sh` has ever run on macOS** (item 35). Every verification
    behind them was done on Linux in a throwaway prefix.
25. **`taskLease` before Mac #2's runner is enabled** (item 37) — `taskLease` does not exist in the
    store, so the lease check has never created it.
26. **The eight `~/.cli-anything-*/history` paths** need a place in the backup and encryption scope.
27. **The 18 browser recipes have never been run against a live site.** All ship `verified: false` and
    need a signed-in browser and a `--discover` pass per recipe (item 38).

---

## 3. Another seat in this repo — exact replacements are written and waiting

28. **Three skill files still carry the disproved cloud-write rule** — `ai-ecosystem-backup`,
    `scale-growth-engine`, `skills-refresh`. A skill that tells an agent a write is impossible will
    stop it attempting one that now works, and the agent will report the refusal as a fact.
29. **`mac-verify.sh` has no presence check for five advisory-only tools**, so `--only <name>` and the
    checker disagree about reality.

Both are hand-backs in `docs/NEEDS-STEVEN-R2.append.md` §2, with content anchors rather than line
numbers. A third hand-back was withdrawn: another seat closed `always-on/README.md`'s feed-freshness
row at commit `39a7344` while this page was being written.

---

## 4. Upstream — a local patch would be the wrong fix

30. **`DOMSHELL_TOKEN` is passed in argv and is visible in `ps`.** Read from the published package
    rather than assumed: `@apireno/domshell` 2.0.10 reads the token from argv and nowhere else, with
    no environment fallback, so no wrapper can fix it. The one-line ask upstream is a
    `process.env.DOMSHELL_TOKEN` fallback.
31. **The browser harness pins the MCP SDK below 1.0**, which resolves to a November-2024 release.
32. **`npx -p @apireno/domshell` is spawned with no version pin** — third-party code fetched and run
    at each invocation, on the Mac that holds client files.
33. **`is_available()` passes without checking the token**, so a missing token surfaces late.
34. **The prompt-injection guard's false-positive rate is unmeasured** — its pattern list includes the
    bare words `forget` and `disregard`, which ordinary listing copy contains.

---

## 5. Nobody yet — no reachable owner can close it today

35. **Everything scoped to `command-deck.html` — 109 of the 138 `unfixable-here` rows.** The deck is a
    published artifact and **is not in this repository**; only `dashboard/isa/isa-portal.html` and
    `dashboard/panel-orchestration.html` are. Panel copy, renderer bugs, seed re-bakes, stamp wiring,
    the `\uXXXX` literals, the retired-CRM residue in page source — all of it needs whoever holds the
    deck this cycle. This is the single largest block on the page and it is a *routing* problem, not a
    backlog: it has no owner named anywhere.
36. **Artifact-database document writes**, which no read-only pass may make: `dmaicProjects` d3 still
    names the retired CRM and names Lofty nowhere; the ISA Portal's `isaKpi` is still v1 reading
    *"ISA self-report vs FUB delta"* against the deck copy's *"vs CRM delta"*; the portal's `pipeline`
    and `reClients` still carry client data.
37. **`selfTest`, `skillsAudit`, `vanessaQueue`, `plaidBalances`, `cliAnythingStatus`, `taskLease`,
    `revenueScan`, `healthCoaching`, `zohoLeads`, `zohoDeals`** — ten documents that surfaces refer to
    and that have never been written. `improvementProposals` exists but is an empty array.

---

## 6. Findings that were themselves wrong

Worth as much as a fix, because each one was on its way to being re-applied.

| Finding | The claim | What is true |
|---|---|---|
| F-P4-07 | `cloudWriteProbe` has no write timestamp | It does: `updatedAt 2026-09-22T09:05:56Z`, on the **envelope**. An export of `v` alone does not show it. `REMOTE-ACCESS.md` already cites it correctly. |
| F-P4-13 | 20 browser recipes, not 18 | **18 recipes** — homes 3, ShowingTime 4, Showami 4, SkySlope 4, zipForms 3. There are 20 `verified:false` flags because SkySlope and zipForms each carry a file-level `verified` key as well. Counted independently. |
| F-P4-06 | `always-on/README.md`'s feed-freshness row should say FAILED | Applying it would have written a new untruth. The routine SUCCEEDED 2026-09-23T00:18:51Z and wrote `feedFreshness`. |
| F-P6-07 | Graphify needs a NOTICE | Dual-licensed Apache-2.0 **OR** MIT, and pip-installed rather than vendored. Closed. |
| F-P4-01 | Client names must come off the lead board | Steven decided otherwise on 2026-09-23. Full names stay on that board, scoped to a name and a stage, that board only. |

All five are now dated lines in `memory.md`, so the next pass does not rediscover them.

---

## 7. What was fixed in this pass

Each proved by re-reading the file or the live source it describes.

| What | Why it mattered | Commit |
|---|---|---|
| `README.md` carried the disproved cloud-write rule | The front door contradicted `wiki/dashboard-ops/index.md`; every agent reads it first | `9ad758c` |
| `CONNECTIONS.md`: `pip install .` per package | The documented install exits 1 for three of the seven harnesses | `9ad758c` |
| `CONNECTIONS.md` + `OPTIMIZATION.md`: Orca "Installed on the Mac" | An install asserted from a sandbox that cannot see a Mac; now marked, not deleted | `9ad758c`, `bc91f0b` |
| `wiki/dashboard-ops/index.md` + `projects/command-deck.md` re-derived live | Both quoted a 2026-09-22 08:10 UTC export as the present: 161 docs → 175, 60 tasks → 59 | `a225dd6` |
| `recall-cache.md` staleness table | Had **no row** for the failure mode that actually bit — a task reporting ok over a document that has not moved | `c1812bc` |
| `memory.md` | Empty while the same corrections were re-discovered by successive engineers; seven dated lines | `c1812bc` |
| `integrations/mac-task-specs.md` §2 | Right conclusion, false reason | `bc91f0b` |
| `docs/CAIO-DISRUPTION-BRIEF.md` CAIO-01 | A proposal sitting open whose test had already been run and passed | `bc91f0b` |
| `docs/INTEGRATOR-TODO.md` | Three done items unticked, making the list look larger than it is | `42b8ee1` |

---

## 8. What could not be verified from here

Said plainly, because an unverified claim on this page would be the same defect it documents.

- **Anything on macOS.** No Mac is reachable: no install, no LaunchAgent, no keychain, no real
  `claude` login, no OmniRoute server, no signed-in browser. Every Mac task status here is what
  `runnerStatus` *says*, which is itself a document written by the thing being audited.
- **`command-deck.html`.** Not in this repository, so no line, renderer or panel claim about it was
  re-checked; the 109 deck-scoped rows are triaged by scope, not re-proved.
- **Whether a "successful" cloud routine did anything useful.** The listing gives status, not output.
  `Project Risk Review` SUCCEEDED, which answers the question item 2 asked; it does not prove the run
  was worth anything.
- **The two `meta_mcp` failing routines' causes.** Their failure reason is
  `ROUTINE_RUN_FAILURE_REASON_UNSPECIFIED`, and diagnosing ten unspecified failures is its own task.
- **The 18 browser recipes.** Nothing here reached a live site, and nothing may.
