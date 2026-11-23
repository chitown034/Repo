# Tech Stack 10 + Agent Autopilots

Owner: Remy (Digital Operations Lead, reports to Derek). Where: Broker Command Center → Growth → Tech Stack 10 + Agent
Autopilots. Vanessa tool: `tech_stack` (scorecard, inquiries, esign, content, readiness, portal, sweep).

Source: a Club Wealth Real Estate Agent Mastermind post listing ten tools with savings claims (50% less admin, 15 h a
week from 3D tours, 70% of inquiries handled by chatbots, and so on). Those percentages are the post's marketing claims,
not measurements. The dashboard measures each tool on Steven's own data instead.

## The ten tools, as measured

| # | Tool | Measured as | Seat |
|---|---|---|---|
| 1 | CRM mastery | % of open clients with a next step; automated tasks completed | Quincy |
| 2 | Virtual tours | % of active listings with a 3D/video tour link; remote showings logged | Showing Coordinator, Tariq |
| 3 | AI inquiry desk (chatbot) | % of inquiries answered within 1 hour | Priya |
| 4 | Predictive analytics | clients scoring ≥ 60/100 readiness to transact in ~90 days | Ansel |
| 5 | Cloud storage (Doc Vault) | % of open clients with a linked Drive folder | Nova |
| 6 | E-signatures | median hours from sent to signed | Carmen |
| 7 | AI lead scoring | the top 10% by Daily Flow fit × urgency | Bennett |
| 8 | Social scheduling | posts queued for the next 7 days (socials + Skool) | Tariq |
| 9 | Project board | overdue tasks; kanban Today / This week / Later / Waiting | Owen |
| 10 | Client portals | % of active clients sent a status page this week | Sterling |

Readiness is a transparent point score (pre-approval, signed BRBC, timeline, recency, stage, showings, tier). It is a
ranking aid, not a prediction about any person.

## Autopilots

- **A. Buyer rep → signatures → SkySlope.** Copies a BRBC data sheet for zipForm (with the California 3-month limit on
  residential buyer agreements, Civ. Code §1670.50, flagged to confirm), opens an e-signature envelope, creates the
  zipForm and Drive-folder tasks. Unsigned after 48 h → reminder (Carmen). Signed → the client's agreement flag is set
  and a SkySlope task asks to start the file and upload the signed PDF from email.
- **B. Daily content → socials + Skool.** Vanessa drafts seven days across Facebook, Instagram, LinkedIn, YouTube, Google
  Business Profile and each Skool community from real listings, closings and areas. Every post runs the harness
  fair-housing and rate check. Today's posts show in the Daily Flow inbox. Posting is by hand or Meta Business Suite.
- **C. New followers → personal welcomes.** Pasted follower names become short personal DM drafts, logged so no one is
  welcomed twice.
- **D. Notes or a talk → a list.** Notes or a transcript (Fieldy, webinar, mastermind call) become action items, a
  shopping list, tools to evaluate or people to follow up with; items can become tasks.
- **E. Inquiry → answer → route.** A pasted email, text, Zillow or DM is classified, answered from the FAQ first, never
  with rates, approval odds or legal advice, then matched or created as a client and sent through the Lead Router.
- **F. Listing live → tour → matched buyers.** Buyers within ±15% of the price get a 3D-tour Gmail draft.

zipForm, SkySlope, DocuSign, Skool, Facebook and Instagram have no connector in the dashboard, so those steps are
checklists and drafts. Gmail drafts use the dashboard's Gmail connector.

## Loops and routines

Daily orchestrator job: tech-stack sweep (e-sign reminders, missing Drive folders, listings without a tour, a thin
content week). Four loops join the Engineering Core: inquiry response (≥ 80% within 1 h, Priya), signature turnaround
(median ≤ 24 h, Carmen), virtual-tour coverage (100%, Tariq), content cadence (≥ 5 posts queued, Tariq). Two health
checks: no envelope waiting more than 3 days; every active listing has a tour link.
