from datetime import datetime
from enum import StrEnum
from uuid import UUID

from pydantic import AwareDatetime, BaseModel, ConfigDict, Field, field_validator

from leadflow.features.leads.models import LeadStatus


class LeadCreate(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)
    name: str = Field(min_length=1, max_length=200, examples=["Sarah Connor"])
    company: str | None = Field(default=None, max_length=200, examples=["Acme Corp"])
    phone: str | None = Field(default=None, max_length=40, examples=["555-0199"])


class LeadUpdate(LeadCreate):
    name: str | None = Field(default=None, min_length=1, max_length=200)
    status: LeadStatus | None = None
    follow_up_at: AwareDatetime | None = Field(
        default=None, description="Omit to preserve the reminder; null clears it."
    )

    @field_validator("name", "status")
    @classmethod
    def non_nullable_fields(cls, value):
        if value is None:
            raise ValueError("This field cannot be null")
        return value


class FollowUpState(StrEnum):
    NONE = "none"
    OVERDUE = "overdue"
    TODAY = "today"
    UPCOMING = "upcoming"


class LeadRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    name: str
    company: str | None
    phone: str | None
    status: LeadStatus
    follow_up_at: datetime | None
    follow_up_state: FollowUpState = FollowUpState.NONE
    last_note: str | None
    last_discussion_at: datetime | None
    created_at: datetime
    updated_at: datetime


class LeadPage(BaseModel):
    items: list[LeadRead]
    total: int
    limit: int
    offset: int
