# Mac: fix everything stale, broken or unconnected — one paste (2026-10-05)

Steven, 2026-10-05: *"look for everything throughout the dashboard that is stale, not working, not connected
and have engineers fix them"* and *"ensure everything is working and connected to include: Orca … Notes /
knowledge graph …"*.

The cloud side is being fixed by other sessions. What is left lives on your Mac, where no cloud session can
reach, so it is **one prompt** you paste into a Claude Code session **on the Mac**, in the Repo folder, after
`git pull`. It runs top to bottom, asks you before it changes anything, and ends with one short report block
you paste back into the cloud session. It is a superset of `integrations/mac-claude-only.md`: that paste-in is
Section 1 here, unchanged in substance.

*Written 2026-10-05 by E5 (Mac lane) in a cloud sandbox. Nothing in this file has run on a Mac yet, so the
times below are estimates and the prompt tells the session to measure, not assume.*

## What it does

| # | Section | What happens | About | Your hands |
|---|---|---|---|---|
| 1 | Claude-only switch | The Perplexity removal from `mac-claude-only.md`, same seven steps | 10 min | The OmniRoute dashboard clean-up, if OmniRoute runs on this Mac |
| 2 | Runner health and repairs | Checks the runner and its LaunchAgent. Reads the log of each refused task (`brain-learn-daily`, `lofty-crm-sync`, `openterminal-remote-queue`, `r11-isa-kpi-compile`, `r6-weekly-backup`) and proposes the narrowest fix, or says plainly why it stays refused. Reads the morning-brief error. Lists the nine "limited" tasks and their next slots. Changes the end-of-day roll-up so it says "Lofty not connected" instead of calling the retired CRM | 30–45 min | A yes or no on each proposed change |
| 3 | Orca | Reads the installed Orca, compares it with the latest release, updates it if it is behind, walks you through pairing the phone app, and says "verified + paired" or exactly what blocked it | 25–35 min | The update click, the phone app, the pairing code, a sign-in if you pick Relay |
| 4 | Knowledge graph | Finds why the weekly graph build ended "no-work", fixes it, rebuilds the graph, checks the deck's graph document moved, prints the exact Obsidian link | 20–40 min | A go or no-go on the spend; click the link |
| 5 | Opus 5.5 | Runs the check script from NEEDS-STEVEN 79 | 5 min | A yes before `--apply` |
| 6 | Readiness | Looks at WhatsApp/OpenWA, CLI-Anything + DOMShell, Laya and Bonsai. **Installs nothing** | 10–15 min | Nothing |
| 7 | Report | One block to paste back here | 3 min | Copy and paste |

**About two hours end to end, and you are needed in short bursts, roughly 30 minutes in total.** Most of the
time is the session reading logs and waiting on the graph build.

## Before you start

- The Mac is awake and logged in, and it is the Mac that runs the schedule (`runnerctl status` lists the tasks).
  If you have two Macs, run this on the one that holds the task lease.
- Your iPhone is next to you for Section 3.
- **The weekly allowance is at its warning level** (measured 2026-10-05 ~18:12 UTC; it resets Sun 2026-10-11
  20:00 UTC, 1 PM PT). The heaviest step is the graph rebuild in Section 4; the prompt asks before it starts and
  skips it on a "no". If a limit message appears the session stops spending, finishes with read-only checks and
  reports what is done and what is pending.
- On the Mac: `cd` to the Repo folder, `git pull`, start Claude Code there, paste the block below. If a paste
  is awkward, say: *"Open integrations/mac-fix-all-2026-10-05.md, find the fenced prompt and run it top to
  bottom."*
- Want to look before anything changes? Add the words **report only** after the paste. Every change then counts
  as a "no", Section 1 included.

## What it will not do

Delete a task (it can only pause one). Touch a client-facing system. Paste a credential, a key or an Orca
pairing code into the chat. Run `git commit` or `git push`. Install anything without your yes, one item at a
time; the only things it can install or update at all are Orca (Section 3) and, on your yes, Graphify
(Section 4). If Section 5 finds Claude Code too old for Opus 5.5 it tells you to run `claude update` yourself
after the run; it never does that mid-session. `r6-weekly-backup` is left enabled and unchanged: the cloud
backup is failing (last good backup 2026-09-22; another engineer is fixing it), so the Mac backup may be your
only one. It reads r6's log and tells you why it refused. You decide.

## The paste-in

```text
Steven's instruction, 2026-10-05: "look for everything throughout the dashboard that is stale, not working,
not connected and have engineers fix them" and "ensure everything is working and connected to include:
Orca ... Notes / knowledge graph ...". The cloud side is being fixed by other sessions; this is the Mac side.

You are in a Claude Code session on Steven's Mac, in the Repo folder, after git pull. The router (CLAUDE.md)
and its HALT list apply to everything below. Read only the repo files this prompt names; do not browse the
tree. Work sections 1 to 7 IN ORDER, keep a running list of what you checked and changed, and finish with the
REPORT block in section 7. If Steven says "stop", jump to section 7 and report what is done.

GROUND RULES - every section
 a. Read-only unless a step says CHANGE. Section 1 carries Steven's own approval (2026-10-05) for exactly what
    it names. Everywhere else, before ANY change (a task edit, an allow-list entry, a pause, an update, an
    install, an edit to a file) show Steven the exact before and after and wait for his "yes" in this session.
    "No" or silence = SKIPPED; say so in the report. Ask once per section where you can: list the proposed
    changes, numbered, and let him answer "all", "none" or the numbers. If he writes "report only" anywhere,
    every CHANGE in every section (section 1 included) becomes SKIPPED.
 b. Never delete a task (pause only). Never touch a client-facing system: no email, text, CRM write, calendar
    invite or message to anyone. Never git commit or git push in the Repo folder; leave any change to a Repo
    file uncommitted and list it in the report.
 c. Never paste, print or repeat a credential in this chat or in the report: API keys, tokens, .env values,
    Keychain secrets, Orca pairing codes or QR contents. Check that a key exists by NAME only (set / no value /
    missing). If a command prints something key-like, write [withheld].
 d. Every install, update, purchase, sign-in or account change needs Steven's explicit "yes" in this session,
    one at a time. Section 6 installs nothing.
 e. Logs can hold Steven's private text, client names or numbers. Read them with tail or a narrow grep, quote
    only the single refusal or error line (the tool and the path), and never copy a transcript, name, phone
    number, email or amount into the report.
 f. Do not write any Command Deck document yourself; the tasks write their own. You may READ one:
    Read state/<doc> on https://claude.ai/code/artifact/1624daae-d683-405a-971d-c5828dce0f8d
 g. Stuck on a step: two tries, then record BLOCKED with the exact blocker and go on. Never a third retry.
 h. Spend: Steven's weekly Claude allowance was at its warning level on 2026-10-05 and resets Sun 2026-10-11
    20:00 UTC (1 PM PT). Keep reads targeted (tail, grep); never cat a whole log. If a "weekly limit" or
    "session limit" message appears, stop spending, finish with read-only checks and report what is done and
    what is pending.
 i. Times: the runner records Mac-local Pacific time. Use date -u for any UTC stamp, and say how old each fact is.
 j. Which Mac: run scutil --get ComputerName (it goes in the report header), cat ~/.config/claude-runner/role
    (expect peer) and, if it is on PATH, claude-auto --status (read-only; it takes no lease). If a manual task
    run ever prints "standby: lease held by <other Mac>" (exit 75), this Mac does not hold the lease: write
    nothing more through tasks here, never take the lease without Steven's explicit yes, and tell him to run
    this prompt on the Mac that holds it.

==== SECTION 1 - THE CLAUDE-ONLY SWITCH (Steven approved this on 2026-10-05; same text as
==== integrations/mac-claude-only.md. If a step is already done, verify it and say "already done". For the
==== prompt edits in 1.2 and 1.4 use the same safe route as 2.4.)

Steven's decision, 2026-10-05: remove everything running on Perplexity on this Mac and run all research
on the Claude subscription (WebSearch / WebFetch). Perplexity is out of credit; every task has been
falling back to Claude anyway. Do these, in order, and report what you changed:

1.1 Pause the three Mac feed tasks the cloud routines replaced (their feeds are now written by Claude
    cloud routines - do not delete them): runnerctl pause openrouter-feeds-refresh ;
    runnerctl pause feeds-weekly ; runnerctl pause feeds-market-close
1.2 weather-news-refresh: keep it running, but for WEATHER ONLY (wttr.in, no LLM research). Edit its
    prompt so it no longer writes newsSnapshot - the Claude news routine in the cloud writes news now.
1.3 Switch the runner's research provider to Claude only: remove the Perplexity-first / fallback logic
    you added on 2026-10-04, so every research task uses Claude WebSearch / WebFetch and runnerStatus
    reports researchProvider.provider = "claude".
1.4 vanessa-research-queue: edit its prompt - research with Claude WebSearch / WebFetch and the AI team,
    never Perplexity. Same for any other task prompt, agent file, skill or roster-tiers.json rule that
    names Perplexity (grep ~/.claude and the runner's task definitions, case-insensitive). If you rename
    roster-tiers.json's maxPerplexityPerWave, update every reader in the same change.
1.5 Remove the Perplexity MCP server: claude mcp remove perplexity (user scope), and drop it from any
    project .mcp.json. Leave the Composio perplexityai connection alone unless I say so - nothing calls it.
1.6 OmniRoute: git pull is enough for routing - research now routes direct on the Claude subscription
    (integrations/omniroute/route-map.json), never through OmniRoute. If OmniRoute runs on this Mac, open
    its dashboard (http://127.0.0.1:20128) and delete any leftover "research" combo and "perplexity"
    provider; configure-omniroute.sh no longer creates either.
1.7 Verify and report: runnerctl list (the three paused), one research task run end to end on Claude,
    runnerStatus.researchProvider, and a final case-insensitive grep showing no task, agent, skill or MCP
    config on this Mac still sends work to Perplexity.
Never delete a task, never touch a client-facing system, never edit anything this section does not name.

==== SECTION 2 - RUNNER HEALTH AND REPAIRS

2.0 Baseline (read-only).
 - ./mac-verify.sh  (read-only; writes nothing; never prints a key value). Keep the output for sections 2, 3
   and 6. It lists the launchd agents, runnerctl status, key-file NAMES (including ~/.config/lofty/.env
   LOFTY_API_KEY), MCP servers and Laya. It has NO Orca check; do not expect one.
 - runnerctl status, then runnerctl list. Report: logged in? running or waiting? any backoff? Count the tasks by
   last status. The runner's own snapshot at 2026-10-05 09:05 PT (Mac clock) read: 60 tasks - 38 ok, 9 limited,
   5 refused, 2 no-work, 1 error, 5 never run. After section 1 the three feed tasks should read paused.
 - LaunchAgent: launchctl list | grep -i claude-runner  (label com.stevenshearrill.claude-runner; column 1 is
   the PID, column 2 the last exit status; absent or non-zero = not healthy). If it is absent or failing, do NOT
   invent a launchctl command: ask runnerctl for its usage (runnerctl --help; if that is not accepted, runnerctl
   with no arguments), find how the runner installs its supervisor, report exactly what is missing and give
   Steven the fix as a proposal (NEEDS-STEVEN 42).
 - If runnerctl status says it is not logged in, that is Steven's hands (runnerctl login opens a Claude login);
   never run save-token for him. If tasks are overdue and nothing is running, runnerctl restart is the
   documented lever: only on that evidence, only with his yes, and ask him to keep the Mac awake.
 - Read state/runnerStatus (rule f): how old is syncedAt (fabric-deck-sync refreshes it about every 2 hours,
   7 AM to 9 PM PT) and what does researchProvider.provider say (it read "claude-fallback" on 2026-10-05; after
   section 1 and one research run it should read "claude").
 - FYI only, change nothing: vanessa-discord-inbox reads "no-work" every 5 minutes because no Discord token
   exists. Put it in the report as Steven's call (a pause would save those runs until a token exists).

2.1 The five refused tasks. "refused" means a tool or path was not on the runner's allow-list. For EACH task
    below establish its task definition and its allow-list, then its last run's log around the time shown (use
    runnerctl logs <task>, tail it). You want the exact tool or path that was refused; that is the check
    routines/mac-task-repairs.md section 4 uses. Quote only that one line. Then sort the cause:
      A. A narrow gap on something the task legitimately needs (one host, one path, one command). Proposal: add
         exactly that one entry. No wildcard wider than the thing named, never ~/ or /, never a credentials
         folder, never wiki/clients/ or the vault's client folders, never a Bash write outside the one path named.
      B. The task's purpose is gone. Proposal: runnerctl pause <task> (never delete).
      C. It needs a credential, account or connector that does not exist yet. Leave it exactly as it is, say so
         plainly, and do NOT widen the allow-list to get round it.
      D. Not an allow-list problem (a timeout, a crash, a usage limit, a missing file). Report the cause; fix
         only what is local and plainly safe, with Steven's yes.
    If you cannot establish where the allow-list lives from runnerctl's own usage or the task definition, stop
    on that task and report it. The repo documents no location (integrations/mac-sync/README.md): never guess a
    file path and never hand-edit the runner's internals.
    After an approved fix, re-test once with runnerctl run <task> (his yes; it spends allowance) or leave it to
    its next slot, and say which. One manual run per task, never a loop.

    brain-learn-daily (50 22 * * *, last refused 10-04 23:18 PT). Distills Steven's own chat transcripts and
      the Google Drive "Second Brain" folder into Second Brain rows; flagged items wait for the Sunday review
      gate. If the refused item is the Drive folder it is C: Drive was never wired (NEEDS-STEVEN 15) and wiring
      it needs a Google OAuth grant, which is a HALT. Offer Steven the other option: trim the Drive step out of
      the prompt so the transcript half can run. A local transcript path or the Second Brain write is A.
    lofty-crm-sync (45 7,13 * * 1-6, last refused 10-05 07:47 PT). Reads Lofty and writes the loftyLeads
      document. Take the key check from mac-verify's output (lofty/.env and LOFTY_API_KEY: set / no value yet /
      placeholder). If it says set, also run lofty-cli auth status (read-only; redact anything key-like). NO KEY:
      report plainly "stays refused until the Lofty key exists (NEEDS-STEVEN 6)". Do not fake it: no dummy key,
      no editing the task to skip its self-test, no writing loftyLeads or any lead number yourself, no
      allow-list widening. If the key IS set and the refusal is a real narrow gap, that is A. Optional lever,
      Steven's call: runnerctl pause lofty-crm-sync would stop the twice-daily refusals spending allowance until
      the key exists; the default is to leave it, so it keeps reporting honestly.
    openterminal-remote-queue (45 6-21 * * *, last refused 10-05 08:46 PT). Reads the deck's openTerminalQueue
      and runs each queued market lookup against the local OpenTerminal API through a strict allow-list. Nothing
      has been queued since 2026-09-12 and it polls hourly. If the refused item is a narrow local call to the
      OpenTerminal API that the task is built to make, it is A (find the API address in the task's own
      definition; never guess it). If OpenTerminal is not installed or running and nothing is queued, say so
      and propose B, but it is Steven's call: the deck's OpenTerminal card relies on this task whenever he
      queues a lookup.
    r11-isa-kpi-compile (40 4 * * 0, last refused 10-04 14:57 PT). Turns Lofty events into ISA KPI actuals.
      Expect C (unless the log says otherwise): it needs the Lofty key, and the ISA seat is unfilled
      (NEEDS-STEVEN 3). If the log shows it still calls the retired CRM (/v1/people) or a Composio CRM call, say
      so: its live prompt has not been pointed at Lofty yet (NEEDS-STEVEN 23, which waits for the key). Leave it;
      it runs weekly, so it costs little.
    r6-weekly-backup (0 5 * * 0, last refused 10-04 15:03 PT). Coordinator rule for this run: do NOT pause,
      disable or edit it. The cloud backup failed today (last good backup 2026-09-22; another engineer is
      fixing it), so this task may be Steven's only backup path. Read its log, report WHY it refused, and
      give the narrowest fix as a proposal only; apply it only if Steven names r6 and says yes. A bare "all"
      never includes r6. Also list, names and dates only (never open them), the newest three folders in
      ~/Documents/AI-Ecosystem-Backups, so he knows what a local backup holds.

2.2 vanessa-morning-brief-text (40 6 * * *) ended "error" at 06:51 PT today, yet the brief and the voice note
    were delivered by iMessage at 13:49 UTC (06:49 PT; the deck's agentInbox says so). Read its log tail: which
    step failed, and was it after the send? Do NOT run the task by hand: it would text Steven again. If the
    cause is a narrow allow-list gap, it goes in the 2.6 list as A; otherwise report the cause and a fix
    proposal. It is verified at its next 6:40 AM PT slot (the FOLLOW-UP in section 7).

2.3 The nine "limited" tasks. They ran during the Sep 30 - Oct 1 usage lockout and did less than they describe:
    a stale status, not necessarily a fault. Do NOT run any by hand (it spends allowance and most slots are
    close). From runnerctl list and runnerStatus confirm each is enabled and note its next slot (as of
    2026-10-05 09:05 PT): lead-triage-daily 11:33 PT Mon-Fri; vanessa-sweep 12:35 and steve-twin-sweep 12:55 PT
    Mon-Fri; r17-trading-day-log 22:40 and r4-quantvue-sync 23:20 PT Mon-Fri; r14-content-pipeline 5:45 AM PT
    Tue-Fri; access-audit-monthly 2026-11-01 and automation-audit-quarterly 2027-01-01 (those two cannot be
    tested before then: say so; running them by hand costs allowance, so suggest it only after the reset on
    Oct 11). The ninth, feeds-market-close, is paused by section 1: skip it. If a slot has already passed since
    that snapshot, read its new status now and report it. Watch three: vanessa-sweep (it writes vanessaBrief,
    stale since 2026-09-23); r4-quantvue-sync (it was refused for an allow-list gap before the lockout,
    NEEDS-STEVEN 9); lead-triage-daily (its live prompt may still name the retired CRM, NEEDS-STEVEN 23, so it
    may turn red until the Lofty key exists). Section 7 ends with a FOLLOW-UP Steven can run after those slots.

2.4 r3-eod-rollup (45 22 * * *, writes the eodRollup document). Its speedToLeadStatus still reads "NO DATA -
    composio proxy to /v1/people exited 137 (killed) ... 8th consecutive occurrence, stale since 2026-09-23":
    the retired CRM's endpoint, which can never answer now. CHANGE (Steven's yes): find the step in r3's live
    prompt that produces speedToLeadStatus and speedToLeadMedian (look for /v1/people, composio, speed-to-lead,
    leadResponse), show Steven the old step, and replace it with this one:
      [begin new step] Speed to lead: do not call any CRM, Composio proxy or /v1/people endpoint, and do not
       copy the failure text out of the leadResponse document (it is stale since 2026-09-23). Read
       state/loftyLeads. If its status is exactly 'ok', set speedToLeadMedian to firstResponse.medianMin and
       speedToLeadStatus to 'Lofty, synced <loftyLeads.syncedAt>'. Otherwise set speedToLeadMedian to null and
       speedToLeadStatus to 'Lofty not connected'. Never carry an old number forward and never invent one.
       [end new step]
    Apply it only through a route you can establish: the desktop app's Scheduled section is the repo's route,
    and runnerctl's own usage will say whether it can edit a task. If you cannot find a safe route, give Steven
    the exact text and the click path and mark it "Steven's hands". Never edit the runner's internals by guessing
    a file path. Do not run the task by hand; eodRollup is checked after its next 10:45 PM PT slot (FOLLOW-UP).

2.5 Read-only survey, no edits. Which of these live task prompts still call the retired CRM (look for /v1/people
    or a Composio CRM call): lead-triage-daily, r2-lead-response-watchdog, r11-isa-kpi-compile, showing-sync?
    Report yes or no per task, with its cron from runnerctl list. They need the Lofty key before they can be
    pointed at Lofty (NEEDS-STEVEN 23). A task that keeps calling a dead endpoint spends allowance on every
    run: say how often each runs and leave any pause to Steven.
    Also read-only: strava-daily-sync writes stravaSnapshot, which held activities: [] at 12:22 UTC on 2026-10-05
    although the Strava connector shows a Sep 12 activity inside a 30-day window. Read its prompt and the tail of
    its last log and report why (window, connector or filter). If Steven moves Strava to the cloud routine
    (routines/fixes-2026-10-05/README.md, item 1), propose pausing this task so the two never overwrite each other.

2.6 Decisions. Present ONE numbered list of every proposed change from 2.0-2.5: what, why, the exact before and
    after, and what proves it worked. Apply only what Steven approves. Verify each one (runnerctl list shows
    the pause; re-reading the task definition shows the edit). Anything refused or skipped goes to NEEDS
    STEVEN in the report.

==== SECTION 3 - ORCA (Stably AI, github.com/stablyai/orca): verify, update if behind, pair the phone

Context: the Mac's toolkit reported "Orca Computer Use v1.4.203, bundle com.stablyai.orca" on 2026-09-16, and its
2026-10-05 13:16 UTC snapshot lists "Orca 1.4.220 (updated 2026-10-04, notarized)" at /Applications/Orca.app; never
confirmed from anywhere but this Mac (F-V2-23). Orca runs Claude Code and Codex agents side by side in
worktrees and has an iOS/Android companion app that pairs to the desktop app. It only runs agents Steven
starts in it; it does not change how Vanessa or the runner work, and it is not a recall store. Do not run any
"orca computer ..." command, grant Orca any macOS permission, or let it drive another app: that executor idea is
still a proposal under review (Elena).

3.1 Verify the app (read-only). mac-verify.sh has no Orca check at all, so read the app itself:
      ls -d /Applications/Orca.app      (if missing: ls /Applications ~/Applications | grep -i orca)
      defaults read /Applications/Orca.app/Contents/Info CFBundleIdentifier           (expect com.stablyai.orca)
      defaults read /Applications/Orca.app/Contents/Info CFBundleShortVersionString   (the installed version)
    Use the real path if it is not in /Applications. Then see whether Orca's command-line tool is there, and do
    not assume it is: command -v orca, else /Applications/Orca.app/Contents/Resources/bin/orca. If it is, run
    orca --help once, then orca status (no --json) and report the app, runtime and graph lines (appRunning,
    runtimeState, runtimeReachable, graphState). Use only subcommands that this Mac's own orca --help lists.
    If it is not there, do not install it: the project's docs register it under Orca's Settings > General >
    Orca CLI, which is Steven's call. If Orca is not running, ask him to open it (open -a Orca is what the
    repo's install script uses).
3.2 Compare with the latest release. WebFetch https://github.com/stablyai/orca/releases/latest for the newest
    STABLE release (version and date) and https://github.com/stablyai/orca/releases for the newest prerelease.
    If WebFetch is blocked, ask Steven to read you the top two entries. Report BOTH numbers beside the installed
    one. Context from a cloud session on 2026-10-05: the project's main branch builds as v1.4.214 (commit
    a68ee67). That is a source-tree version, not a release; do not treat it as the target. The project ships
    stable and release-candidate builds: if the installed build is NEWER than the latest stable, say "ahead of
    stable (looks like a prerelease build)" and do NOT downgrade.
3.3 If the installed version is OLDER than the latest stable: tell Steven, get his yes, and have him (his hands)
    update from inside Orca: Settings > General > Updates > Check for Updates, or the app / Help menu. A PLAIN
    click, with no Shift, Cmd or Option held (those pull release-candidate or experimental builds). Orca restarts
    when it updates, so tell him to let running agents finish first. If the in-app updater offers nothing, say so
    and let him choose between the repo's own command (brew upgrade --cask stablyai/orca/orca; the upstream
    cask is marked self-updating, so brew may do nothing) and the macOS download on the releases page. Re-read
    the version afterwards and report old -> new. If it is not behind, skip this step.
3.4 Pair the phone, one step at a time. Steven's hands do every tap, scan, sign-in and entry; after each step
    wait for him to say "done" or tell you what he sees. These steps come from the project's own docs (source
    read 2026-10-05, "Mobile companion"); the live app wins where it differs, and you tell Steven when it does.
    a. Ask: iPhone or Android, and which pairing path. Relay (pairing through Orca's own relay; the docs say
       sign-in is required for Relay only, so see what the app really asks) or LAN (phone and Mac on the same
       Wi-Fi, no sign-in, Orca asks for the Mac's local address). What a relay can see is not verified here;
       LAN stays on his own network. His choice. A sign-in or account is his hands and his yes (rule d); never
       ask him to read you a password.
    b. The phone app. iPhone: https://apps.apple.com/us/app/orca-ide/id6766130217 (beta). Android: the APK
       linked from the README at github.com/stablyai/orca. Installing it is his hands.
    c. On the Mac, in Orca: open the pairing flow from the account / status menu. Orca shows a one-time pairing
       code. Do not read, screenshot, copy or repeat it, and do not run any command that prints it.
    d. On the phone: open the Orca app, choose Pair, scan or enter the code. Codes expire after a few minutes;
       if it stalls, make a fresh one on the Mac. The project's own troubleshooting: the code is fresh, both
       sides are current and, on Relay, both devices are signed into the same Orca account. If the phone says
       the app or the computer is too old, go back to 3.3.
    e. Done when the phone's host list shows this Mac connected.
3.5 Prove it. "Paired" is not "connected": REMOTE-ACCESS.md wants the phone to actually see a running agent. Ask
    whether Orca already has a project with a worktree. If so, use it. If not, make a throwaway git folder
    OUTSIDE the Repo folder (show Steven the commands first: mkdir ~/orca-pairing-test, then git -C
    ~/orca-pairing-test init, plus one empty first commit only if Orca cannot create a worktree without one) and
    have him add it in Orca. In Orca he starts ONE Claude Code agent there with a one-line prompt ("Reply with
    the word ready, then stop"). On the phone he opens the host and tells you: does the worktree show, with its status
    (working / done / waiting)? Optional: tap in and send a one-word reply; did it appear on the Mac? Record
    sees=yes/no and steers=yes/no/not tried. If this Mac's orca --help lists worktree commands, orca worktree ps
    (read-only) is a second view from the Mac side. Afterwards Steven removes the throwaway project in Orca
    himself; you delete nothing and you say the folder is still there.
3.6 Verdict. VERIFIED + PAIRED only if all hold: the bundle id matches, the version is read, it is current (or
    ahead of stable), orca status reads ready (or the CLI is not registered: say n/a) and the phone saw the live
    agent. Otherwise NOT YET plus the exact blocker. Do not call the path "connected" anywhere unless it is
    VERIFIED + PAIRED.
3.7 Two things to tell Steven once, with no action. (1) Orca collects anonymous usage data; its privacy page
    describes what and how to opt out (Settings > Privacy > "Share anonymous usage data"). He opted out of
    CLI-Hub telemetry on the same grounds (NEEDS-STEVEN 11). His call; change nothing and do not read that
    setting for him. (2) OPTIONAL, later: he may choose to let cloud sessions see this Mac's Orca runtime, which
    works by saving a pairing code with Orca's own CLI (orca environment add). That widens who can reach the
    agents on this Mac: his call, with Elena's review first. This run does nothing about it: do not create,
    print, paste or send any pairing code for it, anywhere.

==== SECTION 4 - NOTES / KNOWLEDGE GRAPH (Graphify, the ops graph in the vault)

Context, 2026-10-05: the deck's knowledgeGraph document is still the 2026-09-13 build: 750 nodes, 1,104 edges,
69 communities, vaultPath "~/Documents/Shearrill-Vault/60-Knowledge" (read it with rule f). The weekly task
ops-knowledge-graph (Sundays 5:45 AM PT) ended "no-work" at 2026-10-04 15:28 PT. Graphify is a Claude Code skill
(~/.claude/skills/graphify): /graphify <folder> --obsidian turns a folder of notes into an Obsidian vault, an
interactive graph.html and a plain-language GRAPH_REPORT.md.

4.1 Why "no-work"? Establish the task definition, its allow-list and the log of that 2026-10-04 15:28 PT run
    (tail it). Find the one line that decided it and sort it: (a) a wrong or missing vault path; (b) a path the
    allow-list does not cover; (c) a missing precondition: the 2026-09-13 build's own note says the Sunday backup
    had never run, so it exported both dashboards live before staging, and today both backup paths are down (r6
    is refused, the cloud backup failed), so check this one first; (d) nothing changed since the last build, so
    "no-work" was right; (e) Graphify itself is missing.
4.2 Find the real vault. The repo docs say ~/Shearrill-Vault; the deck's document says ~/Documents/Shearrill-Vault.
    ls -ld both, and ~/Documents/Shearrill-Vault/60-Knowledge (a symlink? which one is real?). The vault root is
    the folder that holds .obsidian: walk up from 60-Knowledge until you find it. Report both paths and which is
    real.
4.3 Is Graphify there? graphify --version and ls ~/.claude/skills/graphify. If not, do not install it (the repo's
    command is pipx install graphifyy && graphify install, MAC-INSTALL-tooling.md section 2): ask first.
4.4 Never-graph-a-secret screen, BEFORE any build (knowledge-graph/README.md). Nothing about a client, a
    credential or an account number may become a node. List names only, never contents: the top-level entries
    of 60-Knowledge and a file count (find ... | wc -l). Flag any name suggesting client, borrower, lead,
    account, member, loyalty, credential, password, token, secret, .env, or anything from wiki/clients/. Then
    run a tripwire that prints FILE NAMES only:
      grep -rliE '[0-9]{3}-[0-9]{2}-[0-9]{4}|(account|acct|loan|routing)[ _#:.-]*(number|no)?[ :#-]*[0-9]{6,}|BEGIN [A-Z ]*PRIVATE KEY|sk-[A-Za-z0-9_-]{20,}|ghp_[A-Za-z0-9]{20,}' <the 60-Knowledge folder> | head -40
    Any hit or flagged name: STOP, give Steven the names (not the contents), and build nothing until he says what
    to exclude or move. Never export or stage Command Deck documents into the graph input: the 2026-09-13 build
    staged a file holding 20 real loyalty account numbers, and its own note says it was deleted before the build.
4.5 Spend gate. Tell Steven the file count and that Graphify extracts through this Claude session, so a rebuild
    spends the same weekly allowance that is at its warning level. Get an explicit go or no-go. On "no-go" skip
    4.6 and 4.7 and do 4.8.
4.6 Fix and rebuild.
    (i) If 4.1 found a path or allow-list cause in the task, propose the narrowest change (the rules of 2.1; for
    a task-prompt edit, the route rule of 2.4) and on his yes make it. Then runnerctl run ops-knowledge-graph
    once: the task is the intended writer of the knowledgeGraph document. Watch runnerctl logs
    ops-knowledge-graph (tail).
    (ii) If the task still cannot run today, build directly. Read ~/.claude/skills/graphify/SKILL.md first for
    the flags and where output lands, then run /graphify on the 60-Knowledge folder with --obsidian, from a
    working directory that keeps graphify-out/ OUT of the Repo folder (it must never be committed,
    MAC-INSTALL-tooling.md section 2). If it landed in the Repo anyway, say so and leave it uncommitted. A
    direct build does not write the deck's document: say so.
4.7 Confirm. Read state/knowledgeGraph again: syncedAt (it was 2026-09-13T17:23:00-07:00), nodes, edges and
    communities (they were 750 / 1,104 / 69). Report before -> after. If the stamp did not move, say so and do NOT
    write the document yourself; after a direct build, hand Steven the measured counts and the build time so
    the cloud session can decide.
4.8 The link. Print the exact link Steven can paste into the deck. Vault name = the last part of the vault root
    path. Link: obsidian://open?vault=<name, URL-encoded>. If the graph report is a note inside the vault, also
    print obsidian://open?vault=<name>&file=<path inside the vault without .md, URL-encoded>. URL-encode with
    python3 -c 'import sys,urllib.parse;print(urllib.parse.quote(sys.argv[1],safe=""))' "<text>". Then
    open "<link>" and have Steven say whether Obsidian opened the right vault. The obsidian:// scheme is
    Obsidian's own (the repo has no link to copy), so print exactly what you tested and mark it tested yes/no.
    If the vault is not registered in Obsidian or the name is ambiguous, print the plain path instead and say
    so. If a build ran, also print the full paths of graph.html and GRAPH_REPORT.md. Never print note contents.

==== SECTION 5 - OPUS 5.5 CHECK (NEEDS-STEVEN 79)

5.1 claude --version, then: bash integrations/ai-team/opus-5-5-on-mac.sh   (shows what names Opus 5 outright;
    changes nothing). Claude Code 2.1.280 or newer already runs every "model: opus" agent on Opus 5.5; what
    stays on Opus 5 is anything that names claude-opus-5 outright.
5.2 If it found any: show Steven the list (files and counts only) and, on his yes, run the same script with
    --apply (it backs up to ~/.claude/backups/opus-5-5-<stamp> first). If it changed a LaunchAgent file, report
    which one; do not reload agents.
5.3 bash integrations/ai-team/opus-5-5-on-mac.sh --verify   (one tiny Claude call; expect PASS). If it says "Not
    Opus 5.5 yet", the fix is claude update: do NOT run it mid-session. Put it first on NEEDS STEVEN (run it
    after this session, then re-run --verify).
5.4 Tell Steven: in his own sessions, type /model once and pick Opus 5.5.

==== SECTION 6 - READINESS ONLY (installs nothing)

For each item print one state line and, if it is not live, the exact command Steven would run later. Do NOT
run those commands.
Start from this Mac's own inventory, not the repo's assumptions. Its toolkit snapshot (2026-10-05 13:16 UTC)
lists as installed: OpenWA 0.24.0 NATIVE at ~/Applications/repos/OpenWA (no Docker; 127.0.0.1:2785; key file in
~/.config/openwa), WhatsApp CLI at ~/Applications/whatsapp-cli (2026-10-04), the CLI-Anything plugin and the
read-only harnesses at ~/Applications/cli-anything-harnesses (2026-10-04), Laya 0.3.27 in ~/Applications/laya-venv
(MCP server not registered), Bonsai 27B at ~/Applications/bonsai-27b on 127.0.0.1:8093 (standalone, not in the
free fallback; it fabricated a VA fee in testing, so it stays off client work until the proof passes), OmniRoute
at ~/Applications/OmniRoute (health: GET /healthz or /api/health), Graphify at ~/Applications/repos/graphify, and a
Setup Assistant at ~/Applications/setup-assistant that takes keys with hidden input into their 600 files. Where a
check below names a different path (~/laya-venv, ~/Applications/openwa, Docker, Keychain items), check both and
report which exists. Say "installed per the snapshot, confirmed" or "snapshot says installed, not found".
6.1 WhatsApp / OpenWA (NEEDS-STEVEN 78). Checks: docker info >/dev/null 2>&1 (is Docker Desktop running?);
    ls -d ~/Applications/openwa; curl -s http://127.0.0.1:2785/api/health (expect {"status":"ok",...});
    security find-generic-password -a "$USER" -s openwa-admin-key >/dev/null 2>&1, and the same with
    -s openwa-vanessa-operator-key (do the Keychain items exist? print present or absent, never a value);
    launchctl list | grep -i -E 'openwa|whatsapp'; runnerctl list | grep -i whatsapp. Only if the bridge agent is
    loaded: python3 integrations/openwa/vanessa-bridge.py --check --claude "$(command -v claude)" (sends nothing)
    and tail -5 ~/Library/Logs/vanessa-whatsapp-bridge.log. State: NOT INSTALLED / INSTALLED, NOT LINKED / LIVE.
    Later, on his yes: git pull && bash integrations/install-orca-whatsapp-laya.sh --skip-orca --skip-laya
    (installs Docker Desktop if missing, 10-15 minutes the first time, then a QR code that only his phone can
    scan: WhatsApp > Settings > Linked Devices > Link a Device). OpenWA is unofficial and is fenced to his own
    Message Yourself chat.
6.2 CLI-Anything + DOMShell (NEEDS-STEVEN 38 and 11). Checks: cli-hub --version; claude plugin list | grep -i
    cli-anything; ls ~/Applications/cli-anything-harnesses/.venv/bin/cli-anything-*; command -v
    cli-anything-homes and, if it is there, cli-anything-homes --help | grep -qw act && echo FAIL || echo ok
    (a WORD match; the read-only proof, SETUP-RUNBOOK.md D3); echo "${CLI_HUB_NO_ANALYTICS:-unset}" and grep -c
    CLI_HUB_NO_ANALYTICS ~/.zprofile (the telemetry opt-out; if it is unset, offer the one line
    export CLI_HUB_NO_ANALYTICS=1 for ~/.zprofile as a config edit with his yes, not an install); whether
    DOMSHELL_TOKEN is set (name only); runnerctl list | grep -i cli-anything (does the cli-anything-status task
    exist?). Ask Steven whether the DOMShell Chrome extension is installed (you cannot see it). If the hub,
    plugin or harnesses are missing, integrations/cli-anything-harnesses/connect.sh --dry-run prints every
    command it would run and touches nothing: run it and give its plan in one line.
    Later, his hands: install DOMShell, sign in to each site by hand, accept the DOMShell risk in writing, export
    DOMSHELL_TOKEN, then connect.sh. All 26 browser recipes shipped verified:false (SETUP-RUNBOOK.md D, as of
    2026-09-24), so nothing they return may drive a decision yet. Do not run any recipe, discover or write verb
    now.
6.3 Laya (NEEDS-STEVEN 68). Checks: ls -d ~/laya-venv; if it exists, ~/laya-venv/bin/python -I -c "import laya;
    print(laya.__version__)" (the repo pins 0.3.21; the Mac's snapshot lists 0.3.27 in ~/Applications/laya-venv, so check that path too); claude mcp list | grep -i laya; ls -d ~/.cache/huggingface
    (checkpoints downloaded?); curl -sS -o /dev/null -w '%{http_code}\n' https://huggingface.co (can this Mac
    reach the place the one-time model download comes from? It was blocked in the cloud sandbox).
    Later, his decision and his yes: bash integrations/laya/install.sh, then claude mcp add laya --env
    LAYA_DEVICE=cpu -- ~/laya-venv/bin/laya-mcp-server, and confirm with claude mcp list. Laya never makes a
    licensed decision.
6.4 Bonsai 27B, the local tier (NEEDS-STEVEN 75). Checks: bash integrations/omniroute/setup-local-llm.sh
    --dry-run (prints the plan and the 5.9 GB / ~9.5 GB sizes; installs nothing); bash
    integrations/omniroute/configure-omniroute.sh --dry-run (prints the REST calls it would make; sends nothing);
    whether BONSAI_TOKEN is set in this environment (name only); df -h "$HOME" (room for ~10 GB?);
    curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:20128/healthz (is OmniRoute up?); grep -c
    '^OMNIROUTE_LOCAL_MODEL=' ~/.config/omniroute/.env (expect 0 until the proof passes).
    Later, his hands: export BONSAI_TOKEN (his own Hugging Face token, in his own shell), run
    setup-local-llm.sh and configure-omniroute.sh, then the four-step proof in integrations/omniroute/README.md
    ("Prove it on the Mac"). Until it passes, client-data tasks defer; that is correct.

==== SECTION 7 - THE REPORT (paste-back for the cloud session)

Print ONE block of plain text: no secrets, no client names or numbers, no pairing codes, exactly this shape.
Keep lines short (split a long one in two rather than cut a fact). Fill every field; write n/a or the reason
when a step was skipped.

=== MAC FIX-ALL REPORT ===
Mac: <scutil --get ComputerName>   Run: <Mac local time> PT (<date -u>)   Claude Code: <claude --version>
1 CLAUDE-ONLY: <DONE|PARTIAL|SKIPPED|ALREADY DONE> - researchProvider=<value> - paused=<which> - perplexity MCP=<removed|absent|still present> - leftovers=<none|list>
2 RUNNER: LaunchAgent=<loaded|not loaded|exit N> - role=<peer|...> - statuses=<ok N, limited N, refused N, ...>
  brain-learn-daily=<cause; A|B|C|D; fixed|proposed|left>
  lofty-crm-sync=<key set|no value|missing>; <stays refused until the key | ...>
  openterminal-remote-queue=<cause; A|B|C|D; fixed|proposed|left>
  r11-isa-kpi-compile=<cause; A|B|C|D; fixed|proposed|left>
  r6-weekly-backup=<why it refused; NOT paused or edited; newest local backup folder name and date>
  vanessa-morning-brief-text=<failed step; sent before the error yes|no; fix>
  limited=<N tasks; next slots; follow-up due>
  r3-eod-rollup=<changed|text handed to Steven|skipped>
  still-calling-retired-CRM=<task list|none>
3 ORCA: installed=<ver> bundle=<id> - latest stable=<ver> newest prerelease=<ver> - action=<none|updated old->new|declined> - orca status=<ready|n/a|...> - phone=<paired and sees a live agent|blocked: ...> - VERDICT <VERIFIED + PAIRED|NOT YET: exact blocker>
4 GRAPH: no-work cause=<...> - fix=<...> - rebuild=<done N nodes / M edges|skipped: why> - knowledgeGraph.syncedAt <before> -> <after> - vault root=<path> - link=<obsidian://...> (tested yes|no)
5 OPUS 5.5: Claude Code <ver> - Opus-5 strings in <n> files -> <applied|declined|none> - verify=<PASS|FAIL|not run>
6 READINESS: WhatsApp/OpenWA=<NOT INSTALLED|INSTALLED, NOT LINKED|LIVE> - CLI-Anything=<state> - DOMShell=<state> - Laya=<state> - Bonsai=<state>
CHANGES MADE: <numbered, one line each, before -> after>
LEFT UNCHANGED ON PURPOSE: <list>
NEEDS STEVEN: <numbered; each says what only his hands or his decision can do>
=== END ===

Then print a FOLLOW-UP: a short plain-text prompt Steven can paste into a fresh Claude Code session in the Repo
folder after the slots have passed. It names the exact tasks and slots you read (the limited tasks, any task you
fixed, vanessa-morning-brief-text at 6:40 AM PT, r3-eod-rollup at 10:45 PM PT and the knowledgeGraph document),
and asks for each: last status and end time against its slot; if it is not ok, read its log under rules c and
e and report the one deciding line. It must change nothing.
```

## After it runs

1. Copy the block between `=== MAC FIX-ALL REPORT ===` and `=== END ===` into the cloud session. The cloud
   session can then link the vault on the Notes panel, refresh `docs/NEEDS-STEVEN.md` from the report's last
   list, and flip Orca on the deck from "proposal" to confirmed **only** on a `VERIFIED + PAIRED` verdict.
2. Paste the FOLLOW-UP into a fresh Mac session after tonight's slots (the limited tasks, the roll-up) and
   tomorrow's 6:40 AM morning brief. That is the "runs cleanly at its next slot" check; it cannot happen during
   this run.

## Still yours, and not in this paste

- The **Lofty API key** (NEEDS-STEVEN 6). Nothing here fakes it: `lofty-crm-sync` and `r11-isa-kpi-compile` stay
  refused until it exists, and the roll-up says "Lofty not connected".
- The Zoho profile checkbox (5), the Composio credential rotation (20), the Discord bot token (46, 55), and
  wiring Google Drive or dropping it from the counts (15).
- The installs this file only checks: WhatsApp/OpenWA (78), CLI-Anything + DOMShell (38), Laya (68), Bonsai (75).
- The cloud routine edits and switch-offs, and the failing cloud backup (another engineer).

## Where each step comes from

| Step | Grounded in |
|---|---|
| 1 | `integrations/mac-claude-only.md`, verbatim apart from the numbering (1.1–1.7), plain hyphens for dashes, one lower-case typo fixed (`runnerStatus`) and "this section" for "this list" |
| 2.0 | `mac-verify.sh` (read-only; its launchd and `runnerctl status` sections); `docs/inventory/mac-task-descriptions.md` (`runnerctl` subcommands, LaunchAgent label); `routines/mac-task-repairs.md` §2 (`launchctl list \| grep -i claude-runner`); `REMOTE-ACCESS.md` (role file, `claude-auto`); `integrations/omniroute-failover/README.md` (`claude-auto --status` spends nothing and takes no lease) |
| 2.1–2.3 | `routines/mac-task-repairs.md` §4 (log plus allow-list, add one host); `wiki/dashboard-ops/index.md` (refused = allow-list); `docs/NEEDS-STEVEN.md` 3, 6, 9, 15, 18, 23, 42; the runner snapshot read from the deck's `runnerStatus` document, 2026-10-05 09:05 PT; the `openTerminalQueue` document (newest request 2026-09-12) |
| 2.4 | the live `eodRollup` document (read 2026-10-05 18:05 UTC: fields `speedToLeadStatus`, `speedToLeadMedian`, `newLeadsNote`); `integrations/mac-task-specs.md` §1 (`loftyLeads.firstResponse`, `status`) |
| 3 | `integrations/install-orca-whatsapp-laya.sh` (app path, version command, `open -a Orca`, brew command, iPhone link); `REMOTE-ACCESS.md` and `references/index.md` (what pairing must prove); `integrations/omniroute/orca.md`; the upstream project's own docs (see below) |
| 4 | `MAC-INSTALL-tooling.md` §2 (`graphify --version`, `/graphify <folder> --obsidian`, keep `graphify-out/` out of git); `knowledge-graph/README.md` (never-graph-a-secret rule); the deck's `knowledgeGraph` document |
| 5 | `integrations/ai-team/opus-5-5-on-mac.sh` and `docs/NEEDS-STEVEN.md` 79 |
| 6 | `integrations/openwa/README.md`; `docs/SETUP-RUNBOOK.md` D1–D3; `routines/mac-task-repairs.md` §9; `integrations/laya/README.md`; `integrations/omniroute/README.md` and the `--dry-run` flags in its two scripts |

**Not established by a repo doc, and how the prompt handles each:**

| Item | Handling |
|---|---|
| `mac-verify.sh` and Orca | Several repo docs (`REMOTE-ACCESS.md`, `OPTIMIZATION.md`, `references/index.md`, `integrations/CONNECTIONS.md`, NEEDS-STEVEN 69) say `./mac-verify.sh` confirms Orca (F-V2-23); the script has no Orca check (no match for "orca" in it). The prompt runs it for everything else and reads the Orca app bundle directly |
| Where the runner stores a task's allow-list and prompt | The repo says it is undocumented (`integrations/mac-sync/README.md`). The session establishes it from `runnerctl`'s own usage and the task definition, never guesses a path, and falls back to handing Steven the exact text and click path |
| Installing or repairing the runner's LaunchAgent | No command anywhere in the repo. Report plus proposal only |
| The `orca` command-line tool (`orca status`, its bundled path) | From the cloud-built Orca CLI help (source tree v1.4.214, 2026-10-05) and the upstream Homebrew cask, not a repo doc. The session runs `command -v orca` first and uses only what the Mac's own `orca --help` lists |
| Orca's update menu and pairing flow | From the project's own docs (source read 2026-10-05, commit `a68ee67`; Settings > General > Updates, "Mobile companion"). The live app wins and the session says where it differs |
| The `obsidian://` link | Obsidian's own URI scheme; the repo has no link to copy. Built from the real vault name, click-tested by Steven, and the report says tested yes or no |
| Generic shell tools (`ls`, `grep`, `tail`, `find`, `df`, `mkdir`, `git init`, the `python3` URL-encode one-liner) | Standard and read-only apart from the one throwaway folder in 3.5, which is shown to Steven first |
