from datetime import datetime
from uuid import UUID

from sqlalchemy import case, func, select
from sqlalchemy.orm import Session

from leadflow.core.errors import AppError
from leadflow.features.leads.models import Lead, LeadStatus


class LeadRepository:
    def __init__(self, session: Session):
        self.session = session

    def get(self, lead_id: UUID, *, lock: bool = False) -> Lead:
        statement = select(Lead).where(Lead.id == lead_id)
        if lock:
            statement = statement.with_for_update()
        lead = self.session.scalar(statement.execution_options(populate_existing=True))
        if lead is None:
            raise AppError(404, "lead_not_found", "Lead does not exist")
        return lead

    def list(
        self,
        statuses: list[LeadStatus],
        ids: list[UUID] | None,
        start: datetime,
        end: datetime,
        limit: int,
        offset: int,
    ) -> tuple[list[Lead], int]:
        conditions = []
        if statuses:
            conditions.append(Lead.status.in_(statuses))
        if ids is not None:
            conditions.append(Lead.id.in_(ids))
        today = (Lead.follow_up_at >= start) & (Lead.follow_up_at < end)
        ordering = [case((today, 0), else_=1), case((today, Lead.follow_up_at), else_=None).asc()]
        if ids:
            ordering.append(case({value: rank for rank, value in enumerate(ids)}, value=Lead.id))
        ordering.extend([Lead.updated_at.desc(), Lead.id.desc()])
        statement = select(Lead).where(*conditions).order_by(*ordering).limit(limit).offset(offset)
        total = self.session.scalar(select(func.count()).select_from(Lead).where(*conditions))
        return list(self.session.scalars(statement)), total or 0
