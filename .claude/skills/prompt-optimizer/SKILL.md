---
name: prompt-optimizer
description: "Rewrite a work-package brief into an optimized dispatch prompt for a sub agent (role, goal, inputs, constraints, output shape, done-criteria, what not to do, model tier) before any dispatch. Also answers to prompt-master. Use on every brief Vanessa or a lead is about to hand to a sub agent, and on any prompt the user wants tightened."
---

# prompt-optimizer (alias: prompt-master)

Every brief gets this pass before it reaches a sub agent (dispatch rule, decided 2026-09-14). It optimizes the prompt; it never dispatches and never widens the task.

## Input and output
Input: a brief from `interview-me`, from Vanessa's decomposition, or a raw prompt the user pastes.
Output: the optimized prompt, ready for an Agent call, plus two lines on what changed and why.

## The pass
1. **Role** — one line: who the agent is and which seat and model tier it runs on (Opus 5 for research or judgement, Sonnet 5 for execution; Vanessa alone on Fable). Research work names the Perplexity seat.
2. **Goal** — one measurable sentence; the done-criterion is explicit and checkable.
3. **Inputs** — exactly what the agent gets: file paths, Notion rows, prior findings. Recall was done once by the orchestrator; the brief carries the result, the agent does not recall again.
4. **Constraints** — the standing rules that apply (draft-only, counted-never-named, systems of record) and token discipline: read only what is routed, do not restate rules the agent file already holds.
5. **Output shape** — format, length cap, and where it goes: answer, file, or brain (the brain only on Steven's confirmation).
6. **Not this** — the two or three nearest wrong interpretations, named.
7. **Return protocol** — a spawned sub agent is never a finished package; it reports to its lead, the lead integrates.

## Rules
- Shorter is better; cut anything the agent cannot act on.
- Keep the user's own words for anything they specified (names, numbers, deadlines); invent no scope.
- Still ambiguous after the pass? Send it back to `interview-me` rather than guessing.
- The Mac-side vanessa-orchestrator pass is canonical; this copy keeps remote sessions consistent.
