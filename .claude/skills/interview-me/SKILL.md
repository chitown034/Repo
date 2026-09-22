---
name: interview-me
description: "Interview the user relentlessly, one focused question at a time, until an ambiguous request has a goal, constraints, done-criteria and context, then hand back a brief. Use when a request is vague, multi-part, or would otherwise start from assumptions, and for extracting everything about a client, business or system (the Grill Me pattern)."
---

# interview-me

Turn an ambiguous ask into a brief nobody has to guess at. Vanessa's dispatch rule: interview when ambiguous, before decomposing.

## When to run
- The request could reasonably mean two materially different pieces of work.
- A success criterion, deadline, audience or constraint is missing and would change the output.
- You are about to populate the Second Brain or a knowledge graph about a client, business or system and need everything extracted (adapted from Matt Pocock's "Grill Me").

## How
1. Say in one line what you think is being asked and what you are unsure about.
2. Ask one question at a time, or one `AskUserQuestion` call with at most four questions when that tool exists. Every question must change what you would build. Never ask what `CLAUDE.md`, `context/`, `wiki/` or the Second Brain already answer — look first.
3. Give a default with each question so a one-word answer is enough.
4. Track known and unknown. Stop the moment nothing material is missing; do not interview for completeness' sake.
5. Return the brief: Goal (one sentence) · Why it matters · Inputs in hand · Constraints and standing rules that apply · Done when · Out of scope · Open risks · Recommended owner and model tier (Fable masterminds, Opus researches, Sonnet executes).
6. Hand the brief to `prompt-optimizer` before any dispatch.

## Rules
- Confirmed answers are durable: append material decisions to `context/decisions.md` with the date. Unconfirmed guesses never go to the brain.
- The Mac-side vanessa-orchestrator copy of this skill is canonical; this project copy makes remote sessions behave the same way.
