# Second Brain layers — freshness report (2026-10-23)

One row per layer of the second brain: what it holds, how it syncs, the date its own sync last stamped, and whether it is
inside its cadence. `bin/brain layers` prints this; `bin/brain layers --write` rewrites it. Rules: `wiki/ai-team/second-brain-layers.md`.

| Layer | Holds | Sync | Last | Age | Cadence | Verdict |
|---|---|---|---|---|---|---|
| Repo (GitHub, both Macs) | every page, the router, skills, scripts | git; Macs pull every 30 min (repo-sync.sh); cloud routines commit daily | 2026-10-23 | 0 | 1 d | **fresh** |
| Recall index (bin/brain) | INDEX.md + brain/index.json over the tree | bin/brain reindex (daily rebuild routine; connect-all 6a2) | 2026-10-23 | 0 | 1 d | **fresh** |
| Command Deck DB | live docs: queue, briefs, desks, lists, statuses | routines + Mac tasks write; page reads live | 2026-10-22 | 1 | 1 d | **fresh** |
| 6D Brain page | every node (pages, stores, tools, pods) and links | daily 3:30 AM PT rebuild + merge-live publish | 2026-10-23 | 0 | 1 d | **fresh** |
| Jarvis (Mac, local) | vault index + voice; recall level 5 | openjarvis runner task; jarvis-setup.sh writes the status file | — | — | 2 d | **unverified** |
| Notion Second Brain DB | decisions, references, the layer directory | brain-learn-daily rows; export mirrored to Drive; directory page refreshed by the weekly sync | 2026-10-23 | 0 | 7 d | **fresh** |
| Google Drive SECOND BRAIN/ | 13 SB Google Docs (the brain, masked) + Steven's own folders | weekly Sunday 2:45 PM PT task rewrites changed Docs | 2026-10-23 | 0 | 7 d | **fresh** |
| NotebookLM notebooks | the same 13 Docs as sources; source-grounded Q&A | Google auto-syncs Drive Docs after the weekly rewrite | 2026-10-23 | 0 | 7 d | **fresh** |
| Vector index | high-volume corpora (transcripts, disclosures) | spec only until a corpus is loaded (vector-index/README.md) | — | — | 30 d | **spec only** |
| Knowledge graph | entities and relationships | spec only (knowledge-graph/README.md) | — | — | 30 d | **spec only** |

**Even:** yes — every stamped layer is inside its cadence.
Generated 2026-10-23T13:06:40Z.
