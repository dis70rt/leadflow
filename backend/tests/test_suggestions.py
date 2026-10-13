from uuid import UUID, uuid4

import pytest

from leadflow.core.errors import AppError
from leadflow.features.search.interfaces import SearchHit
from leadflow.features.search.query import build_query


def test_suggestions_return_authoritative_lead_and_older_discussion(client, search):
    lead = client.post("/api/v1/leads", json={"name": "Sarah", "company": "Studio"}).json()
    search.hits = [
        SearchHit(
            UUID(lead["id"]),
            {"name_txt": "Sarah", "discussions_txt": "Discussed \ue000pricing\ue001 options."},
        ),
        SearchHit(uuid4(), {}),
    ]
    response = client.get("/api/v1/leads/suggestions?q=pricng")
    assert response.status_code == 200
    item = response.json()["items"][0]
    assert item["id"] == lead["id"]
    assert item["name"] == "Sarah"
    assert item["match_field"] == "discussion"
    assert "pricing" in item["snippet"]
    assert len(response.json()["items"]) == 1


@pytest.mark.parametrize("query", ["q=a", "q=  ", "q=hello&limit=11", "q=hello&limit=0"])
def test_suggestion_validation(client, query):
    assert client.get(f"/api/v1/leads/suggestions?{query}").status_code == 422


def test_query_is_bounded_and_does_not_accept_solr_syntax():
    assert build_query("*:* {!join from=id}") is not None
    assert "{!" not in build_query("*:* {!join from=id}")
    assert build_query("***") is None
    assert "pricng~1" in build_query("pricng")
    assert "onbaording~2" in build_query("onbaording")
    assert "sa*" in build_query("sa")
    assert "sa~" not in build_query("sa")
    with pytest.raises(AppError) as caught:
        build_query("word " * 13)
    assert caught.value.status == 422


def test_suggestion_outage_is_structured(client, search):
    def unavailable(query, limit):
        raise AppError(503, "search_unavailable", "Search temporarily unavailable")

    search.suggest = unavailable
    response = client.get("/api/v1/leads/suggestions?q=pricing")
    assert response.status_code == 503
    assert response.json()["error"]["code"] == "search_unavailable"


def test_solr_skips_empty_fragments_from_nonmatching_discussions(monkeypatch):
    from leadflow.features.search.solr import SolrIndex

    identifier = uuid4()
    index = SolrIndex("http://solr/leads")
    monkeypatch.setattr(
        index,
        "_select",
        lambda params: {
            "response": {"docs": [{"id": str(identifier)}]},
            "highlighting": {
                str(identifier): {
                    "discussions_txt": ["", "Discussed \ue000pricing\ue001 options.", ""],
                    "company_txt": [""],
                }
            },
        },
    )
    hits = index.suggest("pricng", 5)
    assert hits[0].fragments == {"discussions_txt": "Discussed \ue000pricing\ue001 options."}
