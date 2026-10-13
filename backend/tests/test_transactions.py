import pytest
from sqlalchemy import event, func, select
from sqlalchemy.orm import Session

from leadflow.core.errors import AppError
from leadflow.features.discussions.models import Discussion
from leadflow.features.leads.models import Lead
from leadflow.features.search.models import IndexEvent


def test_failed_outbox_write_rolls_back_discussion_and_summary(client, database):
    identifier = client.post("/api/v1/leads", json={"name": "Atomic"}).json()["id"]
    path = f"/api/v1/leads/{identifier}"

    def fail_outbox(mapper, connection, target):
        raise RuntimeError("Simulated outbox failure")

    event.listen(IndexEvent, "before_insert", fail_outbox)
    try:
        with pytest.raises(RuntimeError, match="Simulated outbox failure"):
            client.post(path + "/discussions", json={"note": "Must roll back"})
    finally:
        event.remove(IndexEvent, "before_insert", fail_outbox)

    with Session(database) as session:
        assert session.scalar(select(func.count()).select_from(Discussion)) == 0
        assert session.scalar(select(Lead.last_note)) is None
        assert session.scalar(select(func.count()).select_from(IndexEvent)) == 1


def test_search_outage_does_not_prevent_writes(client, search):
    def offline(query):
        raise AppError(503, "search_unavailable", "Search temporarily unavailable")

    search.search = offline
    assert client.post("/api/v1/leads", json={"name": "Still saved"}).status_code == 201
    assert client.get("/api/v1/leads").json()["total"] == 1
    response = client.get("/api/v1/leads?q=pricing")
    assert response.status_code == 503
    assert response.json()["error"]["code"] == "search_unavailable"
