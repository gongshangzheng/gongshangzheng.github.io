"""逻辑组合过滤器：AND / OR / NOT"""


from .base import BaseFilter
from ..models.crawl_item import CrawlItem


class LogicalFilter(BaseFilter):
    """将多个过滤器通过 AND / OR 组合"""

    def __init__(self, operator: str, filters: list[BaseFilter], negate: bool = False, description: str | None = None):
        """
        Args:
            operator: 'and' 或 'or'
            filters: 子过滤器列表
            negate: 是否反选
            description: 过滤器的描述信息
        """
        super().__init__(negate=negate, description=description)
        op = (operator or "").lower()
        if op not in ("and", "or"):
            raise ValueError(f"未知逻辑操作符: {operator}")
        self.operator = op
        self.filters = filters or []

    def match(self, item: CrawlItem) -> bool:
        if not self.filters:
            return True
        results = [flt.match(item) for flt in self.filters]
        if self.operator == "and":
            return all(results)
        else:
            return any(results)


class NotFilter(BaseFilter):
    """单个过滤器的逻辑非：NOT"""

    def __init__(self, flt: BaseFilter, negate: bool = False, description: str | None = None):
        # 注意：BaseFilter 自己也有 negate，会在最终结果再反一次
        super().__init__(negate=negate, description=description)
        self.flt = flt

    def match(self, item: CrawlItem) -> bool:
        # 先取子过滤器结果，再取反
        return not self.flt.match(item)



