"""路径管理器"""

import os
from pathlib import Path
from datetime import datetime
from typing import Union


class PathManager:
    """路径管理器，用于管理输出文件的路径格式"""
    
    def __init__(self, 
                 base_path: Union[str, Path] = "data",
                 path_type: str = "relative",
                 path_template: str | None = None):
        """
        初始化路径管理器
        
        Args:
            base_path: 基础路径（相对路径的基准或绝对路径的根）
            path_type: 路径类型，"relative" 或 "absolute"
            path_template: 路径模板，例如 "data/{site_name}/{date}.org"
                         如果为None，使用默认模板
        """
        # 展开 ~ 为用户主目录
        if isinstance(base_path, str):
            base_path = os.path.expanduser(base_path)
        self.base_path = Path(base_path)
        self.path_type = path_type
        self.path_template = path_template or "data/{site_name}/{date}.org"
    
    def get_output_path(self, 
                       site_name: str, 
                       date: datetime | None = None,
                       filename: str | None = None) -> Path:
        """
        获取输出文件路径
        
        Args:
            site_name: 网站名称
            date: 日期，如果为None则使用当前日期
            filename: 文件名，如果为None则从模板中提取
            
        Returns:
            输出文件路径
        """
        if date is None:
            date = datetime.now()
        
        date_str = date.strftime('%Y-%m-%d')
        
        # 如果指定了文件名，使用文件名
        if filename:
            if self.path_type == "absolute":
                # 绝对路径：base_path/site_name/filename
                path = self.base_path / site_name / filename
            else:
                # 相对路径：base_path/site_name/filename
                path = self.base_path / site_name / filename
        else:
            # 使用模板
            path_str = self.path_template.format(
                site_name=site_name,
                date=date_str,
                base_path=str(self.base_path)
            )
            path = Path(path_str)
        
        # 确保父目录存在
        path.parent.mkdir(parents=True, exist_ok=True)
        
        return path
    
    def get_index_path(self, site_name: str) -> Path:
        """
        获取索引文件路径
        
        Args:
            site_name: 网站名称
            
        Returns:
            索引文件路径
        """
        if self.path_type == "absolute":
            path = self.base_path / site_name / "index.org"
        else:
            path = self.base_path / site_name / "index.org"
        
        # 确保父目录存在
        path.parent.mkdir(parents=True, exist_ok=True)
        
        return path
    
    def get_category_path(self, 
                         base_path: Path, 
                         category: str, 
                         filename: str) -> Path:
        """
        获取类别文件夹中的文件路径
        
        Args:
            base_path: 基础路径
            category: 类别名称
            filename: 文件名
            
        Returns:
            类别文件路径
        """
        return base_path.parent / category / filename

