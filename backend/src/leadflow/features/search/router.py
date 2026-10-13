from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from leadflow.core.database import get_session
from leadflow.core.errors import ERROR_RESPONSES
from leadflow.features.search.schemas import SuggestionsRead
from leadflow.features.search.service import SuggestionsService
from leadflow.features.search.solr import SolrIndex, get_search_index

router = APIRouter(prefix="/leads", tags=["Search"], responses=ERROR_RESPONSES)


@router.get("/suggestions", response_model=SuggestionsRead, summary="Suggest leads and discussions")
def suggestions(
    session: Annotated[Session, Depends(get_session)],
    search: Annotated[SolrIndex, Depends(get_search_index)],
    q: Annotated[
        str,
        Query(
            min_length=2,
            max_length=200,
            pattern=r"\S",
            description="Prefix and typo-tolerant search across all lead stages.",
        ),
    ],
    limit: Annotated[int, Query(ge=1, le=10)] = 5,
):
    """Search names, companies, phones, and the full indexed discussion history.

    All words must match across the searchable fields. The last word supports prefix matching.
    Words of 4–6 characters allow one edit; longer words allow two. Exact matches rank higher.
    Discussion excerpts are preferred when available. Indexing is eventually consistent.
    """
    return SuggestionsService(session, search).suggest(q, limit)
