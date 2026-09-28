# CRMLS — halt, no harness written (R9, 2026-09-28)

Steven's 2026-09-27 request named `crmls.org` alongside the other eight systems this round. Per
lane C3's mandate, the terms that apply to automated access were read before anything else was
written, and **no scraper was written.** This file is the record; the row in
`handback-C3-cli-brain.json` points here.

## What was read, and when

`crmls.org` and every subdomain tried (`www.`, `go.`, `devdocs.`, and a third-party mirror of its
rules PDF on `ranchosoutheast.com`) returned `EGRESS_BLOCKED` on a direct `WebFetch` from this
sandbox, 2026-09-28 — the same restriction already recorded against Redfin/lender/builder sites
(`publicfeeds/PUBLICFEEDS.md`) and against dotloop's own docs (`dotloop/agent-harness/DOTLOOP.md`)
this same round. The terms were therefore read as WebSearch-returned excerpts that name and quote
the source page, not a direct fetch — two WebSearch calls, 2026-09-28, zero Perplexity calls:

- **[Rules and Policies – California Regional Multiple Listing Service](https://go.crmls.org/rules-and-policies/)**
  — CRMLS's own rules hub; a search excerpt states acceptance of the CRMLS Rules & Policies is a
  condition of the CRMLS User Agreement. A companion excerpt named a dated copy, "CRMLS Rules &
  Policies ... EFFECTIVE AUGUST 13, 2024," mirrored at `ranchosoutheast.com` — that mirror is also
  `EGRESS_BLOCKED`, so the rule numbers/exact scraping clause could not be quoted directly.
- **[IDX Resources – CRMLS](https://go.crmls.org/idx-resources/)** and
  **[CRMLS Development Docs — Start](https://devdocs.crmls.org/start/)** — read the same way by
  lane C2 one day earlier (2026-09-27, `C2-routing.md` row 6) and reconfirmed by this search:
  CRMLS's documented automated-access path is the **RESO Web API**, reached only through a
  **data-licensing agreement** (typically Broker Participant level), issued by CRMLS directly
  (`licensing@crmls.org` to start, `api@crmls.org` for the API account), commonly distributed via
  the CoreLogic Trestle™ platform. There is no self-serve or unauthenticated automated endpoint.
- General search results corroborate the industry-standard position: MLS data is described as
  copyrighted, privileged content restricted to licensed real estate professionals, and CRMLS's
  own CEO has spoken publicly (RISMedia, Sept. 2026) about pursuing unauthorized/AI scraping of
  its data, citing per-photo statutory copyright damages.

No page stating a specific numbered "no automated access without an approved feed" rule could be
quoted verbatim — every CRMLS-owned copy of that language was egress-blocked. The evidence above
is consistent and multi-sourced, but it is excerpts and search summaries, not the rule text itself.

## Decision

Per lane C3's mandate: this evidence is read as forbidding automated/scraped access without an
approved data feed, so **no scraper was written for CRMLS this round** — no package, no browser
recipe, nothing added to `connect.sh`. **Interpreting the terms is Steven's decision, not this
harness's or this session's** — the paragraph below is Alexandra's draft for that decision, not a
ruling.

### Alexandra's draft (Chief Compliance Officer persona — for Steven's decision, not a ruling)

> CRMLS's own Rules & Policies bind every participant through the CRMLS User Agreement, and
> nothing in what we could read carves out an exception for automated or scripted access — every
> source instead points to one sanctioned path: the RESO Web API, reached only through a licensed
> data-feed agreement CRMLS issues directly. I have not seen the rule's exact wording — CRMLS's
> own pages were unreachable from this sandbox — so this is a compliance recommendation, not a
> verified citation. My recommendation: do not build or run anything that reads CRMLS data other
> than through that licensed feed. If Steven wants CRMLS data in the second brain, the next step
> is applying for the RESO Web API as a Broker Participant (`licensing@crmls.org`), not a scraper.

## What this means for `connect.sh` and the second brain

- `connect.sh` is **not** changed for CRMLS: no `cli-anything-crmls` script exists, none is
  claimed to exist, and `CAH_PKGS` does not name it.
- The Command Deck connector card and any wiki page must say CRMLS is **not connected** and name
  this file, never "connected" or "installed."
- If Steven decides to pursue the RESO Web API path, that becomes a new NEEDS-STEVEN row (apply
  as Broker Participant) and a new harness — read-only, same shape as `dotloop/` — built only
  after that approval exists.
