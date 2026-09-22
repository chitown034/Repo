"""HTTP backend for Lofty's Open API. GET only.

There is no other HTTP method in this package — a test greps for one — so the
harness cannot create, update or delete anything in Lofty by construction.

Facts used (from the lofty-crm-sync skill, confirmed 2026-09-22 against
developer.lofty.com): base ``https://api.lofty.com/v1.0``; API-key auth as the
header ``Authorization: token <key>``; ``GET /v1.0/me`` confirms a key works;
``GET /v1.0/leads`` lists leads; ``GET /v1.0/leads/{id}/activities`` is a lead's
activity timeline.

The key is read from ``~/.config/lofty/.env`` as ``LOFTY_API_KEY`` (the only
sanctioned location, CONNECTIONS.md rule 5), with the ``LOFTY_API_KEY``
environment variable as the cloud fallback the skill documents. It is never
printed, logged or echoed inside an error message.
"""

from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path
from typing import Mapping, Optional

import requests

BASE_URL = "https://api.lofty.com/v1.0"
ENV_FILE = "~/.config/lofty/.env"
ENV_FILE_VAR = "LOFTY_ENV_FILE"          # override the file location (tests, odd layouts)
KEY_VAR = "LOFTY_API_KEY"
BASE_URL_VAR = "LOFTY_API_URL"
TIMEOUT_SECONDS = 30
USER_AGENT = "cli-anything-lofty/0.1 (read-only; GET only)"
NOT_CONFIGURED_EXIT = 5

KEY_HELP = (f"put it in {ENV_FILE} on the Mac as {KEY_VAR}=<key> "
            "(Lofty → Settings → Integrations → API generates one)")


class LoftyError(RuntimeError):
    kind = "lofty_error"

    def __init__(self, message: str, http_status: Optional[int] = None):
        super().__init__(message)
        self.http_status = http_status

    def as_dict(self) -> dict:
        return {"error": str(self), "type": self.kind, "httpStatus": self.http_status}


class NotConfigured(LoftyError):
    kind = "not_configured"


class AuthError(LoftyError):
    kind = "auth_error"


class NotFound(LoftyError):
    kind = "not_found"


class RateLimited(LoftyError):
    kind = "rate_limited"


class UpstreamError(LoftyError):
    kind = "upstream_error"


class TransportError(LoftyError):
    kind = "transport_error"


@dataclass(frozen=True)
class Config:
    api_key: str
    base_url: str
    source: str            # where the key came from — a file path or the variable name, never the value

    def redact(self, text: str) -> str:
        return text.replace(self.api_key, "[redacted]") if self.api_key and text else text


def env_file(env: Optional[Mapping[str, str]] = None) -> Path:
    env = os.environ if env is None else env
    return Path(env.get(ENV_FILE_VAR) or ENV_FILE).expanduser()


def read_env_file(path: Path) -> dict[str, str]:
    """Parse KEY=VALUE lines. Comments, blanks, ``export`` and quotes tolerated."""
    values: dict[str, str] = {}
    try:
        text = path.read_text(encoding="utf-8")
    except OSError:
        return values
    for line in text.splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        if line.startswith("export "):
            line = line[len("export "):].strip()
        k, v = line.split("=", 1)
        v = v.strip()
        if len(v) >= 2 and v[0] == v[-1] and v[0] in "\"'":
            v = v[1:-1]
        values[k.strip()] = v
    return values


def load_config(env: Optional[Mapping[str, str]] = None) -> Config:
    """The key from the env file, else the environment. Missing or empty →
    ``NotConfigured`` naming the variable. Never a stack trace, never a value."""
    env = os.environ if env is None else env
    f = env_file(env)
    values = read_env_file(f) if f.exists() else {}
    key = (values.get(KEY_VAR) or "").strip()
    source = str(f)
    if not key:
        key = (env.get(KEY_VAR) or "").strip()
        source = f"environment variable {KEY_VAR}"
    if not key:
        where = "is empty in" if f.exists() and KEY_VAR in values else "is not set —"
        raise NotConfigured(
            f"not configured: {KEY_VAR} {where} {f}; {KEY_HELP}. Nothing was fetched.")
    base = (values.get(BASE_URL_VAR) or env.get(BASE_URL_VAR) or BASE_URL).rstrip("/")
    return Config(api_key=key, base_url=base, source=source)


def config_status(env: Optional[Mapping[str, str]] = None) -> dict:
    """Offline: is the key configured, by name only. Never prints a value."""
    env = os.environ if env is None else env
    f = env_file(env)
    exists = f.exists()
    values = read_env_file(f) if exists else {}
    in_file = bool((values.get(KEY_VAR) or "").strip())
    in_env = bool((env.get(KEY_VAR) or "").strip())
    return {
        "envFile": str(f), "envFileExists": exists,
        "keyVariable": KEY_VAR, "keyInFile": in_file, "keyInEnvironment": in_env,
        "configured": in_file or in_env,
        "baseUrl": (values.get(BASE_URL_VAR) or env.get(BASE_URL_VAR) or BASE_URL),
        "primaryPath": "lofty-bridge MCP on the Mac (read-only); this CLI is the secondary, CLI-Anything-shaped front to the same API",
    }


def get(cfg: Config, path: str, params: Optional[dict] = None):
    """One GET. Returns the decoded JSON body or raises a ``LoftyError``.
    Never retries — a 429 is reported, not looped into."""
    url = f"{cfg.base_url}/{path.lstrip('/')}"
    headers = {
        "Authorization": f"token {cfg.api_key}",
        "Accept": "application/json",
        "User-Agent": USER_AGENT,
    }
    try:
        resp = requests.get(url, headers=headers, params=params or None, timeout=TIMEOUT_SECONDS)
    except requests.RequestException as e:
        raise TransportError(cfg.redact(f"GET {path}: {type(e).__name__}: {e}")) from None
    return _handle(cfg, resp, path)


def _handle(cfg: Config, resp, path: str):
    status = int(getattr(resp, "status_code", 0) or 0)
    snippet = cfg.redact((getattr(resp, "text", "") or "")[:300]).replace("\n", " ")
    if 200 <= status < 300:
        if status == 204 or not (getattr(resp, "text", "") or "").strip():
            return {}
        try:
            return resp.json()
        except ValueError:
            raise UpstreamError(f"GET {path}: HTTP {status} but the body is not JSON: {snippet}", status) from None
    if status in (401, 403):
        raise AuthError(
            f"Lofty rejected the API key (HTTP {status}) on GET {path}: {snippet}. "
            f"Generate a new key in Lofty → Settings → Integrations → API and {KEY_HELP}. "
            "Nothing else was tried.", status)
    if status == 404:
        raise NotFound(f"GET {path}: not found (HTTP 404): {snippet}", status)
    if status == 429:
        raise RateLimited(
            f"GET {path}: rate limited (HTTP 429). Not retried — wait and run again: {snippet}", status)
    if status >= 500:
        raise UpstreamError(f"GET {path}: Lofty server error (HTTP {status}): {snippet}", status)
    raise UpstreamError(f"GET {path}: unexpected HTTP {status}: {snippet}", status)
