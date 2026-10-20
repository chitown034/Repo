#!/usr/bin/env python3
"""kapso-send.py -- send ONE WhatsApp text through Kapso's Meta proxy, to the allow-listed number only. Stdlib only.

  python3 kapso-send.py --text - [--phone-number-id <id>] [--to <number>]   <<'EOF' ... EOF   (reply on stdin)
  python3 kapso-send.py --text "<message>" ...                                 (short text on the command line)

The recipient is always the allow-listed number (Keychain item "kapso-allow" or KAPSO_ALLOW_FROM — Steven's own
number in Phase 1). --to is optional; when given, its digits must equal that number or the send is refused before any
network call. The reply text should come on stdin (`--text -`) so dollar signs, quotes and backticks reach WhatsApp
unchanged and nothing in a reply can ever run in a shell. That is the HALT line in code: a client send
is impossible through this script. The sending number is --phone-number-id, else KAPSO_PHONE_NUMBER_ID, else the
first connected number on the project (sandbox first), looked up from the platform API. Prints {"status": "sent", "id": "<wamid>"} or an error; never the key.
"""

from __future__ import annotations

import http.client
import json
import os
import sys
import urllib.error
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import importlib.util

_spec = importlib.util.spec_from_file_location("kf", os.path.join(HERE, "kapso-fetch.py"))
kf = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(kf)

GRAPH = os.environ.get("META_GRAPH_VERSION", "v24.0")


def first_connected_number_id(key: str, opener=None) -> str:
    """The sending number when none is given: the first connected number on the project (sandbox first)."""
    try:
        nums = [n for n in kf.get("/whatsapp/phone_numbers", key, opener) if isinstance(n, dict)]
    except Exception:  # noqa: BLE001 - any failure means "no number"; the caller reports it
        return ""
    rows = [(kf.number_row(n), n) for n in nums]
    rows.sort(key=lambda r: 0 if r[0]["kind"] == "sandbox" else 1)
    for row, n in rows:
        if row["connected"]:
            pid = str(n.get("phone_number_id") or n.get("id") or "")
            if kf.SAFE_ID.match(pid):
                return pid
    return ""


def send(key: str, allow: str, to: str, text: str, phone_number_id: str, opener=None) -> dict:
    if not key:
        return {"status": "error — no API key"}
    if not allow or len(allow) < 7:
        return {"status": "error — no allow-listed recipient (Keychain item 'kapso-allow' or KAPSO_ALLOW_FROM)"}
    if to and kf.digits(to) != allow:
        return {"status": "refused — recipient is not the allow-listed number (Phase 1: Steven only; a client send is a Needs-Steven packet)"}
    if not text or not text.strip():
        return {"status": "error — empty message"}
    if not kf.HOST.startswith("https://"):
        return {"status": "error — refusing a non-HTTPS API host"}
    phone_number_id = phone_number_id or first_connected_number_id(key, opener)
    if not phone_number_id:
        return {"status": "error — no sending number (no connected number on the project; or set KAPSO_PHONE_NUMBER_ID / --phone-number-id)"}
    if not kf.SAFE_ID.match(phone_number_id) or not kf.SAFE_ID.match(GRAPH):
        return {"status": "error — refusing an unsafe phone-number id or graph version"}
    payload = {"messaging_product": "whatsapp", "to": allow, "type": "text", "text": {"body": text[:4000]}}
    req = urllib.request.Request(f"{kf.HOST}/meta/whatsapp/{GRAPH}/{phone_number_id}/messages", data=json.dumps(payload).encode("utf-8"),
                                 headers={"X-API-Key": key, "Content-Type": "application/json", "Accept": "application/json"}, method="POST")
    try:
        f = (opener or urllib.request.urlopen)(req, timeout=20)
        body = json.loads(f.read(200_000).decode("utf-8"))
    except urllib.error.HTTPError as e:
        return {"status": f"error — HTTP {e.code} from Kapso"}
    except (urllib.error.URLError, OSError, ValueError, http.client.HTTPException) as e:
        return {"status": "error — " + kf.scrub(e, key)}
    ids = body.get("messages") if isinstance(body, dict) else None
    wamid = ids[0].get("id", "") if isinstance(ids, list) and ids and isinstance(ids[0], dict) else ""
    return {"status": "sent", "id": str(wamid)[:80], "to": kf.mask(allow)}


def main(argv: list[str]) -> int:
    args = dict(zip(argv[1::2], argv[2::2]))
    to, text = args.get("--to", ""), args.get("--text", "")
    if text == "-":
        text = sys.stdin.read()
    pnid = args.get("--phone-number-id") or os.environ.get("KAPSO_PHONE_NUMBER_ID", "")
    res = send(kf.api_key(), kf.allow_from(), to, text, pnid)
    print(json.dumps(res, ensure_ascii=False))
    return 0 if res["status"] == "sent" else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv))
