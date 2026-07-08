"""爬虫管理器"""

from typing import Type
from ..models.site_config import SiteConfig
from .base import BaseCrawler
from .rss_crawler import BaseRSSCrawler
from .arxiv_crawler import ArXivRSSCrawler


class CrawlerManager:
    """爬虫管理器，负责选择和创建对应的爬虫实例"""
    
    # 爬虫注册表：网站名称 -> 爬虫类
    _crawler_registry: dict[str, Type[BaseCrawler]] = {
        'arxiv': ArXivRSSCrawler,
    }
    
    # 默认爬虫（根据类型）
    _default_crawlers: dict[str, Type[BaseCrawler]] = {
        'rss': BaseRSSCrawler,
    }
    
    @classmethod
    def register_crawler(cls, name: str, crawler_class: Type[BaseCrawler]):
        """
        注册爬虫类
        
        Args:
            name: 网站名称（小写）
            crawler_class: 爬虫类
        """
        cls._crawler_registry[name.lower()] = crawler_class
    
    @classmethod
    def get_crawler(cls, site_config: SiteConfig, translator=None) -> BaseCrawler:
        """
        根据配置获取对应的爬虫实例
        
        Args:
            site_config: 网站配置
            translator: 翻译器实例（可选）
            
        Returns:
            爬虫实例
        """
        # 方法1: 根据网站名称查找特定爬虫
        site_name = site_config.name.lower()
        if site_name in cls._crawler_registry:
            crawler_class = cls._crawler_registry[site_name]
            # 检查爬虫类是否支持 translator 参数
            import inspect
            sig = inspect.signature(crawler_class.__init__)
            if 'translator' in sig.parameters:
                return crawler_class(site_config, translator=translator)
            else:
                return crawler_class(site_config)
        
        # 方法2: 根据爬取类型查找默认爬虫
        crawl_type = site_config.crawl_type.lower()
        if crawl_type in cls._default_crawlers:
            crawler_class = cls._default_crawlers[crawl_type]
            return crawler_class(site_config, translator=translator)
        
        # 方法3: 默认使用 RSS 爬虫
        return BaseRSSCrawler(site_config, translator=translator)
    
    @classmethod
    def list_registered_crawlers(cls) -> dict[str, str]:
        """
        列出所有已注册的爬虫
        
        Returns:
            网站名称 -> 爬虫类名的字典
        """
        return {
            name: crawler_class.__name__
            for name, crawler_class in cls._crawler_registry.items()
        }
    
    @classmethod
    def is_registered(cls, name: str) -> bool:
        """
        检查网站是否已注册爬虫
        
        Args:
            name: 网站名称
            
        Returns:
            是否已注册
        """
        return name.lower() in cls._crawler_registry

