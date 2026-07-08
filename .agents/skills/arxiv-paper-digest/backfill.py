#!/usr/bin/env python3
"""Backfill script for 5/24-5/27 data gap.

Uses arxiv_search API to query papers by date range and keyword,
then classifies them into categories and writes JSON files in the
same format as the normal pipeline.
"""
from __future__ import annotations

import json
import re
import sys
import time
from datetime import date, datetime, timedelta
from pathlib import Path

# Add project root to path
PROJECT_ROOT = Path(__file__).parent
sys.path.insert(0, str(PROJECT_ROOT))

from src.arxiv_search import Query, Taxonomy, ArxivPaper, build_query, search_by_keywords

# Config
RAW_BASE = Path("~/gongshangzheng.github.io/data/daily-papers").expanduser()
DATES = ["2026-05-24", "2026-05-25", "2026-05-26", "2026-05-27"]

# Keywords from rules YAML
KEYWORDS = [
    "diffusion",
    "autoregressive",
    "AR model",
    "autoregression",
    "image compression",
    "image rescaling",
    "1D visual tokenizer",
    "1-D visual tokenizer",
    "visual tokenizer",
    "sequential visual encoding",
    "1D patch tokenization",
    "diffusion tokenizer",
    "diffusion image encoder",
    "diffusion visual encoder",
    "continuous visual tokenizer",
]

EXCLUDE_KEYWORDS = ["weather", "forecasting", "meteorology", "precipitation", "rainfall"]

# Category mapping (same as rules YAML)
CATEGORY_RULES = {
    "diffusion": {
        "title": ["diffusion"],
        "summary": ["diffusion"],
    },
    "autoregressive": {
        "title": ["autoregressive", "AR model", "autoregression"],
        "summary": ["autoregressive", "AR model", "autoregression"],
    },
    "image_compression": {
        "title": ["image compression", "image rescaling"],
        "summary": ["image compression", "image rescaling"],
    },
    "visual_tokenizer_1d": {
        "title": ["1D visual tokenizer", "1-D visual tokenizer", "sequential visual encoding", "1D patch tokenization"],
        "summary": ["1D visual tokenizer", "1-D visual tokenizer", "sequential visual encoding", "1D patch tokenization"],
    },
    "diffusion_visual_encoder": {
        "title": ["diffusion tokenizer", "diffusion image encoder", "diffusion visual encoder", "continuous visual tokenizer"],
        "summary": ["diffusion tokenizer", "diffusion image encoder", "diffusion visual encoder", "continuous visual tokenizer"],
    },
}


def classify_paper(paper: ArxivPaper) -> list[str]:
    """Classify a paper into categories based on title/summary keywords."""
    title_lower = paper.title.lower()
    summary_lower = paper.summary.lower()
    categories = []
    for cat, rules in CATEGORY_RULES.items():
        for kw in rules["title"]:
            if kw.lower() in title_lower:
                categories.append(cat)
                break
        if cat not in categories:
            for kw in rules["summary"]:
                if kw.lower() in summary_lower:
                    categories.append(cat)
                    break
    return categories


def is_excluded(paper: ArxivPaper) -> bool:
    """Check if paper should be excluded (weather etc)."""
    title_lower = paper.title.lower()
    summary_lower = paper.summary.lower()
    for kw in EXCLUDE_KEYWORDS:
        if kw in title_lower or kw in summary_lower:
            return True
    return False


def paper_to_dict(paper: ArxivPaper) -> dict:
    """Convert ArxivPaper to the dict format used by the pipeline."""
    published = paper.published
    # Try to parse and reformat
    try:
        dt = datetime.fromisoformat(published.replace("Z", "+00:00"))
        published_str = dt.strftime("%Y-%m-%d %H:%M:%S")
    except Exception:
        published_str = published

    return {
        "title": paper.title,
        "link": paper.link,
        "summary": paper.summary,
        "authors": paper.authors,
        "published_time_str": published_str,
        "published": published,
        "updated": paper.updated,
        "categories": paper.categories,
        "primary_category": paper.primary_category,
        "arxiv_id": paper.arxiv_id,
        "pdf_url": paper.pdf_url,
        "id": paper.arxiv_id,
    }


def backfill_date(target_date: str) -> dict[str, list[dict]]:
    """Query arXiv for papers on a specific date and classify them."""
    # arXiv uses submitted date; papers submitted on a given day
    # We query by submitted date range
    d = date.fromisoformat(target_date)
    next_day = d + timedelta(days=1)

    print(f"\n{'='*60}")
    print(f"Backfilling: {target_date}")
    print(f"{'='*60}")

    all_papers: dict[str, list[dict]] = {}

    # Search in cs.AI and cs.CV
    for field in ["cs.AI", "cs.CV"]:
        print(f"\n  Querying {field} for {target_date}...")

        # Build query: keywords in title OR abstract, within date range
        keyword_queries = " OR ".join(f'"{kw}"' for kw in KEYWORDS)
        query_str = (
            f'(ti:({keyword_queries}) OR abs:({keyword_queries})) '
            f'AND cat:{field} '
            f'AND submittedDate:[{d.strftime("%Y%m%d")}000000 TO {next_day.strftime("%Y%m%d")}235959]'
        )

        try:
            papers = search_by_keywords(
                KEYWORDS,
                field="all",
                categories=field,
                since=d.strftime("%Y-%m-%d"),
                until=target_date,
                max_results=100,
                sort_by="submitted",
            )
        except Exception as e:
            print(f"    Error querying {field}: {e}")
            continue

        print(f"    Got {len(papers)} raw results from {field}")

        for paper in papers:
            # Verify date
            try:
                pub_date = paper.published[:10]
                if pub_date != target_date:
                    # Also check if it's close enough (arXiv API date filtering isn't perfect)
                    pass
            except Exception:
                pass

            if is_excluded(paper):
                continue

            cats = classify_paper(paper)
            if not cats:
                continue

            item = paper_to_dict(paper)

            for cat in cats:
                if cat not in all_papers:
                    all_papers[cat] = []
                # Avoid duplicates
                if not any(existing["arxiv_id"] == item["arxiv_id"] for existing in all_papers[cat]):
                    all_papers[cat].append(item)

        # Be nice to arXiv API
        time.sleep(3)

    # Print summary
    total = sum(len(items) for items in all_papers.values())
    print(f"\n  Summary for {target_date}: {total} papers across {len(all_papers)} categories")
    for cat, items in sorted(all_papers.items()):
        print(f"    {cat}: {len(items)} papers")

    return all_papers


def write_category_json(target_date: str, categorized: dict[str, list[dict]]):
    """Write categorized papers to JSON files in the same format as the pipeline."""
    crawl_time = datetime.fromisoformat(f"{target_date}T00:05:00")

    for cat, items in categorized.items():
        cat_dir = RAW_BASE / cat
        cat_dir.mkdir(parents=True, exist_ok=True)
        json_path = cat_dir / f"{target_date}.json"

        data = {
            "category": cat,
            "display_name": cat.replace("_", " ").title(),
            "date": target_date,
            "crawl_time": crawl_time.isoformat(),
            "items_count": len(items),
            "items": items,
        }

        json_path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"  Written: {json_path} ({len(items)} items)")


def main():
    print("arxiv-paper-digest backfill for 5/24-5/27")
    print(f"Output directory: {RAW_BASE}")

    grand_total = 0
    for target_date in DATES:
        categorized = backfill_date(target_date)
        if categorized:
            write_category_json(target_date, categorized)
            day_total = sum(len(items) for items in categorized.values())
            grand_total += day_total
            print(f"  ✓ {target_date}: {day_total} papers written")
        else:
            print(f"  ✓ {target_date}: 0 papers (empty day)")
        time.sleep(5)  # Rate limit between dates

    print(f"\n{'='*60}")
    print(f"Backfill complete. Total: {grand_total} papers across {len(DATES)} days")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
