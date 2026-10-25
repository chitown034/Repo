"""Tests for brain/export_notebooklm.py — the NotebookLM source pack (2026-10-23)."""
from __future__ import annotations

import os
import sys
import tempfile
import unittest
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

from brain import export_notebooklm as ex  # noqa: E402


class MaskTests(unittest.TestCase):
    def test_masks_unknown_phone_and_email(self):
        t, n = ex.mask("call 951-555-0199 or mail jane.doe@example.com today")
        self.assertIn("[phone masked]", t); self.assertIn("[e-mail masked]", t); self.assertEqual(n, 2)

    def test_keeps_allow_listed_business_lines(self):
        t, n = ex.mask("text connect @vanessa-shearrill to +1 650 484 9720; WhatsApp (202) 474-5223; vanessa-shearrill@inkboxmail.com")
        self.assertEqual(n, 0); self.assertIn("+1 650 484 9720", t); self.assertIn("(202) 474-5223", t)

    def test_leaves_nmls_and_dates_alone(self):
        t, n = ex.mask("NMLS 1921615 · DRE 01988316 · 2026-10-23 · $1,250,000")
        self.assertEqual(n, 0)


class BundleTests(unittest.TestCase):
    def test_client_pages_never_exported(self):
        self.assertIsNone(ex.bundle_of("wiki/clients/jane.md"))
        self.assertIsNone(ex.bundle_of("wiki/clients/index.md"))

    def test_internal_state_never_exported(self):
        for p in ("brain/index.json", "docs/reports/CODE-VALIDATION.md", "dashboard/brain-4d.html", ".claude/skills/x/SKILL.md"):
            self.assertIsNone(ex.bundle_of(p), p)

    def test_routing(self):
        self.assertEqual(ex.bundle_of("CLAUDE.md"), "01-router-and-index")
        self.assertEqual(ex.bundle_of("context/decisions.md"), "02-who-and-decisions")
        self.assertEqual(ex.bundle_of("wiki/mortgage-programs/va-eligibility.md"), "05-wiki-mortgage-programs")
        self.assertEqual(ex.bundle_of("integrations/CONNECTIONS.md"), "12-integrations")
        self.assertEqual(ex.bundle_of("integrations/kapso/install-mac.sh"), None)


class ExportTests(unittest.TestCase):
    def test_export_against_the_real_brain(self):
        with tempfile.TemporaryDirectory() as d:
            r = ex.export(ROOT, Path(d), today=date(2026, 10, 23))
            names = [w["file"] for w in r["files"]]
            self.assertEqual(names[0], "00-START-HERE.md")
            self.assertIn("11-6d-brain-map.md", names)
            self.assertIn("01-router-and-index.md", names)
            for w in r["files"]:
                self.assertLessEqual(w["chars"], ex.LIMIT_CHARS + 20_000, w["file"])
            all_text = "".join(Path(d, n).read_text(encoding="utf-8") for n in names)
            self.assertNotIn("# FILE: wiki/clients/", all_text)
            self.assertIn("as of 2026-10-23", all_text)
            self.assertIn("## Live stores", Path(d, "11-6d-brain-map.md").read_text(encoding="utf-8"))
            self.assertGreater(r["included"], 50)

    def test_split_keeps_every_piece(self):
        head = "# H\n"
        body = "".join(f"\n\n---\n\n# FILE: f{i}.md\n" + ("x" * 100_000) for i in range(6))
        chunks = ex._split(head, body)
        self.assertGreater(len(chunks), 1)
        self.assertEqual(sum(c.count("# FILE:") for c in chunks), 6)
        for c in chunks:
            self.assertTrue(c.startswith("# H"))
            self.assertLessEqual(len(c), ex.LIMIT_CHARS + 110_000)


if __name__ == "__main__":
    unittest.main()
