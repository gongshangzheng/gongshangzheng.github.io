"""索引文件管理器"""

from pathlib import Path
from datetime import datetime


class IndexManager:
    """索引文件管理器，用于管理 index.org 文件"""
    
    def __init__(self, 
                 index_path: Path,
                 table_headers: list[str] | None = None,
                 cell_templates: dict[str, str] | None = None,
                 header_labels: dict[str, str] | None = None):
        """
        初始化索引管理器
        
        Args:
            index_path: 索引文件路径
            table_headers: 表头列表，使用变量格式，例如 ["{title}", "{first_author}", "{link}"]
            cell_templates: 单元格模板字典，key为变量名（不含{}），例如 {"title": "{title}", "first_author": "{first_author}", "link": "[[{link}][查看]]"}
            header_labels: 表头标签映射，key为变量名（不含{}），value为显示的中文名称，例如 {"title": "标题", "first_author": "第一作者"}
        """
        self.index_path = index_path
        # 确保父目录存在
        self.index_path.parent.mkdir(parents=True, exist_ok=True)
        
        # 默认表头：使用变量格式
        self.table_headers = table_headers or ["{title}", "{first_author}", "{link}"]
        
        # 默认单元格模板（key为变量名，不含{}）
        default_templates = {
            "title": "{title}",
            "first_author": "{first_author}",
            "link": "[[{link}][查看]]",
            "authors": "{authors}",
            "published_time": "{published_time}",
            "arxiv_id": "{arxiv_id}",
            "categories": "{categories}",
            "output_path": "{output_path}",
            "output_file": "{output_file}",
            "output_dir": "{output_dir}",
            "output_path_rel": "[[{output_path_rel}][{output_file}]]",
        }
        if cell_templates:
            default_templates.update(cell_templates)
        self.cell_templates = default_templates
        
        # 默认表头标签映射（变量名 -> 中文显示名称）
        default_labels = {
            "title": "标题",
            "first_author": "第一作者",
            "link": "链接",
            "authors": "作者",
            "published_time": "发布时间",
            "arxiv_id": "ArXiv ID",
            "categories": "分类",
            "output_path": "输出路径",
            "output_file": "输出文件",
            "output_dir": "输出目录",
            "output_path_rel": "相对路径",
        }
        if header_labels:
            default_labels.update(header_labels)
        self.header_labels = default_labels
    
    def update_index(self, 
                    site_name: str,
                    crawl_time: datetime,
                    items: list[dict],
                    date_file_path: Path | None = None,
                    categorized_items: dict[str, list[dict]] | None = None,
                    category_folders: dict[str, str] | None = None):
        """
        更新索引文件，在文件最前面添加新的更新记录
        
        Args:
            site_name: 网站名称
            crawl_time: 爬取时间
            items: 条目列表（如果提供了categorized_items则忽略此参数）
            date_file_path: 日期文件路径（用于创建链接），如果为None则不创建链接
            categorized_items: 按类别分组的条目字典，格式为 {类别名: [条目列表]}
            category_folders: 类别文件夹映射，格式为 {类别名: 文件夹路径}
        """
        # 生成新的更新记录
        new_section = self._generate_update_section(
            site_name, crawl_time, items, date_file_path, categorized_items, category_folders
        )
        
        # 读取现有内容
        existing_content = ""
        if self.index_path.exists():
            existing_content = self.index_path.read_text(encoding='utf-8')
        
        # 如果文件为空，添加文件头
        if not existing_content.strip():
            header = self._generate_header(site_name)
            new_content = header + "\n\n" + new_section
            if existing_content.strip():
                new_content += "\n\n" + existing_content
        else:
            # 在文件最前面添加新内容
            new_content = new_section + "\n\n" + existing_content
        
        # 写入文件
        self.index_path.write_text(new_content, encoding='utf-8')
    
    def _generate_header(self, site_name: str) -> str:
        """
        生成索引文件头
        
        Args:
            site_name: 网站名称
            
        Returns:
            文件头内容
        """
        lines = [
            f"#+TITLE: {site_name.upper()} 论文索引",
            f"#+AUTHOR: Org Crawler",
            f"#+CREATED: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            "",
            f"* {site_name.upper()} 论文索引",
            "",
            "本文档包含所有爬取的论文索引信息。",
            ""
        ]
        return "\n".join(lines)
    
    def _generate_update_section(self,
                                 site_name: str,
                                 crawl_time: datetime,
                                 items: list[dict],
                                 date_file_path: Path | None = None,
                                 categorized_items: dict[str, list[dict]] | None = None,
                                 category_folders: dict[str, str] | None = None) -> str:
        """
        生成更新记录部分
        
        Args:
            site_name: 网站名称
            crawl_time: 爬取时间
            items: 条目列表（如果提供了categorized_items则忽略）
            date_file_path: 日期文件路径（用于创建链接）
            categorized_items: 按类别分组的条目字典
            category_folders: 类别文件夹映射
            
        Returns:
            更新记录内容
        """
        lines = []
        
        # 一级标题
        date_str = crawl_time.strftime('%Y-%m-%d')
        time_str = crawl_time.strftime('%Y-%m-%d %H:%M:%S')
        lines.append(f"* 更新于 {time_str}")
        lines.append("")
        
        # 如果有日期文件路径，添加链接
        if date_file_path and date_file_path.exists():
            # 计算相对路径
            try:
                rel_path = date_file_path.relative_to(self.index_path.parent)
                lines.append(f"详细内容: [[{rel_path}][{date_str}.org]]")
                lines.append("")
            except ValueError:
                # 如果无法计算相对路径，使用绝对路径
                lines.append(f"详细内容: [[{date_file_path}][{date_str}.org]]")
                lines.append("")
        
        # 如果提供了分类信息，按类别分组显示
        if categorized_items:
            for category, category_items in categorized_items.items():
                # 二级标题：类别名
                lines.append(f"** {category}")
                lines.append("")
                
                # 计算该类别的输出路径（如果有date_file_path）
                category_output_path = None
                if date_file_path:
                    # 使用 category_folders 获取正确的文件夹名，如果没有则使用类别名
                    category_folder = category_folders.get(category, category) if category_folders else category
                    category_output_path = date_file_path.parent / category_folder / date_file_path.name
                
                # 生成该类别的表格
                lines.append(self._generate_table(category_items, category_output_path))
                lines.append("")
        else:
            # 没有分类，直接生成表格
            lines.append(self._generate_table(items, date_file_path))
            lines.append("")
        
        return "\n".join(lines)
    
    def _generate_table(self, items: list[dict], output_path: Path | None = None) -> str:
        """
        生成表格内容
        
        Args:
            items: 条目列表
            output_path: 输出文件路径（可选）
            
        Returns:
            表格内容字符串
        """
        lines = []
        
        # 生成表头（将变量格式转换为中文显示）
        header_labels = []
        for header in self.table_headers:
            if header.startswith('{') and header.endswith('}'):
                var_name = header[1:-1]  # 去除 { 和 }
                # 获取中文标签，如果没有则使用变量名
                label = self.header_labels.get(var_name, var_name)
                header_labels.append(label)
            else:
                # 向后兼容：如果不是变量格式，直接使用
                header_labels.append(header)
        
        header_row = "| " + " | ".join(header_labels) + " |"
        # 生成分隔符行
        separator_parts = ["------" for _ in header_labels]
        separator_row = "|" + "|".join(separator_parts) + "|"
        lines.append(header_row)
        lines.append(separator_row)
        
        # 添加每个条目
        for item in items:
            row_cells = []
            for header in self.table_headers:
                # 表头是变量格式，例如 "{title}" 或 "{first_author}"
                # 提取变量名（去除 {}）
                if header.startswith('{') and header.endswith('}'):
                    var_name = header[1:-1]  # 去除 { 和 }
                    # 获取该变量对应的模板，如果没有则使用变量本身作为模板
                    template = self.cell_templates.get(var_name, header)
                else:
                    # 向后兼容：如果不是变量格式，直接使用表头作为key查找模板
                    template = self.cell_templates.get(header, "{title}")
                
                # 渲染单元格内容
                cell_content = self._render_cell(template, item, output_path)
                # 转义表格中的特殊字符
                cell_content = cell_content.replace('|', '\\|')
                row_cells.append(cell_content)
            
            row = "| " + " | ".join(row_cells) + " |"
            lines.append(row)
        
        return "\n".join(lines)
    
    def _render_cell(self, template: str, item: dict, output_path: Path | None = None) -> str:
        """
        渲染单元格内容
        
        Args:
            template: 模板字符串
            item: 条目字典
            output_path: 输出文件路径（可选）
            
        Returns:
            渲染后的内容
        """
        # 准备变量字典
        variables = {
            'title': item.get('title', '无标题'),
            'link': item.get('link', ''),
            'published_time': item.get('published_time', item.get('published_time_str', '')),
            'arxiv_id': item.get('arxiv_id', ''),
            'id': item.get('id', ''),
        }
        
        # 添加作者信息
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
            variables['first_author'] = '-'
        
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
            # 相对路径（相对于索引文件所在目录）
            try:
                rel_path = output_path.relative_to(self.index_path.parent)
                variables['output_path_rel'] = './' + str(rel_path)
            except ValueError:
                # 如果无法计算相对路径，使用绝对路径
                variables['output_path_rel'] = str(output_path)
        else:
            variables['output_path'] = ''
            variables['output_file'] = ''
            variables['output_dir'] = ''
            variables['output_path_rel'] = ''
        
        # 渲染模板
        try:
            return template.format(**variables)
        except KeyError:
            # 如果模板中有未定义的变量，使用空字符串
            import string
            formatter = string.Formatter()
            result = []
            for literal_text, field_name, format_spec, conversion in formatter.parse(template):
                if literal_text:
                    result.append(literal_text)
                if field_name:
                    value = variables.get(field_name, '')
                    if format_spec:
                        result.append(format(value, format_spec))
                    else:
                        result.append(str(value))
            return ''.join(result)
    
    def get_all_items(self) -> list[dict]:
        """
        从索引文件中提取所有条目（用于去重等操作）
        
        Returns:
            条目列表
        """
        if not self.index_path.exists():
            return []
        
        # 这里可以实现解析逻辑，如果需要的话
        # 目前返回空列表，因为主要功能是写入
        return []

