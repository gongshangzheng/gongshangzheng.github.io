"""文件管理器"""

import os
import json
from pathlib import Path
from datetime import datetime

from ..models.crawl_result import CrawlResult


class FileManager:
    """文件存储管理器"""
    
    def __init__(self, base_path: str = "data", date_format: str = "%Y-%m-%d"):
        """
        初始化文件管理器
        
        Args:
            base_path: 基础存储路径
            date_format: 日期格式
        """
        # 展开 ~ 为用户主目录
        base_path = os.path.expanduser(base_path)
        self.base_path = Path(base_path)
        self.date_format = date_format
        self.base_path.mkdir(parents=True, exist_ok=True)
    
    def get_storage_path(self, site_name: str, date: datetime | None = None) -> Path:
        """
        获取存储路径（已废弃，保留用于向后兼容）
        
        Args:
            site_name: 网站名称
            date: 日期，如果为 None 则使用当前日期
            
        Returns:
            存储路径（不再包含 items 文件夹，不自动创建目录）
        """
        if date is None:
            date = datetime.now()
        
        date_str = date.strftime(self.date_format)
        # 移除 items 文件夹，直接使用 site_name / date_str
        # 注意：不再自动创建目录，路径管理由 PathManager 处理
        storage_path = self.base_path / site_name / date_str
        return storage_path
    
    def load_metadata(self, site_name: str) -> dict:
        """
        加载元数据
        
        Args:
            site_name: 网站名称
            
        Returns:
            元数据字典
        """
        metadata_path = self.base_path / site_name / "metadata.json"
        if metadata_path.exists():
            try:
                with open(metadata_path, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception:
                pass
        
        return {
            "site_name": site_name,
            "last_crawl_time": None,
            "total_items": 0,
            "last_update_date": None,
            "enabled": True
        }
    
    def save_metadata(self, site_name: str, metadata: dict):
        """
        保存元数据
        
        Args:
            site_name: 网站名称
            metadata: 元数据字典
        """
        metadata_path = self.base_path / site_name / "metadata.json"
        metadata_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(metadata_path, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, ensure_ascii=False, indent=2)
    
    def save_json(self, result: CrawlResult, storage_path: Path):
        """
        保存 JSON 格式数据
        
        Args:
            result: 爬取结果
            storage_path: 存储路径
        """
        json_path = storage_path / "items.json"
        
        # 如果文件已存在，合并数据（去重）
        existing_items = []
        if json_path.exists():
            try:
                with open(json_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    existing_items = data.get('items', [])
            except Exception:
                pass
        
        # 去重：基于 ID 或链接
        existing_ids = {item.get('id') or item.get('link') for item in existing_items}
        new_items = [
            item for item in result.items
            if (item.get('id') or item.get('link')) not in existing_ids
        ]
        
        # 合并
        all_items = existing_items + new_items
        
        data = {
            'site_name': result.site_name,
            'crawl_time': result.crawl_time.isoformat(),
            'items_count': len(all_items),
            'items': all_items
        }
        
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    
    def update_metadata(self, result: CrawlResult, json_path: Path | None = None):
        """
        更新元数据
        
        Args:
            result: 爬取结果
            json_path: JSON 文件路径（可选），如果提供则从该文件读取条目数
        """
        metadata = self.load_metadata(result.site_name)
        metadata['last_crawl_time'] = result.crawl_time.isoformat()
        metadata['last_update_date'] = result.crawl_time.strftime(self.date_format)
        
        # 更新总条目数
        if json_path and json_path.exists():
            try:
                with open(json_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    metadata['total_items'] = data.get('items_count', 0)
            except Exception:
                pass
        else:
            # 如果没有提供 json_path，尝试从旧的路径查找（向后兼容）
            storage_path = self.get_storage_path(result.site_name, result.crawl_time)
            old_json_path = storage_path / "items.json"
            if old_json_path.exists():
                try:
                    with open(old_json_path, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                        metadata['total_items'] = data.get('items_count', 0)
                except Exception:
                    pass
        
        self.save_metadata(result.site_name, metadata)

