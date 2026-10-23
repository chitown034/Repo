# NotebookLM — the Second Brain as a notebook (source pack, 2026-10-23)

**What this is.** `bin/brain export notebooklm` turns the brain into 13 markdown sources under `exports/notebooklm/`
(not committed). Steven uploads them to one NotebookLM notebook, "Second Brain", and can then ask it anything the brain
knows, with citations back to the page (`# FILE: <path>` headers). The 6D Brain itself is in there as text
(`11-6d-brain-map.md`: every node by lobe, its description and strongest links), so the notebook can answer "how does X
connect to Y" the way the 6D page shows it.

**Why a pack and not a connection.** NotebookLM's consumer and Workspace editions have no public API (only NotebookLM
Enterprise on Google Cloud does, `notebooks.sources.batchCreate`), and `integrations/google-drive-brain.md` rule 1 says
nothing writes to Google Drive. Community "connectors" drive a hidden browser on Steven's Google account and keep his
session cookies in plain text (`integrations/skill-packs/REGISTRY-2026-10-12b.md`), so they stay out. If Steven ever
wants the Drive route (NotebookLM can re-sync a Drive source with one click), that is one decision in `context/decisions.md`
and the exporter gains a `--drive` step through the claude.ai Drive connector; until then, drag-and-drop.

**Never exported.** `wiki/clients/**` (CLAUDE.md HALT: client PII), `brain/state`, `docs/reports`, the deck HTML,
skills, scripts. Phone numbers and e-mails are masked except Vanessa's business lines (+1 650 484 9720 iMessage,
(202) 474-5223 WhatsApp, vanessa-shearrill@inkboxmail.com). The mask is deliberately eager: a 10-digit version id or an
AnyDesk ID is masked too — nothing of substance is lost.

## Steven's steps (5 minutes, once)

1. On the Mac: `bash scripts/notebooklm-export.sh` (reindexes, exports, opens the folder and notebooklm.google.com).
2. NotebookLM → New notebook → name it **Second Brain** → Add sources → **Upload** → select all 13 `.md` files.
3. Ask it. Suggested first question: "What runs every morning and which dashboard does each piece write to?"

**Refresh.** Rerun step 1 after the brain changes; in the notebook delete the sources that changed and upload the new
files (the `00-START-HERE.md` table shows sizes, so a changed size is a changed file). A weekly refresh is enough; the
daily truth stays in `bin/brain recall` and the Command Deck.

**Rules the notebook keeps** (they are in `00-START-HERE.md` so NotebookLM reads them as a source): never a rate quote
or eligibility call, age every fact by the page's date, say "not in the brain" instead of guessing.

Tests: `python3 -m unittest brain.tests.test_export_notebooklm` (masking, routing, exclusions, size split, a real export).
