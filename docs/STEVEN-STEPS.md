# Steven's steps — everything still waiting on you, in order (2026-10-08, 11 AM PT)

Same list as the Action Desk page (https://claude.ai/artifact/9S8G2ZhhqP1iUsPZrPsmRn), which has a button per step.
Includes every connection that still has to be made. Already done: Lofty key (54 leads syncing), ISA bridge and twin on,
research on Claude only; Gmail, Google Calendar, Notion, Strava, Slack, Canva and Inkbox iMessage are connected.

## 1 · Stop the waste (Phone or computer · 5 minutes · biggest effect)

1. **Switch off five research-only routines.** Nothing on the dashboard reads them, and they burn the daily usage allowance. Open each, turn the switch off. Keep any you want and tell Claude which.
   - Strava activity refresh: https://claude.ai/code/routines/trig_015Fm6K3R7yvyHv3SkPGXHwL
   - Daily deals & hacks: https://claude.ai/code/routines/trig_015MZSefaw573ciFQSvoWDmZ
   - Travel weekly: https://claude.ai/code/routines/trig_01Qgz9ZEvt2KYFqfAte8zVRi
   - Next Big Moves weekly: https://claude.ai/code/routines/trig_01Lb3aYRQZSLsAkcnDpZ8zEL
   - Deck ↔ ISA drift check: https://claude.ai/code/routines/trig_01PahyyhhmNzze1o1ujcGno2
2. **Mac: pause the three feed tasks the cloud already does.** They still run every day next to the cloud writers and use the same allowance. Paste this into Claude Code on the Mac:
   `Pause (do not delete) the runner tasks openrouter-feeds-refresh, feeds-weekly and feeds-market-close, then show me runnerctl list.`

## 2 · One reply to Claude (2 minutes · copy, fill the blanks, send in this chat)

3. **Answer five quick questions in one message.**
   - Add USC Weeks 5–7 to your study list? (Week 6 paper + participation due Sun Oct 11, 11:59 PM PT; final assessment Mon Oct 19)
   - Is Week 4 (due Sep 27) done?
   - Is the five-state licensing line (CA, NV, AZ, FL, IL) current?
   - LPT Realty's own California DRE brokerage number and exact entity name?
   - Weekly Rent/Buy/Wait refresh: keep running, or switch off?
   `USC: yes · Week 4: done · 5 states: current · LPT DRE: ______ (entity name: ______) · Rent/Buy/Wait: keep`
4. **Approve or decline the two queued posts.** Command Deck → Marketing panel → open each draft and its compliance review → set its stage to Approved or Declined. After step 3: both wait on the licence facts.
   - Open Command Deck: https://claude.ai/code/artifact/1624daae-d683-405a-971d-c5828dce0f8d

## 3 · iPhone (2 minutes)

5. **Restart your health numbers (Apple Health connection).** The tiles are 25 days old. Open the Claude app on your iPhone, say "update my health stats in Notion", and allow the Apple Health read and the Notion write once.

## 4 · On the Mac, one sitting (About an hour · Terminal, in your Repo folder · in this order)

6. **Get the latest files and harnesses.**
   `git pull && ./MAC-SETUP.sh --only cli-anything-harnesses`
7. **Mac repair paste-in.** Fixes the morning-brief error and the refused weekly backup; checks Orca, notes and the graph. Paste its report back.
   - Open the paste-in: https://github.com/chitown034/Repo/blob/claude/stoic-cori-pvn3f8/integrations/mac-fix-all-2026-10-05.md
8. **Second Brain install paste-in (new).** Installs the brain engine (bin/brain), registers Laya with Claude Code, adds the brain-maintenance task and rebuilds the knowledge graph. Paste its last line back.
   - Open the paste-in: https://github.com/chitown034/Repo/blob/claude/stoic-cori-pvn3f8/integrations/mac-brain-2026-10-08.md
9. **ISA KPI paste-in (Lofty speed to lead).** Lofty syncs, but its lead list returns no lead id, so first-response time has never been measured. Paste its report back.
   - Open the paste-in: https://github.com/chitown034/Repo/blob/claude/stoic-cori-pvn3f8/integrations/mac-fix-isa-kpi-2026-10-08.md
10. **Opus 5.5 on the Mac.**
   `bash integrations/ai-team/opus-5-5-on-mac.sh --apply && bash integrations/ai-team/opus-5-5-on-mac.sh --verify`
11. **Install browser-use, OpenDesign and API Anything.** browser-use reads web pages in a logged-out Chrome; OpenDesign is a design workspace; API Anything (new) lets Claude call a website like an API. Each ends with a self-test line.
   `bash integrations/browser-use/install-mac.sh && bash integrations/open-design/install-mac.sh && bash integrations/api-anything/install-mac.sh`
12. **Connect sites with API Anything (paste-in).** After the install above: connects FRED and Freddie Mac rate data now; lists Redfin, lender, builder and homes.com pages and waits for your yes per group; never touches ShowingTime, Showami, SkySlope or zipForms (client data). Paste its end lines back.
   - Open the paste-in: https://github.com/chitown034/Repo/blob/claude/stoic-cori-pvn3f8/integrations/api-anything/mac-connect-sites-2026-10-09.md
13. **Kevin in Claude Desktop.** Claude Desktop → skills settings → upload integrations/claude-desktop/kevin-mentor.zip, then delete the old cole-mentor skill.
   - Show the file: https://github.com/chitown034/Repo/tree/claude/stoic-cori-pvn3f8/integrations/claude-desktop
14. **WhatsApp → Vanessa (OpenWA connection).** Links your phone to OpenWA on the Mac (QR code, or add --code for an 8-character code), then installs the reply bridge. Test: text yourself "Vanessa, are you there?"
   `bash integrations/install-orca-whatsapp-laya.sh --skip-orca --skip-laya`
15. **Real-estate sites (CLI-Anything: homes.com, ShowingTime, Showami, SkySlope, zipForms).** Install the DOMShell Chrome extension and sign in to each site by hand, then run the guided check. Read-only; SkySlope and zipForms stay locked until compliance signs off.
   `bash integrations/cli-anything-harnesses/connect.sh`

## 5 · Account connections only you can sign in to (About 20 minutes · reply to Claude after each one)

16. **Zoho CRM API access.** Re-tested 2026-10-08: still 403. Zoho CRM → Setup → Security Control → Profiles → your profile → Developer Permissions → tick "Zoho CRM API Access". Then say "Zoho done" and Claude sends a fresh Composio reconnect link.
   - Open Zoho CRM: https://crm.zoho.com/
17. **Composio sign-ins: Google Drive, GoHighLevel, Discord bot.** All three still read "initiated, no account" (checked 2026-10-08). Links expire 10 minutes after they are made, so say "Composio links" when you sit down and sign in to each. For GoHighLevel, also say what it is for.
18. **Discord bot token for #vanessa.** Vanessa's Discord inbox finds no token. Create a bot in the Discord Developer Portal, invite it to your server, and put its token where the Discord bot sign-in above asks for it.
   - Discord Developer Portal: https://discord.com/developers/applications
19. **claude.ai connectors.** Eromify needs you to sign in again; EVRoutes fails to connect; PlayMCP never finished connecting. Reconnect each, or remove it if you don't use it.
   - Open Connectors: https://claude.ai/settings/connectors
20. **Cloud network access (rate websites).** In a Claude Code cloud session: title bar → environment → Edit → Network access. Add these (and codebuff.com only if you want freebuff):
   `fred.stlouisfed.org www.freddiemac.com www.redfin.com`

## 6 · Decisions on optional connections (Reply yes or no to each · nothing is spent without your yes)

21. **Google Drive: wire it or drop it.** If yes, the Drive sign-in above makes it a real store of the brain; if no, Drive comes off the brain's counts so the deck stops implying a feed.
22. **Plaid (bank balances).** No keys, so balances on the deck are typed by hand. Plaid keys may carry a cost: yes = you add keys; no = keep manual balances.
23. **OpenRouter (outside AI models for the council).** Connected with no key, so those seats are unused. A key spends money per call; default is no.
24. **Three publicfeeds terms-of-service reviews.** Redfin market pages, lender rate pages (Veterans United, Navy Federal), builder pages (D.R. Horton, Lennar, Richmond American). Alexandra drafts, you decide each. A yes also lets API Anything connect that group (step 12).
25. **OmniRoute failover and Orca phone app.** OmniRoute switches to free providers when Claude is rate-limited (needs its own key); Orca's phone app watches the sub-agents. Both optional — yes or no.

Reply "done N" (or "skip N") after each step and Claude keeps the dashboards in step.
