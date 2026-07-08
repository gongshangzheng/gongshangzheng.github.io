"""爬取条目数据模型"""

from dataclasses import dataclass, field
from typing import Any
from datetime import datetime


@dataclass
class CrawlItem:
    """爬取条目数据模型"""
    
    title: str                    # 标题
    link: str                     # 链接
    published_time: datetime      # 发布时间
    other_info: dict[str, Any] = field(default_factory=dict)  # 其他信息（摘要、作者、分类等）
    
    def __post_init__(self):
        """初始化后处理"""
        # 确保 other_info 是字典类型
        if not isinstance(self.other_info, dict):
            self.other_info = {}
    
    @property
    def summary(self) -> str | None:
        """获取摘要"""
        return self.other_info.get('summary', '')
    
    @summary.setter
    def summary(self, value: str):
        """设置摘要"""
        self.other_info['summary'] = value
    
    @property
    def authors(self) -> list:
        """获取作者列表"""
        return self.other_info.get('authors', [])
    
    @authors.setter
    def authors(self, value: list):
        """设置作者列表"""
        self.other_info['authors'] = value
    
    @property
    def categories(self) -> list:
        """获取分类列表"""
        return self.other_info.get('categories', [])
    
    @categories.setter
    def categories(self, value: list):
        """设置分类列表"""
        self.other_info['categories'] = value
    
    def to_dict(self) -> dict:
        """转换为字典"""
        return {
            'title': self.title,
            'link': self.link,
            'published_time': self.published_time.isoformat(),
            'published_time_str': self.published_time.strftime('%Y-%m-%d %H:%M:%S'),
            **self.other_info
        }
    
    @classmethod
    def from_dict(cls, data: dict) -> 'CrawlItem':
        """从字典创建"""
        # 解析发布时间
        published_time = data.get('published_time')
        if isinstance(published_time, str):
            try:
                published_time = datetime.fromisoformat(published_time)
            except ValueError:
                # 尝试其他格式
                published_time_str = data.get('published_time_str', '')
                if published_time_str:
                    try:
                        published_time = datetime.strptime(published_time_str, '%Y-%m-%d %H:%M:%S')
                    except ValueError:
                        published_time = datetime.now()
                else:
                    published_time = datetime.now()
        elif not isinstance(published_time, datetime):
            published_time = datetime.now()
        
        # 提取其他信息
        other_info = {k: v for k, v in data.items() 
                     if k not in ['title', 'link', 'published_time', 'published_time_str']}
        
        return cls(
            title=data.get('title', ''),
            link=data.get('link', ''),
            published_time=published_time,
            other_info=other_info
        )

