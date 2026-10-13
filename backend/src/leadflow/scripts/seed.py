from datetime import timedelta
from uuid import NAMESPACE_URL, uuid5

from sqlalchemy import text

from leadflow.core.config import get_settings
from leadflow.core.database import SessionFactory, utcnow
from leadflow.features.discussions.models import Discussion
from leadflow.features.leads.models import Lead, LeadStatus
from leadflow.features.leads.presentation import today_bounds
from leadflow.features.search.models import IndexEvent

SEEDS = [
    ("Sarah Connor", "Acme Corp", LeadStatus.PROPOSAL_SENT, "Sent pricing PDF for review."),
    ("Hank Scorpio", "Globex", LeadStatus.NEW, "Inbound website inquiry."),
    ("Bill Lumbergh", "Initech", LeadStatus.CONTACTED, "Left voicemail with assistant."),
    ("Bruce Wayne", "Wayne Enterprises", LeadStatus.WON, "Contract signed."),
    ("Ellen Ripley", "Weyland", LeadStatus.QUALIFIED, "Interested in team onboarding."),
    ("Tony Stark", "Stark Industries", LeadStatus.LOST, "Selected another vendor."),
]


def seed() -> int:
    count = 0
    now = utcnow()
    start, _ = today_bounds()
    with SessionFactory.begin() as session:
        session.execute(text("SELECT pg_advisory_xact_lock(49201831)"))
        for index, (name, company, status, note) in enumerate(SEEDS):
            identifier = uuid5(NAMESPACE_URL, f"leadflow/demo/{index}")
            if session.get(Lead, identifier):
                continue
            follow_up = {
                0: start + timedelta(hours=14),
                1: now + timedelta(days=2),
                2: start - timedelta(days=1),
            }.get(index)
            latest = now - timedelta(hours=index + 1)
            lead = Lead(
                id=identifier,
                name=name,
                company=company,
                phone=f"555-01{index:02}",
                status=status,
                follow_up_at=follow_up,
                last_note=note,
                last_discussion_at=latest,
                created_at=now - timedelta(days=7),
                updated_at=latest,
            )
            session.add(lead)
            session.flush()
            session.add_all(
                [
                    Discussion(
                        lead_id=identifier,
                        note="Initial discovery call.",
                        created_at=now - timedelta(days=5),
                    ),
                    Discussion(
                        lead_id=identifier, note=note, follow_up_at=follow_up, created_at=latest
                    ),
                    IndexEvent(lead_id=identifier),
                ]
            )
            count += 1
    return count


if __name__ == "__main__":
    print(f"Created {seed()} demo leads" if get_settings().seed_demo else "Demo seed disabled")
