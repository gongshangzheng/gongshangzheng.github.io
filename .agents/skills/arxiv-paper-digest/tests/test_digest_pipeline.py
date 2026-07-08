import os, tempfile, unittest
from datetime import datetime
from pathlib import Path
from src.html_blog_digest import default_config, persist_raw_batches, run_digest
from src.crawl_output_writer import normalize_output_formats
class DigestPipelineTests(unittest.TestCase):
    def test_html_blog_digest_is_generated_from_categorized_json(self):
        with tempfile.TemporaryDirectory() as td:
            blog=Path(td)/"blog"; (blog/"src"/"pages").mkdir(parents=True); (blog/"data"/"daily-papers").mkdir(parents=True)
            os.environ["ARXIV_DIGEST_BLOG_DIR"]=str(blog); os.environ["ARXIV_DIGEST_BUILD"]="0"
            try:
                item={"title":"Visual Autoregressive Tokenizer","title_zh":"视觉自回归分词器","link":"https://arxiv.org/abs/2605.00001","id":"oai:arXiv.org:2605.00001v1","authors":["Ada Lovelace","Alan Turing"],"categories":["cs.CV","autoregressive"],"published_time":"2026-05-21T04:00:00","summary":"arXiv:2605.00001v1 Announce Type: new Abstract: Test abstract.","summary_zh":"测试摘要。"}
                persist_raw_batches(blog/"data"/"daily-papers","2026-05-21",{"autoregressive":[item]},datetime(2026,5,21))
                out=run_digest("2026-05-21",build=False); text=out.read_text(encoding="utf-8")
                self.assertEqual(out.suffix,".html"); self.assertIn("created_at: 2026-05-21T10:00:00",text); self.assertIn("updated_at: 2026-05-21T10:00:00",text); self.assertIn("subcategory: 论文每日摘要",text); self.assertIn('<div class="paper-card">',text)
            finally:
                os.environ.pop("ARXIV_DIGEST_BLOG_DIR",None); os.environ.pop("ARXIV_DIGEST_BUILD",None)
    def test_default_config_points_to_html_source(self):
        self.assertEqual(default_config("2026-05-21").post_file.name,"arxiv-digest-2026-05-21.html")
class PipelineConfigTests(unittest.TestCase):
    def test_normalize_html_blog_format(self):
        self.assertEqual(normalize_output_formats("html-blog"),["html-blog"]); self.assertEqual(normalize_output_formats("org,html-blog"),["org","html-blog"])
    def test_cli_imports_without_crawler_dependencies(self):
        import src.cli as main
        self.assertTrue(callable(main.run_once)); self.assertTrue(callable(main.run_continuous))
if __name__=="__main__": unittest.main()
