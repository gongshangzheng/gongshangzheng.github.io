"""Daily arXiv digest renderer for html-blog."""
from __future__ import annotations
import html, json, os, re, subprocess, sys, urllib.request
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any

CATEGORY_DISPLAY={"diffusion":"Diffusion","autoregressive":"Autoregressive","image_compression":"Image Compression","visual_tokenizer_1d":"1D Visual Tokenizer","diffusion_visual_encoder":"Diffusion Visual Encoder"}
CATEGORY_ORDER=["autoregressive","diffusion","image_compression","visual_tokenizer_1d","diffusion_visual_encoder"]
TRACKED_DIRECTIONS="diffusion、autoregressive、image compression、1D visual tokenizer 与 diffusion visual encoder"

@dataclass(frozen=True)
class DigestConfig:
    blog_dir: Path; raw_dir: Path; pages_dir: Path; date: str; post_slug: str; post_file: Path; post_url: str; build: bool=True; push: bool=False; email: bool=False
@dataclass(frozen=True)
class CategoryBatch:
    category: str; path: Path; items: list[dict[str,Any]]
    @property
    def paper_count(self)->int: return len(self.items)

EMPTY_SECTION_TEXT="<p class=\"empty-digest\">今日未找到该分类的匹配论文。</p>"

def default_config(date: str|None=None)->DigestConfig:
    today=date or datetime.now().strftime("%Y-%m-%d")
    blog_dir=Path(os.environ.get("ARXIV_DIGEST_BLOG_DIR","~/gongshangzheng.github.io")).expanduser()
    raw_dir=Path(os.environ.get("ARXIV_DIGEST_RAW_DIR",str(blog_dir/"data"/"daily-papers"))).expanduser()
    pages_dir=blog_dir/"src"/"pages"; slug=f"arxiv-digest-{today}"
    return DigestConfig(blog_dir,raw_dir,pages_dir,today,slug,pages_dir/f"{slug}.html",f"https://gongshangzheng.github.io/{slug}.html",os.environ.get("ARXIV_DIGEST_BUILD","1")!="0",os.environ.get("ARXIV_DIGEST_PUSH","0")=="1",os.environ.get("ARXIV_DIGEST_EMAIL","0")=="1")

def display_name(c:str)->str: return CATEGORY_DISPLAY.get(c,c.replace("_"," ").title())
def category_sort_key(n:str)->int: return CATEGORY_ORDER.index(n) if n in CATEGORY_ORDER else 999
def html_escape(v:Any)->str: return html.escape(str(v or ""),quote=True)
def strip_arxiv_prefix(s:str)->str: return re.sub(r"\s+"," ",re.sub(r"^arXiv:\S+\s+Announce Type:\s*\w+\s+Abstract:\s*","",s or "",flags=re.I)).strip()
def item_id(item:dict[str,Any])->str: return str(item.get("arxiv_id") or item.get("id") or "")

def frontmatter(created_at:str, updated_at:str, description:str, hero_sub:str)->str:
    return f'''---\ntitle: "每日 arXiv 论文简报 · {created_at[:10]}"\ndescription: "{description}"\ncreated_at: {created_at}\nupdated_at: {updated_at}\ntags: [arXiv, 论文, AI, 视觉编码器]\ncategories: [AI]\nsubcategory: 论文每日摘要\nmathjax: true\nhero_title: "每日 arXiv 论文简报"\nhero_sub: "{hero_sub}"\nhero_tagline: "自动追踪 · LLM 总览 · 研究雷达"\npage_style: |\n  .stats {{ margin-top: 0; }}\n  .paper-card {{ border: 1px solid rgba(148, 163, 184, .22); border-radius: 18px; padding: 1.25rem; margin: 1.25rem 0; background: rgba(15, 23, 42, .20); overflow-wrap: break-word; }}\n  .paper-card h3 {{ margin-top: 0; }}\n  .paper-meta {{ display: flex; flex-wrap: wrap; gap: .5rem; margin: .65rem 0 1rem; color: var(--muted); font-size: .92rem; }}\n  .paper-meta span {{ padding: .2rem .55rem; border-radius: 999px; background: rgba(148, 163, 184, .12); }}\n  .paper-abstract {{ margin-top: .75rem; }}\n  .category-summary {{ margin: 1rem 0 1.5rem; }}\n  .empty-digest {{ padding: 1.25rem; border-radius: 16px; background: rgba(50, 135, 208, .12); }}\n---\n'''

def collect_category_batches(config:DigestConfig)->list[CategoryBatch]:
    out=[]
    base=config.raw_dir if config.raw_dir.exists() else None
    for category in CATEGORY_ORDER:
        path=(base/category/f"{config.date}.json") if base else (config.raw_dir/category/f"{config.date}.json")
        items:list[dict[str,Any]]=[]
        if path.exists():
            data=json.loads(path.read_text(encoding="utf-8"))
            items=data.get("items",[]) if isinstance(data,dict) else []
        out.append(CategoryBatch(category,path,items))
    return out

def persist_raw_batches(base_dir:Path,date:str,categorized_items:dict[str,list[dict[str,Any]]],crawl_time:datetime)->list[Path]:
    written=[]
    for cat,items in sorted(categorized_items.items(),key=lambda kv:category_sort_key(kv[0])):
        d=base_dir.expanduser()/cat; d.mkdir(parents=True,exist_ok=True); p=d/f"{date}.json"
        p.write_text(json.dumps({"category":cat,"display_name":display_name(cat),"date":date,"crawl_time":crawl_time.isoformat(),"items_count":len(items),"items":items},ensure_ascii=False,indent=2),encoding="utf-8")
        written.append(p)
    return written

def paper_list_for_prompt(items:list[dict[str,Any]])->str: return "\n".join(f"- {i.get('title','')} ({i.get('link','')})" for i in items)
def _extract_text(resp:dict)->str|None:
    """从 LLM 响应中提取文本，兼容 OpenAI 和 Anthropic 两种格式。"""
    # OpenAI 格式: choices[0].message.content
    if "choices" in resp:
        try: return resp["choices"][0]["message"]["content"].strip()
        except (KeyError,IndexError): pass
    # Anthropic 格式: content[0].text
    if "content" in resp and isinstance(resp["content"],list):
        try:
            for block in resp["content"]:
                if isinstance(block,dict) and block.get("type")=="text": return block["text"].strip()
        except (KeyError,IndexError): pass
    return None

def call_llm(prompt:str)->str|None:
    api_key=os.environ.get("ANTHROPIC_API_KEY") or os.environ.get("OPENAI_API_KEY"); api_url=os.environ.get("ANTHROPIC_API_URL") or os.environ.get("LLM_API_URL"); model=os.environ.get("ANTHROPIC_MODEL") or os.environ.get("LLM_MODEL")
    if not(api_key and api_url and model): return None
    # 检测 API 风格：URL 包含 /anthropic 则用 Anthropic 格式，否则用 OpenAI 格式
    is_anthropic = "/anthropic" in api_url.lower()
    if is_anthropic:
        endpoint = api_url.rstrip("/") + "/v1/messages"
        headers = {"Content-Type":"application/json","x-api-key":api_key,"anthropic-version":"2023-06-01"}
        payload = json.dumps({"model":model,"messages":[{"role":"user","content":prompt}],"max_tokens":4000})
    else:
        endpoint = api_url
        headers = {"Content-Type":"application/json","Authorization":f"Bearer {api_key}"}
        payload = json.dumps({"model":model,"messages":[{"role":"user","content":prompt}],"temperature":0.7,"max_tokens":4000})
    req = urllib.request.Request(endpoint, data=payload.encode(), headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req,timeout=120) as r:
            resp = json.loads(r.read().decode())
            return _extract_text(resp)
    except Exception: return None

def fallback_overview(cat:str,n:int)->str: return f"<p>今日 {display_name(cat)} 方向共追踪到 {n} 篇论文。简报保留原始摘要、中文摘要、作者和链接，适合先快速筛选，再挑出值得深读的论文进入 org-roam。</p>"

def _digest_overview_cache_path(config:DigestConfig)->Path: return config.pages_dir/".cache"/f"{config.date}.digest-overview.txt"

def overview_for_digest(batches:list[CategoryBatch], config:DigestConfig|None=None)->str:
    """跨所有分类的全局总览，由 LLM 生成并缓存。"""
    non_empty = [b for b in batches if b.paper_count > 0]
    total = sum(b.paper_count for b in batches)
    if not non_empty:
        return ""
    # 缓存
    cache = _digest_overview_cache_path(config) if config else None
    if cache and cache.exists() and cache.read_text(encoding="utf-8").strip():
        return cache.read_text(encoding="utf-8").strip()
    # 构建 prompt
    section_lines = []
    for b in non_empty:
        titles = "\n".join(f"  - {i.get('title','')}" for i in b.items[:15])
        section_lines.append(f"【{display_name(b.category)}】({b.paper_count} 篇)\n{titles}")
    paper_sections = "\n\n".join(section_lines)
    prompt = f"""你是一位 AI 研究专家。以下是今日 arXiv 各研究方向的论文列表，请写一段全局总览。

要求：
1. 用中文写 200-400 字
2. 总结今天各方向的整体趋势、交叉联系和关键亮点
3. 挑出今日最值得关注的 3-5 篇（不限分类），每篇用一句话说明原因
4. 输出可以使用 HTML 的 <p><ul><li><strong>，但不要使用 Markdown 样式标题

各分类论文：
{paper_sections}"""
    text = call_llm(prompt) or f"<p>今日共追踪到 {total} 篇论文，涵盖 {', '.join(display_name(b.category) for b in non_empty)} 方向。</p>"
    if cache:
        cache.parent.mkdir(parents=True, exist_ok=True)
        cache.write_text(text, encoding="utf-8")
    return text

def overview_for_batch(batch:CategoryBatch)->str:
    cache=batch.path.with_suffix(".overview.txt")
    if cache.exists() and cache.read_text(encoding="utf-8").strip(): return cache.read_text(encoding="utf-8").strip()
    prompt=f"""你是一位 AI 研究专家。请阅读以下 arXiv 论文标题列表，写一段简洁的每日总览。\n\n要求：\n1. 分类：{display_name(batch.category)}\n2. 用中文写 150-300 字的概述，总结今天该分类论文的整体趋势和亮点\n3. 选出该分类中最有价值的 3-5 篇，每篇用一句话说明为什么值得关注\n4. 输出可以使用 HTML 的 <p><ul><li><strong>，但不要使用 Markdown 标题\n\n论文列表：\n{paper_list_for_prompt(batch.items)}\n"""
    text=call_llm(prompt) or fallback_overview(batch.category,batch.paper_count); cache.write_text(text,encoding="utf-8"); return text

def render_stats(total:int,batches:list[CategoryBatch])->str:
    xs=[f'<div class="stat"><span class="num">{total}</span><span class="label">Total Papers</span></div>']+[f'<div class="stat"><span class="num b">{b.paper_count}</span><span class="label g">{html_escape(display_name(b.category))}</span></div>' for b in batches]
    return '<div class="stats">\n  '+"\n  ".join(xs)+"\n</div>\n"
def render_paper_card(item:dict[str,Any])->str:
    title=html_escape(item.get("title","Untitled")); link=html_escape(item.get("link","")); authors=item.get("authors") or []
    if isinstance(authors,str): authors=[authors]
    authors_text=html_escape(", ".join(authors)); published=html_escape(item.get("published_time") or item.get("published_time_str") or ""); cats=item.get("categories") or []; cats_text=html_escape(", ".join(cats) if isinstance(cats,list) else cats)
    meta="".join([f"<span>{published}</span>" if published else "",f"<span>{cats_text}</span>" if cats_text else "",f"<span>{html_escape(item_id(item))}</span>" if item_id(item) else ""])
    title_zh=html_escape(item.get("title_zh","")); summary=html_escape(strip_arxiv_prefix(item.get("summary",""))); summary_zh=html_escape(strip_arxiv_prefix(item.get("summary_zh","")))
    return f'''\n<div class="paper-card">\n  <h3><a href="{link}" target="_blank" rel="noopener">{title}</a></h3>\n  <div class="paper-meta">{meta}</div>\n  {f'<p><strong>中文标题：</strong>{title_zh}</p>' if title_zh else ''}\n  {f'<p><strong>作者：</strong>{authors_text}</p>' if authors_text else ''}\n  {f'<div class="paper-abstract"><strong>摘要：</strong><p>{summary}</p></div>' if summary else ''}\n  {f'<div class="paper-abstract"><strong>摘要中文：</strong><p>{summary_zh}</p></div>' if summary_zh else ''}\n</div>\n'''
def render_category_section(b:CategoryBatch)->str:
    cards=''.join(render_paper_card(i) for i in b.items) if b.items else EMPTY_SECTION_TEXT
    return f'''\n<div class="ch fade-in">\n  <div class="ch-label">{html_escape(b.category)}</div>\n  <div class="ch-title">{html_escape(display_name(b.category))}</div>\n  <div class="ch-date">{b.paper_count} 篇论文</div>\n  <div class="category-summary">{overview_for_batch(b) if b.items else EMPTY_SECTION_TEXT}</div>\n</div>\n{cards}\n'''
def write_empty_digest(config:DigestConfig)->None:
    config.pages_dir.mkdir(parents=True,exist_ok=True); ts=f"{config.date}T10:00:00"
    config.post_file.write_text(frontmatter(ts,ts,f"{config.date} 自动追踪 arXiv 论文结果：今日无匹配论文。",f"{config.date} · 0 篇论文")+f'''\n<div class="wrap">\n<div class="ch fade-in"><div class="ch-label">Daily Radar</div><div class="ch-title">今日无新论文</div><p class="empty-digest">今日爬虫已正常运行，但 arXiv 未发布匹配 {html_escape(TRACKED_DIRECTIONS)} 方向的新论文。</p></div>\n</div>\n''',encoding="utf-8")
def write_digest(config:DigestConfig,batches:list[CategoryBatch])->int:
    config.pages_dir.mkdir(parents=True,exist_ok=True); total=sum(b.paper_count for b in batches); ts=f"{config.date}T10:00:00"
    digest_overview = overview_for_digest(batches, config)
    body=''.join(render_category_section(b) for b in batches)
    overview_html = f'''\n<div class="ch fade-in"><div class="ch-label">Daily Radar</div><div class="ch-title">每日总览</div><div class="category-summary">{digest_overview}</div></div>\n''' if digest_overview else f'''\n<div class="ch fade-in"><div class="ch-label">Daily Radar</div><div class="ch-title">每日总览</div><p>今日共追踪到 <strong>{total}</strong> 篇相关论文。内容按研究方向拆分，避免不同问题域混在同一个长列表里。</p></div>\n'''
    content=frontmatter(ts,ts,f"自动追踪 {TRACKED_DIRECTIONS} 方向的 arXiv 每日论文。",f"{config.date} · {total} 篇论文 · 按研究方向分组")+render_stats(total,batches)+f'''\n<div class="wrap">\n{overview_html}{body}\n</div>\n'''
    config.post_file.write_text(content.rstrip()+"\n",encoding="utf-8"); return total
def build_blog(config:DigestConfig)->None:
    if config.build: subprocess.run(["node","build.js"],cwd=config.blog_dir,check=True,env={**os.environ,"FORCE_BUILD":"1"})
def git_publish(config:DigestConfig,total:int)->None:
    subprocess.run(["git","add","src/pages/"+config.post_file.name,"data/daily-papers"],cwd=config.blog_dir,check=True); diff=subprocess.run(["git","diff","--cached","--quiet"],cwd=config.blog_dir)
    if diff.returncode: subprocess.run(["git","commit","-m",f"daily-papers: {config.date} ({total} papers)"],cwd=config.blog_dir,check=True); subprocess.run(["git","push"],cwd=config.blog_dir,check=True) if config.push else None
def run_digest(date:str|None=None,*,build:bool|None=None,publish:bool=False)->Path:
    cfg=default_config(date); cfg=DigestConfig(**{**cfg.__dict__,"build":cfg.build if build is None else build,"push":publish}) if (build is not None or publish) else cfg
    batches=collect_category_batches(cfg); total=write_digest(cfg,batches) if batches else (write_empty_digest(cfg) or 0); build_blog(cfg); git_publish(cfg,total) if publish else None; return cfg.post_file
if __name__=="__main__": print(run_digest(sys.argv[1] if len(sys.argv)>1 else None))
