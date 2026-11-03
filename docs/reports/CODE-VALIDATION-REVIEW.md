# VibeBreaker Final Report

change-set: 0d99059dde45268e

## Verdict

`SHIP` (with one LOW note). Re-review of the fixed Ghidra step in `integrations/skill-packs/install-mac.sh`. All four findings from the prior review (change-set 67fd98756358bcea: M1, L1, L2, L3) are fixed. No regression found in bash 3.2 safety, `set -u`, quoting or `mv` semantics. One LOW residual on the L2 fix.

## Scope

- Commit / branch: HEAD plus uncommitted diff, Ghidra step only
- Mode: read-only; deterministic checks first (`bash -n` OK; shellcheck reports only SC2012/SC2015 info, the latter the intended `A && B || C` fail-closed shape)
- Passes: 01, 04, 05, 11, 14, 19, 20
- Replayed in the scratchpad: the unzip, `rm -rf` old dir, `mv` sequence on a stale partial dir under `set -u`
- Material scope limitation: YES (no macOS, no brew; real zip hash and formula not checkable)

## Prior findings, verified

- M1 FIXED: the prompt now says "source reviewed at 251f3603; the install below is the release/brew build, not that commit". The `GH_SHA` comment says "NOT yet matched against the real zip", and the word "checked" is gone.
- L1 FIXED: the prompt says "current brew formula, else the 12.2 release zip", so no pinned version is implied for brew.
- L2 FIXED, see P01-F1 below for a LOW residual.
- L3 FIXED: the zip is unzipped into `$tmp/x`, then the target is removed and `mv` moves it in. The installed test is the `ghidraRun` file, so a partial or empty directory no longer counts. Replay: a stale `ghidra_12.2_PUBLIC/partial` dir was replaced cleanly and only `ghidraRun` remained. `$HOME/Applications` is on the same volume as the temp dir on a stock Mac, so `mv` is a rename.

## CONFIRMED

### P01-F1 LOW, MEDIUM confidence: the Java hint is suppressed on a stock Mac
- location: `have java || echo "  note: no Java found ..."` in `ghidra_zip`
- trigger: a Mac with no JDK installed, brew absent or failing, so the zip route runs.
- bad state: macOS ships a `/usr/bin/java` stub, so `command -v java` succeeds and the hint is never shown. The user then launches `ghidraRun` and gets the system "install Java" dialog instead. Conversely, a brew `openjdk@21` is keg-only and not on PATH, so the hint can show when Java is installed. It is harmless but noisy.
- impact: the hint only helps in rare setups. The earlier "Needs Java (JDK 21+)" echo above still tells the user.
- remediation direction: test with `/usr/libexec/java_home >/dev/null 2>&1` instead of `have java`.
- verification: on a Mac with no JDK, run the zip route and confirm the hint prints.

## UNVERIFIED

- U1: `GH_SHA` against the real zip. If it differs the zip route stops safely with the manual hint, a dead path rather than a hazard. Needed: `shasum -a 256` of the real zip.
- U2: the dependencies of the `ghidra` brew formula (`brew info ghidra`), and the claim that the cask is gone (taken from the script's own note dated 2026-11-02).

## REJECTED

- `rm -rf` of the target before `mv` loses an install: the branch is reached only when `ghidraRun` is absent and no brew formula is present.
- Unset variables under `set -u`: all variables are assigned before use; `local tmp url got` is assigned in the same function.
- bash 3.2 incompatibility: only `local`, `case`, `${var}` and `command -v`, all fine.
- Interrupted `mv` leaving a false "installed": it would need a cross-volume move; on a stock Mac this is a rename.

## Coverage

Clean: gate and dry-run, quoting, temp-dir cleanup on every failure path, no sudo, URL prefix `case`, hash check before unzip, the fallback chain brew, zip, hint, the installed-test.

## Top missing tests

1. Stub unzip to fail midway: assert re-run does not report "already installed".
2. Hash mismatch: assert nothing is extracted and the hint is printed.
3. Brew install fails: assert the zip route runs.
4. Dry-run: assert zero side effects.
