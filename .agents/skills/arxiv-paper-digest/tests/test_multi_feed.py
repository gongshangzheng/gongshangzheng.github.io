import unittest
from datetime import datetime
from src.models.site_config import SiteConfig


class MultiFeedConfigTests(unittest.TestCase):
    def test_site_config_builds_sources_from_urls(self):
        cfg = SiteConfig(
            name="arxiv",
            url="https://rss.arxiv.org/rss/cs.AI",
            urls=["https://rss.arxiv.org/rss/cs.AI", "https://rss.arxiv.org/rss/cs.CV"],
            crawl_type="rss",
            update_frequency=1440,
            storage_path="daily-papers",
            enabled=True,
        )
        self.assertEqual(len(cfg.sources), 2)
        self.assertEqual(cfg.sources[0]["url"], "https://rss.arxiv.org/rss/cs.AI")
        self.assertEqual(cfg.sources[1]["url"], "https://rss.arxiv.org/rss/cs.CV")

    def test_site_config_from_dict_accepts_sources(self):
        cfg = SiteConfig.from_dict(
            {
                "name": "arxiv",
                "url": "https://rss.arxiv.org/rss/cs.AI",
                "sources": [
                    {"name": "arxiv-ai", "url": "https://rss.arxiv.org/rss/cs.AI"},
                    {"name": "arxiv-cv", "url": "https://rss.arxiv.org/rss/cs.CV"},
                ],
                "crawl_type": "rss",
                "update_frequency": 1440,
                "storage_path": "daily-papers",
                "enabled": True,
            }
        )
        self.assertEqual(len(cfg.sources), 2)
        self.assertEqual(cfg.urls, ["https://rss.arxiv.org/rss/cs.AI", "https://rss.arxiv.org/rss/cs.CV"])


if __name__ == "__main__":
    unittest.main()
