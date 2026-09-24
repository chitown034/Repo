"""The terms-of-service review gate — enforced in code, not prose.

Modelled on ``cli_anything.skyslope.core.policy`` (the ECC gate), generalised
to three independent groups instead of one. Every recipe in ``paths.json``
carries a ``policy_group`` naming one of ``target.POLICY_GROUPS``. Nothing
that touches the live site for a group runs unless
``CLI_ANYTHING_TOS_REVIEWED_<GROUP>`` (upper-cased group name) holds a real,
past-or-today date.

This is a *new* pattern for this repo: homes.com, ShowingTime and Showami
ship without a code-enforced terms gate (Alexandra's review is recommended
for them but not wired in). SkySlope and zipForms enforce one gate each
because they hold legally binding documents. These recipes are lower-risk
(nothing legally binding — public marketing and rate pages) but the BRIEF for
this round requires every *new* recipe to ship disabled-by-policy until its
own terms/robots.txt question is answered, so that is what this module does,
per group, using the same mechanism SkySlope already proved.
"""

from __future__ import annotations

import datetime as _dt
import os
import re
from dataclasses import asdict, dataclass
from typing import Mapping, Optional

from cli_anything.publicfeeds.core import target

ENV_PREFIX = "CLI_ANYTHING_TOS_REVIEWED_"
POLICY_EXIT_CODE = 3
STATE_BLOCKED = "disabled-by-policy"
STATE_OPEN = "gate-open"

_DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")


def env_var(group: str) -> str:
    return f"{ENV_PREFIX}{group.upper()}"


@dataclass(frozen=True)
class GateStatus:
    ok: bool
    reviewed_at: Optional[str]
    conn_state: str
    reason: str
    fix: str
    group: str
    env_var: str

    def as_dict(self) -> dict:
        d = asdict(self)
        # Mirror the deck's cliAnythingStatus vocabulary so the two never disagree.
        d["connState"] = d.pop("conn_state")
        d["eccReviewedAt"] = d.pop("reviewed_at")  # same field name the deck clamps on
        return d


def _fix(group: str, info: dict) -> str:
    return (
        f"Get Alexandra's terms-of-service / robots.txt review answered for this "
        f"question, in writing: {info['tos_question']!r} Then export "
        f"{env_var(group)}=YYYY-MM-DD with the review date, and record the same "
        f"date in cliAnythingStatus. Do not set the variable just to make a "
        f"command run — the deck's connector card will show the date you claim."
    )


def check_gate(group: str, env: Optional[Mapping[str, str]] = None,
                today: Optional[_dt.date] = None) -> GateStatus:
    """Return the gate state for one policy group. ``ok`` only for a valid,
    non-future date."""
    if group not in target.POLICY_GROUPS:
        raise ValueError(f"unknown policy group {group!r}; known: {sorted(target.POLICY_GROUPS)}")
    info = target.POLICY_GROUPS[group]
    var = env_var(group)
    env = os.environ if env is None else env
    today = today or _dt.date.today()
    raw = (env.get(var) or "").strip()

    if not raw:
        return GateStatus(
            ok=False, reviewed_at=None, conn_state=STATE_BLOCKED, fix=_fix(group, info),
            reason=(f"{var} is not set. {info['title']} stays {STATE_BLOCKED} until its "
                    f"terms-of-service/robots.txt question has a review date: {info['tos_question']}"),
            group=group, env_var=var,
        )
    if not _DATE_RE.match(raw):
        return GateStatus(
            ok=False, reviewed_at=None, conn_state=STATE_BLOCKED, fix=_fix(group, info),
            reason=f"{var}={raw!r} is not a date. Expected YYYY-MM-DD.", group=group, env_var=var,
        )
    try:
        reviewed = _dt.date.fromisoformat(raw)
    except ValueError:
        return GateStatus(
            ok=False, reviewed_at=None, conn_state=STATE_BLOCKED, fix=_fix(group, info),
            reason=f"{var}={raw!r} is not a real calendar date.", group=group, env_var=var,
        )
    if reviewed > today:
        return GateStatus(
            ok=False, reviewed_at=None, conn_state=STATE_BLOCKED, fix=_fix(group, info),
            reason=(f"{var}={raw} is in the future (today is {today.isoformat()}). "
                    "A review cannot be signed off tomorrow."), group=group, env_var=var,
        )
    age = (today - reviewed).days
    return GateStatus(
        ok=True, reviewed_at=raw, conn_state=STATE_OPEN, fix="",
        reason=f"terms/robots.txt review for {info['title']} signed off {raw} ({age} days ago). "
               f"Read recipes in this group may run.",
        group=group, env_var=var,
    )


def all_gates(env: Optional[Mapping[str, str]] = None,
              today: Optional[_dt.date] = None) -> dict:
    return {g: check_gate(g, env=env, today=today) for g in target.POLICY_GROUPS}
