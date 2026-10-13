from uuid import UUID

import httpx

from leadflow.core.config import get_settings
from leadflow.core.errors import AppError
from leadflow.features.search.interfaces import SearchHit
from leadflow.features.search.query import FIELDS, build_query


class SolrIndex:
    def __init__(self, url: str):
        self.url = url.rstrip("/")

    def _select(self, params: dict) -> dict:
        try:
            with httpx.Client(timeout=10) as client:
                result = client.get(
                    f"{self.url}/select",
                    params={
                        "defType": "lucene",
                        "fl": "id",
                        "wt": "json",
                        **params,
                    },
                )
                result.raise_for_status()
                return result.json()
        except (httpx.HTTPError, ValueError) as exc:
            raise AppError(503, "search_unavailable", "Search temporarily unavailable") from exc

    def search(self, query: str) -> list[UUID]:
        parsed = build_query(query)
        if not parsed:
            return []
        try:
            payload = self._select({"q": parsed, "rows": 10001})["response"]
            if payload["numFound"] > 10000:
                raise AppError(422, "search_too_broad", "Refine search to fewer than 10000 matches")
            return [UUID(doc["id"]) for doc in payload["docs"]]
        except (KeyError, ValueError, TypeError) as exc:
            raise AppError(503, "search_unavailable", "Invalid search response") from exc

    def suggest(self, query: str, limit: int) -> list[SearchHit]:
        parsed = build_query(query)
        if not parsed:
            return []
        payload = self._select(
            {
                "q": parsed,
                "rows": limit,
                "hl": "true",
                "hl.method": "unified",
                "hl.fl": ",".join(FIELDS),
                "hl.snippets": 1,
                "hl.fragsize": 160,
                "hl.tag.pre": "\ue000",
                "hl.tag.post": "\ue001",
                "hl.highlightMultiTerm": "true",
                "hl.requireFieldMatch": "true",
                "hl.maxAnalyzedChars": 1000000,
            }
        )
        try:
            highlights = payload.get("highlighting", {})
            return [
                SearchHit(
                    UUID(doc["id"]),
                    {
                        field: next(fragment for fragment in snippets if fragment)
                        for field, snippets in highlights.get(doc["id"], {}).items()
                        if field in FIELDS and any(snippets)
                    },
                )
                for doc in payload["response"]["docs"]
            ]
        except (KeyError, ValueError, TypeError, IndexError) as exc:
            raise AppError(503, "search_unavailable", "Invalid search response") from exc

    def upsert(self, document: dict) -> None:
        with httpx.Client(timeout=10) as client:
            result = client.post(f"{self.url}/update", params={"commit": "true"}, json=[document])
            result.raise_for_status()


def get_search_index() -> SolrIndex:
    return SolrIndex(get_settings().solr_url)
