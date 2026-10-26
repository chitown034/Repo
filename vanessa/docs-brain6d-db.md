# Brain 6D shared database: how sessions add content

Brain 6D (https://claude.ai/artifact/VoWHW4YuKUCyNqGZMikEv8) keeps its frequently-added content in the artifact's shared database. **Add to the database with the `ArtifactData` tool. Never republish the whole page just to add a page, a search entry, a seat or a log line**: parallel republishes overwrite each other and drop content.

How it works: on load the page subscribes once to four collections and merges them into its in-memory graph, Encyclopedia, Ask-the-brain index, seat list and build log. The database wins by id; ids that exist only in the database are added; the copies built into the HTML are the fallback when the database is empty or unavailable. Counts (pages, sections, links, org seats) include database additions. Changes appear live in open views.

All calls use `url: "https://claude.ai/artifact/VoWHW4YuKUCyNqGZMikEv8"`. Writes need edit access (collection rules: everyone can read, editors write). Replace `/` in an id with `~` for the `doc_id` and keep the real id in the `id` field. Do not store secrets, client data, rates or anything private.

## Collections and documents

`brain_pages` (one doc per page, `doc_id` = page id): `{id, t, d, g: "vanessa", gl: "VANESSA Autopilot", lv: 2, s: <section count>, a: "YYYY-MM-DD", z: "YYYY-MM-DD", u: <link for the Open button>, region: "vanessa", updated, by, links: [{o: <other page id>, w: 0.8}]}`

`brain_enc` (Encyclopedia and search entry, same `doc_id` as the page): `{id, t, d, h: [<heading or fact per line>], b: [<related page ids>], updated, by}`. Title, description and headings are searchable; each `h` line is a passage under "Answer from the brain".

`brain_seats` (`doc_id` = seat name slug): `{n, a: 0, s: [<page ids it starts from>], k: [<lane phrases that route a question to it>], r, b, t: "ops", updated, by}`. Arrays are unioned with the built-in seat of the same name.

`brain_log` (`doc_id` = `YYYYMMDD-slug`): `{id, date: "YYYY-MM-DD", text: "2026-10-26 - what shipped", by, ts: <epoch ms>}`. Lines are appended to the build-log page in date order.

## Calls

Add a page (write both docs, or it is not searchable):

```
ArtifactData {action: "batch", url, writes: [
  {op: "set", collection: "brain_pages", doc_id: "vanessa:my-page", data: {id: "vanessa:my-page", t: "...", d: "...", g: "vanessa", gl: "VANESSA Autopilot", lv: 2, s: 5, a: "2026-10-26", z: "2026-10-26", u: "https://claude.ai/artifact/Ce5m1WNWsQW7y2u91EA8az", region: "vanessa", updated: "2026-10-26", by: "session", links: [{o: "vanessa:runbooks", w: 0.8}]}},
  {op: "set", collection: "brain_enc", doc_id: "vanessa:my-page", data: {id: "vanessa:my-page", t: "...", d: "...", h: ["...", "..."], b: ["vanessa:runbooks"]}}]}
```

Add or change an Encyclopedia entry: `{action: "set", collection: "brain_enc", doc_id, data: {id, t, d, h, b}}`.

Add a seat: `{action: "set", collection: "brain_seats", doc_id: "journey-conductor", data: {n: "Journey Conductor", a: 0, s: ["vanessa:client-journey"], k: ["client journey"], r: "...", b: "Vera", t: "ops"}}`

Add a log line: `{action: "set", collection: "brain_log", doc_id: "20261026-v87", data: {id: "20261026-v87", date: "2026-10-26", text: "2026-10-26 - VANESSA v87 - ...", by: "session", ts: 1793000000000}}`

Change an existing doc: `get` it, then `set`/`update`/`str_replace` with `if_version` set to the version you read, so a concurrent edit is never overwritten. A batch holds at most 50 writes; use `file_path` for large docs.

The page also has a "How sessions add to this brain" entry in the VANESSA region with the same instructions.
