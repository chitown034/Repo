"""Unit tests for brain/. Run: python3 -m unittest discover -s brain/tests"""

from __future__ import annotations

import json
import os
import subprocess
import sys
import textwrap
import unittest
from datetime import date
from pathlib import Path

from fixture import REPO, BrainCase  # noqa: E402  (fixture puts REPO on sys.path)

from brain import bench, doctor, indexer, recall, remember  # noqa: E402
from brain.text import keywords, sections, stem, tokenize  # noqa: E402

CONTRACT = {"query", "keywords", "file", "section", "pointer_followed", "pointer_file", "evidence",
            "bytes_read", "est_tokens", "candidates_scored", "ms", "confidence"}


class TextTests(unittest.TestCase):
    def test_stem_merges_inflections(self):
        self.assertEqual(stem("licensed"), stem("license"))
        self.assertEqual(stem("firing"), stem("fire"))
        self.assertEqual(stem("running"), "run")
        self.assertEqual(stem("hours"), "hour")

    def test_keywords_drop_filler_and_keep_identifiers(self):
        kws = [s for s, _ in keywords("What is Steven's brain-weekly-verify schedule, please?")]
        self.assertEqual(kws, ["brain-weekly-verify", "schedule"])

    def test_tokenize_compounds_and_parts(self):
        toks = tokenize("see `context/decisions.md` and isa_line")
        self.assertIn("decisions.md", toks)
        self.assertIn("decision", toks)
        self.assertIn(stem("isa_line"), toks)

    def test_sections_split_by_heading_and_fold_empty_parents(self):
        secs = sections("# T\n\nintro\n\n## A\n### A1\nbody a1\n## B\nbody b\n")
        titles = [s["title"] for s in secs]
        self.assertEqual(titles, ["T", "A › A1", "B"])

    def test_headings_inside_code_fences_are_ignored(self):
        secs = sections("# T\n\n```\n# not a heading\n```\n\n## Real\nx\n")
        self.assertEqual([s["title"] for s in secs], ["T", "Real"])


class IndexerTests(BrainCase, unittest.TestCase):
    def test_build_is_deterministic(self):
        a = indexer.render_index_json(indexer.build(self.root))
        b = indexer.render_index_json(indexer.build(self.root))
        self.assertEqual(a, b)
        self.assertNotIn("mtime", a)

    def test_include_and_exclude_rules(self):
        paths = [f["path"] for f in indexer.build(self.root)["files"]]
        for want in ("CLAUDE.md", "context/about-me.md", "projects/alpha.md", "memory.md",
                     "always-on/README.md", "routines/repairs.md", "docs/notes.md"):
            self.assertIn(want, paths)
        self.assertNotIn("docs/findings/skip.md", paths)
        self.assertNotIn(".claude/skills/x/SKILL.md", paths)
        self.assertNotIn("INDEX.md", paths)

    def test_index_md_has_exactly_one_line_per_file(self):
        ix = indexer.write(self.root)
        text = (self.root / "INDEX.md").read_text()
        for f in ix["files"]:
            self.assertEqual(text.count(f"- `{f['path']}` —"), 1, f["path"])
        for line in text.splitlines():
            if line.startswith("- `"):
                desc = line.split(" — ")[-1]
                self.assertLessEqual(len(desc), 121)

    def test_descriptions(self):
        by = {f["path"]: f for f in indexer.build(self.root)["files"]}
        self.assertEqual(by["projects/alpha.md"]["title"], "Project Alpha")
        self.assertEqual(by["projects/alpha.md"]["description"],
                         "The alpha project tracks the harbor bridge rebuild.")
        # "One page." is too short alone, so the next sentence is taken too
        self.assertEqual(by["context/about-me.md"]["description"],
                         "One page. Facts only, drawn from the bio cards.")
        # a leading bold label is not the description
        self.assertTrue(by["memory.md"]["description"].startswith("This file is the auto-memory store"))

    def test_index_json_carries_what_scoring_needs(self):
        ix = indexer.build(self.root)
        f = next(x for x in ix["files"] if x["path"] == "context/about-me.md")
        for key in ("keywords", "headings", "bytes", "hash", "sections", "title", "description"):
            self.assertIn(key, f)
        self.assertEqual(f["bytes"], (self.root / "context/about-me.md").stat().st_size)
        self.assertEqual(len(f["hash"]), 16)
        self.assertEqual(len(ix["vocab"]), len(ix["df"]))

    def test_routes_parsed_from_claude_md(self):
        routes = indexer.build(self.root)["routes"]
        self.assertEqual(routes[0]["load"], ["context/about-me.md"])
        self.assertIn("wiki/", routes[0]["never"])
        self.assertEqual(routes[1]["load"], ["projects/"])


class RecallTests(BrainCase, unittest.TestCase):
    def setUp(self):
        super().setUp()
        indexer.write(self.root)

    def ask(self, q, **kw):
        return recall.recall(q, root=self.root, **kw)

    def test_contract_keys(self):
        r = self.ask("Which states is Steven licensed in?")
        self.assertTrue(CONTRACT <= set(r))
        self.assertEqual(set(r) - CONTRACT, set())

    def test_finds_the_right_file_and_section(self):
        r = self.ask("Which states is Steven personally licensed in as an MLO?")
        self.assertEqual(r["file"], "context/about-me.md")
        self.assertEqual(r["section"], "Licensed capacities")
        self.assertIn("CA, NV, AZ, FL, IL", r["evidence"])
        self.assertNotIn("Temecula", r["evidence"])        # only the section, not the file
        self.assertEqual(r["bytes_read"], (self.root / "context/about-me.md").stat().st_size)
        self.assertEqual(r["est_tokens"], (len(r["evidence"]) + 3) // 4)
        self.assertGreater(r["confidence"], 0.5)

    def test_scores_every_candidate_but_opens_one(self):
        opened = []
        real = Path.read_bytes

        def spy(p):
            opened.append(p)
            return real(p)
        Path.read_bytes = spy
        try:
            r = self.ask("When was the harbor bridge rebuild status last updated?")
        finally:
            Path.read_bytes = real
        self.assertEqual(r["file"], "projects/alpha.md")
        self.assertEqual(r["candidates_scored"], len(indexer.load(self.root)["files"]))
        self.assertEqual([p.name for p in opened], ["alpha.md"])

    def test_refuses_what_is_not_in_the_brain(self):
        r = self.ask("What is the name of Steven's dog?")
        self.assertIsNone(r["file"])
        self.assertIsNone(r["section"])
        self.assertEqual(r["evidence"], recall.NOT_IN_BRAIN)
        self.assertIn("NOT IN THE BRAIN", recall.format_human(r))

    def test_empty_question_refuses(self):
        r = self.ask("what is the?")
        self.assertIsNone(r["file"])
        self.assertEqual(r["keywords"], [])

    def test_follows_a_pointer_once(self):
        r = self.ask("What is the paste-ready repair for broken tasks? Always-on repairs list")
        self.assertEqual(r["file"], "always-on/README.md")
        self.assertEqual(r["section"], "Repairs")
        self.assertTrue(r["pointer_followed"])
        self.assertEqual(r["pointer_file"], "routines/repairs.md")
        self.assertIn("[pointer → routines/repairs.md", r["evidence"])
        both = sum((self.root / p).stat().st_size for p in ("always-on/README.md", "routines/repairs.md"))
        self.assertEqual(r["bytes_read"], both)

    def test_no_pointer_hop_when_the_section_answers(self):
        r = self.ask("What is the cron for nightly-verify?")
        self.assertEqual(r["file"], "always-on/README.md")
        self.assertFalse(r["pointer_followed"])
        self.assertIn("Sunday 4:00 PM", r["evidence"])

    def test_long_sections_are_capped(self):
        body = "\n".join(f"| row {i} | filler text for the table |" for i in range(200))
        (self.root / "docs/long.md").write_text(
            "# Long\n\nA long table.\n\n## Table\n\n| a | b |\n|---|---|\n" + body
            + "\n| row pelican | the pelican answer lives here |\n", encoding="utf-8")
        indexer.write(self.root)
        r = self.ask("Where does the pelican answer live?")
        self.assertEqual(r["file"], "docs/long.md")
        self.assertIn("pelican answer", r["evidence"])
        self.assertLessEqual(len(r["evidence"].splitlines()), recall.LINE_CAP + 4)

    def test_laya_hint_is_optional_and_failures_are_ignored(self):
        os.environ["BRAIN_ROUTER"] = "laya"
        base = self.ask("Which states is Steven licensed in?")          # no script → ignored
        self.assertEqual(base["file"], "context/about-me.md")
        laya = self.root / "integrations/laya"
        laya.mkdir(parents=True)
        (laya / "laya_route.py").write_text("import sys; sys.exit(3)\n")
        self.assertEqual(self.ask("Which states is Steven licensed in?")["file"], "context/about-me.md")
        (laya / "laya_route.py").write_text("print('not json')\n")
        self.assertEqual(self.ask("Which states is Steven licensed in?")["file"], "context/about-me.md")

    def test_laya_hint_boosts_its_prefix(self):
        os.environ["BRAIN_ROUTER"] = "laya"
        laya = self.root / "integrations/laya"
        laya.mkdir(parents=True)
        (laya / "laya_route.py").write_text(
            "import json; print(json.dumps({'route': 'docs/', 'confidence': 0.9}))\n")
        idx = indexer.load(self.root)
        ranked, _ = recall.rank("quokka migration", idx, self.root)
        os.environ.pop("BRAIN_ROUTER")
        plain, _ = recall.rank("quokka migration", idx, self.root)
        self.assertEqual(ranked[0][2]["path"], "docs/notes.md")
        self.assertGreater(ranked[0][0], plain[0][0])

    def test_laya_timeout_is_ignored(self):
        os.environ["BRAIN_ROUTER"] = "laya"
        laya = self.root / "integrations/laya"
        laya.mkdir(parents=True)
        (laya / "laya_route.py").write_text("import time; time.sleep(5)\n")
        old = recall.LAYA_TIMEOUT
        recall.LAYA_TIMEOUT = 0.3
        try:
            r = self.ask("Which states is Steven licensed in?")
        finally:
            recall.LAYA_TIMEOUT = old
        self.assertEqual(r["file"], "context/about-me.md")


class RememberTests(BrainCase, unittest.TestCase):
    def setUp(self):
        super().setUp()
        indexer.write(self.root)

    def test_appends_dated_line_and_reindexes(self):
        before = (self.root / "memory.md").read_text()
        res = remember.remember("The quokka dashboard reads the zebra doc.", root=self.root,
                                today=date(2026, 9, 27))
        after = (self.root / "memory.md").read_text()
        self.assertTrue(after.startswith(before))                      # append-only
        self.assertTrue(after.endswith("- 2026-09-27 — The quokka dashboard reads the zebra doc.\n"))
        self.assertTrue(res["added"])
        ok, report = doctor.run(self.root)
        self.assertTrue(ok, report)                                    # index refreshed in the same step
        r = recall.recall("What does the quokka dashboard read?", root=self.root)
        self.assertEqual(r["file"], "memory.md")

    def test_duplicate_is_not_written_twice(self):
        remember.remember("Alpha ships in October.", root=self.root, today=date(2026, 9, 27))
        res = remember.remember("Alpha ships in October.", root=self.root, today=date(2026, 9, 27))
        self.assertFalse(res["added"])
        self.assertEqual((self.root / "memory.md").read_text().count("Alpha ships in October."), 1)

    def test_topic_creates_and_indexes_memory_file(self):
        res = remember.remember("Pelicans nest on the north pier.", topic="Harbor Birds",
                                source="field note", root=self.root, today=date(2026, 9, 27))
        self.assertEqual(res["file"], "memory/harbor-birds.md")
        text = (self.root / "memory/harbor-birds.md").read_text()
        self.assertIn("- 2026-09-27 — Pelicans nest on the north pier. (source: field note)", text)
        index_md = (self.root / "INDEX.md").read_text()
        self.assertIn("- `memory/harbor-birds.md` — Memory — Harbor Birds —", index_md)
        r = recall.recall("Where do pelicans nest?", root=self.root)
        self.assertEqual(r["file"], "memory/harbor-birds.md")

    def test_refuses_secrets_and_pii_and_writes_nothing(self):
        bad = [
            "the key is sk-ant-api03-AbCdEfGhIjKlMnOpQrStUv",
            "token ghp_abcdefghijklmnopqrstuvwxyz0123456789",
            "slack xoxb-123456789012-abcdefghijkl",
            "aws AKIAIOSFODNN7EXAMPLE",
            "blob aGVsbG8gd29ybGQgdGhpcyBpcyBhIHRlc3Qgb2YgYmFzZTY0",
            "hash d41d8cd98f00b204e9800998ecf8427e",
            "borrower SSN 123-45-6789",
            "card 4111 1111 1111 1111 on file",
            "wire to routing 021000021 at the bank",
            "loan number 88812345",
            "zoho password=Hunter2Hunter2",
            "the password is correcthorse",
            "Jane at jane.doe@example.com or 555-123-4567",
            "https://user:pa55word@example.com/path",
        ]
        before = {p: p.read_bytes() for p in self.root.rglob("*") if p.is_file()}
        for fact in bad:
            with self.assertRaises(remember.Refused, msg=fact):
                remember.remember(fact, root=self.root)
        with self.assertRaises(remember.Refused):
            remember.remember("fine fact", source="password=Hunter2Hunter2", root=self.root)
        after = {p: p.read_bytes() for p in self.root.rglob("*") if p.is_file()}
        self.assertEqual(before, after)

    def test_allows_ordinary_operational_facts(self):
        ok = [
            "NMLS 1921615 is Patriot Pacific Financial's number.",
            "trig_01M5zR1Po44gnHvTwA9ogZaB is the live Pipeline Sync routine.",
            "Artifact 1624daae-d683-405a-971d-c5828dce0f8d holds the state collection.",
            "A 27-second clip is 135,424 tokens; see integrations/omniroute-failover/README.md.",
            "Card number formats are validated with the Luhn check.",
            "runnerStatus was 2026-09-22T07:06:12Z, seven hours behind.",
        ]
        for fact in ok:
            remember.guard(fact)

    def test_luhn_negative_is_not_a_card(self):
        remember.guard("order 4111 1111 1111 1112 shipped")   # fails Luhn → not a card


class DoctorTests(BrainCase, unittest.TestCase):
    def setUp(self):
        super().setUp()
        indexer.write(self.root)

    def test_passes_on_a_fresh_index(self):
        ok, report = doctor.run(self.root)
        self.assertTrue(ok, report)

    def test_fails_when_a_file_is_added_unindexed(self):
        (self.root / "context/new.md").write_text("# New\n\nA new context file.\n")
        ok, report = doctor.run(self.root)
        self.assertFalse(ok)
        self.assertIn("context/new.md", "\n".join(report))

    def test_fails_when_a_file_changes_unindexed(self):
        with (self.root / "projects/alpha.md").open("a") as fh:
            fh.write("\nA new line.\n")
        self.assertFalse(doctor.run(self.root)[0])

    def test_fails_when_a_routed_path_is_missing(self):
        (self.root / "always-on/README.md").unlink()
        indexer.write(self.root)
        ok, report = doctor.run(self.root)
        self.assertFalse(ok)
        self.assertIn("always-on/README.md", "\n".join(report))

    def test_fails_on_a_dangling_index_line(self):
        p = self.root / "INDEX.md"
        p.write_text(p.read_text() + "- `context/ghost.md` — Ghost — gone\n")
        ok, report = doctor.run(self.root)
        self.assertFalse(ok)
        self.assertIn("context/ghost.md", "\n".join(report))

    def test_routed_paths_expand_project_names(self):
        self.assertIn("projects/alpha.md", doctor.routed_paths(self.root))


class CliTests(BrainCase, unittest.TestCase):
    def run_cli(self, *args):
        env = dict(os.environ, BRAIN_ROOT=str(self.root))
        return subprocess.run([sys.executable, str(REPO / "bin" / "brain"), *args], cwd="/",
                              capture_output=True, text=True, env=env, timeout=60)

    def test_reindex_recall_json_contract_from_any_cwd(self):
        self.assertEqual(self.run_cli("reindex").returncode, 0)
        p = self.run_cli("recall", "--json", "Which states is Steven licensed in?")
        self.assertEqual(p.returncode, 0, p.stderr)
        data = json.loads(p.stdout)
        self.assertEqual(set(data), CONTRACT)
        self.assertEqual(data["file"], "context/about-me.md")
        p = self.run_cli("recall", "--json", "--top", "2", "harbor bridge")
        self.assertEqual(set(json.loads(p.stdout)) - CONTRACT, {"top"})

    def test_human_recall_and_doctor(self):
        self.run_cli("reindex")
        p = self.run_cli("recall", "When", "was", "the", "harbor", "bridge", "rebuild", "updated?")
        self.assertIn("projects/alpha.md § Status", p.stdout)
        self.assertIn("est tokens", p.stdout)
        self.assertEqual(self.run_cli("doctor").returncode, 0)

    def test_remember_refusal_exit_code(self):
        self.run_cli("reindex")
        p = self.run_cli("remember", "api_key=sk-live-abcdefghijklmnopqrstuvwx")
        self.assertEqual(p.returncode, 2)
        self.assertIn("REFUSED", p.stderr)
        p = self.run_cli("remember", "--topic", "ops", "The ops board moved to Monday.")
        self.assertEqual(p.returncode, 0, p.stderr)
        self.assertTrue((self.root / "memory/ops.md").is_file())
        self.assertEqual(self.run_cli("doctor").returncode, 0)


class BenchTests(BrainCase, unittest.TestCase):
    def test_bench_runs_and_scores(self):
        indexer.write(self.root)
        (self.root / "brain/bench").mkdir(parents=True)
        qs = {"questions": [
            {"id": "t1", "kind": "leaf", "question": "Which states is Steven licensed in as an MLO?",
             "expected_file": "context/about-me.md", "expected_phrase": "CA, NV, AZ, FL, IL",
             "alt_files": [], "router_leaf": "context/about-me.md"},
            {"id": "t2", "kind": "refusal", "question": "What is the name of Steven's dog?",
             "expected_file": None, "expected_phrase": None, "alt_files": [], "router_leaf": None},
        ]}
        (self.root / bench.QUESTIONS).write_text(json.dumps(qs))
        res = bench.run(self.root)
        t = res["totals"]
        self.assertEqual(t["brain"]["correct"], 1)
        self.assertEqual(t["brain"]["refusals_correct"], 1)
        self.assertEqual(t["router"]["correct"], 1)
        self.assertLess(t["brain"]["tokens"], t["router"]["tokens"])
        text = bench.render(res)
        self.assertIn("## Totals", text)
        self.assertIn("## Verdict", text)


class GoldSetTests(unittest.TestCase):
    """The real benchmark's gold answers must still be true of the real repo (read-only)."""

    def test_every_gold_phrase_is_in_its_file(self):
        qs = json.loads((REPO / bench.QUESTIONS).read_text())["questions"]
        self.assertGreaterEqual(len(qs), 15)
        self.assertGreaterEqual(sum(1 for q in qs if q["expected_file"] is None), 2)
        for q in qs:
            if q["expected_file"] is None:
                continue
            for f in [q["expected_file"], *q.get("alt_files", [])]:
                self.assertTrue((REPO / f).is_file(), f"{q['id']}: {f} missing")
            text = (REPO / q["expected_file"]).read_text(encoding="utf-8")
            self.assertTrue(recall.contains_phrase(text, q["expected_phrase"]),
                            f"{q['id']}: phrase not in {q['expected_file']}")


if __name__ == "__main__":
    unittest.main()


class PassageTests(BrainCase, unittest.TestCase):
    """Proximity, wrapped-line joining and the in-document "item N" pointer."""

    def setUp(self):
        super().setUp()
        self.q = recall.Query("What fix unblocks the quokka permit?", indexer.build(self.root))

    def test_logical_lines_rejoin_wrapped_items(self):
        lines = ["5. **Quokka permit** — the fix is", "    item 9 and nothing else.", "6. Next item"]
        self.assertEqual(recall.logical_lines(lines),
                         ["5. **Quokka permit** — the fix is item 9 and nothing else.", "6. Next item"])

    def test_proximity_rewards_terms_together(self):
        together = recall.proximity(["The quokka permit fix is filed."], self.q)
        apart = recall.proximity(["The quokka sleeps.", "A permit exists.", "Every fix waits."], self.q)
        self.assertGreater(together, apart)

    def test_table_row_is_one_unit(self):
        row = recall.proximity(["| quokka | permit | fix |"], self.q)
        self.assertAlmostEqual(row, recall.proximity(["quokka permit fix"], self.q))
        self.assertGreater(row, recall.proximity(["| quokka |"], self.q))

    def test_item_pointer_follows_to_the_named_item(self):
        text = ("# Needs\n\n## Open\n\n5. **Quokka permit** — tick the Quokka Permit box to fix it.\n\n"
                "## Later\n\n57. **Quokka, unchanged** — still blocked. The fix is\n    item 5 and nothing else.\n")
        sec = ["## Later", "", "57. **Quokka, unchanged** — still blocked. The fix is", "    item 5 and nothing else."]
        hop = recall.item_pointer(sec, text, self.q)
        self.assertEqual(hop[0], "item 5")
        self.assertIn("tick the Quokka Permit box", hop[1])

    def test_item_pointer_ignores_items_already_in_the_section(self):
        text = "# N\n\n## A\n\n5. Quokka permit fix: see item 5.\n"
        self.assertIsNone(recall.item_pointer(["## A", "", "5. Quokka permit fix: see item 5."], text, self.q))
