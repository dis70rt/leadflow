from uuid import uuid4

import httpx
from sqlalchemy.orm import Session

from leadflow.features.search.solr import get_search_index
from leadflow.features.search.worker import IndexWorker


def test_fuzzy_prefix_and_historical_discussion_suggestions(postgres_client, postgres, solr):
    client = postgres_client
    token = f"suggestion{uuid4().hex}"
    lead = client.post("/api/v1/leads", json={"name": token, "company": "Northstar"}).json()
    path = f"/api/v1/leads/{lead['id']}"
    assert (
        client.post(path + "/discussions", json={"note": "Initial discovery call."}).status_code
        == 201
    )
    assert (
        client.post(
            path + "/discussions", json={"note": "Discussed onboarding requirements and pricing."}
        ).status_code
        == 201
    )
    assert (
        client.post(path + "/discussions", json={"note": "Latest unrelated call."}).status_code
        == 201
    )
    client.app.dependency_overrides[get_search_index] = lambda: solr
    try:
        with Session(postgres[0]) as session:
            worker = IndexWorker(solr)
            while worker.process_one(session):
                pass
        response = client.get("/api/v1/leads/suggestions", params={"q": f"{token} onbaording"})
        assert response.status_code == 200, response.text
        item = response.json()["items"][0]
        assert item["id"] == lead["id"]
        assert item["match_field"] == "discussion"
        assert "onboarding" in item["snippet"].lower()
        assert "Latest unrelated" not in item["snippet"]
        assert "\ue000" in item["snippet"]
        response = client.get("/api/v1/leads", params={"q": f"{token} pricng"})
        assert response.status_code == 200
        assert response.json()["total"] == 1
        response = client.get("/api/v1/leads/suggestions", params={"q": token[:20]})
        assert response.json()["items"][0]["id"] == lead["id"]
    finally:
        httpx.post(
            f"{solr.url}/update",
            params={"commit": "true"},
            json={"delete": {"id": lead["id"]}},
            timeout=10,
        ).raise_for_status()
