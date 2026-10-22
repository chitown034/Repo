# Project — AEO / SEO / GEO / AIO presence kit

**What.** A ready-to-deploy kit that makes Steven the entity Google, Bing and the large language
models resolve to for "veteran-focused realtor / VA loan officer in Temecula or San Diego". The kit
is in `projects/aeo-presence/`: an audit of every public profile, the strategy, 140+ real search
questions mapped to answers, a 90-day content calendar, an LLM-citation checklist, copy for each
profile, JSON-LD schema, and a static entity site (`site/`, with `llms.txt`).

**Owner.** Sofia (CMO). **Gate.** Alexandra (compliance) reviews every public line first, then
Steven approves the publish. Proposal-only until both say yes. Nothing has been posted, pasted or
deployed.

## Status (2026-10-22)

| Item | State |
|---|---|
| Kit written | 2026-10-12, from Steven's public pages as of that date (branch `claude/tender-feynman-mw4cm1`) |
| On the main line | 2026-10-22, as a held draft |
| Schema check | `node projects/aeo-presence/scripts/validate-schema.mjs` → all checks passed (2026-10-22) |
| Deployed / profiles updated | No |

## Compliance hold (Alexandra) — clear these before any copy leaves the repo

1. **Triggering terms (Reg Z advertising).** "Zero down" and "no monthly mortgage insurance"
   appear in `site/va-home-loans-temecula.html`, `site/llms-full.txt` and the FAQ schema. A stated
   down payment triggers the full disclosure set; rewrite or add the disclosures.
2. **VA disclaimer.** The VA page needs a "not affiliated with or endorsed by the Department of
   Veterans Affairs" line.
3. **Generic claims.** The "15–25%" BAH gross-up figure needs a source or removal.
4. **Ratings.** No `AggregateRating` until there are 5+ Google reviews. Never mark up the
   3-review Yelp score.
5. **Equal Housing Opportunity** and "not a commitment to lend" lines are present; keep them on
   every page.

## Facts to verify against `context/about-me.md` before publishing

`about-me.md` confirms DRE #01988316, company NMLS #1921615, Temecula/San Diego and the Navy Chief
service. The kit also states these, which the brain does **not** yet hold: a personal NMLS
#2449246; LPT Realty DRE #02248983; "licensed since 2015" and "MLO since 2024" (the VA page also
says "since 2020"; the two must agree); the 877 phone number and office address (marked VERIFY);
"Veteran-owned"; and VFW/Legion post numbers. Confirm each with Steven, then add the confirmed ones
to `about-me.md` so the brain and the kit agree.

## Next step

Alexandra's review of items 1–5, Steven's answers on the facts list, then Sofia runs the kit's
README quick start in order (NAP conflicts first).
