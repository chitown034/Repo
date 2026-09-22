"""The read recipes: whoami, leads list, lead get, stage totals, activity timeline.

Response shapes and pagination parameter names could not be confirmed from the
build sandbox (api.lofty.com is documented but was not reachable to inspect).
Row extraction is therefore tolerant (``extract_rows``), the pagination
parameter names live in one place (``PAGINATION``) and ``--param`` passes
anything through. ``--raw`` prints the untouched body so the first live run
shows the real shape. Nothing here is a write.
"""

from __future__ import annotations

import re
from collections import Counter
from typing import Callable, Optional

DEFAULT_PAGE_SIZE = 50
PAGINATION = {"page": "pageNum", "size": "pageSize"}   # UNVERIFIED names; override with --param
ROW_KEYS = ("leads", "activities", "data", "items", "records", "results", "list")
STAGE_KEYS = ("stage", "leadStage", "stageName", "pipelineStage", "status")
_ID_RE = re.compile(r"^[A-Za-z0-9_-]{1,64}$")

Getter = Callable[[str, Optional[dict]], object]


def check_id(lead_id: str) -> str:
    if not lead_id or not _ID_RE.match(lead_id):
        raise ValueError(f"lead id {lead_id!r} is not a plain identifier (letters, digits, - and _ only, max 64)")
    return lead_id


def extract_rows(body) -> list:
    """A bare list, or the first list-valued key among ROW_KEYS, or a nested
    ``data`` object holding one. Empty list when nothing fits."""
    if isinstance(body, list):
        return body
    if isinstance(body, dict):
        for k in ROW_KEYS:
            v = body.get(k)
            if isinstance(v, list):
                return v
        data = body.get("data")
        if isinstance(data, dict):
            for k in ROW_KEYS:
                v = data.get(k)
                if isinstance(v, list):
                    return v
    return []


def _shape(body) -> dict:
    return {"bodyType": type(body).__name__,
            "bodyKeys": sorted(body.keys()) if isinstance(body, dict) else None}


def whoami(get: Getter) -> dict:
    body = get("me", None)
    return {"recipe": "me", "ok": True, "identity": body, **_shape(body)}


def list_leads(get: Getter, page: int = 1, page_size: int = DEFAULT_PAGE_SIZE,
               extra: Optional[dict] = None) -> dict:
    params = {PAGINATION["page"]: page, PAGINATION["size"]: page_size, **(extra or {})}
    body = get("leads", params)
    rows = extract_rows(body)
    return {"recipe": "leads list", "page": page, "pageSize": page_size, "params": params,
            "count": len(rows), "rows": rows, **_shape(body), "raw": body,
            "note": "Pagination parameter names are unverified until the first live run; pass --raw to see the body."}


def get_lead(get: Getter, lead_id: str) -> dict:
    lead_id = check_id(lead_id)
    body = get(f"leads/{lead_id}", None)
    return {"recipe": "lead get", "id": lead_id, "lead": body, **_shape(body), "raw": body}


def timeline(get: Getter, lead_id: str, extra: Optional[dict] = None) -> dict:
    lead_id = check_id(lead_id)
    body = get(f"leads/{lead_id}/activities", extra or None)
    rows = extract_rows(body)
    return {"recipe": "activity timeline", "id": lead_id, "count": len(rows), "rows": rows,
            **_shape(body), "raw": body,
            "note": "Contact made outside Lofty is invisible here: an empty timeline reads 'no contact logged', not 'no contact happened'."}


def stage_of(row: dict, field: Optional[str] = None) -> str:
    if field:
        v = row.get(field)
    else:
        v = next((row[k] for k in STAGE_KEYS if k in row), None)
    if v is None:
        return "(no stage field)"
    if isinstance(v, dict):
        return str(v.get("name") or v.get("label") or v)
    return str(v)


def stage_totals(get: Getter, page_size: int = DEFAULT_PAGE_SIZE, max_pages: int = 20,
                 stage_field: Optional[str] = None, extra: Optional[dict] = None) -> dict:
    totals: Counter = Counter()
    scanned = pages = 0
    truncated = False
    for page in range(1, max_pages + 1):
        params = {PAGINATION["page"]: page, PAGINATION["size"]: page_size, **(extra or {})}
        rows = extract_rows(get("leads", params))
        if not rows:
            break
        pages += 1
        scanned += len(rows)
        for row in rows:
            totals[stage_of(row, stage_field) if isinstance(row, dict) else "(not an object)"] += 1
        if len(rows) < page_size:
            break
    else:
        truncated = True
    return {
        "recipe": "stage totals",
        "stageTotals": [[stage, n] for stage, n in totals.most_common()],
        "leadsScanned": scanned, "pages": pages, "truncated": truncated,
        "stageField": stage_field or f"auto ({', '.join(STAGE_KEYS)})",
        "note": ("Stage names are Lofty's own, in Lofty's own order of frequency; never remapped onto "
                 "another CRM's list. Truncated means max-pages was hit — say so, do not present a partial total as whole."),
    }
