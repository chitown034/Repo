import datetime as dt
import json
import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(HERE))
import birthdays as b  # noqa: E402

ICS = """BEGIN:VCALENDAR
BEGIN:VEVENT
SUMMARY:Jane Example's Birthday
DTSTART;VALUE=DATE:19801101
RRULE:FREQ=YEARLY
END:VEVENT
BEGIN:VEVENT
SUMMARY:Leap Day Person's Birthday
DTSTART;VALUE=DATE:20000229
END:VEVENT
BEGIN:VEVENT
SUMMARY:Folded Na
 me's Birthday
DTSTART:20011101T000000Z
END:VEVENT
END:VCALENDAR
"""


class ParseTests(unittest.TestCase):
    def test_parse_birthday_formats(self):
        for text in ("1980-11-01", "11-01", "11/01/1980", "11/1", "19801101", "19801101T000000Z"):
            self.assertEqual(b.parse_birthday(text), (11, 1), text)
        self.assertIsNone(b.parse_birthday("13-40"))
        self.assertIsNone(b.parse_birthday(""))
        self.assertIsNone(b.parse_birthday("next tuesday"))

    def test_ics(self):
        with tempfile.TemporaryDirectory() as d:
            p = Path(d, "b.ics"); p.write_text(ICS, encoding="utf-8")
            recs = b.load_ics(p)
        names = {r["name"]: (r["month"], r["day"]) for r in recs}
        self.assertEqual(names, {"Jane Example": (11, 1), "Leap Day Person": (2, 29), "Folded Name": (11, 1)})
        self.assertTrue(all(r["channel"] == "personal" and r["photo"] is None for r in recs))

    def test_csv_example(self):
        recs = b.load_csv(HERE / "birthdays.example.csv")
        self.assertEqual([r["name"] for r in recs], ["Jane Example", "Marcus Sample", "Leap Day Person"])
        self.assertEqual(recs[1]["channel"], "page")
        self.assertEqual(recs[2]["channel"], "both")
        self.assertEqual(recs[1]["photo"], "samples/steven-headshot-sample.jpg")


class DueTests(unittest.TestCase):
    def setUp(self):
        self.recs = b.load_csv(HERE / "birthdays.example.csv")

    def test_due_today(self):
        self.assertEqual([r["name"] for r in b.due(self.recs, dt.date(2026, 11, 1))], ["Jane Example"])
        self.assertEqual(b.due(self.recs, dt.date(2026, 11, 2)), [])

    def test_leap_day_moves_to_feb_28_in_non_leap_year(self):
        self.assertEqual([r["name"] for r in b.due(self.recs, dt.date(2027, 2, 28))], ["Leap Day Person"])
        self.assertEqual([r["name"] for r in b.due(self.recs, dt.date(2028, 2, 28))], [])
        self.assertEqual([r["name"] for r in b.due(self.recs, dt.date(2028, 2, 29))], ["Leap Day Person"])

    def test_dedupe_by_name_across_sources(self):
        recs = self.recs + [{"name": "jane example", "month": 11, "day": 1, "photo": None, "channel": "page", "note": "", "source": "ics"}]
        self.assertEqual(len(b.due(recs, dt.date(2026, 11, 1))), 1)


class QueueTests(unittest.TestCase):
    def test_queue_and_jobs_are_deterministic_and_photo_safe(self):
        brand = json.loads((HERE / "brand.json").read_text(encoding="utf-8"))
        recs = b.load_csv(HERE / "birthdays.example.csv")
        with tempfile.TemporaryDirectory() as d:
            q1 = b.build_queue(recs, dt.date(2026, 3, 14), Path(d), brand)
            q2 = b.build_queue(recs, dt.date(2026, 3, 14), Path(d), brand)
            self.assertEqual(q1, q2)
            self.assertEqual(q1[0]["caption"], brand["caption"].format(first="Marcus", name="Marcus Sample"))
            jobs = b.write_jobs(q1, HERE / "brand.json")
            job = json.loads(jobs[0].read_text(encoding="utf-8"))
            self.assertTrue(job["photo"].endswith("steven-headshot-sample.jpg"))
            # a photo path that does not exist is dropped, never guessed
            q1[0]["photo"] = "/nowhere/missing.jpg"
            job2 = json.loads(b.write_jobs(q1, HERE / "brand.json")[0].read_text(encoding="utf-8"))
            self.assertIsNone(job2["photo"])

    def test_cli_writes_queue_without_render(self):
        with tempfile.TemporaryDirectory() as d:
            rc = b.main(["--csv", str(HERE / "birthdays.example.csv"), "--date", "2026-11-01", "--out", d])
            self.assertEqual(rc, 0)
            q = json.loads(Path(d, "2026-11-01", "queue.json").read_text(encoding="utf-8"))
            self.assertEqual(q["count"], 1)
            self.assertEqual(q["items"][0]["name"], "Jane Example")
            self.assertEqual(q["items"][0]["status"], "queued")


class RenderHtmlTests(unittest.TestCase):
    def test_render_js_builds_html_with_fonts_inlined(self):
        env = dict(os.environ, BIRTHDAY_HTML_ONLY="1")
        with tempfile.TemporaryDirectory() as d:
            out = Path(d, "x.png")
            proc = subprocess.run(["node", str(HERE / "render.js"), "--name", "Jane Example", "--out", str(out)],
                                  capture_output=True, text=True, env=env, cwd=d)
            self.assertEqual(proc.returncode, 0, proc.stderr)
            html = out.with_suffix(".html").read_text(encoding="utf-8")
        self.assertIn("Jane Example", html)
        self.assertIn("data:font/ttf;base64,", html)
        self.assertNotIn("{{", html)
        self.assertIn('class="photo "', html)  # default photo present


if __name__ == "__main__":
    unittest.main()
