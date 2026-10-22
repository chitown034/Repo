"""kapso-fetch / kapso-send: the deck document never leaks a number, a key or a body; sends go to Steven only."""
import http.client
import io
import json
import os
import sys
import unittest
import urllib.error
from unittest import mock
import importlib.util

HERE = os.path.dirname(__file__)


def load(name):
    spec = importlib.util.spec_from_file_location(name.replace("-", "_"), os.path.join(HERE, "..", name))
    m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m); return m


kf = load("kapso-fetch.py")
ks = load("kapso-send.py")


def fake_opener(responses, seen=None):
    def opener(req, timeout=0):
        assert req.full_url.startswith("https://api.kapso.ai/"), req.full_url
        assert req.get_header("X-api-key") == "k-test"
        if seen is not None:
            seen.append((req.get_method(), req.full_url, req.data))
        path = req.full_url.split("api.kapso.ai", 1)[1]
        for prefix, body in responses.items():
            if path.startswith(prefix):
                if isinstance(body, Exception):
                    raise body
                return io.BytesIO(json.dumps({"data": body} if isinstance(body, list) else body).encode())
        raise AssertionError("unexpected path " + path)
    return opener


NUMS = [{"display_name": "Kapso Sandbox", "phone_number": "+15551234567", "sandbox": True, "status": "connected"}]


class FetchTest(unittest.TestCase):
    def test_document_is_masked_and_bodiless(self):
        convs = [{"contact_name": "Steven Shearrill", "phone_number": "+19515550199", "last_message_at": "2026-10-13T02:10:00Z",
                  "last_message_direction": "inbound", "unread_count": 2, "last_message": {"text": "SECRET BODY"}},
                 {"phone_number": "+14155550123", "last_message_at": "2026-10-12T22:00:00Z", "unread_count": 0}]
        doc = kf.build("k-test", opener=fake_opener({"/platform/v1/whatsapp/phone_numbers": NUMS, "/platform/v1/whatsapp/conversations": convs}), now="2026-10-13T03:00:00Z")
        s = json.dumps(doc)
        self.assertEqual(doc["status"], "sandbox")
        self.assertEqual(doc["numbers"][0]["masked"], "…4567")
        for leak in ("15551234567", "19515550199", "SECRET BODY", "k-test"):
            self.assertNotIn(leak, s)
        self.assertEqual(doc["conversations"][0]["contact"], "Steven")
        self.assertEqual(doc["conversations"][1]["contact"], "…0123")
        self.assertEqual(doc["counts"], {"active": 2, "unread": 2})

    def test_number_in_contact_name_is_masked(self):
        convs = [{"contact_name": "+19515550199", "phone_number": "+19515550199", "last_message_at": "2026-10-13T02:10:00Z"},
                 {"contact_name": "19515550123 Jane", "phone_number": "+19515550123", "last_message_at": "2026-10-13T02:11:00Z"}]
        doc = kf.build("k-test", opener=fake_opener({"/platform/v1/whatsapp/phone_numbers": NUMS, "/platform/v1/whatsapp/conversations": convs}), now="x")
        labels = sorted(c["contact"] for c in doc["conversations"])
        self.assertIsNone(kf.DIGIT_RUN.search(" ".join(labels)))
        self.assertEqual(labels, ["…0123", "…0199"])

    def test_formatted_number_as_name_is_masked(self):
        for conv in ({"contact_name": "951-555-1234", "phone_number": "+19515551234"}, {"contact_name": "951-555-1234"},
                     {"contact_name": "(951) 555-1234", "phone_number": "+19515551234"}):
            self.assertEqual(kf.label(conv), "…1234", conv)
        self.assertEqual(kf.label({"contact_name": "Jane 4", "phone_number": "+19515551234"}), "Jane")

    def test_status_follows_connection_not_kind(self):
        nums = [{"phone_number": "+15550000001", "status": "disconnected", "display_name": "Sandbox Realty"}]
        doc = kf.build("k-test", opener=fake_opener({"/platform/v1/whatsapp/phone_numbers": nums, "/platform/v1/whatsapp/conversations": []}), now="x")
        self.assertEqual(doc["status"], "no number connected yet"); self.assertEqual(doc["numbers"][0]["kind"], "business")
        nums = [{"phone_number": "+15550000002", "connected": True, "type": "sandbox"}]
        doc = kf.build("k-test", opener=fake_opener({"/platform/v1/whatsapp/phone_numbers": nums, "/platform/v1/whatsapp/conversations": []}), now="x")
        self.assertEqual(doc["status"], "sandbox")

    def test_inbound_skips_history_outbound_empty_and_epoch(self):
        msgs = [{"id": "old", "from": "+19515550199", "timestamp": "2026-10-13T01:00:00Z", "text": {"body": "history"}},
                {"id": "out", "direction": "outbound", "phone_number": "+19515550199", "timestamp": "2026-10-13T09:00:00Z", "text": {"body": "Vanessa reply"}},
                {"id": "empty", "from": "+19515550199", "timestamp": "2026-10-13T09:00:01Z", "text": {}},
                {"id": "epoch", "from": "+19515550199", "timestamp": "1791882000", "text": {"body": "epoch ok"}}]  # 2026-10-13T09:00:00Z
        op = fake_opener({"/platform/v1/whatsapp/messages": msgs})
        res = kf.inbound("k-test", "", "19515550199", opener=op, now="2026-10-13T05:00:00")
        self.assertEqual(res["since"], "2026-10-13T05:00:00")
        self.assertEqual([m["id"] for m in res["messages"]], ["epoch"])
        self.assertNotIn("None", json.dumps(res)); self.assertNotIn("Vanessa reply", json.dumps(res))
        res = kf.inbound("k-test", "1791882000", "19515550199", opener=op)
        self.assertEqual(res["messages"], [])

    def test_bad_api_data_still_yields_a_document(self):
        cases = [
            {"/platform/v1/whatsapp/phone_numbers": NUMS, "/platform/v1/whatsapp/conversations": ["not-a-dict", {"unread_count": "²", "phone_number": "+15550001111"}]},
            {"/platform/v1/whatsapp/phone_numbers": http.client.IncompleteRead(b"partial"), "/platform/v1/whatsapp/conversations": []},
            {"/platform/v1/whatsapp/phone_numbers": {"data": {"not": "a list"}}, "/platform/v1/whatsapp/conversations": []},
        ]
        for responses in cases:
            doc = kf.build("k-test", opener=fake_opener(responses), now="x")
            self.assertIsInstance(doc["status"], str); self.assertIn("syncedAt", doc)
        self.assertEqual(kf.safe_int("²"), 0)

    def test_connected_and_sandbox_are_explicit(self):
        rows = [{"phone_number": "+15550000001"}, {"phone_number": "+15550000002", "connected": "false"},
                {"phone_number": "+15550000003", "status": "active", "sandbox_eligible": False, "display_name": "Business line"}]
        out = [kf.number_row(r) for r in rows]
        self.assertFalse(out[0]["connected"]); self.assertFalse(out[1]["connected"]); self.assertTrue(out[2]["connected"])
        self.assertEqual(out[2]["kind"], "business")

    def test_key_never_echoed_in_status(self):
        def opener(req, timeout=0):
            raise ValueError("Invalid header value b'abc\\r'")
        doc = kf.build("abc", opener=opener, now="x")
        self.assertTrue(doc["status"].startswith("error"))
        self.assertNotIn("abc", doc["status"])

    def test_no_key_and_http_error(self):
        self.assertTrue(kf.build("", now="x")["status"].startswith("not configured"))
        def opener(req, timeout=0):
            raise urllib.error.HTTPError(req.full_url, 401, "unauthorized", {}, None)
        self.assertTrue(kf.build("k-test", opener=opener, now="x")["status"].startswith("error — HTTP 401"))

    def test_insecure_host_refused(self):
        with mock.patch.object(kf, "HOST", "http://evil.example"):
            self.assertIn("non-HTTPS", kf.build("k-test", opener=fake_opener({}), now="x")["status"])

    def test_inbound_returns_only_the_allow_listed_sender(self):
        msgs = [{"id": "w1", "from": "+19515550199", "timestamp": "2026-10-13T02:10:00Z", "text": {"body": "hi Vanessa"}, "phone_number_id": "pn1"},
                {"id": "w2", "from": "+14155550123", "timestamp": "2026-10-13T02:11:00Z", "text": {"body": "stranger"}},
                {"id": "w0", "from": "+19515550199", "timestamp": "2026-10-13T01:00:00Z", "text": {"body": "old"}}]
        res = kf.inbound("k-test", "2026-10-13T02:00:00Z", "19515550199", opener=fake_opener({"/platform/v1/whatsapp/messages": msgs}))
        self.assertEqual(res["status"], "ok")
        self.assertEqual([m["text"] for m in res["messages"]], ["hi Vanessa"])
        self.assertEqual(res["ignored"], 1)
        self.assertNotIn("stranger", json.dumps(res))
        self.assertTrue(kf.inbound("k-test", "", "", opener=fake_opener({}))["status"].startswith("error"))


class SendTest(unittest.TestCase):
    def test_send_refuses_anyone_but_the_allow_list(self):
        seen = []
        op = fake_opener({"/meta/whatsapp/v24.0/pn1/messages": {"messages": [{"id": "wamid.1"}]}}, seen)
        res = ks.send("k-test", "19515550199", "+1 (415) 555-0123", "hello", "pn1", opener=op)
        self.assertTrue(res["status"].startswith("refused")); self.assertEqual(seen, [])
        for short in ("+1 (951) 555-019", "+1 (951) 555-01999"):
            self.assertTrue(ks.send("k-test", "19515550199", short, "hello", "pn1", opener=op)["status"].startswith("refused"))
        self.assertEqual(seen, [])
        res = ks.send("k-test", "19515550199", "", "hello", "pn1", opener=op)  # no --to: the allow-listed number
        self.assertEqual(res["status"], "sent"); self.assertEqual(json.loads(seen[-1][2])["to"], "19515550199")
        res = ks.send("k-test", "19515550199", "+1 (951) 555-0199", "hello", "pn1", opener=op)
        self.assertEqual(res["status"], "sent"); self.assertEqual(res["id"], "wamid.1"); self.assertEqual(res["to"], "…0199")
        self.assertEqual(len(seen), 2); self.assertEqual(seen[0][0], "POST")
        self.assertEqual(json.loads(seen[0][2])["to"], "19515550199")

    def test_send_falls_back_to_first_connected_number(self):
        seen = []
        op = fake_opener({"/platform/v1/whatsapp/phone_numbers": [{"phone_number": "+15550000009", "status": "disconnected", "id": "pn-dead"},
                                                                  {"phone_number": "+15551234567", "sandbox": True, "connected": True, "id": "pn-sandbox"}],
                          "/meta/whatsapp/v24.0/pn-sandbox/messages": {"messages": [{"id": "wamid.2"}]}}, seen)
        res = ks.send("k-test", "19515550199", "19515550199", "hi", "", opener=op)
        self.assertEqual(res["status"], "sent"); self.assertIn("/pn-sandbox/", seen[-1][1])
        for bad in ("../evil", "..", "."):
            res = ks.send("k-test", "19515550199", "19515550199", "hi", bad, opener=op)
            self.assertTrue(res["status"].startswith("error — refusing an unsafe"), bad)

    def test_text_on_stdin_reaches_send_unchanged(self):
        sent = {}
        def fake_send(key, allow, to, text, pnid, opener=None):
            sent.update(to=to, text=text, pnid=pnid); return {"status": "sent", "id": "x"}
        with mock.patch.object(ks, "send", fake_send), mock.patch.object(ks.kf, "api_key", lambda: "k"), \
             mock.patch.object(ks.kf, "allow_from", lambda: "19515550199"), \
             mock.patch.object(sys, "stdin", io.StringIO("The price is $450,000 `and` $(nothing)")):
            self.assertEqual(ks.main(["kapso-send.py", "--text", "-", "--phone-number-id", "pn1"]), 0)
        self.assertEqual(sent["text"], "The price is $450,000 `and` $(nothing)"); self.assertEqual(sent["to"], "")

    def test_timestamps_never_crash(self):
        self.assertEqual(kf.iso("1791882000000"), "2026-10-13T09:00:00")
        self.assertEqual(kf.iso("9" * 30), "")
        msgs = [{"from": "+19515550199", "timestamp": "9" * 30, "text": {"body": "x"}}]
        res = kf.inbound("k-test", "2026-01-01T00:00:00", "19515550199", opener=fake_opener({"/platform/v1/whatsapp/messages": msgs}))
        self.assertEqual(res["status"], "ok"); self.assertEqual(res["messages"], [])

    def test_send_needs_key_allow_text_and_number(self):
        self.assertTrue(ks.send("", "19515550199", "+19515550199", "x", "pn1")["status"].startswith("error"))
        self.assertTrue(ks.send("k", "", "+19515550199", "x", "pn1")["status"].startswith("error"))
        self.assertTrue(ks.send("k", "19515550199", "+19515550199", "  ", "pn1")["status"].startswith("error"))
        no_numbers = fake_opener({"/platform/v1/whatsapp/phone_numbers": []})
        self.assertTrue(ks.send("k-test", "19515550199", "+19515550199", "x", "", opener=no_numbers)["status"].startswith("error — no sending"))


if __name__ == "__main__":
    unittest.main()
