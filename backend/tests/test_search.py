from uuid import UUID, uuid4

import httpx
import pytest
from sqlalchemy import select
from sqlalchemy.orm import Session

from leadflow.core.errors import AppError
from leadflow.features.search.models import IndexEvent
from leadflow.features.search.solr import SolrIndex
from leadflow.features.search.worker import IndexWorker


def test_worker_indexes_discussions(client, database, search):
    lead = client.post("/api/v1/leads", json={"name": "Sarah"}).json()
    client.post(f"/api/v1/leads/{lead['id']}/discussions", json={"note": "Unicorn pricing"})
    with Session(database) as session:
        worker = IndexWorker(search)
        assert worker.process_one(session)
        assert worker.process_one(session)
        assert not worker.process_one(session)
    assert search.documents[-1]["discussions_txt"] == ["Unicorn pricing"]


def test_worker_retries(client, database, search):
    client.post("/api/v1/leads", json={"name": "Sarah"})

    def fail(document):
        raise httpx.ConnectError("Offline")

    search.upsert = fail
    with Session(database) as session:
        assert IndexWorker(search).process_one(session)
        event = session.scalar(select(IndexEvent))
        assert event.attempts == 1
        assert event.last_error == "ConnectError"
        assert not IndexWorker(search).process_one(session)


def test_solr_query_and_failure(monkeypatch):
    identifier = uuid4()
    original_client = httpx.Client

    def handler(request):
        assert request.url.params["uf"] == "-*"
        assert request.url.params["q"] == r"name\:Sarah"
        return httpx.Response(
            200, json={"response": {"numFound": 1, "docs": [{"id": str(identifier)}]}}
        )

    monkeypatch.setattr(
        httpx, "Client", lambda **kwargs: original_client(transport=httpx.MockTransport(handler))
    )
    assert SolrIndex("http://solr/leads").search("name:Sarah") == [UUID(str(identifier))]

    def offline(request):
        raise httpx.ConnectError("Offline")

    monkeypatch.setattr(
        httpx, "Client", lambda **kwargs: original_client(transport=httpx.MockTransport(offline))
    )
    with pytest.raises(AppError) as caught:
        SolrIndex("http://solr/leads").search("Sarah")
    assert caught.value.status == 503
