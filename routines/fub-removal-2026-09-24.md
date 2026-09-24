# Follow Up Boss removed — what was done, and the three edits only Steven can make

**2026-09-24.** Steven: *"remove FUB aka Follow Up Boss from all routines, and everything. Lofty CRM
replaced it as my primary CRM for real estate. Zoho is my primary CRM for mortgages."* Recorded in
`context/decisions.md`.

## Done from the cloud session, and verified

| What | Before | After | Proof |
|---|---|---|---|
| **Composio connection** `follow_up_boss_many-weism` | ACTIVE, rejected key — the thing `r2-lead-response-watchdog` hit every night (exit 137, 8th time running) | **Removed.** Composio: *"No remaining accounts."* Nothing — no routine, no Mac task, no agent — can call it any more. Steven's Follow Up Boss account and data are untouched; only the link is gone | `COMPOSIO_MANAGE_CONNECTIONS` remove, 2026-09-24 |
| **Real Estate Weekly Brief** `trig_01CjaMXrbMga1jPdJzUnwLUo` (agent-created) | 6 mentions — all a guard telling it never to call the old CRM | **0.** The guard is kept in Lofty terms, plus the Composio trap below. Rest of the 6,426-char prompt byte-identical | live prompt re-read after `update_trigger`, 12:27 UTC |
| **`aiTeamRoster`** (Command Deck store) | two job descriptions: a CRO report that "triages Follow Up Boss leads"; marketing analytics "across Follow Up Boss and Zoho" | **Lofty** in both. v8 → v9 | read back: `{v}` shape, 0 mentions |
| **`secondBrain`** (Command Deck store) | the system-of-record entry: "Follow Up Boss for everything real estate", in three places plus its search terms | **Lofty**, with a note that the ISA SOP text itself still needs the same update. v38 → v39 | read back: `{v}` shape, 0 mentions |

Both store writes were made from disk with `file_path` and pinned with `if_version`, in one atomic
batch — nothing was retyped, and a concurrent change would have refused the write rather than been
overwritten.

### A trap worth knowing — Composio will hand you the wrong CRM

Asked for **Lofty**, Composio's tool search returned `FOLLOW_UP_BOSS_LIST_CALLS`. Asked for
**ShowingTime**, it returned `FOLLOW_UP_BOSS_LIST_APPOINTMENTS`. Asked for **homes.com**, it returned a
Zillow/Redfin scraper. It never says "I have nothing for that" — it offers the nearest thing it has.
**Composio has no Lofty, ShowingTime, Showami or homes.com toolkit.** Any agent that trusts that search
will believe it has connected Lofty while querying a different system. The Real Estate Weekly Brief now
carries this warning in its prompt. With the old connection removed, the specific danger is gone; the
behaviour is not.

## The three edits only Steven can make — routines created in the web UI

These three were made through the claude.ai web UI (`http_api`), and every agent attempt to change one
has been refused. Open each link, find the **old** text, replace it with the **new** text, save. Each
old string was checked against the live prompt on 2026-09-24 and occurs **exactly once**.

### 1. Vanessa orchestrated ops review — enabled, Fri 4 PM PT
https://claude.ai/code/routines/trig_01V6QrF6yENWiccduk94ubbs

| Old | New |
|---|---|
| `Dual CRM, never blended: Zoho CRM (+ARIVE) for mortgage, Follow Up Boss for real estate.` | `Dual CRM, never blended: Zoho CRM (+ARIVE) for mortgage, Lofty for real estate.` |

This one matters most: it tells the whole C-suite which CRM is real estate's every Friday.

### 2. Weekly self-improvement loop — enabled
https://claude.ai/code/routines/trig_016qKE1TdRjzkpb2Yby8yWBX

| Old | New |
|---|---|
| `FUB import data (both dashboards)` | `Lofty import data (both dashboards)` |

### 3. Steve twin — currently DISABLED
https://claude.ai/code/routines/trig_0174717mnSfAk1LtQQVJhH7r

**Make these edits before you enable it** (runbook I4 asks you to re-enable it). As it stands it
describes the old CRM as your real-estate system and reads it through Composio.

| Old | New |
|---|---|
| `Dual-CRM operator, never blended: Zoho CRM + ARIVE = mortgage; Follow Up Boss = real estate.` | `Dual-CRM operator, never blended: Zoho CRM + ARIVE = mortgage; Lofty = real estate.` |
| `pushed to Calendar / Follow Up Boss / Showami` | `pushed to Calendar / Lofty / Showami` |
| `Composio (Follow Up Boss / Zoho CRM), Notion, Slack, Strava` | `Composio (Zoho CRM), Notion, Slack, Strava` |

**Leave one thing alone:** the showings shape in that prompt contains a field called `fub`
(`{id, name, fub, showings: …}`). That is a **data key**, not a CRM reference — the Command Deck stores
each client's CRM id under it. Renaming it in the prompt without migrating the stored data would break
the twin's reading of the showings. Whether to migrate the key is decision I5b; until then it stays.

## Still Steven's, on the Mac — runbook B4

Four Mac task prompts still target the old CRM: `lead-triage-daily`, `r2-lead-response-watchdog`,
`r11-isa-kpi-compile`, `showing-sync`. Replacement text: `docs/inventory/mac-task-descriptions.md`.
With the Composio connection gone they will now **fail immediately** ("no active connection") instead
of being killed after a timeout — faster and clearer, but still wrong until the prompts say Lofty. The
morning brief will keep reporting it until then.

## Left on purpose — records, not configuration

Changing these would falsify a record, or be overwritten by its own task within hours:

- **History.** Chat and message logs (`steveChat`, `jamesChat`, `isaLine`, `twinLog`, `agentInbox`,
  `ciLog`, `loopLog`, and the ISA Portal's `isaLine`) record what was actually said.
- **Dated measurements.** The ISA Portal's `isaKpi` is a 2026-09-13 measurement taken from the old CRM
  while it was the system of record. Relabelling those numbers "Lofty" would claim Lofty measured
  something it never did. It is replaced when `r11-isa-kpi-compile` is pointed at Lofty.
- **Mirrors of live state.** `toolkitSnapshot` describes what the Mac tasks do *today* — and today four
  of them still target the old CRM. It is accurate, and corrects itself after B4.
- **Task output.** `leadResponse`, `leadTriage`, `routineHealth` and the like are rewritten by their tasks.
- **Dated repo records.** Findings, cycle briefs and reports say the CRM *"was Follow Up Boss until
  2026-09-22"* — that is the record of the change itself.
