from datetime import datetime
from enum import StrEnum
from uuid import UUID, uuid4

from sqlalchemy import CheckConstraint, DateTime, Enum, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from leadflow.core.database import Base, utcnow


class LeadStatus(StrEnum):
    NEW = "new"
    CONTACTED = "contacted"
    QUALIFIED = "qualified"
    PROPOSAL_SENT = "proposal_sent"
    WON = "won"
    LOST = "lost"


class Lead(Base):
    __tablename__ = "leads"
    __table_args__ = (CheckConstraint("length(trim(name)) > 0", name="lead_name_nonempty"),)
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    name: Mapped[str] = mapped_column(String(200))
    company: Mapped[str | None] = mapped_column(String(200))
    phone: Mapped[str | None] = mapped_column(String(40))
    status: Mapped[LeadStatus] = mapped_column(
        Enum(
            LeadStatus,
            native_enum=False,
            create_constraint=True,
            values_callable=lambda enum: [item.value for item in enum],
        ),
        default=LeadStatus.NEW,
        index=True,
    )
    follow_up_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), index=True)
    last_note: Mapped[str | None] = mapped_column(Text)
    last_discussion_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, index=True
    )
