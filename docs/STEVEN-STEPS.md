# Steven's steps — everything only you can do (2026-10-08)

Everything the cloud could do is done. What is left needs your hands, your accounts or your yes. Work top to
bottom; each step says where, how long, and how you know it worked. Details live in `docs/NEEDS-STEVEN.md`.

## A. Today — USC (1 minute)

1. **Say "yes, add the USC dates"** and they go into your study list on the Command Deck. Adding them is a write
   to your own data, so it waits for your OK. From your Canvas calendar (read 2026-10-08 01:50 UTC):
   - Week 5 — discussion Wed Sep 30 · assignment (Designing for Innovation mini-paper) and participation Sun Oct 4
   - Week 6 — discussion Wed Oct 7 · **assignment (Statistical Process Control mini-paper, 1–2 pages) and
     participation due Sun Oct 11, 11:59 PM PT**
   - Week 7 — discussion Wed Oct 14 · participation Sun Oct 18 (no assignment listed)
   - Week 8 — final assessment Mon Oct 19 · live class every Wednesday 5:30–7:00 PM PT (Zoom)
2. Week 4 (Sep 27) is still an open row — if it is done, tell me and I mark it done.

## B. claude.ai routines (5 minutes, phone or computer) — claude.ai/code/routines

3. **Switch off five research-only routines** (recommended; the usage limit ran out again Oct 6–7 — 42 of 53
   routines' last runs failed on it, read 2026-10-07 21:06 UTC). Their output is not written anywhere the deck
   reads, or another writer already covers it:
   Strava activity refresh · daily deals & hacks refresh · Travel & Experiences weekly refresh ·
   Next Big Moves weekly review · Command Deck ↔ ISA Portal drift check.
   *Worked when:* each shows "off". Keep any you want — say which and I adjust the plan.
4. **Sun Oct 11 after 1 PM PT** your phone gets a reminder: switch on the cloud ISA bridge and the Steve twin
   (your decision of Oct 5; agents cannot switch on routines you created), and say yes or no to the weekly
   Rent/Buy/Wait run.

## C. On the Mac (one sitting, about 30 minutes) — Terminal, in your Repo folder

5. `git pull`, then paste `integrations/mac-fix-all-2026-10-05.md` as it says. **Important:** your Mac's feed
   tasks are still running alongside the cloud writers, and one wrote a timestamp in the future
   (2026-10-08 04:30 UTC, written about 20:30 UTC Oct 7). Step 1.1 of the paste-in pauses them.
6. `bash integrations/browser-use/install-mac.sh` — Claude Code gets a hidden, logged-out Chrome to read web
   pages. *Worked when:* it prints "Self-test passed".
7. `bash integrations/open-design/install-mac.sh` — OpenDesign, a design workspace that uses Claude Code.
   *Worked when:* "Self-test passed". Start it later with `... install-mac.sh start`; on first load choose
   **Don't share** and pick **Claude Code**.
8. **Claude Desktop:** in its skills settings upload `integrations/claude-desktop/kevin-mentor.zip`, then remove
   the old `cole-mentor` skill. *Worked when:* "Kevin, are you there?" gets Kevin.
9. `bash integrations/ai-team/opus-5-5-on-mac.sh --apply` then `--verify` (Opus 5.5 on the Mac).

## D. Sign-ins and settings only you can change

10. **Connectors** (claude.ai → Settings → Connectors): Eromify needs you to sign in again; EVRoutes failed to
    connect (2026-10-07) — reconnect or remove both.
11. **Zoho CRM:** Setup → Security Control → Profiles → your profile → Developer Permissions → tick
    "Zoho CRM API Access". **Lofty:** Settings → Integrations → API → generate a key, put it in
    `~/.config/lofty/.env` on the Mac as `LOFTY_API_KEY=…`.
12. **Cloud environment network** (session title bar → environment → Edit → Network access): add
    `fred.stlouisfed.org`, `www.freddiemac.com`, `www.redfin.com` (rates card sources). Only if you want
    freebuff (installed in another session): also add `codebuff.com` — it downloads its program from there.

## E. ISA KPI and content (added 2026-10-08)

13. **Mac:** `git pull`, `./MAC-SETUP.sh --only cli-anything-harnesses`, then paste the block in
    `integrations/mac-fix-isa-kpi-2026-10-08.md` into Claude Code and bring its report back here. This is what
    finally measures the ISA's speed to lead.
14. **Deck, Marketing panel:** read the two queued drafts and set each to Approved or Declined.
15. **Reply with two facts:** whether the five-state licensing line (CA, NV, AZ, FL, IL) is current, and LPT
    Realty's own California DRE brokerage number and exact entity name.

That is the whole list. Reply with the step number when one is done, or "skip N", and I keep the dashboard in
step with it.
