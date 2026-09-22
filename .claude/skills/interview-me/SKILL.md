---
name: interview-me
description: "The relentless 'Grill Me' interview: pulls what only Steven knows about one named topic out of his head and files it as structured knowledge — a vault 60-Knowledge note plus knowledge-graph entity stubs, with sensitive items held for the Sunday review gate. Use when Steven says 'interview me', 'grill me on X', asks to capture a playbook, a process, or lender/partner knowledge, or when a knowledge gap can only be closed in his own words."
---

# interview-me — Grill Me knowledge extraction (Second Brain L4 feed)

Seat: runs under Vanessa (Claude Fable 5.1 chairs). The interview itself is a judgment seat —
**Claude Opus 5**. No research sub-agents, no Perplexity: the only source is Steven.

## Trigger
- Steven says "interview me", "grill me on <topic>", "capture how I do X", or invokes this skill.
- An agent found a gap that only Steven can fill (e.g. a playbook referenced nowhere in the wiki).
  The agent **proposes** the topic; it never starts an interview unattended.
- Never fires on a schedule. There is no unattended mode — an interview needs a human answering.

## Inputs
- `topic` (required) — one topic per run. If Steven names three, interview the first and list the rest.
- Existing context, read-only, for de-duplication: `wiki/<topic>/index.md`, `references/`,
  vault `60-Knowledge/`, and the deck doc `secondBrain` (Notion mirror, synced by `brain-deck-sync`).
- `knowledge-graph/schema.md` — the entity types and relationship vocabulary. Use those types only.

## Data access
Deck reads/writes go through the `Artifact` tool against the Command Deck artifact
`https://claude.ai/code/artifact/1624daae-d683-405a-971d-c5828dce0f8d` (the `ArtifactData` tool
where the host names it that): `read_db`, `db_op:"get"`, `collection:"state"`, `doc_id:"<doc>"`;
`write_db`, `db_op:"set"` — not `update`, which fails when the doc does not exist yet — with
`data:{v:<the whole doc>}`. Read before every write and append; never overwrite an array you have
not read. Every doc is `{v:…}` except `stravaSnapshot`.

## Procedure
1. **Scope.** State the topic back in one line and name the output path you will write. Ask Steven to
   confirm or correct the scope. Do not start until he does.
2. **Prior art.** Skim the inputs above for what is already captured. Say what already exists so the
   interview does not re-ask it. Never present prior art as his answer.
3. **Grill, one question at a time.** Five rounds, never a multi-question dump, never a leading
   question that supplies the answer:
   - R1 Frame — what this is, when it applies, who is involved.
   - R2 Mechanics — the actual steps, in order, with the tool or form used at each one.
   - R3 Numbers — thresholds, timings, costs, ratios; every number gets a unit and a source.
   - R4 Exceptions — when the normal path does not apply, and what he does instead.
   - R5 Failure — how it goes wrong, what the tell is, what it costs, how he recovers.
   Close each round by reflecting his answer back in ≤3 lines and asking "what did I get wrong?".
4. **Push once, then move on.** If an answer is vague, ask one sharpening question ("give me the last
   real example"). If it is still vague, record it as `openQuestion` and move on. Do not nag.
5. **Extract.** Turn the transcript into: the note body (below), entity stubs, and open questions.
6. **Classify sensitivity** per row: `public` (programs, process), `internal` (his numbers, partners),
   `sensitive` (client-identifiable detail, credentials, account or license numbers, anything about a
   named borrower). Sensitivity is per-fact, not per-note.
7. **File.** Write the note and entity stubs. Sensitive notes go to `60-Knowledge/_review/` and wait
   for the Sunday gate. Log the run. Tell Steven exactly what was written and what is held.

## Outputs (exact shapes)
**Vault note** — `60-Knowledge/<YYYY-MM-DD>-<topic-slug>.md`, or `60-Knowledge/_review/` when any row
is `sensitive`:
```markdown
---
title: <Topic>
source: interview-me
interviewedAt: <ISO 8601, America/Los_Angeles>
sensitivity: public|internal|sensitive
review: none|pending
entities: [<slug>, …]
openQuestions: [<string>, …]
---
## Frame
## Mechanics   (numbered steps, tool per step)
## Numbers     (value · unit · how he knows it)
## Exceptions
## Failure modes
## Open questions
```
**Entity stubs** — `knowledge-graph/entities/<type>/<slug>.md`, one per entity, using only the types
and relationship verbs in `knowledge-graph/schema.md` (clients, lenders, partners, agents, tools):
```markdown
---
type: <entity type from schema.md>
slug: <slug>
firstSeen: <ISO date>
sources: [60-Knowledge/<note file>]
---
- <relationship verb> :: <target slug>   # one line per typed relationship
```
**Deck log** — `interviewLog`, `{v:[{ts, topic, rounds, questionsAsked, notePath, entities:[slug],
sensitive:bool, heldForReview:bool, openQuestions:n}]}`, newest last, keep the most recent 200.

## Guardrails
- Never answer for Steven. An unanswered question is `openQuestion`, never a filled blank.
- Never write to Notion. `brain-deck-sync` and `brain-learn-daily` own the Notion path; this skill
  writes files and one deck log doc. A note reaches Notion only after the Sunday gate, by those tasks.
- Never graph a secret: no credentials, API keys, account numbers, SSNs, DOBs, loan numbers, or a
  named borrower's financial detail in `knowledge-graph/` — those stay in the note, and only in a
  `_review/` note. Entity stubs carry names and relationships, not amounts.
- Client-identifiable material stays FULL-CONTEXT in `wiki/clients/<client>.md`; it is never chunked
  into `vector-index/` (Second Brain L3 rule: never vectorize documents that must be read whole).
- One topic per run; one question at a time; no sub-agents; no web research.
- Never overwrite an existing note. A second interview on the same topic appends a dated section.

## HALT conditions
Halt, write a Needs-Steven packet, and stop — do not work around it. Per the engineering standard,
escalate **"anything irreversible, outside scope, needing credentials/permissions/money, or a human
decision."** Concretely, for this skill:
- Steven volunteers a credential, key, or account number → do not write it anywhere; tell him it
  belongs in the Mac keychain or a `.env`, and halt that line of questioning.
- The topic would require reading a client file or a system this skill has no grant for.
- Steven asks for the note to go straight to Notion or to a shared surface, bypassing the Sunday gate.
- A rename, merge, or delete of existing vault notes or entities (destructive) would be needed.

Packet: append to `twinQueue` — `{id:"tw_<epoch-ms>", ts:<ISO>, from:"vanessa", priority:"p2",
status:"needs-steven", task:"<one line>", note:"<what is blocked, what you need, options>"}`.

## Logging
- One `interviewLog` entry per run (shape above), written even when the interview is abandoned
  (`rounds` = how far it got, `heldForReview:false`, `notePath:null`).
- Sensitive runs additionally set `review: pending` in the note frontmatter and land in
  `60-Knowledge/_review/`; `brain-weekly-verify` (Mac runner, cron `0 16 * * 0` = Sun 4:00 PM PT,
  last ok 2026-09-14) is the review gate that clears them.
- No `ciLog` line — this skill does not change the dashboard.

## Self-test (`selftest:interview-me`, nightly suite, Functional)
Bounded, offline, ≤20 s, writes nothing outside a temp directory. The nightly suite
(`nightly-self-test`, cron `0 23 * * *`) has been failing on timeout (exit 124, last error
2026-09-15), so this test must never dispatch a sub-agent or hit the network.
1. Frontmatter round-trip: render the note template with `topic:"selftest"` into a temp file and
   parse it — every key above present, `interviewedAt` an ISO date. Fail on a parse error.
2. Sensitivity classifier: feed three canned strings — `"account 1234567890"`, `"borrower Jane D.,
   credit 640"`, `"VA IRRRL has no appraisal requirement"` — expect `sensitive`, `sensitive`,
   `public`. Any other result is a Fail.
3. Graph guard: attempt an entity stub containing `"api_key"` and assert the write is refused.
4. Log shape: build one `interviewLog` entry in memory and assert every key in the shape is present
   and `ts` parses. Do **not** write it to the deck.
Report `{id:"selftest:interview-me", category:"Functional", result:"Pass|Fail", detail}` into the
nightly `selfTest` doc.
