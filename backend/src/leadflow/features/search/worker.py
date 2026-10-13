import logging
import time
from datetime import timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from leadflow.core.database import SessionFactory, utcnow
from leadflow.features.discussions.models import Discussion
from leadflow.features.leads.models import Lead
from leadflow.features.search.interfaces import SearchIndex
from leadflow.features.search.models import IndexEvent
from leadflow.features.search.solr import get_search_index

logger = logging.getLogger(__name__)


def build_document(session: Session, lead: Lead) -> dict:
    notes = session.scalars(select(Discussion.note).where(Discussion.lead_id == lead.id))
    return {
        "id": str(lead.id),
        "name_txt": lead.name,
        "company_txt": lead.company or "",
        "phone_txt": lead.phone or "",
        "discussions_txt": list(notes),
    }


class IndexWorker:
    def __init__(self, search: SearchIndex):
        self.search = search

    def process_one(self, session: Session) -> bool:
        event = session.scalar(
            select(IndexEvent)
            .where(IndexEvent.available_at <= utcnow())
            .order_by(IndexEvent.available_at, IndexEvent.id)
            .with_for_update(skip_locked=True)
            .limit(1)
        )
        if event is None:
            return False
        # Serialize indexing per lead so concurrent workers cannot overwrite newer content.
        lead = session.scalar(select(Lead).where(Lead.id == event.lead_id).with_for_update())
        try:
            if lead:
                self.search.upsert(build_document(session, lead))
            session.delete(event)
        except Exception as exc:
            event.attempts += 1
            event.last_error = type(exc).__name__
            event.available_at = utcnow() + timedelta(seconds=min(300, 2 ** min(event.attempts, 9)))
            logger.warning("Index event %s failed: %s", event.id, type(exc).__name__)
        session.commit()
        return True


def main() -> None:
    logging.basicConfig(level=logging.INFO)
    worker = IndexWorker(get_search_index())
    while True:
        try:
            with SessionFactory() as session:
                processed = worker.process_one(session)
            if not processed:
                time.sleep(1)
        except Exception:
            logger.exception("Index worker iteration failed")
            time.sleep(5)


if __name__ == "__main__":
    main()
