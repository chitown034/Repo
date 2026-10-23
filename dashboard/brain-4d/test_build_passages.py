"""python3 -m unittest dashboard/brain-4d/test_build_passages.py — the 6D page's embedded passages stay script-safe and private (2026-10-23)."""
import re, unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


class PassageTests(unittest.TestCase):
    def test_no_script_body_contains_a_tokenizer_trap(self):
        s = (ROOT / "dashboard/brain-4d.html").read_text(encoding="utf-8", errors="replace")
        for i, m in enumerate(re.finditer(r"<script(?![^>]*\bsrc=)[^>]*>(.*?)</script>", s, re.S | re.I)):
            body = m.group(1)
            self.assertNotIn("<!--", body, f"script #{i}")
            self.assertNotRegex(body, r"(?i)<script", f"script #{i}")

    def test_passages_exclude_digests_and_clients_and_mask(self):
        s = (ROOT / "dashboard/brain-4d.html").read_text(encoding="utf-8", errors="replace")
        m = re.search(r"const SEC = (\[.*?\]);\n", s, re.S)
        self.assertIsNotNone(m)
        import json
        sec = json.loads(m.group(1).replace("<\\/", "</").replace("<\\!--", "<!--").replace("<\\script", "<script"))
        pages = {r["p"] for r in sec}
        self.assertFalse([p for p in pages if "/clients/" in p or p in ("memory/fieldy-meetings.md", "memory/claude-chats.md")])
        text = " ".join(r["h"] + " " + r["x"] for r in sec)
        self.assertNotIn("@gmail.com", text)
        self.assertNotIn("steven.shearrill@", text)
        import sys; sys.path.insert(0, str(ROOT))
        from brain.export_notebooklm import ALLOW
        phones = re.findall(r"\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}", text)
        self.assertFalse([ph for ph in phones if not any(a in ph or ph in a for a in ALLOW)], phones)


if __name__ == "__main__":
    unittest.main()
