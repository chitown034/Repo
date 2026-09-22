"""The read recipes: leads list, lead get, deals list, module fields, selftest.

Zoho CRM API v8: ``GET /crm/v8/{Module}?fields=…&per_page=200`` paged with
``page_token`` (``info.more_records`` / ``info.next_page_token``);
``GET /crm/v8/{Module}/{id}``; ``GET /crm/v8/settings/fields?module=…``.
Default field sets are the ones the zoho-crm-sync skill uses — no contact
fields. Nothing here is a write.
"""

from __future__ import annotations

import datetime as _dt
import re
from typing import Callable, Optional

DEFAULT_FIELDS = {
    "Leads": ["Last_Name", "Company", "Lead_Status", "Lead_Source", "Created_Time", "Modified_Time"],
    "Deals": ["Deal_Name", "Amount", "Stage", "Closing_Date", "Lead_Source", "Modified_Time"],
}
MAX_PER_PAGE = 200
SOURCE = "Zoho CRM via direct REST (cli-anything-zoho)"
_ID_RE = re.compile(r"^\d{1,25}$")
_MODULE_RE = re.compile(r"^[A-Za-z][A-Za-z0-9_]{0,49}$")

Getter = Callable[[str, Optional[dict]], dict]


def check_module(module: str) -> str:
    if not module or not _MODULE_RE.match(module):
        raise ValueError(f"module {module!r} is not a plain API name (letters, digits, _; max 50)")
    return module


def check_id(record_id: str) -> str:
    if not record_id or not _ID_RE.match(record_id):
        raise ValueError(f"record id {record_id!r} is not a Zoho record id (digits only)")
    return record_id


def default_fields(module: str) -> Optional[str]:
    names = DEFAULT_FIELDS.get(module)
    return ",".join(names) if names else None


def list_records(get: Getter, module: str, fields: Optional[str] = None, per_page: int = MAX_PER_PAGE,
                 page_token: Optional[str] = None, all_pages: bool = False, max_pages: int = 10) -> dict:
    module = check_module(module)
    fields = fields or default_fields(module)
    per_page = max(1, min(int(per_page), MAX_PER_PAGE))
    rows: list = []
    pages = 0
    token = page_token
    more = False
    truncated = False
    body: dict = {}
    while True:
        params = {"per_page": per_page}
        if fields:
            params["fields"] = fields
        if token:
            params["page_token"] = token
        body = get(module, params)
        rows.extend(body.get("data") or [])
        pages += 1
        info = body.get("info") or {}
        more = bool(info.get("more_records"))
        token = info.get("next_page_token")
        if not all_pages or not more or not token:
            break
        if pages >= max_pages:
            truncated = True
            break
    return {"recipe": f"{module.lower()} list", "module": module, "fields": fields,
            "count": len(rows), "rows": rows, "pages": pages, "moreRecords": more,
            "nextPageToken": token if more else None, "truncated": truncated, "raw": body,
            "note": "Stage/status values are Zoho's own picklist text; mapping onto the deck's 14 stages is the sync task's job, not this CLI's."}


def get_record(get: Getter, module: str, record_id: str) -> dict:
    module = check_module(module)
    record_id = check_id(record_id)
    body = get(f"{module}/{record_id}", None)
    data = body.get("data") or []
    return {"recipe": f"{module.lower()} get", "module": module, "id": record_id,
            "record": data[0] if data else None, "raw": body}


def module_fields(get: Getter, module: str) -> dict:
    module = check_module(module)
    body = get("settings/fields", {"module": module})
    fields = body.get("fields") or []
    keep = ("api_name", "field_label", "data_type", "custom_field", "read_only")
    return {"recipe": "module fields", "module": module, "count": len(fields),
            "fields": [{k: f.get(k) for k in keep} for f in fields if isinstance(f, dict)], "raw": body}


def selftest(get: Getter) -> dict:
    """The zoho-crm-sync self-test: the smallest Leads page. Errors propagate
    so the CLI can map them onto the skill's status vocabulary."""
    out = list_records(get, "Leads", per_page=1)
    return {"checkedAt": _dt.datetime.now(_dt.timezone.utc).isoformat(timespec="seconds"),
            "status": "ok", "httpCode": 200, "error": None, "fix": None, "source": SOURCE,
            "leadsSampled": out["count"], "moreRecords": out["moreRecords"]}
