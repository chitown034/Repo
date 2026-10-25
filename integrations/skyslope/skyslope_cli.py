#!/usr/bin/env python3
"""skyslope_cli.py — read-only SkySlope (api.skyslope.com) for the Transaction desk. Stdlib only, GET only.

AUTH (from SkySlope's own example, github.com/skyslope/example-authentication/getAuth.js, read 2026-10-24):
    POST https://api.skyslope.com/auth/login
      headers: Authorization: "ss <AccessKey>:<base64(HMAC-SHA256(key=AccessSecret, msg="<ClientId>:<ClientSecret>:<Timestamp>"))>"
               Timestamp: <UTC, RFC3339 seconds, e.g. 2026-10-24T01:02:03Z>   Content-Type: application/json
      body:    {"ClientId": ..., "ClientSecret": ...}
    -> a Session ticket, valid about two hours, sent on every later request as the `Session` header.
  Two credential pairs: ClientId/ClientSecret (issued by SkySlope to the integration or brokerage) and
  AccessKey/AccessSecret (per user: My Account -> Integrations -> Generate New Key; the secret shows once).

ENDPOINTS (SkySlope API BETA docs, api.skyslope.com/api/docs): GET /api/users/me · GET /api/files?page=&pageSize=&status=&modifiedAfter=
  · GET /api/files/{fileId} · GET /api/files/{fileId}/documents · GET /api/checklistTypes. 100 requests/minute.

KEYS live only in ~/.config/skyslope/.env (mode 600) as SKYSLOPE_CLIENT_ID, SKYSLOPE_CLIENT_SECRET, SKYSLOPE_ACCESS_KEY,
SKYSLOPE_ACCESS_SECRET (scripts/fix-mine.sh asks for them hidden). Nothing here prints, logs or echoes a key or the session ticket.

HALT: this tool never writes to SkySlope (no POST but the login, no PUT/PATCH/DELETE — a test greps for them). Transaction data is
client data: it may be shown to Steven in his own terminal; it never goes into the brain, the wiki, a report or a message.

    skyslope_cli.py check                      # config present? (names only)
    skyslope_cli.py me [--json]
    skyslope_cli.py files [--status active,closed] [--modified-after 2026-10-01] [--page 1] [--page-size 25] [--json] [--full]
    skyslope_cli.py file <fileId> [--json]      skyslope_cli.py documents <fileId> [--json]
Exit: 0 ok · 2 usage · 5 not configured · 6 auth refused · 7 http error
"""
from __future__ import annotations

import argparse
import base64
import datetime as dt
import hashlib
import hmac
import http.client
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

BASE = os.environ.get("SKYSLOPE_API_URL", "https://api.skyslope.com")
ENV_FILE = Path(os.environ.get("SKYSLOPE_ENV_FILE", "~/.config/skyslope/.env")).expanduser()
VARS = ("SKYSLOPE_CLIENT_ID", "SKYSLOPE_CLIENT_SECRET", "SKYSLOPE_ACCESS_KEY", "SKYSLOPE_ACCESS_SECRET")
TIMEOUT = 30
UA = "second-brain-skyslope/0.1 (read-only)"


class SkySlopeError(RuntimeError):
    def __init__(self, msg: str, code: int = 7):
        super().__init__(msg); self.code = code


def load_config() -> dict:
    """Env vars first, then the key file. Values never leave this process except in the signed request."""
    cfg = {k: os.environ.get(k, "") for k in VARS}
    if ENV_FILE.is_file():
        for line in ENV_FILE.read_text(encoding="utf-8").splitlines():
            if "=" in line and not line.lstrip().startswith("#"):
                k, v = line.split("=", 1); k, v = k.strip(), v.strip().strip('"').strip("'")
                if k in VARS and not cfg[k]:
                    cfg[k] = v
    return cfg


def missing(cfg: dict) -> list[str]:
    return [k for k in VARS if not cfg.get(k)]


def timestamp_utc(now: dt.datetime | None = None) -> str:
    now = now or dt.datetime.now(dt.timezone.utc)
    return now.astimezone(dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def auth_header(client_id: str, client_secret: str, access_key: str, access_secret: str, ts: str) -> str:
    """Exactly SkySlope's getAuth.js: HMAC-SHA256(key=access secret, msg='clientId:clientSecret:timestamp'), base64, 'ss key:hmac'."""
    digest = hmac.new(access_secret.encode("utf-8"), f"{client_id}:{client_secret}:{ts}".encode("utf-8"), hashlib.sha256).digest()
    return "ss " + access_key + ":" + base64.b64encode(digest).decode("ascii")


class _NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):   # never carry the Session header to another host
        raise SkySlopeError(f"refused: SkySlope redirected to {urllib.parse.urlsplit(newurl).netloc or '?'} (HTTP {code})", 7)


_OPENER = urllib.request.build_opener(_NoRedirect)


def _request(method: str, url: str, headers: dict, body: bytes | None = None) -> tuple[int, dict | list | str]:
    if method not in ("GET", "POST"):                       # POST is used for /auth/login only; see login()
        raise SkySlopeError("refused: only GET (and the login POST) are allowed", 2)
    if not url.startswith("https://"):
        raise SkySlopeError("refused: SkySlope is https only", 2)
    req = urllib.request.Request(url, data=body, method=method, headers={"User-Agent": UA, "Accept": "application/json", **headers})
    try:
        with _OPENER.open(req, timeout=TIMEOUT) as r:  # noqa: S310 — https to SkySlope only
            raw = r.read().decode("utf-8", "replace"); status = r.status
    except urllib.error.HTTPError as e:
        raw = e.read().decode("utf-8", "replace") if e.fp else ""; status = e.code
    except urllib.error.URLError as e:
        raise SkySlopeError(f"network: {e.reason}", 7) from None
    except (OSError, http.client.HTTPException) as e:       # a stall after the request is sent, or a dropped connection
        raise SkySlopeError(f"network: {type(e).__name__}", 7) from None
    try:
        data = json.loads(raw) if raw.strip() else {}
    except ValueError:
        data = raw[:200]
    return status, data


def login(cfg: dict, now: dt.datetime | None = None) -> str:
    """Return the Session ticket. Never returns or prints the secrets; the ticket is kept in memory only."""
    miss = missing(cfg)
    if miss:
        raise SkySlopeError("not configured: missing " + ", ".join(miss) + f" in {ENV_FILE} (run scripts/fix-mine.sh)", 5)
    ts = timestamp_utc(now)
    headers = {"Authorization": auth_header(cfg["SKYSLOPE_CLIENT_ID"], cfg["SKYSLOPE_CLIENT_SECRET"], cfg["SKYSLOPE_ACCESS_KEY"], cfg["SKYSLOPE_ACCESS_SECRET"], ts),
               "Timestamp": ts, "Content-Type": "application/json"}
    body = json.dumps({"ClientId": cfg["SKYSLOPE_CLIENT_ID"], "ClientSecret": cfg["SKYSLOPE_CLIENT_SECRET"]}).encode("utf-8")
    status, data = _request("POST", BASE + "/auth/login", headers, body)
    if status in (401, 403):
        raise SkySlopeError(f"SkySlope refused the credentials (HTTP {status}) — check all four values; the ClientId/ClientSecret pair comes from SkySlope, not from My Account", 6)
    if status >= 400:
        raise SkySlopeError(f"login failed (HTTP {status})", 7)
    ticket = ""
    if isinstance(data, dict):
        ticket = str(data.get("Session") or data.get("session") or data.get("sessionId") or data.get("SessionId") or "")
        if not ticket and isinstance(data.get("data"), dict):
            ticket = str(data["data"].get("Session") or data["data"].get("session") or "")
    if not ticket:
        raise SkySlopeError("login returned no Session ticket (keys: " + ", ".join(sorted(data)) [:120] + ")" if isinstance(data, dict) else "login returned no Session ticket", 7)
    return ticket


def get(path: str, session: str, params: dict | None = None):
    url = BASE + path + ("?" + urllib.parse.urlencode({k: v for k, v in (params or {}).items() if v not in (None, "")}) if params else "")
    status, data = _request("GET", url, {"Session": session})
    if status in (401, 403):
        raise SkySlopeError(f"SkySlope refused the request (HTTP {status}); the session may have expired — rerun", 6)
    if status == 404:
        raise SkySlopeError("not found", 7)
    if status >= 400:
        raise SkySlopeError(f"HTTP {status}", 7)
    return data


# ---- presentation: the desk needs dates and status, not a client's full record on screen by default ---------------------
def summarize_file(f: dict) -> dict:
    addr = f.get("property") or f.get("Property") or {}
    if not isinstance(addr, dict):
        addr = {}
    street = addr.get("streetNumber", "") and f"{addr.get('streetNumber', '')} {addr.get('streetName', '') or addr.get('street', '')}".strip() or str(addr.get("address") or addr.get("street") or f.get("address") or "")
    out = {"fileId": f.get("id") or f.get("fileId") or f.get("Id"), "type": f.get("objectType") or f.get("type") or f.get("fileType"),
           "status": f.get("status") or f.get("Status"), "street": street, "city": addr.get("city") or addr.get("City")}
    for k in ("acceptanceDate", "contractDate", "closingDate", "escrowClosingDate", "listDate", "expirationDate", "modifiedDate", "modified", "updatedAt", "createdDate"):
        if f.get(k):
            out[k] = f[k]
    return {k: v for k, v in out.items() if v not in (None, "")}


def main(argv: list[str] | None = None) -> int:
    common = argparse.ArgumentParser(add_help=False)   # --json / --full accepted before or after the subcommand
    common.add_argument("--json", action="store_true", default=argparse.SUPPRESS)
    common.add_argument("--full", action="store_true", default=argparse.SUPPRESS, help="raw records (client data) instead of the summary")
    ap = argparse.ArgumentParser(prog="skyslope_cli.py", description="read-only SkySlope", parents=[common])
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("check", parents=[common]); sub.add_parser("me", parents=[common])
    fl = sub.add_parser("files", parents=[common]); fl.add_argument("--status", default=""); fl.add_argument("--modified-after", default=""); fl.add_argument("--page", type=int, default=1); fl.add_argument("--page-size", type=int, default=25)
    sub.add_parser("file", parents=[common]).add_argument("file_id"); sub.add_parser("documents", parents=[common]).add_argument("file_id")
    a = ap.parse_args(argv); a.json = getattr(a, "json", False); a.full = getattr(a, "full", False)
    cfg = load_config()
    if a.cmd == "check":
        miss = missing(cfg)
        print(json.dumps({"configured": not miss, "missing": miss, "file": str(ENV_FILE)}) if a.json else
              ("SkySlope keys: all four present in " + str(ENV_FILE) if not miss else "SkySlope keys missing: " + ", ".join(miss) + f" (file {ENV_FILE})"))
        return 0 if not miss else 5
    try:
        session = login(cfg)
        if a.cmd == "me":
            data = get("/api/users/me", session)
        elif a.cmd == "files":
            data = get("/api/files", session, {"page": a.page, "pageSize": a.page_size, "status": a.status, "modifiedAfter": a.modified_after})
        elif a.cmd == "file":
            data = get(f"/api/files/{urllib.parse.quote(a.file_id)}", session)
        else:
            data = get(f"/api/files/{urllib.parse.quote(a.file_id)}/documents", session)
    except SkySlopeError as e:
        print(json.dumps({"error": str(e), "code": e.code}) if a.json else f"skyslope: {e}", file=sys.stderr)
        return e.code
    if a.cmd == "files" and not a.full:
        items = _rows(data)
        if items is None:
            keys = ", ".join(sorted(data)[:12]) if isinstance(data, dict) else type(data).__name__
            print(json.dumps({"error": "unexpected response shape", "topLevel": keys}) if a.json else f"skyslope: unexpected response shape (top-level: {keys}) — rerun with --full to see it", file=sys.stderr)
            return 7
        rows = [summarize_file(x) for x in items if isinstance(x, dict)]
        if a.json:
            print(json.dumps({"count": len(rows), "files": rows}, indent=1))
        else:
            print(f"{len(rows)} file(s)")
            for r in rows:
                print(f"- {r.get('fileId')} · {r.get('type', '')} · {r.get('status', '')} · {r.get('street', '')}, {r.get('city', '')} · closing {r.get('closingDate') or r.get('escrowClosingDate') or '—'}")
        return 0
    if a.cmd == "file" and not a.full and isinstance(data, dict):
        rec = data.get("value") if isinstance(data.get("value"), dict) else data.get("data") if isinstance(data.get("data"), dict) else data
        data = summarize_file(rec)                           # the summary by default; --full is the client's record
    elif a.cmd == "documents" and not a.full:
        docs = _rows(data) or []
        data = [{k: d.get(k) for k in ("id", "documentId", "formName", "name", "pageCount", "status", "modifiedDate", "updatedAt") if d.get(k) is not None} for d in docs if isinstance(d, dict)]
    elif a.cmd == "me" and not a.full and isinstance(data, dict):
        rec = data.get("value") if isinstance(data.get("value"), dict) else data.get("data") if isinstance(data.get("data"), dict) else data
        data = {k: rec.get(k) for k in ("id", "userId", "firstName", "role", "userType", "officeName", "office", "brokerage") if rec.get(k) is not None}
    print(json.dumps(data, indent=1))
    return 0


def _rows(data) -> list | None:
    """The list inside SkySlope's list responses, one level deep (items/files/data/value), else None."""
    if isinstance(data, list):
        return data
    if not isinstance(data, dict):
        return None
    for k in ("items", "files", "data", "value", "documents", "results"):
        v = data.get(k)
        if isinstance(v, list):
            return v
        if isinstance(v, dict):
            inner = _rows(v)
            if inner is not None:
                return inner
    return None


if __name__ == "__main__":
    sys.exit(main())
