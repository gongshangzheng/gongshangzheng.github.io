"""关键词分类器"""

import re
from typing import Set, Protocol
from collections import defaultdict


class ItemClassifier(Protocol):
    """分类器协议，定义了分类器的接口"""
    
    def classify_items(self, items: list[dict]) -> dict[str, list[dict]]:
        """
        批量分类条目
        
        Args:
            items: 条目列表
            
        Returns:
            按类别分组的字典，格式为 {类别名: [条目列表]}
        """
        ...


class KeywordClassifier:
    """关键词分类器，用于将关键词映射到类别"""
    
    def __init__(self, category_mapping: dict[str, list[str]]):
        """
        初始化关键词分类器
        
        Args:
            category_mapping: 类别映射字典，格式为 {类别名: [关键词列表]}
                            例如: {"agent": ["agent", "agents", "multi-agent"], 
                                  "扩散模型": ["diffusion", "diffusion model"]}
        """
        self.category_mapping = category_mapping
        # 构建反向映射：关键词 -> 类别
        self.keyword_to_category: dict[str, str] = {}
        # 构建正则表达式映射：用于模糊匹配
        self.category_patterns: dict[str, list[re.Pattern]] = defaultdict(list)
        
        for category, keywords in category_mapping.items():
            for keyword in keywords:
                keyword_lower = keyword.lower().strip()
                # 如果关键词已存在，使用第一个匹配的类别
                if keyword_lower not in self.keyword_to_category:
                    self.keyword_to_category[keyword_lower] = category
                
                # 创建正则表达式模式（支持单词边界匹配）
                pattern = re.compile(r'\b' + re.escape(keyword_lower) + r'\b', re.IGNORECASE)
                self.category_patterns[category].append(pattern)
    
    def classify_keyword(self, keyword: str) -> str | None:
        """
        分类单个关键词
        
        Args:
            keyword: 关键词
            
        Returns:
            类别名称，如果未匹配则返回 None
        """
        keyword_lower = keyword.lower().strip()
        
        # 精确匹配
        if keyword_lower in self.keyword_to_category:
            return self.keyword_to_category[keyword_lower]
        
        # 模糊匹配（检查是否包含某个关键词）
        for category, patterns in self.category_patterns.items():
            for pattern in patterns:
                if pattern.search(keyword_lower):
                    return category
        
        return None
    
    def classify_item(self, item: dict) -> list[str]:
        """
        分类一个条目，返回该条目所属的所有类别
        
        Args:
            item: 条目字典，需要包含 'keywords' 字段
            
        Returns:
            类别列表（可能有多个类别）
        """
        categories: Set[str] = set()
        
        # 从关键词中提取类别
        keywords = item.get('keywords', [])
        if isinstance(keywords, str):
            keywords = [keywords]
        elif not isinstance(keywords, list):
            keywords = []
        
        for keyword in keywords:
            category = self.classify_keyword(keyword)
            if category:
                categories.add(category)
        
        # 如果没有匹配到任何类别，返回 ["未分类"]
        if not categories:
            return ["未分类"]
        
        return sorted(list(categories))
    
    def classify_items(self, items: list[dict]) -> dict[str, list[dict]]:
        """
        批量分类条目
        
        Args:
            items: 条目列表
            
        Returns:
            按类别分组的字典，格式为 {类别名: [条目列表]}
        """
        categorized: dict[str, list[dict]] = defaultdict(list)
        
        for item in items:
            categories = self.classify_item(item)
            # 一个条目可能属于多个类别
            for category in categories:
                categorized[category].append(item)
        
        return dict(categorized)
    
    def get_all_categories(self) -> list[str]:
        """
        获取所有类别名称
        
        Returns:
            类别名称列表
        """
        return sorted(list(self.category_mapping.keys()))

