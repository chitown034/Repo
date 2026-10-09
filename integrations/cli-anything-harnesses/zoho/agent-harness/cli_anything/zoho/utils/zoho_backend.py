"""HTTP backend for Zoho CRM API v8. GET only.

No other HTTP method exists in this package — a test greps for one — so the
harness cannot create, update or delete a Zoho record by construction. That is
also why the OAuth access token is NOT minted here: the refresh-token grant is
a POST by specification (RFC 6749 §6), so it lives in
``tools/mint-access-token.sh`` outside the pip package, and this CLI only ever
receives a one-hour token through ``ZOHO_ACCESS_TOKEN``. Nothing stores it.

Credential file (zoho-crm-sync skill): ``~/.config/zoho/.env`` (chmod 600) with
``ZOHO_ACCOUNTS_URL``, ``ZOHO_API_URL``, ``ZOHO_CLIENT_ID``,
``ZOHO_CLIENT_SECRET``, ``ZOHO_REFRESH_TOKEN``; scopes
``ZohoCRM.modules.ALL,ZohoCRM.settings.READ``. Values are never printed.

The known blocker — re-probed 2026-09-22 13:35 UTC on an ACTIVE connection:
every call returns HTTP 403 ``NO_PERMISSION`` / ``Crm_Implied_Api_Access``
because the profile-level "Zoho CRM API Access" toggle is off. ``_handle``
names that exact case, with the click path, and never retries into it.
"""

from __future__ import annotations

import json
import os
from dataclasses import dataclass
from pathlib import Path
from typing import Mapping, Optional

import requests

API_VERSION = "v8"
ENV_FILE = "~/.config/zoho/.env"
ENV_FILE_VAR = "ZOHO_ENV_FILE"          # override the file location (tests, odd layouts)
FILE_VARS = ("ZOHO_ACCOUNTS_URL", "ZOHO_API_URL", "ZOHO_CLIENT_ID",
             "ZOHO_CLIENT_SECRET", "ZOHO_REFRESH_TOKEN")
TOKEN_VAR = "ZOHO_ACCESS_TOKEN"
SCOPES = "ZohoCRM.modules.ALL,ZohoCRM.settings.READ"
TIMEOUT_SECONDS = 30
USER_AGENT = "cli-anything-zoho/0.1 (read-only; GET only)"
NOT_CONFIGURED_EXIT = 5
PROFILE_PERMISSION_EXIT = 4
MINT_SCRIPT = "integrations/cli-anything-harnesses/zoho/tools/mint-access-token.sh"

PROFILE_MESSAGE = ("profile permission not granted — this is a Zoho-side setting, "
                   "not a credential problem")
PROFILE_FIX = (
    "Zoho CRM → Setup → Security Control → Profiles → the connected user's profile → "
    "Developer Permissions → enable 'Zoho CRM API Access'. Then re-run one Leads call "
    "(cli-anything-zoho selftest). If the token was authorised through Composio, "
    "re-authorise that connection once so the new permission is picked up. No credential "
    "fixes this; only the toggle does."
)
MINT_HELP = (f"mint one (valid one hour) from the five variables in {ENV_FILE} with "
             f"{MINT_SCRIPT} and export {TOKEN_VAR}=\"$(…)\"")


class ZohoError(RuntimeError):
    kind = "zoho_error"

    def __init__(self, message: str, http_status: Optional[int] = None,
                 code: Optional[str] = None, fix: Optional[str] = None, details=None):
        super().__init__(message)
        self.http_status = http_status
        self.code = code
        self.fix = fix
        self.details = details

    def as_dict(self) -> dict:
        return {"error": str(self), "type": self.kind, "httpStatus": self.http_status,
                "zohoCode": self.code, "fix": self.fix, "details": self.details}


class NotConfigured(ZohoError):
    kind = "not_configured"


class ProfilePermissionDenied(ZohoError):
    kind = "profile_permission_denied"


class AuthError(ZohoError):
    kind = "auth_error"


class NotFound(ZohoError):
    kind = "not_found"


class RateLimited(ZohoError):
    kind = "rate_limited"


class UpstreamError(ZohoError):
    kind = "upstream_error"


class TransportError(ZohoError):
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
    """The credential file must exist with all five variables; the access
    token must be in the environment. Anything missing → ``NotConfigured``
    naming the variable(s). Never a stack trace, never a value."""
    env = os.environ if env is None else env
    f = env_file(env)
    if not f.exists():
        raise NotConfigured(
            f"not configured: {f} is missing; it must hold {', '.join(FILE_VARS)} "
            f"(scopes {SCOPES}). Nothing was fetched.")
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
    return Config(api_url=values["ZOHO_API_URL"].rstrip("/"), access_token=token, env_file=str(f))


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
        "apiUrl": (values.get("ZOHO_API_URL") or None), "scopesRequired": SCOPES,
        "note": ("The access token is minted outside this package (" + MINT_SCRIPT +
                 ") because the OAuth refresh grant is a POST and this package is GET-only. "
                 "Even a valid token returns 403 NO_PERMISSION until the profile toggle "
                 "'Zoho CRM API Access' is on."),
    }


def get(cfg: Config, path: str, params: Optional[dict] = None) -> dict:
    """One GET against ``{api_url}/crm/v8/{path}``. Returns the decoded body or
    raises a ``ZohoError``. Never retries."""
    url = f"{cfg.api_url}/crm/{API_VERSION}/{path.lstrip('/')}"
    headers = {
        "Authorization": f"Zoho-oauthtoken {cfg.access_token}",
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
    code = body.get("code") if isinstance(body, dict) else None
    message = body.get("message") if isinstance(body, dict) else None
    details = body.get("details") if isinstance(body, dict) else None

    if 200 <= status < 300:
        if status == 204 or not text.strip():
            return {"data": [], "info": {"more_records": False}}
        if not isinstance(body, dict):
            raise UpstreamError(f"GET {path}: HTTP {status} but the body is not a JSON object: {snippet}", status)
        return body

    if status == 403 and (code == "NO_PERMISSION" or "Crm_Implied_Api_Access" in text):
        raise ProfilePermissionDenied(
            f"{PROFILE_MESSAGE}. Zoho said HTTP 403 {code or 'NO_PERMISSION'}: {message or snippet}"
            + (f" (details: {json.dumps(details)})" if details else ""),
            403, code or "NO_PERMISSION", PROFILE_FIX, details)
    if status == 401:
        if code == "INVALID_TOKEN":
            raise AuthError(f"access token invalid or expired (Zoho INVALID_TOKEN). Tokens last one hour; {MINT_HELP}.",
                            401, code)
        if code == "OAUTH_SCOPE_MISMATCH":
            raise AuthError(f"the token's scopes do not cover this call (Zoho OAUTH_SCOPE_MISMATCH). "
                            f"Required: {SCOPES} — re-issue the refresh token with those scopes.", 401, code)
        raise AuthError(f"Zoho refused the token (HTTP 401 {code}): {message or snippet}", 401, code)
    if status == 403:
        raise AuthError(f"forbidden (HTTP 403 {code}): {message or snippet}", 403, code)
    if status == 404 or code == "INVALID_MODULE":
        raise NotFound(f"GET {path}: not found (HTTP {status} {code}): {message or snippet}", status, code)
    if status == 429:
        raise RateLimited(f"GET {path}: rate limited (HTTP 429). Not retried — wait and run again: {snippet}",
                          429, code)
    if status >= 500:
        raise UpstreamError(f"GET {path}: Zoho server error (HTTP {status}): {snippet}", status, code)
    raise UpstreamError(f"GET {path}: HTTP {status} {code}: {message or snippet}", status, code)
