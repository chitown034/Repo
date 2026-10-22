#!/usr/bin/env python3
"""kapso-fetch.py -- read-only Kapso access for the Command Deck card and the Vanessa WhatsApp task. Stdlib only.

Reads the project API key from the macOS Keychain item "kapso" (or KAPSO_API_KEY for tests), talks only to
https://api.kapso.ai/platform/v1 with X-API-Key, and never prints the key, a full phone number or (except in
--inbound, for the runner task that answers) a message body.

  python3 kapso-fetch.py --summary            one line per number plus the conversation counts
  python3 kapso-fetch.py --json               the `whatsappKapso` document ({"v": ...}); the kapso-inbox-sync task
                                              writes it with ArtifactData (this script never writes the deck)
  python3 kapso-fetch.py --inbound --since ISO new inbound messages from the allow-listed sender only (Keychain item
                                              "kapso-allow" or KAPSO_ALLOW_FROM: Steven's own number), as JSON, for
                                              the vanessa-whatsapp-inbox task; anyone else's messages are counted,
                                              never returned
A document is always produced: a bad response or a network error becomes a status that starts with "error".
"""

from __future__ import annotations

import http.client
import json
import os
import re
import subprocess
import sys
import urllib.error
import urllib.request
from datetime import datetime, timezone

HOST = os.environ.get("KAPSO_API_BASE_URL", "https://api.kapso.ai").rstrip("/")
DOC = "whatsappKapso"
DIGIT_RUN = re.compile(r"\d{7,}")
SAFE_ID = re.compile(r"^(?=.*[A-Za-z0-9])[A-Za-z0-9._-]{1,64}$")


def keychain(item: str) -> str:
    try:
        out = subprocess.run(["security", "find-generic-password", "-a", os.environ.get("USER", ""), "-s", item, "-w"],
                             capture_output=True, text=True, timeout=10)
        return out.stdout.strip() if out.returncode == 0 else ""
    except (OSError, subprocess.SubprocessError):
        return ""


def api_key() -> str:
    return os.environ.get("KAPSO_API_KEY", "").strip() or keychain("kapso")


def allow_from() -> str:
    return digits(os.environ.get("KAPSO_ALLOW_FROM", "").strip() or keychain("kapso-allow"))


def digits(s) -> str:
    return "".join(c for c in str(s or "") if c.isdigit())


def get(path: str, key: str, opener=None):
    if not HOST.startswith("https://"):
        raise RuntimeError("refusing a non-HTTPS API host")
    req = urllib.request.Request(HOST + "/platform/v1" + path, headers={"X-API-Key": key, "Accept": "application/json"})
    f = (opener or urllib.request.urlopen)(req, timeout=20)
    body = json.loads(f.read(2_000_000).decode("utf-8"))
    data = body.get("data", body) if isinstance(body, dict) else body
    return data if isinstance(data, list) else []


def mask(number) -> str:
    d = digits(number)
    return ("…" + d[-4:]) if len(d) >= 4 else "…"


def label(conv: dict) -> str:
    """A contact label with no PII beyond the sender's own profile first name; any digit run is masked, never shown."""
    number = conv.get("phone_number") or conv.get("contact_phone_number") or conv.get("from") or ""
    name = str(conv.get("contact_name") or conv.get("profile_name") or conv.get("name") or "").strip()
    if not name or len(digits(name)) >= 7 or (digits(name) and digits(name) == digits(number)):
        return mask(number or name)
    return name.split()[0][:40]


def safe_int(v) -> int:
    try:
        return int(str(v).strip()) if str(v).strip().isdigit() else 0
    except (TypeError, ValueError):
        return 0


def scrub(msg: str, key: str) -> str:
    msg = str(msg)
    if key:
        msg = msg.replace(key, "<key>")
    return msg[:120]


def number_row(n: dict) -> dict:
    raw = n.get("phone_number") or n.get("display_phone_number") or n.get("number") or ""
    kind_text = " ".join(str(n.get(k, "")) for k in ("type", "kind", "number_type")).lower()
    kind = "sandbox" if n.get("sandbox") is True or "sandbox" in kind_text else "business"
    c = n.get("connected")
    if isinstance(c, bool):
        connected = c
    else:
        connected = str(n.get("status", "")).lower() in ("connected", "active", "verified")
    return {"label": str(n.get("display_name") or n.get("verified_name") or kind)[:60], "masked": mask(raw), "kind": kind, "connected": connected}


def build(key: str, opener=None, now: str | None = None) -> dict:
    now = now or datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    doc = {"status": "not configured", "numbers": [], "conversations": [], "counts": {"active": 0, "unread": 0},
           "syncedAt": now, "via": "integrations/kapso/kapso-fetch.py (read-only; no message text)"}
    if not key:
        doc["status"] = "not configured — no Keychain item 'kapso'"
        return doc
    try:
        nums = get("/whatsapp/phone_numbers", key, opener)
        convs = get("/whatsapp/conversations?status=active&limit=25", key, opener)
    except urllib.error.HTTPError as e:
        doc["status"] = f"error — HTTP {e.code} from Kapso (check the key and the project)"
        return doc
    except (urllib.error.URLError, OSError, ValueError, RuntimeError, http.client.HTTPException) as e:
        doc["status"] = "error — " + scrub(e, key)
        return doc
    doc["numbers"] = [number_row(n) for n in nums if isinstance(n, dict)]
    for c in convs:
        if not isinstance(c, dict):
            continue
        doc["conversations"].append({"contact": label(c), "lastAt": str(c.get("last_message_at") or c.get("updated_at") or "")[:19],
                                     "lastDirection": str(c.get("last_message_direction") or c.get("direction") or "")[:12],
                                     "unread": safe_int(c.get("unread_count", c.get("unread", 0)))})
    doc["conversations"].sort(key=lambda x: x["lastAt"], reverse=True)
    doc["counts"] = {"active": len(doc["conversations"]), "unread": sum(x["unread"] for x in doc["conversations"])}
    live = [n for n in doc["numbers"] if n["connected"]]
    if not live:
        doc["status"] = "no number connected yet"
    else:
        doc["status"] = "sandbox" if all(n["kind"] == "sandbox" for n in live) else "connected"
    return doc


def iso(ts) -> str:
    """Kapso/Meta timestamps as ISO seconds; an epoch-seconds string is converted so comparisons hold either way."""
    s = str(ts or "").strip()
    if s.isdigit() and len(s) >= 9:
        n = int(s) // 1000 if len(s) >= 13 else int(s)
        try:
            return datetime.fromtimestamp(n, timezone.utc).strftime("%Y-%m-%dT%H:%M:%S")
        except (OverflowError, OSError, ValueError):
            return ""
    return s[:19]


def inbound(key: str, since: str, allow: str, opener=None, now: str | None = None) -> dict:
    """New inbound messages from the allow-listed sender since `since` (ISO). Others are counted, never returned.
    An empty `since` means now: the first run answers nothing older than itself (spec §5c)."""
    since = iso(since) or (now or datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S"))
    out = {"status": "ok", "since": since, "messages": [], "ignored": 0}
    if not key:
        out["status"] = "error — no API key"; return out
    if not allow or len(allow) < 7:
        out["status"] = "error — no allow-listed sender (Keychain item 'kapso-allow' or KAPSO_ALLOW_FROM)"; return out
    try:
        msgs = get("/whatsapp/messages?direction=inbound&limit=50", key, opener)
    except urllib.error.HTTPError as e:
        out["status"] = f"error — HTTP {e.code}"; return out
    except (urllib.error.URLError, OSError, ValueError, RuntimeError, http.client.HTTPException) as e:
        out["status"] = "error — " + scrub(e, key); return out
    for m in msgs:
        if not isinstance(m, dict):
            continue
        if str(m.get("direction") or "inbound").lower() != "inbound" or m.get("from_me") is True:
            continue
        at = iso(m.get("timestamp") or m.get("created_at") or m.get("sent_at"))
        if not at or at <= since:
            continue
        sender = digits(m.get("from") or m.get("phone_number") or m.get("sender") or "")
        if sender != allow:
            out["ignored"] += 1
            continue
        t = m.get("text")
        text = (t.get("body") or "") if isinstance(t, dict) else (t or m.get("body") or m.get("content") or "")
        text = str(text).strip()
        if not text:
            continue
        out["messages"].append({"id": str(m.get("id") or m.get("wamid") or "")[:80], "at": at, "text": str(text)[:4000],
                                "phone_number_id": str(m.get("phone_number_id") or "")[:40]})
    out["messages"].sort(key=lambda x: x["at"])
    return out


def main(argv: list[str]) -> int:
    mode = argv[1] if len(argv) > 1 else "--summary"
    key = api_key()
    if mode == "--inbound":
        since = argv[argv.index("--since") + 1] if "--since" in argv and argv.index("--since") + 1 < len(argv) else ""
        res = inbound(key, since, allow_from())
        print(json.dumps(res, ensure_ascii=False))
        return 0 if res["status"] == "ok" else 1
    doc = build(key)
    if mode == "--json":
        print(json.dumps({"v": doc}, ensure_ascii=False))
    else:
        print(f"  kapso: {doc['status']}")
        for n in doc["numbers"]:
            print(f"  number: {n['label']} {n['masked']} ({n['kind']}, {'connected' if n['connected'] else 'not connected'})")
        print(f"  conversations: {doc['counts']['active']} active, {doc['counts']['unread']} unread")
    return 0 if not doc["status"].startswith("error") else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv))
