"""Exporter 管理器"""

from typing import Type

from .base_exporter import BaseOrgExporter
from .arxiv_exporter import ArXivOrgExporter
from ..utils.keyword_classifier import ItemClassifier


class ExporterManager:
    """Exporter 管理器，负责创建和管理不同的 Exporter 实例"""
    
    # Exporter 注册表
    _exporter_registry: dict[str, Type[BaseOrgExporter]] = {
        'BaseOrgExporter': BaseOrgExporter,
        'ArXivOrgExporter': ArXivOrgExporter,
    }
    
    @classmethod
    def register_exporter(cls, name: str, exporter_class: Type[BaseOrgExporter]):
        """
        注册 Exporter 类
        
        Args:
            name: Exporter 名称
            exporter_class: Exporter 类
        """
        cls._exporter_registry[name] = exporter_class
    
    @classmethod
    def create_exporter(cls,
                       exporter_config: dict,
                       keyword_classifier: ItemClassifier | None = None,
                       category_folders: dict[str, str] | None = None,
                       title_template: str | None = None) -> BaseOrgExporter:
        """
        根据配置创建 Exporter 实例
        
        Args:
            exporter_config: Exporter 配置字典
            keyword_classifier: 关键词分类器
            category_folders: 类别文件夹映射
            title_template: 标题模板
            
        Returns:
            Exporter 实例
        """
        # 获取 Exporter 类名
        exporter_class_name = exporter_config.get('class', 'BaseOrgExporter')
        
        # 从注册表中获取类
        if exporter_class_name not in cls._exporter_registry:
            raise ValueError(f"未知的 Exporter 类: {exporter_class_name}")
        
        exporter_class = cls._exporter_registry[exporter_class_name]
        
        # 获取格式类型
        format_type = exporter_config.get('org_format', BaseOrgExporter.FORMAT_DETAILED)
        
        # 获取标题模板（优先使用传入的参数，否则从配置中读取）
        if title_template is None:
            title_template = exporter_config.get('title_template')
        
        # 创建实例
        exporter = exporter_class(
            format_type=format_type,
            keyword_classifier=keyword_classifier,
            category_folders=category_folders,
            title_template=title_template
        )
        
        return exporter
    
    @classmethod
    def list_registered_exporters(cls) -> dict[str, str]:
        """
        列出所有已注册的 Exporter
        
        Returns:
            Exporter 名称 -> 类名的字典
        """
        return {
            name: exporter_class.__name__
            for name, exporter_class in cls._exporter_registry.items()
        }

