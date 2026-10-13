from sqlalchemy import select
from sqlalchemy.orm import Session

from leadflow.features.leads.models import Lead
from leadflow.features.search.interfaces import SuggestionSearch
from leadflow.features.search.schemas import LeadSuggestion, SuggestionsRead

MATCH_FIELDS = {
    "discussions_txt": "discussion",
    "name_txt": "name",
    "company_txt": "company",
    "phone_txt": "phone",
}


class SuggestionsService:
    def __init__(self, session: Session, search: SuggestionSearch):
        self.session, self.search = session, search

    def suggest(self, query: str, limit: int) -> SuggestionsRead:
        if len(query.strip()) < 2:
            return SuggestionsRead(items=[])
        hits = self.search.suggest(query.strip(), limit)
        leads = {
            lead.id: lead
            for lead in self.session.scalars(
                select(Lead).where(Lead.id.in_([hit.lead_id for hit in hits]))
            )
        }
        items = []
        for hit in hits:
            if (lead := leads.get(hit.lead_id)) is None:
                continue
            field = next((field for field in MATCH_FIELDS if hit.fragments.get(field)), None)
            items.append(
                LeadSuggestion(
                    id=lead.id,
                    name=lead.name,
                    company=lead.company,
                    phone=lead.phone,
                    status=lead.status,
                    match_field=MATCH_FIELDS.get(field),
                    snippet=hit.fragments.get(field),
                )
            )
        return SuggestionsRead(items=items)
