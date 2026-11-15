#!/usr/bin/env bash
# Install Sellbird (github.com/ethanplusai/sellbird) on Steven's Mac (or Linux) with the
# configuration from VANESSA. Safe to re-run: it updates Sellbird and never overwrites
# a config or rules file you've edited (the new version is saved next to it as *.vanessa).
#
#   bash sellbird-setup/install.sh            # installs into ~/sellbird
#   bash sellbird-setup/install.sh ~/apps/sb  # or a folder of your choice
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
DEST="${1:-$HOME/sellbird}"

PY=""
for c in python3.13 python3.12 python3.11 python3; do
  if command -v "$c" >/dev/null 2>&1 && "$c" -c 'import sys; sys.exit(0 if sys.version_info >= (3, 11) else 1)'; then PY="$c"; break; fi
done
if [ -z "$PY" ]; then echo "Sellbird needs Python 3.11 or newer. On a Mac: brew install python@3.13 — then run this again."; exit 1; fi
command -v git >/dev/null 2>&1 || { echo "git is needed (on a Mac: xcode-select --install)."; exit 1; }

echo "→ Sellbird folder: $DEST"
if [ -d "$DEST/.git" ]; then git -C "$DEST" pull --ff-only; else git clone https://github.com/ethanplusai/sellbird.git "$DEST"; fi
cd "$DEST"

echo "→ Python environment ($PY)"
[ -d .venv ] || "$PY" -m venv .venv
.venv/bin/python -m pip install -q --upgrade pip
.venv/bin/python -m pip install -q -e .
.venv/bin/python -m playwright install chromium >/dev/null 2>&1 || echo "  (Playwright browser not installed; Sellbird works without it for email)"

place() { # place <source> <target>
  if [ -f "$2" ] && ! cmp -s "$1" "$2"; then cp "$1" "$2.vanessa"; echo "  kept your $2 (VANESSA's version saved as $2.vanessa)"; else cp "$1" "$2"; echo "  installed $2"; fi
}
echo "→ Steven's configuration"
mkdir -p skills
place "$HERE/sellbird.local.yaml" sellbird.local.yaml
RULES="$HERE/skills/email_rules.md"; [ -f "$RULES" ] || RULES="$HERE/email_rules.md"   # repo layout or a flat download from VANESSA
place "$RULES" skills/email_rules.md
[ -f .env ] || { cp .env.example .env; echo "  created .env (fill in the mailbox and Serper key — see the README)"; }

.venv/bin/python -c "from sellbird.config import load_config; c=load_config('sellbird.local.yaml'); print('  config OK —', c.persona.name, '·', len(c.icp.industries), 'industries ·', len(c.icp.geography), 'cities · approval required:', c.channels.email.require_approval)"

command -v claude >/dev/null 2>&1 && echo "→ Claude Code found" || echo "→ Claude Code not found: install it and run 'claude login' before 'sellbird run'."
cat <<NEXT

Done. Next steps (also in sellbird-setup/README.md):
  cd "$DEST" && source .venv/bin/activate
  1. Fill .env: GMAIL_CLIENT_ID / GMAIL_CLIENT_SECRET (then: sellbird gmail auth), SERPER_API_KEY, REOON_API_KEY
  2. Fill sellbird.local.yaml: persona.email, offer.booking_url, warmup.start_date
  3. sellbird warmup                      # is the sending mailbox ready?
  4. sellbird signals                     # review, then confirm the signals you want
  5. sellbird discover --provider serper --estimate   then without --estimate
  6. sellbird dashboard                   # private link — paste it into VANESSA › Sellbird Outreach
  7. sellbird run                         # every email waits in the Outbox for you
  Optional: sellbird mcp install          # lets Claude Code read Sellbird's pipeline
NEXT
