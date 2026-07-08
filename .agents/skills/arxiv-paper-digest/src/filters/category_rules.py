"""基于过滤器的分类规则，用于替代关键词 category_mapping。"""

from dataclasses import dataclass
from typing import Any

from .base import BaseFilter
from .manager import FilterManager


@dataclass
class CategoryRule:
    name: str
    folder: str
    filter: BaseFilter


class CategoryRuleClassifier:
    """
    使用过滤器规则进行分类，接口兼容 BaseOrgExporter 期望的 keyword_classifier：
    提供 classify_items(items) -> {category: [items]}。
    """

    def __init__(self, rules: list[CategoryRule]):
        self.rules = rules or []

    @classmethod
    def from_config(cls, category_cfg: dict[str, Any]) -> "CategoryRuleClassifier":
        """
        从配置构建分类规则。
        配置格式（推荐）：
        category_mapping:
          agent:
            folder: "agent"
            filter:
              type: "or"
              filters:
                - type: "title"
                  keywords: ["agent", "agents", ...]
                - type: "summary"
                  keywords: ["agent", "agents", ...]

        向后兼容旧格式（value 为关键字列表），会自动转为 title+summary OR 过滤器。
        """
        rules: list[CategoryRule] = []
        if not category_cfg:
            return cls(rules)

        for name, cfg in category_cfg.items():
            if isinstance(cfg, dict) and "filter" in cfg:
                folder = cfg.get("folder", name)
                filter_cfg = cfg["filter"]
            else:
                # 向后兼容：cfg 是关键字列表
                keywords = cfg if isinstance(cfg, list) else []
                folder = name
                filter_cfg = {
                    "type": "or",
                    "filters": [
                        {"type": "title", "keywords": keywords},
                        {"type": "summary", "keywords": keywords},
                    ],
                }

            filters = FilterManager.create_filters([filter_cfg])
            if not filters:
                continue
            category_filter = filters[0]
            rules.append(CategoryRule(name=name, folder=folder, filter=category_filter))

        return cls(rules)

    def classify_items(self, items: list[dict]) -> dict[str, list[dict]]:
        """
        对条目进行分类，同时将命中的分类写入 item['categories']。
        注意：items 为 dict 列表（CrawlResult.items），而非 CrawlItem；
        因此这里直接在 dict 上应用过滤器的 match 逻辑需要适配。
        我们假设之前过滤链已经在 CrawlItem 层做过，这里只根据已有的信息判断。
        简化处理：按 title / summary / authors / published_time 字段构造一个轻量对象。
        """
        from ..models.crawl_item import CrawlItem

        result: dict[str, list[dict]] = {}

        for item in items:
            # 构造临时 CrawlItem 以复用过滤器逻辑
            tmp = CrawlItem(
                title=item.get("title", ""),
                link=item.get("link", ""),
                published_time=item.get("published_time"),
                other_info={
                    "summary": item.get("summary", ""),
                    "authors": item.get("authors", []),
                    "categories": item.get("categories", []),
                },
            )

            matched_categories: list[str] = []
            for rule in self.rules:
                if rule.filter.match(tmp):
                    matched_categories.append(rule.name)
                    result.setdefault(rule.name, []).append(item)

            # 将分类写回 item['categories']
            if matched_categories:
                existing = item.get("categories", [])
                if not isinstance(existing, list):
                    existing = [existing] if existing else []
                # 去重合并
                item["categories"] = sorted(set(existing + matched_categories))

        return result


