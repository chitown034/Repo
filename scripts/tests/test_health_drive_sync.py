"""scripts/health-drive-sync.py — the Drive export -> appleHealth merge, on a fixture shaped like the real export."""
import importlib.util
import json
import os
import sys
import tempfile
import unittest
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location("hds", ROOT / "scripts" / "health-drive-sync.py")
hds = importlib.util.module_from_spec(spec); spec.loader.exec_module(hds)

EXPORT = {"data": {"metrics": [
    {"name": "step_count", "units": "count", "data": [
        {"date": "2026-10-22 06:00:00 -0700", "qty": 300, "source": ""}, {"date": "2026-10-22 15:00:00 -0700", "qty": 700, "source": ""},
        {"date": "2026-10-21 10:00:00 -0700", "qty": 500, "source": ""}]},
    {"name": "heart_rate", "units": "count/min", "data": [{"date": "2026-10-22 06:00:00 -0700", "Avg": 80.5, "Min": 60, "Max": 100}]},
    {"name": "sleep_analysis", "units": "hr", "data": [{"date": "2026-10-22 00:00:00 -0700", "sleepStart": "2026-10-21 22:00:00 -0700",
        "sleepEnd": "2026-10-22 06:00:00 -0700", "inBed": 8.0, "totalSleep": 7.5, "core": 4.0, "deep": 1.5, "rem": 2.0, "awake": 0.5, "source": "Hume"}]},
    {"name": "not_a_known_metric", "units": "x", "data": [{"date": "2026-10-22 06:00:00 -0700", "qty": 1}]},
]}}
EXISTING = {"data": {"v": {"metrics": {"walking_speed": {"metric": "walking_speed", "unit": "mi/hr", "latest": 2.5, "latest_at": "2026-09-13 00:00:00", "earliest": "2026-09-06", "samples": 10},
                                      "step_count": {"metric": "step_count", "unit": "count", "latest": 12, "latest_at": "2026-09-13 00:00:00", "earliest": "2026-09-06", "samples": 1415}},
                          "daily": {"step_count": {"2026-09-12": {"sum": 6000, "avg": 30, "min": 1, "max": 100, "last": 12, "n": 200}}},
                          "sleep": [{"night": "2026-09-11", "in_bed_min": 400, "asleep_min": 380, "core_min": 200, "deep_min": 80, "rem_min": 100, "awake_min": 20}],
                          "workouts": [{"id": "OLD-1", "type": "Run", "start": "2026-08-30 20:24:15", "start_local": "2026-08-30 13:24:15", "minutes": 30}],
                          "records": {"kept": True}, "sources": [{"metric": "step_count", "source": "iPhone", "n": 1387, "first_at": "2026-09-06 07:02:00", "last_at": "2026-09-13 00:00:00"}],
                          "meta": {"last_received": "2026-09-13 14:30:40.789561", "ingests": 19}, "syncedAt": "2026-10-13T12:13:33Z", "via": "scheduled-sync"}}}


class T(unittest.TestCase):
    def run_sync(self):
        t = tempfile.mkdtemp(); exp = Path(t) / "exports"; exp.mkdir()
        (exp / "HealthAutoExport-2026-10-22.json").write_text(json.dumps(EXPORT), encoding="utf-8")
        (Path(t) / "existing.json").write_text(json.dumps(EXISTING), encoding="utf-8")
        rc = hds.main(["--exports", str(exp), "--existing", str(Path(t) / "existing.json"), "--out", str(Path(t) / "out.json"), "--now", "2026-10-23T18:00:00Z"])
        self.assertEqual(rc, 0)
        return json.load(open(Path(t) / "out.json"))["v"]

    def test_shape_merge_and_history(self):
        v = self.run_sync()
        self.assertEqual(v["via"], "drive-sync"); self.assertEqual(v["syncedAt"], "2026-10-23T18:00:00Z")
        self.assertIn("walking_speed", v["metrics"])                       # daemon-only metric key survives
        self.assertEqual(v["metrics"]["step_count"]["latest"], 700)          # newer export wins
        self.assertEqual(v["metrics"]["step_count"]["latest_at"], "2026-10-22 22:00:00")   # UTC, daemon's format
        self.assertEqual(v["metrics"]["step_count"]["earliest"], "2026-09-06")  # earliest kept from the daemon
        self.assertEqual(v["metrics"]["step_count"]["samples"], 200 + 3)     # Σ daily n over the merged history (idempotent)
        self.assertEqual(v["daily"]["step_count"]["2026-10-22"]["sum"], 1000)  # local day, summed
        self.assertIn("2026-09-12", v["daily"]["step_count"])               # daemon's day survives
        self.assertEqual(v["dailyDays"], 3)
        nights = [s["night"] for s in v["sleep"]]
        self.assertEqual(nights, ["2026-09-11", "2026-10-21"])              # old night kept, new night keyed on the sleep start
        self.assertEqual(v["sleep"][1]["asleep_min"], 450)
        self.assertEqual([w["id"] for w in v["workouts"]], ["OLD-1"])
        self.assertEqual(v["records"], {"kept": True})
        self.assertEqual(v["meta"]["ingests"], 20); self.assertEqual(v["meta"]["files"], ["HealthAutoExport-2026-10-22.json"])
        self.assertTrue(v["meta"]["last_received"].startswith("2026-10-22 22:00:00"))
        self.assertNotIn("not_a_known_metric", v["metrics"])                # never an invented key
        self.assertEqual(v["metrics"]["heart_rate"]["latest"], 80.5)        # Avg rows read
        src = {(s["metric"], s["source"]): s for s in v["sources"]}
        self.assertEqual(src[("step_count", "iPhone")]["n"], 1387)          # old source row kept
        self.assertIn(("step_count", "Health Auto Export"), src)

    def test_no_zero_for_missing_day(self):
        v = self.run_sync()
        self.assertNotIn("2026-10-20", v["daily"]["step_count"])

    def test_week_figures_come_from_the_merged_history_and_resync_is_idempotent(self):
        # day 1 export, then day 2 export fed alone with day 1's output as --existing: the week figures must equal one run holding both
        t = tempfile.mkdtemp(); e1 = Path(t) / "e1"; e2 = Path(t) / "e2"; both = Path(t) / "both"; [d.mkdir() for d in (e1, e2, both)]
        day1 = {"data": {"metrics": [{"name": "step_count", "units": "count", "data": [{"date": "2026-10-21 10:00:00 -0700", "qty": 500, "source": "iPhone"}]}]}}
        day2 = {"data": {"metrics": [{"name": "step_count", "units": "count", "data": [{"date": "2026-10-22 10:00:00 -0700", "qty": 700, "source": "iPhone"}]}]}}
        (e1 / "HealthAutoExport-2026-10-21.json").write_text(json.dumps(day1)); (e2 / "HealthAutoExport-2026-10-22.json").write_text(json.dumps(day2))
        (both / "HealthAutoExport-2026-10-21.json").write_text(json.dumps(day1)); (both / "HealthAutoExport-2026-10-22.json").write_text(json.dumps(day2))
        self.assertEqual(hds.main(["--exports", str(e1), "--out", str(Path(t) / "o1.json"), "--allow-empty-existing", "--now", "2026-10-22T18:00:00Z"]), 0)
        self.assertEqual(hds.main(["--exports", str(e2), "--existing", str(Path(t) / "o1.json"), "--out", str(Path(t) / "o2.json"), "--now", "2026-10-23T18:00:00Z"]), 0)
        self.assertEqual(hds.main(["--exports", str(both), "--out", str(Path(t) / "ob.json"), "--allow-empty-existing", "--now", "2026-10-23T18:00:00Z"]), 0)
        two = json.load(open(Path(t) / "o2.json"))["v"]; one = json.load(open(Path(t) / "ob.json"))["v"]
        for k in ("avg7", "sum7", "n7", "days7", "min7", "max7", "samples"):
            self.assertEqual(two["metrics"]["step_count"][k], one["metrics"]["step_count"][k], k)
        self.assertEqual(two["metrics"]["step_count"]["days7"], 2); self.assertEqual(two["metrics"]["step_count"]["avg7"], 600)
        # feed day 2 again on top of the day-2 output: counts must not move
        self.assertEqual(hds.main(["--exports", str(e2), "--existing", str(Path(t) / "o2.json"), "--out", str(Path(t) / "o3.json"), "--now", "2026-10-24T18:00:00Z"]), 0)
        three = json.load(open(Path(t) / "o3.json"))["v"]
        self.assertEqual(three["metrics"]["step_count"]["samples"], two["metrics"]["step_count"]["samples"])
        self.assertEqual(three["sources"], two["sources"]); self.assertEqual(three["meta"]["ingests"], two["meta"]["ingests"])
        self.assertEqual(three["daily"], two["daily"])

    def test_week_window_recomputed_for_metrics_absent_from_todays_file(self):
        # weight sampled once a week: a later file without weight must not leave weight's stale 7-day window behind
        t = tempfile.mkdtemp(); e1 = Path(t) / "e1"; e2 = Path(t) / "e2"; [d.mkdir() for d in (e1, e2)]
        (e1 / "HealthAutoExport-2026-10-01.json").write_text(json.dumps({"data": {"metrics": [{"name": "weight_body_mass", "units": "lb", "data": [{"date": "2026-10-01 07:00:00 -0700", "qty": 210, "source": "Scale"}]}]}}))
        (e2 / "HealthAutoExport-2026-10-22.json").write_text(json.dumps({"data": {"metrics": [{"name": "step_count", "units": "count", "data": [{"date": "2026-10-22 10:00:00 -0700", "qty": 700, "source": "iPhone"}]}]}}))
        self.assertEqual(hds.main(["--exports", str(e1), "--out", str(Path(t) / "o1.json"), "--allow-empty-existing", "--now", "2026-10-02T18:00:00Z"]), 0)
        self.assertEqual(json.load(open(Path(t) / "o1.json"))["v"]["metrics"]["weight_body_mass"]["days7"], 1)
        self.assertEqual(hds.main(["--exports", str(e2), "--existing", str(Path(t) / "o1.json"), "--out", str(Path(t) / "o2.json"), "--now", "2026-10-23T18:00:00Z"]), 0)
        w = json.load(open(Path(t) / "o2.json"))["v"]["metrics"]["weight_body_mass"]
        self.assertEqual(w["days7"], 0); self.assertIsNone(w["avg7"]); self.assertEqual(w["latest"], 210)   # latest kept, window honest

    def test_rewritten_file_gives_the_same_source_count_as_one_run(self):
        t = tempfile.mkdtemp(); a = Path(t) / "a"; b = Path(t) / "b"; both = Path(t) / "both"; [d.mkdir() for d in (a, b, both)]
        first = {"data": {"metrics": [{"name": "step_count", "units": "count", "data": [{"date": "2026-10-21 10:00:00 -0700", "qty": 5, "source": "iPhone"}, {"date": "2026-10-21 12:00:00 -0700", "qty": 5, "source": "iPhone"}]}]}}
        rewritten = {"data": {"metrics": [{"name": "step_count", "units": "count", "data": [{"date": "2026-10-21 08:00:00 -0700", "qty": 5, "source": "iPhone"}, {"date": "2026-10-21 10:00:00 -0700", "qty": 5, "source": "iPhone"}, {"date": "2026-10-21 12:00:00 -0700", "qty": 5, "source": "iPhone"}]}]}}
        (a / "HealthAutoExport-2026-10-21.json").write_text(json.dumps(first)); (b / "HealthAutoExport-2026-10-21.json").write_text(json.dumps(rewritten)); (both / "HealthAutoExport-2026-10-21.json").write_text(json.dumps(rewritten))
        self.assertEqual(hds.main(["--exports", str(a), "--out", str(Path(t) / "o1.json"), "--allow-empty-existing"]), 0)
        self.assertEqual(hds.main(["--exports", str(b), "--existing", str(Path(t) / "o1.json"), "--out", str(Path(t) / "o2.json")]), 0)
        self.assertEqual(hds.main(["--exports", str(both), "--out", str(Path(t) / "ob.json"), "--allow-empty-existing"]), 0)
        seq = json.load(open(Path(t) / "o2.json"))["v"]; one = json.load(open(Path(t) / "ob.json"))["v"]
        self.assertEqual(seq["sources"][0]["n"], 3); self.assertEqual(seq["sources"][0]["n"], one["sources"][0]["n"])
        self.assertEqual(seq["metrics"]["step_count"]["samples"], 3)
        self.assertEqual(hds.main(["--exports", str(a), "--out", str(Path(t) / "o3.json")]), 4)   # no --existing, no flag -> refuse

    def test_backfill_of_a_daemon_day_does_not_double_count_the_source(self):
        t = tempfile.mkdtemp(); exp = Path(t) / "exports"; exp.mkdir()
        old = {"data": {"metrics": [{"name": "step_count", "units": "count", "data": [{"date": "2026-09-12 10:00:00 -0700", "qty": 5, "source": "iPhone"}]}]}}
        (exp / "HealthAutoExport-2026-09-12.json").write_text(json.dumps(old)); (Path(t) / "existing.json").write_text(json.dumps(EXISTING))
        self.assertEqual(hds.main(["--exports", str(exp), "--existing", str(Path(t) / "existing.json"), "--out", str(Path(t) / "o.json")]), 0)
        src = {(s["metric"], s["source"]): s for s in json.load(open(Path(t) / "o.json"))["v"]["sources"]}
        self.assertEqual(src[("step_count", "iPhone")]["n"], 1387)        # the daemon already counted 2026-09-12

    def test_missing_existing_refuses(self):
        t = tempfile.mkdtemp(); exp = Path(t) / "exports"; exp.mkdir()
        (exp / "HealthAutoExport-2026-10-22.json").write_text(json.dumps(EXPORT), encoding="utf-8")
        self.assertEqual(hds.main(["--exports", str(exp), "--existing", str(Path(t) / "nope.json"), "--out", str(Path(t) / "o.json")]), 4)
        self.assertFalse((Path(t) / "o.json").exists())

    def test_no_files(self):
        t = tempfile.mkdtemp()
        self.assertEqual(hds.main(["--exports", t, "--out", os.path.join(t, "o.json"), "--allow-empty-existing"]), 2)


if __name__ == "__main__":
    unittest.main()
