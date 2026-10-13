from concurrent.futures import ThreadPoolExecutor

from alembic import command
from sqlalchemy import inspect
from sqlalchemy.orm import sessionmaker

from leadflow.scripts import seed as seed_module


def test_migrations_up_down_up(postgres):
    engine, config = postgres
    assert {"leads", "discussions", "index_events"} <= set(inspect(engine).get_table_names())
    command.check(config)
    command.downgrade(config, "base")
    assert "leads" not in inspect(engine).get_table_names()
    command.upgrade(config, "head")


def test_seed_is_idempotent(postgres, monkeypatch):
    monkeypatch.setattr(seed_module, "SessionFactory", sessionmaker(postgres[0]))
    assert seed_module.seed() == 6
    assert seed_module.seed() == 0


def test_timeline_cursor_has_no_duplicates(postgres_client):
    client = postgres_client
    identifier = client.post("/api/v1/leads", json={"name": "Timeline"}).json()["id"]
    path = f"/api/v1/leads/{identifier}/discussions"
    for note in ("First", "Second", "Third"):
        assert client.post(path, json={"note": note}).status_code == 201
    first = client.get(path, params={"limit": 2}).json()
    second = client.get(path, params={"limit": 2, "cursor": first["next_cursor"]}).json()
    assert [item["note"] for item in first["items"] + second["items"]] == [
        "Third",
        "Second",
        "First",
    ]
    assert second["next_cursor"] is None


def test_concurrent_notes_keep_latest_summary(postgres_client):
    client = postgres_client
    identifier = client.post("/api/v1/leads", json={"name": "Concurrent"}).json()["id"]
    path = f"/api/v1/leads/{identifier}"
    with ThreadPoolExecutor(max_workers=2) as executor:
        responses = list(
            executor.map(
                lambda note: client.post(path + "/discussions", json={"note": note}), ["One", "Two"]
            )
        )
    assert all(response.status_code == 201 for response in responses)
    timeline = client.get(path + "/discussions").json()["items"]
    assert len(timeline) == 2
    assert client.get(path).json()["last_note"] == timeline[0]["note"]
