# TidyCal — booking data for the brain (as of 2026-10-23)

**Route:** TidyCal's official REST API (docs at tidycal.com/developer/docs), personal access token, `Authorization:
Bearer`. Reads: bookings, booking types, contacts, available slots. Writes exist (create/cancel booking) — **HALT**: the
team never books, cancels or edits for a client. Rate limit 60 requests/min. API on the Individual Lifetime, Pro and
Agency plans. Zapier and Pabbly have native TidyCal apps (polling "New Booking"); Composio has no TidyCal toolkit.

**Steven, once:** TidyCal → Integrations → Automations (newer builds: Integrations → Advanced) → API → Manage API keys →
Personal tokens → Create token (shown once). Then `bash connect-all.sh` step 7c asks for it (hidden; saved only in
`~/.config/tidycal/.env`, chmod 600) and proves it with one read-only call (`GET /api/booking-types`). The exact base
path is confirmed on that first run; if TidyCal answers 404, say so and the step is adjusted.

**What it feeds:** the morning brief and the Inbox & Meetings card (today's bookings), the Fieldy digest (a booking
with a recording), and the sphere list (contacts). Nothing is written back.
