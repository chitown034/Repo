"""Pin every test to the PACKAGED path map and keep the suite offline.

Set before the CLI module is imported (the `recipe` subcommands are built from
the effective map at import time), so an edited ~/.config copy on the machine
running the tests can never change what the suite asserts.
"""
import os
from pathlib import Path

_PACKAGED = Path(__file__).resolve().parent.parent / "paths.json"
os.environ["CLI_ANYTHING_SHOWAMI_PATHS"] = str(_PACKAGED)
