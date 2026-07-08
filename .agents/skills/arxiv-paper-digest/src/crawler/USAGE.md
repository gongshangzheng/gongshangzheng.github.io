# 爬虫管理器使用说明

## 概述

`CrawlerManager` 是一个专门用于管理和选择爬虫的类，它提供了统一的接口来根据配置自动选择合适的爬虫实例。

## 核心组件

### 1. CrawlItem - 统一的数据模型

`CrawlItem` 是爬取条目的统一数据模型，包含以下属性：

- **title** (str): 标题
- **link** (str): 链接
- **published_time** (datetime): 发布时间
- **other_info** (Dict): 其他信息（摘要、作者、分类等）

#### 属性访问器

`CrawlItem` 提供了便捷的属性访问器：

```python
item = CrawlItem(...)

# 访问属性
item.title                    # 标题
item.link                     # 链接
item.published_time           # 发布时间（datetime 对象）
item.summary                  # 摘要（通过属性访问器）
item.authors                  # 作者列表（通过属性访问器）
item.categories               # 分类列表（通过属性访问器）

# 设置属性
item.summary = "新的摘要"
item.authors = ["作者1", "作者2"]
```

### 2. BaseCrawler - 抽象基类

所有爬虫必须实现以下抽象方法：

- `extract_published_time(entry: Dict) -> Optional[datetime]` - 提取发布时间
- `extract_title(entry: Dict) -> str` - 提取标题
- `extract_link(entry: Dict) -> str` - 提取链接
- `extract_other_info(entry: Dict) -> Dict` - 提取其他信息

### 3. CrawlerManager - 爬虫管理器

`CrawlerManager` 负责根据配置自动选择合适的爬虫。

#### 使用方式

```python
from src.crawler.crawler_manager import CrawlerManager
from src.models.site_config import SiteConfig

# 加载配置
site_config = load_rule_config("rules/arxiv_rss.yaml")

# 自动选择爬虫
crawler = CrawlerManager.get_crawler(site_config)
```

#### 注册新爬虫

```python
from src.crawler.crawler_manager import CrawlerManager
from src.crawler.example_crawler import ExampleRSSCrawler

# 注册新爬虫
CrawlerManager.register_crawler("example", ExampleRSSCrawler)
```

## 工作流程

1. **配置加载**: 从 YAML 文件加载网站配置
2. **爬虫选择**: `CrawlerManager` 根据 `site_config.name` 选择对应的爬虫
3. **数据提取**: 爬虫使用各自的提取方法解析数据
4. **数据封装**: 解析后的数据封装为 `CrawlItem` 对象
5. **结果返回**: 返回包含 `CrawlItem` 列表的 `CrawlResult`

## 示例：ArXiv 爬虫

ArXiv 爬虫 (`ArXivRSSCrawler`) 重写了以下方法：

- `extract_other_info()`: 提取 ArXiv 特定的信息（ArXiv ID、公告类型等）
- 内部方法：`_extract_summary()`, `_extract_authors()`, `_extract_arxiv_id()` 等

## 添加新网站爬虫的步骤

1. **创建爬虫类**（继承 `BaseRSSCrawler` 或 `BaseCrawler`）
2. **实现抽象方法**：
   - `extract_published_time()`
   - `extract_title()`
   - `extract_link()`
   - `extract_other_info()`
3. **注册爬虫**：
   ```python
   CrawlerManager.register_crawler("site_name", YourCrawlerClass)
   ```
4. **创建配置文件**：`rules/site_name.yaml`

## 优势

1. **统一接口**: 所有爬虫使用相同的数据模型和接口
2. **易于扩展**: 添加新网站只需创建新爬虫类并注册
3. **类型安全**: 使用 `CrawlItem` 确保数据结构一致
4. **灵活配置**: 通过 `CrawlerManager` 自动选择合适的爬虫

