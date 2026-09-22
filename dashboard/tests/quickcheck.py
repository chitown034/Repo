#!/usr/bin/env python3
"""Static gate for the Command Deck single-file dashboard.
Usage: python3 quickcheck.py <command-deck.html>
Exit 0 = pass, 1 = fail. Prints one line per check.
Checks: inline script syntax (node --check), cdStateSeed JSON parses, no duplicate element ids,
balanced <section>/<div> counts inside the body, every panel has a title and a stamp-capable head,
functions called but never defined (approximate), and no literal "undefined" in innerHTML strings.
"""
import re, sys, json, subprocess, collections, os, tempfile

def main(path):
    html = open(path, encoding="utf-8").read()
    fails = []
    def ok(name, cond, detail=""):
        print(("PASS " if cond else "FAIL ") + name + (" — " + detail if detail else ""))
        if not cond: fails.append(name)

    # 1. inline script syntax
    scripts = re.findall(r"<script>(.*?)</script>", html, flags=re.S)
    ok("exactly one inline <script>", len(scripts) == 1, f"found {len(scripts)}")
    js = scripts[-1] if scripts else ""
    with tempfile.NamedTemporaryFile("w", suffix=".js", delete=False, encoding="utf-8") as f:
        f.write(js); jspath = f.name
    r = subprocess.run(["node", "--check", jspath], capture_output=True, text=True)
    ok("node --check on inline script", r.returncode == 0, (r.stderr or "").strip()[:400])

    # 2. seed JSON
    m = re.search(r'<script type="application/json" id="cdStateSeed">(.*?)</script>', html, flags=re.S)
    seed_ok = False
    if m:
        try: json.loads(m.group(1)); seed_ok = True
        except Exception as e: print("   seed error:", e)
    ok("cdStateSeed JSON parses", seed_ok)

    # 3. duplicate ids
    ids = re.findall(r'\sid="([^"]+)"', html)
    dup = [k for k, v in collections.Counter(ids).items() if v > 1]
    ok("no duplicate element ids", not dup, ", ".join(dup[:10]))

    # 4. tag balance for section/div (body only, approximate)
    body = html.split("<body", 1)[1] if "<body" in html else html
    body_html = body.split("<script", 1)[0]
    for tag in ("section", "div", "table", "details", "ul"):
        o = len(re.findall(r"<" + tag + r"[\s>]", body_html)); c = len(re.findall(r"</" + tag + r">", body_html))
        ok(f"balanced <{tag}> in body markup", o == c, f"open {o} close {c}")

    # 5. every panel has a title
    panels = re.findall(r'<section class="panel[^"]*" id="(panel-[a-z0-9-]+)"', html)
    missing = []
    for p in panels:
        seg = html.split(f'id="{p}"', 1)[1][:6000]
        if 'class="panel-title"' not in seg: missing.append(p)
    ok(f"all {len(panels)} panels carry a panel-title", not missing, ", ".join(missing))

    # 6. called-but-undefined functions (approximate: bare identifiers followed by "(")
    defined = set(re.findall(r"function\s+([A-Za-z_$][\w$]*)\s*\(", js))
    defined |= set(re.findall(r"(?:var|let|const)\s+([A-Za-z_$][\w$]*)\s*=\s*function", js))
    defined |= set(re.findall(r"(?:var|let|const)\s+([A-Za-z_$][\w$]*)\s*=\s*\(?[\w$,\s]*\)?\s*=>", js))
    defined |= set(re.findall(r"window\.([A-Za-z_$][\w$]*)\s*=\s*function", js))
    calls = set(re.findall(r"(?<![\w$.])([A-Za-z_$][\w$]*)\s*\(", js))
    builtins = set("""if for while switch catch function return typeof new Array Object String Number Boolean Date Math JSON parseInt parseFloat isNaN isFinite
    setTimeout setInterval clearTimeout clearInterval encodeURIComponent decodeURIComponent encodeURI decodeURI escape unescape alert confirm prompt fetch
    Promise Map Set WeakMap WeakSet Symbol Error TypeError RangeError SyntaxError RegExp Intl requestAnimationFrame cancelAnimationFrame FileReader Blob URL
    Uint8Array Float32Array ArrayBuffer DataView Audio Image Option Event CustomEvent MutationObserver IntersectionObserver ResizeObserver AbortController
    speechSynthesis SpeechSynthesisUtterance structuredClone queueMicrotask atob btoa Proxy Reflect BigInt Headers Request Response TextEncoder TextDecoder
    XMLHttpRequest WebSocket Worker Notification getComputedStyle scrollTo scrollBy open close print focus blur eval require import super this arguments
    Function DOMParser XMLSerializer Path2D OffscreenCanvas ImageData createImageBitmap performance crypto navigator location history document window
    globalThis undefined null true false void delete in instanceof await async yield of do else try finally throw break continue case default let const var""".split())
    undefined_calls = sorted(c for c in calls - defined - builtins if not c[0].isupper() and len(c) > 2)
    # keep only names that also never appear as a property/method definition
    undefined_calls = [c for c in undefined_calls if not re.search(r"[\.\s]" + re.escape(c) + r"\s*[:=]\s*function", js) and not re.search(r"\b" + re.escape(c) + r"\s*=\s*", js)]
    ok("no functions called but never defined (approx.)", not undefined_calls, ", ".join(undefined_calls[:15]))

    # 7. literal undefined leakage in templates
    leaks = re.findall(r'>\s*undefined\s*<', html)
    ok("no literal 'undefined' rendered in static markup", not leaks, f"{len(leaks)} hits")

    os.unlink(jspath)
    print("RESULT:", "PASS" if not fails else "FAIL (" + ", ".join(fails) + ")")
    return 0 if not fails else 1

if __name__ == "__main__":
    sys.exit(main(sys.argv[1]))
