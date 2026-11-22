"""Merge locally built VANESSA modules onto the LIVE published page without dropping other sessions' work.

    python3 vanessa/scripts/merge-live.py <live.html> <out.html> app79.js app80.js ...

- Replaces each given module's block (from its "/* appNN:" marker to the next module marker) or inserts it
  before the "/* app49: Desk Add-ons" marker (must stay before boot()).
- Re-applies the idempotent v121 edits (PPFC licensing JSON, Perplexity → Claude + Google search) so a live
  copy published by another session can't bring them back.
The live page carries PPFC Trainual data that never goes in git: keep <live.html> and <out.html> outside the repo.
"""
import re, sys, pathlib
V = pathlib.Path(__file__).resolve().parent.parent
live, out, mods = sys.argv[1], sys.argv[2], sys.argv[3:]
L = open(live, encoding="utf-8").read()
def cut(s, start, end, repl):
    if start not in s: return s
    a = s.index(start); b = s.index(end, a); return s[:a] + repl + s[b:]
new = (V / "ppfclic.js").read_text().strip()
if "window.PPFC_LIC=" in L:
    a = L.index("window.PPFC_LIC="); b = L.index("\n", a); L = L[:a] + new + L[b:]
L = cut(L, "async function cxResearch(q,deep){", "async function cxSheet(", '/* live research: Claude + Google search (cwAsk in app79.js); Perplexity removed 2026-11-08 */\nasync function cxResearch(q,deep){return cwAsk(q,{deep:!!deep})}\n')
L = cut(L, "async function lrfSearch(q){", "const LRF_SHAPE=", '/* Google search via Composio/Serper — implemented in app79.js (Perplexity removed 2026-11-08) */\nasync function lrfSearch(q){throw new Error("live search engine (app79) not loaded")}\n')
L = cut(L, "async function lrfPerplexity(){", "function lrfApply(q)", '/* no-Claude fallback (Google snippets) — implemented in app79.js; name kept for callers */\nasync function lrfPerplexity(){throw new Error("live search engine (app79) not loaded")}\n')
for x, y in [("Web research with sources (Perplexity)", "Web research with sources (Claude + Google search)"), ("(Perplexity via Composio)", "(Claude + Google search via Composio)"), ("Asking Perplexity…", "Claude is searching Google…"), ("via Perplexity (Composio)", "via Claude + Google search (Composio)"), ("Headline News (Perplexity)", "Headline News (Claude + Google search)"), ("Sourced web research (Perplexity)", "Sourced web research (Claude + Google search)")]:
    L = L.replace(x, y)
for m in mods:
    code = (V / m).read_text(encoding="utf-8").rstrip() + "\n"
    tag = code[:code.index(":") + 1]
    if tag in L:
        a = L.index(tag); nxt = re.search(r"/\* app\d+[a-z]*:", L[a + len(tag):]); b = a + len(tag) + nxt.start(); L = L[:a] + code + L[b:]
    else:
        a = L.index("/* app49: Desk Add-ons"); L = L[:a] + code + L[a:]
open(out, "w", encoding="utf-8").write(L)
print("merged", len(mods), "module(s) →", out, f"({len(L.encode())} bytes); Perplexity API calls left:", L.count("PERPLEXITYAI"))
