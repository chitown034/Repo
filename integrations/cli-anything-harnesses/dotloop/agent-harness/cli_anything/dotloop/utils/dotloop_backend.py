"""HTTP backend for the dotloop Public API v2. GET only.

No other HTTP method exists in this package — a test greps for one — so the harness cannot
create, update or delete a loop, document or participant by construction. Both OAuth token
exchanges are therefore NOT done here: the one-time authorization-code consent and the repeatable
refresh-token grant are both POSTs by specification (RFC 6749 §4.1 / §6), so they live in
``../../tools/exchange-auth-code.sh`` and ``../../tools/mint-access-token.sh`` outside the pip
package, and this CLI only ever receives a short-lived token through ``DOTLOOP_ACCESS_TOKEN``.
Nothing stores it.

**What is confirmed, and how.** Base URL, the OAuth 2.0 endpoints and the Bearer-token scheme
come from the third-party API profile at github.com/api-evangelist/dotloop, read 2026-09-27.
dotloop's own docs (dotloop.github.io/public-api/) are egress-blocked from this sandbox — the
same restriction already recorded against Redfin, Veterans United, Navy Federal and three builder
sites in ``publicfeeds/PUBLICFEEDS.md``. Nothing here has ever been run against a real dotloop
account: no credential exists in this build, and the exact shape of a live error body is
unconfirmed, so error handling below is generic HTTP-status-based rather than matching a specific
vendor error code (contrast the zoho harness, whose 403 body was re-probed live on 2026-09-22).

Credential file: ``~/.config/dotloop/.env`` (chmod 600) with ``DOTLOOP_AUTH_URL``,
``DOTLOOP_API_URL``, ``DOTLOOP_CLIENT_ID``, ``DOTLOOP_CLIENT_SECRET``, ``DOTLOOP_REFRESH_TOKEN``.
Values are never printed.
"""

from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path
from typing import Mapping, Optional

import requests

DEFAULT_AUTH_URL = "https://auth.dotloop.com"
DEFAULT_API_URL = "https://api-gateway.dotloop.com/public/v2"
ENV_FILE = "~/.config/dotloop/.env"
ENV_FILE_VAR = "DOTLOOP_ENV_FILE"        # override the file location (tests, odd layouts)
FILE_VARS = ("DOTLOOP_AUTH_URL", "DOTLOOP_API_URL", "DOTLOOP_CLIENT_ID",
             "DOTLOOP_CLIENT_SECRET", "DOTLOOP_REFRESH_TOKEN")
TOKEN_VAR = "DOTLOOP_ACCESS_TOKEN"
DOCUMENTED_RATE_LIMIT_PER_MINUTE = 100    # per the third-party API profile; never measured live
TIMEOUT_SECONDS = 30
USER_AGENT = "cli-anything-dotloop/0.1 (read-only; GET only)"
NOT_CONFIGURED_EXIT = 5
FORBIDDEN_EXIT = 4
MINT_SCRIPT = "integrations/cli-anything-harnesses/dotloop/tools/mint-access-token.sh"
EXCHANGE_SCRIPT = "integrations/cli-anything-harnesses/dotloop/tools/exchange-auth-code.sh"
MINT_HELP = (f"mint one (short-lived — dotloop's own docs say roughly 12 hours, never observed "
             f"live) from the refresh token with {MINT_SCRIPT} and export {TOKEN_VAR}=\"$(…)\"")
FORBIDDEN_FIX = (
    "Check the OAuth scopes granted at the one-time consent step (" + EXCHANGE_SCRIPT + "), and "
    "that the authenticated dotloop user actually has access to this profile or loop. This "
    "harness does not name a specific dotloop error code the way cli-anything-zoho names Zoho's "
    "NO_PERMISSION block, because no live 403 from dotloop has ever been observed — read "
    "'details' below for whatever dotloop's own body said."
)


class DotloopError(RuntimeError):
    kind = "dotloop_error"

    def __init__(self, message: str, http_status: Optional[int] = None,
                 fix: Optional[str] = None, details=None):
        super().__init__(message)
        self.http_status = http_status
        self.fix = fix
        self.details = details

    def as_dict(self) -> dict:
        return {"error": str(self), "type": self.kind, "httpStatus": self.http_status,
                "fix": self.fix, "details": self.details}


class NotConfigured(DotloopError):
    kind = "not_configured"


class Forbidden(DotloopError):
    kind = "forbidden"


class AuthError(DotloopError):
    kind = "auth_error"


class NotFound(DotloopError):
    kind = "not_found"


class RateLimited(DotloopError):
    kind = "rate_limited"


class UpstreamError(DotloopError):
    kind = "upstream_error"


class TransportError(DotloopError):
    kind = "transport_error"


@dataclass(frozen=True)
class Config:
    api_url: str
    access_token: str
    env_file: str

    def redact(self, text: str) -> str:
        return text.replace(self.access_token, "[redacted]") if self.access_token and text else text


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
    """The credential file must exist with all five variables; the access token must be in the
    environment. Anything missing → ``NotConfigured`` naming the variable(s). Never a stack
    trace, never a value."""
    env = os.environ if env is None else env
    f = env_file(env)
    if not f.exists():
        raise NotConfigured(
            f"not configured: {f} is missing; it must hold {', '.join(FILE_VARS)}. "
            f"Nothing was fetched.")
    values = read_env_file(f)
    missing = [v for v in FILE_VARS if not (values.get(v) or "").strip()]
    if missing:
        raise NotConfigured(
            f"not configured: {', '.join(missing)} empty in {f}. Nothing was fetched.")
    token = (env.get(TOKEN_VAR) or "").strip()
    if not token:
        raise NotConfigured(
            f"not configured: {TOKEN_VAR} is not set. This GET-only harness never mints or "
            f"stores an access token; {MINT_HELP}. Nothing was fetched.")
    return Config(api_url=values["DOTLOOP_API_URL"].rstrip("/"), access_token=token,
                  env_file=str(f))


def config_status(env: Optional[Mapping[str, str]] = None) -> dict:
    """Offline: what is configured, by name only. Never prints a value."""
    env = os.environ if env is None else env
    f = env_file(env)
    exists = f.exists()
    values = read_env_file(f) if exists else {}
    present = {v: bool((values.get(v) or "").strip()) for v in FILE_VARS}
    token = bool((env.get(TOKEN_VAR) or "").strip())
    return {
        "envFile": str(f), "envFileExists": exists, "fileVariables": present,
        "accessTokenVariable": TOKEN_VAR, "accessTokenInEnvironment": token,
        "configured": exists and all(present.values()) and token,
        "apiUrl": (values.get("DOTLOOP_API_URL") or None),
        "note": ("The access token is minted outside this package (" + MINT_SCRIPT + ") because "
                 "the OAuth refresh grant is a POST and this package is GET-only. The one-time "
                 "authorization-code consent (" + EXCHANGE_SCRIPT + ") is a browser sign-in and "
                 "approval only Steven can do."),
    }


def get(cfg: Config, path: str, params: Optional[dict] = None) -> dict:
    """One GET against ``{api_url}/{path}``. Returns the decoded body (``{}`` for an empty
    response) or raises a ``DotloopError``. Never retries."""
    url = f"{cfg.api_url}/{path.lstrip('/')}"
    headers = {
        "Authorization": f"Bearer {cfg.access_token}",
        "Accept": "application/json",
        "User-Agent": USER_AGENT,
    }
    try:
        resp = requests.get(url, headers=headers, params=params or None, timeout=TIMEOUT_SECONDS)
    except requests.RequestException as e:
        raise TransportError(cfg.redact(f"GET {path}: {type(e).__name__}: {e}")) from None
    return _handle(cfg, resp, path)


def _handle(cfg: Config, resp, path: str) -> dict:
    status = int(getattr(resp, "status_code", 0) or 0)
    text = cfg.redact(getattr(resp, "text", "") or "")
    snippet = text[:300].replace("\n", " ")
    body = None
    if text.strip():
        try:
            body = resp.json()
        except ValueError:
            body = None

    if 200 <= status < 300:
        if status == 204 or not text.strip():
            return {}
        if body is None:
            raise UpstreamError(f"GET {path}: HTTP {status} but the body is not JSON: {snippet}",
                                 status)
        return body

    if status == 401:
        raise AuthError(f"access token invalid or expired (HTTP 401). {MINT_HELP}.", 401)
    if status == 403:
        raise Forbidden(
            "forbidden — the token or the connected dotloop account does not have access to "
            "this resource.", 403, FORBIDDEN_FIX, body if body is not None else snippet)
    if status == 404:
        raise NotFound(f"GET {path}: not found (HTTP 404): {snippet}", 404)
    if status == 429:
        raise RateLimited(
            f"GET {path}: rate limited (HTTP 429). dotloop documents "
            f"{DOCUMENTED_RATE_LIMIT_PER_MINUTE} requests/minute per user; not retried — wait "
            f"and run again: {snippet}", 429)
    if status >= 500:
        raise UpstreamError(f"GET {path}: dotloop server error (HTTP {status}): {snippet}", status)
    raise UpstreamError(f"GET {path}: HTTP {status}: {snippet}", status)
