from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from leadflow.core.database import get_session
from leadflow.core.errors import ERROR_RESPONSES
from leadflow.features.discussions.schemas import DiscussionCreate, DiscussionPage, DiscussionSaved
from leadflow.features.discussions.service import DiscussionService

router = APIRouter(
    prefix="/leads/{lead_id}/discussions", tags=["Discussions"], responses=ERROR_RESPONSES
)


def get_service(session: Annotated[Session, Depends(get_session)]) -> DiscussionService:
    return DiscussionService(session)


Service = Annotated[DiscussionService, Depends(get_service)]


@router.get("", response_model=DiscussionPage, summary="Get discussion timeline")
def list_discussions(
    lead_id: UUID,
    service: Service,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    cursor: Annotated[str | None, Query(max_length=500)] = None,
):
    """Newest first. Pass next_cursor to retrieve the next page."""
    return service.list(lead_id, limit, cursor)


@router.post("", response_model=DiscussionSaved, status_code=201, summary="Log a discussion")
def create_discussion(lead_id: UUID, data: DiscussionCreate, service: Service):
    """Atomically saves discussion and lead summary. A supplied reminder replaces the current one.

    Without a reminder, the current reminder is preserved. Closed leads cannot receive reminders.
    """
    return service.create(lead_id, data)
