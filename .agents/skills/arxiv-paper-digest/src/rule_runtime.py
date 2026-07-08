from __future__ import annotations
from dataclasses import dataclass
from pathlib import Path
from typing import Any
from .storage.index_manager import IndexManager
from .storage.path_manager import PathManager
from .utils.config_loader import load_rule_config
@dataclass
class RuleRuntime:
    rule_file:str; site_config:Any; custom_config:dict[str,Any]; storage_config:dict[str,Any]; path_manager:PathManager; exporter:Any; index_manager:IndexManager|None; crawler:Any
class RuntimeBuilder:
    def __init__(self,global_config:dict[str,Any]): self.global_config=global_config
    def build(self,rule_file:str,target_date:str|None=None)->RuleRuntime:
        from .crawler.crawler_manager import CrawlerManager
        from .filters import CategoryRuleClassifier, FilterManager
        from .storage.exporter_manager import ExporterManager
        from .tools import Translator
        if not Path(rule_file).exists(): raise FileNotFoundError(f"规则文件不存在: {rule_file}")
        site=load_rule_config(rule_file,self.global_config); custom=site.custom_config or {}; storage=self.global_config.get("storage",{})
        classifier=None; folders={}; mapping=custom.get("category_mapping",{}) or {}
        if mapping:
            classifier=CategoryRuleClassifier.from_config(mapping)
            for name,cfg in mapping.items(): folders[name]=cfg.get("folder",name) if isinstance(cfg,dict) else name
        exp_cfg=custom.get("exporter",{}); path_cfg=exp_cfg.get("path",{})
        pm=PathManager(base_path=path_cfg.get("base_path",storage.get("base_path","data")),path_type=path_cfg.get("type","relative"),path_template=path_cfg.get("template","data/{site_name}/{date}.org"))
        exporter=ExporterManager.create_exporter(exporter_config=exp_cfg or {"class":"BaseOrgExporter","org_format":custom.get("org_format","detailed")},keyword_classifier=classifier,category_folders=folders)
        idx=None; idx_cfg=exp_cfg.get("index",{})
        if idx_cfg.get("enabled",False):
            base=path_cfg.get("base_path",storage.get("base_path","data")); ip=Path(base)/site.name/idx_cfg["path"] if idx_cfg.get("path") else pm.get_index_path(site.name)
            idx=IndexManager(index_path=ip,table_headers=idx_cfg.get("table_headers",["{title}","{first_author}","{link}"]),cell_templates=idx_cfg.get("cell_templates",{"title":"{title}","first_author":"{first_author}","link":"[[{link}][查看]]"}),header_labels=idx_cfg.get("header_labels",{"title":"标题","first_author":"第一作者","link":"链接"}))
        tr_cfg=custom.get("translator",{}); translator=Translator(enabled=True,source_lang=tr_cfg.get("source_lang","en"),target_lang=tr_cfg.get("target_lang","zh"),access_key_id=tr_cfg.get("access_key_id"),access_key_secret=tr_cfg.get("access_key_secret")) if tr_cfg.get("enabled",False) else None
        crawler=CrawlerManager.get_crawler(site,translator=translator)
        filters_cfg=[]
        if isinstance(self.global_config.get("filters",[]),list): filters_cfg.extend(self.global_config.get("filters",[]))
        if isinstance(custom.get("filters",[]),list): filters_cfg.extend(custom.get("filters",[]))
        filters=FilterManager.create_filters(filters_cfg, target_date=target_date)
        if filters: crawler.set_filters(filters)
        return RuleRuntime(rule_file,site,custom,storage,pm,exporter,idx,crawler)
