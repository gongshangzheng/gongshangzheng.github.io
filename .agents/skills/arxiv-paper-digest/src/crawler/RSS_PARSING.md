# RSS 解析说明

## feedparser 如何处理带 <channel> 标签的 RSS

### RSS 2.0 标准结构

```xml
<?xml version='1.0' encoding='UTF-8'?>
<rss version="2.0">
  <channel>
    <title>Feed Title</title>
    <link>http://example.com</link>
    <description>Feed Description</description>
    <item>
      <title>Item 1 Title</title>
      <link>http://example.com/item1</link>
      <description>Item 1 Description</description>
      <pubDate>Fri, 14 Nov 2025 00:00:00 -0500</pubDate>
    </item>
    <item>
      <title>Item 2 Title</title>
      <link>http://example.com/item2</link>
      ...
    </item>
  </channel>
</rss>
```

### feedparser 解析结果

`feedparser.parse(url)` 返回的对象结构：

```python
feed = feedparser.parse(url)

# feed.feed - 包含 <channel> 的元信息
feed.feed.title        # <channel><title>
feed.feed.link         # <channel><link>
feed.feed.description  # <channel><description>

# feed.entries - 包含所有 <item> 元素的列表
feed.entries           # 所有 <item> 元素的列表
feed.entries[0]       # 第一个 <item>
feed.entries[0].title # 第一个 <item><title>
feed.entries[0].link  # 第一个 <item><link>
feed.entries[0].published  # 第一个 <item><pubDate>
```

### ArXiv RSS 的特殊字段

ArXiv 使用了一些扩展的命名空间：

```xml
<item>
  <title>...</title>
  <link>https://arxiv.org/abs/2511.09563</link>
  <description>arXiv:2511.09563v1 Announce Type: new \n\nAbstract: ...</description>
  <guid isPermaLink="false">oai:arXiv.org:2511.09563v1</guid>
  <category>cs.AI</category>
  <category>math.CO</category>
  <pubDate>Fri, 14 Nov 2025 00:00:00 -0500</pubDate>
  <arxiv:announce_type>new</arxiv:announce_type>
  <dc:creator>Qilong Yuan</dc:creator>
</item>
```

feedparser 会将这些解析为：

```python
entry = feed.entries[0]

# 标准字段
entry.title           # <title>
entry.link           # <link>
entry.description    # <description>
entry.published      # <pubDate> (字符串)
entry.published_parsed  # <pubDate> (解析为 time.struct_time)
entry.id             # <guid> 的值

# 命名空间字段
entry.dc_creator     # <dc:creator>
entry.arxiv_announce_type  # <arxiv:announce_type>

# 多个相同标签（如多个 <category>）
entry.tags           # [{'term': 'cs.AI'}, {'term': 'math.CO'}]
```

### 验证

`BaseRSSCrawler.crawl()` 方法：

1. ✅ 使用 `feedparser.parse()` 解析 RSS（包括 `<channel>` 标签）
2. ✅ 从 `feed.entries` 获取所有 `<item>` 元素
3. ✅ 对每个 entry 调用 `extract_*` 方法提取信息
4. ✅ 进行时间过滤和关键词过滤

**结论**：`feedparser` 完全支持标准的 RSS 2.0 格式（包含 `<channel>` 标签），代码可以正常工作。

