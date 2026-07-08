"""翻译器模块：使用阿里云翻译 API 实现自动翻译"""

from ..utils.logger import get_logger


class Translator:
    """翻译器类，使用阿里云翻译 API 实现标题和摘要的自动翻译"""
    
    def __init__(
        self, 
        enabled: bool = True, 
        source_lang: str = "en", 
        target_lang: str = "zh",
        access_key_id: str | None = None,
        access_key_secret: str | None = None
    ):
        """
        初始化翻译器
        
        Args:
            enabled: 是否启用翻译
            source_lang: 源语言代码（默认：en）
            target_lang: 目标语言代码（默认：zh）
            access_key_id: 阿里云 AccessKey ID（可选，可从环境变量读取）
            access_key_secret: 阿里云 AccessKey Secret（可选，可从环境变量读取）
        """
        self.enabled = enabled
        self.source_lang = source_lang
        self.target_lang = target_lang
        self.logger = get_logger()
        self._client = None
        
        # 获取 AccessKey（优先使用参数，其次从环境变量读取）
        import os
        self.access_key_id = access_key_id or os.getenv('ALIBABA_CLOUD_ACCESS_KEY_ID')
        self.access_key_secret = access_key_secret or os.getenv('ALIBABA_CLOUD_ACCESS_KEY_SECRET')
        
        if self.enabled:
            self._init_aliyun_client()
    
    def _init_aliyun_client(self):
        """初始化阿里云翻译客户端"""
        try:
            # 检查是否提供了 AccessKey
            if not self.access_key_id or not self.access_key_secret:
                self.logger.warning("未提供阿里云 AccessKey，翻译功能将被禁用")
                self.enabled = False
                return
            
            # 导入阿里云 SDK
            from alibabacloud_alimt20181012.client import Client as alimt20181012Client
            from alibabacloud_tea_openapi import models as open_api_models
            
            # 创建配置
            config = open_api_models.Config(
                access_key_id=self.access_key_id,
                access_key_secret=self.access_key_secret
            )
            config.endpoint = 'mt.cn-hangzhou.aliyuncs.com'
            
            # 创建客户端
            self._client = alimt20181012Client(config)
            self.logger.info(f"阿里云翻译器已初始化（{self.source_lang} -> {self.target_lang}）")
            
        except ImportError as e:
            self.logger.error(f"未找到阿里云 SDK，请安装: pip install alibabacloud-alimt20181012")
            self.logger.error(f"导入错误: {e}")
            self.enabled = False
            self._client = None
        except Exception as e:
            self.logger.error(f"初始化阿里云翻译客户端失败: {e}")
            self.enabled = False
            self._client = None
    
    def translate(self, text: str) -> str | None:
        """
        翻译文本
        
        Args:
            text: 要翻译的文本
            
        Returns:
            翻译后的文本，如果翻译失败或未启用则返回 None
        """
        if not self.enabled or not text or not text.strip():
            return None
        
        if self._client is None:
            return None
        
        try:
            from alibabacloud_alimt20181012 import models as alimt_20181012_models
            from alibabacloud_tea_util import models as util_models
            
            # 创建翻译请求
            translate_general_request = alimt_20181012_models.TranslateGeneralRequest(
                format_type='text',
                source_language=self.source_lang,
                target_language=self.target_lang,
                source_text=text,
                scene='general'
            )
            
            # 执行翻译
            runtime = util_models.RuntimeOptions()
            resp = self._client.translate_general_with_options(translate_general_request, runtime)
            
            # 提取翻译结果
            if resp.body and resp.body.data:
                translated_text = resp.body.data.translated
                return translated_text
            else:
                self.logger.warning(f"翻译响应格式异常: {resp}")
                return None
            
        except Exception as e:
            self.logger.warning(f"翻译失败: {e}，返回 None")
            return None
    
    def translate_title(self, title: str) -> str | None:
        """
        翻译标题
        
        Args:
            title: 原始标题
            
        Returns:
            翻译后的标题，如果翻译失败则返回 None（保持原文）
        """
        if not self.enabled:
            return None
        
        translated = self.translate(title)
        if translated:
            self.logger.debug(f"标题翻译: {title[:50]}... -> {translated[:50]}...")
        return translated
    
    def translate_summary(self, summary: str) -> str | None:
        """
        翻译摘要
        
        Args:
            summary: 原始摘要
            
        Returns:
            翻译后的摘要，如果翻译失败则返回 None（保持原文）
        """
        if not self.enabled:
            return None
        
        translated = self.translate(summary)
        if translated:
            self.logger.debug(f"摘要翻译: {summary[:50]}... -> {translated[:50]}...")
        return translated
    
    def translate_item(self, item_dict: dict) -> dict:
        """
        翻译条目（标题和摘要）
        
        Args:
            item_dict: 条目字典（包含 title 和 summary）
            
        Returns:
            翻译后的条目字典（添加 title_zh 和 summary_zh 字段）
        """
        if not self.enabled:
            return item_dict
        
        result = item_dict.copy()
        
        # 翻译标题
        title = item_dict.get('title', '')
        if title:
            translated_title = self.translate_title(title)
            if translated_title:
                result['title_zh'] = translated_title
        
        # 翻译摘要
        summary = item_dict.get('summary', '')
        if summary:
            translated_summary = self.translate_summary(summary)
            if translated_summary:
                result['summary_zh'] = translated_summary
        
        return result

