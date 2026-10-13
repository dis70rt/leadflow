from typing import Annotated, Literal

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session

from leadflow.core.database import get_session
from leadflow.core.errors import ERROR_RESPONSES

router = APIRouter(prefix="/health", tags=["Health"])


class HealthRead(BaseModel):
    status: Literal["ok"] = "ok"


@router.get("/live", response_model=HealthRead, summary="Check process liveness")
def live():
    return HealthRead()


@router.get(
    "/ready",
    response_model=HealthRead,
    responses=ERROR_RESPONSES,
    summary="Check database readiness",
)
def ready(session: Annotated[Session, Depends(get_session)]):
    session.execute(text("SELECT 1"))
    return HealthRead()
