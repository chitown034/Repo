# VibeBreaker Final Report

change-set: 5647434569eaeae4

## Verdict

`SURVIVED*` (gate verdict: **SHIP**)

All three round-5 LOW findings are closed, and the fixes behave as described when run. Nothing above LOW is confirmed. Three LOW findings remain, all in the shebang sniff's coverage. Each one either fails closed or leaves a file without a syntax check. None lets broken code through without the hook also asking for an agent review.

## Scope

- Commit / branch: working tree vs HEAD 4caea92 (round 6, the last)
- Mode: narrow re-review of the uncommitted hunks only
- Stack: bash, git, Python 3 with PyYAML 6.0.1 present in this container
- Passes completed: 05, 20
- Inspected surfaces: the YAML branch (scripts/validate-code.sh:84), the extensionless shebang sniff (:86-92), test 17 (scripts/tests/test-validate-code.sh:122-132), hook file filter (.claude/hooks/validate-on-stop.sh:12) for the "silent vs. reviewed" question
- Excluded / unavailable context: everything outside the diff; the SKIP-yaml path on a machine without PyYAML (not available here)
- Material scope limitation: NO

Deterministic checks: `verdict: PASS (4 passed, 0 failed)` for change-set 5647434569eaeae4.
Gate tests: `validate-code gate tests: 29 passed, 0 failed`.

## Scoreboard

- Passes executed: 2 / 20 (narrow round, as scoped)
- Confirmed: 3
- Critical: 0
- High: 0
- Medium: 0
- Low: 3
- Info: 0
- Unverified: 0
- Rejected candidates: 3
- First critical pass: NONE

## Shebang probe (exact copy of lines 87-92, run on sample first lines)

| First line | Result |
|---|---|
| `#!/usr/bin/env python3` | py_compile (caught) |
| `#!/usr/bin/python` | py_compile (caught) |
| `#!/bin/bash -e` | bash -n (caught) |
| `#! /bin/sh` (space) | bash -n (caught) |
| `#!/usr/bin/env -S python3 -u` | **not checked** |
| `#!/usr/bin/env -S bash -e` | **not checked** |
| 93-byte `#!/opt/.../bin/python3` | **not checked** (interpreter is past byte 80) |
| `#!/usr/bin/python3 -u` + CRLF | FAIL "shebang has CRLF" (caught) |
| `#!/bin/bash` + CRLF | FAIL (caught) |
| `#!/bin/bash # use env python` | py_compile on a bash file: a false FAIL, so it fails closed |
| `#!/bin/zsh`, `#!/bin/dash` | not checked (outside the stated scope) |

None of the misses lets broken code through silently in the gated directories. A file that is not checked gets no PASS line, but it does not count as a failure either, so the verdict reads PASS. The file is still listed under `files:`, though. The Stop hook also blocks for agent review on any changed path under `bin/` or `scripts/`, whatever its extension (validate-on-stop.sh:12). An extensionless file outside `bin/`, `scripts/`, `.claude/hooks/` and `.github/workflows/` does not trigger the hook at all. That gap existed before this change and is not part of this diff.

## CONFIRMED

### P05-L1 — LOW — the 80-byte window misses long shebangs
- Location: scripts/validate-code.sh:87
- Trigger: an extensionless script whose `#!` line is longer than 80 bytes, with the interpreter name after byte 80. Linux reads up to 256 bytes of a shebang.
- Bad state: no case arm matches, so the file gets no syntax check and no SKIP line. The same applies to a CR after byte 80, which is cut off before the CRLF arm can see it.
- Impact: the syntax check is skipped. In bin/ and scripts/ the hook still requires agent review.
- Proof of fix: read the whole first line (`head -1` with no `-c 80`, or `-c 256`), and add a test with a 100-byte python shebang on broken code that expects rc=1.

### P05-L2 — LOW — `env -S` shebangs are not recognised
- Location: scripts/validate-code.sh:90-91
- Trigger: `#!/usr/bin/env -S python3 -u` or `#!/usr/bin/env -S bash -e`
- Bad state: `"env python"` and `"env bash"` must be contiguous, so the file falls through with no check.
- Proof of fix: patterns like `"#!"*env*python*` / `"#!"*env*" "bash*`, plus a test with broken code behind an `env -S` shebang that expects FAIL.

### P19-L3 — LOW — test 17 never runs the SKIP-yaml branch where PyYAML is installed
- Location: scripts/tests/test-validate-code.sh:130-131
- Trigger: any machine with PyYAML, this container included (6.0.1).
- Bad state: `PYTHONPATH=/nonexistent` adds a path and does not hide site-packages, so only the "FAILS when PyYAML is installed" branch runs. The `SKIP yaml` line at validate-code.sh:84 is never exercised here.
- Proof of fix: run `$V` with an interpreter that cannot import yaml (for example a PATH shim `python3` that runs `python3 -I -S`, or `python3 -c 'import sys; sys.modules["yaml"]=None'` through a wrapper), and assert `SKIP yaml bad.yml`.

## UNVERIFIED

None.

## REJECTED

- R1 — the CRLF arm could misfire because `$(...)` strips the CR — rejected: command substitution strips only trailing newlines. The probe showed CRLF caught for both bash and python shebangs.
- R2 — the CRLF `sh -c` could inject the filename — rejected: the `sh -c` string is a literal and `$f` is not passed to it (:89).
- R3 — a SKIP line could raise the PASS count — rejected: `say` only prints, and `run` is not called (:84), so the PASS count is unchanged.
- (Noted, fails closed, not a finding:) `#!/bin/bash # ... env python` is sent to py_compile and FAILs loudly.

## Coverage

- YAML branch :84: PASS/FAIL with PyYAML (test 17c ran here); the SKIP message is printed and not counted.
- Shebang sniff :86-92: probed with the 11 first lines above. Words outside a `#!` line no longer trigger the sniff (test 17a: `.md` and `Dockerfile` mentioning python PASS, `bin/launch` gets bash -n).
- CRLF arm :89: FAIL with a clear message (test 17b, and the probe).
- Hook filter validate-on-stop.sh:12: confirms the "reviewed, not silent" answer for bin/ and scripts/.

## Top 10 missing tests

1. A broken python script behind a shebang of more than 80 bytes in bin/ makes validate-code.sh exit 1.
2. A broken script behind `#!/usr/bin/env -S python3 -u` exits 1.
3. A broken script behind `#!/usr/bin/env -S bash -e` exits 1.
4. Without PyYAML (real absence, not PYTHONPATH), `bad.yml` prints `SKIP yaml bad.yml` and no `PASS yaml`.
5. A CR placed after byte 80 of a shebang is still reported as a CRLF failure.
6. `#! /usr/bin/env python3` (space after `#!`) gets py_compile.
7. `#!/bin/bash # env python` is routed to bash -n, not py_compile.
8. An extensionless file that is not a script (plain text, no `#!`) produces no check line and the verdict stays PASS.
9. An extensionless broken script outside bin/ and scripts/: document whether the hook should fire.
10. `#!/bin/sh` with a bash-only construct: a decision is needed on bash -n versus `sh -n`.

## Share card

```text
VIBE//BREAKER

VERDICT: SURVIVED*
PASSES: 2/20 (narrow round 6)
CRITICAL: 0
HIGH: 0
CONFIRMED: 3 (all LOW)
UNVERIFIED: 0
FIRST BREAK: NONE
```

## Release note

This round shows the following. The round-6 hunks pass syntax and shellcheck. The 29 gate tests pass. The shebang sniff catches the four common forms and CRLF, and it fails closed on the one misroute found. It does not show that every valid shebang form is syntax-checked: long and `env -S` shebangs are not. It also does not show the SKIP-yaml path running, because that path cannot run where PyYAML is installed.
