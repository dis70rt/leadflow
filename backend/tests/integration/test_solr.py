from uuid import UUID, uuid4

import httpx

from leadflow.features.search.solr import get_search_index
from leadflow.features.search.worker import IndexWorker


def test_search_finds_discussion_text(postgres_client, postgres, solr):
    from sqlalchemy.orm import Session

    client = postgres_client
    token = f"discovery{uuid4().hex}"
    identifier = client.post("/api/v1/leads", json={"name": "Search lead"}).json()["id"]
    client.post(f"/api/v1/leads/{identifier}/discussions", json={"note": token})
    try:
        with Session(postgres[0]) as session:
            worker = IndexWorker(solr)
            while worker.process_one(session):
                pass
        assert UUID(identifier) in solr.search(token)
        client.app.dependency_overrides[get_search_index] = lambda: solr
        response = client.get("/api/v1/leads", params={"q": token, "status": "new"})
        assert response.status_code == 200
        assert response.json()["total"] == 1
        assert response.json()["items"][0]["id"] == identifier
        assert response.json()["items"][0]["last_note"] == token
    finally:
        response = httpx.post(
            f"{solr.url}/update",
            params={"commit": "true"},
            json={"delete": {"id": identifier}},
            timeout=10,
        )
        response.raise_for_status()
