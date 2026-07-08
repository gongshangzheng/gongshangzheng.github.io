from __future__ import annotations
from datetime import datetime
from typing import Any
from .crawl_output_writer import CrawlOutputWriter, normalize_output_formats
from .html_blog_digest import run_digest
from .models.crawl_result import CrawlResult
from .rule_runtime import RuleRuntime, RuntimeBuilder
from .storage.file_manager import FileManager
from .utils.config_loader import load_global_config
class CrawlerPipeline:
    def __init__(self,rule_files:list[str],global_config:dict[str,Any]|None=None,logger:Any|None=None):
        self.rule_files=rule_files; self.global_config=global_config or load_global_config(); self.logger=logger; storage=self.global_config.get("storage",{})
        self.file_manager=FileManager(base_path=storage.get("base_path","data"),date_format=storage.get("date_format","%Y-%m-%d")); self.runtime_builder=RuntimeBuilder(self.global_config); self.output_writer=CrawlOutputWriter(self.file_manager,logger); self.auto_digest_enabled=False
    def set_logger(self,logger:Any): self.logger=logger; self.output_writer.logger=logger
    def log(self,msg:str,level:str="info"):
        if self.logger: getattr(self.logger,level)(msg)
    def build_runtime(self,rule_file:str,target_date:str|None=None)->RuleRuntime: return self.runtime_builder.build(rule_file,target_date=target_date)
    def run_rule(self,runtime:RuleRuntime)->bool:
        result:CrawlResult=runtime.crawler.crawl()
        if not result.success: self.log(f"爬取失败: {result.error_message}","error"); return False
        self.log(f"爬取成功，获取到 {result.items_count} 个条目")
        if result.items_count<=0: self.file_manager.update_metadata(result); return True
        return self.output_writer.write(runtime,result)
    def run_once(self,*,render_digest:bool=True,target_date:str|None=None)->None:
        if not self.rule_files: raise ValueError("rule_files 为空，没有可运行的规则文件")
        digest_date = target_date or datetime.now().strftime('%Y-%m-%d')
        for rf in self.rule_files:
            rt=self.build_runtime(rf,target_date=target_date); self.auto_digest_enabled=self.auto_digest_enabled or bool(rt.custom_config.get("auto_digest",False)); self.run_rule(rt)
        if render_digest and self.auto_digest_enabled: self.log(f"Digest 执行成功: {run_digest(digest_date,build=True,publish=False)}")
    @staticmethod
    def normalize_output_formats(value:Any)->list[str]: return normalize_output_formats(value)
