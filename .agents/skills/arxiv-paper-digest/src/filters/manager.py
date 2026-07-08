"""过滤器管理器：根据配置创建过滤器链"""

from typing import Any

from .base import BaseFilter
from .text_filters import TitleFilter, SummaryFilter, AuthorFilter
from .time_filter import TimeRangeFilter
from .logical import LogicalFilter, NotFilter


class FilterManager:
    """根据配置字典创建过滤器实例（支持嵌套 AND/OR）"""

    _FILTER_TYPES = {
        "title": TitleFilter,
        "summary": SummaryFilter,
        "author": AuthorFilter,
        "time_range": TimeRangeFilter,
        # "and" / "or" 由专门逻辑处理
    }

    @classmethod
    def _create_single_filter(cls, cfg: dict[str, Any], target_date: str | None = None) -> BaseFilter | None:
        if not isinstance(cfg, dict):
            return None
        f_type = cfg.get("type")
        if not f_type:
            return None

        f_type = str(f_type).lower()
        negate = bool(cfg.get("negate", False))

        # 逻辑组合过滤器 AND / OR
        if f_type in ("and", "or"):
            sub_cfgs = cfg.get("filters", [])
            sub_filters = cls.create_filters(sub_cfgs, target_date=target_date)
            if not sub_filters:
                return None
            description = cfg.get("description")
            return LogicalFilter(operator=f_type, filters=sub_filters, negate=negate, description=description)

        # NOT 逻辑
        if f_type == "not":
            # 支持:
            # - filter: {...}
            # - filters: [{...}]
            sub_cfg = cfg.get("filter")
            if not sub_cfg:
                sub_list = cfg.get("filters", [])
                if sub_list and isinstance(sub_list, list):
                    sub_cfg = sub_list[0]
            if not sub_cfg:
                return None
            sub_filters = cls.create_filters([sub_cfg], target_date=target_date)
            if not sub_filters:
                return None
            description = cfg.get("description")
            return NotFilter(flt=sub_filters[0], negate=negate, description=description)

        # 文本类过滤器
        if f_type in ("title", "summary", "author"):
            keywords = cfg.get("keywords", [])
            if not isinstance(keywords, list):
                keywords = [keywords]
            FilterClass = cls._FILTER_TYPES[f_type]
            description = cfg.get("description")
            return FilterClass(keywords=keywords, negate=negate, description=description)

        # 时间过滤器
        if f_type == "time_range" or f_type == "time":
            FilterClass = cls._FILTER_TYPES["time_range"]
            description = cfg.get("description")
            return FilterClass(
                start=cfg.get("start"),
                end=cfg.get("end"),
                relative_days_start=cfg.get("relative_days_start"),
                relative_days_end=cfg.get("relative_days_end"),
                relative_hours_start=cfg.get("relative_hours_start"),
                relative_hours_end=cfg.get("relative_hours_end"),
                target_date=target_date or cfg.get("target_date"),
                target_days_before=cfg.get("target_days_before", 1),
                target_days_after=cfg.get("target_days_after", 0),
                yesterday=cfg.get("yesterday", False),
                date_only=cfg.get("date_only", False),
                negate=negate,
                description=description,
            )

        # 未知类型
        return None

    @classmethod
    def create_filters(cls, configs: list[dict[str, Any]], target_date: str | None = None) -> list[BaseFilter]:
        filters: list[BaseFilter] = []
        if not configs:
            return filters

        for cfg in configs:
            flt = cls._create_single_filter(cfg, target_date=target_date)
            if flt is not None:
                filters.append(flt)

        return filters


