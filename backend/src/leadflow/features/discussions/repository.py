from uuid import UUID

from sqlalchemy import select, tuple_
from sqlalchemy.orm import Session

from leadflow.features.discussions.cursor import decode_cursor
from leadflow.features.discussions.models import Discussion


class DiscussionRepository:
    def __init__(self, session: Session):
        self.session = session

    def page(self, lead_id: UUID, limit: int, cursor: str | None) -> list[Discussion]:
        statement = select(Discussion).where(Discussion.lead_id == lead_id)
        if cursor:
            statement = statement.where(
                tuple_(Discussion.created_at, Discussion.id) < tuple_(*decode_cursor(cursor))
            )
        return list(
            self.session.scalars(
                statement.order_by(Discussion.created_at.desc(), Discussion.id.desc()).limit(
                    limit + 1
                )
            )
        )
