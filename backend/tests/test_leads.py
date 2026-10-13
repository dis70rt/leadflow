from datetime import timedelta
from uuid import uuid4

import pytest
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from leadflow.core.database import utcnow
from leadflow.features.leads.presentation import today_bounds
from leadflow.features.search.models import IndexEvent


def create(client, name="Sarah Connor"):
    response = client.post("/api/v1/leads", json={"name": name, "company": "Acme"})
    assert response.status_code == 201
    assert response.headers["location"].endswith(response.json()["id"])
    return response.json()


def test_create_and_read(client, database):
    lead = create(client)
    assert lead["status"] == "new"
    assert lead["last_note"] is None
    assert client.get(f"/api/v1/leads/{lead['id']}").json()["name"] == "Sarah Connor"
    with Session(database) as session:
        assert session.scalar(select(func.count()).select_from(IndexEvent)) == 1


@pytest.mark.parametrize(
    "body", [{"name": " "}, {}, {"name": "A", "extra": 1}, {"name": "x" * 201}]
)
def test_create_validation(client, body):
    response = client.post("/api/v1/leads", json=body)
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "validation_error"


def test_update_and_filter(client):
    lead = create(client)
    path = f"/api/v1/leads/{lead['id']}"
    assert client.patch(path, json={"status": "qualified"}).json()["status"] == "qualified"
    assert client.get(path).json()["status"] == "qualified"
    assert client.get("/api/v1/leads?status=new").json()["total"] == 0
    assert client.get("/api/v1/leads?status=new&status=qualified").json()["total"] == 1
    assert client.patch(path, json={"name": None}).status_code == 422
    assert client.patch(path, json={"status": None}).status_code == 422
    assert client.patch(path, json={"status": "bogus"}).status_code == 422


def test_follow_up_pin_clear_and_closed_leads(client):
    start, _ = today_bounds()
    overdue = create(client, "Overdue")
    today = create(client, "Today")
    create(client, "Recent")
    client.patch(
        f"/api/v1/leads/{overdue['id']}",
        json={"follow_up_at": (start - timedelta(days=1)).isoformat()},
    )
    path = f"/api/v1/leads/{today['id']}"
    client.patch(path, json={"follow_up_at": (start + timedelta(hours=12)).isoformat()})
    items = client.get("/api/v1/leads").json()["items"]
    assert items[0]["id"] == today["id"]
    assert (
        next(item for item in items if item["id"] == overdue["id"])["follow_up_state"] == "overdue"
    )
    assert client.patch(path, json={"company": None}).json()["follow_up_at"] is not None
    assert client.patch(path, json={"follow_up_at": None}).json()["follow_up_at"] is None
    client.patch(path, json={"follow_up_at": utcnow().isoformat()})
    assert client.patch(path, json={"status": "won"}).json()["follow_up_at"] is None


def test_search_and_pagination(client, search):
    lead = create(client)
    create(client, "Other")
    from uuid import UUID

    search.ids = [UUID(lead["id"])]
    result = client.get("/api/v1/leads?q=pricing").json()
    assert result["total"] == 1
    assert result["items"][0]["id"] == lead["id"]
    result = client.get("/api/v1/leads?limit=1&offset=1").json()
    assert result["total"] == 2
    assert len(result["items"]) == 1
    assert client.get("/api/v1/leads?limit=101").status_code == 422


def test_not_found(client):
    path = f"/api/v1/leads/{uuid4()}"
    assert client.get(path).status_code == 404
    assert client.patch(path, json={"status": "won"}).status_code == 404
    assert client.get(path + "/discussions").status_code == 404
    assert client.post(path + "/discussions", json={"note": "Hello"}).status_code == 404
