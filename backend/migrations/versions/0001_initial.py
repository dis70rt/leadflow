"""Create leads, discussion history, and transactional search outbox."""

import sqlalchemy as sa
from alembic import op

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "leads",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("company", sa.String(200)),
        sa.Column("phone", sa.String(40)),
        sa.Column(
            "status",
            sa.Enum(
                "new",
                "contacted",
                "qualified",
                "proposal_sent",
                "won",
                "lost",
                native_enum=False,
                create_constraint=True,
                name="leadstatus",
            ),
            nullable=False,
        ),
        sa.Column("follow_up_at", sa.DateTime(timezone=True)),
        sa.Column("last_note", sa.Text()),
        sa.Column("last_discussion_at", sa.DateTime(timezone=True)),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint("length(trim(name)) > 0", name="lead_name_nonempty"),
    )
    for column in ("status", "follow_up_at", "updated_at"):
        op.create_index(f"ix_leads_{column}", "leads", [column])
    op.create_table(
        "discussions",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column(
            "lead_id", sa.Uuid(), sa.ForeignKey("leads.id", ondelete="CASCADE"), nullable=False
        ),
        sa.Column("note", sa.Text(), nullable=False),
        sa.Column("follow_up_at", sa.DateTime(timezone=True)),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint("length(trim(note)) > 0", name="discussion_note_nonempty"),
    )
    op.create_index("discussion_timeline", "discussions", ["lead_id", "created_at", "id"])
    op.create_table(
        "index_events",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column(
            "lead_id", sa.Uuid(), sa.ForeignKey("leads.id", ondelete="CASCADE"), nullable=False
        ),
        sa.Column("attempts", sa.Integer(), nullable=False),
        sa.Column("available_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("last_error", sa.String(500)),
    )
    for column in ("lead_id", "available_at"):
        op.create_index(f"ix_index_events_{column}", "index_events", [column])


def downgrade() -> None:
    op.drop_table("index_events")
    op.drop_table("discussions")
    op.drop_table("leads")
