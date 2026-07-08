"""Org-mode 格式导出器基类"""

from pathlib import Path
from datetime import datetime
from abc import ABC, abstractmethod

from ..models.crawl_result import CrawlResult
from ..utils.keyword_classifier import ItemClassifier


class BaseOrgExporter(ABC):
    """Org-mode 格式导出器基类"""
    
    # 支持的格式类型
    FORMAT_DETAILED = "detailed"  # 详细格式（默认）
    FORMAT_COMPACT = "compact"    # 紧凑格式
    FORMAT_CARD = "card"          # 卡片格式
    FORMAT_MINIMAL = "minimal"    # 极简格式
    
    def __init__(self, 
                 format_type: str = FORMAT_DETAILED,
                 keyword_classifier: ItemClassifier | None = None,
                 category_folders: dict[str, str] | None = None,
                 title_template: str | None = None):
        """
        初始化导出器
        
        Args:
            format_type: 格式类型，可选值：detailed, compact, card, minimal
            keyword_classifier: 关键词分类器，如果提供则按类别分类存储
            category_folders: 类别文件夹映射，格式为 {类别名: 文件夹路径}
                             如果为None，则使用类别名作为文件夹名
            title_template: 标题模板，支持变量：{title}, {link}, {published_time}, 
                           {crawl_time}, {index}, {id} 等
        """
        self.format_type = format_type
        self.keyword_classifier = keyword_classifier
        self.category_folders = category_folders or {}
        self.title_template = title_template
    
    def _render_title(self, item: dict, index: int, crawl_time: datetime, output_path: Path | None = None) -> str:
        """
        渲染标题模板
        
        Args:
            item: 条目字典
            index: 条目索引
            crawl_time: 爬取时间
            output_path: 输出文件路径（可选）
            
        Returns:
            渲染后的标题字符串
        """
        if not self.title_template:
            # 如果没有模板，返回默认格式
            title = item.get('title', '无标题')
            published_time = item.get('published_time', '')
            return f"* 条目 {index}: {title} [{published_time}]"
        
        # 准备变量字典
        # 统一使用 id 字段，如果子类需要特殊ID字段，可以在自己的实现中处理
        # 为了向后兼容，尝试从多个可能的字段获取ID
        item_id = item.get('id', '') or item.get('arxiv_id', '') or item.get('zhiyuan_id', '')
        
        variables = {
            'title': item.get('title', '无标题'),
            'link': item.get('link', ''),
            'published_time': item.get('published_time', item.get('published_time_str', '')),
            'crawl_time': crawl_time.strftime('%Y-%m-%d %H:%M:%S'),
            'index': str(index),
            'id': item_id,
        }
        
        # 添加作者信息（如果有）
        authors = item.get('authors', [])
        # 确保 authors 是列表格式，并处理嵌套的逗号分隔字符串
        if not isinstance(authors, list):
            if isinstance(authors, str):
                # 如果是字符串，可能是逗号分隔的，需要分割
                if ',' in authors:
                    authors = [a.strip() for a in authors.split(',') if a.strip()]
                else:
                    authors = [authors] if authors.strip() else []
            else:
                authors = []
        else:
            # 如果已经是列表，检查列表中的元素是否包含逗号分隔的字符串
            expanded_authors = []
            for author in authors:
                if isinstance(author, str):
                    # 如果列表元素是字符串且包含逗号，需要分割
                    if ',' in author:
                        expanded_authors.extend([a.strip() for a in author.split(',') if a.strip()])
                    else:
                        if author.strip():
                            expanded_authors.append(author.strip())
                else:
                    # 如果不是字符串，转换为字符串
                    author_str = str(author).strip()
                    if author_str:
                        expanded_authors.append(author_str)
            authors = expanded_authors
        
        if authors and len(authors) > 0:
            variables['authors'] = ', '.join(authors)
            variables['first_author'] = authors[0].strip()  # 只取第一个作者，并去除空格
        else:
            variables['authors'] = ''
            variables['first_author'] = ''
        
        # 添加分类信息（如果有）
        categories = item.get('categories', [])
        if categories:
            variables['categories'] = ', '.join(categories)
        else:
            variables['categories'] = ''
        
        # 添加输出路径信息
        if output_path:
            variables['output_path'] = str(output_path)
            variables['output_file'] = output_path.name
            variables['output_dir'] = str(output_path.parent)
            # 相对路径（相对于当前工作目录）
            try:
                cwd = Path.cwd()
                rel_path = output_path.relative_to(cwd)
                variables['output_path_rel'] = './' + str(rel_path)
            except ValueError:
                variables['output_path_rel'] = str(output_path)
        else:
            variables['output_path'] = ''
            variables['output_file'] = ''
            variables['output_dir'] = ''
            variables['output_path_rel'] = ''
        
        # 渲染模板
        try:
            return self.title_template.format(**variables)
        except KeyError as _:
            # 如果模板中有未定义的变量，使用空字符串或变量名作为占位符
            # 使用 SafeFormatter 的方式：对于未定义的变量，返回空字符串
            import string
            formatter = string.Formatter()
            result = []
            for literal_text, field_name, format_spec, _ in formatter.parse(self.title_template):
                if literal_text:
                    result.append(literal_text)
                if field_name:
                    value = variables.get(field_name, '')
                    if format_spec:
                        result.append(format(value, format_spec))
                    else:
                        result.append(str(value))
            return ''.join(result)
    
    def export(self, result: CrawlResult, output_path: Path):
        """
        导出为 org-mode 格式
        
        Args:
            result: 爬取结果
            output_path: 输出文件路径（如果启用分类，这将是基础路径）
        """
        # 如果启用了分类，按类别分别导出
        if self.keyword_classifier and result.items_count > 0:
            categorized_items = self.keyword_classifier.classify_items(result.items)
            
            for category, items in categorized_items.items():
                # 获取该类别的文件夹路径
                category_folder = self.category_folders.get(category, category)
                
                # 构建该类别的输出路径
                category_path = output_path.parent / category_folder / output_path.name
                category_path.parent.mkdir(parents=True, exist_ok=True)
                
                # 创建该类别的结果对象
                category_result = CrawlResult(
                    site_name=result.site_name,
                    crawl_time=result.crawl_time,
                    items_count=len(items),
                    items=items,
                    success=result.success,
                    error_message=result.error_message
                )
                
                # 生成并保存该类别的org内容
                org_content = self._generate_org_content(category_result, category, category_path)
                
                # 直接覆盖文件（不再合并）
                category_path.write_text(org_content, encoding='utf-8')
        else:
            # 未启用分类，使用原有逻辑
            output_path.parent.mkdir(parents=True, exist_ok=True)
            
            org_content = self._generate_org_content(result, None, output_path)
            
            # 直接覆盖文件（不再合并）
            output_path.write_text(org_content, encoding='utf-8')
    
    def export_markdown(self, result: CrawlResult, output_path: Path):
        """
        导出为 Markdown 格式
        
        Args:
            result: 爬取结果
            output_path: 输出文件路径（如果启用分类，这将是基础路径）
        """
        # 如果启用了分类，按类别分别导出
        if self.keyword_classifier and result.items_count > 0:
            categorized_items = self.keyword_classifier.classify_items(result.items)
            
            for category, items in categorized_items.items():
                # 获取该类别的文件夹路径
                category_folder = self.category_folders.get(category, category)
                
                # 构建该类别的输出路径
                category_path = output_path.parent / category_folder / output_path.name
                category_path.parent.mkdir(parents=True, exist_ok=True)
                
                # 创建该类别的结果对象
                category_result = CrawlResult(
                    site_name=result.site_name,
                    crawl_time=result.crawl_time,
                    items_count=len(items),
                    items=items,
                    success=result.success,
                    error_message=result.error_message
                )
                
                # 生成并保存该类别的 Markdown 内容
                md_content = self._generate_markdown_content(category_result, category, category_path)
                
                # 直接覆盖文件
                category_path.write_text(md_content, encoding='utf-8')
        else:
            # 未启用分类，使用原有逻辑
            output_path.parent.mkdir(parents=True, exist_ok=True)
            
            md_content = self._generate_markdown_content(result, None, output_path)
            
            # 直接覆盖文件
            output_path.write_text(md_content, encoding='utf-8')
    
    def _generate_org_content(self, result: CrawlResult, category: str | None = None, output_path: Path | None = None) -> str:
        """
        生成 org-mode 内容
        
        Args:
            result: 爬取结果
            category: 类别名称（如果按类别分类）
            
        Returns:
            org-mode 格式的字符串
        """
        lines = []
        
        # 文件头
        date_str = result.crawl_time.strftime('%Y-%m-%d')
        title = f"{result.site_name.upper()} 爬取结果"
        if category:
            title += f" - {category}"
        title += f" - {date_str}"
        lines.append(f"#+TITLE: {title}")
        lines.append(f"#+DATE: {date_str}")
        lines.append(f"#+AUTHOR: Org Crawler")
        if category:
            lines.append(f"#+CATEGORY: {category}")
        lines.append(f"#+CREATED: {result.crawl_time.strftime('%Y-%m-%d %H:%M:%S')}")
        lines.append(f"#+startup: overview")
        lines.append("")
        
        # 如果没有条目，添加说明
        if result.items_count == 0:
            lines.append(f"* 本次爬取无新条目")
            lines.append(f"")
            lines.append(f"爬取时间: {result.crawl_time.strftime('%Y-%m-%d %H:%M:%S')}")
            if result.error_message:
                lines.append(f"错误信息: {result.error_message}")
            return "\n".join(lines)
        
        # 添加条目
        for idx, item in enumerate(result.items, 1):
            lines.extend(self._format_item(item, idx, result.crawl_time, output_path))
            lines.append("")  # 条目之间的空行
        
        return "\n".join(lines)
    
    def _generate_markdown_content(self, result: CrawlResult, category: str | None = None, output_path: Path | None = None) -> str:
        """
        生成 Markdown 内容（Hugo 兼容 front matter）
        
        Args:
            result: 爬取结果
            category: 类别名称（如果按类别分类）
            
        Returns:
            Markdown 格式的字符串
        """
        lines = []
        
        # Hugo 兼容的 YAML Front Matter
        date_str = result.crawl_time.strftime('%Y-%m-%d')
        
        # 生成分类显示名
        category_display = ""
        if category:
            category_map = {
                "diffusion": "Diffusion",
                "autoregressive": "Autoregressive",
                "image_compression": "Image Compression",
            }
            category_display = category_map.get(category, category.title())
        
        title = f"每日论文 · {category_display} — {date_str}" if category_display else f"每日论文 — {date_str}"
        
        # tags 列表
        tags = ["arxiv"]
        if category:
            tags.insert(0, category)
        tags_str = ", ".join(f'"{t}"' for t in tags)
        
        lines.append("---")
        lines.append(f'title: "{title}"')
        lines.append(f"date: {date_str}")
        lines.append(f'categories: ["每日论文"]')
        lines.append(f"tags: [{tags_str}]")
        lines.append("draft: false")
        lines.append(f'author: ["Org Crawler"]')
        lines.append("mathjax: true")
        lines.append("toc: true")
        lines.append("---")
        lines.append("")
        
        # 如果没有条目，添加说明
        if result.items_count == 0:
            lines.append(f"## 本次爬取无新条目")
            lines.append("")
            lines.append(f"**爬取时间**: {result.crawl_time.strftime('%Y-%m-%d %H:%M:%S')}")
            if result.error_message:
                lines.append(f"**错误信息**: {result.error_message}")
            return "\n".join(lines)
        
        # 添加条目
        for idx, item in enumerate(result.items, 1):
            lines.extend(self._format_item_markdown(item, idx, result.crawl_time, output_path))
            lines.append("")  # 条目之间的空行
        
        return "\n".join(lines)
    
    def _format_item(self, item: dict, index: int, crawl_time: datetime, output_path: Path | None = None) -> list[str]:
        """
        格式化单个条目（子类可以重写）
        
        Args:
            item: 条目字典
            index: 条目索引
            crawl_time: 爬取时间
            output_path: 输出文件路径（可选）
            
        Returns:
            格式化的行列表
        """
        # 根据格式类型选择格式化方法
        if self.format_type == self.FORMAT_COMPACT:
            return self._format_item_compact(item, index, crawl_time, output_path)
        elif self.format_type == self.FORMAT_CARD:
            return self._format_item_card(item, index, crawl_time, output_path)
        elif self.format_type == self.FORMAT_MINIMAL:
            return self._format_item_minimal(item, index, crawl_time, output_path)
        else:  # FORMAT_DETAILED (默认)
            return self._format_item_detailed(item, index, crawl_time, output_path)
    
    @abstractmethod
    def _format_item_detailed(self, item: dict, index: int, crawl_time: datetime, output_path: Path | None = None) -> list[str]:
        """详细格式：包含所有信息（子类必须实现）"""
        pass
    
    def _format_item_markdown(self, item: dict, index: int, crawl_time: datetime, output_path: Path | None = None) -> list[str]:
        """
        格式化单个条目为 Markdown 格式（子类可以重写）
        
        Args:
            item: 条目字典
            index: 条目索引
            crawl_time: 爬取时间
            output_path: 输出文件路径（可选）
            
        Returns:
            格式化的行列表（Markdown 格式）
        """
        # 根据格式类型选择格式化方法
        if self.format_type == self.FORMAT_COMPACT:
            return self._format_item_markdown_compact(item, index, crawl_time, output_path)
        elif self.format_type == self.FORMAT_CARD:
            return self._format_item_markdown_card(item, index, crawl_time, output_path)
        elif self.format_type == self.FORMAT_MINIMAL:
            return self._format_item_markdown_minimal(item, index, crawl_time, output_path)
        else:  # FORMAT_DETAILED (默认)
            return self._format_item_markdown_detailed(item, index, crawl_time, output_path)
    
    @abstractmethod
    def _format_item_markdown_detailed(self, item: dict, index: int, crawl_time: datetime, output_path: Path | None = None) -> list[str]:
        """Markdown 详细格式：包含所有信息（子类必须实现）"""
        pass
    
    def _format_item_markdown_compact(self, item: dict, index: int, crawl_time: datetime, output_path: Path | None = None) -> list[str]:
        """Markdown 紧凑格式：只包含关键信息"""
        lines = []
        
        # 使用标题模板（转换为 Markdown 格式）
        title = self._render_title_markdown(item, index, crawl_time, output_path)
        lines.append(title)
        lines.append("")
        
        # 元数据（简化版）
        if item.get('authors'):
            authors_str = ", ".join(item['authors'][:3])
            if len(item['authors']) > 3:
                authors_str += " et al."
            lines.append(f"**作者**: {authors_str}")
            lines.append("")
        
        # 摘要（截断到200字符）
        if item.get('summary'):
            summary = item['summary'].replace('\n', ' ').strip()
            if len(summary) > 200:
                summary = summary[:200] + "..."
            lines.append(summary)
            lines.append("")
        
        return lines
    
    def _format_item_markdown_card(self, item: dict, index: int, crawl_time: datetime, output_path: Path | None = None) -> list[str]:
        """Markdown 卡片格式：类似卡片布局"""
        lines = []
        
        # 使用标题模板
        title = self._render_title_markdown(item, index, crawl_time, output_path)
        lines.append(title)
        lines.append("")
        
        # 卡片信息（使用列表格式）
        if item.get('published_time', item.get('published_time_str')):
            published_time = item.get('published_time', item.get('published_time_str', ''))
            lines.append(f"- **发布时间**: {published_time}")
        if item.get('authors'):
            authors_str = ", ".join(item['authors'][:5])
            if len(item['authors']) > 5:
                authors_str += f" 等{len(item['authors'])}人"
            lines.append(f"- **作者**: {authors_str}")
        link = item.get('link', '')
        if link:
            lines.append(f"- **链接**: [{link}]({link})")
        item_id = item.get('id', '') or item.get('arxiv_id', '') or item.get('zhiyuan_id', '')
        if item_id:
            lines.append(f"- **ID**: {item_id}")
        if item.get('categories'):
            categories_str = ", ".join(item['categories'])
            lines.append(f"- **分类**: {categories_str}")
        
        lines.append("")
        
        # 摘要
        if item.get('summary'):
            lines.append("### 摘要")
            summary = item['summary'].replace('\n', ' ')
            lines.append(summary)
            lines.append("")
        
        return lines
    
    def _format_item_markdown_minimal(self, item: dict, index: int, crawl_time: datetime, output_path: Path | None = None) -> list[str]:
        """Markdown 极简格式：最少信息"""
        lines = []
        
        # 使用标题模板
        title = self._render_title_markdown(item, index, crawl_time, output_path)
        lines.append(title)
        lines.append("")
        
        return lines
    
    def _render_title_markdown(self, item: dict, index: int, crawl_time: datetime, output_path: Path | None = None) -> str:
        """
        渲染标题模板（Markdown 格式）
        
        Args:
            item: 条目字典
            index: 条目索引
            crawl_time: 爬取时间
            output_path: 输出文件路径（可选）
            
        Returns:
            渲染后的标题字符串（Markdown 格式）
        """
        if not self.title_template:
            # 如果没有模板，返回默认格式
            title = item.get('title', '无标题')
            published_time = item.get('published_time', item.get('published_time_str', ''))
            return f"## {index}. {title} [{published_time}]"
        
        # 准备变量字典（与 _render_title 相同的逻辑）
        item_id = item.get('id', '') or item.get('arxiv_id', '') or item.get('zhiyuan_id', '')
        
        variables = {
            'title': item.get('title', '无标题'),
            'link': item.get('link', ''),
            'published_time': item.get('published_time', item.get('published_time_str', '')),
            'crawl_time': crawl_time.strftime('%Y-%m-%d %H:%M:%S'),
            'index': str(index),
            'id': item_id,
        }
        
        # 添加作者信息
        authors = item.get('authors', [])
        if not isinstance(authors, list):
            if isinstance(authors, str):
                if ',' in authors:
                    authors = [a.strip() for a in authors.split(',') if a.strip()]
                else:
                    authors = [authors] if authors.strip() else []
            else:
                authors = []
        else:
            expanded_authors = []
            for author in authors:
                if isinstance(author, str):
                    if ',' in author:
                        expanded_authors.extend([a.strip() for a in author.split(',') if a.strip()])
                    else:
                        if author.strip():
                            expanded_authors.append(author.strip())
                else:
                    author_str = str(author).strip()
                    if author_str:
                        expanded_authors.append(author_str)
            authors = expanded_authors
        
        if authors and len(authors) > 0:
            variables['authors'] = ', '.join(authors)
            variables['first_author'] = authors[0].strip()
        else:
            variables['authors'] = ''
            variables['first_author'] = ''
        
        # 添加分类信息
        categories = item.get('categories', [])
        if categories:
            variables['categories'] = ', '.join(categories)
        else:
            variables['categories'] = ''
        
        # 添加输出路径信息
        if output_path:
            variables['output_path'] = str(output_path)
            variables['output_file'] = output_path.name
            variables['output_dir'] = str(output_path.parent)
            try:
                cwd = Path.cwd()
                rel_path = output_path.relative_to(cwd)
                variables['output_path_rel'] = './' + str(rel_path)
            except ValueError:
                variables['output_path_rel'] = str(output_path)
        else:
            variables['output_path'] = ''
            variables['output_file'] = ''
            variables['output_dir'] = ''
            variables['output_path_rel'] = ''
        
        # 渲染模板（将 Org-mode 格式转换为 Markdown）
        try:
            template = self.title_template
            # 将 Org-mode 链接格式转换为 Markdown
            # [[{link}][{title}]] -> [{title}]({link})
            template = template.replace('[[{link}][', '[').replace(']]', ']({link})')
            # 处理其他可能的格式
            result = template.format(**variables)
            # 确保是 Markdown 标题格式
            if not result.startswith('#'):
                result = f"## {result}"
            return result
        except KeyError:
            import string
            formatter = string.Formatter()
            result = []
            template = self.title_template.replace('[[{link}][', '[').replace(']]', ']({link})')
            for literal_text, field_name, format_spec, _ in formatter.parse(template):
                if literal_text:
                    result.append(literal_text)
                if field_name:
                    value = variables.get(field_name, '')
                    if format_spec:
                        result.append(format(value, format_spec))
                    else:
                        result.append(str(value))
            formatted = ''.join(result)
            if not formatted.startswith('#'):
                formatted = f"## {formatted}"
            return formatted
    
    def _format_item_compact(self, item: dict, index: int, crawl_time: datetime, output_path: Path | None = None) -> list[str]:
        """紧凑格式：只包含关键信息"""
        lines = []
        
        # 使用标题模板
        lines.append(self._render_title(item, index, crawl_time, output_path))
        
        # Properties（简化版）
        lines.append(":PROPERTIES:")
        # 统一使用 id 字段
        item_id = item.get('id', '') or item.get('arxiv_id', '') or item.get('zhiyuan_id', '')
        if item_id:
            lines.append(f":ID: {item_id}")
        lines.append(":END:")
        lines.append("")
        
        # 作者（如果有）
        if item.get('authors'):
            authors_str = ", ".join(item['authors'][:3])  # 只显示前3个作者
            if len(item['authors']) > 3:
                authors_str += " et al."
            lines.append(f"作者: {authors_str}")
            lines.append("")
        
        # 摘要（截断到200字符）
        if item.get('summary'):
            summary = item['summary'].replace('\n', ' ').strip()
            if len(summary) > 200:
                summary = summary[:200] + "..."
            lines.append(summary)
            lines.append("")
        
        return lines
    
    def _format_item_card(self, item: dict, index: int, crawl_time: datetime, output_path: Path | None = None) -> list[str]:
        """卡片格式：类似卡片布局"""
        lines = []
        
        # 使用标题模板
        lines.append(self._render_title(item, index, crawl_time, output_path))
        lines.append("")
        
        # 卡片信息（使用表格格式）
        lines.append("| 属性 | 值 |")
        lines.append("|------+----|")
        
        published_time = item.get('published_time', item.get('published_time_str', ''))
        if published_time:
            lines.append(f"| 发布时间 | {published_time} |")
        if item.get('authors'):
            authors_str = ", ".join(item['authors'][:5])
            if len(item['authors']) > 5:
                authors_str += f" 等{len(item['authors'])}人"
            lines.append(f"| 作者 | {authors_str} |")
        link = item.get('link', '')
        if link:
            lines.append(f"| 链接 | [[{link}][查看]] |")
        # 统一使用 id 字段
        item_id = item.get('id', '') or item.get('arxiv_id', '') or item.get('zhiyuan_id', '')
        if item_id:
            lines.append(f"| ID | {item_id} |")
        if item.get('categories'):
            categories_str = ", ".join(item['categories'])
            lines.append(f"| 分类 | {categories_str} |")
        
        lines.append("")
        
        # 摘要
        if item.get('summary'):
            lines.append("** 摘要")
            summary = item['summary'].replace('\n', ' ')
            lines.append(summary)
            lines.append("")
        
        return lines
    
    def _format_item_minimal(self, item: dict, index: int, crawl_time: datetime, output_path: Path | None = None) -> list[str]:
        """极简格式：最少信息"""
        lines = []
        
        # 使用标题模板
        lines.append(self._render_title(item, index, crawl_time, output_path))
        lines.append("")
        
        return lines
    
    def _merge_org_content(self, existing: str, new: str, result: CrawlResult) -> str:
        """
        合并现有的和新的 org 内容
        
        Args:
            existing: 现有内容
            new: 新内容
            result: 爬取结果
            
        Returns:
            合并后的内容
        """
        # 简单实现：如果新内容有条目，则追加到现有内容
        if result.items_count > 0:
            # 提取新内容的条目部分（跳过文件头）
            new_lines = new.split('\n')
            # 找到第一个 "* 条目" 的位置
            start_idx = 0
            for i, line in enumerate(new_lines):
                if line.startswith('* 条目'):
                    start_idx = i
                    break
            
            if start_idx > 0:
                # 追加新条目到现有内容
                existing_lines = existing.split('\n')
                # 移除现有内容的最后一个空行（如果有）
                while existing_lines and not existing_lines[-1].strip():
                    existing_lines.pop()
                
                # 添加分隔和说明
                existing_lines.append("")
                existing_lines.append(f"* 更新于 {result.crawl_time.strftime('%Y-%m-%d %H:%M:%S')}")
                existing_lines.append("")
                
                # 添加新条目
                existing_lines.extend(new_lines[start_idx:])
                return "\n".join(existing_lines)
        
        return existing

