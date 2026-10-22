"""A tiny throwaway brain for the tests. Every test runs against a temp copy,
never against the real repo (memory.md, 2026-09-24: a test must name its temp
repo when the script under test finds its repo from its own location)."""

from __future__ import annotations

import os
import shutil
import sys
import tempfile
import textwrap
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
if str(REPO) not in sys.path:
    sys.path.insert(0, str(REPO))

FILES = {
    "CLAUDE.md": """\
        # Test Brain — L1 Router

        Read this file in full. It routes; it holds no knowledge.

        ## Routing table — load exactly ONE leaf, then answer

        | Question class | Load | Never load for this |
        |---|---|---|
        | Who Steven is, licences, states, credentials | `context/about-me.md` | wiki, projects |
        | Status of a named project | `projects/<name>.md` — alpha | the deck HTML |
        | Something learned in an earlier session | `memory.md` | wiki |
        | What runs when, and whether it actually ran | `always-on/README.md` | projects |

        ## Sub-agent dispatch

        - Dispatch **≤8 in parallel**.
        """,
    "context/about-me.md": """\
        # About Steven

        One page. Facts only, drawn from the bio cards.

        ## Identity

        - Retired Navy Chief — 20 years, retired 2023.
        - Based in Temecula, California.

        ## Licensed capacities

        | Capacity | Detail |
        |---|---|
        | Mortgage | MLO, personally licensed in **CA, NV, AZ, FL, IL** |
        | Entity | NMLS #1921615 |
        """,
    "projects/alpha.md": """\
        ---
        title: Project Alpha
        description: The alpha project tracks the harbor bridge rebuild.
        ---
        # Alpha (ignored because frontmatter has a title)

        ## Status

        The harbor bridge rebuild is 40 percent complete as of 2026-09-20.

        ## Budget

        The budget is tracked in the deck, not here.
        """,
    "always-on/README.md": """\
        # Always-on

        What keeps the brain current while nobody is watching.

        ## The brain's own tasks

        | Task | Cron | Status |
        |---|---|---|
        | `nightly-verify` | Sunday 4:00 PM | ok |

        ## Repairs

        Every broken task has a written repair. See `routines/repairs.md` for the paste-ready fixes.
        """,
    "routines/repairs.md": """\
        # Repairs — paste-ready

        **Written 2026-09-22.** One section per broken task.

        ## 1. zebra-sync writes the wrong shape

        The zebra-sync task writes its document bare. The corrected prompt wraps it as {v: ...}
        and the check afterwards reads the zebra document back.
        """,
    "memory.md": """\
        # memory.md — auto-memory

        **Empty on purpose.** This file is the auto-memory store.

        ## Entries

        <!-- append below -->

        - 2026-09-23 — There are **18** browser recipes across the five harnesses.
        """,
    "docs/notes.md": """\
        # Notes

        A human-readable doc about the quokka migration plan.

        ## Quokka

        The quokka migration finishes in October.
        """,
    "docs/findings/skip.md": "# Skipped\n\nFindings are never indexed.\n",
    ".claude/skills/x/SKILL.md": "# Skill\n\nSkills have their own loader.\n",
}


def make_brain() -> Path:
    root = Path(tempfile.mkdtemp(prefix="brain-test-"))
    for rel, body in FILES.items():
        p = root / rel
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(textwrap.dedent(body), encoding="utf-8")
    return root


class BrainCase:
    """Mixin: self.root is a fresh fixture brain; BRAIN_ROOT points at it."""

    def setUp(self):  # noqa: D401
        self.root = make_brain()
        self._old = os.environ.get("BRAIN_ROOT")
        os.environ["BRAIN_ROOT"] = str(self.root)

    def tearDown(self):
        if self._old is None:
            os.environ.pop("BRAIN_ROOT", None)
        else:
            os.environ["BRAIN_ROOT"] = self._old
        os.environ.pop("BRAIN_ROUTER", None)
        shutil.rmtree(self.root, ignore_errors=True)
