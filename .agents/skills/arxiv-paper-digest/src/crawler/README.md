# 爬虫模块说明

## 架构设计

爬虫模块采用继承结构，每个网站都有专门的爬虫类：

```
BaseCrawler (抽象基类)
  └── BaseRSSCrawler (RSS 爬虫基类)
      └── ArXivRSSCrawler (ArXiv 专用爬虫)
      └── [其他网站的专用爬虫...]
```

## 类说明

### BaseCrawler
所有爬虫的抽象基类，定义了：
- `crawl()` - 执行爬取的抽象方法
- `filter_by_keywords()` - 关键词过滤方法

### BaseRSSCrawler
RSS 爬虫的基类，提供通用的 RSS 解析功能：
- RSS feed 解析
- 时间过滤（根据更新频率）
- 通用的作者和分类提取
- 可被子类重写以提供特定网站的解析逻辑

### ArXivRSSCrawler
ArXiv 专用爬虫，继承自 `BaseRSSCrawler`，提供：
- ArXiv 特定的摘要解析（处理 "Abstract:" 格式）
- ArXiv 作者提取（dc:creator 标签）
- ArXiv ID 提取（从 guid、link 或 description）
- ArXiv 公告类型提取

## 如何添加新的网站爬虫

### 示例：添加一个新的 RSS 网站爬虫

1. 创建新的爬虫文件 `src/crawler/example_crawler.py`:

```python
from .rss_crawler import BaseRSSCrawler
from ..models.site_config import SiteConfig
from datetime import datetime
from typing import Dict

class ExampleRSSCrawler(BaseRSSCrawler):
    """示例网站 RSS 爬虫"""
    
    def __init__(self, site_config: SiteConfig):
        super().__init__(site_config)
    
    def _parse_entry(self, entry, published_time: datetime) -> Dict:
        """重写此方法以提供特定网站的解析逻辑"""
        # 调用父类方法获取基础字段
        item = super()._parse_entry(entry, published_time)
        
        # 添加特定网站的解析逻辑
        # 例如：提取特定字段、格式化数据等
        item['custom_field'] = self._extract_custom_field(entry)
        
        return item
    
    def _extract_custom_field(self, entry):
        """提取特定字段的方法"""
        # 实现特定网站的解析逻辑
        return entry.get('custom_field', '')
```

2. 在 `src/crawler/__init__.py` 中导出：

```python
from .example_crawler import ExampleRSSCrawler
__all__ = [..., 'ExampleRSSCrawler']
```

3. 在 `src/cli.py` 的 `create_crawler()` 函数中添加：

```python
def create_crawler(site_config: SiteConfig) -> BaseCrawler:
    if site_config.name.lower() == 'example':
        return ExampleRSSCrawler(site_config)
    # ...
```

4. 创建规则配置文件 `rules/example_rss.yaml`:

```yaml
name: "example"
url: "https://example.com/rss"
crawl_type: "rss"
update_frequency: 120
storage_path: "example"
enabled: true
keywords:
  - "keyword1"
  - "keyword2"
```

## 当前支持的爬虫

- ✅ **ArXivRSSCrawler**: ArXiv 论文爬取
- ✅ **BaseRSSCrawler**: 通用 RSS 爬虫（适用于标准 RSS 格式）

## 注意事项

1. **继承关系**: 新的 RSS 爬虫应该继承自 `BaseRSSCrawler`，而不是 `BaseCrawler`
2. **方法重写**: 主要重写 `_parse_entry()` 方法来提供特定网站的解析逻辑
3. **复用父类方法**: 可以使用 `super()._parse_entry()` 获取基础字段，然后添加特定字段
4. **工厂模式**: 在 `create_crawler()` 函数中根据 `site_config.name` 选择对应的爬虫

