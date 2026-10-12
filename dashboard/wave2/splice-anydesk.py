#!/usr/bin/env python3
"""Add "Remote access — every computer" (AnyDesk) to Panel 40 of the Command Deck, and keep the wave2 sources in step.

Usage: python3 splice-anydesk.py <deck.html> [--sources]   (--sources also patches panel-computerhub.{html,js,css} here)
What it adds: one card at the top of the Computer Hub with every device, its AnyDesk ID and a Connect button; the IDs
move from this-browser-only storage to the deck's shared store (an AnyDesk ID is an address, like a phone number — the
password never leaves the AnyDesk app on that machine); a one-time "unattended access" how-to. Refuses to run twice."""
import os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
MARK = "AD-REMOTE v1"

HTML_ANCHOR = '    <div class="card" style="margin-bottom:16px;">\n      <p class="card-title">How this works</p>'
HTML_NEW = '''    <div class="card" style="margin-bottom:16px;border-left:4px solid var(--accent);" id="chRemoteCard"><!-- AD-REMOTE v1 -->
      <div class="card-title-row"><p class="card-title">Remote access &mdash; every computer from here (AnyDesk)</p><span class="badge gray" id="chRemoteBadge">no IDs yet</span></div>
      <p class="card-sub" style="margin-top:0;">One button per computer, from any device that has the AnyDesk app. Type each computer's AnyDesk <b>ID</b> (the 9&ndash;10 digit number on its AnyDesk screen) in its card below; the IDs are saved to this dashboard so your phone, tablet and both Macs all see them. The password is never typed here &mdash; AnyDesk on the computer you are reaching asks for it, or unattended access skips the prompt.</p>
      <div class="ch-remote" id="chRemote"></div>
      <details class="ch-remote-how"><summary>One-time setup on each computer (unattended access)</summary>
        <ol>
          <li>Install AnyDesk on the computer (Mac: anydesk.com &rarr; Download; the Alienware setup script checks it is there).</li>
          <li>Open AnyDesk &rarr; Settings &rarr; Security &rarr; <b>Enable unattended access</b> &rarr; set a strong password. That password stays on that computer.</li>
          <li>Copy the ID from AnyDesk's main screen ("This Desk") and save it in that computer's card below.</li>
          <li>On the phone or tablet, install the AnyDesk app once; the Connect buttons then open it with the right ID.</li>
        </ol>
      </details>
    </div>
'''

JS_ANCHOR_SAVE = 'function chSave(s) { lsSetLocal("computerHub", s); }'
JS_NEW_SAVE = ('function chSave(s) { lsSetLocal("computerHub", s); }\n'
               '  /* AD-REMOTE v1: AnyDesk IDs live in the shared store so every device sees them; ticks stay device-local. */\n'
               '  function chIds() { var o = lsGet("anydeskIds", {}); return (o && typeof o === "object" && !Array.isArray(o)) ? o : {}; }\n'
               '  function chSetId(dev, v) { var o = chIds(); if (v) o[dev] = v; else delete o[dev]; lsSet("anydeskIds", o); }\n'
               '  function renderRemoteAccess() {\n'
               '    var host = $("chRemote"), badge = $("chRemoteBadge"); if (!host) return;\n'
               '    var ids = chIds(), n = 0; host.innerHTML = "";\n'
               '    CH_DEVICES.forEach(function (dev) {\n'
               '      var id = ids[dev.id] || "", ok = !!(id && CH_ID_RE.test(id)); if (ok) n++;\n'
               '      var row = document.createElement("div"); row.className = "ch-remote-row" + (ok ? " is-ok" : "");\n'
               '      var ic = document.createElement("span"); ic.className = "ch-remote-ic"; ic.innerHTML = CH_ICON[dev.kind] || ""; row.appendChild(ic);\n'
               '      var nm = document.createElement("span"); nm.className = "ch-remote-name"; nm.textContent = dev.name; row.appendChild(nm);\n'
               '      var idt = document.createElement("span"); idt.className = "ch-remote-id"; idt.textContent = ok ? id.replace(/(\\d{3})(?=\\d)/g, "$1 ") : "no ID saved"; row.appendChild(idt);\n'
               '      if (ok) {\n'
               '        var a = document.createElement("a"); a.className = "ch-btn ch-btn-go"; a.href = "anydesk:" + id; a.textContent = "Connect"; a.title = "Opens AnyDesk on this device and dials " + dev.name; row.appendChild(a);\n'
               '        var c = document.createElement("button"); c.type = "button"; c.className = "ch-copy"; c.textContent = "Copy ID"; c.addEventListener("click", function () { chCopy(id, c); }); row.appendChild(c);\n'
               '      } else { var t = document.createElement("span"); t.className = "src-note"; t.textContent = "save the ID in the " + dev.name + " card below"; row.appendChild(t); }\n'
               '      host.appendChild(row);\n'
               '    });\n'
               '    if (badge) { badge.textContent = n ? n + " of " + CH_DEVICES.length + " reachable" : "no IDs yet"; badge.className = "badge " + (n ? "green" : "gray"); }\n'
               '  }')
JS_ANCHOR_RENDER = '    var st = chState(); grid.innerHTML = "";'
JS_NEW_RENDER = '    var st = chState(); grid.innerHTML = "";\n    renderRemoteAccess();  /* AD-REMOTE v1 */\n    var chSharedIds = chIds();'
JS_ANCHOR_READ = 'inp.value = ds.anydesk || "";'
JS_NEW_READ = 'inp.value = chSharedIds[dev.id] || ds.anydesk || "";'
JS_ANCHOR_WRITE = 'var s2 = chState(), d2 = chDevState(s2, dev.id); d2.anydesk = v; if (v) d2.done.any = true; chSave(s2); renderComputerHub();'
JS_NEW_WRITE = 'var s2 = chState(), d2 = chDevState(s2, dev.id); d2.anydesk = v; if (v) d2.done.any = true; chSave(s2); chSetId(dev.id, v); renderComputerHub();'
JS_ANCHOR_GO = 'if (ds.anydesk && CH_ID_RE.test(ds.anydesk)) {'
JS_NEW_GO = 'if ((chSharedIds[dev.id] || ds.anydesk) && CH_ID_RE.test(chSharedIds[dev.id] || ds.anydesk)) { ds.anydesk = chSharedIds[dev.id] || ds.anydesk;'

CSS_NEW = '''/* AD-REMOTE v1 */
.ch-remote { display: grid; gap: 8px; margin: 10px 0 6px; }
.ch-remote-row { display: grid; grid-template-columns: 34px 1fr auto auto auto; gap: 10px; align-items: center; padding: 8px 10px; border: 1px solid var(--border); border-radius: 10px; background: var(--surface-2); }
.ch-remote-row.is-ok { border-color: color-mix(in srgb, var(--positive) 45%, var(--border)); }
.ch-remote-ic svg { width: 30px; height: 22px; color: var(--text-dim); display: block; }
.ch-remote-name { font-weight: 600; } .ch-remote-id { font-family: var(--font-mono); font-size: 12.5px; color: var(--text-dim); font-variant-numeric: tabular-nums; }
.ch-remote-row .ch-btn { min-height: 36px; padding: 6px 14px; } .ch-remote-row .src-note { grid-column: 3 / -1; margin: 0; }
.ch-remote-how summary { cursor: pointer; font-size: 12.5px; color: var(--text-dim); min-height: 36px; display: flex; align-items: center; } .ch-remote-how ol { margin: 6px 0 0; padding-left: 20px; font-size: 13px; line-height: 1.5; }
@media (max-width: 640px) { .ch-remote-row { grid-template-columns: 30px 1fr auto; } .ch-remote-id { grid-column: 2; } .ch-remote-row .ch-copy { grid-column: 3; } }
'''


def patch(text, pairs, what):
    for a, b in pairs:
        if text.count(a) != 1:
            raise SystemExit(f"ABORT: anchor not unique in {what}: {a[:60]!r} (count {text.count(a)})")
        text = text.replace(a, b, 1)
    return text


def apply_deck(path):
    t = open(path, encoding="utf-8").read()
    if MARK in t:
        raise SystemExit("ABORT: already applied to " + path)
    t = patch(t, [(HTML_ANCHOR, HTML_NEW + HTML_ANCHOR), (JS_ANCHOR_SAVE, JS_NEW_SAVE), (JS_ANCHOR_RENDER, JS_NEW_RENDER),
                  (JS_ANCHOR_READ, JS_NEW_READ), (JS_ANCHOR_WRITE, JS_NEW_WRITE), (JS_ANCHOR_GO, JS_NEW_GO)], path)
    i = t.index("/* ---- Travel filter bar ---- */")   # the wave-2 CSS block sits just before this; add ours beside it
    t = t[:i] + CSS_NEW + t[i:]
    open(path, "w", encoding="utf-8").write(t)
    print("AnyDesk remote-access card added to", path)


def apply_sources():
    for name, pairs in (("panel-computerhub.html", [(HTML_ANCHOR, HTML_NEW + HTML_ANCHOR)]),
                        ("panel-computerhub.js", [(JS_ANCHOR_SAVE, JS_NEW_SAVE), (JS_ANCHOR_RENDER, JS_NEW_RENDER), (JS_ANCHOR_READ, JS_NEW_READ),
                                                  (JS_ANCHOR_WRITE, JS_NEW_WRITE), (JS_ANCHOR_GO, JS_NEW_GO)])):
        p = os.path.join(HERE, name); t = open(p, encoding="utf-8").read()
        if MARK in t:
            print("sources already patched:", name); continue
        open(p, "w", encoding="utf-8").write(patch(t, pairs, name)); print("patched", name)
    p = os.path.join(HERE, "panel-computerhub.css"); t = open(p, encoding="utf-8").read()
    if MARK not in t:
        open(p, "w", encoding="utf-8").write(t.rstrip("\n") + "\n" + CSS_NEW); print("patched panel-computerhub.css")


if __name__ == "__main__":
    if "--sources" in sys.argv:
        apply_sources()
    targets = [a for a in sys.argv[1:] if not a.startswith("--")]
    for d in targets:
        apply_deck(d)
