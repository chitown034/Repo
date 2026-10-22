# NEEDS-STEVEN — R3 append (Mac Platform Engineer, 2026-09-23)

Append to `docs/NEEDS-STEVEN.md`. Three items. Two are decisions only Steven can make; the third is
not a decision but a correction to something already on his list, and it changes when he should look.

Everything below was established on Linux. **`MAC-SETUP.sh` and `mac-verify.sh` have still never run
on macOS**, and the first real run on the Mac is still the first real test of both.

---

## R3-1 — `./MAC-SETUP.sh` installs a Claude Code plugin into your live user scope, unasked

**F-R3-10. A decision, and either answer is fine — but the script should not keep applying two rules
to the same action.**

The installer refuses to install `claude-code-setup` and refuses to install `ponytail`, and tells you
why in its own output: a plugin lands in the **live Claude Code user scope of the business Mac**, so
every session there gains it, including unattended `claude-runner` tasks. It calls that HALT-class and
leaves it to you.

Three hundred lines further down, the `cli-anything` step runs this unattended, on a plain
`./MAC-SETUP.sh` with no flags:

```
claude plugin marketplace add HKUDS/CLI-Anything
claude plugin install cli-anything@cli-anything      # -> user scope
```

The case for the exception is probably sound: it adds five inert commands (`/cli-anything`, `:list`,
`:refine`, `:test`, `:validate`) that do nothing until invoked, and S1 chose it deliberately. The
problem is that the script never makes that case, so the asymmetry reads as an oversight rather than a
judgement — and anyone who trusts the ponytail refusal has no way to tell which it is.

**Two acceptable answers. Pick one:**

- **Keep it automatic**, and the script's own text gets one sentence saying why this plugin is
  different from the two it refuses. Nothing changes about what runs.
- **Gate it** behind `--only cli-anything`, the way `strix` and `higgsfield` are already gated: a plain
  run then reports it and stops, and you enable it with one flag when you want it.

Nothing was changed either way. Until you say, know that a plain `./MAC-SETUP.sh` includes a user-scope
plugin install.

---

## R3-2 — Phase A's fourth line is the whole install, and Phase A is expected to end in exit 1

**F-R3-11. Not a decision — a warning about the hand-run sequence, before you follow it tonight.**

The five-line Phase A sequence works. Every flag behaves exactly as documented; all 25 step names were
exercised under both `--only` and `--skip`. Two things about it will surprise you, and both are the
scripts being right rather than wrong.

**Line 4, `./MAC-SETUP.sh --skip omniroute`, has no `--dry-run`.** It is a full real install of the
other 24 steps — two git clones, four virtualenvs, a global npm install, a Playwright Chromium
download, `npm ci` for the pinned DOMShell copy, and the user-scope plugin install from R3-1. Set aside
real time for it and expect network traffic in the hundreds of megabytes. If you wanted the flags
demonstrated rather than the software installed, add `--dry-run` to lines 3 and 4.

**Lines 4 and 5 together are expected to end in exit 1.** The `omniroute` step is the *only* step that
writes `~/.config/claude-runner/role`, installs `claude-auto` and installs `probe.sh`. Skip it and the
`./mac-verify.sh` on line 5 will print, correctly:

```
FAIL  omniroute          not installed
FAIL  claude-auto        not in ~/.local/bin
FAIL  probe.sh           not in ~/.local/bin
NEED  claude-runner role no ~/.config/claude-runner/role — claude-auto treats this Mac as STANDBY
```

That is `--skip` working. It is not breakage. Re-run without `--skip omniroute` and all four clear.

**One more, on line 3.** `./MAC-SETUP.sh --only codeburn` needs `npm`. On a Mac where Homebrew is not
installed yet it exits 1 with `FAILED npm missing` before any prerequisite step has been allowed to
run. Run the prerequisites first, or read line 2's dry-run output to see whether `brew` and `node` are
already there.

---

## R3-3 — The never-run Mac tasks: 15 of them already missed a slot. Do not wait for Sunday.

**F-R3-07. Correcting something already on your list — F-E8-39 — in a way that moves the date forward,
not back.**

F-E8-39 says the never-run weekly tasks' "first slots fall 2026-09-25 to 2026-10-01", and asks Loop
Cycle 7 to check them on 2026-09-28 and 2026-10-02. That is wrong for **15 of the 18** never-run tasks,
because it reads the runner's `nextSlot` field — which is the *next* firing from today — as the
*first*. For a weekly task registered before 2026-09-16, the first slot was last week.

All 18 are in the toolkit snapshot stamped `2026-09-16T00:52:24Z`, so all 18 were registered on or
before **2026-09-15 17:52 PT**. First slot re-derived from each one's cron:

| Already missed a slot — enabled, and nothing ran | First slot (PT) |
|---|---|
| `r20-weekly-review-local` · `vanessa-ops-review` · `weekly-self-update` | Fri **2026-09-18** 23:50 / 22:35 / 23:10 |
| `automation-audit-weekly` · `loop-engineering-weekly` | Sat **2026-09-19** 03:40 / 04:30 |
| `r9-feed-freshness-sweep` · `r11-isa-kpi-compile` · `r6-weekly-backup` · `revenue-scan-weekly` · `ops-knowledge-graph` · `mortgage-desk-weekly` · `health-coaching-weekly` · `skills-refresh-weekly` | Sun **2026-09-20** 04:00 / 04:40 / 05:00 / 05:40 / 05:45 / 06:05 / 06:30 / 07:00 |
| `r5-rates-market-refresh` · `coach-weekly-recs` | Mon **2026-09-21** 05:05 / 06:10 |

| Genuinely still future — F-E8-39 is right about these three | First slot (PT) |
|---|---|
| `month-end-close-prep` | **2026-09-28** 04:50 |
| `access-audit-monthly` · `automation-audit-quarterly` | **2026-10-01** 05:10 / 03:30 |

Two smaller corrections in the same record: it says 20 tasks and names 19, and one of the 19,
`brain-weekly-verify`, **has** run (2026-09-14). The real never-run count is **18**. `brain-weekly-verify`
has its own problem — it also missed Sunday 2026-09-20 16:00 and has not run since 09-14.

**What this means for you.** Fifteen scheduled tasks were enabled, their slot came, and nothing ran.
Waiting for 2026-09-27 will not tell you anything the 09-20 slot has not already told you. Check each
one's output document now rather than its `lastEnd`. Two things are already known about why: Mac tasks
only run while the desktop app is open, and a scheduled run cannot answer a permission prompt — so the
first run of each has to be a supervised **Run now**, approving each tool as it asks.
`routines/mac-task-repairs.md` §10 has the worked example for `revenue-scan-weekly`.

**Not done here, and it needs its owner.** F-E8-39 is a dated audit record outside this engineer's
surface. It should be annotated, not rewritten. Exact locations: `docs/findings/findings-E8.json:725`
(the `description` field), `docs/MASTER-FINDINGS.md:334` (table row) and `:1234` (detail block),
`docs/data/auditFindings.json:3482`.

---

## Not for you — two things fixed, recorded so nobody re-opens them

- **F-P6-05 is closed.** Every advisory-only step now has a row in `mac-verify.sh`. Absent reports as
  `info`, never a failure — you declined those tools on purpose and the verifier should not nag you for
  it. `docs/INSTALL-COVERAGE.md` still says "Verified by: none" for six of them; that file is outside
  this engineer's surface and its owner should update those cells.
- **A security row that cried wolf.** `mac-verify.sh` reported
  `FAIL cli-anything-browser posture — run it directly to see which control is off` on any Mac where the
  browser harness had never been installed. No control was off; nothing was there. It now reports `info`
  until the harness exists, and still fails for real when a control genuinely is off — both directions
  proved by execution.
