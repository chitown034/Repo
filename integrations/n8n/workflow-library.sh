#!/bin/bash
# workflow-library.sh - install and use the Zie619/n8n-workflows library (MIT) as a READ-ONLY catalog. Bash 3.2 safe.
#
#   bash integrations/n8n/workflow-library.sh install --apply     clone (outside this repo) + index; no server, no n8n changes
#   bash integrations/n8n/workflow-library.sh install             preview
#   bash integrations/n8n/workflow-library.sh find calendly --safe
#   bash integrations/n8n/workflow-library.sh show Calendly/0039_Calendly_Notion_Automate_Triggered.json
#   bash integrations/n8n/workflow-library.sh risks
#   bash integrations/n8n/workflow-library.sh stage <relpath> [--into-n8n]     inactive copy, credentials removed
#
# Never runs the library's own server or any workflow. Staged workflows are inactive; you add your own throwaway credentials,
# test with write nodes off, and decide. Anything that sends to clients or writes to Zoho/Lofty/Gmail is yours to enable.
set -u
HERE="$(cd "$(dirname "$0")" && pwd)"
DIR="${N8N_LIBRARY_HOME:-$HOME/Applications/n8n-workflows}"
SHA=94007c1
PY="python3 $HERE/library/n8n_library.py"
cmd="${1:-}"; [ $# -gt 0 ] && shift
case "$cmd" in
install)
  if [ "${1:-}" != "--apply" ]; then echo "WOULD clone https://github.com/Zie619/n8n-workflows.git into $DIR (reviewed $SHA, 2061 workflows, MIT) and build the index"; exit 0; fi
  if [ -d "$DIR/.git" ]; then echo "already cloned"; else git clone -q --depth 1 https://github.com/Zie619/n8n-workflows.git "$DIR" || exit 1; fi
  head="$(git -C "$DIR" rev-parse --short HEAD)"; [ "$head" = "$SHA" ] || echo "note: library is at $head, reviewed $SHA - skim 'git -C $DIR log --stat $SHA..$head' before importing anything new"
  N8N_LIBRARY_DIR="$DIR/workflows" $PY index "$DIR/workflows" && $PY risks ;;
find|show|risks|stage) $PY "$cmd" "$@" ;;
*) sed -n 2,12p "$0"; exit 2 ;;
esac
