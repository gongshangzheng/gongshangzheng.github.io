"""基于文本内容的过滤器：标题、摘要、作者"""


from .base import BaseFilter
from ..models.crawl_item import CrawlItem


class _KeywordTextFilter(BaseFilter):
    """通用关键字文本过滤器"""

    def __init__(self, keywords: list[str], negate: bool = False, description: str | None = None):
        super().__init__(negate=negate, description=description)
        self.keywords = [k.strip().lower() for k in keywords if k and k.strip()]

    def _get_text(self, item: CrawlItem) -> str:
        raise NotImplementedError

    def match(self, item: CrawlItem) -> bool:
        if not self.keywords:
            return True
        text = self._get_text(item).lower()
        if not text:
            return False
        return any(kw in text for kw in self.keywords)


class TitleFilter(_KeywordTextFilter):
    """按标题关键字过滤"""

    def _get_text(self, item: CrawlItem) -> str:
        return item.title or ""


class SummaryFilter(_KeywordTextFilter):
    """按摘要/简介关键字过滤"""

    def _get_text(self, item: CrawlItem) -> str:
        return item.summary or ""


class AuthorFilter(_KeywordTextFilter):
    """按作者关键字过滤"""

    def _get_text(self, item: CrawlItem) -> str:
        authors = item.other_info.get("authors", [])
        if isinstance(authors, str):
            return authors
        if isinstance(authors, list):
            return ", ".join(str(a) for a in authors)
        return str(authors)


