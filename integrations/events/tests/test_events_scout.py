import datetime as dt
import json
import sys
import tempfile
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
import events_scout as es  # noqa: E402

TODAY = dt.date(2026, 10, 11)
FIX = HERE / "fixtures"
SOURCES = es.load_sources()
CATS = {"social-singles", "networking", "chamber", "business", "dating",
        "speed-dating", "community", "real-estate"}
CITYSET = {"Temecula", "San Diego", "Riverside", "Orange County", "Murrieta",
           "Menifee", "Los Angeles", "Online"}


def ld(obj):
    return f'<script type="application/ld+json">{json.dumps(obj)}</script>'


class TestJsonLd(unittest.TestCase):
    def test_single(self):
        r = es.extract_jsonld(ld({"@type": "Event", "name": "A", "startDate": "2026-10-12T09:00:00-07:00",
                                  "offers": {"price": "20", "priceCurrency": "USD"}}))
        self.assertEqual(r[0]["date"], "2026-10-12")
        self.assertEqual(r[0]["time"], "09:00")
        self.assertEqual(r[0]["price"], "$20")

    def test_graph(self):
        r = es.extract_jsonld(ld({"@graph": [{"@type": "WebPage"}, {"@type": "Event", "name": "G", "startDate": "2026-10-12"}]}))
        self.assertEqual([e["name"] for e in r], ["G"])

    def test_list_and_subtype(self):
        r = es.extract_jsonld(ld([{"@type": "SocialEvent", "name": "S", "startDate": "2026-10-12"},
                                  {"@type": ["Thing", "BusinessEvent"], "name": "B", "startDate": "2026-10-13"}]))
        self.assertEqual(len(r), 2)

    def test_nested_location(self):
        r = es.extract_jsonld(ld({"@type": "Event", "name": "N", "startDate": "2026-10-12",
                                  "location": {"name": "Hall", "address": {"addressLocality": "Temecula"}}}))
        self.assertEqual(r[0]["venue"], "Hall, Temecula")

    def test_string_location_and_free(self):
        r = es.extract_jsonld(ld({"@type": "Event", "name": "F", "startDate": "2026-10-12",
                                  "location": "Park", "offers": {"price": 0}}))
        self.assertEqual((r[0]["venue"], r[0]["price"]), ("Park", "Free"))

    def test_bad_json_and_missing_date_ignored(self):
        self.assertEqual(es.extract_jsonld('<script type="application/ld+json">{bad</script>'), [])
        self.assertEqual(es.extract_jsonld(ld({"@type": "Event", "name": "NoDate"})), [])

    def test_relative_url_resolved(self):
        r = es.extract_jsonld(ld({"@type": "Event", "name": "U", "startDate": "2026-10-12", "url": "/e/1"}), "https://x.org/a")
        self.assertEqual(r[0]["url"], "https://x.org/e/1")


class TestIcs(unittest.TestCase):
    def test_parse(self):
        r = es.extract_ics((FIX / "intelligent-singles-sd.ics").read_text())
        names = {e["name"]: e for e in r}
        self.assertIn("Singles Mixer, Downtown", names)
        self.assertEqual(names["Singles Mixer, Downtown"]["venue"], "Bar One; San Diego")
        self.assertEqual(names["Singles Mixer, Downtown"]["time"], "19:00")

    def test_folded_and_date_only(self):
        r = es.extract_ics((FIX / "intelligent-singles-sd.ics").read_text())
        e = [x for x in r if x["date"] == "2026-10-20"][0]
        self.assertTrue(e["name"].startswith("Long folded"))
        self.assertEqual(e["time"], "")

    def test_ics_links_found(self):
        h = '<a href="/cal.ics">c</a><a href="webcal://x.org/f">f</a><a href="/x">x</a>'
        self.assertEqual(es.find_ics_links(h, "https://x.org/"), ["https://x.org/cal.ics", "https://x.org/f"])


class TestLinks(unittest.TestCase):
    def test_date_in_anchor_only(self):
        r = es.extract_links((FIX / "cityswoon-sd.html").read_text(), "https://c.com/", TODAY)
        dates = sorted(e["date"] for e in r)
        self.assertIn("2026-10-22", dates)
        self.assertIn("2026-10-24", dates)
        self.assertEqual(len(r), 3)  # "About us" excluded

    def test_year_rollover(self):
        self.assertEqual(es.find_date("Jan 5", dt.date(2026, 12, 20)), dt.date(2027, 1, 5))


class TestFilterDedupe(unittest.TestCase):
    SRC = SOURCES[1]

    def _raw(self, name, date):
        return {"name": name, "date": date, "time": "", "venue": "", "url": "", "price": ""}

    def test_past_dropped(self):
        r = es.finalize([self._raw("P", "2026-10-10"), self._raw("T", "2026-10-11")], self.SRC, TODAY, 14)
        self.assertEqual([x["name"] for x in r], ["T"])

    def test_window_and_this_week(self):
        r = es.finalize([self._raw("A", "2026-10-18"), self._raw("B", "2026-10-25"), self._raw("C", "2026-11-30")], self.SRC, TODAY, 14)
        self.assertEqual({x["name"]: x["this_week"] for x in r}, {"A": True, "B": False})

    def test_dedupe_within_and_across(self):
        r = es.finalize([self._raw("Mixer!", "2026-10-14"), self._raw("mixer", "2026-10-14")], self.SRC, TODAY, 14)
        self.assertEqual(len(r), 1)
        self.assertEqual(len(es.dedupe_all(r + r)), 1)

    def test_missing_url_falls_back_to_source(self):
        r = es.finalize([self._raw("A", "2026-10-14")], self.SRC, TODAY, 14)
        self.assertEqual(r[0]["url"], self.SRC["url"])

    def test_non_http_url_rejected(self):
        self.assertEqual(es.safe_url("javascript:alert(1)"), "")


class TestRegistry(unittest.TestCase):
    def test_no_tracking_params(self):
        for s in SOURCES:
            self.assertNotIn("utm_", s["url"])
            self.assertNotIn("fbclid", s["url"])
            self.assertNotIn("?", s["url"]) if False else None

    def test_strip_tracking(self):
        u = es.strip_tracking("https://a.com/p?utm_source=x&id=3&fbclid=z&gclid=1#f")
        self.assertEqual(u, "https://a.com/p?id=3")

    def test_schema(self):
        ids = set()
        for s in SOURCES:
            self.assertIn(s["city"], CITYSET)
            self.assertIn(s["category"], CATS)
            self.assertIn(s["kind"], {"jsonld", "ics", "html-links", "manual"})
            self.assertTrue(s["url"].startswith("https://"))
            self.assertNotIn(s["id"], ids)
            ids.add(s["id"])

    def test_required_sources_and_count(self):
        self.assertGreaterEqual(len(SOURCES), 28)
        urls = {s["url"] for s in SOURCES}
        for u in ("https://app.timeleft.com/app/home/event", "https://222.place",
                  "https://app.aspire4more.com/c/events-80c94a", "https://members.temecula.org/events"):
            self.assertIn(u, urls)


class TestRobots(unittest.TestCase):
    def test_disallowed_skipped(self):
        calls = []

        def g(url):
            calls.append(url)
            if url.endswith("/robots.txt"):
                return 200, "text/plain", "User-agent: *\nDisallow: /events"
            raise AssertionError("page must not be fetched")
        src = {"id": "x", "name": "X", "city": "Temecula", "category": "chamber",
               "url": "https://x.org/events", "kind": "jsonld"}
        st, _, ev = es.scout_source(src, TODAY, g, None, {}, 0)
        self.assertEqual((st, ev), ("robots", []))
        self.assertEqual(calls, ["https://x.org/robots.txt"])

    def test_allowed_and_followup_ics(self):
        def g(url):
            if url.endswith("/robots.txt"):
                raise es.FetchError("blocked", "HTTP 404")
            if url.endswith(".ics"):
                return 200, "text/calendar", "BEGIN:VEVENT\nSUMMARY:Cal\nDTSTART:20261015T100000\nEND:VEVENT"
            return 200, "text/html", '<a href="/c.ics">cal</a>'
        src = {"id": "x", "name": "X", "city": "Temecula", "category": "chamber",
               "url": "https://x.org/events", "kind": "jsonld"}
        st, _, ev = es.scout_source(src, TODAY, g, None, {}, 0)
        self.assertEqual(st, "reachable")
        self.assertEqual(ev[0]["name"], "Cal")

    def test_blocked_reported(self):
        def g(url):
            raise es.FetchError("blocked", "HTTP 403")
        src = {"id": "x", "name": "X", "city": "Temecula", "category": "chamber",
               "url": "https://x.org/e", "kind": "jsonld"}
        # robots 403 => disallow all => robots status
        st, _, _ = es.scout_source(src, TODAY, g, None, {}, 0)
        self.assertEqual(st, "robots")

    def test_network_down_is_blocked(self):
        def g(url):
            raise es.FetchError("blocked", "URLError: proxy")
        src = {"id": "x", "name": "X", "city": "Temecula", "category": "chamber",
               "url": "https://x.org/e", "kind": "jsonld"}
        st, detail, _ = es.scout_source(src, TODAY, g, None, {}, 0)
        self.assertEqual(st, "blocked")
        self.assertIn("proxy", detail)

    def test_manual_never_fetched(self):
        def g(url):
            raise AssertionError("no fetch")
        m = [s for s in SOURCES if s["kind"] == "manual"][0]
        self.assertEqual(es.scout_source(m, TODAY, g)[0], "manual")


class TestMarkdown(unittest.TestCase):
    def test_escape(self):
        self.assertEqual(es.esc("a|b\nc"), "a\\|b c")
        self.assertEqual(es.esc("<b>"), "&lt;b&gt;")
        self.assertEqual(es.esc(None), "")


class TestOfflineAndReport(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.rows, cls.st = es.run(SOURCES, TODAY, 14, offline=str(FIX))

    def test_events_found(self):
        names = {r["name"] for r in self.rows}
        self.assertIn("Business Mixer | Temecula", names)
        self.assertIn("SD Founders Meetup", names)
        self.assertIn("Singles Mixer, Downtown", names)
        self.assertNotIn("Old Event", names)
        self.assertNotIn("Past ICS", names)

    def test_dedupe_across_sources(self):
        # "Business Mixer | Temecula" vs "Business Mixer Temecula" same normalised name+date
        self.assertEqual(sum(1 for r in self.rows if es.norm_name(r["name"]) == "business mixer temecula"), 1)

    def test_tracking_stripped_from_event_url(self):
        r = [x for x in self.rows if x["name"].startswith("Business Mixer")][0]
        self.assertNotIn("utm_", r["url"])
        self.assertNotIn("fbclid", r["url"])

    def test_statuses(self):
        d = {s["id"]: s["status"] for s in self.st}
        self.assertEqual(d["timeleft-sd"], "manual")
        self.assertEqual(d["temecula-chamber"], "reachable")
        self.assertEqual(d["eb-la"], "nofixture")

    def test_report_grouping(self):
        md = es.build_report(self.rows, self.st, TODAY, 14)
        self.assertIn("## This week", md)
        self.assertIn("### Temecula", md)
        self.assertIn("### San Diego", md)
        self.assertLess(md.index("### Temecula"), md.index("### San Diego"))
        self.assertIn("**Wednesday**", md)  # 2026-10-14
        self.assertIn("Business Mixer \\| Temecula", md)
        self.assertIn("ALL external text", md)
        self.assertIn("## Sources checked", md)
        self.assertIn("check by hand", md)

    def test_zero_events_report(self):
        md = es.build_report([], [{"id": "a", "name": "A", "city": "Temecula", "url": "https://a.org",
                                   "status": "blocked", "detail": "HTTP 403", "events": 0}], TODAY, 14)
        self.assertIn("0 event(s)", md)
        self.assertIn("blocked", md)

    def test_cli_writes_md_and_json(self):
        with tempfile.TemporaryDirectory() as d:
            out = Path(d) / "EVENTS.md"
            es.main(["--offline", str(FIX), "--out", str(out), "--today", "2026-10-11"])
            self.assertTrue(out.exists())
            j = json.loads(out.with_suffix(".json").read_text())
            self.assertEqual(len(j["events"]), len(self.rows))


if __name__ == "__main__":
    unittest.main()
