from datetime import datetime
from uuid import UUID

from pydantic import AwareDatetime, BaseModel, ConfigDict, Field

from leadflow.features.leads.schemas import LeadRead


class DiscussionCreate(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)
    note: str = Field(min_length=1, max_length=10000, examples=["Discussed pricing options."])
    follow_up_at: AwareDatetime | None = Field(
        default=None,
        description="Timezone-aware reminder. Omitted or null preserves current reminder.",
    )


class DiscussionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    lead_id: UUID
    note: str
    follow_up_at: datetime | None
    created_at: datetime


class DiscussionPage(BaseModel):
    items: list[DiscussionRead]
    next_cursor: str | None


class DiscussionSaved(BaseModel):
    discussion: DiscussionRead
    lead: LeadRead
