"""Test for integrations/vanessa-voice-send.py — run it on the Mac before trusting the script.

    ~/Applications/inkbox-voice/.venv/bin/python integrations/tests/test_vanessa_voice_send.py

Needs the Inkbox SDK in the interpreter that runs it (MAC-SETUP.sh --only inkbox-voice installs
it). Uses a synthesized MPEG-1 Layer III clip by default; set VOICE_TEST_CLIP_JSON to a part file
saved by ArtifactData `get` + `out_dir` to run the same checks on a real rendered clip — it was
first run that way on 2026-09-24 against voiceReply_teststeve01_0 (27 s, 108,284 bytes): 55/55.

Runs the script as a subprocess against the REAL Inkbox SDK 0.7.7, with INKBOX_BASE_URL pointed at
a local HTTP server that imitates the three endpoints the SDK calls. Every request the SDK makes is
recorded, so each test asserts on what actually went over the wire — not on what a mock was told.
"""
import warnings; warnings.filterwarnings('ignore', category=DeprecationWarning)
import urllib.parse
import base64, cgi, hashlib, http.server, io, json, os, subprocess, sys, tempfile, threading, uuid
from pathlib import Path

HERE = Path(__file__).parent
PY = sys.executable
SCRIPT = str(HERE.parent / "vanessa-voice-send.py")
def _synth_clip(frames=260):
    """MPEG-1 Layer III, 128 kbps, 44.1 kHz: header FF FB 90 00, 417-byte frames (~108 KB)."""
    frame = bytes([0xFF, 0xFB, 0x90, 0x00]) + bytes(413)
    return b"ID3\x04\x00\x00\x00\x00\x00\x00" + frame * frames

_TMPCLIP = Path(tempfile.mkdtemp(prefix="vvs-clip-")) / "voiceReply_synth_0.json"
if os.environ.get("VOICE_TEST_CLIP_JSON"):
    CLIP_JSON = Path(os.environ["VOICE_TEST_CLIP_JSON"])
else:
    _TMPCLIP.write_text(json.dumps({"v": {"id": "synth", "who": "Vanessa", "part": 0, "of": 1,
        "durationSec": 27.0, "audio": "data:audio/mpeg;base64," + base64.b64encode(_synth_clip()).decode()}}))
    CLIP_JSON = _TMPCLIP
CONV = "11111111-2222-4333-8444-555555555555"      # a fixed test UUID, not a real thread
KEY = "ApiKey_test_0123456789abcdef"
NOW = "2026-09-24T12:00:00+00:00"
IDENT_ID = "dabc0104-6457-44d3-b8f0-2c5c64bf0c5c"

class State:
    def __init__(s): s.reset()
    def reset(s):
        s.requests = []; s.uploads = []; s.sends = []; s.keys = set()
        s.size_override = None; s.send_status = 200

ST = State()

class H(http.server.BaseHTTPRequestHandler):
    def log_message(self, *a): pass
    def _json(self, code, obj):
        b = json.dumps(obj).encode()
        self.send_response(code); self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(b))); self.end_headers(); self.wfile.write(b)
    def _p(self):
        u = urllib.parse.urlsplit(self.path); return u.path.rstrip("/"), urllib.parse.parse_qs(u.query)
    def do_GET(self):
        path, q = self._p()
        ST.requests.append(("GET", path)); ST.keys.add(self.headers.get("X-API-Key"))
        if path == "/api/v1/identities/jasmine":
            return self._json(200, {"id": IDENT_ID, "organization_id": "org_test",
                                    "agent_handle": "jasmine", "created_at": NOW, "updated_at": NOW,
                                    "imessage_enabled": True})
        self._json(404, {"detail": "not found: " + self.path})
    def do_POST(self):
        path, q = self._p()
        ST.requests.append(("POST", path)); ST.keys.add(self.headers.get("X-API-Key"))
        n = int(self.headers.get("Content-Length", 0)); body = self.rfile.read(n)
        if path == "/api/v1/imessage/media":
            env = {"REQUEST_METHOD": "POST", "CONTENT_TYPE": self.headers["Content-Type"],
                   "CONTENT_LENGTH": str(n)}
            fs = cgi.FieldStorage(fp=io.BytesIO(body), environ=env, keep_blank_values=True)
            f = fs["file"]; data = f.file.read()
            ST.uploads.append({"bytes": len(data), "sha256": hashlib.sha256(data).hexdigest(),
                               "filename": f.filename, "type": f.type})
            return self._json(200, {"media_url": "https://media.inkbox.test/u/" + uuid.uuid4().hex + ".mp3",
                                    "size": ST.size_override if ST.size_override is not None else len(data),
                                    "content_type": "audio/mpeg"})
        if path == "/api/v1/imessage/messages":
            j = json.loads(body); j["_query"] = q; ST.sends.append(j)
            if ST.send_status != 200:
                return self._json(ST.send_status, {"detail": "recipient is blocked (test)", "api_key_echo": KEY})
            return self._json(200, {"message": {"id": str(uuid.uuid4()), "conversation_id": j["conversation_id"],
                                                "direction": "outbound", "message_type": "media",
                                                "service": "imessage", "is_read": True,
                                                "created_at": NOW, "updated_at": NOW}})
        self._json(404, {"detail": "not found: " + self.path})

srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), H)
threading.Thread(target=srv.serve_forever, daemon=True).start()
BASE = "http://127.0.0.1:%d" % srv.server_address[1]

TMP = Path(tempfile.mkdtemp(prefix="vvs-"))
ALLOW = TMP / "voice-allow"; ALLOW.write_text("# Steven's Vanessa thread\n" + CONV + "\n")

def run(args, allow=ALLOW, env_extra=None):
    ST_before = len(ST.requests)
    env = dict(os.environ, INKBOX_BASE_URL=BASE, INKBOX_API_KEY=KEY, VANESSA_VOICE_ALLOW=str(allow))
    env.pop("HOME_INKBOX", None)
    if env_extra: env.update(env_extra)
    p = subprocess.run([PY, SCRIPT] + args, capture_output=True, text=True, env=env, timeout=60)
    lines = [l for l in p.stdout.splitlines() if l.strip()]
    out = json.loads(lines[-1]) if lines else {}
    return p.returncode, out, p.stdout, p.stderr

REAL = CLIP_JSON.read_text()
real_doc = json.loads(REAL); real_body = real_doc.get("v", real_doc)
REAL_BYTES = base64.b64decode(real_body["audio"].split(",", 1)[1])
REAL_SHA = hashlib.sha256(REAL_BYTES).hexdigest()

def frame_offsets(raw):
    i, offs = 0, []
    brs = {3: [0,32,40,48,56,64,80,96,112,128,160,192,224,256,320], 2: [0,8,16,24,32,40,48,56,64,80,96,112,128,144,160]}
    srs = {3: [44100,48000,32000], 2: [22050,24000,16000]}
    while i < len(raw) - 4:
        if raw[i] == 0xFF and (raw[i+1] & 0xE0) == 0xE0:
            b1, b2 = raw[i+1], raw[i+2]; ver = (b1>>3)&3; layer = (b1>>1)&3; bi = (b2>>4)&15; si = (b2>>2)&3; pad = (b2>>1)&1
            if layer == 1 and bi not in (0, 15) and si != 3 and ver in brs:
                fl = (144*brs[ver][bi]*1000//srs[ver][si] + pad) if ver == 3 else (72*brs[ver][bi]*1000//srs[ver][si] + pad)
                if fl > 0: offs.append(i); i += fl; continue
        i += 1
    return offs

def write_parts(chunks, d, of=None, start=0):
    d.mkdir(parents=True, exist_ok=True); paths = []
    for k, c in enumerate(chunks):
        p = d / ("voiceReply_t_%d.json" % k)
        p.write_text(json.dumps({"v": {"id": "t", "who": "Vanessa", "part": k + start,
                                        "of": of if of is not None else len(chunks), "durationSec": 9.0,
                                        "audio": "data:audio/mpeg;base64," + base64.b64encode(c).decode()}}))
        paths.append(str(p))
    return paths

results = []
def check(name, cond, detail=""):
    results.append((name, bool(cond), detail)); print(("PASS " if cond else "FAIL ") + name + (("  — " + detail) if detail and not cond else ""))

# ---------------------------------------------------------------------------------------------
# 1. The real clip, end to end through the real SDK
ST.reset()
rc, out, raw_out, err = run(["--conversation-id", CONV, "--parts", str(CLIP_JSON)])
check("clip: exit 0 and ok", rc == 0 and out.get("ok") is True, f"rc={rc} out={out} err={err[-300:]}")
check("clip: exactly one upload", len(ST.uploads) == 1, str(ST.uploads))
check("clip: uploaded bytes == the clip", ST.uploads and ST.uploads[0]["bytes"] == len(REAL_BYTES), str(ST.uploads))
check("clip: uploaded sha256 == the store's clip", ST.uploads and ST.uploads[0]["sha256"] == REAL_SHA)
check("clip: uploaded as audio/mpeg", ST.uploads and ST.uploads[0]["type"] == "audio/mpeg", str(ST.uploads))
check("clip: exactly one send", len(ST.sends) == 1, str(ST.sends))
s = ST.sends[0] if ST.sends else {}
check("send: into the conversation, by id", s.get("conversation_id") == CONV, str(s))
check("send: NO `to` field — no phone number ever handled", "to" not in s, str(s))
check("send: one media URL, the one Inkbox returned", len(s.get("media_urls", [])) == 1 and s["media_urls"][0].startswith("https://media.inkbox.test/"), str(s))
check("send: no text repeated with the audio", "text" not in s, str(s))
check("send: scoped to Vanessa's identity (agent_identity_id query)", s.get("_query", {}).get("agent_identity_id") == [IDENT_ID], str(s.get("_query")))
check("auth: X-API-Key carried the configured key", ST.keys == {KEY}, str(ST.keys))
check("stdout: exactly one JSON line", len([l for l in raw_out.splitlines() if l.strip()]) == 1, raw_out)
check("stdout: no audio, no media URL, no key", ("base64" not in raw_out and "inkbox.test" not in raw_out
                                                and KEY not in raw_out and "SUQz" not in raw_out), raw_out)
check("stdout: reports bytes and parts", out.get("bytes") == len(REAL_BYTES) and out.get("parts") == 1, str(out))
check("wire: only the three expected endpoints were called",
      [p for _, p in ST.requests] == ["/api/v1/identities/jasmine", "/api/v1/imessage/media", "/api/v1/imessage/messages"],
      str(ST.requests))

# 2. Multi-part: the real clip split into 3 frame-aligned parts must reassemble byte-for-byte
ST.reset()
offs = frame_offsets(REAL_BYTES); cut1, cut2 = offs[len(offs)//3], offs[2*len(offs)//3]
chunks = [REAL_BYTES[:cut1], REAL_BYTES[cut1:cut2], REAL_BYTES[cut2:]]
paths = write_parts(chunks, TMP / "three")
rc, out, _, err = run(["--conversation-id", CONV, "--parts"] + list(reversed(paths)))  # out of order on purpose
check("3 parts, given out of order: reassembled sha256 == original", rc == 0 and ST.uploads and ST.uploads[0]["sha256"] == REAL_SHA,
      f"rc={rc} {out} {ST.uploads}")
check("3 parts: one upload, one send", len(ST.uploads) == 1 and len(ST.sends) == 1)
check("3 parts: durations summed", out.get("durationSec") == 27.0, str(out))

# 3. A glob, as the task will pass it
ST.reset()
rc, out, _, _ = run(["--conversation-id", CONV, "--parts", str(TMP / "three" / "voiceReply_t_*.json")])
check("glob of parts works", rc == 0 and ST.uploads and ST.uploads[0]["sha256"] == REAL_SHA, str(out))

# ---- refusals: each must make ZERO network requests ------------------------------------------
def refuses(name, args, code, allow=ALLOW, setup=None):
    ST.reset()
    if setup: setup()
    rc, out, raw_out, err = run(args, allow=allow)
    check(f"{name}: exit {code}", rc == code, f"rc={rc} out={out} err={err[-200:]}")
    check(f"{name}: zero network requests", ST.requests == [], str(ST.requests))
    check(f"{name}: one JSON line, ok:false", out.get("ok") is False and len([l for l in raw_out.splitlines() if l.strip()]) == 1, raw_out)

refuses("conversation not allow-listed", ["--conversation-id", str(uuid.uuid4()), "--parts", str(CLIP_JSON)], 5)
refuses("no allow-list file at all", ["--conversation-id", CONV, "--parts", str(CLIP_JSON)], 5, allow=TMP / "missing")
empty = TMP / "empty-allow"; empty.write_text("# nothing\n\n")
refuses("allow-list with only comments", ["--conversation-id", CONV, "--parts", str(CLIP_JSON)], 5, allow=empty)
refuses("conversation-id not a UUID", ["--conversation-id", "+16195550100", "--parts", str(CLIP_JSON)], 2)
gap = write_parts([chunks[0], chunks[2]], TMP / "gap", of=3)
refuses("missing middle part", ["--conversation-id", CONV, "--parts"] + gap, 3)
dup = write_parts([chunks[0], chunks[0]], TMP / "dup", of=2)
json_dup = json.loads(Path(dup[1]).read_text()); json_dup["v"]["part"] = 0; Path(dup[1]).write_text(json.dumps(json_dup))
refuses("duplicate part number", ["--conversation-id", CONV, "--parts"] + dup, 3)
bad = TMP / "bad.json"; bad.write_text(json.dumps({"v": {"part": 0, "of": 1, "audio": "data:audio/mpeg;base64,@@not-base64@@"}}))
refuses("corrupt base64", ["--conversation-id", CONV, "--parts", str(bad)], 3)
notmp3 = TMP / "notmp3.json"; notmp3.write_text(json.dumps({"v": {"part": 0, "of": 1, "audio": "data:audio/mpeg;base64," + base64.b64encode(b"<html>not audio</html>").decode()}}))
refuses("bytes that are not an MP3", ["--conversation-id", CONV, "--parts", str(notmp3)], 3)
big = TMP / "big.mp3"; big.write_bytes(b"ID3" + b"\x00" * (10 * 1024 * 1024))
refuses("clip over 10 MiB (never truncated)", ["--conversation-id", CONV, "--mp3", str(big)], 4)

# dry run: validates and assembles, never touches the network
ST.reset()
rc, out, _, _ = run(["--conversation-id", CONV, "--parts", str(CLIP_JSON), "--dry-run"])
check("dry-run: exit 0, sent false, bytes reported", rc == 0 and out.get("sent") is False and out.get("bytes") == len(REAL_BYTES), str(out))
check("dry-run: zero network requests", ST.requests == [], str(ST.requests))

# ---- Inkbox-side failures ----------------------------------------------------------------------
ST.reset(); ST.size_override = 999
rc, out, _, _ = run(["--conversation-id", CONV, "--parts", str(CLIP_JSON)])
check("upload size mismatch: exit 6", rc == 6, f"rc={rc} {out}")
check("upload size mismatch: NOTHING sent", ST.sends == [], str(ST.sends))

ST.reset(); ST.send_status = 403
rc, out, raw_out, _ = run(["--conversation-id", CONV, "--parts", str(CLIP_JSON)])
check("send refused 403: exit 6, ok false", rc == 6 and out.get("ok") is False, f"rc={rc} {out}")
check("send refused 403: exactly one attempt, no retry", len(ST.sends) == 1, str(ST.sends))
check("send refused 403: key scrubbed from the error even if echoed", KEY not in raw_out, raw_out)

# no API key configured
ST.reset()
rc, out, raw_out, err = run(["--conversation-id", CONV, "--parts", str(CLIP_JSON)],
                            env_extra={"INKBOX_API_KEY": "", "HOME": str(TMP)})
check("no API key: fails cleanly (exit 6), no send", rc == 6 and ST.sends == [], f"rc={rc} {out} {err[-200:]}")

print()
bad_n = sum(1 for _, ok, _ in results if not ok)
print("%d checks, %d failed" % (len(results), bad_n))
srv.shutdown()
sys.exit(1 if bad_n else 0)
