from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from leadflow.core.config import get_settings
from leadflow.core.errors import install_handlers
from leadflow.core.health import router as health_router
from leadflow.features.discussions.router import router as discussions_router
from leadflow.features.leads.router import router as leads_router
from leadflow.features.search.router import router as search_router


def create_app() -> FastAPI:
    app = FastAPI(
        title="LeadFlow API",
        version="1.0.0",
        description=(
            "Single-screen CRM backend. Timestamps are UTC; reminder grouping uses the configured "
            "business timezone. PostgreSQL is authoritative; Solr search is eventually consistent. "
            "This assessment API has no authentication and should run in a trusted environment."
        ),
        openapi_tags=[{"name": name} for name in ("Leads", "Discussions", "Search", "Health")],
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=get_settings().cors_origins,
        allow_methods=["GET", "POST", "PATCH"],
        allow_headers=["Content-Type"],
        expose_headers=["Location"],
    )
    install_handlers(app)
    app.include_router(search_router, prefix="/api/v1")
    app.include_router(leads_router, prefix="/api/v1")
    app.include_router(discussions_router, prefix="/api/v1")
    app.include_router(health_router)
    return app


app = create_app()
