# Google Drive — what the brain can reach (catalogue, not content)

As of 2026-10-09. Read-only, through the claude.ai Google Drive connector on Steven's own sign-in.
Full spec and rules: `integrations/google-drive-brain.md`.

| Folder | File | What it is | Size | Last synced | Link |
|---|---|---|---|---|---|
| Second Brain | `_Second Brain index.md` | Export of the Notion Second Brain database, 69 rows (ideas, references, decisions) | 78 KB | 2026-09-22 (stale: 17 days on 2026-10-09) | https://drive.google.com/file/d/1asxPtsI6KEemVXGDPvR-wtOJlx_P6oBA/view |

The Second Brain folder: https://drive.google.com/drive/folders/1oi_c-wJ59J6KEcNnMOxzE3okYecsVkr3

## How a question uses Drive

1. `bin/brain recall` first — Drive is never level 1.
2. The Notion Second Brain database is the record; this Drive file is a copy of it. Ask Notion for the
   live row; use Drive only if Notion is unreachable, and say its age.
3. The file's content is **not** in the brain's index. A cloud session can open it through the
   connector when a question needs it, read-only, and must not copy client details out of it.

## Rules

Read-only — nothing writes to Drive. No client personal data into the brain, the vector index or the
knowledge graph. Scope stays this one folder. Anything learned from it goes through the Sunday review gate.
