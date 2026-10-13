# VibeBreaker Final Report

change-set: c28c07ba153d300a

## Verdict

`SURVIVED*` (gate verdict: **SHIP**)

The three round-4 findings are closed and reproduced as closed. No critical or high finding remains. Three LOW findings in the new shebang sniff and YAML check are confirmed. The first fails closed, and the other two are reporting gaps.

## Scope

- Commit / branch: working tree vs HEAD, round 5 (since change-set cc3261e7c0f3fce9)
- Mode: narrow re-review of the round-5 hunks
- Stack: bash 3.2-safe shell, git 2.43.0, Python 3 with PyYAML 6.0.1 present here
- Passes completed: 05, 19, 20
- Inspected surfaces: the `g()` wrapper and `--no-renames` (scripts/validate-code.sh:25, 30-31, 43), the YAML branch (:84-89), the shebang sniff (:91-94), hook line 12 (.claude/hooks/validate-on-stop.sh), tests 14-16 (scripts/tests/test-validate-code.sh:104-119)
- Excluded / unavailable context: everything else in the diff
- Material scope limitation: NO

Deterministic checks: `verdict: PASS (14 passed, 0 failed)`, change-set `c28c07ba153d300a`.
Gate tests: `validate-code gate tests: 26 passed, 0 failed`.
All probes ran in a throwaway git repo in the session scratchpad, which was deleted afterwards.

## Scoreboard

- Passes executed: 3 / 20 (narrow round)
- Confirmed: 3
- Critical: 0
- High: 0
- Medium: 0
- Low: 3
- Info: 0
- Unverified: 0
- Rejected candidates: 4
- First critical pass: NONE

## CONFIRMED

### P05-F1 (LOW, confidence HIGH): the sniff runs py_compile on any non-Python file whose first line contains "python"
- Location: scripts/validate-code.sh:91-92
- Trigger: a changed file that matches no earlier case arm, so not only extensionless files, and whose first line contains `python` anywhere, not only after `#!`. Also a bash script whose shebang line mentions python, because the `*python*` arm is tested before the bash arms.
- Bad state: a false FAIL. Reproduced: `requirements.txt` starting with `python-dateutil==2.9.0`, `docs/notes.md` starting with `# python helpers`, a `Dockerfile` starting with `FROM python:3.12-slim`, and `bin/run` starting with `#!/bin/bash # python launcher` each gave `FAIL py_compile <file>`, `verdict: FAIL`. Because --mark needs a PASS, a correct change-set cannot be marked until the file's wording is changed. A binary holding NUL bytes also prints `warning: command substitution: ignored null byte` (line 91).
- Existing controls checked: in the current tree the only tracked file that matches is `bin/brain`, which really is Python, so nothing fails today. The failure is closed and lets nothing through unchecked.
- Remediation direction: anchor the arms on the shebang, for example `'#!'*python*` (or `#!*/python*|#!*env\ python*`). Put the bash arms first, or match on the interpreter token only.
- Verification: test that an untracked `notes.md` whose first line is `# python notes` and a `Dockerfile` with `FROM python:3` both PASS, and that `#!/bin/bash # python` runs `bash -n`, not py_compile.

### P05-F2 (LOW, confidence HIGH): a CRLF shebang passes both checks but the script cannot run
- Location: scripts/validate-code.sh:92-93
- Trigger: an extensionless script saved with CRLF line endings, `#!/bin/bash\r\n...` or `#!/usr/bin/env python3\r\n...`.
- Bad state: `PASS bash -n bin/crlf` and `PASS py_compile bin/crpy`, but running them gives `cannot execute: required file not found` and `/usr/bin/env: 'python3\r': No such file or directory`. The gate reports PASS on a script that cannot be executed.
- Existing controls checked: none. `bash -n` and `py_compile` both accept CR in simple statements.
- Remediation direction: FAIL any shebang line that ends in `\r`, for example `head -1 | grep -q $'\r'`.
- Verification: test that `printf '#!/bin/bash\r\necho hi\r\n' > bin/x` makes the checks FAIL.

### P05-F3 (LOW, confidence HIGH): with PyYAML missing, the skipped YAML check is reported as PASS
- Location: scripts/validate-code.sh:84-89 (exit 0 on ImportError), counted by `run()` at :60
- Trigger: a python3 without PyYAML, such as a stock macOS python3, and a broken `.github/workflows/*.yml`.
- Bad state: the snippet exits 0, so `run` prints `PASS yaml <file>` and adds it to the PASS count, but no parse happened. Reproduced: with site-packages disabled (`python3 -S`), the snippet on `on: [push` returns rc=0. With PyYAML present, the same file gives `FAIL yaml w.yml`.
- Existing controls checked: the design says "else skipped", but the report does not say that.
- Remediation direction: print `SKIP yaml <file> (PyYAML not installed)` without counting it as a PASS, for example by testing `python3 -c 'import yaml'` once before the loop.
- Verification: test that, when PyYAML cannot be imported, the report line for a .yml file is not `PASS`.

## UNVERIFIED

None.

## REJECTED

- R1 empty extensionless file: no case arm matches, so no check runs and nothing crashes, which is the right result (`verdict: PASS (0 passed, 0 failed)`). See scripts/validate-code.sh:91.
- R2 `#! /bin/bash` (space), `#!/usr/bin/env node` and zsh shebangs: no check runs. This is coverage that was never claimed, and the hook still asks for agent review because hook line 12 matches `^bin/` and `^scripts/`. Listed under missing tests.
- R3 py_compile on an extensionless file writes `bin/__pycache__/`: `.gitignore:1` holds `__pycache__/`, and EXCLUDE drops it, so the hash does not move.
- R4 `git ls-files --error-unmatch` and the per-file `diff` take names as arguments, not as listed output, so quotepath does not apply. The non-ASCII hash moved in the reproduction (01ba4719… to 44919c06…).

## Round-4 findings, re-checked

- P05-F1 (round 4) non-ASCII names: **closed**. In the scratch repo, editing tracked `café.py` moved the hash `01ba4719c80b6fe9` to `44919c065f973e0c`. Test 14 passes.
- P05-F2 (round 4) rename-hidden deletion: **closed**. `rm a.py` beside a staged copy `b.py` moved the hash `1770179ff1a087b3` to `ba077bb7fe7aaa5d`. Test 15 passes.
- P05-F3 (round 4) extensionless code: **closed**. A broken `bin/tool` (`#!/usr/bin/env python3`, `x=(`) makes the hook block with "deterministic checks FAIL". Test 16 passes.

## Coverage

- Clean: the `g()` wrapper is used on every name-listing call (validate-code.sh:30-31, hook :12). `--no-renames` is on the name-only and per-file diffs (:30-31, :43). The YAML branch FAILs on a broken file when PyYAML is present. Hook line 12 triggers on `ya?ml` and on paths under `bin/`, `scripts/`, `.claude/hooks/` and `.github/workflows/`.
- Tests 14-16 assert what they claim, and all 26 gate tests pass.

## Top 10 missing tests

1. A markdown or text file whose first line contains "python" PASSES. This would catch P05-F1.
2. `#!/bin/bash # python` is checked with `bash -n`, not py_compile (P05-F1).
3. A CRLF shebang script FAILS (P05-F2).
4. When PyYAML cannot be imported, a .yml file is reported as SKIP, not PASS (P05-F3).
5. A broken `.github/workflows/x.yml` FAILS and the hook blocks on it.
6. An extensionless `#!/bin/sh` script with a syntax error FAILS.
7. A non-ASCII name under `--since <ref>` is listed and hashed.
8. A rename staged with `git mv` lists both old and new paths.
9. An empty extensionless file under bin/ leaves the verdict at PASS.
10. An extensionless file with an unknown shebang (`#!/usr/bin/env node`) still makes the hook block for review.

## Share card

```text
VIBE//BREAKER

VERDICT: SURVIVED*
PASSES: 3/20
CRITICAL: 0
HIGH: 0
CONFIRMED: 3
UNVERIFIED: 0
FIRST BREAK: NONE
```

## Release note

This narrow round shows that the round-4 hash and trigger gaps are closed for the cases tested. It shows that the new shebang sniff fails closed on prose that mentions python, passes CRLF scripts that cannot run, and that a skipped YAML parse is reported as PASS. It does not cover the rest of the diff, and it does not cover shells or interpreters other than bash/sh and python.
