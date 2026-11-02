# RoleCompass dashboard

Source of the RoleCompass career command center published as a Claude artifact
(https://claude.ai/artifact/FYb2UHsVZZB5bZcpU1B6eF). One HTML file; the page
keeps its data in the artifact's private database and calls Claude, Gmail,
Google Calendar and downloads through artifact runtime capabilities.

## career-ops inside the dashboard

The Career-Ops view ports the open-source career-ops method
(https://github.com/career-ops-hq/career-ops, MIT) into the board:

| Tab | career-ops origin |
|---|---|
| A-H evaluation | `oferta` / auto-pipeline: blocks A to H, 1-5 score, 4.0 apply line, Block G legitimacy |
| Triage | `triage`: quick go / no-go before a full evaluation |
| Story bank | `interview-prep/story-bank.md`, STAR+R with provenance |
| Outreach & email | `contacto`, `email`, `deep` research prompt |
| Offer prep | `offer-prep`: clause walk, not legal advice |
| Red flags | `interview-redflag` |
| Patterns & titles | `patterns`, `titles` |
| Compare | `ofertas`: 10-dimension weighted matrix |
| Outcomes & calibration | `outcome` (canonical discard reasons), `calibrate`, `funnel-velocity`, `rejection-latency` |
| Reply watch | `reply-watch`: classify a pasted employer reply with quoted evidence |
| Plan & grow | `interview/plan` (time-blocked), `training`, `project`, `upskill` |
| Search guardrails | `blacklist`, `detect-reposts`, `discover` (ATS board finder) |
| Sync with career-ops | export `data/applications.md`, `status-log.tsv`, reports and more; import the tracker back |

Offers also gained `salary-gap`, a negotiation ROI calculator and the stated-comp log.

The page never submits an application, sends a message or changes a score on
its own, matching career-ops' human-in-the-loop guarantee.

## Editing

Edit `rolecompass.html` and republish it to the artifact URL above. The file
is a single page with sectioned script blocks (v3 through v11) that extend
earlier views by wrapping functions, so new features go in a new section
before the boot block.

## Running the career-ops CLI beside it

The dashboard's Sync tab exports a bundle the CLI reads. Install career-ops
with `npx @santifer/career-ops init`, or in Claude Code with
`/plugin marketplace add career-ops-hq/career-ops` then
`/plugin install career-ops@career-ops`.
