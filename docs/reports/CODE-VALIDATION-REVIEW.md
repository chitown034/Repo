# VibeBreaker Final Report — commit bb92142 (skill-pick.sh + install-mac.sh tail)

change-set: fe34cd2d0339d666

(Hash from `bash scripts/validate-code.sh --since bb92142~1`; mark with `bash scripts/validate-code.sh --since bb92142~1 --mark`.)

## Verdict

`FIX FIRST` (VibeBreaker: FIX BEFORE SHIP) — no critical or high defect; the deterministic gate passes; one MEDIUM: the
website-cloner clone is not held to the reviewed commit before Steven is told to `npm install` it.

## Scope

- Commit / branch: bb92142 on claude/stoic-cori-pvn3f8 (worktree wt-stoic)
- Mode: diff review, read-only, static (nothing executed against a HOME; no network)
- Stack: bash, macOS bash 3.2 target
- Passes completed: 01, 04, 05, 11, 14, 19, 20 (shell-script set)
- Inspected surfaces: `scripts/skill-pick.sh` (whole file, new), `integrations/skill-packs/install-mac.sh` lines 1-60
  (`ask`, `have`, `copyskills`, DRY) and the appended block (lines 107-132); REGISTRY-2026-11-01.md and group-b/c reports
  for the intended behaviour; setup.sh for the `~/Repo` convention
- Excluded / unavailable context: upstream repo layouts (charlie947/social-media-skills, sickn33/antigravity-awesome-skills);
  shellcheck not installed in this container
- Material scope limitation: YES — layout assumptions (see UNVERIFIED) cannot be proved without the upstream trees

## Deterministic gate

`verdict: PASS (4 passed, 0 failed)` — bash -n on both scripts, agents.json parse, brain doctor. (Plain
`validate-code.sh` reports "nothing changed since HEAD" because bb92142 is committed; the `--since bb92142~1` run is the
one that covers it.)

## Scoreboard

- Passes executed: 7 / 20 (the shell set + 20)
- Confirmed: 3 (Critical 0, High 0, Medium 1, Low 2) + 1 Info
- Unverified: 2
- Rejected candidates: 7
- First critical pass: NONE

## CONFIRMED

### P11-F1 MEDIUM — website cloner kept at whatever upstream HEAD is, then `npm install` is recommended
- Location: integrations/skill-packs/install-mac.sh:117-119
- Trigger: JCodesMore/ai-website-cloner-template gains any commit after ee3f5a2, Steven answers y.
- Bad state: the full clone stays at the new, unreviewed HEAD; the drift is only an `echo "note: ..."` whose exit 0 lets
  the `&&` chain continue to "done. To use: ... npm install", which runs the unreviewed package's lifecycle scripts.
  `copyskills` (line 49) asks "Copy anyway?" on the same drift; this block does not, and never checks out ee3f5a2
  although the clone is full-depth so it could.
- Fix proof: after the clone, `git -C ... checkout -q ee3f5a2` (or an `ask "Keep anyway?"` that removes the clone on no);
  a test with a fake upstream whose HEAD != ee3f5a2 shows the working tree at ee3f5a2 or the clone removed.

### P11-F2 LOW — the skill library is never compared with the reviewed commit and fast-forwards on every re-run
- Location: integrations/skill-packs/install-mac.sh:126-129
- Trigger: re-running install-mac.sh and answering y when ~/skill-library/agentic-awesome-skills already exists.
- Bad state: `git pull -q --ff-only` moves the library to unreviewed upstream with no 6f819e3 comparison or note; a first
  clone (`--depth 1`) is also never compared. Mitigated: nothing in the library loads, and skill-pick shows 25 lines and a
  file/script count before any copy.
- Fix proof: print `reviewed 6f819e3 -> now <h>` after clone/pull, as the cloner block does.

### P05-F1 LOW — `--remove` deletes any same-named skill in ~/.claude/skills with no prompt, and misreports failures
- Location: scripts/skill-pick.sh:20-21
- Trigger: `bash scripts/skill-pick.sh --remove writing-plans` (installed by copyskills/superpowers, or a hand-made skill).
- Bad state: `rm -rf` runs with no y/N and no check that the folder came from the library (irreversible for a hand-made
  skill), while install is gated by y/N. Also `[ -d ] && rm && echo || echo "not installed"`: if rm fails the user is told
  "<n> is not installed", and the script exits 0 either way.
- Fix proof: only remove when `$LIB/$n/SKILL.md` exists (or a marker written at install), ask y/N, and report rm failure
  with a non-zero exit.

### P04-I1 INFO — `--find` treats the word as a regex
- Location: scripts/skill-pick.sh:16 (`grep -qi -- "$w"` twice)
- Trigger: `--find "["` -> grep error per file (about 2,800 stderr lines), no results. Fix: `grep -qiF`.

## UNVERIFIED

- U1 — charlie947 skills may report "not found": `copyskills` matches `find "$tmp/r" -type d -name "$f" -path '*skills*'`;
  the clone path `$tmp/r` contains no "skills", so this only works if the 15 folders sit under a directory whose path
  contains "skills". NEEDS-CONTEXT: the upstream tree at 10ca79c. (Pre-existing function, newly applied to this repo.)
- U2 — skill-pick and the "done: N skills" line assume a flat `skills/<name>/SKILL.md` at the library root. If the library
  nests categories, `--find` and `<name>` find nothing and the count reads 0 (with an ls error). NEEDS-CONTEXT: the
  upstream tree at 6f819e3.

## REJECTED

- R1 path traversal in `<name>` — `*/*|.*` rejects any slash and leading dot (`..`, `a/../x`, `.hidden`) — skill-pick.sh:20,23
- R2 rm -rf of DEST or HOME — `${DEST:?}` guard, name validated non-empty with no slash, fully quoted, no glob; HOME unset aborts under `set -u` — skill-pick.sh:9,21
- R3 symlinked skill escaping — BSD `cp -R` copies an operand symlink as a link (no -H/-L); it writes nothing outside DEST and the head shown is the content loaded — skill-pick.sh:28
- R4 bash 3.2 incompatibility — no arrays, `[[`, `${,,}`, `mapfile`, `|&` or `;&`; `${*:-}`, `local`, `read -r`, nested `"$(... "x" ...)"` all valid in 3.2; `wc -l | tr -d ' '` handles BSD padding; `grep -m1` exists in BSD grep — both files
- R5 unquoted variables — every expansion in both new blocks is quoted; `$DRY` in `[ $DRY = 1 ]` is pre-existing and always 0/1 — install-mac.sh:8
- R6 dry-run writes — every new action is behind `ask`, which returns 1 under `--dry-run` before any mkdir/clone/copy; copyskills' first gate is `ask` — install-mac.sh:8,47,115,125
- R7 git hooks on clone — clone runs no remote hooks; `core.hooksPath=/dev/null` is harmless and git >= 2.9 on macOS — install-mac.sh:118,128

## Coverage

Clean: skill-pick name validation, install path, `-h`, missing library message, already-installed check, y/N parse
(EOF = no); install-mac `ask`/DRY semantics for the new block; `copyskills` call (15 names = group-b list minus
post-scorer and reels-scripting, matches the registry); cloner "already there" path; library mkdir/clone path;
`~/Repo/scripts/skill-pick.sh` path matches setup.sh's `$HOME/Repo` default.

## Top missing tests (pass 19)

No test exists for skill-pick.sh (scripts/tests/ has tests for sibling scripts). Ranked:
1. Fake HOME + fake upstream at a commit != ee3f5a2: cloner ends at ee3f5a2 or asks/removes (F1).
2. skill-pick `<name>` with `..`, `a/b`, `.x`, empty: "bad name", exit 1, DEST unchanged.
3. skill-pick `--remove` on a skill not in the library: refused, folder still there (F3).
4. skill-pick `--remove` on an installed library skill with rm failing (read-only DEST): non-zero exit, honest message.
5. skill-pick `<name>` answering n / EOF: DEST unchanged; answering y: DEST/<name>/SKILL.md identical to source.
6. `install-mac.sh --dry-run` with a fake HOME: no file under HOME created or changed (diff of a tree listing).
7. skill-pick `--find "["` and `--find c++`: no stderr flood, sane results (I1).
8. copyskills against a fixture repo with skills at the root vs under skills/: both found (U1).
9. skill-pick against a nested-category fixture library: either finds the skill or says the layout is unsupported (U2).
10. Run both scripts under /bin/bash 3.2 (macOS CI) end to end with a fixture library.

## Share card

```text
VIBE//BREAKER

VERDICT: FIX BEFORE SHIP
PASSES: 7/20
CRITICAL: 0
HIGH: 0
CONFIRMED: 3 (+1 info)
UNVERIFIED: 2
FIRST BREAK: NONE
```

## Release note

Static review plus syntax checks only. Nothing was executed against a real or fake HOME, no network was used, and the
upstream layouts were not seen. This shows no traversal or rm -rf escape in the inspected code and no bash 3.2 construct
problems; it does not show that the 15 social-media skills or the library skills will actually be found.
