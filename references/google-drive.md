# Google Drive — what the brain can reach (catalogue + screened notes)

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
3. **Indexed, screened (Steven approved 2026-10-09):** `references/drive-second-brain-notes.md` holds 53 of
   the 69 rows. 13 rows tagged `personal` and 3 with client wording were left out; long numbers outside
   links are masked. Rebuild after a new export: read the file through the connector, then
   `python3 -I integrations/google-drive/redact_export.py <saved export> references/drive-second-brain-notes.md`
   and `bin/brain reindex`. The screen prints counts only.

## Rules

Read-only — nothing writes to Drive. No client personal data into the brain, the vector index or the
knowledge graph. Scope stays this one folder. Anything learned from it goes through the Sunday review gate.
