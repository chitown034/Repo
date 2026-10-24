# APIs — every programmatic interface the brain uses, with where its key lives (as of 2026-10-23)

One row per API. `bin/brain toolkit` reads this table (the last "## APIs" section); the 6D Brain draws one node per row.
Keys live in the named file or Keychain item on the Mac — never in this file, the repo, a dashboard or a routine prompt.
Status words start with **connected**, **key on Mac**, **ready** (step exists, no key yet), **pending** or **no API**.

## APIs

| API | Auth · where the key lives | Read / write | Status | Owner |
|---|---|---|---|---|
| Lofty (developer.lofty.com) | API key · `~/.config/lofty/.env` (connect-all 7b) | read leads, stages, activities; writes are HALT | ready — no key on the Mac yet | Victor |
| Zoho CRM (Composio) | OAuth through Composio | read pipeline, write notes (drafts only) | pending — 403 until "Zoho CRM API Access" is ticked | Marcus |
| TidyCal (tidycal.com/api) | bearer token · `~/.config/tidycal/.env` (connect-all 7c) | read bookings, booking types, contacts; writes are HALT | ready — token not created yet | Vanessa |
| SkySlope (api.skyslope.com, BETA) | ClientId/ClientSecret + AccessKey/AccessSecret, HMAC-SHA256 login → 2-hour Session ticket · `~/.config/skyslope/.env` (fix-mine) | read users/me, files (sales + listings), a file, its documents, checklist types; writes are HALT | ready — client built 2026-10-24; keys land with the paste (Steven has the access pair; Client pair to confirm); `integrations/skyslope/skyslope_cli.py` | Carmen (TC) |
| Arive LOS (API gateway v4.6) | Client ID + Secret + API key · `~/.config/arive/.env` | read loans, status, leads; loan writes are HALT | pending — Pro-plan credentials (`integrations/arive/README.md`) | Marcus |
| Kapso (WhatsApp Business Cloud) | project key · Mac Keychain `kapso` (connect-all 4) | read + answer WhatsApp (sandbox) | ready — Steven's sign-in | Victor |
| Inkbox (iMessage, e-mail, voice) | SDK key · Mac Keychain (connect-all 5) | send Vanessa's texts and voice notes to Steven only | connected | Vanessa |
| GitHub (repo) | this session's GitHub App; `gh` on the Mac | read/write the Repo branch | connected | Derek |
| Google Drive (SECOND BRAIN/) | claude.ai connector + Composio Google Docs | rewrite the 13 SB Docs weekly | connected | Vanessa |
| Notion (Second Brain DB) | claude.ai connector | rows + the layer directory page | connected | Vanessa |
| Fieldy | claude.ai connector | read recordings, summaries | connected — no recordings yet | Vanessa |
| Claude (sample capability) | the viewer's own claude.ai account | the Ask Vanessa chat on the 6D Brain | connected (v41+) | Vanessa |
| MBS Highway Home Report | rep-issued webhook only | enrol past clients (Steven's click) | no API (`integrations/mbs-highway/README.md`) | Harrison |
| Pivo · Ticor Title | — | tour links / CSV exports | no API | Sofia · Victor |
