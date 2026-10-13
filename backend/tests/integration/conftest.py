import os
from pathlib import Path

import pytest
from alembic import command
from alembic.config import Config
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.engine import make_url
from sqlalchemy.orm import Session

from leadflow.core.database import get_session
from leadflow.features.search.solr import SolrIndex, get_search_index
from leadflow.main import create_app


@pytest.fixture
def postgres(monkeypatch):
    url = os.getenv("TEST_DATABASE_URL")
    if not url:
        pytest.skip("Set TEST_DATABASE_URL to run PostgreSQL integration tests")
    if not (make_url(url).database or "").endswith("_test"):
        pytest.fail("Integration database name must end with _test; migrations reset its schema")
    monkeypatch.setenv("DATABASE_URL", url)
    from leadflow.core.config import get_settings

    get_settings.cache_clear()
    config = Config(str(Path(__file__).parents[2] / "alembic.ini"))
    command.upgrade(config, "head")
    engine = create_engine(url)
    yield engine, config
    engine.dispose()
    command.downgrade(config, "base")
    get_settings.cache_clear()


@pytest.fixture
def postgres_client(postgres, search):
    app = create_app()

    def sessions():
        with Session(postgres[0], expire_on_commit=False) as session:
            yield session

    app.dependency_overrides[get_session] = sessions
    app.dependency_overrides[get_search_index] = lambda: search
    with TestClient(app) as client:
        yield client


@pytest.fixture
def solr():
    url = os.getenv("TEST_SOLR_URL")
    if not url:
        pytest.skip("Set TEST_SOLR_URL to run Solr integration tests")
    return SolrIndex(url)
