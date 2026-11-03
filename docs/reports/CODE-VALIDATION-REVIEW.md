# VibeBreaker Final Report — commit af6a83c (install-mac.sh: promptfoo, ghidra, libraries noted, open-webui + new-api download-only)

change-set: d3305c9750ca4c4c

Reviewer: code-validator (did not write this code). Date: 2026-11-03. Mode: DIFF (`--since HEAD~1`).

## Verdict

`SURVIVED*` — **SHIP**

Deterministic checks pass, dry-run changes nothing, the `~/.zprofile` writes are idempotent and newline-safe, and the clone loop cannot leave `$GP`. Two LOW gaps remain in when the promptfoo privacy exports get written. Neither one corrupts anything or blocks shipping.

## Scope

- Commit / branch: af6a83c on claude/stoic-cori-pvn3f8 (also touches `integrations/skill-packs/REGISTRY-2026-11-01.md`, docs only, and `docs/reports/CODE-VALIDATION.md`, a generated report)
- Mode: DIFF
- Stack: bash script for macOS (target bash 3.2), Homebrew, npm, git
- Passes completed: 01, 04, 05, 11, 14, 19, 20 (the shell-script set)
- Inspected surfaces: `integrations/skill-packs/install-mac.sh` lines 195-232 (new), plus the helpers it calls (`ask`, `have`, lines 7-9) and the precedents it copies (the archify `~/.zprofile` block at lines 96-106 and the github-picks clone loop at lines 156-173)
- Excluded / unavailable context: no macOS or bash 3.2 binary in this sandbox, so bash 3.2 safety was checked by reading. The Homebrew `ghidra` cask definition could not be fetched (proxy 403 / 404). Steven's Node version on the Mac is unknown.
- Material scope limitation: NO for the diff's own logic. The ghidra/Java claim and the Node engine fit are listed as UNVERIFIED.

Deterministic gate: `bash scripts/validate-code.sh --since HEAD~1` printed `verdict: PASS (1 passed, 0 failed)` (`bash -n` on install-mac.sh).

Behavioural evidence: the new section was extracted together with the `ask`/`have` helpers and run under `env -i` with a sandbox HOME and logging stubs for npm, brew, git and promptfoo, in `/tmp/claude-0/-home-user-Repo/4c5c5813-d1a1-57d6-9aa2-cfd8ed00fc6c/scratchpad/cv-test`:
- `--dry-run`: the only command that ran was `brew list --cask ghidra`, which is read-only. No npm install, no `mkdir`, no clone, and no `~/.zprofile` was created.
- Yes to every prompt, starting with no `~/.zprofile`: the file ends up with exactly two lines, `export PROMPTFOO_DISABLE_TELEMETRY=1` and `export PROMPTFOO_DISABLE_UPDATE=1`.
- A pre-existing `~/.zprofile` with no trailing newline (`export FOO=1`), run twice: the script added a newline separator once and wrote each export once. No line was glued to the previous one and nothing was duplicated.
- npm install returning non-zero: the script printed "promptfoo install failed - nothing written to ~/.zprofile" and the file was unchanged.
- The clone targets were `$HOME/Projects/github-picks/open-webui` and `$HOME/Projects/github-picks/new-api`, with `core.hooksPath=/dev/null`, `--depth 1` and `GIT_LFS_SKIP_SMUDGE=1`.
- The npm registry has `promptfoo@0.125.1`, and the package has no own install or postinstall script. Its `prepare` script runs only for git installs.

## Scoreboard

- Passes executed: 7 / 20 (DIFF set for a shell script)
- Confirmed: 2
- Critical: 0
- High: 0
- Medium: 0
- Low: 2
- Info: 1
- Unverified: 3
- Rejected candidates: 6
- First critical pass: NONE

## CONFIRMED

```yaml
id: P04-F1
pass: 04
title: promptfoo privacy exports are skipped whenever promptfoo is already on PATH
status: CONFIRMED
severity: LOW
confidence: HIGH
location:
  - path: integrations/skill-packs/install-mac.sh
    line: 201-208
entry_or_trigger: run install-mac.sh on a Mac where `promptfoo` already resolves (an earlier `brew install promptfoo`, another npm -g version, or a manual install)
evidence: the `have promptfoo` branch prints "already installed" and never reaches the loop at 204-206; that branch also does no version check against the 0.125.1 pin
existing_controls_checked: the export writes are reached only from the `npm install -g ... && then` path
failure_scenario: with a promptfoo stub on PATH and yes to every prompt, ~/.zprofile was never created and the output was "already installed". REGISTRY-2026-11-01.md still says "telemetry and update checks off via ~/.zprofile", but telemetry stays on and an unpinned version stays in place
impact: Derek / code-validator could run promptfoo with telemetry and update checks on. Privacy only; nothing is corrupted
remediation_direction: write the two exports whenever promptfoo is present, not only right after this script installs it, and print the installed version next to the 0.125.1 pin
verification: run the section with a promptfoo stub on PATH and an empty HOME, then assert both export lines are in ~/.zprofile exactly once
needs_context: null
```

```yaml
id: P05-F1
pass: 05
title: the "already set" check is a substring grep, so a commented-out or =0 line counts as set
status: CONFIRMED
severity: LOW
confidence: HIGH
location:
  - path: integrations/skill-packs/install-mac.sh
    line: 205
entry_or_trigger: ~/.zprofile already contains `# export PROMPTFOO_DISABLE_TELEMETRY=1` or `export PROMPTFOO_DISABLE_TELEMETRY=0`
evidence: `grep -q "$v" "$HOME/.zprofile"` matches the bare name anywhere on any line
existing_controls_checked: same pattern as the accepted archify block (line 100), so this is consistent with precedent and is not a regression
failure_scenario: reproduced. Starting from `# export PROMPTFOO_DISABLE_TELEMETRY=1`, a run with yes to every prompt wrote only `export PROMPTFOO_DISABLE_UPDATE=1`; the commented line was taken as already set and telemetry stays on
impact: the telemetry opt-out is silently skipped. The file is never corrupted
remediation_direction: anchor the match to an active assignment (`^export NAME=1`), and apply the same change to the archify check if it is touched
verification: seed ~/.zprofile with a commented or =0 line, run the section, then assert that an active `export NAME=1` line exists
needs_context: null
```

## UNVERIFIED

- U1: line 212 says "Needs Java; the Homebrew cask brings it." The `ghidra` cask (`Casks/g/ghidra.rb`, its `depends_on` and caveats) could not be fetched from this sandbox. If the cask does not pull in a JDK, `ghidraRun` will fail on first launch on a Mac without Java. Needed to decide: `brew info --cask ghidra` on the Mac.
- U2: `promptfoo@0.125.1` declares `engines.node >=22.22.0`. npm -g only warns (EBADENGINE) on an older Node, so the install would report "done" and then the tool may fail when it runs. Needed: `node -v` on Steven's Mac.
- U3: `~/.zprofile` is read only by zsh login shells. Whether the shell that Claude Code or code-validator uses to run promptfoo loads it is a runtime fact about the Mac. The archify precedent has the same dependency.

## REJECTED

- R1 — the loop can clone outside $GP — the loop list is two fixed literals (`open-webui/open-webui QuantumNous/new-api`), `basename` gives `open-webui` and `new-api`, `$d` is always `"$GP/<name>"`, and no user input reaches it; stub run confirmed the targets — lines 228-229
- R2 — dry-run has side effects — `ask` returns 1 before any action (line 8); stub log showed only read-only `brew list --cask ghidra`, no mkdir, and no zprofile — lines 214, 226
- R3 — a zprofile line gets glued to the previous one or duplicated — tail-byte newline guard plus grep guard; reproduced with a file with no trailing newline and a run done twice — line 205
- R4 — `;` inside the brace group lets the export run even when the newline guard fails — intended: the `&&` chain only decides whether a separator newline is needed, and the export must run either way — line 205
- R5 — bash 3.2 incompatibility — no arrays, `local`, `[[`, `${var,,}`, `mapfile` or process substitution in the new code; `tail -c 1`, `basename` and `printf %s` exist on macOS — lines 195-232
- R6 — quoting breaks when HOME contains spaces — every use of `$HOME`, `$GP`, `$d` and `$v` is double-quoted, and the echo strings contain no `$` or backticks except intended expansions — lines 195-232

## INFO

- I1 (pass 14/11): the open-webui and new-api downloads are not held at the commits recorded in the registry (f7ac7ee, 45746ee), and clone stderr is discarded, so any failure is reported as "moved or private". Both copy the accepted github-picks loop (line 171), and nothing in them runs, so this is not a defect. It matters only when Steven later follows a README from an unreviewed HEAD.

## Coverage

- Clean: promptfoo install guard, pin (`@0.125.1` exists on npm), failure message, and the claim that nothing is written on failure; idempotence and newline safety of the export writes; ghidra already-installed check and install gate; the y/N gate on the github-picks download, the shallow clone without hooks or LFS, and the skip when a folder exists; dry-run; set -u safety (no unset vars referenced: `GP`, `d`, `r`, `v` are all assigned before use); echo-only notes (langchain, transformers, open-webui, new-api, ecommerce-intelligence-apis) contain no commands that execute.
- Registry addendum matches the script (versions, commits, decisions).

## Top missing tests (pass 19)

1. Dry-run with stubbed npm/brew/git and an empty HOME: assert the only stub call is `brew list --cask ghidra` and HOME stays empty.
2. Yes to every prompt with no ~/.zprofile: assert exactly two lines, `export PROMPTFOO_DISABLE_TELEMETRY=1` and `export PROMPTFOO_DISABLE_UPDATE=1`.
3. ~/.zprofile without a trailing newline, run twice: assert the original line is intact and each export appears once.
4. npm stub exits 1: assert ~/.zprofile is byte-identical and the failure line is printed.
5. promptfoo already on PATH: assert both exports are present afterwards (fails today, P04-F1).
6. A commented `# export PROMPTFOO_DISABLE_TELEMETRY=1` line: assert an active export is added (fails today, P05-F1).
7. Pre-existing `$GP/open-webui` directory: assert no clone call for it and "have open-webui" is printed.
8. git stub exits 1: assert "could not get" is printed and the loop continues to the second repo.
9. HOME containing a space: assert clone targets and zprofile path stay intact.
10. `bash -n` under /bin/bash 3.2 on macOS CI (not available here).

## Share card

```text
VIBE//BREAKER

VERDICT: SURVIVED*
PASSES: 7/20 (DIFF)
CRITICAL: 0
HIGH: 0
CONFIRMED: 2
UNVERIFIED: 3
FIRST BREAK: NONE
```

## Release note

This audit showed, using stubs on Linux bash, that the new section is safe in dry-run, writes ~/.zprofile idempotently without corrupting it, and only clones the two named repos into `$GP`. It did not run the script on macOS or bash 3.2, did not install promptfoo or ghidra, and did not confirm that the ghidra cask brings Java.
