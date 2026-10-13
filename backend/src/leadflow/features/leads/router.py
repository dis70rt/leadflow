from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session

from leadflow.core.database import get_session
from leadflow.core.errors import ERROR_RESPONSES
from leadflow.features.leads.models import LeadStatus
from leadflow.features.leads.schemas import LeadCreate, LeadPage, LeadRead, LeadUpdate
from leadflow.features.leads.service import LeadService
from leadflow.features.search.solr import SolrIndex, get_search_index

router = APIRouter(prefix="/leads", tags=["Leads"], responses=ERROR_RESPONSES)


def get_service(
    session: Annotated[Session, Depends(get_session)],
    search: Annotated[SolrIndex, Depends(get_search_index)],
) -> LeadService:
    return LeadService(session, search)


Service = Annotated[LeadService, Depends(get_service)]


@router.get("", response_model=LeadPage, summary="List and search leads")
def list_leads(
    service: Service,
    status: Annotated[
        list[LeadStatus] | None, Query(description="Repeat parameter to select multiple statuses.")
    ] = None,
    q: Annotated[
        str | None,
        Query(
            min_length=1,
            max_length=200,
            pattern=r"\S",
            description="Search lead details and discussions through Solr.",
        ),
    ] = None,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    offset: Annotated[int, Query(ge=0)] = 0,
):
    """Today's reminders are pinned first in business timezone, then most recent activity.

    Overdue reminders earlier today remain pinned and are marked overdue.
    Search results are eventually consistent and ordered by relevance within unpinned leads.
    """
    return service.list(status or [], q.strip() if q else None, limit, offset)


@router.post("", response_model=LeadRead, status_code=201, summary="Create a new lead")
def create_lead(data: LeadCreate, response: Response, service: Service):
    lead = service.create(data)
    response.headers["Location"] = f"/api/v1/leads/{lead.id}"
    return lead


@router.get("/{lead_id}", response_model=LeadRead, summary="Get a lead")
def get_lead(lead_id: UUID, service: Service):
    return service.get(lead_id)


@router.patch("/{lead_id}", response_model=LeadRead, summary="Update a lead")
def update_lead(lead_id: UUID, data: LeadUpdate, service: Service):
    """Omitted fields are preserved. Won/Lost always clear the active reminder."""
    return service.update(lead_id, data)
