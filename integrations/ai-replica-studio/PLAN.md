# AI Replica Studio — weekly real-estate and loan-officer videos of "Steve on camera" (plan, 2026-10-09)

Steven, 2026-10-09: with the AI marketing team, build a system like the one on the CAM page (AI avatar of the owner, weekly
videos, scheduled posts) — one track for real estate (LPT Realty), one for the loan-officer business (Patriot Pacific
Financial). **Status: plan only. Nothing is rendered, scheduled or posted.** context.dev is connected; the avatar/voice
provider is not chosen.

## About the CAM page
It is a sales page for a paid service ("CAM, the Content Automation App", simpletechskills.com/cam). Its price is behind a
collapsed FAQ, its results are the vendor's own screenshots, and "Apply Now" books a discovery call with Steven's email
prefilled. **We did not watch the video (a video cannot be watched from here) and did not apply.** What the page shows is the
shape we copy: script → avatar scenes → B-roll/captions → carousel/story formats → daily posting. Buying CAM is Steven's call.

## What already exists (verified in Composio, 2026-10-09)
| Piece | State |
|---|---|
| Facebook Page, Instagram Business (@stevenshearrillhomes), LinkedIn (personal), YouTube (@stevenshearrillbroker) | **Connected** through Composio; video-post tools exist for all four |
| context.dev (brand/web data) | **Connected** (account added today); search call proved 2026-10-09, 1 of 1,000 credits used |
| Canva connector (brand kit, thumbnails, carousels) | Connected |
| Marketing queue + compliance review | `marketingQueue` on the deck; `r14-content-pipeline` drafts text posts Tue–Fri; Approved/Declined is set on the Marketing panel |
| ElevenLabs on Composio | Only the shared "instant account" text-to-speech tools; a **cloned voice needs Steven's own account** |
| HeyGen on Composio | Toolkit exists (avatar listing tools), **not connected** |
| Buffer on Composio | Toolkit exists, **not connected** (optional scheduler) |

## The weekly line (who does what)
| Day | Step | Owner | Gate |
|---|---|---|---|
| Mon | Topic from live data: rates snapshot, market notes, builder incentives, local news; brand look-ups via context.dev | Sofia (CMO) + Marketing Agent | none |
| Tue | Two scripts (45–60 s): **real estate** and **loan officer**, never blended; hook, one idea, disclosure line, CTA | Marketing Agent | — |
| Wed | Compliance read (below); returns BLOCK / FIX / OK per script | Alexandra drafts | **Steven decides** |
| Wed | Avatar + voice render, captions, thumbnail (Canva) | Provider (to choose) + Sam | Steven watches every render |
| Thu | Stage in the Marketing panel as *awaiting Steven*; Approve / Decline | Steven | **Required for every video** |
| Fri | Schedule the approved videos: Facebook natively (`scheduled_publish_time`, unix UTC, at least ~10 min ahead, `published=false`); Instagram, LinkedIn, YouTube need a timed run at publish time (their tools show no schedule field) or Buffer | Sam | Steven's Approved stage |
| Next week | Insights back into the loop (Facebook post insights tool exists) | Naomi / loop-engineering | — |

Trust: **L2 permanently** for anything that posts publicly (loop-engineering rule: client-facing sends stay L2 unless Steven
writes otherwise). Nothing posts without that week's Approved stage.

## Compliance checklist (Alexandra confirms; sources are secondary — verify against the statutes)
- **California real estate:** the DRE's chart RE 559 requires each licensee shown in an ad to carry their 8-digit license
  number, no smaller than the ad's smallest text; DRE treats online video as advertising (2019 SDAR note quoting DRE). Where the
  licensee is also an MLO the NMLS unique identifier is required too (B&P 10140.6 as quoted in a DRE filing). Steven's personal DRE
  # is on file (01988316); **LPT Realty's brokerage name and DRE #, and his personal NMLS ID, are still missing.**
- **Mortgage ads:** Reg Z §1026.24 trigger terms (rate/payment/down-payment statements need the full disclosures), Reg N, state
  rules (Cal. Fin. Code §§22162, 50326 are cited by a study guide, unverified). **No rate quotes** in an avatar video: a quote is
  a licensed decision (CLAUDE.md HALT).
- **AI-generated likeness:** no authority was found on extra disclosure for an AI avatar in DRE/NMLS ads. Check with DRE/counsel
  and each platform's own synthetic-media label rule before the first post; use the label by default.
- Veteran/VA marketing: no implied government endorsement. No testimonials without written consent. No client names, faces,
  addresses or loan details, ever.

## Likeness and voice (Steven's hands)
A replica of Steven needs his recorded consent and his own recordings (a short camera clip and a clean voice sample) uploaded to
the provider **by him**; agents never upload them, never hold the provider login, and the avatar is used only for his own
channels. Eromify on Composio is for fictional characters only and is **not** used.

## Decisions needed from Steven
1. Provider: HeyGen (available on Composio, paid), another avatar vendor, or CAM as a done-for-you service. Price is the first thing to learn; any subscription is his yes.
2. Voice: the avatar's built-in voice, or a cloned voice on his own ElevenLabs account.
3. Platforms and cadence (the plan assumes one real-estate and one loan-officer video a week to Facebook, Instagram, LinkedIn, YouTube).
4. The missing IDs for the disclosure line (LPT brokerage DRE and name; personal NMLS ID).
5. Whether Instagram/LinkedIn/YouTube timed posts run as a routine (uses allowance) or through Buffer (a new connection).

## What can be built now, before the provider is chosen (nothing posts)
- Extend `r14-content-pipeline` (live prompt, needs Steven's yes) or add a sibling to write the two weekly scripts with the disclosure block as `marketingQueue` rows of kind `video-script`.
- A render hand-off file format (script, scene list, caption text, thumbnail brief) so any provider can be dropped in.
- Org chart and brain entries (done today) and the Marketing panel stage rules (exist).
