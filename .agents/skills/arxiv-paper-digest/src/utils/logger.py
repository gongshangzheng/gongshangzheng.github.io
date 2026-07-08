"""日志工具"""

import logging
import sys
from pathlib import Path


_logger: logging.Logger | None = None


def setup_logger(
    level: str = "INFO",
    log_file: str | None = None,
    max_size_mb: int = 10
) -> logging.Logger:
    """
    设置日志系统
    
    Args:
        level: 日志级别
        log_file: 日志文件路径
        max_size_mb: 最大文件大小（MB）
        
    Returns:
        Logger 对象
    """
    global _logger
    
    logger = logging.getLogger('arxiv_paper_digest')
    logger.setLevel(getattr(logging, level.upper()))
    
    # 清除现有的处理器
    logger.handlers.clear()
    
    # 格式化器
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    # 控制台处理器
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)
    
    # 文件处理器
    if log_file:
        log_path = Path(log_file)
        log_path.parent.mkdir(parents=True, exist_ok=True)
        file_handler = logging.FileHandler(log_file, encoding='utf-8')
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)
    
    _logger = logger
    return logger


def get_logger() -> logging.Logger:
    """
    获取日志对象
    
    Returns:
        Logger 对象
    """
    global _logger
    if _logger is None:
        _logger = setup_logger()
    return _logger

