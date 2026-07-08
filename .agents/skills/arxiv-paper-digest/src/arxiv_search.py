"""Direct arXiv keyword search utilities.

This module folds the arxivql-guide patterns into the digest project.
It builds arXiv API query strings, fetches Atom feeds, and returns structured results.
"""
from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime
from typing import Any, Iterable
from urllib.parse import quote_plus
from urllib.request import Request, urlopen

import feedparser


@dataclass(frozen=True)
class ArxivQuery:
    expr: str
    negated: bool = False

    def __str__(self) -> str:
        return self.expr

    def __and__(self, other: "ArxivQuery") -> "ArxivQuery":
        if other.negated:
            return ArxivQuery(f"({self.expr}) ANDNOT ({other.expr})")
        return ArxivQuery(f"({self.expr}) AND ({other.expr})")

    def __or__(self, other: "ArxivQuery") -> "ArxivQuery":
        if other.negated:
            return ArxivQuery(f"({self.expr}) ORNOT ({other.expr})")
        return ArxivQuery(f"({self.expr}) OR ({other.expr})")

    def __invert__(self) -> "ArxivQuery":
        return ArxivQuery(self.expr, not self.negated)


class Query:
    @staticmethod
    def _normalize_terms(term: str | Iterable[str]) -> list[str]:
        if isinstance(term, str):
            return [term]
        return [str(x) for x in term]

    @staticmethod
    def _quote(term: str) -> str:
        term = term.strip()
        if not term:
            return term
        return f'"{term}"' if any(ch.isspace() for ch in term) else term

    @classmethod
    def _field(cls, field: str, term: str | Iterable[str]) -> ArxivQuery:
        terms = cls._normalize_terms(term)
        expr_terms = " ".join(cls._quote(t) for t in terms)
        if len(terms) > 1:
            return ArxivQuery(f"{field}:({expr_terms})")
        return ArxivQuery(f"{field}:{expr_terms}")

    @classmethod
    def title(cls, term: str | Iterable[str]) -> ArxivQuery:
        return cls._field("ti", term)

    @classmethod
    def abstract(cls, term: str | Iterable[str]) -> ArxivQuery:
        return cls._field("abs", term)

    @classmethod
    def author(cls, term: str | Iterable[str]) -> ArxivQuery:
        return cls._field("au", term)

    @classmethod
    def category(cls, term: str | Iterable[str]) -> ArxivQuery:
        return cls._field("cat", term)

    @classmethod
    def all(cls, term: str | Iterable[str]) -> ArxivQuery:
        return cls._field("all", term)

    @classmethod
    def journal(cls, term: str | Iterable[str]) -> ArxivQuery:
        return cls._field("jr", term)

    @classmethod
    def submitted_date(cls, start: str | date | datetime | None = None, end: str | date | datetime | None = None) -> ArxivQuery:
        start_s = _format_ymd(start) if start else "00000000"
        end_s = _format_ymd(end) if end else "99991231235959"
        if len(start_s) == 8:
            start_s += "000000"
        if len(end_s) == 8:
            end_s += "235959"
        return ArxivQuery(f"submittedDate:[{start_s} TO {end_s}]")

    @classmethod
    def id(cls, term: str | Iterable[str]) -> ArxivQuery:
        return cls._field("id", term)


class Taxonomy:
    cs = "cs.*"
    stat = "stat.*"
    eess = "eess.*"
    math = "math.*"
    physics = "physics.*"
    econ = "econ.*"


@dataclass(frozen=True)
class ArxivPaper:
    title: str
    link: str
    summary: str
    authors: list[str]
    published: str
    updated: str
    categories: list[str]
    primary_category: str
    arxiv_id: str
    pdf_url: str

    @classmethod
    def from_feed_entry(cls, entry: Any) -> "ArxivPaper":
        authors = [getattr(a, "name", str(a)) for a in getattr(entry, "authors", [])]
        categories = [tag.get("term", "") for tag in getattr(entry, "tags", []) if tag.get("term")]
        links = getattr(entry, "links", [])
        pdf_url = next((l.get("href", "") for l in links if l.get("title") == "pdf"), "")
        if not pdf_url and getattr(entry, "link", ""):
            pdf_url = getattr(entry, "link")
        return cls(
            title=getattr(entry, "title", ""),
            link=getattr(entry, "link", ""),
            summary=getattr(entry, "summary", ""),
            authors=authors,
            published=str(getattr(entry, "published", "")),
            updated=str(getattr(entry, "updated", "")),
            categories=categories,
            primary_category=getattr(entry, "arxiv_primary_category", {}).get("term", categories[0] if categories else ""),
            arxiv_id=getattr(entry, "id", ""),
            pdf_url=pdf_url,
        )

    def to_dict(self) -> dict[str, Any]:
        return {
            "title": self.title,
            "link": self.link,
            "summary": self.summary,
            "authors": self.authors,
            "published": self.published,
            "updated": self.updated,
            "categories": self.categories,
            "primary_category": self.primary_category,
            "arxiv_id": self.arxiv_id,
            "pdf_url": self.pdf_url,
        }


def build_query(
    keywords: str | Iterable[str],
    *,
    field: str = "all",
    categories: str | Iterable[str] | None = None,
    exclude: str | Iterable[str] | None = None,
    authors: str | Iterable[str] | None = None,
    since: str | date | datetime | None = None,
    until: str | date | datetime | None = None,
) -> ArxivQuery:
    term_query = getattr(Query, field)(keywords)
    parts: list[ArxivQuery] = [term_query]
    if categories:
        parts.append(Query.category(categories))
    if authors:
        parts.append(Query.author(authors))
    if since or until:
        parts.append(Query.submitted_date(since, until))
    if exclude:
        exclude_q = getattr(Query, field)(exclude)
        parts.append(~exclude_q)
    query = parts[0]
    for part in parts[1:]:
        if part.negated:
            query = ArxivQuery(f"({query}) ANDNOT ({part.expr})")
        else:
            query = query & part
    return query


def search_arxiv(
    query: ArxivQuery | str,
    *,
    max_results: int = 10,
    sort_by: str = "relevance",
) -> list[ArxivPaper]:
    sort_by_map = {
        "relevance": "relevance",
        "submitted": "submittedDate",
        "updated": "lastUpdatedDate",
    }
    query_str = str(query)
    url = (
        "https://export.arxiv.org/api/query?"
        f"search_query={quote_plus(query_str)}"
        f"&start=0&max_results={max_results}"
        f"&sortBy={sort_by_map.get(sort_by, 'relevance')}"
        "&sortOrder=descending"
    )
    req = Request(url, headers={"User-Agent": "arxiv-paper-digest/0.1 (mailto:zhengxinyu@example.com)"})
    with urlopen(req, timeout=30) as response:
        status = getattr(response, "status", 200)
        body = response.read()
    if status != 200:
        raise RuntimeError(f"arXiv API returned HTTP {status}: {body[:200]!r}")
    feed = feedparser.parse(body)
    if getattr(feed, "bozo", False):
        raise RuntimeError(f"arXiv API response parse failed: {feed.bozo_exception}")
    return [ArxivPaper.from_feed_entry(entry) for entry in getattr(feed, "entries", [])]


def search_by_keywords(
    keywords: str | Iterable[str],
    *,
    field: str = "all",
    categories: str | Iterable[str] | None = None,
    exclude: str | Iterable[str] | None = None,
    authors: str | Iterable[str] | None = None,
    since: str | date | datetime | None = None,
    until: str | date | datetime | None = None,
    max_results: int = 10,
    sort_by: str = "relevance",
) -> list[ArxivPaper]:
    query = build_query(
        keywords,
        field=field,
        categories=categories,
        exclude=exclude,
        authors=authors,
        since=since,
        until=until,
    )
    return search_arxiv(query, max_results=max_results, sort_by=sort_by)


def _format_ymd(value: str | date | datetime | None) -> str:
    if value is None:
        return ""
    if isinstance(value, str):
        return value.replace("-", "")
    if isinstance(value, datetime):
        return value.strftime("%Y%m%d")
    return value.strftime("%Y%m%d")


__all__ = ["Query", "Taxonomy", "ArxivPaper", "build_query", "search_arxiv", "search_by_keywords"]
