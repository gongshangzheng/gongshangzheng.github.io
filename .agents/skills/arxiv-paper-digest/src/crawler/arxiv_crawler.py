"""ArXiv RSS 爬虫实现"""

import re

from .rss_crawler import BaseRSSCrawler
from ..models.site_config import SiteConfig


class ArXivRSSCrawler(BaseRSSCrawler):
    """ArXiv RSS 爬虫，专门处理 ArXiv 的特殊格式"""
    
    def __init__(self, site_config: SiteConfig, translator=None):
        """
        初始化 ArXiv RSS 爬虫
        
        Args:
            site_config: 网站配置
            translator: 翻译器实例（可选）
        """
        super().__init__(site_config, translator=translator)
    
    # 注意：crawl() 方法继承自 BaseRSSCrawler，不需要重写
    # BaseRSSCrawler.crawl() 已经实现了完整的 RSS 爬取流程：
    # 1. 解析 RSS feed
    # 2. 时间过滤
    # 3. 调用 parse_entry() 解析每个条目（会调用本类的 extract_* 方法）
    # 4. 关键词过滤
    # 5. 返回结果
    
    def extract_other_info(self, entry: dict) -> dict:
        """
        提取其他信息（ArXiv 特定）
        
        Args:
            entry: RSS 条目
            
        Returns:
            其他信息的字典
        """
        # 调用父类方法获取基础信息
        other_info = super().extract_other_info(entry)
        
        # ArXiv 特定的解析
        # 提取摘要（处理 ArXiv 的特殊格式）
        other_info['summary'] = self._extract_summary(entry)
        
        # 提取作者信息（ArXiv 使用 dc:creator）
        other_info['authors'] = self._extract_authors(entry)
        
        # 提取分类/标签（ArXiv 使用 category 标签）
        other_info['categories'] = self._extract_categories(entry)
        
        # 提取 ArXiv ID
        link = self.extract_link(entry)
        other_info['arxiv_id'] = self._extract_arxiv_id(entry, link)
        
        # 提取 ArXiv 公告类型
        other_info['arxiv_announce_type'] = self._extract_announce_type(entry)
        
        return other_info
    
    def _extract_summary(self, entry: dict) -> str:
        """
        提取摘要，处理 ArXiv 的特殊格式
        
        ArXiv 的 description 格式：
        "arXiv:2511.09563v1 Announce Type: new \n\nAbstract: ..."
        
        Args:
            entry: RSS 条目
            
        Returns:
            清理后的摘要文本
        """
        # 优先使用 summary 字段
        description = entry.get('summary', '')
        if not description:
            description = entry.get('description', '')
        
        if not description:
            return ''
        
        # 处理 ArXiv 格式：提取 "Abstract:" 之后的内容
        if 'Abstract:' in description:
            # 找到 "Abstract:" 的位置
            abstract_start = description.find('Abstract:')
            if abstract_start != -1:
                # 提取 "Abstract:" 之后的内容
                abstract = description[abstract_start + len('Abstract:'):].strip()
                return abstract
        
        # 如果不是 ArXiv 格式，直接返回
        return description.strip()
    
    def _extract_authors(self, entry: dict) -> list[str]:
        """
        提取作者信息（ArXiv 特定）
        
        ArXiv 使用 dc:creator 标签，feedparser 会解析为：
        - entry.dc_creator (单个字符串)
        - entry.dc_creators (列表)
        
        Args:
            entry: RSS 条目
            
        Returns:
            作者列表
        """
        authors = []
        # 方法1: 检查 dc_creators（列表）
        if isinstance(entry, dict) and 'dc_creators' in entry and entry['dc_creators']:
            authors = entry['dc_creators']
        # 方法2: 检查 dc_creator（单个字符串或列表）
        elif isinstance(entry, dict) and 'dc_creator' in entry and entry['dc_creator']:
            # dc_creator 可能是字符串或列表
            if isinstance(entry['dc_creator'], list):
                authors = entry['dc_creator']
            else:
                authors = [entry['dc_creator']]
        # 方法3: 尝试从字典中获取
        elif isinstance(entry, dict):
            if 'dc_creators' in entry:
                authors = entry['dc_creators']
            elif 'dc_creator' in entry:
                creator = entry['dc_creator']
                authors = [creator] if isinstance(creator, str) else creator
        # 方法4: 回退到父类方法
        if not authors:
            authors = self._extract_authors_generic(entry)
        
        # 清理作者名称（去除多余空格）
        cleaned_authors = [author.strip() for author in authors if author and author.strip()]
        return cleaned_authors
    
    def _extract_categories(self, entry: dict) -> list[str]:
        """
        提取分类/标签（ArXiv 特定）
        
        ArXiv 使用多个 <category> 标签
        
        Args:
            entry: RSS 条目
            
        Returns:
            分类列表
        """
        categories = []
        
        # 方法1: 检查 tags 字段（feedparser 标准格式）
        if isinstance(entry, dict) and 'tags' in entry and entry['tags']:
            categories = [tag.get('term', '') if isinstance(tag, dict) else str(tag)
                         for tag in entry['tags']]
        # 方法2: 检查 category 字段
        elif isinstance(entry, dict) and 'category' in entry and entry['category']:
            if isinstance(entry['category'], list):
                categories = [str(cat) for cat in entry['category']]
            else:
                categories = [str(entry['category'])]
        # 方法3: 从字典中获取
        elif isinstance(entry, dict):
            if 'tags' in entry:
                tags = entry['tags']
                categories = [tag.get('term', '') if isinstance(tag, dict) else str(tag)
                           for tag in tags]
            elif 'category' in entry:
                cat = entry['category']
                categories = [cat] if isinstance(cat, str) else [str(c) for c in cat]
        
        # 如果还是没有，使用父类方法
        if not categories:
            categories = self._extract_categories_generic(entry)
        
        # 清理分类名称
        cleaned_categories = [cat.strip() for cat in categories if cat and cat.strip()]
        return cleaned_categories
    
    def _extract_arxiv_id(self, entry: dict | object, link: str) -> str:
        """
        提取 ArXiv ID
        
        可以从以下位置提取：
        1. guid: "oai:arXiv.org:2511.09563v1" -> "2511.09563"
        2. link: "https://arxiv.org/abs/2511.09563" -> "2511.09563"
        3. description: "arXiv:2511.09563v1" -> "2511.09563"
        
        Args:
            entry: RSS 条目
            link: 论文链接
            
        Returns:
            ArXiv ID（不含版本号）
        """
        arxiv_id = ''
        
        # 方法1: 从 guid 中提取（格式：oai:arXiv.org:2511.09563v1）
        # feedparser 会将 guid 解析为 entry.id
        guid = ''
        if isinstance(entry, dict):
            # 如果是字典，使用字典访问方式
            guid = entry.get('id', '') or entry.get('guid', '')
        elif hasattr(entry, 'id'):
            # feedparser 对象有 id 属性，使用 getattr 避免类型检查错误
            entry_id = getattr(entry, 'id', None)
            if entry_id:
                guid = entry_id if isinstance(entry_id, str) else str(entry_id)
        elif hasattr(entry, 'guid'):
            entry_guid = getattr(entry, 'guid', None)
            if entry_guid:
                guid = entry_guid if isinstance(entry_guid, str) else getattr(entry_guid, 'value', '')
        
        if guid and 'arXiv.org:' in guid:
            # 提取 "arXiv.org:" 之后的部分
            parts = guid.split('arXiv.org:')
            if len(parts) > 1:
                arxiv_id_with_version = parts[1]
                # 移除版本号（如 v1, v2）
                arxiv_id = arxiv_id_with_version.split('v')[0]
        
        # 方法2: 从链接中提取（格式：https://arxiv.org/abs/2511.09563）
        if not arxiv_id and 'arxiv.org' in link:
            parts = link.split('/')
            if 'abs' in parts:
                idx = parts.index('abs')
                if idx + 1 < len(parts):
                    arxiv_id = parts[idx + 1]
        
        # 方法3: 从 description/summary 中提取（格式：arXiv:2511.09563v1）
        if not arxiv_id:
            # 安全地获取 description/summary，处理 dict 和 object 类型
            if isinstance(entry, dict):
                description = entry.get('summary', '') or entry.get('description', '')
            else:
                description = getattr(entry, 'summary', '') or getattr(entry, 'description', '')
            if 'arXiv:' in description:
                # 使用正则表达式提取
                match = re.search(r'arXiv:(\d{4}\.\d{4,5})', description)
                if match:
                    arxiv_id = match.group(1)
        
        return arxiv_id
    
    def _extract_announce_type(self, entry: dict | object) -> str:
        """
        提取 ArXiv 公告类型
        
        Args:
            entry: RSS 条目
            
        Returns:
            公告类型（如 "new"）
        """
        if isinstance(entry, dict):
            return entry.get('arxiv_announce_type', '')
        elif hasattr(entry, 'arxiv_announce_type'):
            # 使用 getattr 避免类型检查错误
            result = getattr(entry, 'arxiv_announce_type', '')
            return result if isinstance(result, str) else str(result) if result else ''
        else:
            return ''
