# Steven's steps — everything still waiting on you, in order (2026-10-22)

Same list as the Action Desk page (https://claude.ai/artifact/9S8G2ZhhqP1iUsPZrPsmRn), which has a button per step.
Includes every connection that still has to be made. Already done: Lofty key (54 leads syncing), 14 failed routines re-run, both dashboards updated (cycle 11), Remote Control card built, one-command Mac script, failover with a $25 OpenRouter cap, connection plan; your USC answers and personal DRE are saved.
research on Claude only; Gmail, Google Calendar, Notion, Slack, Canva and Inkbox iMessage are connected; the five research-only routines are already off.

## 1 · Phone · 5 minutes (Do these first; nothing else depends on them)

## Every day (from 2026-10-23) — Vanessa's top 10 big moves, your yes or no

Open the 6D Brain (https://claude.ai/artifact/VoWHW4YuKUCyNqGZMikEv8) → "Vanessa recommends". Ten moves, scored by
impact × confidence ÷ effort, each with the plan standing by. **Approve** → Vanessa starts on it right away (the page fires her
Big-moves task through your Claude Code Remote connector; the first time, allow "Claude Code Remote" when the page asks). Her
items land in the Vanessa queue on the Command Deck; yours stay listed with the plan standing by until you say "done".
**Decline** → hidden 30 days and that kind weighs less. The 6:05 AM task re-learns from every decision (`docs/reports/BIG-MOVES.md`).

## Start here (2026-10-23, round 2 — simplified the same evening) — three pastes, then four clicks

Everything scripted is inside the pastes now (Jarvis, Laya, Orca, AnyDesk, TidyCal, Arive credentials, homes.com /
ShowingTime / Showami wrappers, Lofty, Zoho check, NotebookLM, the failing-task logs). Each paste asks before it changes
anything, never signs in for you, never pays, and prints a REPORT — paste that REPORT back to Claude; Claude does the rest.

**Paste 1 — Mac 1 (plugged in), Terminal:**
`cd ~/Repo && bash scripts/repo-sync.sh && bash connect-all.sh`
It will ask, hidden, for: your Lofty API key (7b), your TidyCal token (7c), your Arive Client ID / Secret / API key (7e).
Enter skips any of them; make them first if you want them in this pass (Lofty → Settings → Integrations → API; TidyCal →
Integrations → API → Manage API keys; Arive → Settings → Integrations → Generate, Pro plan).

**Paste 2 — Mac 2, Terminal:**
`cd ~/Repo && bash scripts/repo-sync.sh && bash scripts/second-mac.sh`

**Paste 3 — Alienware (Windows 11), PowerShell (not as administrator), one line:**
`irm https://claude.ai/install.ps1 | iex; winget install --id AnyDesk.AnyDesk -e -h --accept-package-agreements --accept-source-agreements; git clone https://github.com/chitown034/Repo.git $env:USERPROFILE\Repo; cd $env:USERPROFILE\Repo\integrations\alienware; Set-ExecutionPolicy RemoteSigned -Scope Process; .\alienware-setup.ps1; .\alienware-setup.ps1 -Action Install`
(Claude Code, AnyDesk, the Doctor, then Orca / Laya / Bonsai / Ollama — it asks y before each.) Then `claude` once to sign in.

**Then four clicks, in this order** (say "done A" … "done D"):
- **A. Link your iMessage line (fixes the missing morning text + voice note).** From your phone, text
  `connect @vanessa-shearrill` to **+1 650 484 9720**, once. Until then the brief comes by e-mail (steven.shearrill@gmail.com)
  and push, with the voice note attached to the e-mail.
- **B. Zoho** → Setup → Security Control → Profiles → your profile → Developer Permissions → tick "Zoho CRM API Access".
- **C. Claim your profiles for AI search** → Google Business Profile, Bing Places, Zillow (agent + lender), Realtor.com,
  Homes.com, Yelp; send Sofia the DRE number (`wiki/real-estate-playbooks/ai-search-visibility.md`).
- **D. AnyDesk permissions** on each Mac (Screen Recording + Accessibility, unattended password) and the tablet app
  (Play Store "AnyDesk Remote Desktop" → Unattended Access; iPad: App Store → AnyDesk, reach-only).
- **E. Health on the phone (2 minutes, once)** → MyFitnessPal → More → Apps & Devices → Apple Health → on; Strava → Settings →
  Apple Health → on; BodyPark ATOM app → its settings → Apple Health / HealthKit → allow (do ATOM sessions with the Apple Watch
  so each one lands in Apple Health as a workout); Health Auto Export → Automations → your Google Drive export → Metrics: select
  all, Workouts: on. From then
  on the deck's Health tiles, the Strava card and the nutrition tiles refresh by themselves every morning at 6:15 (nothing on
  the Mac, nothing to tap daily). `integrations/apple-health-dashboard.md`.

**Carried by Vanessa as big moves** (no longer a list you keep — each one surfaces on the 6D Brain with its plan standing by, in
value order, and you approve it when you want it; the Big-moves task reads this list):
- **e. Lofty API key** → Lofty → Settings → Integrations → API → create; paste 1 asks for it (step 7b).
- **f. TidyCal token** → TidyCal → Integrations → API → Manage API keys → Create token; paste 1 asks for it (step 7c).
- **g. Arive** → Settings → Integrations → Generate (Client ID, Secret, API Key; Pro plan); paste 1 asks for them (step 7e). `integrations/arive/README.md`.
- **h. MBS Highway** → e-mail your rep for the Home Report webhook / CSV path (say "draft the MBS Highway rep email"). `integrations/mbs-highway/README.md`.
- **i. Ticor Title** → ask your Ticor rep for Ticor Online Pro credentials; farm lists export as CSV. `integrations/ticor/README.md`.
- **j. Pivo** → pair the Pod in the Pivo app; the tour link is what the team uses. `integrations/pivo/README.md`.
- **k. Drips and texts** → Lofty 10DLC registration, then say "specs ready for review" (`wiki/real-estate-playbooks/drip-and-text-follow-up.md`).
- **l. Orca pairing and the runner copy to Mac 2** → steps 1e and C below.

## Start here (2026-10-23) — one paste, then a few clicks

**Why things were stale:** your Mac's task runner froze on Oct 13, and every `git pull` on the Mac failed because the
cloud and the Mac both rebuild the same brain files. Both are fixed in the paste below. Everything cloud-side runs.

1. **On the Mac (plugged in): open Terminal, paste this one line, answer y.** Then paste the REPORT back to Claude.
   `cd ~/Repo && git fetch origin claude/stoic-cori-pvn3f8 && git show FETCH_HEAD:scripts/repo-sync.sh > /tmp/repo-sync.sh && REPO_SYNC_DIR="$PWD" bash /tmp/repo-sync.sh && bash connect-all.sh`
   It syncs the repo (and every 30 min after), restarts the frozen runner, keeps the Mac awake on the charger, installs
   or checks Kapso, Gondola, Inkbox voice, **Laya** (installs it + registers its MCP server), **Jarvis** (installs Ollama +
   the llama3.1:8b model; if this Mac has no OpenJarvis index yet the report names the one command that builds it, `runnerctl run openjarvis`, because that run spends Claude allowance), **Orca** (installs, opens on the Repo
   folder, runs its doctor), AnyDesk, the Agent OS, the seven Claude mods (new: `/cycle`, `/inbox`,
   `/meetings`, `/today`, `/tc`, `/queue <task>`, `/sync`, `/connect` and a status line that says when the repo is behind).
   It never signs in, pairs, sends or pays.
1b. **Mac 1 is connected (2026-10-23 01:14 UTC):** runner signed in and running, Laya real engine answering, Jarvis
   all green (index 1,828 rows, vault 850 notes, 8 voice clips, brain doctor PASS), mods on. Nothing more to paste for
   these. The 30-minute sync keeps the Mac current; `bash connect-all.sh` any time re-checks everything.
1d-result. **Mac 2 first run (2026-10-23 01:39 UTC, Intel MacBook Pro "(6)"):** Gondola, Orca, AnyDesk, sync, keep-awake done.
   Root cause of 6 of the 12 stops: Python 3.9 (brain, Agent OS, Jarvis checks need 3.10+); Laya's installer stalled
   building `cryptography` from source (no wheel for that Mac); Claude Code 2.1.278 is older than the mods need. The
   script now installs Homebrew's python, updates Claude Code and installs Laya wheel-first (build tools as fallback).
   Second attempt (01:53 UTC): Claude Code updated to 2.1.309; Homebrew could not build python (Intel Mac on macOS 26,
   outdated Command Line Tools), so the script now installs a ready-built Python 3.12 with uv instead.
   Rerun: `cd ~/Repo && bash scripts/repo-sync.sh && bash scripts/second-mac.sh` (then paste the REPORT). Still Steven's
   on Mac 2: `claude` sign-in, Kapso sign-in, the vault (6b: iCloud or a copy — Jarvis's index needs it), the runner copy
   from Mac 1 (`command -v runnerctl; ls ~/Library/LaunchAgents | grep -i runner` **on Mac 1**), and the Inkbox voice
   key only if Mac 2 should also send her voice notes (Mac 1 already does).
1e. **Runner onto Mac 2 (2026-10-23 02:10 UTC):** Mac 1's runner = `~/Applications/claude-runner` (supervisor.py,
   schedule.json, tasks), `~/.local/bin/runnerctl`, LaunchAgent `com.stevenshearrill.claude-runner` (sign-in lives in the
   Claude CLI, no token file). **On Mac 1:** `cd ~/Repo && bash scripts/repo-sync.sh && bash scripts/runner-export.sh`
   → AirDrop `~/Desktop/claude-runner-mac2.zip` to Mac 2 (Finder → right-click → Share → AirDrop). **On Mac 2:**
   `cd ~/Repo && bash scripts/repo-sync.sh && bash scripts/runner-import.sh && runnerctl login && runnerctl status`.
   The export also writes Mac 1's missing lease role (`peer`), so both Macs share the schedule without double runs.
1d. **Second Mac (2026-10-23): one paste, then two small things.** On the other Mac open Terminal and paste
   (if a window asks to install developer tools, click Install, wait, then paste the same line again):
   `[ -d ~/Repo ] || git clone https://github.com/chitown034/Repo.git ~/Repo; cd ~/Repo && git fetch origin claude/stoic-cori-pvn3f8 && git checkout claude/stoic-cori-pvn3f8 && git pull && bash scripts/second-mac.sh`
   It installs Homebrew, Claude Code and uv if missing, writes the lease word `peer`, then runs the same connect-all as
   Mac 1 (Laya, Jarvis engine, Orca, AnyDesk, Agent OS, mods, Gondola, Inkbox voice). Then: (a) run `claude` once and
   sign in; (b) on **Mac 1** paste `command -v runnerctl; ls ~/Library/LaunchAgents | grep -i runner` and send Claude
   the two lines — the task runner was built on Mac 1 only and its copy step for Mac 2 comes from that. Jarvis's index
   on Mac 2 needs the vault there too (`docs/SECOND-MAC-SETUP.md` 6b: iCloud or a copy).
1f. **NotebookLM, once (5 minutes):** the brain is already in your Drive as 13 Google Docs under **SECOND BRAIN/**
   (https://drive.google.com/drive/folders/16sh0SNlicvHOEpAtTUufI504agSlQRaX) and a weekly task keeps them current.
   notebook.google.com → New notebook **AI Automation and VANESSA** → Add sources → Google Drive → every `SB …` Doc in
   `01 Reference Sources/AI and Automation` + `SB 00-START-HERE` + `SB 02-who-and-decisions`. Then **Mortgage Reference
   Library** (`SB 05`, `SB 09`, `SB 00`, `SB 02`) and **Business Operating Playbooks** (`SB 06`, `SB 08`, `SB 09`, `SB 00`,
   `SB 02`). Google refreshes Drive Docs in NotebookLM automatically. `integrations/notebooklm/README.md`.
1f2-done. **NotebookLM connector signed in on Mac 1 (2026-10-23 06:30 UTC, 5 notebooks found).** Next, in Terminal on
   Mac 1: `cd ~/Repo && claude`, then type: *add every SB Google Doc from my Drive folder SECOND BRAIN to my "2nd brain"
   notebook, then list that notebook's sources*. Claude uses the notebooklm MCP; nothing else to do afterwards.
1f2. **NotebookLM direct connector (your opt-in, 2026-10-23):** the paste now installs it (step 6f). Then on Mac 1 run
   `nlm login` (browser sign-in, Google session stays on that Mac), then `nlm login --check`. In a new Claude Code session:
   "list my NotebookLM notebooks" → then "add every SB Google Doc from SECOND BRAIN to my 2nd brain notebook". Claude
   does the picker for you from then on. Non-sensitive notebooks only.
1h. **Your claude.ai chats into the brain (5 minutes, then monthly):** claude.ai has no API for other chat windows, so the
   path is your own export. claude.ai → Settings → Privacy → **Export data** → Google emails a zip → unzip → put
   `conversations.json` in `~/Repo/inbox/` (any folder works) → in Terminal: `cd ~/Repo && bin/brain ingest claude-export
   ~/Repo/inbox/conversations.json`. It writes `memory/claude-chats.md`: one line per chat (date, title, what you asked first) and
   a "tasks you mentioned" list, your words only, phones/e-mails masked. Claude Code sessions need nothing from you: a
   daily ledger (3:52 AM) lists them in `docs/inventory/claude-sessions.md`, and the Mac's `brain-learner` task captures your
   words from their transcripts.
1g. **Your GitHub repo is public.** `chitown034/Repo` answered without sign-in on 2026-10-23 (that is how the Drive
   sync fetches the pack). It holds no client files beyond `wiki/clients/index.md` (first names, by rule), but the
   brain, decisions and task prompts are readable by anyone. If you want it private: GitHub → Repo → Settings → Danger
   Zone → Change visibility → Private, then tell Claude (the Drive sync switches to a signed-in fetch). Your call.
1c. **Kapso on the Mac:** `claude` → `/mcp` → kapso → sign in (free sandbox); then
   `bash integrations/kapso/install-mac.sh keys --allow <your mobile>` (hidden prompt, Keychain only).
2. **Vanessa's iMessage line (30 seconds, from your phone):** Inkbox is reconnected. Send the text
   `connect @vanessa-shearrill` to **+1 650 484 9720** (tap: sms:+16504849720?&body=connect%20%40vanessa-shearrill).
   After that, the "Text me this brief" button on the Command Deck works, and Vanessa can text you.
2a. **Morning iMessage + voice from Vanessa (Mac side):** claude.ai → Settings → Connectors → **Inkbox → Reconnect**; then in the
   runner task `vanessa-morning-brief-text` paste §8b at the start and §8 at the end (`integrations/mac-task-specs.md`).
   From then on, ~6:40 AM: one text covering all three dashboards and a voice note in her voice.
2b. **Zoho CRM (one checkbox, then tell Claude "Zoho done"):** Zoho CRM → ⚙ Setup → Security Control → Profiles →
   your profile (Administrator or yours) → Developer Permissions → tick **Zoho CRM API Access** → Save. Tested live
   2026-10-22 14:46 UTC: Composio's Zoho connection is active, Zoho answers 403 NO_PERMISSION until that box is ticked.
   If it still says 403 after the tick, Claude sends a fresh Composio reconnect link.
2c. **Lofty CRM:** nothing extra — the paste (step 7b) checks your Lofty key, asks for it once if it is missing
   (hidden, saved only on the Mac), and proves it works read-only; the Lofty sync resumes with the runner.
3. **Gondola (travel):** claude.ai → Settings → Connectors → Add custom connector → `Gondola`, URL
   `https://mcp.gondola.ai/mcp` → Connect and sign in.
3b. **Jarvis needs two things only you know:** the vault folder (`~/Shearrill-Vault`; if it lives only on the other Mac,
   see `docs/SECOND-MAC-SETUP.md` 6b for iCloud or a copy) and Vanessa's 8 voice clips (put them in `~/.cache/vanessa-voice`
   or tell Claude the folder). The REPORT's "Jarvis" rows say which of the two is missing.
4. **Orca and AnyDesk (the paste opens them):** Orca → Add Project → your Repo folder, then scan its pairing code with the
   Orca phone app. AnyDesk → System Settings → Privacy & Security → turn on Screen Recording and Accessibility for AnyDesk.
   Other computers: `integrations/anydesk/README.md`.
5. **WhatsApp triggers (2 minutes, in Pabbly):** connect.pabbly.com → your Kapso WhatsApp app → trigger "New Inbound
   WhatsApp Message" → copy the webhook URL → Kapso (app.kapso.ai) → WhatsApp → your number → Webhooks → Add webhook →
   paste it, kind Kapso events, tick whatsapp.message.received, any signing secret, Save → message your Kapso number
   from your phone → back in Pabbly click Capture Webhook Response. Same for "New Conversation" (tick
   whatsapp.conversation.created).
5b. **WhatsApp send step in Pabbly:** tell Claude "build the Pabbly send step" when you can type your own mobile number
   into Pabbly's test box (it sends one real test message to you only).
6. **Optional, 3 minutes — saves Claude allowance:** turn OFF these routines you made through the API (Claude cannot):
   - https://claude.ai/code/routines/trig_016qKE1TdRjzkpb2Yby8yWBX · https://claude.ai/code/routines/trig_013vYCzVa3vbHZ8BZZy6UBpX
   - https://claude.ai/code/routines/trig_013ocJfEDdmSAgDPVaiCzMZY · https://claude.ai/code/routines/trig_019NdM12eTVDHWy89Ch2sNtU
   (the Saturday Loop Engineering + Self-Test already covers them; full list in `docs/ROUTINE-BUDGET-2026-10-22.md`).
6b. **Two short lists only you know (tell Claude or your ISA):** "refi list: <first name>, <note rate>, <loan type>,
   <month closed>" for each past loan (feeds Monday's Refi Watch), and "sphere list: <first name>, <relation>,
   <birthday>, <home anniversary>" (feeds the monthly touches). Nothing is quoted or sent from either.
7. **Share the ISA Portal with your ISA/EA** (Share menu) — it now has today's list and a "Hand to Vanessa" box.

Claude already did (2026-10-22): one Vanessa queue every dashboard writes; push-buttons on the Command Deck (run the
cycle, triage inbox, recap meetings, draft follow-ups, TC intake); seven standing cross-functional pods; morning brief
across the three dashboards at 6:34 AM; cloud routine usage cut ~34%; backup moved after the weekly reset and re-run.

## Start here (2026-10-20) — one paste reconnects this Mac · about 15 minutes

- **Open Terminal and paste this one line, answer y.** Your Mac has been silent on the dashboard since 2026-10-13. The paste restarts the runner, installs Kapso (WhatsApp) and the Inkbox voice SDK, checks Jarvis and your key files, then asks for your mobile number and the Kapso key (Keychain only, hidden; Enter skips). It never signs in, pairs, sends or pays. Paste the REPORT it prints back to Claude.
   `cd ~/Repo && git fetch origin && git checkout claude/stoic-cori-pvn3f8 && git pull && bash connect-all.sh`
- **The six things only you can do** (the paste prints them again): (1) Kapso sign-in: run `claude`, type `/mcp`, choose kapso, sign in; then message (202) 474-5223 from your phone. (2) Vanessa's voice on iMessage: `bash integrations/voice-setup.sh <your Vanessa thread id>`, then paste section 8 of integrations/mac-task-specs.md into the runner task vanessa-morning-brief-text. (3) claude.ai → Settings → Connectors → Inkbox: Reconnect (also EVRoutes, Turo). (4) Zoho CRM → Setup → Security Control → Profiles → your profile → Developer Permissions → tick "Zoho CRM API Access". (5) `bash integrations/cli-anything-harnesses/connect.sh` and sign in once to ShowingTime, Showami, homes.com. (6) Say "Composio links" to Claude for TikTok, GoHighLevel, Discord, HeyGen.
   - Open Connectors: https://claude.ai/settings/connectors
   - Open Zoho CRM: https://crm.zoho.com/
- **After the paste, in any Claude Code session in the Repo folder:** type `/paste` for this list, `/connections` for what is not connected and the fix, `/owner marketing` for who keeps a dashboard panel alive. (7) Pabbly: reply "yes, build the Kapso app", then build the six workflows in `integrations/pabbly/WORKFLOWS.md`.

## Start here (2026-10-14) — WhatsApp with Vanessa, two pastes on the Mac

Kapso gave Vanessa **(202) 474-5223**. In Terminal, in the Repo folder (`git pull` first):
1. `bash integrations/kapso/install-mac.sh install --apply` — installs the Kapso plugin and MCP for every Claude Code session.
2. `bash integrations/kapso/install-mac.sh keys --allow 1<your 10-digit mobile>` — stores your number as the only one Vanessa answers, then asks for the Kapso project API key (hidden prompt; from app.kapso.ai → your project → API keys).
3. Then `claude` → type `/mcp` → pick **kapso** → sign in once in the browser. Check with `bash integrations/kapso/install-mac.sh doctor`.
4. Save (202) 474-5223 in your phone as *Vanessa (WhatsApp)* and send her a message. Answer it from any Claude Code or Orca session with "answer my WhatsApp"; the unattended 5-minute reply task is `integrations/mac-task-specs.md` §5c (register it on the runner when you want her replying on her own).

## Start here (2026-10-13) — two things, 5 minutes

- **Mac, Terminal, in the Repo folder — stop the three Mac feed tasks that keep erasing the deck's fresh news:**
  `runnerctl pause openrouter-feeds-refresh && runnerctl pause feeds-weekly && runnerctl pause feeds-market-close && runnerctl list`
  (the cloud routines already write those feeds; the Mac copies were supposed to be paused on Oct 5 and were not).
- **Phone:** from tomorrow 6:48 AM a Vanessa push notification carries the morning brief (weather, needs-you,
  calendar, headlines, on this day, birthdays, Bears, market, rates). The Mac's 6:40 AM iMessage says "ok" but you
  did not receive it: open Messages → the +1 650-484-9720 / @jasmine thread; if nothing arrived today, in Terminal run
  `runnerctl run vanessa-morning-brief-text` and paste what it prints to Claude. To let cloud routines text you too,
  connect Inkbox once at https://claude.ai/customize/connectors.
- **One click, weather every day:** open https://claude.ai/code/routines/trig_01Y1zZ3bmawgi4Mw2jNw9ZFM and add the AccuWeather connector to that routine (Claude cannot attach connectors to a routine on this plan). Until then weather is refreshed only when you ask Claude in a chat.
- **One click:** the USC study planner failed Sunday on the usage cap — press Run now at
  https://claude.ai/code/routines/trig_01VkpVzzqPkGtXPS24E4JNKP.

## Start here (2026-10-12) — three pastes, then a short "only you" list

- **A. Mac 1, then Mac 2:** Terminal → `cd ~/Repo && git fetch origin && git checkout claude/stoic-cori-pvn3f8 && git pull && bash go.sh` → answer `y`. Does every safe step (brain, Agent OS, Laya, Orca check, browser hands, skill packs, Jarvis, events scan, health report) and prints a report to paste back to Claude.
- **B. Alienware:** PowerShell → `cd $HOME\Repo; git fetch origin; git checkout claude/stoic-cori-pvn3f8; git pull; powershell -ExecutionPolicy Bypass -File go.ps1` → answer `y`.
- **C. Only you:** pair Orca (link into the hidden prompt only), Zoho API tick, keys into `~/.config/*/.env`, sign in once to ShowingTime / Showami / homes.com / Strava, AnyDesk IDs into the Computer Hub card, phone health update + Orca app, one reply (LPT DRE, two posts, video replica, "defaults"), three short emails (Ticor, ARIVE, Zoho admin).

The 34 numbered steps below remain as the detailed reference.

1. **Switch off the duplicate weekly loops (they burned the usage allowance).** Claude already cut your routines from about 199 to 139 runs a week and moved three daily ones to the cheaper model (Oct 9). These three you created yourself, so only you can switch them off: each reads the whole dashboard every Sunday and repeats Saturday's loop. Open each link and turn the switch off. The last one is optional.
   - Weekly Loop Engineering QA: https://claude.ai/code/routines/trig_013ocJfEDdmSAgDPVaiCzMZY
   - Weekly improvement loop: https://claude.ai/code/routines/trig_013vYCzVa3vbHZ8BZZy6UBpX
   - Weekly self-improvement loop: https://claude.ai/code/routines/trig_016qKE1TdRjzkpb2Yby8yWBX
   - Weekly opportunity audit (optional): https://claude.ai/code/routines/trig_019NdM12eTVDHWy89Ch2sNtU
2. **Restart your health numbers (Apple Health).** The tiles are about 25 days old. Open the Claude app on your iPhone, say "update my health stats in Notion", and allow the Apple Health read and the Notion write once.

## 2 · One reply to Claude · 2 minutes (Copy, fill the blanks, send in this chat)

3. **Answer the open questions in one message.** Your personal DRE #01988316 is saved. Still needed: LPT Realty's own California DRE brokerage number and exact entity name (the two queued posts and the CRMLS application wait on them), and what kind of Zoho key you have (a Client ID + Client Secret from the Zoho API Console, or something else; never paste the key itself). Put 'no' for Plaid unless you want it. (Google Drive is done: Claude connected it read-only on 2026-10-09.)
   `LPT DRE: ______ (entity name: ______) · Zoho: client id+secret / other: ______ · Plaid: no`
   - California DRE: https://www.dre.ca.gov/
4. **Approve or decline the two queued posts.** After the reply above: Command Deck → Marketing panel → open each draft and its compliance review → set its stage to Approved or Declined.
   - Open Command Deck: https://claude.ai/code/artifact/1624daae-d683-405a-971d-c5828dce0f8d

## 3 · Mac, one sitting · about 45 minutes (Terminal first; then one command does the rest and asks before every change)

5. **Open Terminal and find your Repo folder.** No web link can open Terminal on your Mac. Press Command + Space, type Terminal, press Return. Copy and run the line below; it prints the path of the folder that holds MAC-SETUP.sh (that is your Repo folder). If it prints nothing, run: git clone https://github.com/chitown034/Repo.git. Then type cd and a space, drag that folder from Finder into the window, press Return.
   `find ~ -maxdepth 5 -name MAC-SETUP.sh -not -path '*/node_modules/*' 2>/dev/null`
6. **Switch to the branch that holds today's files.** The new scripts are on the branch claude/stoic-cori-pvn3f8, not the repo's default branch, so a plain git pull misses them. If it complains about changes you made, stop and tell Claude; do not discard them. The last line should print the file name.
   `git fetch origin && git checkout claude/stoic-cori-pvn3f8 && git pull && ls mac-bootstrap.sh`
7. **Preview, then run the one command.** mac-bootstrap.sh replaces the old seven pastes: harness update, pausing the three duplicate Mac feed tasks, Opus 5.5, browser-use / OpenDesign / API Anything, WhatsApp (iPhone next to you for the QR code), the Second Brain, and the connection check. It asks yes/no before every change and Enter means no. Run the first line to see everything it would do, then the second. When it finishes, paste the MAC COMBINED REPORT block into this chat.
   `./mac-bootstrap.sh --dry-run
./mac-bootstrap.sh --also zoho,lofty,connections --with-claude`
8. **Fix the OmniRoute failover so it kicks in when Claude runs out.** OmniRoute itself is running, but the switch-over scripts were never installed, so nothing changes when you hit the limit. First the read-only check, which prints PASS / WARN / FAIL with the fix for each gap; then the installer, which asks yes/no before every change. Paste the doctor output back (it prints no secrets). The installer now also asks to turn on keep-going: start your sessions with claude-auto --keep-going, and when Claude runs out just type /exit and press Enter. The same conversation continues on OmniRoute's free models, then goes back to Claude once it resets. Client data never goes to the free route.
   `claude-auto --doctor
bash integrations/omniroute-failover/install-failover.sh --dry-run
bash integrations/omniroute-failover/install-failover.sh
claude-auto --doctor`
9. **Turn on remote control for Claude on each Mac (this computer first).** Run the first line once by hand: answer y to Enable Remote Control, accept the folder trust, then press Ctrl+C. Then the second line installs a LaunchAgent that keeps it running (asks first). The third line prints one report line: paste it into the Remote Control card on the Command Deck (Toolkit tab). Repeat on the other Mac. In Claude Desktop type /remote-control in the Code tab, or turn on Settings > Claude Code > Connect new sessions to Remote Control, and that session joins the same list at claude.ai/code and on your phone.
   `claude remote-control
bash integrations/remote-control/rc-agent.sh install
bash integrations/remote-control/rc-agent.sh report`
   - Open Command Deck: https://claude.ai/code/artifact/1624daae-d683-405a-971d-c5828dce0f8d
   - Open the sessions list: https://claude.ai/code
10. **Pair Orca between the two Macs (and the phone).** On Mac 1 run serve and keep that window open (it prints a pairing link). On Mac 2 run pair and paste the link at the hidden prompt, then do the reverse so each Mac can reach the other. A pairing link is a secret equal to control of that Mac's agents: pair only on your home network or your own private network, never paste a link into chat, the dashboard or the repo. Desktop control is never granted. Then run report and paste its line into the same card.
   `bash integrations/remote-control/orca-remote.sh serve
bash integrations/remote-control/orca-remote.sh pair
bash integrations/remote-control/orca-remote.sh report`
11. **Turn on Claude Mods (one command).** Five mods are built, checked and ready: a status line showing which AI route you are on, a Proceed/Cancel guard before any send, share or payment, /remember to save a rule into the brain, Blast Radius, and /replay to review Claude's edits. Run this in Terminal from your Repo folder, type y once, then open a new Claude Code session. To turn them all off later: add --off.
   `git pull && bash integrations/mods/install-mods.sh`
   - What each mod does: https://github.com/chitown034/Repo/blob/claude/stoic-cori-pvn3f8/integrations/mods/RECOMMENDATIONS.md
11b. **Give Claude browser hands and a skill finder (5 minutes, new 2026-10-10).** Installs agent-browser and Playwright for Claude Code, copies the new skills, and ends with a self-test that types an address into a test page and clicks Search. It asks y/N before each step. Then copy the 3-line block it prints into Claude Desktop → Settings → Developer → Edit Config. Paste the last lines back here.
   `bash integrations/browser-agents/install.sh --dry-run
bash integrations/browser-agents/install.sh`
12. **Type your keys into the files (never into chat).** The command above creates empty ~/.config/zoho/.env and ~/.config/lofty/.env with only the variable NAMES. Open each with the line below, type the value after each equals sign, save. Zoho needs five: ZOHO_ACCOUNTS_URL, ZOHO_API_URL, ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN (the two URLs depend on your Zoho data centre: .com, .eu, .in...). If TextEdit shows a formatting bar choose Format → Make Plain Text before saving. Lofty's key is already working.
   `open -e ~/.config/zoho/.env`
13. **Pause the Discord poller until a bot token exists.** vanessa-discord-inbox runs every 5 minutes with no token, about 288 runs a day. Pause (do not delete) it: run the line below on the Mac.
   `runnerctl pause vanessa-discord-inbox && runnerctl list`
14. **Sign in by hand to ShowingTime, Showami and homes.com.** The connection check in the bootstrap tells you which of them needs a sign-in. Sign in once in the agent Chrome it opens. Agents never type your passwords. SkySlope and zipForms stay locked until compliance signs off.

## 4 · Accounts and settings · about 30 minutes (Sign-ins and permission ticks only you can do; say "done N" after each)

15. **Zoho: tick the API permission.** This is why Zoho returns 403, not a missing key. Zoho CRM → Setup → Security Control → Profiles → your profile → Developer Permissions → tick "Zoho CRM API Access". If your key is a Client ID + Secret, also create a Self Client in the Zoho API Console with scopes ZohoCRM.modules.ALL,ZohoCRM.settings.READ and generate the refresh token. Then say "Zoho done".
   - Open Zoho CRM: https://crm.zoho.com/
   - Zoho API Console: https://api-console.zoho.com/
16. **Composio sign-ins: GoHighLevel, Discord bot.** Google Drive no longer needs this: Claude reached your Drive Second Brain folder through the claude.ai connector. These two still read "initiated, no account". The links expire 10 minutes after they are made, so say "Composio links" when you sit down, then sign in to each. For GoHighLevel, also say what it is for.
17. **claude.ai connectors and Claude Desktop.** Strava and Eromify need you to sign in again (Strava is why the training tiles stopped). EVRoutes fails to connect (error 402) and PlayMCP never finished: reconnect them or remove them. In Claude Desktop → skills settings, upload integrations/claude-desktop/kevin-mentor.zip and delete the old cole-mentor skill.
   - Open Connectors: https://claude.ai/settings/connectors
18. **Cloud network access for the rate websites.** In a Claude Code cloud session: title bar → environment → Edit → Network access. Add these:
   `fred.stlouisfed.org www.freddiemac.com www.redfin.com`

## 5 · Applications and emails · 15 minutes (Drafts are in integrations/CONNECT-PLAN-2026-10-09.md section 6; nothing has been sent)

19. **Send three short messages.** (1) Ticor: ask your Ticor Title Sales Executive or Customer Service whether an API or bulk export of Ticor Property Data exists and on what terms. (2) CRMLS: your broker (LPT) applies for the RESO Web API data licence at licensing@crmls.org; there will be no scraper. (3) Dotloop: apply for developer / partner access at info.dotloop.com/developers. Each is your signature, so Claude only drafted them.
   - Open the drafts: https://github.com/chitown034/Repo/blob/claude/stoic-cori-pvn3f8/integrations/CONNECT-PLAN-2026-10-09.md
   - Ticor Property Data: https://ticorpropertydata.com/
20. **Optional: switch on the free-then-paid failover.** Claude subscription first; when it runs out, OmniRoute free models take over at once; OpenRouter is the paid third tier, capped at $25 a month, and stays off until you do this. Create an OpenRouter key yourself, set the key's own credit limit to $25, load no more than $25, then follow the Three-tier failover steps. It returns to Claude by itself when the allowance resets.
   - Open the steps: https://github.com/chitown034/Repo/blob/claude/stoic-cori-pvn3f8/integrations/omniroute-failover/README.md
   - OpenRouter: https://openrouter.ai/

## 6 · Decisions · one reply (Each defaults to no; nothing is spent without your yes)

21. **Decide the AI Steve video replica (plan is ready).** context.dev is connected. The weekly real-estate and loan-officer video plan is in integrations/ai-replica-studio/PLAN.md. To start Claude needs five answers: (1) which avatar provider, or none yet (HeyGen works through Composio but is paid and not connected; the CAM page was not applied to and its price is not published); (2) built-in voice or a cloned voice on your own ElevenLabs account; (3) platforms and cadence (assumed one of each a week to Facebook, Instagram, LinkedIn, YouTube); (4) LPT Realty's brokerage DRE number and name plus your personal NMLS ID for the disclosure line; (5) whether the three social timers run as a routine or through Buffer. You record your own consent and samples; nothing posts without your approval each week.
   `replica: provider ______ · voice ______ · cadence 1+1/week · LPT DRE ______ · NMLS ID ______ · timers routine/Buffer`
   - Read the plan: https://github.com/chitown034/Repo/blob/claude/stoic-cori-pvn3f8/integrations/ai-replica-studio/PLAN.md
22. **Reply 'defaults' or change any line.** Google Drive: done, connected read-only (one file; Claude holds its catalogue, not its contents, until you say the notes can be indexed). Plaid: no (keys may cost). Terms-of-service reviews for Redfin market pages, lender rate pages and builder pages: Alexandra drafts, you decide each. SkySlope and zipForms: stay locked until compliance signs off. APInation: tell Claude what you want it to do before any paid use. Orca phone app: your call.
   `defaults: Drive notes indexed yes/no ___ · Plaid no · ToS reviews later · SkySlope/zipForms locked · APInation: ______`

## 7 · Verify the brain, Jarvis, Laya and Vanessa's voice · 3 minutes (Last, once the Mac steps above are done; nothing is changed except two local files)

23. **Check Jarvis, Laya and Vanessa's voice on your Mac.** One command checks Jarvis's memory, the real Laya model, the vault, Vanessa's recorded voice clips and the brain, and says the one thing to fix for each. It changes only a voice-profile copy in ~/.config/jarvis. Then the brain's own self-check runs. Paste the last lines back and Claude updates the dashboards.
   `cd ~/Projects/Repo 2>/dev/null || cd "$(dirname "$(find ~ -maxdepth 5 -name mac-bootstrap.sh 2>/dev/null | head -1)")"; git pull && bash integrations/jarvis/jarvis-setup.sh --apply; bin/brain loop | head -20`
   - What it checks: https://github.com/chitown034/Repo/blob/claude/stoic-cori-pvn3f8/integrations/jarvis/README.md

Reply "done N" (or "skip N") after each step and Claude keeps the dashboards in step.

## 8 · New this round (2026-10-11) · about 45 minutes (same as steps 24-32 on the Action Desk; each asks before it changes anything)

24. **Browser hands and skill finder (Mac).** `bash integrations/browser-agents/install.sh --dry-run` then without `--dry-run`.
25. **Skill packs (Mac).** `bash integrations/skill-packs/install-mac.sh --dry-run` then without. Registry of what was read and what is held: `integrations/skill-packs/REGISTRY-2026-10-11.md`.
26. **Alienware PC (Windows PowerShell).** `Set-ExecutionPolicy RemoteSigned -Scope Process`, then `.\integrations\alienware\alienware-setup.ps1 -Action Doctor`, then `-Action Install -DryRun`, then `-Action Install`. Never run on Windows yet: send any error word for word.
27. **AnyDesk on every computer and tablet.** Type each AnyDesk ID (not the password) into the Computer Hub card on the Command Deck. Set unattended-access passwords yourself inside AnyDesk.
28. **New Command Deck panels: published (2026-10-11).** Command Deck, Action Desk and 2nd Brain 4D are live. ISA Portal left alone (repo copy older than live); say "update the ISA portal" to add the animations.
29. **Ultimate Web Scraper connector (optional).** claude.ai > Settings > Connectors > Add custom connector > `https://ultimatewebscraper.com/claudemcp`. Unverified (unreachable from the sandbox): read its pricing and privacy first; never client data.
30. **ARIVE API email** and the Zoho / SkySlope / Dotloop / Ticor steps: `integrations/loan-stack/CONNECTIONS.md`.
31. **Held tools (default no):** Apify, vidIQ connection, OpenRouter for Jev, Remotion licence; Skool MCP not recommended.
32. **First real events scan and real data for the trading desk (optional).**
33. **Turn on the Agent OS on each computer.** Mac 1, Mac 2 and the Alienware, one paste each; steps in integrations/agent-os/README.md. Read-only by default; the warnings name what to install.
34. **Connect Orca and Laya on each Mac.** `bash integrations/agent-os/connect-orca-laya.sh --apply` (preview first without --apply). Then pair Orca yourself with the two commands it prints.
35. **OpenStock market viewer (optional).** `bash integrations/openstock/openstock.sh install --apply`, then a free Finnhub key into `~/Applications/OpenStock/.env`. Trading Desk panel has Open/Start.

### 1i. Fieldy meeting digests — your call (added 2026-10-23)

The daily "Fieldy → brain" task writes a digest of each recorded meeting (first names, Fieldy's summary, action items) to `memory/fieldy-meetings.md` in the repo. The repo is public today (step 1g). The digest never reaches the 6D page or Drive, but it is in the repo. Say "keep the Fieldy digest" or "make the repo private first" — until then the task runs and the file stays first-names-only.
