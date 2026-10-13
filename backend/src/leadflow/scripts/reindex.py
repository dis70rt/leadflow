from sqlalchemy import select

from leadflow.core.database import SessionFactory
from leadflow.features.leads.models import Lead
from leadflow.features.search.models import IndexEvent


def main() -> None:
    with SessionFactory.begin() as session:
        for lead_id in session.scalars(select(Lead.id).execution_options(yield_per=500)):
            session.add(IndexEvent(lead_id=lead_id))
    print("Reindex events queued; the worker will rebuild all lead documents.")


if __name__ == "__main__":
    main()
