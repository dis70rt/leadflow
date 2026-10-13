from dataclasses import dataclass
from typing import Protocol
from uuid import UUID


@dataclass(frozen=True, slots=True)
class SearchHit:
    lead_id: UUID
    fragments: dict[str, str]


class LeadSearch(Protocol):
    def search(self, query: str) -> list[UUID]: ...


class SuggestionSearch(Protocol):
    def suggest(self, query: str, limit: int) -> list[SearchHit]: ...


class SearchWriter(Protocol):
    def upsert(self, document: dict) -> None: ...
