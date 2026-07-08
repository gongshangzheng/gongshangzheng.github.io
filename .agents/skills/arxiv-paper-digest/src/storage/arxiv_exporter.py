"""ArXiv 专用的 Org-mode 格式导出器"""

from datetime import datetime
from pathlib import Path

from .base_exporter import BaseOrgExporter


class ArXivOrgExporter(BaseOrgExporter):
    """ArXiv 专用的 Org-mode 格式导出器"""
    
    def _format_item_detailed(self, item: dict, index: int, crawl_time: datetime, output_path: Path | None = None) -> list[str]:
        """详细格式：包含所有信息（ArXiv 特定）"""
        lines = []
        
        # 使用标题模板
        lines.append(self._render_title(item, index, crawl_time, output_path))
        
        # Properties
        lines.append(":PROPERTIES:")
        if item.get('link'):
            lines.append(f":URL: {item['link']}")
        if item.get('id'):
            lines.append(f":ID: {item['id']}")
        if item.get('arxiv_id'):
            lines.append(f":ARXIV_ID: {item['arxiv_id']}")
        if item.get('categories'):
            categories_str = ", ".join(item['categories'])
            lines.append(f":CATEGORIES: {categories_str}")
        if item.get('published_time'):
            lines.append(f":PUBLISHED_TIME: {item['published_time']}")
        if item.get('arxiv_announce_type'):
            lines.append(f":ARXIV_ANNOUNCE_TYPE: {item['arxiv_announce_type']}")
        lines.append(f":CRAWL_TIME: {crawl_time.strftime('%Y-%m-%d %H:%M:%S')}")

        lines.append(":END:")
        lines.append("")
        
        # 标题
        lines.append(item.get('title', ''))
        lines.append("")
                # 标题（中文）- 如果有翻译
        if item.get('title_zh'):
            # lines.append("** 标题（中文）")
            lines.append(item['title_zh'])
            lines.append("")

        # 作者
        if item.get('authors'):
            # lines.append("** 作者")
            authors_str = ", ".join(item['authors'])
            lines.append(authors_str)
            lines.append("")
        
        # 链接
        if item.get('link'):
            # lines.append("** 链接")
            lines.append(f"[[{item['link']}][{item['link']}]]")
            lines.append("")
        # 摘要
        if item.get('summary'):
            summary = item['summary'].replace('\n', ' ')
            lines.append(summary)
            lines.append("")
        
        # 摘要（中文）- 如果有翻译
        if item.get('summary_zh'):
            # lines.append("** 摘要（中文）")
            summary_zh = item['summary_zh'].replace('\n', ' ')
            lines.append(summary_zh)
            lines.append("")
        # LLM 摘要
        if item.get('llm_summary'):
            lines.append("** LLM 摘要")
            lines.append(item['llm_summary'])
            lines.append("")
        
        # 关键词
        if item.get('keywords'):
            lines.append("** 关键词")
            if isinstance(item['keywords'], list):
                keywords_str = ", ".join(item['keywords'])
            else:
                keywords_str = str(item['keywords'])
            lines.append(keywords_str)
            lines.append("")
        
        return lines
    
    def _format_item_markdown_detailed(self, item: dict, index: int, crawl_time: datetime, output_path: Path | None = None) -> list[str]:
        """Markdown 详细格式：包含所有信息（ArXiv 特定）"""
        lines = []
        
        # 使用标题模板
        lines.append(self._render_title_markdown(item, index, crawl_time, output_path))
        lines.append("")
        
        # 元数据（Markdown 格式）
        metadata_lines = []
        if item.get('link'):
            metadata_lines.append(f"- **链接**: [{item['link']}]({item['link']})")
        if item.get('id'):
            metadata_lines.append(f"- **ID**: {item['id']}")
        if item.get('arxiv_id'):
            metadata_lines.append(f"- **ArXiv ID**: {item['arxiv_id']}")
        if item.get('categories'):
            categories_str = ", ".join(item['categories'])
            metadata_lines.append(f"- **分类**: {categories_str}")
        if item.get('published_time', item.get('published_time_str')):
            published_time = item.get('published_time', item.get('published_time_str', ''))
            metadata_lines.append(f"- **发布时间**: {published_time}")
        if item.get('arxiv_announce_type'):
            metadata_lines.append(f"- **公告类型**: {item['arxiv_announce_type']}")
        metadata_lines.append(f"- **爬取时间**: {crawl_time.strftime('%Y-%m-%d %H:%M:%S')}")
        
        if metadata_lines:
            lines.extend(metadata_lines)
            lines.append("")
        
        # 标题
        lines.append(f"### {item.get('title', '')}")
        lines.append("")
        
        # 标题（中文）- 如果有翻译
        if item.get('title_zh'):
            lines.append(f"**中文标题**: {item['title_zh']}")
            lines.append("")

        # 作者
        if item.get('authors'):
            authors_str = ", ".join(item['authors'])
            lines.append(f"**作者**: {authors_str}")
            lines.append("")
        
        # 摘要
        if item.get('summary'):
            lines.append("### 摘要")
            summary = item['summary'].replace('\n', ' ')
            lines.append(summary)
            lines.append("")
        
        # 摘要（中文）- 如果有翻译
        if item.get('summary_zh'):
            lines.append("### 摘要（中文）")
            summary_zh = item['summary_zh'].replace('\n', ' ')
            lines.append(summary_zh)
            lines.append("")
        
        # LLM 摘要
        if item.get('llm_summary'):
            lines.append("### LLM 摘要")
            lines.append(item['llm_summary'])
            lines.append("")
        
        # 关键词
        if item.get('keywords'):
            lines.append("### 关键词")
            if isinstance(item['keywords'], list):
                keywords_str = ", ".join(item['keywords'])
            else:
                keywords_str = str(item['keywords'])
            lines.append(keywords_str)
            lines.append("")
        
        return lines

