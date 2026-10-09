#!/usr/bin/env python3
"""End-to-end tests for vanessa-bridge.py against a stand-in OpenWA and a stand-in `claude`.

Nothing here touches WhatsApp, a Keychain or a real Claude session: a small HTTP server plays
OpenWA's three routes (health, a self-chat's live history, send-text) with the same fence rules as
the real one (wrong key -> 401, any chat but the self-chat -> 403), and a small script plays
`claude -p --output-format json`. Each test runs the real bridge as a subprocess with `--once`.

Run:  python3 integrations/openwa/tests/test_vanessa_bridge.py
"""
import json
import os
import shutil
import subprocess
import sys
import tempfile
import threading
import time
import unittest
import uuid
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

HERE = os.path.dirname(os.path.abspath(__file__))
BRIDGE = os.path.join(os.path.dirname(HERE), "vanessa-bridge.py")
ME = "15550009999@c.us"        # a made-up number, never a real one
SID = "sess-0001"
VKEY = "owa_test_operator_key"
ADMIN_KEY = "owa_test_admin_key"
INSTALLER = os.path.join(os.path.dirname(HERE), "install-bridge.sh")

STUB_CLAUDE = r'''#!/usr/bin/env python3
import json, os, re, sys
prompt = sys.stdin.read()
with open(os.environ["STUB_RECORD"], "a") as fh:
    fh.write(json.dumps({"argv": sys.argv[1:], "prompt": prompt}) + "\n")
m = re.search(r"<message>\n(.*)\n</message>", prompt, re.S)
asked = (m.group(1) if m else "?").strip()
mode = os.environ.get("STUB_MODE", "ok")
if mode == "fail":
    print(json.dumps({"type": "result", "subtype": "error_during_execution", "is_error": True,
                      "result": "You've hit your session limit - resets 6am (UTC)"}))
    sys.exit(1)
if mode == "long":
    text = "\n\n".join("Paragraph %d. " % i + "word " * 150 for i in range(1, 6))
elif mode == "prefixed":
    text = "[V] Already prefixed answer."
else:
    text = "Answer about: " + asked[:40]
print(json.dumps({"type": "result", "subtype": "success", "is_error": False, "result": text}, indent=2))
'''


STUB_SECURITY = r'''#!/usr/bin/env python3
import json, os, sys
db = os.environ["STUB_KEYCHAIN"]
items = json.load(open(db)) if os.path.exists(db) else {}
a = sys.argv[1:]
item = a[a.index("-s") + 1] if "-s" in a else ""
if a[0] == "find-generic-password":
    if item in items:
        print(items[item]) if "-w" in a else None
        sys.exit(0)
    sys.exit(44)
if a[0] == "add-generic-password":
    if item in items and "-U" not in a:
        sys.exit(45)
    items[item] = a[a.index("-w") + 1]
elif a[0] == "delete-generic-password":
    items.pop(item, None)
json.dump(items, open(db, "w"))
'''

STUB_LAUNCHCTL = r'''#!/usr/bin/env bash
echo "$*" >> "$STUB_LAUNCHCTL_LOG"
if [ "$1" = "bootstrap" ] || [ "$1" = "load" ]; then
  mkdir -p "$HOME/Library/Logs"
  echo '{"ts": "now", "event": "started", "poll": 20}' >> "$HOME/Library/Logs/vanessa-whatsapp-bridge.log"
fi
exit 0
'''


class StubOpenWA:
    def __init__(self):
        self.chat = []     # oldest first, like OpenWA's live history
        self.sends = []
        stub = self

        class Handler(BaseHTTPRequestHandler):
            def log_message(self, *a):
                pass

            def _json(self, code, obj):
                raw = json.dumps(obj).encode()
                self.send_response(code)
                self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(raw)))
                self.end_headers()
                self.wfile.write(raw)

            def do_GET(self):
                if self.path == "/api/health":
                    return self._json(200, {"status": "ok"})
                if self.headers.get("X-API-Key") == ADMIN_KEY:
                    if self.path == "/api/sessions":
                        return self._json(200, [{"id": SID, "name": "steven-selfchat"}])
                    if self.path == "/api/sessions/%s" % SID:
                        return self._json(200, {"id": SID, "name": "steven-selfchat", "status": "ready",
                                                "phone": ME.split("@")[0]})
                if self.headers.get("X-API-Key") != VKEY:
                    return self._json(401, {"message": "bad key"})
                prefix = "/api/sessions/%s/messages/" % SID
                if self.path.startswith(prefix) and "/history" in self.path:
                    chat = self.path[len(prefix):].split("/history")[0]
                    if chat != ME:
                        return self._json(403, {"message": "API key not authorized for this chat"})
                    limit = int(self.path.split("limit=")[1]) if "limit=" in self.path else 50
                    return self._json(200, stub.chat[-limit:])
                return self._json(403, {"message": "API key is restricted to selected chats"})

            def do_POST(self):
                if self.headers.get("X-API-Key") != VKEY:
                    return self._json(401, {"message": "bad key"})
                body = json.loads(self.rfile.read(int(self.headers.get("Content-Length", 0))) or b"{}")
                if self.path != "/api/sessions/%s/messages/send-text" % SID:
                    return self._json(403, {"message": "restricted"})
                if body.get("chatId") != ME:
                    return self._json(403, {"message": "API key not authorized for this chat"})
                stub.sends.append(body["text"])
                stub.add(body["text"])
                return self._json(201, {"messageId": "m-%d" % len(stub.sends), "status": "sent"})

        self.server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
        self.port = self.server.server_address[1]
        threading.Thread(target=self.server.serve_forever, daemon=True).start()

    def add(self, body, from_me=True, age_s=0, mtype="text"):
        self.chat.append({"id": "true_%s_%s" % (ME, uuid.uuid4().hex[:20].upper()), "from": ME, "to": ME,
                          "chatId": ME, "body": body, "type": mtype, "fromMe": from_me,
                          "timestamp": int(time.time() - age_s)})

    def close(self):
        self.server.shutdown()


class BridgeTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.mkdtemp(prefix="vbridge-")
        self.wa = StubOpenWA()
        self.claude = os.path.join(self.tmp, "claude")
        with open(self.claude, "w") as fh:
            fh.write(STUB_CLAUDE)
        os.chmod(self.claude, 0o755)
        self.record = os.path.join(self.tmp, "claude-calls.jsonl")
        self.home = os.path.join(self.tmp, "home")
        os.makedirs(self.home)
        self.env = dict(os.environ, HOME=self.home, OPENWA_API="http://127.0.0.1:%d/api" % self.wa.port,
                        VANESSA_BRIDGE_KEY=VKEY, VANESSA_BRIDGE_CONFIG=json.dumps({"sid": SID, "me": ME}),
                        VANESSA_BRIDGE_STATE_DIR=os.path.join(self.tmp, "state"),
                        VANESSA_BRIDGE_LOG=os.path.join(self.tmp, "bridge.log"),
                        VANESSA_BRIDGE_RETRY_GAP="0", STUB_RECORD=self.record, STUB_MODE="ok")

    def tearDown(self):
        self.wa.close()
        shutil.rmtree(self.tmp, ignore_errors=True)

    def run_bridge(self, *flags, **env):
        e = dict(self.env, **env)
        return subprocess.run([sys.executable, BRIDGE, *(flags or ("--once",)), "--claude", self.claude,
                               "--repo", self.tmp], env=e, capture_output=True, text=True, timeout=60)

    def state(self):
        with open(os.path.join(self.tmp, "state", "state.json")) as fh:
            return json.load(fh)

    def initialized(self, backlog=("old note 1", "old note 2")):
        for b in backlog:
            self.wa.add(b, age_s=3600)
        self.run_bridge()
        self.assertEqual(self.wa.sends, [], "the first poll must answer nothing")

    # -- behaviour -------------------------------------------------------------------------------

    def test_first_poll_answers_nothing_and_marks_backlog_seen(self):
        self.initialized()
        st = self.state()
        self.assertTrue(st["initialized"])
        self.assertEqual(len(st["seen"]), 2)
        self.run_bridge()
        self.assertEqual(self.wa.sends, [])

    def test_answers_a_new_message_once_and_ignores_its_own_echo(self):
        self.initialized()
        self.wa.add("Vanessa, what's the VA funding fee on a first use?")
        self.run_bridge()
        self.assertEqual(len(self.wa.sends), 1)
        self.assertTrue(self.wa.sends[0].startswith("[V] Answer about: Vanessa, what's the VA"))
        self.run_bridge()
        self.run_bridge()
        self.assertEqual(len(self.wa.sends), 1, "her own reply must never be answered")

    def test_message_starting_with_marker_is_ignored(self):
        self.initialized()
        self.wa.add("[V] typed by Steven with the marker")
        self.run_bridge()
        self.assertEqual(self.wa.sends, [])

    def test_answer_already_prefixed_is_not_double_marked(self):
        self.initialized()
        self.wa.add("hello")
        self.run_bridge(STUB_MODE="prefixed")
        self.assertEqual(self.wa.sends, ["[V] Already prefixed answer."])

    def test_long_answer_is_split_and_every_part_carries_the_marker(self):
        self.initialized()
        self.wa.add("give me the long version")
        self.run_bridge(STUB_MODE="long")
        self.assertGreaterEqual(len(self.wa.sends), 3)
        for part in self.wa.sends:
            self.assertTrue(part.startswith("[V] "), part[:20])
            self.assertLessEqual(len(part), 1500)
        first = len(self.wa.sends)
        self.run_bridge()
        self.assertEqual(len(self.wa.sends), first, "her own multi-part reply must not be answered")

    def test_per_poll_cap_answers_the_newest_three(self):
        self.initialized()
        for i in range(5):
            self.wa.add("question %d" % i)
        self.run_bridge()
        self.assertEqual(len(self.wa.sends), 3)
        self.assertEqual([s.split(": ")[1] for s in self.wa.sends], ["question 2", "question 3", "question 4"])
        self.run_bridge()
        self.assertEqual(len(self.wa.sends), 3, "skipped messages are not answered later")

    def test_daily_ceiling_sends_a_notice_last_then_stops(self):
        self.initialized()
        st = self.state()
        st["sentToday"] = {"date": time.strftime("%Y-%m-%d"), "count": 18}
        with open(os.path.join(self.tmp, "state", "state.json"), "w") as fh:
            json.dump(st, fh)
        self.wa.add("long one please")
        self.run_bridge(STUB_MODE="long")
        self.assertEqual(len(self.wa.sends), 2)
        self.assertIn("today's limit of 20", self.wa.sends[1])
        self.wa.add("are you there?")
        self.run_bridge()
        self.assertEqual(len(self.wa.sends), 2, "nothing is sent after the ceiling")

    def test_claude_failure_retries_then_one_notice(self):
        self.initialized()
        self.wa.add("what's on my calendar?")
        self.run_bridge(STUB_MODE="fail")
        self.run_bridge(STUB_MODE="fail")
        self.assertEqual(self.wa.sends, [], "no reply while retries remain")
        self.run_bridge(STUB_MODE="fail")
        self.assertEqual(len(self.wa.sends), 1)
        self.assertIn("couldn't answer your message", self.wa.sends[0])
        self.assertIn("usage limit", self.wa.sends[0])
        self.run_bridge(STUB_MODE="fail")
        self.assertEqual(len(self.wa.sends), 1)

    def test_voice_note_gets_one_short_notice(self):
        self.initialized()
        self.wa.add("", mtype="ptt")
        self.run_bridge()
        self.assertEqual(len(self.wa.sends), 1)
        self.assertIn("Voice notes", self.wa.sends[0])

    def test_stale_and_foreign_messages_are_ignored(self):
        self.initialized()
        self.wa.add("from last night", age_s=13 * 3600)
        self.wa.add("someone else", from_me=False)
        self.run_bridge()
        self.assertEqual(self.wa.sends, [])

    # -- safety ----------------------------------------------------------------------------------

    def test_message_goes_to_claude_on_stdin_with_no_exec_tools(self):
        self.initialized()
        self.wa.add("secret-looking client question 12345")
        self.run_bridge()
        with open(self.record) as fh:
            call = json.loads(fh.readline())
        argv = " ".join(call["argv"])
        self.assertNotIn("12345", argv, "the message must not appear on the command line")
        self.assertIn("secret-looking client question 12345", call["prompt"])
        self.assertIn("-p", call["argv"])
        self.assertIn("--permission-mode dontAsk", argv)
        self.assertIn("Bash", call["argv"][call["argv"].index("--disallowedTools") + 1])
        self.assertNotIn("Bash", call["argv"][call["argv"].index("--allowedTools") + 1])

    def test_files_hold_no_number_no_key_no_text(self):
        self.initialized()
        self.wa.add("Temecula listing at 123 Example Way, borrower Jane")
        self.run_bridge()
        self.wa.add("second question")
        self.run_bridge(STUB_MODE="fail")
        blobs = ""
        for path in (os.path.join(self.tmp, "state", "state.json"), os.path.join(self.tmp, "bridge.log")):
            with open(path) as fh:
                blobs += fh.read()
        for secret in ("15550009999", VKEY, "Temecula listing", "Example Way", "Answer about", "second question"):
            self.assertNotIn(secret, blobs, secret)
        mode = os.stat(os.path.join(self.tmp, "state", "state.json")).st_mode & 0o777
        self.assertEqual(mode, 0o600)

    def test_check_passes_and_sends_nothing(self):
        out = self.run_bridge("--check")
        self.assertEqual(out.returncode, 0, out.stdout + out.stderr)
        self.assertIn("reads your self-chat", out.stdout)
        self.assertNotIn("FAIL", out.stdout)
        self.assertNotIn(VKEY, out.stdout)
        self.assertNotIn("15550009999", out.stdout)
        self.assertEqual(self.wa.sends, [])

    def test_check_fails_cleanly_with_a_wrong_key(self):
        out = self.run_bridge("--check", VANESSA_BRIDGE_KEY="wrong")
        self.assertEqual(out.returncode, 1)
        self.assertIn("FAIL", out.stdout)

    def test_unreachable_openwa_does_not_crash(self):
        out = self.run_bridge(OPENWA_API="http://127.0.0.1:9/api")
        self.assertEqual(out.returncode, 0, out.stderr)
        with open(os.path.join(self.tmp, "bridge.log")) as fh:
            self.assertIn("read-failed", fh.read())


class InstallerTest(unittest.TestCase):
    """install-bridge.sh with macOS stand-ins (uname, security, launchctl, plutil) on PATH."""

    def setUp(self):
        self.tmp = tempfile.mkdtemp(prefix="vinstall-")
        self.wa = StubOpenWA()
        self.bin = os.path.join(self.tmp, "bin")
        os.makedirs(self.bin)
        self.home = os.path.join(self.tmp, "home")
        os.makedirs(self.home)
        for name, text in (("security", STUB_SECURITY), ("launchctl", STUB_LAUNCHCTL), ("claude", STUB_CLAUDE),
                           ("uname", "#!/bin/sh\necho Darwin\n"), ("plutil", "#!/bin/sh\nexit 0\n")):
            path = os.path.join(self.bin, name)
            with open(path, "w") as fh:
                fh.write(text)
            os.chmod(path, 0o755)
        self.keychain = os.path.join(self.tmp, "keychain.json")
        with open(self.keychain, "w") as fh:
            json.dump({"openwa-admin-key": ADMIN_KEY, "openwa-vanessa-operator-key": VKEY}, fh)
        self.env = dict(os.environ, HOME=self.home, USER="steven", PATH=self.bin + os.pathsep + os.environ["PATH"],
                        OPENWA_API="http://127.0.0.1:%d/api" % self.wa.port, STUB_KEYCHAIN=self.keychain,
                        STUB_LAUNCHCTL_LOG=os.path.join(self.tmp, "launchctl.log"),
                        STUB_RECORD=os.path.join(self.tmp, "claude-calls.jsonl"))
        for k in ("VANESSA_BRIDGE_KEY", "VANESSA_BRIDGE_CONFIG"):
            self.env.pop(k, None)

    def tearDown(self):
        self.wa.close()
        shutil.rmtree(self.tmp, ignore_errors=True)

    def install(self, *args):
        return subprocess.run(["bash", INSTALLER, *args], env=self.env, capture_output=True, text=True, timeout=90)

    def test_install_stores_settings_writes_plist_and_starts(self):
        out = self.install()
        self.assertEqual(out.returncode, 0, out.stdout + out.stderr)
        self.assertIn("reads your self-chat", out.stdout)
        self.assertIn("Done.", out.stdout)
        self.assertNotIn(VKEY, out.stdout + out.stderr)
        self.assertNotIn(ADMIN_KEY, out.stdout + out.stderr)
        self.assertNotIn("15550009999", out.stdout + out.stderr)
        with open(self.keychain) as fh:
            cfg = json.loads(json.load(fh)["openwa-vanessa-bridge"])
        self.assertEqual(cfg, {"sid": SID, "me": ME})
        plist = os.path.join(self.home, "Library", "LaunchAgents", "com.stevenshearrill.vanessa-whatsapp-bridge.plist")
        with open(plist) as fh:
            text = fh.read()
        body = text.split("-->", 1)[1]
        self.assertNotIn("__", body, "every placeholder is filled")
        self.assertIn(os.path.join(os.path.dirname(HERE), "vanessa-bridge.py"), body)
        self.assertIn(os.path.join(self.bin, "claude"), body)
        self.assertIn("<string>--loop</string>", body)
        with open(self.env["STUB_LAUNCHCTL_LOG"]) as fh:
            self.assertIn("bootstrap", fh.read())
        self.assertEqual(self.wa.sends, [], "installing sends nothing")

    def test_install_refuses_when_phone_is_not_linked(self):
        with open(self.keychain, "w") as fh:
            json.dump({"openwa-admin-key": ADMIN_KEY}, fh)
        out = self.install()
        self.assertNotEqual(out.returncode, 0)
        self.assertIn("setup-phone.sh", out.stderr)

    def test_uninstall_removes_agent_and_settings(self):
        self.assertEqual(self.install().returncode, 0)
        out = self.install("--uninstall")
        self.assertEqual(out.returncode, 0, out.stderr)
        self.assertFalse(os.path.exists(os.path.join(self.home, "Library", "LaunchAgents",
                                                     "com.stevenshearrill.vanessa-whatsapp-bridge.plist")))
        with open(self.keychain) as fh:
            self.assertNotIn("openwa-vanessa-bridge", json.load(fh))


if __name__ == "__main__":
    unittest.main(verbosity=2)
