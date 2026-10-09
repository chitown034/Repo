# Steven's steps — everything still waiting on you, in order (2026-10-09)

Same list as the Action Desk page (https://claude.ai/artifact/9S8G2ZhhqP1iUsPZrPsmRn), which has a button per step.
Includes every connection that still has to be made. Already done: Lofty key (54 leads syncing), 14 failed routines re-run, both dashboards updated (cycle 11), one-command Mac script, failover with a $25 OpenRouter cap, connection plan; your USC answers and personal DRE are saved.
research on Claude only; Gmail, Google Calendar, Notion, Slack, Canva and Inkbox iMessage are connected; the five research-only routines are already off.

## 1 · Phone · 5 minutes (Do these first; nothing else depends on them)

1. **Switch off the duplicate weekly loops (they burned the usage allowance).** Every routine that failed on Oct 8 hit the usage limit, and these overlap each other every Sunday. Keep "Weekly Loop Engineering + Self-Test" (Saturday). Open each link and turn the switch off. The last one is optional: switch it off only if you don't read its output.
   - Weekly Loop Engineering QA: https://claude.ai/code/routines/trig_013ocJfEDdmSAgDPVaiCzMZY
   - Weekly improvement loop: https://claude.ai/code/routines/trig_013vYCzVa3vbHZ8BZZy6UBpX
   - Weekly self-improvement loop: https://claude.ai/code/routines/trig_016qKE1TdRjzkpb2Yby8yWBX
   - Weekly opportunity audit (optional): https://claude.ai/code/routines/trig_019NdM12eTVDHWy89Ch2sNtU
2. **Restart your health numbers (Apple Health).** The tiles are about 25 days old. Open the Claude app on your iPhone, say "update my health stats in Notion", and allow the Apple Health read and the Notion write once.

## 2 · One reply to Claude · 2 minutes (Copy, fill the blanks, send in this chat)

3. **Answer the open questions in one message.** Your personal DRE #01988316 is saved. Still needed: LPT Realty's own California DRE brokerage number and exact entity name (the two queued posts and the CRMLS application wait on them), and what kind of Zoho key you have (a Client ID + Client Secret from the Zoho API Console, or something else; never paste the key itself). Put 'no' for Plaid and Drive unless you want them.
   `LPT DRE: ______ (entity name: ______) · Zoho: client id+secret / other: ______ · Plaid: no · Drive: drop`
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
8. **Type your keys into the files (never into chat).** The command above creates empty ~/.config/zoho/.env and ~/.config/lofty/.env with only the variable NAMES. Open each with the line below, type the value after each equals sign, save. Zoho needs five: ZOHO_ACCOUNTS_URL, ZOHO_API_URL, ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN (the two URLs depend on your Zoho data centre: .com, .eu, .in...). If TextEdit shows a formatting bar choose Format → Make Plain Text before saving. Lofty's key is already working.
   `open -e ~/.config/zoho/.env`
9. **Pause the Discord poller until a bot token exists.** vanessa-discord-inbox runs every 5 minutes with no token, about 288 runs a day. Pause (do not delete) it: run the line below on the Mac.
   `runnerctl pause vanessa-discord-inbox && runnerctl list`
10. **Sign in by hand to ShowingTime, Showami and homes.com.** The connection check in the bootstrap tells you which of them needs a sign-in. Sign in once in the agent Chrome it opens. Agents never type your passwords. SkySlope and zipForms stay locked until compliance signs off.

## 4 · Accounts and settings · about 30 minutes (Sign-ins and permission ticks only you can do; say "done N" after each)

11. **Zoho: tick the API permission.** This is why Zoho returns 403, not a missing key. Zoho CRM → Setup → Security Control → Profiles → your profile → Developer Permissions → tick "Zoho CRM API Access". If your key is a Client ID + Secret, also create a Self Client in the Zoho API Console with scopes ZohoCRM.modules.ALL,ZohoCRM.settings.READ and generate the refresh token. Then say "Zoho done".
   - Open Zoho CRM: https://crm.zoho.com/
   - Zoho API Console: https://api-console.zoho.com/
12. **Composio sign-ins: Google Drive, GoHighLevel, Discord bot.** All three still read "initiated, no account". The links expire 10 minutes after they are made, so say "Composio links" when you sit down, then sign in to each. For GoHighLevel, also say what it is for.
13. **claude.ai connectors and Claude Desktop.** Strava and Eromify need you to sign in again (Strava is why the training tiles stopped). EVRoutes fails to connect (error 402) and PlayMCP never finished: reconnect them or remove them. In Claude Desktop → skills settings, upload integrations/claude-desktop/kevin-mentor.zip and delete the old cole-mentor skill.
   - Open Connectors: https://claude.ai/settings/connectors
14. **Cloud network access for the rate websites.** In a Claude Code cloud session: title bar → environment → Edit → Network access. Add these:
   `fred.stlouisfed.org www.freddiemac.com www.redfin.com`

## 5 · Applications and emails · 15 minutes (Drafts are in integrations/CONNECT-PLAN-2026-10-09.md section 6; nothing has been sent)

15. **Send three short messages.** (1) Ticor: ask your Ticor Title Sales Executive or Customer Service whether an API or bulk export of Ticor Property Data exists and on what terms. (2) CRMLS: your broker (LPT) applies for the RESO Web API data licence at licensing@crmls.org; there will be no scraper. (3) Dotloop: apply for developer / partner access at info.dotloop.com/developers. Each is your signature, so Claude only drafted them.
   - Open the drafts: https://github.com/chitown034/Repo/blob/claude/stoic-cori-pvn3f8/integrations/CONNECT-PLAN-2026-10-09.md
   - Ticor Property Data: https://ticorpropertydata.com/
16. **Optional: switch on the free-then-paid failover.** Claude subscription first; when it runs out, OmniRoute free models take over at once; OpenRouter is the paid third tier, capped at $25 a month, and stays off until you do this. Create an OpenRouter key yourself, set the key's own credit limit to $25, load no more than $25, then follow the Three-tier failover steps. It returns to Claude by itself when the allowance resets.
   - Open the steps: https://github.com/chitown034/Repo/blob/claude/stoic-cori-pvn3f8/integrations/omniroute-failover/README.md
   - OpenRouter: https://openrouter.ai/

## 6 · Decisions · one reply (Each defaults to no; nothing is spent without your yes)

17. **Reply 'defaults' or change any line.** Google Drive: drop it from the brain's counts (or wire it after the Composio sign-in). Plaid: no (keys may cost). Terms-of-service reviews for Redfin market pages, lender rate pages and builder pages: Alexandra drafts, you decide each. SkySlope and zipForms: stay locked until compliance signs off. APInation: tell Claude what you want it to do before any paid use. Orca phone app: your call.
   `defaults: Drive drop · Plaid no · ToS reviews later · SkySlope/zipForms locked · APInation: ______`

Reply "done N" (or "skip N") after each step and Claude keeps the dashboards in step.
