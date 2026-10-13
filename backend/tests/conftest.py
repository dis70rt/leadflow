import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from leadflow.core.database import Base, get_session
from leadflow.features.search.solr import get_search_index
from leadflow.main import create_app


class FakeSearch:
    def __init__(self):
        self.ids = []
        self.documents = []

    def search(self, query):
        return self.ids

    def upsert(self, document):
        self.documents.append(document)


@pytest.fixture
def database():
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    Base.metadata.create_all(engine)
    yield engine
    engine.dispose()


@pytest.fixture
def search():
    return FakeSearch()


@pytest.fixture
def client(database, search):
    app = create_app()

    def session_override():
        with Session(database, expire_on_commit=False) as session:
            yield session

    app.dependency_overrides[get_session] = session_override
    app.dependency_overrides[get_search_index] = lambda: search
    with TestClient(app) as client:
        yield client
