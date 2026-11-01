import json
import os
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import veed_client as vc  # noqa: E402


class RequestTests(unittest.TestCase):
    def test_bearer_header_and_url(self):
        req = vc.build_request("GET", "/v1/me", None, "abc123")
        self.assertEqual(req["url"], "https://api.veed.io/v1/me")
        self.assertEqual(req["headers"]["Authorization"], "Bearer abc123")
        self.assertNotIn("Content-Type", req["headers"])

    def test_post_has_json_body(self):
        req = vc.build_request("POST", "/v1/fabric-1.0", vc.fabric_body("https://x/i.png", "https://x/a.mp3"), "k")
        self.assertEqual(req["headers"]["Content-Type"], "application/json")
        self.assertEqual(req["body"], {"image_url": "https://x/i.png", "audio_url": "https://x/a.mp3", "resolution": "720p"})

    def test_redaction_never_prints_the_key(self):
        req = vc.build_request("GET", "/v1/me", None, "secret-key")
        self.assertNotIn("secret-key", json.dumps(vc.redacted(req)))
        self.assertEqual(req["headers"]["Authorization"], "Bearer secret-key")  # original untouched

    def test_dry_run_needs_no_key_and_no_network(self):
        os.environ.pop("VEED_API_KEY", None)
        self.assertEqual(vc.main(["fabric", "--image", "https://x/i.png", "--audio", "https://x/a.mp3", "--dry-run"]), 0)
        self.assertEqual(vc.main(["whoami", "--dry-run"]), 0)

    def test_spend_is_refused_without_dry_run(self):
        os.environ["VEED_API_KEY"] = "k"
        try:
            self.assertEqual(vc.main(["fabric", "--image", "https://x/i.png", "--audio", "https://x/a.mp3"]), 3)
        finally:
            os.environ.pop("VEED_API_KEY", None)


if __name__ == "__main__":
    unittest.main()
