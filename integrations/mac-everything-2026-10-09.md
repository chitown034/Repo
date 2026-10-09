# Mac: everything pending, in one paste (2026-10-09)

Steven, 2026-10-09: *"make the combined paste"*. This file replaces pasting five files one by one.
It adds nothing new: each part points at a file already in the repo. **Nothing here has run on a Mac yet.**

## Before you paste (Terminal, Repo folder)

    git pull

Then open Claude Code in the Repo folder on the Mac and paste everything between the two lines.

---- PASTE FROM HERE ----
You are doing Steven's pending Mac setup, in order, from this Repo checkout. Rules for every part: ask Steven
before any step that changes a skill, an MCP server, a runner task or a live task prompt; never touch a
client-facing system (no CRM writes, no email, no calendar invites); never print a key value, and never print a
lead's name, phone, email or address; stop and report on the first failure instead of improvising. If a command
is missing or refuses, say so and continue with the next part.

PART 1 - Update and reinstall the harnesses
  git pull && ./MAC-SETUP.sh --only cli-anything-harnesses
  Then confirm: lofty-cli leads timeline --help lists --v2.

PART 2 - Pause the three duplicate feed tasks (pause, never delete)
  runnerctl pause openrouter-feeds-refresh ; runnerctl pause feeds-weekly ; runnerctl pause feeds-market-close
  Then show me runnerctl list. If runnerctl is not logged in, that is Steven's hands (runnerctl login); never run
  save-token for him.

PART 3 - Opus 5.5
  bash integrations/ai-team/opus-5-5-on-mac.sh            (show what it would change, changes nothing)
  Show Steven that list, ask, then:
  bash integrations/ai-team/opus-5-5-on-mac.sh --apply && bash integrations/ai-team/opus-5-5-on-mac.sh --verify
  Report the verify result and `claude --version` (the opus alias is Opus 5.5 only on 2.1.280 or newer).

PART 4 - WhatsApp (OpenWA) only; Orca and Laya are skipped here
  bash integrations/install-orca-whatsapp-laya.sh --skip-orca --skip-laya
  Steven needs his iPhone next to him for the QR code. Report where it stopped, if it did.

PART 5 - Second Brain engine
  Read integrations/mac-brain-2026-10-08.md and run its paste block exactly as written (brain-sync dry run, then
  real run; doctor + bench --write; Laya MCP registration only on Steven's yes; brain-maintenance task only on
  Steven's yes; ops-knowledge-graph once). Laya is not installed by Part 4, so if there is no laya-venv, say so
  and leave laya_mcp as "not".

PART 6 - API Anything and the sites
  bash integrations/api-anything/install-mac.sh
  Then read integrations/api-anything/mac-connect-sites-2026-10-09.md and do Group 1 only (FRED, Freddie Mac).
  Groups 2 and 3 wait for Steven's yes per group; Group 3 is never.

PART 7 - ISA KPI and the content pipeline
  Read integrations/mac-fix-isa-kpi-2026-10-08.md and run its paste block exactly as written, sections A to E.

FINAL REPORT - end with one block for Steven to paste back to the cloud session:
=== MAC COMBINED REPORT 2026-10-09 ===
p1 harness --v2: <y/n> | p2 paused: <list> | p3 opus verify: <model> cli=<version> | p4 whatsapp: <done|stopped at ...>
p5 brain: doctor=<PASS|FAIL> bench=<n>/18 tokens=<n> laya_mcp=<registered|not> brain_maintenance=<added|exists|declined> graph=<nodes>/<edges> or <reason>
p6 api-anything: self-test=<pass|fail> fred=<ok|fail> freddie=<ok|fail>
p7: paste the full === MAC ISA-KPI REPORT === block here
left for Steven's hands: <list or none>
---- PASTE TO HERE ----
