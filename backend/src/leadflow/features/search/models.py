from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from leadflow.core.database import Base, utcnow


class IndexEvent(Base):
    __tablename__ = "index_events"
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    lead_id: Mapped[UUID] = mapped_column(ForeignKey("leads.id", ondelete="CASCADE"), index=True)
    attempts: Mapped[int] = mapped_column(default=0)
    available_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, index=True
    )
    last_error: Mapped[str | None] = mapped_column(String(500))
