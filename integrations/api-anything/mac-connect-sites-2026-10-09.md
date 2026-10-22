# Mac: connect the not-yet-connected sites through API Anything — one paste (2026-10-09)

Steven, 2026-10-09: *"connect the sites not connected with api anything"*.

**Why this runs on the Mac.** Teaching API Anything a site means loading that site once in headless Chrome. All 16
target sites (homes.com, ShowingTime, Showami, SkySlope, zipForms, Redfin, FRED, Freddie Mac, Veterans United, Navy
Federal, D.R. Horton, Lennar, Richmond American, Zillow, Realtor.com, the FRED API) are blocked from the cloud
sandbox's network (checked 2026-10-09: no connection to any of them). Run `integrations/api-anything/install-mac.sh`
first. *Nothing in this paste has run on a Mac yet.*

**Which sites, and why in three groups**

| Group | Sites | What happens |
|---|---|---|
| 1 · Connect now | FRED (30- and 15-year mortgage rate series), Freddie Mac PMMS | Public government/agency rate data, no login. Feeds the deck's rates card, which the cloud cannot reach. |
| 2 · Only on your yes, per group | Redfin market pages (Temecula, Murrieta, San Diego County) · lender rate pages (Veterans United, Navy Federal) · builder incentive pages (D.R. Horton, Lennar, Richmond American) · homes.com search | Public pages, but their terms of service were never reviewed (the same three reviews already on your list). Alexandra drafts; you say yes per group. |
| 3 · Not through API Anything | ShowingTime, Showami, SkySlope, zipForms | Signed-in systems that hold client records. Anything API Anything returns goes to the cloud model, and client data must not leave the local model (HALT list). They stay on the read-only CLI-Anything path with its compliance gate. |

Paste this into Claude Code on the Mac, in the Repo folder:

```
Use the api-anything skill to connect sites for me, read-only. Rules: never call `login`, never add an operation with --write, never start the MCP server with --allow-writes, never open ShowingTime, Showami, SkySlope or zipForms, and never return a person's name, phone, email or address.
Group 1, do now:
 a) FRED: operation "rate" on fred.stlouisfed.org that returns the latest observations (date, value) for a series id; examples MORTGAGE30US and MORTGAGE15US. Prefer the site's own CSV/JSON request over HTML.
 b) Freddie Mac PMMS (freddiemac.com/pmms): operation "latest" returning the latest weekly 30-year and 15-year fixed averages with their week date.
 For each: propose the operation, build it, call it with an input that was not an example, then run `api-anything verify <site>`.
Group 2: list each group (Redfin market pages; Veterans United + Navy Federal rate pages; D.R. Horton, Lennar, Richmond American incentive pages; homes.com search) with the one operation you would build for it, and STOP — build a group only after I say yes to that group by name.
When done: `api-anything export <site> --out integrations/api-anything/sites/<site>.json` for each site you built, show me `git diff --stat`, and do not commit until I say so.
End with one line per site: <site> <operation> <ok|failed: class> tier=<1|2> sample=<one value and its date>.
```

Paste the end lines back to the cloud session. Once FRED and PMMS answer, the cloud wires the rates card to them.
