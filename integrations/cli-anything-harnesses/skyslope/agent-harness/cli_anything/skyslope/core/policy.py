"""The ECC review gate — enforced in code, not prose.

SkySlope holds legally binding transaction documents (F-S1-10). The Command
Deck's connector card clamps this target to ``disabled-by-policy`` unless the
``cliAnythingStatus`` document carries an ``eccReviewedAt`` date. This module
is the harness-side half of the same rule: nothing that touches the live site
runs unless ``CLI_ANYTHING_ECC_REVIEWED_AT`` holds a real, past-or-today date.
"""

from __future__ import annotations

import datetime as _dt
import os
import re
from dataclasses import asdict, dataclass
from typing import Mapping, Optional

from cli_anything.skyslope.core import target

ENV_VAR = "CLI_ANYTHING_ECC_REVIEWED_AT"
POLICY_EXIT_CODE = 3
STATE_BLOCKED = "disabled-by-policy"
STATE_OPEN = "gate-open"

_DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")

FIX = (
    "Get the ECC security review signed off (Elena's lens: what the harness can reach, "
    "what it stores, what a prompt-injected page could make it do — F-S1-06, "
    f"{target.GATE_FINDING}). Then export {ENV_VAR}=YYYY-MM-DD with the sign-off date "
    "and record the same date as eccReviewedAt in cliAnythingStatus. Do not set the "
    "variable just to make a command run — the deck card will show the date you claim."
)


@dataclass(frozen=True)
class GateStatus:
    ok: bool
    reviewed_at: Optional[str]
    conn_state: str
    reason: str
    fix: str
    target: str = target.NAME
    env_var: str = ENV_VAR

    def as_dict(self) -> dict:
        d = asdict(self)
        # Mirror the deck's cliAnythingStatus vocabulary so the two never disagree.
        d["connState"] = d.pop("conn_state")
        d["eccReviewedAt"] = d.pop("reviewed_at")
        return d


def check_gate(env: Optional[Mapping[str, str]] = None,
               today: Optional[_dt.date] = None) -> GateStatus:
    """Return the gate state. ``ok`` is True only for a valid, non-future date."""
    env = os.environ if env is None else env
    today = today or _dt.date.today()
    raw = (env.get(ENV_VAR) or "").strip()

    if not raw:
        return GateStatus(
            ok=False, reviewed_at=None, conn_state=STATE_BLOCKED, fix=FIX,
            reason=(f"{ENV_VAR} is not set. {target.NAME} touches legally binding "
                    f"documents; every read recipe stays {STATE_BLOCKED} until the ECC "
                    f"security review has a sign-off date ({target.GATE_FINDING})."),
        )
    if not _DATE_RE.match(raw):
        return GateStatus(
            ok=False, reviewed_at=None, conn_state=STATE_BLOCKED, fix=FIX,
            reason=f"{ENV_VAR}={raw!r} is not a date. Expected YYYY-MM-DD.",
        )
    try:
        reviewed = _dt.date.fromisoformat(raw)
    except ValueError:
        return GateStatus(
            ok=False, reviewed_at=None, conn_state=STATE_BLOCKED, fix=FIX,
            reason=f"{ENV_VAR}={raw!r} is not a real calendar date.",
        )
    if reviewed > today:
        return GateStatus(
            ok=False, reviewed_at=None, conn_state=STATE_BLOCKED, fix=FIX,
            reason=(f"{ENV_VAR}={raw} is in the future (today is {today.isoformat()}). "
                    "A review cannot be signed off tomorrow."),
        )
    age = (today - reviewed).days
    return GateStatus(
        ok=True, reviewed_at=raw, conn_state=STATE_OPEN, fix="",
        reason=f"ECC review signed off {raw} ({age} days ago). Read recipes may run.",
    )
