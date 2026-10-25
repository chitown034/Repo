#!/bin/bash
# notebooklm-export.sh - build the NotebookLM source pack from the brain and open the folder (2026-10-23). Bash 3.2 safe.
#
#   bash scripts/notebooklm-export.sh         reindex, export to exports/notebooklm/, open the folder in Finder
#
# Then in NotebookLM (notebook.google.com): open the "Second Brain" notebook (or make it), Add sources -> upload all
# the .md files in that folder. To refresh later: run this again and re-upload only the files that changed. Nothing here
# writes to Google Drive or to NotebookLM itself (no public API for a consumer account; Drive is read-only by rule).
set -u
REPO="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO" || exit 1
bin/brain reindex >/dev/null 2>&1 || { echo "bin/brain reindex failed (Python 3.10+ needed) - run: bin/brain doctor"; exit 1; }
bin/brain export notebooklm || exit 1
echo
echo "Next: NotebookLM -> notebook 'Second Brain' -> Add sources -> upload every .md file in exports/notebooklm (13 files)."
if [ "$(uname -s)" = Darwin ]; then open "$REPO/exports/notebooklm" 2>/dev/null; open "https://notebook.google.com/" 2>/dev/null; fi
