#!/usr/bin/env python3
"""Add only the additive motion layer (polish.css + polish.js) to a standalone dashboard page.
Usage: python3 splice-polish.py <page.html>   — refuses to run twice; asserts one css and one script anchor."""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
p = sys.argv[1]; t = open(p, encoding="utf-8").read()
if "WAVE 2 POLISH" in t: raise SystemExit("ABORT: polish layer already present")
css = open(os.path.join(HERE, "polish.css"), encoding="utf-8").read()
js = open(os.path.join(HERE, "polish.js"), encoding="utf-8").read()
i = t.rfind("</style>"); j = t.rfind("</script>")
if i < 0 or j < 0: raise SystemExit("ABORT: no </style> or </script> anchor")
t = t[:j] + "\n" + js + "\n" + t[j:]          # script first (later in the file) so offsets stay valid
t = t[:i] + "\n" + css + "\n" + t[i:]
open(p, "w", encoding="utf-8").write(t); print("polish layer added to", p)
