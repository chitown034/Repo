---
name: citation-sweep
description: "The Citation Auditor's read-only sweep of Steven's directory listings (Google Business Profile, Yelp, Zillow, Realtor.com, Homes.com, Bing, Apple, Chamber, military directories…): compare each listing's name, phone, city, brokerage and website with data/identity.json, update the status column in data/citations-nap.csv, and write the fix packet Steven applies. Use when Steven says 'check my listings', 'is my phone right everywhere', 'citation sweep', 'NAP audit', or weekly from the presence pulse."
---
# citation-sweep — read every listing, change none

Owner: **Citation Auditor** (desk seat under SEO Specialist, Sofia's line). Read-only by construction: it opens public
pages with WebFetch / WebSearch (cloud) or `agent-browser` (Mac, logged-out profile), compares, and records. It never
edits a listing, never logs in as Steven, never creates an account.

## Reads
- `projects/aeo-presence/data/identity.json` (canonical NAP) and `data/citations-nap.csv` (the 40 directories).
- Each directory's public page for Steven (the `url` column; search the directory when the column is blank).

## Writes
- `data/citations-nap.csv`: `status` (`correct` / `stale: <what differs>` / `missing` / `duplicate: <url>`),
  `last_checked` (today), `notes`. One row per directory; never delete a row.
- `vanessaQueue`: one item per stale or duplicate Tier-1/2 listing with the exact fix (field, current value,
  canonical value, where to click), owner Steven; and one item per missing Tier-1 listing as a creation packet
  (name, phone, city, website, category, hours, 100-word bio from `profiles/_generated-bios.md`), owner Steven,
  Elena to review before any account is created.

## Procedure (≤ 30 minutes a week; 8 directories per sweep, Tier 1 first, then round-robin)
1. Take the 8 rows with the oldest `last_checked` (blank first), Tier 1 before Tier 2 before Tier 3.
2. For each: open the page; compare name, phone, city, brokerage/company, website, primary category, photo present.
3. Record the status with the differing field named ("stale: brokerage=eXp Realty; city=Winchester").
4. Queue the fixes; group them so Steven's packet is one list, not eight messages.
5. Append a line to `data/geo-activity-log.csv` (`platform=citation-sweep`, count checked, count stale).

## Guardrails
- A directory that demands a login or payment to view: mark `blocked` and move on.
- Never contact a directory's support on Steven's behalf (duplicate merges are his email, with the text drafted in the packet).
- Facts come from `identity.json` only; a VERIFY-marked field is reported as "unconfirmed", never asserted.
