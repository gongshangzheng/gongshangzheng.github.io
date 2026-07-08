"""网站配置数据模型"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Any


@dataclass
class SiteConfig:
    """网站配置类"""
    name: str                    # 网站名称（用于文件夹命名）
    url: str                     # 网站地址或 RSS 链接（兼容单源配置）
    crawl_type: str             # 爬取类型：'rss' 或 'custom'
    update_frequency: int       # 更新频率（分钟）
    storage_path: str           # 存储路径（相对于 data/）
    enabled: bool               # 是否启用
    keywords: list[str] = field(default_factory=list)  # 关键词列表（用于过滤）
    custom_config: dict = field(default_factory=dict)  # 自定义配置
    last_crawl_time: datetime | None = None  # 最后爬取时间
    urls: list[str] = field(default_factory=list)      # 多源 RSS 链接
    sources: list[dict[str, Any]] = field(default_factory=list)  # 多源完整配置

    def __post_init__(self):
        if not self.sources:
            if self.urls:
                self.sources = [{"name": self.name, "url": url} for url in self.urls if url]
            elif self.url:
                self.sources = [{"name": self.name, "url": self.url}]
        if not self.urls:
            self.urls = [src.get("url", "") for src in self.sources if src.get("url")]
        if self.url and self.url not in self.urls:
            self.urls.insert(0, self.url)
        if not self.url and self.urls:
            self.url = self.urls[0]
    
    @classmethod
    def from_dict(cls, data: dict) -> 'SiteConfig':
        """
        从字典创建 SiteConfig
        
        注意：update_frequency 应该在调用此方法前已经处理（规则文件优先级 > 全局配置）
        """
        # update_frequency 应该在 load_rule_config 中已经设置好了
        # 这里使用 get 是为了向后兼容，但通常不应该走到默认值
        sources = data.get('sources', []) or []
        urls = data.get('urls', []) or []
        url = data.get('url', '')
        if sources and not urls:
            urls = [src.get('url', '') for src in sources if isinstance(src, dict) and src.get('url')]
        if urls and not url:
            url = urls[0]
        return cls(
            name=data['name'],
            url=url,
            crawl_type=data['crawl_type'],
            update_frequency=data.get('update_frequency', 120),  # 默认 120 分钟（通常不会用到）
            storage_path=data['storage_path'],
            enabled=data.get('enabled', True),
            keywords=data.get('keywords', []),
            custom_config=data.get('custom_config', {}),
            last_crawl_time=None,
            urls=urls,
            sources=sources
        )

