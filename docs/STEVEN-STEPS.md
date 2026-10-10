# Steven's steps — everything still waiting on you, in order (2026-10-09)

Same list as the Action Desk page (https://claude.ai/artifact/9S8G2ZhhqP1iUsPZrPsmRn), which has a button per step.
Includes every connection that still has to be made. Already done: Lofty key (54 leads syncing), 14 failed routines re-run, both dashboards updated (cycle 11), Remote Control card built, one-command Mac script, failover with a $25 OpenRouter cap, connection plan; your USC answers and personal DRE are saved.
research on Claude only; Gmail, Google Calendar, Notion, Slack, Canva and Inkbox iMessage are connected; the five research-only routines are already off.

## 1 · Phone · 5 minutes (Do these first; nothing else depends on them)

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
6. **Switch to the branch that holds today's files.** The new scripts are on the branch claude/gracious-newton-4hpfco, not the repo's default branch, so a plain git pull misses them. If it complains about changes you made, stop and tell Claude; do not discard them. The last line should print the file name.
   `git fetch origin && git checkout claude/gracious-newton-4hpfco && git pull && ls mac-bootstrap.sh`
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
   - What each mod does: https://github.com/chitown034/Repo/blob/claude/gracious-newton-4hpfco/integrations/mods/RECOMMENDATIONS.md
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
   - Open the drafts: https://github.com/chitown034/Repo/blob/claude/gracious-newton-4hpfco/integrations/CONNECT-PLAN-2026-10-09.md
   - Ticor Property Data: https://ticorpropertydata.com/
20. **Optional: switch on the free-then-paid failover.** Claude subscription first; when it runs out, OmniRoute free models take over at once; OpenRouter is the paid third tier, capped at $25 a month, and stays off until you do this. Create an OpenRouter key yourself, set the key's own credit limit to $25, load no more than $25, then follow the Three-tier failover steps. It returns to Claude by itself when the allowance resets.
   - Open the steps: https://github.com/chitown034/Repo/blob/claude/gracious-newton-4hpfco/integrations/omniroute-failover/README.md
   - OpenRouter: https://openrouter.ai/

## 6 · Decisions · one reply (Each defaults to no; nothing is spent without your yes)

21. **Decide the AI Steve video replica (plan is ready).** context.dev is connected. The weekly real-estate and loan-officer video plan is in integrations/ai-replica-studio/PLAN.md. To start Claude needs five answers: (1) which avatar provider, or none yet (HeyGen works through Composio but is paid and not connected; the CAM page was not applied to and its price is not published); (2) built-in voice or a cloned voice on your own ElevenLabs account; (3) platforms and cadence (assumed one of each a week to Facebook, Instagram, LinkedIn, YouTube); (4) LPT Realty's brokerage DRE number and name plus your personal NMLS ID for the disclosure line; (5) whether the three social timers run as a routine or through Buffer. You record your own consent and samples; nothing posts without your approval each week.
   `replica: provider ______ · voice ______ · cadence 1+1/week · LPT DRE ______ · NMLS ID ______ · timers routine/Buffer`
   - Read the plan: https://github.com/chitown034/Repo/blob/claude/gracious-newton-4hpfco/integrations/ai-replica-studio/PLAN.md
22. **Reply 'defaults' or change any line.** Google Drive: done, connected read-only (one file; Claude holds its catalogue, not its contents, until you say the notes can be indexed). Plaid: no (keys may cost). Terms-of-service reviews for Redfin market pages, lender rate pages and builder pages: Alexandra drafts, you decide each. SkySlope and zipForms: stay locked until compliance signs off. APInation: tell Claude what you want it to do before any paid use. Orca phone app: your call.
   `defaults: Drive notes indexed yes/no ___ · Plaid no · ToS reviews later · SkySlope/zipForms locked · APInation: ______`

## 7 · Verify the brain, Jarvis, Laya and Vanessa's voice · 3 minutes (Last, once the Mac steps above are done; nothing is changed except two local files)

23. **Check Jarvis, Laya and Vanessa's voice on your Mac.** One command checks Jarvis's memory, the real Laya model, the vault, Vanessa's recorded voice clips and the brain, and says the one thing to fix for each. It changes only a voice-profile copy in ~/.config/jarvis. Then the brain's own self-check runs. Paste the last lines back and Claude updates the dashboards.
   `cd ~/Projects/Repo 2>/dev/null || cd "$(dirname "$(find ~ -maxdepth 5 -name mac-bootstrap.sh 2>/dev/null | head -1)")"; git pull && bash integrations/jarvis/jarvis-setup.sh --apply; bin/brain loop | head -20`
   - What it checks: https://github.com/chitown034/Repo/blob/claude/gracious-newton-4hpfco/integrations/jarvis/README.md

Reply "done N" (or "skip N") after each step and Claude keeps the dashboards in step.
