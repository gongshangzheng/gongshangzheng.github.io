from __future__ import annotations
import argparse, signal, time
from datetime import datetime, timedelta
from typing import Any
from .crawler_pipeline import CrawlerPipeline
from .utils.logger import get_logger, setup_logger
parser=argparse.ArgumentParser(description="arxiv-paper-digest")
parser.add_argument("-c","--continuous",action="store_true",help="持续运行模式"); parser.add_argument("-r","--repair",action="store_true",help="修复模式")
running=True
def signal_handler(signum,frame):
    global running; get_logger().info("收到退出信号，正在停止..."); running=False
def _prepare_logger(cfg:dict[str,Any]):
    lc=cfg.get("logging",{}); return setup_logger(level=lc.get("level","INFO"),log_file=lc.get("file"),max_size_mb=lc.get("max_size_mb",10))
def run_once(rule_files:list[str]|None=None,target_date:str|None=None):
    pipe=CrawlerPipeline(rule_files or []); logger=_prepare_logger(pipe.global_config); pipe.set_logger(logger); logger.info("="*60); logger.info("arxiv-paper-digest 启动（单次运行模式）"); logger.info("="*60); pipe.run_once(render_digest=True,target_date=target_date)
def run_continuous(rule_files:list[str]|None=None):
    global running; rule_files=rule_files or []; pipe=CrawlerPipeline(rule_files); logger=_prepare_logger(pipe.global_config); pipe.set_logger(logger); signal.signal(signal.SIGINT,signal_handler); signal.signal(signal.SIGTERM,signal_handler)
    while running:
        if not rule_files: logger.error("rule_files 为空，没有可运行的规则文件"); break
        rt=pipe.build_runtime(rule_files[0]); wait=rt.site_config.update_frequency*60; ct=rt.custom_config.get("crawl_time")
        if ct:
            try:
                h,m=map(int,ct.split(":")); now=datetime.now(); target=now.replace(hour=h,minute=m,second=0,microsecond=0); nxt=target+timedelta(days=1) if target<=now else target; wait=max(0,(nxt-now).total_seconds()); logger.info(f"[调度] 下次爬取时间: {nxt:%Y-%m-%d %H:%M:%S}")
            except Exception as e: logger.warning(f"[调度] 解析爬取时间失败 ({ct}): {e}")
        waited=0
        while waited<wait and running:
            s=min(60,wait-waited); time.sleep(s); waited+=s
        if not running: break
        # 00:00 运行时，target_date 就是今天
        today_str=datetime.now().strftime('%Y-%m-%d')
        for rf in rule_files:
            try:
                rt=pipe.build_runtime(rf,target_date=today_str); pipe.auto_digest_enabled=pipe.auto_digest_enabled or bool(rt.custom_config.get("auto_digest",False)); pipe.run_rule(rt)
            except FileNotFoundError: logger.error(f"规则文件不存在，跳过: {rf}")
def main(continuous:bool=True,repair:bool=False,rule_files:list[str]|None=None,target_date:str|None=None):
    if continuous:
        if repair: run_once(rule_files,target_date=target_date)
        run_continuous(rule_files)
    else: run_once(rule_files,target_date=target_date)
if __name__=="__main__":
    a=parser.parse_args(); main(continuous=a.continuous,repair=a.repair)
