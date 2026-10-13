from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Index, Text
from sqlalchemy.orm import Mapped, mapped_column

from leadflow.core.database import Base, utcnow


class Discussion(Base):
    __tablename__ = "discussions"
    __table_args__ = (
        Index("discussion_timeline", "lead_id", "created_at", "id"),
        CheckConstraint("length(trim(note)) > 0", name="discussion_note_nonempty"),
    )
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    lead_id: Mapped[UUID] = mapped_column(ForeignKey("leads.id", ondelete="CASCADE"))
    note: Mapped[str] = mapped_column(Text)
    follow_up_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
