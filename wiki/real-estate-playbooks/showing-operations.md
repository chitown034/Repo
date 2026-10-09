# Showing operations

How a showing actually gets booked: itinerary building, the ShowingTime-vs-Showami choice, and feedback capture — plus the hard rule on what an automation may never do here.

## The itinerary and route planner

Enter the day's showings in order on the Showings tab, then open the whole run as one multi-stop Google Maps route (Google Maps takes up to 9 stops between start and finish). The itinerary syncs across devices. For each property the method is one of: **ShowingTime request**, **Showami showing agent**, **Steven shows**, or **ISA coordinates**. Status runs planned → requested → confirmed → shown → feedback logged.

## ShowingTime vs. Showami

- **ShowingTime**: standard showing-request channel to the listing agent.
- **Showami**: books a licensed, independent showing agent to physically show the property so Steven stays on licensed work he alone can do (consultation, negotiation, the file). Post the request directly at showami.com, or hand the itinerary to the ISA to book.

## The one rule that never moves

**Showings never contact a client or listing agent from an automation.** "Send to ISA" drops the itinerary and a coordination checklist (access arrangements with listing agents, buyer confirmations, Showami booking, feedback capture after each stop) onto the ISA line; it reaches the ISA Portal on the next hourly bridge run and a **human** — the ISA — makes the actual contact, confirmation, and booking. No agent, task, or routine sends a showing request, books a Showami agent, or confirms with a client directly.

## Automation status — read this before assuming something is live

Showami markets API automation to brokerage/enterprise accounts, but no public developer documentation, base URL, or auth scheme has been found (checked against showami.com, which was unreachable from the research sandbox at last check). The only path that works today is the manual one: **Open Showami** / **Copy Showami request** buttons that pre-fill a complete request for copy-paste. A browser-automation (DOMShell) path for Showami is spec'd but **not installed**, and is deliberately gated: posting a showing request hires a person and spends money, so that verb stays off until Steven approves it in writing. The same gate applies to ShowingTime.

## Feedback capture

Every stop has a feedback field logged after the showing, which feeds the buyer-matching/revealed-preference analysis (Tobias, `wiki/ai-team/org-chart.md`) and the weekly curated-listing batch referenced in `wiki/real-estate-playbooks/buyer-process.md`.

## See also

- `wiki/real-estate-playbooks/buyer-process.md` — where "Active search" showings sit in the buyer stage table.
- `wiki/ai-team/tool-integration-status.md` — the CLI-Anything / DOMShell automation status in full, including why the write verbs stay off.

Source: Command Deck, "Showings — schedule by client" panel and the CLI-Anything connectors card (checked 2026-09-22).
