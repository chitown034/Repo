# VibeBreaker Final Report: connect-all.sh 6a / 6c / 6e

change-set: a9fd68bc4df0aadb

(This is the hash of commit 6c2262a, from `bash scripts/validate-code.sh --since HEAD~1`. The working tree I first validated was
change-set 28085daef9521edc. The caller committed it as 6c2262a at 00:26:32Z, while this review was running. The commit
also differs from that working tree: `local i` became `local i db`. Plain `validate-code.sh` and `--mark` now report
"nothing changed since HEAD", so `--mark` cannot record this change-set as it is.)

## Verdict

`FIX FIRST`

The deterministic checks pass and 47 of 47 stubbed tests pass. Two MEDIUM issues remain. Step 6c hides a security FAIL
from Orca's doctor and still reports "done". Step 6a starts a runner task without asking, and the repo's own guard
list treats that as a HALT-line-1 spend.

## Scope

- Commit / branch: 6c2262a on claude/stoic-cori-pvn3f8 (diff HEAD~1..HEAD)
- Mode: diff review
- Stack: bash 3.2 shell scripts (connect-all.sh, connect-all-tests.sh). Docs are prose and were not reviewed as code.
- Passes completed: 01, 04, 05, 11, 14, 19, 20 (the shell-script set)
- Inspected surfaces: connect-all.sh jarvis_db / jarvis_engine / step 6a, orca_connect, step 6e, step();
  integrations/remote-control/orca-remote.sh cmd_doctor; integrations/agent-os/install-mac.sh (whole file);
  connect-all-tests.sh run_fn and the jarvis / orca sections; mac-bootstrap.sh HALT_GUARDS; docs/inventory/mac-task-descriptions.md
- Excluded / unavailable context: runnerctl source and the definition of the `openjarvis` runner task (not in the repo)
- Material scope limitation: YES. Whether `runnerctl run` blocks, and whether `openjarvis` spends Claude allowance, cannot be decided from the repo.

## Deterministic checks

- `bash scripts/validate-code.sh` (working tree, before the commit): `verdict: PASS (2 passed, 0 failed)`, change-set 28085daef9521edc
- `bash scripts/validate-code.sh --since HEAD~1` (the commit): `verdict: PASS (2 passed, 0 failed)`, change-set a9fd68bc4df0aadb
- validate-code.sh ran only `bash -n` on the .sh files. It does not run connect-all-tests.sh.
- `bash connect-all-tests.sh`: `connect-all tests: 47 passed, 0 failed`. The brief said 55; the repo's own CONNECTIONS.md says 47, which is correct.

## Scoreboard

- Passes executed: 7 / 20 (shell-script set)
- Confirmed: 4
- Critical: 0
- High: 0
- Medium: 2
- Low: 2
- Info: 0
- Unverified: 2
- Rejected candidates: 5
- First critical pass: NONE

## CONFIRMED

```yaml
id: P05-F1
pass: 05
title: Step 6c swallows orca-remote doctor's security FAIL lines and still reports "done"
status: CONFIRMED
severity: MEDIUM
confidence: HIGH
location:
  - path: connect-all.sh
    line: 266-267
  - path: integrations/remote-control/orca-remote.sh
    line: 225-231 (bad lines for --grant-desktop-control and a non-private --pairing-address), 233 (return 1)
entry_or_trigger: bash connect-all.sh on a Mac where an `orca serve --grant-desktop-control` process, or an orca serve advertising a public address, is running
evidence: The doctor exits 1 and prints "FAIL orca serve pid N was started with --grant-desktop-control". orca_connect pipes the doctor into `tail -n 8` and then runs `return 0`. step() sends all function output to $LOG.
existing_controls_checked: step() captures only the return code of orca_connect. Nothing reads the doctor's exit code or output.
failure_scenario: An Orca runtime is serving with desktop control, or on a public address. The screen shows "== 6c ... == done", 6c appears in the PASS list, and the FAIL is only in the log file.
impact: The one remote-control safety check this step adds never reaches Steven.
remediation_direction: Keep the doctor advisory for "orca not on PATH", but return 1 (or add a NEEDS line) when its output contains the grant-desktop-control or non-private-address FAIL. A plain `|| return 1` would turn 6c red whenever the Orca CLI is not installed.
verification: Add a test with a stub `ps` that prints "123 orca serve --grant-desktop-control" and assert orca_connect returns 1. Keep the existing "orca: opened on the Repo folder" test at rc 0 with no serve process.
needs_context: null
```

```yaml
id: P14-F1
pass: 14
title: 6a runs `runnerctl run openjarvis` without its own yes, which the repo's guard list classes as HALT line 1
status: CONFIRMED (spec conflict; whether it costs anything is NEEDS-CONTEXT)
severity: MEDIUM
confidence: MEDIUM
location:
  - path: connect-all.sh
    line: 228-230
  - path: mac-bootstrap.sh
    line: 57 ("running or restarting a runner task spends allowance (CLAUDE.md HALT line 1)"), 70 (guard *runnerctl run *)
entry_or_trigger: connect-all.sh answered y on a Mac with no ~/.openjarvis/memory.db and an `openjarvis` entry in `runnerctl list`
evidence: The only consent is the opening "[y/N] ... It never signs in, pairs, sends or pays", and then the task runs. The claude-runner inventory entry says runner tasks run headlessly through `claude -p`.
existing_controls_checked: context/decisions.md approves `runnerctl restart` for connect-all (2026-10-13 entry). No entry approves `runnerctl run`. Steven's 2026-10-23 directive, "fix and install everything ... including Jarvis", may cover it, but it does not name a task run.
failure_scenario: The step spends Claude allowance (if openjarvis goes through claude -p) under a prompt that promises it never pays. It also does the exact thing mac-bootstrap.sh refuses to do.
impact: Policy and HALT consistency. A possible spend of allowance.
remediation_direction: Steven decides. Either record that connect-all may run openjarvis once (a decisions.md entry), or replace the run with a printed `runnerctl run openjarvis` instruction and return 1.
verification: A test that asserts the runner.calls file has no "run" line unless an explicit opt-in variable is set.
needs_context: The openjarvis runner task definition (does it call claude -p or a model at all?)
```

```yaml
id: P05-F2
pass: 05
title: The model-present check is a prefix regex, so a different tag counts as llama3.1:8b
status: CONFIRMED
severity: LOW
confidence: HIGH
location:
  - path: connect-all.sh
    line: 225
entry_or_trigger: `ollama list` shows only `llama3.1:8b-instruct-q8_0` (or any tag that starts with llama3.1:8b, or "llama3x1:8b" because "." matches any character)
evidence: grep -q "^$JARVIS_MODEL" matches a prefix, and the "." is unescaped
existing_controls_checked: none. The pull is skipped.
failure_scenario: The step prints "model llama3.1:8b present" and passes, but the exact tag OpenJarvis asks for is absent.
impact: False PASS in the report. Jarvis fails later, outside this step.
remediation_direction: Match the first column exactly, for example `ollama list | awk 'NR>1{print $1}' | grep -qxF "$JARVIS_MODEL"`, and treat a bare name as name:latest.
verification: A stub_ollama "NAME ID\nllama3.1:8b-instruct-q8_0 x" test that asserts pull.calls contains "pull llama3.1:8b".
needs_context: null
```

```yaml
id: P14-F2
pass: 14
title: The 6e comment understates what install-mac.sh --apply writes
status: CONFIRMED
severity: LOW
confidence: HIGH
location:
  - path: connect-all.sh
    line: 305-306
  - path: integrations/agent-os/install-mac.sh
    line: 40-45 (also its own header, lines 8-9)
entry_or_trigger: step 6e
evidence: The comment says "--apply only writes ~/.local/bin/brain (symlink) and ~/.config/agent-os/config". --apply also symlinks every integrations/agent-os/agents/*.md into ~/.claude/agents and never overwrites existing files. Without --apply it writes brain/state/agent-os-status.json, which is gitignored.
existing_controls_checked: Existing agent files are never overwritten, and nothing edits a live prompt.
failure_scenario: Steven is told two files change. In fact new Claude Code agent definitions appear in ~/.claude/agents.
impact: Honesty of the safety statement. The links can be removed.
remediation_direction: Correct the comment in connect-all.sh and the header of install-mac.sh, or put the agent-link step behind its own flag.
verification: Diff review. Optionally, a test that runs install-mac.sh --apply with HOME set to a temp dir and lists what it created.
needs_context: null
```

## UNVERIFIED

- U1: does `runnerctl run openjarvis` block until the index is written? connect-all.sh:230-231 checks for memory.db straight away. If the run only queues the task, 6a reports "ran but wrote no memory.db", and a rerun queues a second index build. Needs the runnerctl source or `runnerctl --help`.
- U2: no timeout on `runnerctl run openjarvis` (connect-all.sh:230). If the task hangs, as the runner hung on fabric-deck-sync on 2026-10-13, connect-all stops at 6a with nothing on screen. This needs the same runnerctl facts as U1.

## REJECTED

- C1: `db` unbound under set -u. Rejected: the commit declares `local i db` (connect-all.sh:213), and `db` is always assigned before it is read.
- C2: the bash 3.2 constructs in the new code. Rejected: only `local`, `$(( ))`, `[ ]` and printf are used. No arrays, `[[ =~ ]]`, `${x,,}` or `mapfile`.
- C3: a login, save-token, pairing or key print anywhere in 6a, 6c or 6e. Rejected: cmd_doctor is read-only (`orca --version` and `orca status`, `ps`, socketfilterfw --getglobalstate). install-mac.sh logs in nowhere. The "never logs in" test passes.
- C4: the "no ollama and no brew" test passes for the wrong reason. Rejected: PATH is $T/bin:/usr/bin:/bin, $T/bin has no ollama or brew, so the `have brew` branch returns 1.
- C5: 6e's failure is hidden. Rejected: install-mac.sh ends with `[ "$BAD" -eq 0 ]`, so failures reach step() as rc 1.

## Coverage (inspected and clean)

- jarvis_db: `-s` makes an empty file count as missing, which is deliberate; the paths match jarvis-setup.sh:35.
- jarvis_engine: honest return 1 on every early exit (no brew, brew install fails, not on PATH, not answering after 20 s, pull fails, run fails, no db afterwards, no task). Ollama start falls back from brew services to open -a to nohup serve.
- step 6e: it fails honestly, and the --apply writes stay local to $HOME.
- orca_connect: the existing open, bundle-id and install paths are unchanged. The doctor is read-only.
- connect-all-tests.sh: the FUNCS sed extracts JARVIS_MODEL, jarvis_db and jarvis_engine. The 8 new jarvis checks are meaningful.

## Top missing tests (pass 19)

1. orca_connect with a stub ps that shows `orca serve --grant-desktop-control`: rc must be 1 (P05-F1).
2. jarvis_engine with only `llama3.1:8b-instruct-q8_0` listed: a pull of llama3.1:8b must happen (P05-F2).
3. jarvis_engine where the runnerctl run stub writes no memory.db: rc 1 and the "wrote no memory.db" message.
4. jarvis_engine with runnerctl present but no openjarvis task: rc 1 and runner.calls has no "run" line.
5. jarvis_engine where `ollama pull` exits 1: rc 1.
6. jarvis_engine where `ollama list` always fails and FAKESLEEP=: is set: rc 1 after the wait loop, and brew services / open are tried.
7. jarvis_engine with no ollama and brew present: `brew install ollama` is the only brew call (the formula, not a cask).
8. Step 6e: install-mac.sh --apply with HOME set to a temp dir creates only the documented paths (P14-F2).
9. The orca tests stub orca-remote.sh, or point it at a temp dir, so the real doctor does not run against the host.
10. validate-code.sh runs connect-all-tests.sh when connect-all.sh changes. Today it only runs `bash -n`.

## Share card

```text
VIBE//BREAKER

VERDICT: FIX FIRST
PASSES: 7/20 (shell set)
CRITICAL: 0
HIGH: 0
CONFIRMED: 4
UNVERIFIED: 2
FIRST BREAK: NONE
```

## Release note

What was shown: the scripts parse, the 47 stubbed tests pass, and the new code never logs in, never saves a token, never
pairs and never prints a key. It is safe under set -u and bash 3.2. What was not shown: anything on a real Mac (Ollama,
Homebrew, runnerctl, Orca), how runnerctl run behaves or what it costs, or whether OpenJarvis really writes memory.db
at the paths checked.

## Resolution 2026-10-23 00:40 UTC — change-set `aebfcebf753596c2`

All four confirmed findings were fixed in connect-all.sh and covered by new stubbed tests (51 pass):

1. Orca doctor (6c): a `--grant-desktop-control` or non-private-address failure now fails the step (test: stub `ps`).
2. `runnerctl run openjarvis` (6a) runs only with `JARVIS_BUILD_INDEX=1`; otherwise the step fails and names the
   command, because the index build is a runner task that spends Claude allowance (HALT line 1). Test: runner.calls has
   no `run` line without the opt-in.
3. Model check matches the exact tag (`awk NR>1 | grep -qxF`); test: a `-instruct-q8_0` tag alone still pulls `llama3.1:8b`.
4. The 6e comment and install-mac.sh's header now say the agent files are symlinked into ~/.claude/agents.

Not decidable in the cloud (unchanged): whether `runnerctl run` blocks or queues, and what OpenJarvis writes — the
first Mac REPORT answers both. Steven decides: the opt-in index run; agent symlinks in ~/.claude/agents (kept: it never
overwrites a file there).
