"""Tests for brain/coverage.py — the Command Deck process-coverage register (2026-10-26)."""
from __future__ import annotations

import json
import sys
import tempfile
import unittest
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

from brain import coverage  # noqa: E402

NOW = datetime(2026, 10, 26, 18, 0, tzinfo=timezone.utc)


class StampTests(unittest.TestCase):
    def test_parse_forms(self):
        self.assertEqual(coverage.parse_stamp("2026-10-26T13:45:00Z").hour, 13)
        self.assertEqual(coverage.parse_stamp("2026-10-26T06:39:26-07:00").hour, 13)          # offset honoured
        self.assertEqual(coverage.parse_stamp("2026-10-26 08:05 AM PDT").hour, 15)           # Mac local -> UTC
        self.assertEqual(coverage.parse_stamp("Fri Oct 23, 2026 close (Dow +1%)").day, 23)   # market asOf text
        self.assertEqual(coverage.parse_stamp("2026-10-26").day, 26)
        self.assertIsNone(coverage.parse_stamp("Sourced via WebSearch"))
        self.assertIsNone(coverage.parse_stamp(None))

    def test_doc_stamp_prefers_known_keys_and_ignores_far_future_dates(self):
        d, k = coverage.doc_stamp({"v": {"syncedAt": "2026-10-20T10:00:00Z", "rows": [{"date": "2026-10-25"}]}})
        self.assertEqual((d.day, k), (20, "syncedAt"))
        d, k = coverage.doc_stamp({"v": [{"date": "2026-10-22"}, {"date": "2036-05-19"}]})
        self.assertEqual(d.day, 22)
        self.assertEqual(coverage.doc_stamp({"v": {"a": 1}}), (None, ""))


class RegisterTests(unittest.TestCase):
    def test_every_deck_doc_has_a_writer_row_with_a_known_kind(self):
        W, P = coverage.writers(ROOT), coverage.panels(ROOT)
        self.assertGreater(len(P), 150)
        missing = sorted(set(P) - set(W))
        self.assertEqual(missing, [], "deck docs without a writers.json row")
        for doc, w in W.items():
            self.assertIn(w["kind"], coverage.KINDS, doc)
            if w["kind"] in ("user", "derived", "retired", "none"):
                self.assertIsNone(w["cadenceHours"], doc)
            self.assertTrue(w["owner"] or w["kind"] == "none", doc)

    def test_statuses_from_a_db_export(self):
        with tempfile.TemporaryDirectory() as d:
            db = Path(d) / "state"; db.mkdir()
            (db / "liveFeeds.json").write_text(json.dumps({"v": {"updatedAt": "2026-10-26T13:10:00Z"}}))       # fresh (26 h cadence)
            (db / "knowledgeGraph.json").write_text(json.dumps({"v": {"syncedAt": "2026-09-13T17:23:00Z"}}))   # stale
            (db / "accounts.json").write_text(json.dumps({"v": [1]}))                                          # manual
            rows = {r["doc"]: r for r in coverage.collect(ROOT, Path(d), now=NOW)}
            self.assertEqual(rows["liveFeeds"]["status"], "fresh"); self.assertFalse(rows["liveFeeds"]["gap"])
            self.assertEqual(rows["knowledgeGraph"]["status"], "stale"); self.assertTrue(rows["knowledgeGraph"]["gap"])
            self.assertEqual(rows["accounts"]["status"], "manual")
            self.assertEqual(rows["tradingDeskReport"]["status"], "no writer"); self.assertTrue(rows["tradingDeskReport"]["gap"])
            self.assertEqual(rows["backupStatus"]["status"], "never written")
            self.assertEqual(rows["sectionEdits"]["status"], "derived")
            g = coverage.gaps(list(rows.values()))
            self.assertEqual(g[0]["status"], "no writer")   # gaps are ordered: no writer, never written, stale
            txt = coverage.format_rows(list(rows.values()), "test export")
            self.assertIn("## Gaps", txt); self.assertIn("`knowledgeGraph`", txt); self.assertIn("test export", txt)
            doc = coverage.deck_doc(list(rows.values()), now=NOW)["v"]
            self.assertEqual(doc["generatedAt"], "2026-10-26T18:00:00Z")
            self.assertNotIn("status", doc["docs"][0])     # the page computes live status itself
            self.assertTrue(all(set(x) >= {"doc", "kind", "writer", "owner", "cadenceHours"} for x in doc["docs"]))

    def test_without_db_nothing_is_called_stale(self):
        rows = coverage.collect(ROOT, None, now=NOW)
        self.assertEqual({r["status"] for r in rows if r["kind"] == "cloud"}, {"unchecked"})
        self.assertEqual(coverage.counts(rows)["gaps"], sum(1 for r in rows if r["kind"] == "none" or (r["kind"] == "retired" and r["note"])))

    def test_scan_deck_maps_docs_to_the_panel_whose_elements_the_renderer_fills(self):
        html = ('<section class="panel" data-page="daily"><h2 class="panel-title">Morning Brief</h2><div id="briefBox"></div></section>'
                '<section class="panel" data-page="toolkit"><h2 class="panel-title">Toolkit &amp; Remote Access</h2><tbody id="runnerRows"></tbody></section>'
                '<script>function renderRunnerStatus() { var r = lsGet("runnerStatus", null); $("runnerRows").innerHTML = ""; }'
                'function renderBrief() { var p = lsGet("priorities", []); var q = lsGetSeeded("tz", "x"); document.getElementById("briefBox").textContent = ""; }'
                'function helper() { return lsGet("sectionEdits", {}); }</script>')
        s = coverage.scan_deck(html)
        self.assertEqual(s["runnerStatus"]["tab"], "Toolkit & Remote Access"); self.assertEqual(s["runnerStatus"]["panel"], "Toolkit & Remote Access")
        self.assertEqual(s["priorities"]["tab"], "Daily Ops"); self.assertEqual(s["tz"]["panel"], "Morning Brief")
        self.assertEqual(s["sectionEdits"]["tab"], "")                                  # no element -> no panel
        self.assertEqual(s["runnerStatus"]["funcs"], ["renderRunnerStatus"])


if __name__ == "__main__":
    unittest.main()


class ValidatorFollowUps(unittest.TestCase):
    """2026-10-26 review findings P05-F1, P17-F1, P07-F2, P08-F1."""

    def test_future_body_dates_are_ignored_and_future_key_stamps_are_flagged(self):
        d, k = coverage.doc_stamp({"v": {"items": [{"seen": "2026-09-01"}, {"renewsOn": "2027-01-15"}]}}, now=NOW)
        self.assertEqual((d.month, d.day, k), (9, 1, "newest date in the body"))
        d, k = coverage.doc_stamp({"v": {"rows": [{"at": "2026-10-26T10:00:00Z"}, {"at": "2026-10-29T10:00:00Z"}]}}, now=NOW)
        self.assertEqual(d.day, 26)                                   # 3 days ahead is past the 48 h skew, so it is not a write stamp
        with tempfile.TemporaryDirectory() as t:
            db = Path(t) / "state"; db.mkdir()
            (db / "liveFeeds.json").write_text(json.dumps({"v": {"updatedAt": "2026-11-30T00:00:00Z"}}))
            r = {x["doc"]: x for x in coverage.collect(ROOT, Path(t), now=NOW)}["liveFeeds"]
            self.assertEqual(r["status"], "future stamp"); self.assertTrue(r["gap"])

    def test_session_and_empty_user_docs_match_the_card(self):
        with tempfile.TemporaryDirectory() as t:
            db = Path(t) / "state"; db.mkdir()
            (db / "accounts.json").write_text(json.dumps({"v": []}))
            (db / "aiModels.json").write_text(json.dumps({"v": {"rows": [1]}}))
            rows = {x["doc"]: x for x in coverage.collect(ROOT, Path(t), now=NOW)}
            self.assertEqual(rows["accounts"]["status"], "never typed")
            self.assertEqual(rows["aiModels"]["status"], "manual")        # session docs are never gaps
            self.assertEqual(rows["feasibilityChecks"]["status"], "never typed")

    def test_first_key_that_parses_wins(self):
        d, k = coverage.doc_stamp({"v": {"asOf": "Sourced via WebSearch", "updatedAt": "2026-10-26T10:00:00Z"}}, now=NOW)
        self.assertEqual(k, "updatedAt")

    def test_missing_export_dir_refuses(self):
        with self.assertRaises(SystemExit):
            coverage.collect(ROOT, Path("/nonexistent/export"), now=NOW)
