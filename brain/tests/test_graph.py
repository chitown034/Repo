"""brain graph: the whole brain as nodes and links, built from the index alone."""
import unittest
from datetime import date

from fixture import REPO

from brain import graph


class GraphTest(unittest.TestCase):
    def test_build_has_nodes_links_and_groups(self):
        g = graph.build(REPO, today=date(2026, 10, 12))
        self.assertGreater(len(g["nodes"]), 50)
        self.assertTrue(all("id" in n for n in g["nodes"]))
        self.assertTrue(g["links"])
        ids = {n["id"] for n in g["nodes"]}
        self.assertTrue(all(l["s"] in ids and l["t"] in ids for l in g["links"]))

    def test_group_of_names_a_group(self):
        g, _, _ = graph.group_of("wiki/ai-team/org-chart.md")
        self.assertTrue(g)


if __name__ == "__main__":
    unittest.main()
