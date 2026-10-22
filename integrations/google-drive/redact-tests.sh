#!/usr/bin/env bash
# Offline test of the Drive screen on a synthetic export (no real data).
set -u; D="$(mktemp -d)"; R="$(cd "$(dirname "$0")/../.." && pwd)"
cat > "$D/x.md" <<'X'
\# Second Brain index
Synced 2026-09-22T04:21:50+00:00 · 3 rows

\#\# Keep me
Reference · Inbox · ops
Call 555-123-4567 or mail a@b.com, id 123456789. https://app.notion.com/p/Keep-3e3c1760a74981059ea6ec4d2b61aad5

\#\# Drop by tag
Idea · Inbox · personal, ops
private

\#\# Drop by words
Reference · Inbox · ops
The borrower said hi.
X
OUT="$(python3 -I "$R/integrations/google-drive/redact_export.py" "$D/x.md" "$D/o.md")"; F=0
echo "$OUT" | grep -q "kept 1 · dropped for tag 1 · dropped for wording 1" || { echo "FAIL counts"; F=1; }
grep -q "\[phone\]" "$D/o.md" && grep -q "\[email\]" "$D/o.md" && grep -q "\[number\]" "$D/o.md" || { echo "FAIL masks"; F=1; }
grep -q "3e3c1760a74981059ea6ec4d2b61aad5" "$D/o.md" || { echo "FAIL link kept"; F=1; }
grep -q "private\|borrower\|555-123" "$D/o.md" && { echo "FAIL leak"; F=1; }
echo "$OUT" | grep -q "555\|a@b" && { echo "FAIL screen printed a value"; F=1; }
rm -rf "$D"; [ $F = 0 ] && echo "redact-tests: all passed"; exit $F
