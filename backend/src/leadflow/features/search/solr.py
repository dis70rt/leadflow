import re
from uuid import UUID

import httpx

from leadflow.core.config import get_settings
from leadflow.core.errors import AppError


class SolrIndex:
    def __init__(self, url: str):
        self.url = url.rstrip("/")

    def search(self, query: str) -> list[UUID]:
        try:
            with httpx.Client(timeout=10) as client:
                result = client.get(
                    f"{self.url}/select",
                    params={
                        "q": re.sub(r'([+\-!(){}\[\]^"~*?:\\/|&])', r"\\\1", query),
                        "defType": "edismax",
                        "qf": "name_txt^4 company_txt^2 phone_txt discussions_txt",
                        "uf": "-*",
                        "fl": "id",
                        "rows": 10001,
                        "wt": "json",
                    },
                )
                result.raise_for_status()
                payload = result.json()["response"]
                if payload["numFound"] > 10000:
                    raise AppError(
                        422, "search_too_broad", "Refine search to fewer than 10000 matches"
                    )
                return [UUID(doc["id"]) for doc in payload["docs"]]
        except (httpx.HTTPError, ValueError, KeyError) as exc:
            raise AppError(503, "search_unavailable", "Search temporarily unavailable") from exc

    def upsert(self, document: dict) -> None:
        with httpx.Client(timeout=10) as client:
            result = client.post(f"{self.url}/update", params={"commit": "true"}, json=[document])
            result.raise_for_status()


def get_search_index() -> SolrIndex:
    return SolrIndex(get_settings().solr_url)
