import unittest
from datetime import datetime
from src.models.crawl_item import CrawlItem
from src.filters.time_filter import TimeRangeFilter


class TargetDateFilterTests(unittest.TestCase):
    def _make_item(self, pub_time: datetime) -> CrawlItem:
        return CrawlItem(
            title="Test Paper",
            link="https://arxiv.org/abs/2505.1234",
            published_time=pub_time,
        )

    def test_target_date_window(self):
        flt = TimeRangeFilter(target_date="2026-05-28", target_days_before=1, target_days_after=0)
        # 2026-05-27 04:00 — arXiv paper within window [2026-05-27 00:00, 2026-05-28 00:00)
        item_in = self._make_item(datetime(2026, 5, 27, 4, 0, 0))
        self.assertTrue(flt.match(item_in))

    def test_target_date_excludes_day_before(self):
        flt = TimeRangeFilter(target_date="2026-05-28", target_days_before=1, target_days_after=0)
        # 2026-05-26 23:59 — outside window
        item_out = self._make_item(datetime(2026, 5, 26, 23, 59, 0))
        self.assertFalse(flt.match(item_out))

    def test_target_date_excludes_target_day_itself(self):
        flt = TimeRangeFilter(target_date="2026-05-28", target_days_before=1, target_days_after=0)
        # 2026-05-28 00:00 — right at end boundary (左闭右开)
        item_boundary = self._make_item(datetime(2026, 5, 28, 0, 0, 0))
        self.assertFalse(flt.match(item_boundary))

    def test_target_date_with_after(self):
        flt = TimeRangeFilter(target_date="2026-05-28", target_days_before=0, target_days_after=1)
        # 2026-05-28 10:00 — within [2026-05-28 00:00, 2026-05-29 00:00)
        item_in = self._make_item(datetime(2026, 5, 28, 10, 0, 0))
        self.assertTrue(flt.match(item_in))

    def test_target_date_none_falls_back_to_relative_hours(self):
        """When target_date is not set, relative_hours still works."""
        flt = TimeRangeFilter(relative_hours_start=24, relative_hours_end=0)
        # This just tests it doesn't crash and still applies logic
        item_now = self._make_item(datetime.now())
        self.assertTrue(flt.match(item_now))

    def test_filter_manager_passes_target_date(self):
        from src.filters.manager import FilterManager
        configs = [{"type": "time", "target_days_before": 1, "target_days_after": 0}]
        filters = FilterManager.create_filters(configs, target_date="2026-05-28")
        self.assertEqual(len(filters), 1)
        self.assertIsInstance(filters[0], TimeRangeFilter)
        item_in = self._make_item(datetime(2026, 5, 27, 4, 0, 0))
        self.assertTrue(filters[0].match(item_in))


if __name__ == "__main__":
    unittest.main()
