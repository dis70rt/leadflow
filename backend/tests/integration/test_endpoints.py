from datetime import timedelta
from uuid import uuid4

from leadflow.core.database import utcnow
from leadflow.features.leads.presentation import today_bounds


def test_complete_lead_workflow(postgres_client):
    client = postgres_client
    response = client.post(
        "/api/v1/leads",
        json={"name": "Integration Lead", "company": "Example", "phone": "555-0123"},
    )
    assert response.status_code == 201
    lead = response.json()
    assert lead["status"] == "new"
    path = response.headers["location"]
    assert client.get(path).json()["id"] == lead["id"]

    reminder = (utcnow() + timedelta(days=1)).isoformat()
    response = client.post(
        path + "/discussions", json={"note": "Discussed annual pricing", "follow_up_at": reminder}
    )
    assert response.status_code == 201
    assert response.json()["lead"]["last_note"] == "Discussed annual pricing"
    assert response.json()["lead"]["follow_up_at"] is not None

    response = client.patch(path, json={"status": "proposal_sent"})
    assert response.status_code == 200
    assert client.get(path).json()["status"] == "proposal_sent"
    listing = client.get("/api/v1/leads", params={"status": "proposal_sent"}).json()
    assert listing["total"] == 1
    assert listing["items"][0]["last_note"] == "Discussed annual pricing"
    assert listing["items"][0]["last_discussion_at"] is not None

    response = client.post(path + "/discussions", json={"note": "Second call"})
    assert response.status_code == 201
    assert response.json()["lead"]["follow_up_at"] is not None
    timeline = client.get(path + "/discussions").json()["items"]
    assert [item["note"] for item in timeline] == ["Second call", "Discussed annual pricing"]
    assert client.patch(path, json={"follow_up_at": None}).json()["follow_up_at"] is None
    assert client.patch(path, json={"status": "won"}).json()["status"] == "won"


def test_today_pin_overdue_and_list_pagination(postgres_client):
    client = postgres_client
    ids = [
        client.post("/api/v1/leads", json={"name": name}).json()["id"]
        for name in ("Today", "Overdue", "Recent")
    ]
    start, _ = today_bounds()
    for identifier, reminder in (
        (ids[0], start + timedelta(hours=14)),
        (ids[1], start - timedelta(days=1)),
    ):
        assert (
            client.patch(
                f"/api/v1/leads/{identifier}", json={"follow_up_at": reminder.isoformat()}
            ).status_code
            == 200
        )
    listing = client.get("/api/v1/leads", params={"limit": 2}).json()
    assert listing["total"] == 3
    assert len(listing["items"]) == 2
    assert listing["items"][0]["id"] == ids[0]
    all_items = client.get("/api/v1/leads").json()["items"]
    assert next(item for item in all_items if item["id"] == ids[1])["follow_up_state"] == "overdue"
    assert len(client.get("/api/v1/leads?offset=2&limit=2").json()["items"]) == 1


def test_errors_health_and_documentation(postgres_client):
    client = postgres_client
    assert client.get("/health/live").status_code == 200
    assert client.get("/health/ready").status_code == 200
    assert client.get("/docs").status_code == 200
    assert client.get("/redoc").status_code == 200
    assert "/api/v1/leads" in client.get("/openapi.json").json()["paths"]
    response = client.post("/api/v1/leads", json={"name": " "})
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "validation_error"
    path = f"/api/v1/leads/{uuid4()}"
    assert client.get(path).status_code == 404
    assert client.patch(path, json={"status": "won"}).status_code == 404
    assert client.get(path + "/discussions").status_code == 404
    assert client.post(path + "/discussions", json={"note": "Missing lead"}).status_code == 404
