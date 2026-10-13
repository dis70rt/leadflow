from typing import Protocol
from uuid import UUID


class SearchIndex(Protocol):
    def search(self, query: str) -> list[UUID]: ...
    def upsert(self, document: dict) -> None: ...
