"""配置加载器"""

import yaml
import os
from pathlib import Path
from typing import Any
from dotenv import load_dotenv

from ..models.site_config import SiteConfig


# 加载环境变量
load_dotenv()


def load_global_config(config_path: str = "config/global_config.yaml") -> dict:
    """
    加载全局配置
    
    Args:
        config_path: 配置文件路径
        
    Returns:
        配置字典
    """
    config_file = Path(config_path)
    
    if not config_file.exists():
        # 返回默认配置
        return {
            'storage': {
                'base_path': 'data',
                'date_format': '%Y-%m-%d',
                'output_format': 'org'
            },
            'logging': {
                'level': 'INFO',
                'file': 'logs/crawler.log',
                'max_size_mb': 10
            },
            'scheduler': {
                'check_interval': 60,
                'max_workers': 5
            }
        }
    
    with open(config_file, 'r', encoding='utf-8') as f:
        config_raw = yaml.safe_load(f)
    
    # 替换环境变量
    config_processed = _replace_env_vars(config_raw)
    
    # 确保 config 是字典类型
    if not isinstance(config_processed, dict):
        raise ValueError(f"全局配置文件格式错误: {config_path}，期望字典类型，但得到 {type(config_processed)}")
    
    config: dict[str, Any] = config_processed
    
    return config


def load_rule_config(rule_path: str, global_config: dict | None = None) -> SiteConfig:
    """
    加载规则配置
    
    Args:
        rule_path: 规则文件路径
        global_config: 全局配置（可选），用于获取默认更新频率
        
    Returns:
        SiteConfig 对象
    """
    rule_file = Path(rule_path)
    
    if not rule_file.exists():
        raise FileNotFoundError(f"规则文件不存在: {rule_path}")
    
    with open(rule_file, 'r', encoding='utf-8') as f:
        rule_data_raw = yaml.safe_load(f)
    
    # 替换环境变量
    rule_data_processed = _replace_env_vars(rule_data_raw)
    
    # 确保 rule_data 是字典类型
    if not isinstance(rule_data_processed, dict):
        raise ValueError(f"规则文件格式错误: {rule_path}，期望字典类型，但得到 {type(rule_data_processed)}")
    
    rule_data: dict[str, Any] = rule_data_processed
    
    # 更新频率优先级：规则文件 > 全局配置默认值
    # 只有当规则文件中没有指定 update_frequency 时，才使用全局配置的默认值
    if 'update_frequency' not in rule_data:
        # 规则文件中没有指定，使用全局配置的默认值
        if global_config is None:
            # 如果没有提供全局配置，加载它
            global_config = load_global_config()
        
        default_freq = global_config.get('scheduler', {}).get('default_update_frequency', 120)
        rule_data['update_frequency'] = default_freq
    # 如果规则文件中指定了 update_frequency（即使为 None 或 0），也使用规则文件的值
    # 这样可以明确覆盖全局默认值
    
    return SiteConfig.from_dict(rule_data)


def load_all_rules(rules_dir: str = "rules", global_config: dict | None = None) -> list[SiteConfig]:
    """
    加载所有规则配置
    
    Args:
        rules_dir: 规则目录
        global_config: 全局配置（可选），用于获取默认更新频率
        
    Returns:
        SiteConfig 对象列表
    """
    rules_path = Path(rules_dir)
    if not rules_path.exists():
        return []
    
    # 如果没有提供全局配置，加载它
    if global_config is None:
        global_config = load_global_config()
    
    configs = []
    for rule_file in rules_path.glob("*.yaml"):
        try:
            config = load_rule_config(str(rule_file), global_config)
            if config.enabled:
                configs.append(config)
        except Exception as e:
            print(f"加载规则文件失败 {rule_file}: {e}")
    
    return configs


def _replace_env_vars(data: Any) -> Any:
    """
    递归替换配置中的环境变量
    
    Args:
        data: 配置数据
        
    Returns:
        替换后的数据
    """
    if isinstance(data, dict):
        return {k: _replace_env_vars(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [_replace_env_vars(item) for item in data]
    elif isinstance(data, str) and data.startswith("${") and data.endswith("}"):
        # 提取环境变量名
        env_var = data[2:-1]
        return os.getenv(env_var, data)
    else:
        return data

