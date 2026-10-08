# Steven's steps — everything still waiting on you, in order (2026-10-08 10:30 AM PT)

Same list as the Action Desk page (https://claude.ai/artifact/9S8G2ZhhqP1iUsPZrPsmRn), which has a button for
every step. Rebuilt from the live routine list, the Mac runner status and both dashboard databases.

**Already done — nothing to do:** Lofty API key (Lofty syncs 54 leads), ISA bridge and AI twin switched on,
research on Claude only. **Why things keep failing:** the Claude usage allowance runs out early each day
(Oct 7 from about 5:20 AM PT, Oct 8 from about 7 AM PT); after that, routines and Mac tasks stop. Steps 1–2 cut
the waste. The weekly allowance resets Sun Oct 11, 1 PM PT.

## 1 · Stop the waste (5 min, phone or computer)
1. **Switch off five research-only routines** — Strava activity refresh, daily deals & hacks, Travel weekly,
   Next Big Moves weekly, Deck ↔ ISA drift check. Nothing on the dashboard reads them.
2. **Mac: pause three duplicate feed tasks.** In Claude Code on the Mac paste: *"Pause (do not delete) the runner
   tasks openrouter-feeds-refresh, feeds-weekly and feeds-market-close, then show me runnerctl list."* They still
   run next to the cloud writers (all three ran on Oct 7–8) and one wrote a future timestamp.

## 2 · One reply to Claude (2 min)
3. **Answer in one message:** add USC Weeks 5–7 (yes/no; Week 6 paper due Sun Oct 11, 11:59 PM PT) · is Week 4
   done · is the five-state line (CA, NV, AZ, FL, IL) current · LPT Realty's CA DRE brokerage number and entity
   name · keep or switch off the weekly Rent/Buy/Wait refresh.
4. **Approve or decline the two queued posts** (Command Deck → Marketing). After step 3 — both wait on the
   licence facts.

## 3 · iPhone (2 min)
5. **Health numbers:** Claude app → "update my health stats in Notion" → allow the Apple Health read and the
   Notion write once. The tiles are 25 days old.

## 4 · On the Mac, one sitting (~45 min, Terminal in the Repo folder)
6. `git pull && ./MAC-SETUP.sh --only cli-anything-harnesses`
7. **Mac repair paste-in** — `integrations/mac-fix-all-2026-10-05.md` (morning-brief error, refused weekly
   backup, Orca/notes/graph checks). Paste its report back.
8. **ISA KPI paste-in** — `integrations/mac-fix-isa-kpi-2026-10-08.md` (speed to lead). Paste its report back.
9. `bash integrations/ai-team/opus-5-5-on-mac.sh --apply && bash integrations/ai-team/opus-5-5-on-mac.sh --verify`
10. `bash integrations/browser-use/install-mac.sh && bash integrations/open-design/install-mac.sh`
11. **Claude Desktop:** upload `integrations/claude-desktop/kevin-mentor.zip`, delete the old cole-mentor skill.

## 5 · Sign-ins only you can do (~10 min)
12. **Zoho:** Setup → Security Control → Profiles → your profile → Developer Permissions → tick "Zoho CRM API
    Access"; then ask Claude for a fresh Composio reconnect link.
13. **Connectors** (claude.ai → Settings → Connectors): sign in to Eromify again; reconnect or remove EVRoutes.
14. **Optional:** cloud environment → Network access → add `fred.stlouisfed.org`, `www.freddiemac.com`,
    `www.redfin.com` (and `codebuff.com` only if you want freebuff).

Reply "done N" (or "skip N") after each step and Claude keeps the dashboards in step.
