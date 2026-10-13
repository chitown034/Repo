#!/usr/bin/env python3
"""Command Deck: WhatsApp through Kapso — the reach-table row, a "WhatsApp — Kapso" card on the Vanessa panel, and a
freshness watch on the `whatsappKapso` document. Usage: python3 splice-kapso.py <deck.html>   Refuses to run twice."""
import re
import sys

deck = sys.argv[1]
t = open(deck, encoding="utf-8").read()
MARK = "== KAPSO 2026-10-13 =="
if MARK in t:
    raise SystemExit("ABORT: already applied")


def sub1(pat, repl, label, flags=0):
    global t
    t, n = re.subn(pat, repl, t, count=1, flags=flags)
    if n != 1:
        raise SystemExit("ABORT: anchor " + label)


# 1. Reach table: the WhatsApp row now describes the Kapso path; its badge is live from the document
sub1(r'<tr><td>WhatsApp <span class="src-note" style="display:block;margin:0;">via <code>whatsapp-cli</code>.*?</tr>\n',
     '<tr><td>WhatsApp <span class="src-note" style="display:block;margin:0;">via <b>Kapso</b> (WhatsApp Business Cloud API; MCP server <code>kapso</code> registered for every Claude Code session, Orca included) — Phase 1 is the Kapso sandbox number and your own phone; a business number is Phase 2 (Needs-Steven). Rules: <code>.claude/skills/whatsapp-kapso</code></span></td><td><span class="badge gray" id="kapsoReachBadge">installed by go.sh step 11 · sign in once: <code>claude</code> → <code>/mcp</code> → kapso</span></td></tr>\n',
     "reach row", flags=re.S)

# 2. The old explanatory paragraph under the table
sub1(r'<p class="src-note" style="margin-top:8px;">WhatsApp is on this list as <b>installed, not live</b>.*?</p>',
     '<p class="src-note" style="margin-top:8px;">WhatsApp changed route on 2026-10-13: the <code>whatsapp-cli</code> / WhatsApp-desktop path (never live) is retired in favour of <b>Kapso</b>, a hosted WhatsApp <b>Business</b> Cloud API with a free sandbox number — the supported route the earlier note said was real but needed a Meta Business account. Kapso handles that; the sandbox needs only a sign-in. The card below shows the live state.</p>',
     "reach note", flags=re.S)

# 3. The card, after the iMessage/Discord inbox card
card = '''      <div class="card" id="kapsoCard" style="min-width:0;">
        <div class="card-title-row" style="flex-wrap:wrap;row-gap:4px;"><p class="card-title" style="margin:0;">WhatsApp — Kapso</p><span class="badge gray" id="kapsoBadge">—</span></div>
        <p class="card-sub" id="kapsoSub">Vanessa on WhatsApp through Kapso (WhatsApp Business Cloud API). Phase 1: the Kapso sandbox number, your own phone only. Any Claude Code session — including each one Orca launches — reads and answers the thread through the <code>kapso</code> MCP server.</p>
        <div class="table-wrap"><table><thead><tr><th>Number</th><th>Kind</th><th>State</th></tr></thead><tbody id="kapsoNumbers"></tbody></table></div>
        <div class="table-wrap" style="margin-top:8px;"><table><thead><tr><th>Thread</th><th>Last message</th><th>Direction</th><th>Unread</th></tr></thead><tbody id="kapsoThreads"></tbody></table></div>
        <p class="src-note" id="kapsoNote" style="margin-top:8px;">Set up once on the Mac: <button type="button" class="ghost" data-copy="bash integrations/kapso/install-mac.sh install --apply">bash integrations/kapso/install-mac.sh install --apply</button> <span class="src-note">(copies)</span>, then in Terminal <code>claude</code> → <code>/mcp</code> → kapso → sign in. This card lists contacts and times only — never a message body — and is written every 10 minutes by the <code>kapso-inbox-sync</code> Mac task once registered (until then, any Claude Code session can write it: say “update the WhatsApp card”).</p>
      </div>
'''
sub1(r'(      <div class="card" style="min-width:0;">\n        <p class="card-title">Vanessa Live — talk to Vanessa from your phone</p>)',
     card.replace("\\", "\\\\") + r"\1", "card anchor")

# 4. Renderer, beside the agent-inbox renderer
js = r'''  function renderKapsoCard() {
    var nums = $("kapsoNumbers"), th = $("kapsoThreads"), badge = $("kapsoBadge"), reach = $("kapsoReachBadge"); if (!nums || !th) return;
    var d = lsGet("whatsappKapso", null);
    function setBadge(cls, text) { if (badge) { badge.className = "badge " + cls; badge.textContent = text; } if (reach) { reach.className = "badge " + cls; reach.textContent = text; } }
    if (!d || typeof d !== "object" || typeof d.status !== "string") {
      setBadge("gray", "not configured — run install-mac.sh, then /mcp sign-in");
      nums.innerHTML = '<tr><td colspan="3" class="src-note">No whatsappKapso document yet. After the sign-in, paste the Kapso project key into the Keychain item “kapso”, then <code>bash integrations/kapso/install-mac.sh doctor</code> shows the live state and the sync task fills this card.</td></tr>';
      th.innerHTML = '<tr><td colspan="4" class="src-note">—</td></tr>';
      return;
    }
    var st = String(d.status), counts = d.counts || {};
    var cls = /^error/.test(st) ? "red" : /^not configured|no number/.test(st) ? "gray" : counts.unread ? "amber" : "green";
    setBadge(cls, (st.length > 70 ? st.slice(0, 67) + "…" : st) + (d.syncedAt ? " · synced " + orStampText(d.syncedAt) : ""));
    var list = docRows(d.numbers);
    nums.innerHTML = list.map(function (n) {
      return "<tr><td>" + chatEsc(String(n.label || "")) + " " + chatEsc(String(n.masked || "")) + "</td><td>" + chatEsc(String(n.kind || "")) + "</td><td><span class=\"badge " + (n.connected ? "green" : "gray") + "\">" + (n.connected ? "connected" : "not connected") + "</span></td></tr>";
    }).join("") || '<tr><td colspan="3" class="src-note">No number connected yet — say “Open Kapso” in Claude Code to set up the sandbox number.</td></tr>';
    var convs = docRows(d.conversations).slice(0, 10);
    th.innerHTML = convs.map(function (c) {
      return "<tr><td>" + chatEsc(String(c.contact || "")) + "</td><td>" + chatEsc(String(c.lastAt || "").replace("T", " ").slice(0, 16) || "—") + "</td><td>" + chatEsc(String(c.lastDirection || "")) + "</td><td>" + chatEsc(String(c.unread || 0)) + "</td></tr>";
    }).join("") || '<tr><td colspan="4" class="src-note">No conversations yet.</td></tr>';
  }
  safeRun("renderKapsoCard", renderKapsoCard);
'''
sub1(r'(  safeRun\("renderAgentInbox", renderAgentInbox\);\n)', r"\1" + js.replace("\\", "\\\\"), "renderer anchor")

# 5. Freshness watch
sub1(r'(  var OUTPUT_WATCH = \[\n)', r'\1    { doc: "whatsappKapso",        label: "WhatsApp (Kapso)",     task: "kapso-inbox-sync",        hrs: 1 },\n', "output watch")

t = t.replace("<!-- == STALE-REFRESH 2026-10-12 == -->", "<!-- == STALE-REFRESH 2026-10-12 == -->\n<!-- %s -->" % MARK, 1)
assert MARK in t
open(deck, "w", encoding="utf-8").write(t)
print("ok: reach row, note, card, renderer, output watch")
