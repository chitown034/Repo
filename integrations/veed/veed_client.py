#!/usr/bin/env python3
"""veed_client.py — thin, read-the-docs-first client for the VEED API (api.veed.io). Stdlib only.

What is known (from VEED's public pages, 2026-11-01; the docs host api.veed.io/docs is NOT reachable from the cloud
sandbox, so every path below is "as documented by VEED's launch posts" until a live call on the Mac confirms it):
  * one workspace API key, sent as a bearer token:  Authorization: Bearer <VEED_API_KEY>
  * asynchronous jobs: POST an endpoint (e.g. /v1/fabric-1.0 for a talking-head video), read data.job_id,
    poll the job endpoint until status COMPLETED, then download the output URL
  * Lipsync / Fabric are also published on fal.ai (FAL_KEY) — a different key and a different host; not used here.

    python3 veed_client.py whoami --dry-run                 print the request that would be sent
    python3 veed_client.py fabric --image photo.png --audio voice.mp3 --dry-run
    python3 veed_client.py job <job_id>                      poll one job (needs VEED_API_KEY)

Key: VEED_API_KEY in the environment or ~/.config/veed/.env (chmod 600). Never in the repo, a prompt or a dashboard.
Spend: every generation call costs credits on Steven's VEED plan — a run without --dry-run is a HALT item until he says so.
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

BASE = os.environ.get("VEED_API_BASE", "https://api.veed.io")
ENV_FILE = Path(os.path.expanduser("~/.config/veed/.env"))


def load_key() -> str | None:
    key = os.environ.get("VEED_API_KEY")
    if key:
        return key.strip()
    if ENV_FILE.exists():
        for ln in ENV_FILE.read_text(encoding="utf-8").splitlines():
            if ln.startswith("VEED_API_KEY="):
                return ln.split("=", 1)[1].strip().strip('"').strip("'") or None
    return None


def build_request(method: str, path: str, body: dict | None, key: str | None) -> dict:
    """The exact request, as data — so a --dry-run can print it and a test can assert it without touching the network."""
    headers = {"Accept": "application/json", "User-Agent": "second-brain-veed-client/0.1"}
    if key:
        headers["Authorization"] = f"Bearer {key}"
    if body is not None:
        headers["Content-Type"] = "application/json"
    return {"method": method, "url": BASE.rstrip("/") + path, "headers": headers, "body": body}


def redacted(req: dict) -> dict:
    out = json.loads(json.dumps(req))
    if "Authorization" in out["headers"]:
        out["headers"]["Authorization"] = "Bearer ****"
    return out


def send(req: dict, timeout: int = 60) -> tuple[int, dict | str]:
    data = json.dumps(req["body"]).encode() if req["body"] is not None else None
    r = urllib.request.Request(req["url"], data=data, method=req["method"], headers=req["headers"])
    try:
        with urllib.request.urlopen(r, timeout=timeout) as resp:  # noqa: S310 — https only, host pinned above
            text = resp.read().decode("utf-8", "replace")
            code = resp.status
    except urllib.error.HTTPError as e:
        text = e.read().decode("utf-8", "replace")
        code = e.code
    try:
        return code, json.loads(text)
    except ValueError:
        return code, text


def fabric_body(image_url: str, audio_url: str, resolution: str = "720p") -> dict:
    """Fabric 1.0 (talking video from one image + one audio clip). Field names follow VEED's launch example;
    confirm against api.veed.io/docs before the first paid call."""
    return {"image_url": image_url, "audio_url": audio_url, "resolution": resolution}


def poll_job(job_id: str, key: str, every: float = 5.0, limit_s: float = 900.0) -> dict | str:
    deadline = time.time() + limit_s
    while True:
        code, payload = send(build_request("GET", f"/v1/jobs/{job_id}", None, key))
        status = (payload.get("data", payload).get("status") if isinstance(payload, dict) else None)
        if code != 200 or status in {"COMPLETED", "FAILED", "CANCELLED"} or time.time() > deadline:
            return payload
        time.sleep(every)


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description="VEED API client (dry-run by default for anything that spends)")
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("whoami", help="GET /v1/me — key check (confirm the path in the docs)")
    f = sub.add_parser("fabric", help="POST /v1/fabric-1.0 — talking video from an image + audio (spends credits)")
    f.add_argument("--image", required=True, help="public URL of the still image")
    f.add_argument("--audio", required=True, help="public URL of the audio clip")
    f.add_argument("--resolution", default="720p")
    j = sub.add_parser("job", help="GET /v1/jobs/<id> — poll a job")
    j.add_argument("job_id")
    for p in (sub.choices["whoami"], f, j):
        p.add_argument("--dry-run", action="store_true", help="print the request and exit (no network, no spend)")
    a = ap.parse_args(argv)
    key = load_key()
    if a.cmd == "whoami":
        req = build_request("GET", "/v1/me", None, key)
    elif a.cmd == "fabric":
        req = build_request("POST", "/v1/fabric-1.0", fabric_body(a.image, a.audio, a.resolution), key)
    else:
        req = build_request("GET", f"/v1/jobs/{a.job_id}", None, key)
    if a.dry_run:
        print(json.dumps(redacted(req), indent=2))
        return 0
    if not key:
        print("VEED_API_KEY not set — create a key in your VEED workspace (API settings) and put it in ~/.config/veed/.env", file=sys.stderr)
        return 2
    if a.cmd == "fabric":
        print("fabric spends credits; this client only runs it with an explicit yes from Steven (HALT). Re-run with --dry-run to see the request.", file=sys.stderr)
        return 3
    code, payload = send(req)
    print(code)
    print(json.dumps(payload, indent=2) if isinstance(payload, dict) else payload)
    return 0 if code == 200 else 1


if __name__ == "__main__":
    sys.exit(main())
