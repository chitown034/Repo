# Steven's steps — everything still waiting on you, in order (2026-10-09)

Same list as the Action Desk page (https://claude.ai/artifact/9S8G2ZhhqP1iUsPZrPsmRn), which has a button per step.
Includes every connection that still has to be made. Already done: Lofty key (54 leads syncing), ISA bridge and twin on,
research on Claude only; Gmail, Google Calendar, Notion, Slack, Canva and Inkbox iMessage are connected; the five research-only routines are already off.

## 1 · Stop the waste (Phone or computer · 3 minutes · every failed run on 2026-10-08 was the usage limit)

1. **Switch off three duplicate weekly self-improvement loops.** You have four weekly loop routines; three run within one hour every Sunday and all failed on the usage limit. Keep "Weekly Loop Engineering + Self-Test (Cycle report)" on Saturday; open these three and turn the switch off (Claude cannot change routines made through the API).
   - Weekly Loop Engineering QA: https://claude.ai/code/routines/trig_013ocJfEDdmSAgDPVaiCzMZY
   - Weekly improvement loop: https://claude.ai/code/routines/trig_013vYCzVa3vbHZ8BZZy6UBpX
   - Weekly self-improvement loop: https://claude.ai/code/routines/trig_016qKE1TdRjzkpb2Yby8yWBX

## 2 · One reply to Claude (1 minute · send in this chat)

2. **LPT Realty's brokerage DRE number and exact entity name.** Your personal DRE #01988316 is saved. The two queued posts still need LPT Realty's own California DRE brokerage number and its exact entity name (on your LPT license certificate or the DRE site's license lookup).
   `LPT DRE: ______ (entity name: ______)`
   - California DRE: https://www.dre.ca.gov/
3. **Approve or decline the two queued posts.** After the step above: Command Deck → Marketing panel → open each draft and its compliance review → set its stage to Approved or Declined.
   - Open Command Deck: https://claude.ai/code/artifact/1624daae-d683-405a-971d-c5828dce0f8d

## 3 · iPhone (2 minutes)

4. **Restart your health numbers (Apple Health connection).** The tiles are weeks old. Open the Claude app on your iPhone, say "update my health stats in Notion", and allow the Apple Health read and the Notion write once.

## 4 · On the Mac, one sitting (About an hour · do these in order)

5. **Open Terminal and go to your Repo folder.** There is no web link that can open Terminal on your Mac, so: press Command + Space, type Terminal, press Return. Type cd and a space, drag your Repo folder from Finder into the window, press Return. Then copy and run:
   `git pull && ls MAC-SETUP.sh integrations/mac-everything-2026-10-09.md`
6. **Start Claude Code in that folder.**
   `claude`
7. **Paste the combined Mac setup (one paste, seven parts).** Covers the harness reinstall, pausing the three duplicate Mac feed tasks, Opus 5.5, WhatsApp (QR code — iPhone next to you), the Second Brain engine, API Anything with FRED and Freddie Mac, and the ISA KPI fix. It asks you before changing any skill, MCP server or task. Open the file, copy everything between the two PASTE lines, paste it into Claude Code, answer its questions, then paste the MAC COMBINED REPORT block back here.
   - Open the combined paste: https://github.com/chitown034/Repo/blob/claude/stoic-cori-pvn3f8/integrations/mac-everything-2026-10-09.md
8. **Install browser-use and OpenDesign.** Back in Terminal (type /exit to leave Claude Code first). Each ends with a self-test line.
   `bash integrations/browser-use/install-mac.sh && bash integrations/open-design/install-mac.sh`
9. **Mac repair paste-in.** Fixes the morning-brief error and the refused weekly backup; checks Orca, notes and the graph. Paste its report back.
   - Open the paste-in: https://github.com/chitown034/Repo/blob/claude/stoic-cori-pvn3f8/integrations/mac-fix-all-2026-10-05.md
10. **Kevin in Claude Desktop.** Claude Desktop → skills settings → upload integrations/claude-desktop/kevin-mentor.zip, then delete the old cole-mentor skill.
   - Show the file: https://github.com/chitown034/Repo/tree/claude/stoic-cori-pvn3f8/integrations/claude-desktop
11. **Real-estate sites (CLI-Anything: homes.com, ShowingTime, Showami, SkySlope, zipForms).** Install the DOMShell Chrome extension and sign in to each site by hand, then run the guided check. Read-only; SkySlope and zipForms stay locked until compliance signs off.
   `bash integrations/cli-anything-harnesses/connect.sh`

## 5 · Account connections only you can sign in to (About 20 minutes · reply to Claude after each one)

12. **Zoho CRM API access.** Re-tested 2026-10-08: still 403. Zoho CRM → Setup → Security Control → Profiles → your profile → Developer Permissions → tick "Zoho CRM API Access". Then say "Zoho done" and Claude sends a fresh Composio reconnect link.
   - Open Zoho CRM: https://crm.zoho.com/
13. **Composio sign-ins: Google Drive, GoHighLevel, Discord bot.** All three still read "initiated, no account" (checked 2026-10-08). Links expire 10 minutes after they are made, so say "Composio links" when you sit down and sign in to each. For GoHighLevel, also say what it is for.
14. **Discord bot token for #vanessa.** Vanessa's Discord inbox finds no token. Create a bot in the Discord Developer Portal, invite it to your server, and put its token where the Discord bot sign-in above asks for it.
   - Discord Developer Portal: https://discord.com/developers/applications
15. **claude.ai connectors.** Strava and Eromify need you to sign in again (Strava is why the training tiles stopped); EVRoutes fails to connect (error 402); PlayMCP never finished connecting. Reconnect each, or remove it if you don't use it.
   - Open Connectors: https://claude.ai/settings/connectors
16. **Cloud network access (rate websites).** In a Claude Code cloud session: title bar → environment → Edit → Network access. Add these (and codebuff.com only if you want freebuff):
   `fred.stlouisfed.org www.freddiemac.com www.redfin.com`

## 6 · Decisions on optional connections (Reply yes or no to each · nothing is spent without your yes)

17. **Google Drive: wire it or drop it.** If yes, the Drive sign-in above makes it a real store of the brain; if no, Drive comes off the brain's counts so the deck stops implying a feed.
18. **Plaid (bank balances).** No keys, so balances on the deck are typed by hand. Plaid keys may carry a cost: yes = you add keys; no = keep manual balances.
19. **OpenRouter (outside AI models for the council).** Connected with no key, so those seats are unused. A key spends money per call; default is no.
20. **Three publicfeeds terms-of-service reviews.** Redfin market pages, lender rate pages (Veterans United, Navy Federal), builder pages (D.R. Horton, Lennar, Richmond American). Alexandra drafts, you decide each. A yes also lets API Anything connect that group (step 12).
21. **OmniRoute failover and Orca phone app.** OmniRoute switches to free providers when Claude is rate-limited (needs its own key); Orca's phone app watches the sub-agents. Both optional — yes or no.

Reply "done N" (or "skip N") after each step and Claude keeps the dashboards in step.
