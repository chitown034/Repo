#!/usr/bin/env python3
"""Rebuild integrations/openmausbot/team.yaml and souls/ from the AI org roster.

The logic lives in brain/mausbot.py (`bin/brain mausbot --write` does the same); this wrapper exists so
install.sh can run it with nothing but python3. Exits 1, writing nothing, if the org cannot fit one workspace.
"""
import os
import sys
from pathlib import Path

ROOT = Path(os.path.abspath(__file__)).parents[2]
sys.path.insert(0, str(ROOT))
from brain import mausbot  # noqa: E402

try:
    r = mausbot.write(ROOT)
except mausbot.MausbotError as e:
    sys.exit(f"build-team: {e}; nothing written.")
print(f"wrote {mausbot.TEAM_FILE}: {r['bots']} bots in {len(r['teams'])} teams, {len(r['rooms'])} rooms, "
      f"{r['bench']} seats on Chiefs' benches")
for t in r["teams"]:
    print(f"  {t['name']}: {t['bots']} bots + {t['bench']} on {t['chief']}'s bench")
