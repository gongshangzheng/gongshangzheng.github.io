"""按时间范围过滤"""

from datetime import datetime, timedelta

from .base import BaseFilter
from ..models.crawl_item import CrawlItem


class TimeRangeFilter(BaseFilter):
    """
    按时间范围过滤：
    - 可以配置绝对时间 start / end（字符串）
    - 支持相对时间范围：
      * relative_days_start / relative_days_end：相对于今天的日期范围（基于 00:00:00）
      * relative_hours_start / relative_hours_end：相对于当前时间的精确范围（精确到时分秒）
    - 支持 target_date 模式：基于目标日期计算固定窗口，而非相对于当前时刻
      * target_date: "2026-05-28" 格式字符串
      * target_days_before: 目标日期前 N 天（默认 1）
      * target_days_after: 目标日期后 N 天（默认 0）
    - 支持 date_only 模式：只比较日期部分（忽略时分秒），适用于 ArXiv 等只有日期的时间
    - 支持 yesterday 快捷选项：自动设置为昨天的 00:00:00 到今天的 00:00:00
    
    注意：时间区间为左闭右开 [start, end)，即：
    - start 时间点包含（发布时间必须 >= start）
    - end 时间点不包含（发布时间必须 < end）
    """

    def __init__(
        self,
        start: str | None = None,
        end: str | None = None,
        relative_days_start: int | None = None,
        relative_days_end: int | None = None,
        relative_hours_start: int | None = None,
        relative_hours_end: int | None = None,
        target_date: str | None = None,
        target_days_before: int = 1,
        target_days_after: int = 0,
        yesterday: bool = False,
        date_only: bool = False,
        negate: bool = False,
        description: str | None = None,
    ):
        super().__init__(negate=negate, description=description)
        self.start_str = start
        self.end_str = end
        self.relative_days_start = relative_days_start
        self.relative_days_end = relative_days_end
        self.relative_hours_start = relative_hours_start
        self.relative_hours_end = relative_hours_end
        self.target_date_str = target_date
        self.target_days_before = target_days_before
        self.target_days_after = target_days_after
        self.yesterday = yesterday
        self.date_only = date_only

    def _parse_datetime(self, value: str) -> datetime | None:
        """尽量解析多种常见的时间格式"""
        for fmt in ("%Y-%m-%d", "%Y-%m-%d %H:%M:%S"):
            try:
                return datetime.strptime(value, fmt)
            except ValueError:
                continue
        return None

    def _normalize_to_date(self, dt: datetime) -> datetime:
        """将时间标准化为当天的 00:00:00（用于日期比较）"""
        return datetime.combine(dt.date(), datetime.min.time())

    def _get_range(self) -> tuple[datetime | None, datetime | None]:
        now = datetime.now()
        today_start = self._normalize_to_date(now)

        start_dt = None
        end_dt = None

        # target_date 模式：基于目标日期计算固定窗口
        # 例如 target_date="2026-05-28", target_days_before=1 → [2026-05-27 00:00, 2026-05-28 00:00)
        if self.target_date_str:
            target_dt = self._parse_datetime(self.target_date_str)
            if target_dt:
                target_start = self._normalize_to_date(target_dt)
                start_dt = target_start - timedelta(days=self.target_days_before)
                end_dt = target_start + timedelta(days=self.target_days_after)
                return start_dt, end_dt

        # yesterday 快捷选项：昨天的 00:00:00 到今天的 00:00:00
        if self.yesterday:
            yesterday_start = today_start - timedelta(days=1)
            start_dt = yesterday_start
            end_dt = today_start
            return start_dt, end_dt

        # relative_days_start / relative_days_end：相对于今天的日期范围（基于 00:00:00）
        if self.relative_days_start is not None or self.relative_days_end is not None:
            if self.relative_days_start is not None:
                start_dt = today_start - timedelta(days=self.relative_days_start)
            if self.relative_days_end is not None:
                end_dt = today_start - timedelta(days=self.relative_days_end)
            # 如果只设置了 start，end 默认为今天
            if start_dt and end_dt is None:
                end_dt = today_start
            return start_dt, end_dt

        # relative_hours_start / relative_hours_end：相对于当前时间的精确范围（精确到时分秒）
        if self.relative_hours_start is not None or self.relative_hours_end is not None:
            if self.relative_hours_start is not None:
                start_dt = now - timedelta(hours=self.relative_hours_start)
                if self.date_only:
                    start_dt = self._normalize_to_date(start_dt)
            if self.relative_hours_end is not None:
                end_dt = now - timedelta(hours=self.relative_hours_end)
                if self.date_only:
                    end_dt = self._normalize_to_date(end_dt)
            # 如果只设置了 start，end 默认为当前时间
            if start_dt and end_dt is None:
                end_dt = now
            return start_dt, end_dt

        # 绝对时间优先
        if self.start_str:
            start_dt = self._parse_datetime(self.start_str)
            if self.date_only and start_dt:
                start_dt = self._normalize_to_date(start_dt)
        if self.end_str:
            end_dt = self._parse_datetime(self.end_str)
            if self.date_only and end_dt:
                end_dt = self._normalize_to_date(end_dt)

        return start_dt, end_dt

    def get_range_str(self) -> str:
        """
        获取时间范围的字符串表示，用于日志输出
        
        Returns:
            时间范围的字符串描述（说明区间为左闭右开）
        """
        start_dt, end_dt = self._get_range()
        
        if start_dt and end_dt:
            start_str = start_dt.strftime('%Y-%m-%d %H:%M:%S')
            end_str = end_dt.strftime('%Y-%m-%d %H:%M:%S')
            mode_str = "（仅日期）" if self.date_only else ""
            return f"[{start_str}, {end_str}){mode_str}（左闭右开）"
        elif start_dt:
            start_str = start_dt.strftime('%Y-%m-%d %H:%M:%S')
            mode_str = "（仅日期）" if self.date_only else ""
            return f"[{start_str}, +∞){mode_str}（左闭）"
        elif end_dt:
            end_str = end_dt.strftime('%Y-%m-%d %H:%M:%S')
            mode_str = "（仅日期）" if self.date_only else ""
            return f"(-∞, {end_str}){mode_str}（右开）"
        else:
            return "无时间限制"

    def match(self, item: CrawlItem) -> bool:
        """
        判断条目是否匹配时间范围
        
        时间区间为左闭右开 [start, end)：
        - start_dt <= pub < end_dt
        - 即：pub >= start_dt 且 pub < end_dt
        """
        start_dt, end_dt = self._get_range()
        pub = item.published_time
        if not isinstance(pub, datetime):
            return False

        # 如果启用 date_only，将发布时间也标准化为当天的 00:00:00
        if self.date_only:
            pub = self._normalize_to_date(pub)

        # 左闭：发布时间必须 >= start_dt（包含 start_dt）
        if start_dt and pub < start_dt:
            return False
        # 右开：发布时间必须 < end_dt（不包含 end_dt）
        if end_dt and pub >= end_dt:
            return False
        return True
    
    def apply(self, items: list[CrawlItem]) -> list[CrawlItem]:
        """对一组条目应用过滤器，并输出调试信息"""
        from ..utils.logger import get_logger
        logger = get_logger()
        
        start_dt, end_dt = self._get_range()
        result: list[CrawlItem] = []
        sample_count = 0
        max_samples = 3  # 只输出前3个不匹配的条目作为示例
        
        for item in items:
            matched = self.match(item)
            if self.negate:
                matched = not matched
            
            # 输出前几个不匹配条目的调试信息
            if not matched and sample_count < max_samples:
                pub = item.published_time
                if isinstance(pub, datetime):
                    pub_str = pub.strftime('%Y-%m-%d %H:%M:%S')
                    if start_dt:
                        start_str = start_dt.strftime('%Y-%m-%d %H:%M:%S')
                        if pub < start_dt:
                            reason = f"发布时间 {pub_str} < 开始时间 {start_str}"
                        elif end_dt and pub >= end_dt:
                            end_str = end_dt.strftime('%Y-%m-%d %H:%M:%S')
                            reason = f"发布时间 {pub_str} >= 结束时间 {end_str}"
                        else:
                            reason = "未知原因"
                    else:
                        reason = "无开始时间限制"
                    logger.info(f"[时间过滤器] 条目不匹配: {item.title[:50]}... | {reason}")
                    sample_count += 1
            
            if matched:
                result.append(item)
        
        return result


