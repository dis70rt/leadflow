from uuid import UUID

from sqlalchemy.orm import Session

from leadflow.core.database import utcnow
from leadflow.features.leads.models import Lead, LeadStatus
from leadflow.features.leads.presentation import present_lead, today_bounds
from leadflow.features.leads.repository import LeadRepository
from leadflow.features.leads.schemas import LeadCreate, LeadPage, LeadRead, LeadUpdate
from leadflow.features.search.interfaces import SearchIndex
from leadflow.features.search.models import IndexEvent


class LeadService:
    def __init__(self, session: Session, search: SearchIndex):
        self.session = session
        self.repository = LeadRepository(session)
        self.search = search

    def list(
        self, statuses: list[LeadStatus], query: str | None, limit: int, offset: int
    ) -> LeadPage:
        ids = self.search.search(query) if query else None
        leads, total = self.repository.list(statuses, ids, *today_bounds(), limit, offset)
        return LeadPage(
            items=[present_lead(lead) for lead in leads], total=total, limit=limit, offset=offset
        )

    def get(self, lead_id: UUID) -> LeadRead:
        return present_lead(self.repository.get(lead_id))

    def create(self, data: LeadCreate) -> LeadRead:
        lead = Lead(**data.model_dump())
        self.session.add(lead)
        self.session.flush()
        self.session.add(IndexEvent(lead_id=lead.id))
        self.session.commit()
        return present_lead(lead)

    def update(self, lead_id: UUID, data: LeadUpdate) -> LeadRead:
        lead = self.repository.get(lead_id, lock=True)
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(lead, key, value)
        if lead.status in (LeadStatus.WON, LeadStatus.LOST):
            lead.follow_up_at = None
        lead.updated_at = utcnow()
        self.session.add(IndexEvent(lead_id=lead.id))
        self.session.commit()
        return present_lead(lead)
