# Open house — before, during, after

How an open house is run on Steven's listing side and what happens to every visitor afterwards: the
sign-in capture, the Open House Captain's output, Pabbly workflow 9, and the line between what the ISA
does and what only Steven does. As of 2026-10-22. Sources: skill `.claude/skills/open-house-follow-up`
(2026-10-22), `wiki/ai-team/desk-seats.md` § Open House Captain, `integrations/pabbly/WORKFLOWS.md` § B
row 9, `wiki/ai-team/cross-functional.md` (Client Care Pod, Listing Pod).

**Drafts only, everywhere.** Nothing on this page sends an email or text, creates a Lofty lead, quotes
a rate, answers an offer question or signs anything. Those are the ISA's hands (after Steven's yes) or
Steven's licensed acts.

## Who owns what

| Piece | Owner | Notes |
|---|---|---|
| The listing side — seller feedback, the seller weekly report line | Marguerite (Listing Agent) | Listing Pod |
| The visitor side — who is a buyer, who is a neighbour, who has an agent | Gwen (Buyer's Agent) | Lead Pod |
| Sign-in → lead list, thank-you drafts, ISA call list, next-open-house checklist | Open House Captain (Sonnet 5 desk seat, reports to Marguerite / Gwen) | Client Care Pod |
| Compliance line on every draft | Alexandra | gate, runs after the wave |
| Calls the visitors, enters leads in Lofty, sends approved thank-yous | the human ISA / EA (Mon–Fri 12–4 PM PT) | from the ISA Portal |
| Hosts the open house; any price, financing, offer or commission answer | Steven | licensed |

## Before

1. **Launch check** — the listing is live on the MLS and the launch package is done (`listing-launch` skill:
   remarks, flyer, social drafts, seller report template). Broker open first if the launch plan says so.
2. **Sign-in capture** — one Google Form per open house (title: `<street> — <date>`), or a Drive sheet with
   the same columns: first name, last initial, email, phone, "working with an agent?" (yes / no / blank),
   timeline, what they liked, **a consent line for follow-up contact**. The Forms response sheet lives in Drive;
   that is what the Captain reads. A sheet with no consent line → thank-you drafts only, no call list.
3. **Fair-housing setup** — same flyer, same disclosures packet, same greeting for everyone. Nothing in the
   materials describes who "should" live there. Equal Housing Opportunity on the flyer and the sign-in page.
4. **Seller prep** — Marguerite's checklist: lights, staging, valuables away, pets out, disclosures on the counter.

## During

- Greet every visitor the same way; offer the sign-in; offer the disclosures. Do not ask about family
  status, religion, national origin, disability or source of income, and do not steer ("you'd like the
  other side of town better"). Keep the conversation on the house.
- A visitor who says they have an agent is thanked, not solicited (CA: no interference with an existing agency).
- Questions about price, financing, offers, seller motivation or commission → "Steven will follow up" —
  write it on the sheet. The Captain turns those into Needs-Steven packets; no draft answers them.
- Note feedback themes as you go (kitchen, price, layout); they become the seller report line.

## After — the Open House Captain's output (skill `open-house-follow-up`)

Reads: the Forms sheet or Drive sheet (read-only), `loftyLeads` (is the visitor already a lead? match on
first name + last initial only), `tcDeals` (the listing's dates), `reClients` (past clients who came by).

| Output | Where it lands | What it holds |
|---|---|---|
| Lead list | the session answer | first name, last initial, interest (hot / warm / neighbour / agent / past client), timeline, has-agent?, "existing — update, don't create" for Lofty matches |
| Thank-you drafts | Gmail `create_draft`, one per visitor with an email and no "have an agent" | two sentences, the one thing they liked, an offer of comparable homes or the disclosures, Alexandra's line — never sent by the skill |
| ISA call list | `vanessaQueue` item `Open house <street> — ISA call list` | first name, interest, has-agent?, best time, draft id; `p1` for "buying in 30 days" |
| Seller feedback | `vanessaQueue` item `Open house <street> — seller feedback` | visitor count, three themes — themed, never attributed to a named visitor |
| Workflow 9 field map | `integrations/pabbly/templates/workflow-9.md` (first run only) | Forms columns → Lofty lead fields, the 24-hour draft body, the ISA task title |

Deck text carries first names, last initials and interest level only — no phone, email or employer.
Re-running on the same sheet creates no new drafts (dedupe on draft subject `<street> — <first name> <initial>`).

## Pabbly workflow 9 — the unattended version

`integrations/pabbly/WORKFLOWS.md` § B row 9, as of 2026-10-22: trigger **Google Forms / Lofty open-house
sign-in** → **Lofty lead** with source "Open house <address>" → **Gmail draft** 24 hours later → **ISA call task**.
Runs on Pabbly, not on the Claude allowance. Status: a workflow Steven clicks together in Pabbly's editor
(§ C of that file); nothing runs until he turns it on and tells Claude "Pabbly workflow 9 on". Until then the
Captain does the same job in an attended session and the ISA enters the leads by hand. Even on Pabbly the
follow-up is a **draft** — the ISA sends.

## ISA vs Steven

| The ISA does (from the ISA Portal, after Steven's yes) | Only Steven does |
|---|---|
| Calls the call list in priority order, logs the outcome on the ISA line | Hosts; any price opinion, financing answer or offer strategy |
| Enters new leads in Lofty, updates existing ones | A represented buyer's agent asking about commission or an offer deadline |
| Sends the approved thank-you drafts | Approves the thank-you batch once; signs anything |
| Adds the seller feedback line to the weekly report | Decides whether a visitor who asked about financing gets a loan conversation (MLO, NMLS 1921615) |

## Fair-housing notes (reminders, not a ruling)

These are the standing reminders the Captain and the ISA work from. A question about whether a specific
wording or practice is compliant is Alexandra's draft and Steven's decision (HALT list in `CLAUDE.md`).

- Treat every visitor identically: same information, same materials, same follow-up offer.
- No questions or notes about protected characteristics; the sign-in form asks about the house, not the household.
- Thank-you drafts and the flyer carry Equal Housing Opportunity and Steven's licence line (Broker Associate,
  LPT Realty · MLO NMLS 1921615).
- Feedback to the seller is themed ("three visitors mentioned the kitchen"), never "the family with kids said…".
- Interest level is about timeline and intent, never about who the visitor is.

## HALT

- Anything that would send (email, text, Lofty auto-text) → stop; the draft waits.
- A visitor's question about financing, price or offers on the sheet → Needs-Steven packet.
- A represented buyer's agent asking for a commission or deadline answer → Steven only.
- A sheet without a consent line → drafts only, no call list, and say why.

## See also

- `wiki/real-estate-playbooks/listing-process.md` — the launch the open house belongs to.
- `wiki/real-estate-playbooks/post-close-care.md` — what happens once one of these visitors closes.
- `wiki/real-estate-playbooks/sphere-nurture.md` — neighbours and past clients who signed in join the sphere list.
- `wiki/ai-team/push-button-system.md` — where the `vanessaQueue` items go and when the cycle works them.
