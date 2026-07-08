"""基础爬虫类"""

from abc import ABC, abstractmethod
from datetime import datetime
from typing import TYPE_CHECKING

from ..models.site_config import SiteConfig
from ..models.crawl_result import CrawlResult
from ..models.crawl_item import CrawlItem

if TYPE_CHECKING:
    from ..filters.base import BaseFilter

class BaseCrawler(ABC):
    """所有爬虫的基类"""
    
    def __init__(self, site_config: SiteConfig):
        """
        初始化爬虫
        
        Args:
            site_config: 网站配置
        """
        self.site_config = site_config
        # 过滤器链，在主程序中注入
        self.filters: list["BaseFilter"] = []
    
    @abstractmethod
    def crawl(self) -> CrawlResult:
        """
        执行爬取操作
        
        Returns:
            CrawlResult: 爬取结果
        """
        pass
    
    @abstractmethod
    def extract_published_time(self, entry: dict) -> datetime | None:
        """
        提取发布时间（每个爬虫需要实现自己的方法）
        
        Args:
            entry: 原始条目数据（可能是 RSS entry、HTML 元素等）
            
        Returns:
            datetime 对象，如果解析失败返回 None
        """
        pass
    
    @abstractmethod
    def extract_title(self, entry: dict) -> str:
        """
        提取标题
        
        Args:
            entry: 原始条目数据
            
        Returns:
            标题字符串
        """
        pass
    
    @abstractmethod
    def extract_link(self, entry: dict) -> str:
        """
        提取链接
        
        Args:
            entry: 原始条目数据
            
        Returns:
            链接字符串
        """
        pass
    
    @abstractmethod
    def extract_other_info(self, entry: dict) -> dict:
        """
        提取其他信息（摘要、作者、分类等）
        
        Args:
            entry: 原始条目数据
            
        Returns:
            其他信息的字典
        """
        pass
    
    def parse_entry(self, entry: dict) -> CrawlItem | None:
        """
        解析条目为 CrawlItem（通用方法，调用各个提取方法）
        
        Args:
            entry: 原始条目数据
            
        Returns:
            CrawlItem 对象，如果解析失败返回 None
        """
        try:
            published_time = self.extract_published_time(entry)
            if not published_time:
                return None
            
            title = self.extract_title(entry)
            link = self.extract_link(entry)
            other_info = self.extract_other_info(entry)
            
            return CrawlItem(
                title=title,
                link=link,
                published_time=published_time,
                other_info=other_info
            )
        except Exception:
            return None
    
    def set_filters(self, filters: list["BaseFilter"]) -> None:
        """设置过滤器链"""
        self.filters = filters or []

    def apply_filters(self, items: list[CrawlItem]) -> list[CrawlItem]:
        """
        按顺序应用过滤器链；如果未配置过滤器，则回退到旧的关键词过滤逻辑。
        """
        if self.filters:
            from ..utils.logger import get_logger
            from ..filters.time_filter import TimeRangeFilter
            logger = get_logger()
            
            # 打印过滤前的条目数量
            initial_count = len(items)
            logger.info(f"[过滤器] 过滤前获取到 {initial_count} 个条目")
            
            for flt in self.filters:
                # 如果是时间过滤器，打印时间范围
                if isinstance(flt, TimeRangeFilter):
                    range_str = flt.get_range_str()
                    logger.info(f"[时间过滤器] 时间范围: {range_str}")
                
                # 输出过滤器描述（如果有）
                filter_name = flt.__class__.__name__
                if hasattr(flt, 'description') and flt.description:
                    logger.info(f"[过滤器] {filter_name}: {flt.description}")
                
                items = flt.apply(items)
                # 打印每个过滤器应用后的条目数量
                current_count = len(items)
                logger.info(f"[过滤器] 应用 {filter_name} 后剩余 {current_count} 个条目")
            
            # 打印最终过滤后的条目数量
            final_count = len(items)
            logger.info(f"[过滤器] 过滤完成，最终保留 {final_count} 个条目（过滤掉 {initial_count - final_count} 个）")
            return items

        # 没有配置过滤器，使用旧的关键词过滤以保持向后兼容
        return self._filter_by_keywords_legacy(items)

    def _filter_by_keywords_legacy(self, items: list[CrawlItem]) -> list[CrawlItem]:
        """旧的关键词过滤逻辑（用于向后兼容），未来可以逐步弃用。"""
        if not self.site_config.keywords:
            return items
        
        filtered_items = []
        for item in items:
            # 检查标题和摘要中是否包含关键词
            title = item.title.lower()
            summary = item.summary.lower() if item.summary else ''
            content = f"{title} {summary}"
            
            # 找出所有匹配的关键词
            matched_keywords = []
            for keyword in self.site_config.keywords:
                if keyword.lower() in content:
                    matched_keywords.append(keyword)
            
            # 如果包含任一关键词，则保留
            if matched_keywords:
                # 将匹配的关键词存储到item中
                if 'keywords' not in item.other_info:
                    item.other_info['keywords'] = []
                # 合并关键词（去重）
                existing_keywords = item.other_info.get('keywords', [])
                if isinstance(existing_keywords, str):
                    existing_keywords = [existing_keywords]
                all_keywords = list(set(existing_keywords + matched_keywords))
                item.other_info['keywords'] = all_keywords
                filtered_items.append(item)
        
        return filtered_items

