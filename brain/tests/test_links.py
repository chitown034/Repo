"""Tests for brain/links.py — the second brain's front doors (2026-10-23)."""
from __future__ import annotations

import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

from brain import links, graph, layers  # noqa: E402


class LinkTests(unittest.TestCase):
    def test_every_link_is_https_and_unique(self):
        rows = links.all_links(ROOT)
        urls = [r["url"] for r in rows]
        self.assertEqual(len(urls), len(set(urls)))
        for r in rows:
            self.assertTrue(r["url"].startswith("https://"), r)

    def test_sb_docs_come_from_the_manifest(self):
        sb = links.sb_docs(ROOT)
        self.assertEqual(len(sb), 13)
        self.assertTrue(all("docs.google.com/document/d/" in r["url"] for r in sb))

    def test_store_nodes_carry_urls(self):
        g = graph.build(ROOT)
        stores = {n["id"]: n for n in g["nodes"] if n["g"] == "store"}
        for sid in ("store:drive", "store:notebooklm", "store:notion", "store:deck"):
            self.assertTrue(stores[sid].get("u", "").startswith("https://"), sid)
        self.assertIsNone(stores["store:jarvis"].get("u"))  # on-device, no URL

    def test_layers_carry_urls(self):
        rows = {r["key"]: r for r in layers.collect(ROOT)}
        self.assertIn("drive.google.com", rows["drive"]["url"])
        self.assertIn("notebook.google.com", rows["notebooklm"]["url"])
        self.assertIsNone(rows["jarvis"]["url"])


if __name__ == "__main__":
    unittest.main()
