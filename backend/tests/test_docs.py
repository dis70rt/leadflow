from leadflow.main import create_app


def test_openapi_and_docs(client):
    assert client.get("/docs").status_code == 200
    assert client.get("/redoc").status_code == 200
    schema = client.get("/openapi.json").json()
    post = schema["paths"]["/api/v1/leads"]["post"]
    assert "201" in post["responses"]
    assert "422" in post["responses"]
    assert "LeadStatus" in schema["components"]["schemas"]
    assert client.get("/health/live").json() == {"status": "ok"}
    assert client.get("/health/ready").status_code == 200
    assert create_app().version == "1.0.0"
