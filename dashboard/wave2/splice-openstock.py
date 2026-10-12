#!/usr/bin/env python3
"""Add the "Market viewer — OpenStock" card to Panel 41 (Trading Research Desk) of the Command Deck.

Usage: python3 splice-openstock.py <deck.html> [--sources]   (--sources also patches panel-tradingdesk.html here)
The card links to the OpenStock app on this computer (http://127.0.0.1:3000), copies its install/start commands, and does a
best-effort 'is it running here' check. Everything dynamic uses textContent; no key, password or token is read or shown.
Refuses to run twice."""
import os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
MARK = "OPENSTOCK-CARD v1"
ANCHOR = '    <div class="card" style="margin-top:16px;">\n      <p class="card-title">Common mistakes the desk is built to catch</p>'
CARD = '''    <div class="card" style="margin-top:16px;border-left:4px solid var(--accent);" id="osCard"><!-- OPENSTOCK-CARD v1 -->
      <div class="card-title-row"><p class="card-title" style="margin:0;">Market viewer &mdash; OpenStock (runs on your own computer)</p><span class="badge gray" id="osBadge">not checked</span></div>
      <p class="card-sub" style="margin-top:6px;">An open-source stock viewer: watchlists, live-style charts, heatmap, company profiles and news, with your own login and your own local database. It is <b>a viewer, not a broker</b> &mdash; it cannot place a trade, and the paper desk above stays separate (it reads your own price files). Runs on that computer only (127.0.0.1); nothing is exposed to the internet.</p>
      <div class="acts" style="display:flex;gap:8px;flex-wrap:wrap;margin:10px 0;">
        <a class="ch-btn ch-btn-go" id="osOpen" href="http://127.0.0.1:3000" target="_blank" rel="noopener">Open OpenStock</a>
        <button type="button" class="ch-copy" id="osCheck">Is it running here?</button>
        <button type="button" class="ch-copy" data-os-copy="bash integrations/openstock/openstock.sh install --apply">Copy install command</button>
        <button type="button" class="ch-copy" data-os-copy="bash integrations/openstock/openstock.sh start">Copy start command</button>
      </div>
      <ol class="src-note" style="margin:6px 0 0;padding-left:20px;line-height:1.55;">
        <li>One time, in Terminal on the computer: paste the install command (needs Docker Desktop and Node; it prints what is missing).</li>
        <li>Get a <b>free</b> Finnhub key at finnhub.io/register and type it into <code>~/Applications/OpenStock/.env</code> after <code>NEXT_PUBLIC_FINNHUB_API_KEY=</code> &mdash; never into a chat.</li>
        <li>Paste the start command, then click <b>Open OpenStock</b> and create your local account.</li>
      </ol>
      <p class="src-note" id="osNote" role="status" style="margin-top:8px;">Licence AGPL-3.0: fine for your own use; do not put it on the public internet. Weekly email, Gmail, AI and sentiment features are left off.</p>
    </div>
'''
JS = '''
  /* OPENSTOCK-CARD v1 */
  (function osCard() {
    try {
      var chk = $("osCheck"), badge = $("osBadge"), note = $("osNote"); if (!chk || chk.getAttribute("data-bound")) return; chk.setAttribute("data-bound", "1");
      chk.addEventListener("click", function () {
        badge.textContent = "checking…"; badge.className = "badge gray";
        var done = false, t = setTimeout(function () { if (!done) { done = true; badge.textContent = "no answer"; note.textContent = "No answer from 127.0.0.1:3000 in 3 seconds. If you are on a different computer than the one running OpenStock, or Safari blocks this check, just click Open OpenStock."; } }, 3000);
        fetch("http://127.0.0.1:3000", { mode: "no-cors", cache: "no-store" }).then(function () { if (done) return; done = true; clearTimeout(t); badge.textContent = "running"; badge.className = "badge green"; note.textContent = "OpenStock answered on this computer."; }, function () { if (done) return; done = true; clearTimeout(t); badge.textContent = "not running here"; badge.className = "badge amber"; note.textContent = "Not running on this computer. Paste the start command in Terminal."; });
      });
      Array.prototype.forEach.call(document.querySelectorAll("[data-os-copy]"), function (b) { b.addEventListener("click", function () { chCopy(b.getAttribute("data-os-copy"), b); }); });
    } catch (e) {}
  })();
'''
JS_ANCHOR = 'safeRun("renderTradingDesk", renderTradingDesk);'


def patch(t, a, b, what):
    if t.count(a) != 1:
        raise SystemExit(f"ABORT: anchor not unique in {what}: {a[:50]!r} (count {t.count(a)})")
    return t.replace(a, b, 1)


def apply_deck(path):
    t = open(path, encoding="utf-8").read()
    if MARK in t:
        raise SystemExit("ABORT: already applied to " + path)
    t = patch(t, ANCHOR, CARD + ANCHOR, path)
    t = patch(t, JS_ANCHOR, JS_ANCHOR + JS, path)
    open(path, "w", encoding="utf-8").write(t); print("OpenStock card added to", path)


def apply_sources():
    p = os.path.join(HERE, "panel-tradingdesk.html"); t = open(p, encoding="utf-8").read()
    if MARK in t: print("source already patched"); return
    open(p, "w", encoding="utf-8").write(patch(t, ANCHOR, CARD + ANCHOR, p)); print("patched panel-tradingdesk.html")


if __name__ == "__main__":
    if "--sources" in sys.argv: apply_sources()
    for d in [a for a in sys.argv[1:] if not a.startswith("--")]: apply_deck(d)
