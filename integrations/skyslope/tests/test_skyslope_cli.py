"""Tests for integrations/skyslope/skyslope_cli.py — signing matches SkySlope's getAuth.js, GET-only, secrets never printed."""
from __future__ import annotations

import base64, datetime as dt, hashlib, hmac, io, json, os, re, sys, tempfile, unittest
from contextlib import redirect_stderr, redirect_stdout
from pathlib import Path
from unittest import mock

HERE = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(HERE))
import skyslope_cli as ss  # noqa: E402

SRC = (HERE / "skyslope_cli.py").read_text(encoding="utf-8")


class Signing(unittest.TestCase):
    def test_auth_header_matches_the_node_example(self):
        # getAuth.js: createHmac("sha256", accessSecret).update(clientId + ":" + clientSecret + ":" + timestamp).digest("base64"); "ss " + accessKey + ":" + hmac
        ts = "2026-10-24T01:02:03Z"
        want = base64.b64encode(hmac.new(b"S3CR3T", b"cid:csec:" + ts.encode(), hashlib.sha256).digest()).decode()
        self.assertEqual(ss.auth_header("cid", "csec", "AK", "S3CR3T", ts), "ss AK:" + want)

    def test_timestamp_is_utc_rfc3339_seconds(self):
        self.assertEqual(ss.timestamp_utc(dt.datetime(2026, 10, 24, 1, 2, 3, 456, tzinfo=dt.timezone.utc)), "2026-10-24T01:02:03Z")
        pst = dt.timezone(dt.timedelta(hours=-7))
        self.assertEqual(ss.timestamp_utc(dt.datetime(2026, 10, 23, 18, 2, 3, tzinfo=pst)), "2026-10-24T01:02:03Z")


class ReadOnly(unittest.TestCase):
    def test_no_write_verbs_in_source(self):
        for verb in ("PUT", "PATCH", "DELETE"):
            self.assertNotRegex(SRC, r'["\']' + verb + r'["\']', verb)
        self.assertEqual(SRC.count('"POST"'), 2, "POST appears only in the allow check and the login call")

    def test_request_refuses_other_methods(self):
        with self.assertRaises(ss.SkySlopeError) as cm:
            ss._request("DELETE", "https://api.skyslope.com/x", {})
        self.assertEqual(cm.exception.code, 2)


class Config(unittest.TestCase):
    def setUp(self):
        self.t = tempfile.TemporaryDirectory(); self.env = Path(self.t.name) / ".env"
        self._p = mock.patch.object(ss, "ENV_FILE", self.env); self._p.start()
        self._e = mock.patch.dict(os.environ, {k: "" for k in ss.VARS}, clear=False); self._e.start()

    def tearDown(self):
        self._p.stop(); self._e.stop(); self.t.cleanup()

    def test_missing_keys_exit_5_and_name_only_the_variables(self):
        out, err = io.StringIO(), io.StringIO()
        with redirect_stdout(out), redirect_stderr(err):
            rc = ss.main(["me"])
        self.assertEqual(rc, 5); self.assertIn("SKYSLOPE_CLIENT_ID", err.getvalue()); self.assertNotIn("ss ", err.getvalue())

    def test_env_file_parsed_and_check_reports_names_only(self):
        self.env.write_text("SKYSLOPE_CLIENT_ID=cid\nSKYSLOPE_CLIENT_SECRET='csec'\nSKYSLOPE_ACCESS_KEY=\"AK\"\nSKYSLOPE_ACCESS_SECRET=S3CR3T\n# comment\n", encoding="utf-8")
        cfg = ss.load_config(); self.assertEqual(cfg["SKYSLOPE_CLIENT_SECRET"], "csec"); self.assertEqual(cfg["SKYSLOPE_ACCESS_KEY"], "AK")
        out = io.StringIO()
        with redirect_stdout(out):
            rc = ss.main(["check", "--json"])
        self.assertEqual(rc, 0); self.assertNotIn("S3CR3T", out.getvalue()); self.assertNotIn("csec", out.getvalue())


class FakeHttp(unittest.TestCase):
    """Login then GET, through a fake urlopen: the Session header is sent, secrets never reach stdout, 401 maps to exit 6."""

    def setUp(self):
        self.calls = []
        self._e = mock.patch.dict(os.environ, {"SKYSLOPE_CLIENT_ID": "cid", "SKYSLOPE_CLIENT_SECRET": "csec", "SKYSLOPE_ACCESS_KEY": "AK", "SKYSLOPE_ACCESS_SECRET": "S3CR3T"}); self._e.start()

    def tearDown(self):
        self._e.stop()

    def _fake(self, responses):
        calls = self.calls
        class R:
            def __init__(self, status, body): self.status, self._b = status, body
            def read(self): return json.dumps(self._b).encode()
            def __enter__(self): return self
            def __exit__(self, *a): return False
        def urlopen(req, timeout=0):
            calls.append((req.get_method(), req.full_url, dict(req.header_items()), req.data))
            status, body = responses.pop(0)
            if status >= 400:
                raise ss.urllib.error.HTTPError(req.full_url, status, "x", {}, io.BytesIO(json.dumps(body).encode()))
            return R(status, body)
        return mock.patch.object(ss, "_OPENER", mock.Mock(open=urlopen))

    def test_login_then_files_summary(self):
        files = {"items": [{"id": "F1", "objectType": "Sale", "status": "active", "property": {"streetNumber": "12", "streetName": "Vine St", "city": "Temecula"},
                            "closingDate": "2026-11-15", "buyers": [{"firstName": "Pat", "lastName": "Doe", "email": "pat@example.com"}]}]}
        with self._fake([(200, {"Session": "TICKET-1"}), (200, files)]):
            out = io.StringIO()
            with redirect_stdout(out):
                rc = ss.main(["files", "--status", "active"])
        self.assertEqual(rc, 0)
        m, url, hdr, body = self.calls[0]
        self.assertEqual(m, "POST"); self.assertTrue(url.endswith("/auth/login"))
        self.assertTrue(hdr.get("Authorization", "").startswith("ss AK:")); self.assertRegex(hdr.get("Timestamp", ""), r"^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$")
        self.assertEqual(json.loads(body), {"ClientId": "cid", "ClientSecret": "csec"})
        m2, url2, hdr2, _ = self.calls[1]
        self.assertEqual(m2, "GET"); self.assertIn("/api/files?", url2); self.assertIn("status=active", url2); self.assertEqual(hdr2.get("Session"), "TICKET-1")
        text = out.getvalue()
        self.assertIn("F1", text); self.assertIn("12 Vine St", text); self.assertIn("2026-11-15", text)
        for secret in ("S3CR3T", "csec", "TICKET-1", "pat@example.com", "Doe"):
            self.assertNotIn(secret, text, secret)

    def test_nested_value_shape_and_unknown_shape(self):
        with self._fake([(200, {"Session": "T"}), (200, {"value": {"files": [{"id": "F9", "status": "closed"}]}})]):
            out = io.StringIO()
            with redirect_stdout(out):
                rc = ss.main(["files", "--json"])
        self.assertEqual(rc, 0); self.assertIn("F9", out.getvalue())
        self.calls.clear()
        with self._fake([(200, {"Session": "T"}), (200, {"odd": {"shape": 1}})]):
            err = io.StringIO()
            with redirect_stderr(err):
                rc = ss.main(["files"])
        self.assertEqual(rc, 7); self.assertIn("unexpected response shape", err.getvalue()); self.assertIn("odd", err.getvalue())

    def test_single_file_is_summarized_by_default(self):
        rec = {"id": "F1", "objectType": "Sale", "status": "active", "closingDate": "2026-11-15", "buyers": [{"firstName": "Pat", "email": "pat@example.com"}]}
        with self._fake([(200, {"Session": "T"}), (200, rec)]):
            out = io.StringIO()
            with redirect_stdout(out):
                rc = ss.main(["file", "F1"])
        self.assertEqual(rc, 0); self.assertIn("2026-11-15", out.getvalue()); self.assertNotIn("pat@example.com", out.getvalue())
        self.calls.clear()
        with self._fake([(200, {"Session": "T"}), (200, rec)]):
            out = io.StringIO()
            with redirect_stdout(out):
                ss.main(["file", "F1", "--full"])
        self.assertIn("pat@example.com", out.getvalue())

    def test_stall_or_drop_exits_7_without_traceback(self):
        import http.client as hc
        for exc in (TimeoutError("stalled"), hc.RemoteDisconnected("gone")):
            def urlopen(req, timeout=0, _e=exc): raise _e
            with mock.patch.object(ss, "_OPENER", mock.Mock(open=urlopen)):
                err = io.StringIO()
                with redirect_stderr(err):
                    rc = ss.main(["me"])
            self.assertEqual(rc, 7, exc); self.assertNotIn("S3CR3T", err.getvalue()); self.assertIn("network", err.getvalue())

    def test_http_url_and_redirects_are_refused(self):
        with self.assertRaises(ss.SkySlopeError):
            ss._request("GET", "http://api.skyslope.com/x", {})
        h = ss._NoRedirect()
        with self.assertRaises(ss.SkySlopeError):
            h.redirect_request(None, None, 302, "Found", {}, "https://evil.example/steal")

    def test_refused_credentials_exit_6_without_leaking(self):
        with self._fake([(401, {"message": "unauthorized"})]):
            err = io.StringIO()
            with redirect_stderr(err):
                rc = ss.main(["me"])
        self.assertEqual(rc, 6); self.assertNotIn("S3CR3T", err.getvalue()); self.assertIn("ClientId/ClientSecret", err.getvalue())


if __name__ == "__main__":
    unittest.main()
