from datetime import timedelta

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from leadflow.core.database import utcnow
from leadflow.features.discussions.models import Discussion
from leadflow.features.search.models import IndexEvent


def test_discussion_updates_summary_and_reminder(client, database):
    lead = client.post("/api/v1/leads", json={"name": "Sarah"}).json()
    path = f"/api/v1/leads/{lead['id']}"
    reminder = (utcnow() + timedelta(days=1)).isoformat()
    response = client.post(
        path + "/discussions", json={"note": "Pricing", "follow_up_at": reminder}
    )
    assert response.status_code == 201
    assert response.json()["lead"]["last_note"] == "Pricing"
    assert response.json()["lead"]["follow_up_at"] is not None
    client.post(path + "/discussions", json={"note": "Second note"})
    current = client.get(path).json()
    assert current["last_note"] == "Second note"
    assert current["follow_up_at"] is not None
    timeline = client.get(path + "/discussions").json()
    assert [row["note"] for row in timeline["items"]] == ["Second note", "Pricing"]
    assert timeline["next_cursor"] is None
    with Session(database) as session:
        assert session.scalar(select(func.count()).select_from(Discussion)) == 2
        assert session.scalar(select(func.count()).select_from(IndexEvent)) == 3


def test_invalid_notes_do_not_write(client, database):
    lead = client.post("/api/v1/leads", json={"name": "A"}).json()
    path = f"/api/v1/leads/{lead['id']}/discussions"
    for body in ({"note": " "}, {"note": "Hi", "follow_up_at": "2026-01-01T12:00:00"}):
        assert client.post(path, json=body).status_code == 422
    with Session(database) as session:
        assert session.scalar(select(func.count()).select_from(Discussion)) == 0
    assert client.get(path + "?cursor=bad").status_code == 422


def test_closed_lead_requires_reopening_for_reminder(client):
    lead = client.post("/api/v1/leads", json={"name": "A"}).json()
    path = f"/api/v1/leads/{lead['id']}"
    client.patch(path, json={"status": "lost"})
    assert (
        client.post(
            path + "/discussions", json={"note": "Call", "follow_up_at": utcnow().isoformat()}
        ).status_code
        == 422
    )
    assert client.post(path + "/discussions", json={"note": "Closing note"}).status_code == 201
