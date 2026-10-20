#!/usr/bin/env python3
"""Command Deck: Vanessa and Steve move while they speak in the chat even when no audio clip plays.
Steven, 2026-10-13: "Vanessa and Steve are supposed to be animated and move as they speak in the chat."
Until now the presence only entered "speaking" when a recorded clip, a talking loop or a rendered voice reply
actually played; a text-only reply fell to "caption-only — nothing to animate" and the portrait stayed still.
This adds a text-paced talk: the moment a reply arrives the presence goes to "speaking", nods on a word cadence
for the reading time of the text, and returns to idle — unless real audio takes over, which keeps its own handlers.
Usage: python3 splice-presence-texttalk.py <deck.html>   Refuses to run twice."""
import re
import sys

deck = sys.argv[1]
t = open(deck, encoding="utf-8").read()
MARK = "== PRESENCE-TEXTTALK 2026-10-13 =="
if MARK in t:
    raise SystemExit("ABORT: already applied")


def sub1(pat, repl, label, flags=0):
    global t
    found = len(re.findall(pat, t, flags=flags))
    if found != 1:
        raise SystemExit("ABORT: anchor " + label + " (matched %d, need exactly 1)" % found)
    t = re.sub(pat, repl, t, count=1, flags=flags)


# 1. The text-paced talk, placed right before presenceWireInput (after createPresence)
js = r'''  /* ---- Text-paced talk (2026-10-13): the face moves for every reply, audio or not ---- */
  var TEXT_TALK = {};
  function presenceTextTalkStop(who) {
    var tt = TEXT_TALK[who]; if (!tt) return;
    clearInterval(tt.timer); clearTimeout(tt.end); delete TEXT_TALK[who];
  }
  function presenceAudioLive(who) {
    try { return !!((typeof VOICE_PLAYING !== "undefined" && VOICE_PLAYING[who]) || (typeof TALK_LOOP !== "undefined" && TALK_LOOP[who])); } catch (e) { return false; }
  }
  function presenceTextTalk(who, text) {
    var p = who === "Vanessa" ? window.vanessaPresence : window.stevePresence; if (!p) return;
    presenceTextTalkStop(who);
    var words = String(text || "").trim().split(/\s+/).filter(Boolean).length; if (!words) return;
    var ms = Math.min(45000, Math.max(2500, words * 380));
    var banner = $(who === "Vanessa" ? "vanessaSpeaking" : "steveSpeaking");
    p.set("speaking"); if (who === "Steve") try { steveSetSpeaking(true); } catch (e) {}
    if (banner) banner.classList.add("on");
    var tt = { timer: 0, end: 0 };
    tt.timer = setInterval(function () {
      var s = p.get();
      if (s === "thinking" || s === "listening") {            // a new question is in flight: the talk yields at once
        presenceTextTalkStop(who); if (banner) banner.classList.remove("on"); if (who === "Steve") try { steveSetSpeaking(false); } catch (e) {}
        return;
      }
      if (s !== "speaking" && !presenceAudioLive(who)) {       // audio ended early: keep all three indicators in step
        p.set("speaking"); if (banner) banner.classList.add("on"); if (who === "Steve") try { steveSetSpeaking(true); } catch (e) {}
      }
      p.word();
    }, 230);
    tt.end = setTimeout(function () {
      presenceTextTalkStop(who);
      if (presenceAudioLive(who)) return;                 // their own voice is still going; its handlers end it
      if (p.get() === "speaking") p.set("idle");
      if (who === "Steve") try { steveSetSpeaking(false); } catch (e) {}
      if (banner) banner.classList.remove("on");
    }, ms);
    TEXT_TALK[who] = tt;
  }
'''
sub1(r'(  function presenceWireInput\(inputId, p\) \{\n)', js.replace("\\", "\\\\") + r"\1", "presenceWireInput anchor")

# 2. Start it at the top of both speak functions
sub1(r'(  function steveSpeak\(text, force\) \{\n    speakRecord\("Steve", "enter", \(text \|\| ""\)\.slice\(0, 60\)\);\n)',
     r'\1    try { presenceTextTalk("Steve", text); } catch (eTT) { speakRecord("Steve", "text-talk-threw", (eTT && eTT.message) || eTT); }\n', "steveSpeak")
sub1(r'(  function vanessaSpeak\(text, force\) \{\n    speakRecord\("Vanessa", "enter", \(text \|\| ""\)\.slice\(0, 60\)\);\n)',
     r'\1    try { presenceTextTalk("Vanessa", text); } catch (eTT) { speakRecord("Vanessa", "text-talk-threw", (eTT && eTT.message) || eTT); }\n', "vanessaSpeak")

# 3. A finished voice reply ends the text talk too (otherwise the timer would re-raise "speaking" after voiceStop)
sub1(r'(  function voiceStop\(who\) \{\n    var id = VOICE_PLAYING\[who\]; if \(!id\) return;\n)',
     r'\1    presenceTextTalkStop(who);\n', "voiceStop")

# 4. A test hook so a headless check can drive the speak path from outside the page's closure
sub1(r'(  presenceWireInput\("steveInput", window\.stevePresence\);\n)',
     r'\1' + '  window.cdSpeak = { vanessa: function (t) { return vanessaSpeak(t); }, steve: function (t) { return steveSpeak(t); } };   // test hook (2026-10-13): the speak path from outside the closure\n'.replace("\\", "\\\\"), "cdSpeak hook")

t = t.replace("<!-- == KAPSO 2026-10-13 == -->", "<!-- == KAPSO 2026-10-13 == -->\n<!-- %s -->" % MARK, 1)
assert MARK in t
open(deck, "w", encoding="utf-8").write(t)
print("ok: text-paced talk, speak hooks, voiceStop hook")
