#!/usr/bin/env bash
# Install Sellbird on Steven's Mac with his configuration from this repo.
# Safe to re-run: it never overwrites an existing .env, sellbird.local.yaml or skills/email_rules.md.
# Usage (from the Repo folder on the Mac):   bash integrations/sellbird/install-sellbird.sh
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEST="${SELLBIRD_DIR:-$HOME/sellbird}"

PY=""
for c in python3.13 python3.12 python3.11; do
  if command -v "$c" >/dev/null 2>&1; then PY="$c"; break; fi
done
if [ -z "$PY" ]; then
  echo "Sellbird needs Python 3.11+. On macOS run:  brew install python@3.13   then re-run this script."; exit 1
fi
command -v claude >/dev/null 2>&1 || echo "Note: the Claude Code CLI is not on PATH. Install it and run 'claude login' before 'sellbird run'."

if [ ! -d "$DEST/.git" ]; then
  git clone https://github.com/ethanplusai/sellbird.git "$DEST"
else
  git -C "$DEST" pull --ff-only || echo "Could not fast-forward $DEST; continuing with the current checkout."
fi
cd "$DEST"
[ -d .venv ] || "$PY" -m venv .venv
# shellcheck disable=SC1091
source .venv/bin/activate
pip install -q --upgrade pip
pip install -q -e .

[ -f .env ] || { cp .env.example .env; echo "Created .env from the template (fill in the mail provider and a verifier key)."; }
[ -f sellbird.local.yaml ] || { cp "$HERE/sellbird.local.yaml" sellbird.local.yaml; echo "Installed Steven's sellbird.local.yaml."; }
mkdir -p skills
[ -f skills/email_rules.md ] || { cp "$HERE/email_rules.md" skills/email_rules.md; echo "Installed skills/email_rules.md."; }

python -c "from sellbird.config import load_config; c=load_config('sellbird.local.yaml'); print('Config OK:', c.persona.name, '|', c.channels.email.provider, '| approval required:', c.channels.email.require_approval)"
sellbird status || true

cat <<'NEXT'

Sellbird is installed at ~/sellbird. Finish these once, in order:
  1. Edit sellbird.local.yaml:
       - persona.email      → the mailbox you will send from (a separate domain, not your main one)
       - compliance.postal_address → a street address, PO box or virtual mailbox (CAN-SPAM requires it)
  2. Edit .env: GMAIL_CLIENT_ID / GMAIL_CLIENT_SECRET, plus REOON_API_KEY or ZEROBOUNCE_API_KEY
     (optional, finds realtors/CPAs/planners: TINYFISH_API_KEY or SERPER_API_KEY)
  3. cd ~/sellbird && source .venv/bin/activate
       sellbird gmail auth            # one-time Google sign-in
       sellbird precleared-key        # free cold-email legality check key
       sellbird warmup                # is the sending domain ready?
       sellbird signals               # review, then confirm what to collect (e.g. --confirm free)
       sellbird discover --estimate   # see the searches and cost ($0 on OpenStreetMap)
       sellbird discover
       sellbird dashboard             # open the private link it prints
       sellbird run                   # the loop; every email waits in the Outbox for your approval
  4. Optional: sellbird mcp install claude     # lets Claude/Vanessa read Sellbird and pause sending
              sellbird autostart install       # start the tray icon at login
  5. Weekly: sellbird export --out ~/Desktop/sellbird-prospects.csv
     then Broker Command Center → Growth → Sellbird Outreach → Import.
NEXT
