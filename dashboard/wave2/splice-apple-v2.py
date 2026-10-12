#!/usr/bin/env python3
"""Add the APPLE-V2 layer (apple-v2.css as <style id="apple-v2">, apple-v2.js inside the inline script) to a
standalone dashboard page. Usage: python3 splice-apple-v2.py <page.html> — refuses to run twice; requires the
APPLE-REFINE v1 style block (the css goes right after it) and the WAVE 2 POLISH script (the js goes before the
page's last </script>, so the page still has exactly one inline <script>)."""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
p = sys.argv[1]; t = open(p, encoding="utf-8").read()
if "APPLE-V2" in t or 'id="apple-v2"' in t: raise SystemExit("ABORT: apple-v2 layer already present")
a = t.find('<style id="apple-refine">')
if a < 0: raise SystemExit("ABORT: no APPLE-REFINE v1 anchor (<style id=\"apple-refine\">)")
i = t.find("</style>", a)
if i < 0: raise SystemExit("ABORT: apple-refine block never closes")
i += len("</style>")
if "WAVE 2 POLISH" not in t: raise SystemExit("ABORT: WAVE 2 POLISH layer missing; splice-polish.py first")
j = t.rfind("</script>")
if j < 0 or j < i: raise SystemExit("ABORT: no </script> anchor after the style block")
css = open(os.path.join(HERE, "apple-v2.css"), encoding="utf-8").read()
js = open(os.path.join(HERE, "apple-v2.js"), encoding="utf-8").read()
t = t[:j] + "\n" + js + "\n" + t[j:]          # script first (later in the file) so the style offset stays valid
t = t[:i] + '\n<style id="apple-v2">\n' + css + "</style>" + t[i:]
open(p, "w", encoding="utf-8").write(t); print("apple-v2 layer added to", p)
