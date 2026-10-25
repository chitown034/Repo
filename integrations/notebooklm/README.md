# NotebookLM — the Second Brain as a notebook (Drive mirror + source pack, 2026-10-23)

**Status 2026-10-23 06:10 UTC — connected and syncing.** On Steven's instruction ("connect and sync notebook lm") the
pack now lives in Google Drive as 13 Google Docs under `SECOND BRAIN/` (owner steven.shearrill@gmail.com; folder
https://drive.google.com/drive/folders/16sh0SNlicvHOEpAtTUufI504agSlQRaX), laid out as his plan asked: `00 Inbox`,
`01 Reference Sources/{Mortgage and Lending, Real Estate, AI and Automation, Personal Learning}`, `02 Approved
Playbooks`, `03 Research Briefs`, `04 Decisions and Lessons`, `99 Archive`. Doc ids, folders and the notebook each Doc
belongs to: `drive-manifest.json`. A weekly task (Sun 2:45 PM PT, in the Claude Code session that holds the connectors)
re-exports, rewrites the changed Docs in place through Composio Google Docs, refreshes the Notion layer directory and
`docs/reports/LAYERS.md`. NotebookLM auto-syncs Google Docs sources (Google, May 2026), so Steven's only step is adding
the Docs to his notebooks once. One scoped exception to the Drive rule: writes go only to `SECOND BRAIN/`.

**Steven's one-time step (5 minutes):** notebook.google.com → New notebook → **AI Automation and VANESSA** → Add
sources → Google Drive → pick every `SB …` Doc in `01 Reference Sources/AI and Automation` plus `SB 00-START-HERE` and
`SB 02-who-and-decisions`. Then **Mortgage Reference Library** (`SB 05`, `SB 09`, `SB 00`, `SB 02`) and **Business
Operating Playbooks** (`SB 06`, `SB 08`, `SB 09`, `SB 00`, `SB 02`). Nothing else to do; the Docs refresh on their own.

---


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

1. On the Mac: `bash scripts/notebooklm-export.sh` (reindexes, exports, opens the folder and notebook.google.com).
2. NotebookLM → New notebook → name it **Second Brain** → Add sources → **Upload** → select all 13 `.md` files.
3. Ask it. Suggested first question: "What runs every morning and which dashboard does each piece write to?"

**Refresh.** Rerun step 1 after the brain changes; in the notebook delete the sources that changed and upload the new
files (the `00-START-HERE.md` table shows sizes, so a changed size is a changed file). A weekly refresh is enough; the
daily truth stays in `bin/brain recall` and the Command Deck.

**Rules the notebook keeps** (they are in `00-START-HERE.md` so NotebookLM reads them as a source): never a rate quote
or eligibility call, age every fact by the page's date, say "not in the brain" instead of guessing.

Tests: `python3 -m unittest brain.tests.test_export_notebooklm` (masking, routing, exclusions, size split, a real export).

## Direct connector (opt-in taken 2026-10-23: "setup and connect everything for me")

`connect-all.sh` step 6f installs `notebooklm-mcp-cli` (jacob-bd, PyPI; `uv tool install notebooklm-mcp-cli`) and
registers its MCP server with Claude Code (`nlm setup add claude-code`). It uses notebook.google.com's undocumented
internal APIs and, after **Steven** runs `nlm login` (a browser sign-in; the script never logs in), keeps his Google
session on that Mac. Rules: non-sensitive notebooks only (the SB Docs), `nlm login --check` before trusting it, and it
is the first thing to remove if Google changes the interface (`uv tool uninstall notebooklm-mcp-cli`, `claude mcp remove
notebooklm`). With it, any Claude Code or Orca session can ask the "2nd brain" notebook directly ("query my 2nd brain
notebook for …") and add the SB Docs as sources without the picker. Upstream caveat, verbatim: "internal APIs that are
undocumented and may change without notice; personal/experimental use, at your own risk".

**Links (2026-10-23):** `bin/brain links` prints every front door; `brain/links.py` is the one place to add a surface, and the
6D Brain, the layers register and the Notion directory read it.
