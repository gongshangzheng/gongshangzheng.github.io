"""RSS 爬虫基类实现"""

import feedparser
from collections import OrderedDict
from datetime import datetime, timedelta
from typing import Any

from .base import BaseCrawler
from ..models.crawl_result import CrawlResult
from ..models.crawl_item import CrawlItem
from ..models.site_config import SiteConfig


class BaseRSSCrawler(BaseCrawler):
    """RSS 爬虫基类，提供通用的 RSS 解析功能"""
    
    def __init__(self, site_config: SiteConfig, translator=None):
        """
        初始化 RSS 爬虫
        
        Args:
            site_config: 网站配置
            translator: 翻译器实例（可选）
        """
        super().__init__(site_config)
        self.update_frequency_hours = site_config.update_frequency / 60  # 转换为小时
        self.translator = translator
    
    def _has_time_filter(self) -> bool:
        def has_time_filter_recursive(filters_list):
            from ..filters.time_filter import TimeRangeFilter
            for flt in filters_list:
                if isinstance(flt, TimeRangeFilter):
                    return True
                if hasattr(flt, 'filters') and has_time_filter_recursive(getattr(flt, 'filters', [])):
                    return True
                if hasattr(flt, 'flt') and isinstance(getattr(flt, 'flt', None), TimeRangeFilter):
                    return True
            return False
        return has_time_filter_recursive(self.filters) if self.filters else False

    def _collect_items_from_entries(self, entries: list[Any], crawl_time: datetime, logger: Any, source_label: str) -> list[CrawlItem]:
        has_time_filter = self._has_time_filter()
        items: list[CrawlItem] = []
        if has_time_filter:
            logger.info(f"[RSS 抓取] {source_label} 检测到时间过滤器，跳过初步时间过滤，由时间过滤器处理")
            for entry in entries:
                published_time = self.extract_published_time(entry)
                if published_time:
                    item = self.parse_entry(entry)
                    if item:
                        items.append(item)
        else:
            time_threshold = crawl_time - timedelta(hours=self.update_frequency_hours)
            logger.info(f"[RSS 抓取] {source_label} 时间阈值: {time_threshold.strftime('%Y-%m-%d %H:%M:%S')} (过去 {self.update_frequency_hours} 小时)")
            for entry in entries:
                published_time = self.extract_published_time(entry)
                if published_time and published_time >= time_threshold:
                    item = self.parse_entry(entry)
                    if item:
                        items.append(item)
        logger.info(f"[RSS 抓取] {source_label} 初步处理后剩余 {len(items)} 个条目")
        return items

    def crawl(self) -> CrawlResult:
        """
        执行 RSS 爬取
        
        Returns:
            CrawlResult: 爬取结果
        """
        crawl_time = datetime.now()
        from ..utils.logger import get_logger
        logger = get_logger()
        
        try:
            sources = self.site_config.sources or [{"name": self.site_config.name, "url": self.site_config.url}]
            merged: OrderedDict[str, CrawlItem] = OrderedDict()
            total_entries_count = 0
            for idx, source in enumerate(sources, 1):
                source_name = source.get('name') or f"{self.site_config.name}-{idx}"
                source_url = source.get('url') or self.site_config.url
                source_label = f"[{source_name}]"
                logger.info(f"[RSS 抓取] 开始抓取 RSS feed: {source_url}")
                logger.info(f"[RSS 抓取] 站点: {source_name}")
                feed = feedparser.parse(source_url)
                if feed.bozo:
                    error_msg = f"RSS 解析错误: {feed.bozo_exception if hasattr(feed, 'bozo_exception') else '未知错误'}"
                    logger.error(f"[RSS 抓取] {source_label} {error_msg}")
                    return CrawlResult(
                        site_name=self.site_config.name,
                        crawl_time=crawl_time,
                        items_count=0,
                        success=False,
                        error_message=error_msg
                    )
                logger.info(f"[RSS 抓取] {source_label} RSS feed 解析成功")
                if not hasattr(feed, 'entries') or len(feed.entries) == 0:
                    logger.warning(f"[RSS 抓取] {source_label} RSS feed 中没有找到条目")
                    continue
                entries_count = len(feed.entries)
                total_entries_count += entries_count
                logger.info(f"[RSS 抓取] {source_label} 找到 {entries_count} 个原始条目")
                items = self._collect_items_from_entries(feed.entries, crawl_time, logger, source_label)
                for item in items:
                    key = item.other_info.get('arxiv_id') or item.link or item.title
                    if key and key not in merged:
                        merged[key] = item
            items = list(merged.values())
            logger.info(f"[RSS 抓取] 多源合并后共保留 {len(items)} 个去重条目（原始条目总数 {total_entries_count}）")
            
            # 如果初步处理后没有条目（可能是所有条目都没有发布时间），提前输出并返回
            if len(items) == 0:
                logger.warning(f"[RSS 抓取] 初步处理后没有符合条件的条目（可能所有条目都没有发布时间）")
                return CrawlResult(
                    site_name=self.site_config.name,
                    crawl_time=crawl_time,
                    items_count=0,
                    success=True,
                    error_message="时间过滤后没有符合条件的条目"
                )
            
            # 过滤器链处理（标题/摘要/作者/时间等），如果未配置则回退到关键词过滤
            logger.info(f"[RSS 抓取] 开始应用过滤器...")
            filtered_items = self.apply_filters(items)
            logger.info(f"[RSS 抓取] 过滤器处理后剩余 {len(filtered_items)} 个条目")
            
            # 转换为字典列表（用于 CrawlResult）
            items_dict = [item.to_dict() for item in filtered_items]
            
            # 应用翻译（如果启用了翻译器）
            if self.translator and self.translator.enabled:
                logger.info(f"[翻译] 开始翻译 {len(items_dict)} 个条目的标题和摘要...")
                translated_count = 0
                for item_dict in items_dict:
                    translated_item = self.translator.translate_item(item_dict)
                    if 'title_zh' in translated_item or 'summary_zh' in translated_item:
                        translated_count += 1
                    # 更新原始字典
                    item_dict.update(translated_item)
                logger.info(f"[翻译] 完成翻译，成功翻译 {translated_count} 个条目")
            
            # 检查是否成功爬取到条目
            items_count = len(filtered_items)
            
            if items_count > 0:
                # 如果爬取到了，输出前几个条目
                logger.info(f"[RSS 抓取] ✓ 成功爬取到 {items_count} 个条目")
                logger.info("[RSS 抓取] 前几个条目预览:")
                preview_count = min(5, items_count)  # 最多显示5个
                for i, item_dict in enumerate(items_dict[:preview_count], 1):
                    title = item_dict.get('title', '无标题')
                    link = item_dict.get('link', '')
                    published_time_str = item_dict.get('published_time_str', '')
                    logger.info(f"  {i}. [{title[:60]}{'...' if len(title) > 60 else ''}]")
                    logger.info(f"     链接: {link}")
                    logger.info(f"     发布时间: {published_time_str}")
            else:
                # 如果没有爬取到，报错
                source_urls = ', '.join(self.site_config.urls) if self.site_config.urls else self.site_config.url
                error_msg = f"爬取失败：未能获取到任何条目（站点: {self.site_config.name}, URL: {source_urls}）"
                logger.error(f"[RSS 抓取] ✗ {error_msg}")
                return CrawlResult(
                    site_name=self.site_config.name,
                    crawl_time=crawl_time,
                    items_count=0,
                    success=False,
                    error_message=error_msg
                )
            
            return CrawlResult(
                site_name=self.site_config.name,
                crawl_time=crawl_time,
                items_count=items_count,
                items=items_dict,
                success=True
            )
            
        except Exception as e:
            logger.error(f"[RSS 抓取] ✗ 爬取过程中发生异常: {str(e)}", exc_info=True)
            return CrawlResult(
                site_name=self.site_config.name,
                crawl_time=crawl_time,
                items_count=0,
                success=False,
                error_message=f"爬取失败: {str(e)}"
            )
    
    def extract_published_time(self, entry: Any) -> datetime | None:
        """
        提取发布时间（RSS 通用方法）
        
        Args:
            entry: RSS 条目（feedparser.FeedParserDict 类型，支持属性和字典访问）
            
        Returns:
            datetime 对象，如果解析失败返回 None
        """
        try:
            # feedparser 通常会将发布时间解析为 time.struct_time
            # FeedParserDict 支持属性访问和字典访问
            if hasattr(entry, 'published_parsed') and entry.published_parsed:
                return datetime(*entry.published_parsed[:6])
            elif hasattr(entry, 'published'):
                # 尝试解析字符串格式的时间
                time_str = entry.published
                # 处理常见的 RSS 时间格式
                for fmt in ['%Y-%m-%dT%H:%M:%SZ', '%Y-%m-%dT%H:%M:%S%z', '%a, %d %b %Y %H:%M:%S %Z']:
                    try:
                        return datetime.strptime(time_str, fmt)
                    except ValueError:
                        continue
        except Exception:
            pass
        
        return None
    
    def extract_title(self, entry: Any) -> str:
        """
        提取标题
        
        Args:
            entry: RSS 条目（feedparser.FeedParserDict 类型，支持属性和字典访问）
            
        Returns:
            标题字符串
        """
        return entry.get('title', '').strip()
    
    def extract_link(self, entry: Any) -> str:
        """
        提取链接
        
        Args:
            entry: RSS 条目（feedparser.FeedParserDict 类型，支持属性和字典访问）
            
        Returns:
            链接字符串
        """
        return entry.get('link', '')
    
    def extract_other_info(self, entry: Any) -> dict:
        """
        提取其他信息（摘要、作者、分类等）
        
        Args:
            entry: RSS 条目（feedparser.FeedParserDict 类型，支持属性和字典访问）
            
        Returns:
            其他信息的字典
        """
        other_info = {
            'summary': entry.get('summary', entry.get('description', '')).strip(),
            'id': entry.get('id', entry.get('link', '')),
            'authors': self._extract_authors_generic(entry),
            'categories': self._extract_categories_generic(entry),
        }
        return other_info
    
    def _extract_authors_generic(self, entry) -> list:
        """
        提取作者信息（通用方法）
        
        Args:
            entry: RSS 条目
            
        Returns:
            作者列表
        """
        authors = []
        
        # 检查标准的 authors 字段
        if hasattr(entry, 'authors') and entry.authors:
            authors = [author.get('name', '') if isinstance(author, dict) else str(author) 
                       for author in entry.authors]
        # 检查 author 字段（单个）
        elif hasattr(entry, 'author') and entry.author:
            authors = [entry.author]
        # 从字典中获取
        elif isinstance(entry, dict):
            if 'authors' in entry:
                authors = entry['authors']
            elif 'author' in entry:
                authors = [entry['author']]
        
        # 清理作者名称
        cleaned_authors = [author.strip() for author in authors if author and author.strip()]
        return cleaned_authors
    
    def _extract_categories_generic(self, entry) -> list:
        """
        提取分类/标签（通用方法）
        
        Args:
            entry: RSS 条目
            
        Returns:
            分类列表
        """
        categories = []
        
        # 检查 tags 字段（feedparser 标准格式）
        if hasattr(entry, 'tags') and entry.tags:
            categories = [tag.get('term', '') if isinstance(tag, dict) else str(tag)
                         for tag in entry.tags]
        # 检查 category 字段
        elif hasattr(entry, 'category') and entry.category:
            if isinstance(entry.category, list):
                categories = [str(cat) for cat in entry.category]
            else:
                categories = [str(entry.category)]
        # 从字典中获取
        elif isinstance(entry, dict):
            if 'tags' in entry:
                tags = entry['tags']
                categories = [tag.get('term', '') if isinstance(tag, dict) else str(tag)
                           for tag in tags]
            elif 'category' in entry:
                cat = entry['category']
                categories = [cat] if isinstance(cat, str) else [str(c) for c in cat]
        
        # 清理分类名称
        cleaned_categories = [cat.strip() for cat in categories if cat and cat.strip()]
        return cleaned_categories
