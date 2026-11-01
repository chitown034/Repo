# VibeBreaker Final Report — re-review of 9e874b4 (over bb92142~1..HEAD)

change-set: 606fcde42622e248

(Hash from `bash scripts/validate-code.sh --since bb92142~1` at HEAD 9e874b4; mark with
`bash scripts/validate-code.sh --since bb92142~1 --mark`. Supersedes the review of change-set fe34cd2d0339d666.)

## Verdict

`FIX FIRST` (VibeBreaker: FIX BEFORE SHIP) — the four earlier findings are fixed, the gate passes; the new "Everything
else" section has one MEDIUM: spec-kit is installed as an executable tool at unreviewed upstream HEAD, the same class of
defect just fixed for the cloner.

## Scope

- Commit: 9e874b4 on claude/stoic-cori-pvn3f8 (worktree wt-stoic); diff `git show 9e874b4 -- integrations/skill-packs/install-mac.sh scripts/skill-pick.sh`
- Mode: diff review, read-only, static; nothing executed against a HOME; no network
- Passes: 01, 04, 05, 11, 14, 19, 20 (shell set)
- Inspected: skill-pick.sh `--find`/`--remove`; install-mac.sh `ask`, `have`, `copyskills`, `mcpadd` (lines 8-68) and lines
  107-176; REGISTRY-2026-11-01.md and group-b/c reports for reviewed commits
- Unavailable: upstream trees; whether `npx skills add` accepts a ref; whether git-lfs is installed on the Mac; shellcheck
- Material scope limitation: YES (U1-U3)

## Deterministic gate

`verdict: PASS (4 passed, 0 failed)` (bash -n both scripts, agents.json, brain doctor).

## Earlier findings — status

- P11-F1 (cloner unpinned): FIXED — full clone then `checkout -q ee3f5a2`, removed on failure (install-mac.sh:118-122).
- P11-F2 (library drift silent): FIXED for re-runs (line 130 prints reviewed -> now); a first `--depth 1` clone still
  prints no hash (INFO, harmless: nothing loads).
- P05-F1 (`--remove`): FIXED — library-only, y/N, honest failure message and exit 1 (skill-pick.sh:20-23).
- P04-I1 (`--find` regex): FIXED — `grep -qiF` (skill-pick.sh:16).

## CONFIRMED

### P11-F3 MEDIUM — spec-kit installed from unreviewed HEAD
- Location: integrations/skill-packs/install-mac.sh:151
- Trigger: `uv` present, Steven answers y, github/spec-kit has any commit after the reviewed 7370e59 (group-c report line 24).
- Bad state: `uv tool install specify-cli --from git+https://github.com/github/spec-kit.git` builds (build backend runs)
  and puts on PATH whatever HEAD is; no reviewed commit is printed or compared — the policy the cloner and anatomy now follow.
- Fix proof: `--from git+https://github.com/github/spec-kit.git@7370e59`; `uv tool list` / the installed dist metadata
  shows that revision.

### P05-F2 LOW — cloner cleanup can delete a pre-existing non-directory
- Location: integrations/skill-packs/install-mac.sh:116 (`[ -d ... ]`) with 122 (`rm -rf` on failure)
- Trigger: `~/Projects/ai-website-cloner` exists as a regular file (or a symlink to a file).
- Bad state: `-d` is false, `git clone` fails ("already exists"), and the else branch `rm -rf`s the user's file.
  The anatomy block (line 141) correctly uses `-e`.
- Fix proof: `[ -e ... ]`; a test with a file at that path leaves it untouched.

### P01-I2 INFO — stale "held" message
- Location: install-mac.sh:109-110 still says Cloudflare Code Mode MCP and openscreen are "Held for your yes" while
  lines 148-154 now offer them (line 111 says "offered at the end"). Wording only.

## UNVERIFIED

- U1 — `copyskills` path filter `-path '*skills*'` against `$tmp/r`: charlie947 (15 + 2) and ScrapeCreators (10) folders
  are found only if they sit under a `*skills*` directory upstream. NEEDS-CONTEXT: trees at 10ca79c and 64ba7b4.
- U2 — OpenScreen (line 148) runs `npx -y skills add getopenscreen/openscreen` at HEAD (reviewed 8ecc76b) and, per the
  registry, installs a desktop app and an MCP server. Pin it if `skills add` accepts a ref. NEEDS-CONTEXT: the
  `skills` CLI's ref syntax.
- U3 — the 31-repo loop (lines 166-170) promises "nothing runs", but if git-lfs is installed globally, clone runs the LFS
  smudge filter and downloads every LFS object (model-heavy repos such as flux2 / ACE-Step are candidates).
  `GIT_LFS_SKIP_SMUDGE=1` would make the promise unconditional. NEEDS-CONTEXT: git-lfs on the Mac and those repos'
  .gitattributes.

## REJECTED

- R1 `for r in $PICKS` unquoted — intentional word split; no glob characters in any entry; 31 entries with 31 unique basenames (counted) — install-mac.sh:166
- R2 anatomy rm -rf — reached only when the path did not exist (`-e` guard) so it removes only what clone created — 141-145
- R3 `--remove` name collision with a hand-made skill of a library name — now behind y/N with the name shown — skill-pick.sh:22
- R4 dry-run — every new action (copyskills, anatomy, openscreen, spec-kit, mcpadd, loop) is behind `ask`, which returns 1 under `--dry-run`; `mkdir -p "$GP"` is inside the ask branch — 8, 67, 140, 148, 151, 165
- R5 bash 3.2 — multi-line double-quoted list, `basename`, `{ ...; }` groups, `local` all valid; no arrays / `[[` / mapfile
- R6 Cloudflare MCP — `mcpadd` asks first and registers only a URL; sign-in is Cloudflare's browser flow, no key handled — 64-68, 154
- R7 shallow clone hooks — clone executes no repo hooks; output suppressed but failures reported per repo — 169

## Coverage

Clean: skill-pick fixes; cloner pin and cleanup path; library drift line; anatomy pin (1482e84 matches group-c);
ScrapeCreators pin 64ba7b4 matches group-b; second charlie947 call; mcpadd use; PICKS loop quoting, idempotence ("have"),
failure reporting; the "not installable" text.

## Top missing tests (pass 19)

1. Fake upstream for spec-kit / cloner / anatomy at a commit after the reviewed one: installed revision equals the reviewed one.
2. `install-mac.sh --dry-run` with a fake HOME: tree listing of HOME unchanged.
3. File (not dir) at ~/Projects/ai-website-cloner: still there after a failed clone (F2).
4. skill-pick `--remove` on a non-library skill: exit 1, folder intact; on a library skill answering n: intact; y with read-only DEST: exit 1.
5. skill-pick bad names (`..`, `a/b`, `.x`, empty) for install and `--remove`: exit 1, DEST unchanged.
6. skill-pick `--find "["` / `--find c++`: no stderr, literal match.
7. PICKS loop with one unreachable repo: others still cloned, failure line printed.
8. copyskills against fixtures with skills at root and under skills/ (U1).
9. Loop with git-lfs installed and an LFS fixture: no LFS download (U3).
10. Both scripts end to end under /bin/bash 3.2 with fixture repos.

## Share card

```text
VIBE//BREAKER

VERDICT: FIX BEFORE SHIP
PASSES: 7/20
CRITICAL: 0
HIGH: 0
CONFIRMED: 2 (+1 info)
UNVERIFIED: 3
FIRST BREAK: NONE
```

## Release note

Static review and syntax checks only; nothing executed against a HOME and no network. It shows the earlier four findings
are fixed and no traversal, rm -rf escape, unquoted-variable or bash 3.2 problem in the new code; it does not show that
the copyskills targets exist upstream or what the unpinned installers fetch.
