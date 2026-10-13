from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field

from leadflow.features.leads.models import LeadStatus


class LeadSuggestion(BaseModel):
    id: UUID
    name: str
    company: str | None
    phone: str | None
    status: LeadStatus
    match_field: Literal["discussion", "name", "company", "phone"] | None
    snippet: str | None = Field(
        description=(
            "Plain text excerpt. U+E000 and U+E001 delimit matched text; never render as HTML."
        )
    )


class SuggestionsRead(BaseModel):
    items: list[LeadSuggestion]
