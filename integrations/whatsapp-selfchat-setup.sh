#!/usr/bin/env bash
# whatsapp-selfchat-setup.sh — run C4 of docs/SETUP-RUNBOOK.md as one command.
#
#   ./integrations/whatsapp-selfchat-setup.sh "+15551234567"
#
# What it does, and nothing else:
#   1. Checks whatsapp-cli is installed and its session is live.
#   2. Finds the self-chat for the number you pass.
#   3. Reads that chat's recent rows and works out whether `is_from_me` really is
#      always true there — the one assumption integrations/mac-task-specs.md §5a
#      rests on and that nobody has ever measured.
#   4. Looks for any field that distinguishes the two sides better than a text
#      marker would. If one exists, §5a gets SIMPLER and this script says so.
#   5. Prints the exact whatsappInboxState seed document, with your real
#      chatName, allowFrom and lastSeenPk already in it.
#
# It writes nothing, sends nothing and changes nothing. Read-only end to end.
#
# PRIVACY: this reads your personal WhatsApp. It deliberately never prints a
# message body, a phone number other than the one you passed, or a contact name.
# It reports SHAPES and COUNTS. Keep it that way if you edit it — the output is
# meant to be safe to paste back into a Claude session.
#
# Written for macOS /bin/bash 3.2: no associative arrays, no mapfile, no ${x^^}.
# Written 2026-09-23. Never run on a Mac by its author — see docs/SETUP-RUNBOOK.md C4.

set -uo pipefail

RED=''; GRN=''; YEL=''; BLD=''; DIM=''; RST=''
if [ -t 1 ]; then
  RED=$(printf '\033[31m'); GRN=$(printf '\033[32m'); YEL=$(printf '\033[33m')
  BLD=$(printf '\033[1m'); DIM=$(printf '\033[2m'); RST=$(printf '\033[0m')
fi
say()  { printf '%s\n' "$*"; }
ok()   { printf '%s  ok %s %s\n'   "$GRN" "$RST" "$*"; }
bad()  { printf '%sFAIL %s %s\n'   "$RED" "$RST" "$*"; }
warn() { printf '%s note %s %s\n'  "$YEL" "$RST" "$*"; }
hdr()  { printf '\n%s%s%s\n' "$BLD" "$*" "$RST"; }

MYNUM="${1:-}"
if [ -z "$MYNUM" ]; then
  say "usage: $0 \"<your own WhatsApp number, e.g. +15551234567>\""
  say ""
  say "That number is used for the chat lookup only. It is never printed back,"
  say "written to a file, or included in the seed document this prints."
  exit 2
fi

# ---------------------------------------------------------------- interpreter
# The whatsapp-cli venv is Python 3.12 and exists as soon as runbook C2 is done,
# so prefer it over whatever `python3` happens to be on PATH.
WA_PY="$HOME/Applications/whatsapp-cli/.venv/bin/python"
if [ ! -x "$WA_PY" ]; then
  if command -v python3 >/dev/null 2>&1; then
    WA_PY=$(command -v python3)
  else
    bad "no Python found. Expected $HOME/Applications/whatsapp-cli/.venv/bin/python"
    say "     Run runbook C2 first (it builds that venv), or: brew install python@3.12"
    exit 1
  fi
fi

hdr "1. whatsapp-cli"
if ! command -v whatsapp-cli >/dev/null 2>&1; then
  bad "whatsapp-cli is not on PATH."
  say "     Runbook C2 installs it. If you ran C2, check that ~/.local/bin is on PATH"
  say "     (runbook A3 adds it) — the symlink lands there."
  exit 1
fi
ok "on PATH at $(command -v whatsapp-cli)"

SESS=$(whatsapp-cli --json session status 2>&1)
if printf '%s' "$SESS" | grep -q '"error"'; then
  bad "session status returned an error:"
  printf '%s\n' "$SESS" | sed 's/^/       /'
  say ""
  say "     Most likely one of:"
  say "       - WhatsApp Desktop is not running or not linked (runbook C3)"
  say "       - Full Disk Access not granted to this shell (runbook C3)"
  exit 1
fi
ok "session is live"

# ---------------------------------------------------------------- the chat
hdr "2. your self-chat"
CHAT=$(whatsapp-cli --json chat find "$MYNUM" 2>&1)
if printf '%s' "$CHAT" | grep -q '"error"'; then
  bad "chat find failed:"
  printf '%s\n' "$CHAT" | sed 's/^/       /'
  say ""
  say "     Send yourself a message in WhatsApp first — a self-chat that has never"
  say "     been used does not exist to find."
  exit 1
fi

CHAT_NAME=$("$WA_PY" - "$CHAT" <<'PY' 2>/dev/null
import json, sys
try:
    d = json.loads(sys.argv[1])
except Exception:
    sys.exit(1)
if isinstance(d, list):
    d = d[0] if d else {}
for k in ("chat_name", "name", "chatName", "jid", "id"):
    v = d.get(k)
    if v:
        print(v); break
PY
)
if [ -z "${CHAT_NAME:-}" ]; then
  bad "could not read a chat name or JID out of chat find's reply."
  say "     Raw reply shape (keys only, no values):"
  "$WA_PY" - "$CHAT" <<'PY' 2>/dev/null | sed 's/^/       /'
import json, sys
try:
    d = json.loads(sys.argv[1])
    d = d[0] if isinstance(d, list) and d else d
    print(sorted(d.keys()) if isinstance(d, dict) else type(d).__name__)
except Exception as e:
    print("unparseable:", e)
PY
  say "     Send that list back and the script gets fixed, not worked around."
  exit 1
fi
ok "found it"

# ---------------------------------------------------------------- the probe
hdr "3. the assumption §5a rests on"
SINCE="2026-01-01T00:00:00Z"
MSGS=$(whatsapp-cli --json message get "$CHAT_NAME" --after "$SINCE" 2>&1)
if printf '%s' "$MSGS" | grep -q '"error"'; then
  bad "message get failed:"
  printf '%s\n' "$MSGS" | sed 's/^/       /'
  exit 1
fi

"$WA_PY" - "$MSGS" "$CHAT_NAME" <<'PY'
import json, sys

raw, chat_name = sys.argv[1], sys.argv[2]
try:
    d = json.loads(raw)
except Exception as e:
    print("FAIL  message get did not return JSON: %s" % e); sys.exit(1)

rows = d if isinstance(d, list) else (d.get("messages") or d.get("rows") or d.get("items") or [])
if not isinstance(rows, list) or not rows:
    print("FAIL  no rows came back. Send yourself two or three messages in WhatsApp,")
    print("      then run this again.")
    sys.exit(1)

n = len(rows)
print("  ok  %d rows read (no message text is printed by this script)" % n)

# --- scan for a discriminator BEFORE drawing any conclusion ------------------
# Order matters. An earlier version announced "§5a is correct, nothing in the
# data tells the two sides apart" and then printed a field that did. Establish
# the facts, then state one verdict that accounts for all of them.
CANDIDATES = ("device_id", "from_device", "sender_device", "participant",
              "sender", "author", "from", "from_me", "self", "origin",
              "sender_jid", "remote_jid", "push_name")
discriminators = []   # (key, rows_present, distinct_count)
single_valued = []
for key in CANDIDATES:
    seen = [r.get(key) for r in rows if isinstance(r, dict) and r.get(key) is not None]
    if not seen:
        continue
    # Only the SHAPE is recorded: how many distinct values, never which.
    distinct = len({json.dumps(v, sort_keys=True) for v in seen})
    (discriminators if distinct > 1 else single_valued).append((key, len(seen), distinct))

vals = [r.get("is_from_me") for r in rows if isinstance(r, dict)]
present = [v for v in vals if v is not None]

# --- the is_from_me question -------------------------------------------------
if not present:
    print("note  no `is_from_me` field at all on these rows.")
    print("      Keys actually present: %s" % sorted({k for r in rows if isinstance(r, dict) for k in r}))
    print("      §5a's filter names a field that does not exist here. Send that key")
    print("      list back before building anything on it.")
elif all(v is True for v in present):
    print("  ok  is_from_me is TRUE on all %d rows — §5a's assumption holds." % len(present))
else:
    t = sum(1 for v in present if v is True)
    f = len(present) - t
    print("note  is_from_me is MIXED here: %d true, %d false." % (t, f))
    print("      That is NOT what §5a assumed. If the false rows are messages you")
    print("      sent from a different device, this field may be usable as-is.")
    print("      Report these counts back before building.")

print("")
print("  Fields that might tell the two sides apart better than a text marker:")
for key, seen_n, _ in single_valued:
    print("      %-14s present on %d/%d rows, 1 value only (cannot discriminate)"
          % (key, seen_n, n))
for key, seen_n, distinct in discriminators:
    print("    * %-14s present on %d/%d rows, %d DISTINCT values  <- worth a look"
          % (key, seen_n, n, distinct))
if not discriminators and not single_valued:
    print("      none of the usual candidates are present at all.")
elif not discriminators:
    print("      none with more than one distinct value.")

# --- one verdict, accounting for both scans ----------------------------------
print("")
if discriminators:
    print("  VERDICT: do NOT build §5a as written yet.")
    print("  A field with more than one distinct value across a self-chat is very")
    print("  likely the two devices (phone vs. linked Mac). If it is, it beats the")
    print("  `[V] ` marker outright — it cannot be typed by accident and cannot be")
    print("  stripped from a message. Report the field NAME and the COUNTS above")
    print("  (not the values) and §5a gets simpler, not harder.")
elif present and all(v is True for v in present):
    print("  VERDICT: build §5a as written.")
    print("  is_from_me cannot discriminate, and no candidate field can either, so")
    print("  the `[V] ` marker is doing real work — it is not belt-and-braces. The")
    print("  per-poll cap, the daily ceiling and the monotonic cursor are what stand")
    print("  behind it if it ever fails.")
else:
    print("  VERDICT: report before building. What came back does not match what")
    print("  §5a assumed, and guessing here costs messages on your personal number.")

# --- the cursor --------------------------------------------------------------
def pk_of(r):
    for k in ("pk", "id", "rowid", "message_id", "_id"):
        v = r.get(k)
        if isinstance(v, int):
            return v
    return None

pks = [p for p in (pk_of(r) for r in rows if isinstance(r, dict)) if p is not None]
ts = [r.get("timestamp") or r.get("ts") or r.get("time") or r.get("date")
      for r in rows if isinstance(r, dict)]
ts = [t for t in ts if t]

max_pk = max(pks) if pks else None
newest_ts = max(ts) if ts and all(isinstance(t, str) for t in ts) else None

print("")
print("4. the seed document")
if max_pk is None:
    print("note  no integer primary key on these rows, so lastSeenPk cannot be set.")
    print("      Keys present: %s" % sorted({k for r in rows if isinstance(r, dict) for k in r}))
    print("      §5a's `pk > lastSeenPk` guard needs one. Report the key list.")
    max_pk = "<NO INTEGER PK FOUND — see note above>"

import datetime
now = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
today = now[:10]

seed = {
    "v": {
        "chatName": chat_name,
        "allowFrom": chat_name,
        "selfChat": True,
        "lastSeenTime": newest_ts or now,
        "lastSeenPk": max_pk,
        "pending": [],
        "recentOutbound": [],
        "sentToday": {"date": today, "count": 0},
    }
}
print("")
print("  Paste this as the whatsappInboxState document (collection `state`):")
print("")
for line in json.dumps(seed, indent=2).splitlines():
    print("    " + line)
print("")
print("  lastSeenPk is set PAST every message already in the thread, so the task's")
print("  first run answers only what you send after seeding — not your history.")
PY

hdr "Next"
say "  - All is_from_me true, no better field  -> build §5a as written."
say "  - A field with 2 distinct values        -> report its NAME + counts; §5a simplifies."
say "  - Anything unexpected                   -> report it before building. Nothing"
say "                                             here has ever run on a Mac."
say ""
say "  ${DIM}Then runbook C4b (round trip) and C5 (seed + create the task disabled).${RST}"
