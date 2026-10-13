from uuid import UUID

from sqlalchemy.orm import Session

from leadflow.core.database import utcnow
from leadflow.core.errors import AppError
from leadflow.features.discussions.cursor import encode_cursor
from leadflow.features.discussions.models import Discussion
from leadflow.features.discussions.repository import DiscussionRepository
from leadflow.features.discussions.schemas import DiscussionCreate, DiscussionPage, DiscussionSaved
from leadflow.features.leads.models import LeadStatus
from leadflow.features.leads.presentation import present_lead
from leadflow.features.leads.repository import LeadRepository
from leadflow.features.search.models import IndexEvent


class DiscussionService:
    def __init__(self, session: Session):
        self.session = session
        self.leads = LeadRepository(session)
        self.discussions = DiscussionRepository(session)

    def list(self, lead_id: UUID, limit: int, cursor: str | None) -> DiscussionPage:
        self.leads.get(lead_id)
        rows = self.discussions.page(lead_id, limit, cursor)
        items = rows[:limit]
        next_cursor = (
            encode_cursor(items[-1].created_at, items[-1].id) if len(rows) > limit else None
        )
        return DiscussionPage(items=items, next_cursor=next_cursor)

    def create(self, lead_id: UUID, data: DiscussionCreate) -> DiscussionSaved:
        lead = self.leads.get(lead_id, lock=True)
        if data.follow_up_at and lead.status in (LeadStatus.WON, LeadStatus.LOST):
            raise AppError(422, "closed_lead_reminder", "Reopen lead before scheduling a reminder")
        now = utcnow()
        discussion = Discussion(lead_id=lead_id, **data.model_dump(), created_at=now)
        self.session.add(discussion)
        lead.last_note, lead.last_discussion_at, lead.updated_at = data.note, now, now
        if data.follow_up_at is not None:
            lead.follow_up_at = data.follow_up_at
        self.session.add(IndexEvent(lead_id=lead_id))
        self.session.commit()
        return DiscussionSaved(discussion=discussion, lead=present_lead(lead))
