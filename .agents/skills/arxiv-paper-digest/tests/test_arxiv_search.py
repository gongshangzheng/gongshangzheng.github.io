import unittest
from src.arxiv_search import Query, Taxonomy, build_query

class ArxivSearchTests(unittest.TestCase):
    def test_query_building(self):
        q = build_query(["diffusion", "autoregressive"], field="title", categories=Taxonomy.cs, since="20250520")
        s = str(q)
        self.assertIn("ti:(diffusion autoregressive)", s)
        self.assertIn("cat:cs.*", s)
        self.assertIn("submittedDate:[20250520000000 TO", s)

    def test_boolean_ops(self):
        q = Query.title("diffusion") & Query.abstract("flow matching")
        self.assertIn("AND", str(q))

if __name__ == "__main__":
    unittest.main()
