from __future__ import annotations
import json
from pathlib import Path
from typing import Any
from .html_blog_digest import persist_raw_batches
from .models.crawl_result import CrawlResult
from .rule_runtime import RuleRuntime

def normalize_output_formats(value: Any) -> list[str]:
    if isinstance(value,str):
        v=value.lower()
        if v=="both": return ["org","markdown"]
        if v=="all": return ["org","markdown","json"]
        if "," in v: return [x.strip() for x in v.split(",") if x.strip()]
        return [v]
    if isinstance(value,list): return [str(x).lower() for x in value]
    return ["org"]
class CrawlOutputWriter:
    def __init__(self,file_manager:Any,logger:Any|None=None): self.file_manager=file_manager; self.logger=logger
    def log(self,msg:str,level:str="info"):
        if self.logger: getattr(self.logger,level)(msg)
    def write(self,runtime:RuleRuntime,result:CrawlResult)->bool:
        fmts=normalize_output_formats(runtime.storage_config.get("output_format","org")); out=runtime.path_manager.get_output_path(site_name=result.site_name,date=result.crawl_time)
        cats=runtime.exporter.keyword_classifier.classify_items(result.items) if runtime.exporter.keyword_classifier else None
        if "html-blog" in fmts or "html_blog" in fmts:
            if not cats: self.log("html-blog 输出需要 category_mapping；当前没有分类结果","warning")
            else:
                for p in persist_raw_batches(Path(runtime.storage_config.get("base_path","data")).expanduser(), result.crawl_time.strftime(runtime.storage_config.get("date_format","%Y-%m-%d")), cats, result.crawl_time): self.log(f"已保存分类 raw JSON: {p}")
        if "org" in fmts: runtime.exporter.export(result,out)
        if "markdown" in fmts: runtime.exporter.export_markdown(result,out.with_suffix(".md"))
        if "json" in fmts:
            jp=out.with_suffix(".json"); jp.parent.mkdir(parents=True,exist_ok=True); jp.write_text(json.dumps(result.to_dict(),ensure_ascii=False,indent=2),encoding="utf-8")
        if runtime.index_manager: runtime.index_manager.update_index(site_name=result.site_name,crawl_time=result.crawl_time,items=result.items,date_file_path=out,categorized_items=cats,category_folders=runtime.exporter.category_folders)
        self.file_manager.update_metadata(result)
        if cats:
            for c,items in sorted(cats.items()): self.log(f"  {c}: {len(items)} 篇")
        return True
