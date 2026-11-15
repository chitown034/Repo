"""Embed sellbird-setup/{sellbird.local.yaml, skills/email_rules.md, install.sh} into vanessa/app84.js
so VANESSA's Sellbird page downloads exactly these files. Run after editing any of them:
    python3 sellbird-setup/embed.py && python3 vanessa/scripts/build-artifact.py
"""
import json, pathlib, re
root = pathlib.Path(__file__).resolve().parent
app = root.parent / "vanessa" / "app84.js"
files = {"yaml": (root / "sellbird.local.yaml").read_text(), "rules": (root / "skills" / "email_rules.md").read_text(), "install": (root / "install.sh").read_text()}
src = app.read_text()
new = "/*SB_FILES*/const SB_FILES=" + json.dumps(files, ensure_ascii=False).replace("</", "<\\/") + ";/*/SB_FILES*/"
out, n = re.subn(r"/\*SB_FILES\*/.*?/\*/SB_FILES\*/", lambda m: new, src, count=1, flags=re.S)
assert n == 1, "marker not found in app84.js"
app.write_text(out)
print("embedded", {k: len(v) for k, v in files.items()})
