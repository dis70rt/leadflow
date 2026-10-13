# Backend setup and API reference

FastAPI modular monolith for managing leads, discussion timelines, and follow-up reminders.
Python dependencies use uv; SQLAlchemy and Alembic manage PostgreSQL; Solr searches lead
fields and discussion text. The Next.js frontend is documented in [frontend.md](frontend.md).

## Start with Docker Compose

Requirements: Docker with Compose v2. A local Python installation is unnecessary for this path.

```sh
cp .env.example .env  # Skip if .env already exists.
sudo docker compose up --build -d
sudo docker compose logs -f init api worker
```

The initializer applies migrations and, with `SEED_DEMO=true`, creates six demo leads
and twelve discussions. Seeding uses stable IDs and never overwrites existing demo leads.
PostgreSQL uses `postgres:17-alpine`. All services explicitly join the project-scoped
`backend` bridge network (`leadflow_backend` by default). PostgreSQL and Solr data persist
in named volumes. API and database ports bind to localhost.
The API can operate without Solr; search returns a structured 503 until Solr recovers.
The worker retries indexing with capped exponential backoff.

- Frontend: http://localhost:3000
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- OpenAPI JSON: http://localhost:8000/openapi.json
- Liveness: http://localhost:8000/health/live
- Database readiness: http://localhost:8000/health/ready

Stop services with `sudo docker compose down`. Keep volumes to preserve data.

## Database access and container networking

Within the Compose network, use `postgres:5432` and `solr:8983`.
From the host, PostgreSQL is published at `127.0.0.1:5432`:

```sh
psql -h 127.0.0.1 -p 5432 -U leadflow -d leadflow
```

Alternatively, use the `psql` client included in the Alpine PostgreSQL image:

```sh
sudo docker compose exec postgres psql -U leadflow -d leadflow
```

After changing network configuration, recreate containers without deleting data:

```sh
sudo docker compose down
sudo docker compose up --build -d --force-recreate
```

Port 5432 must be available on the host. Existing PostgreSQL data initialized by a Debian
image may have incompatible locale/collation settings under Alpine's musl libc; back up
valuable data and use a logical dump/restore if needed. Do not delete the old volume to
resolve a locale error.

## Run Python locally

Requirements: Python 3.12 or newer and [uv](https://docs.astral.sh/uv/).
Start the dependencies from the repository root:

```sh
sudo docker compose up -d postgres solr
cd backend
uv sync --frozen
uv run alembic upgrade head
uv run python -m leadflow.scripts.seed
uv run uvicorn leadflow.main:app --reload
```

Run the indexing worker in another terminal from `backend/`:

```sh
uv run python -m leadflow.features.search.worker
```

Settings load from the root `.env` when commands run in `backend/`, or `.env` in the current
working directory. Environment variables take precedence. Compose overrides database and
Solr URLs with internal service addresses. Only `.env.example` belongs in version control;
`.env` is ignored and contains local development settings. URL-encode special characters
in database credentials when constructing a connection URL.

| Variable | Purpose |
| --- | --- |
| `POSTGRES_DB` | Compose database name |
| `POSTGRES_USER` | Compose database user |
| `POSTGRES_PASSWORD` | Compose database password |
| `DATABASE_URL` | SQLAlchemy PostgreSQL URL for local Python commands |
| `SOLR_URL` | Solr core URL for local Python commands |
| `BUSINESS_TIMEZONE` | IANA timezone for today's reminder boundaries |
| `SEED_DEMO` | Explicit switch for demo seeding |
| `CORS_ORIGINS` | JSON array of allowed frontend origins |

The supplied password is for local development. Deployment needs managed secrets,
authentication, TLS, and restricted service access; this assessment API has no login.

## API contract

| Method | Path | Result |
| --- | --- | --- |
| GET | `/api/v1/leads` | Filtered, searchable, paginated summaries |
| POST | `/api/v1/leads` | Create lead, 201 with Location header |
| GET | `/api/v1/leads/suggestions` | Fuzzy lead/discussion suggestions with matched excerpts |
| GET | `/api/v1/leads/{id}` | Lead details |
| PATCH | `/api/v1/leads/{id}` | Partial update, including status/reminder |
| GET | `/api/v1/leads/{id}/discussions` | Reverse chronological timeline |
| POST | `/api/v1/leads/{id}/discussions` | Create discussion and updated lead summary, 201 |

List parameters: repeated `status`, optional `q`, `limit` (1–100, default 20), and
`offset` (default 0). Responses contain `items`, `total`, `limit`, and `offset`.
Statuses are `new`, `contacted`, `qualified`, `proposal_sent`, `won`, and `lost`.
Unknown payload fields and whitespace-only names/notes are rejected.

Today's reminders sort first by reminder time, including already overdue reminders
from today. Other leads sort by recent activity. With search, unpinned leads sort by
relevance, then recent activity. Search matches analyzed words in name, company, phone,
and all discussions, with higher weight for lead names. Both list search and suggestions
use bounded, server-generated Solr queries: all words must match across fields, the final
word supports prefixes from two characters, words of 4–6 characters allow one edit, and
longer words allow two edits. Exact matches rank higher. Up to twelve words of sixty-four
characters each are accepted; raw Solr operators are not interpreted. It uses Solr's default `*_txt`
text fields. Search is eventually consistent; a search already in progress may briefly
show older matching results. Queries exceeding 10,000 matching leads require refinement.

The frontend calculates relative times from `last_discussion_at`. A lead with no discussion
has null last-note fields. No discussion is fabricated when a lead is created.

All incoming reminder timestamps must include a timezone offset; PostgreSQL returns them
in UTC. `follow_up_state` is `none`, `overdue`, `today`, or `upcoming`. Any elapsed reminder,
including one from earlier today, is overdue. Today's pinning remains based on its date.

Creating a discussion updates its lead summary and optional reminder atomically. Missing
or null reminder on discussion creation preserves the active reminder. PATCH can explicitly
clear it with `{"follow_up_at": null}`. Won/Lost always clear the active reminder; reopen
a closed lead before creating a discussion with a new reminder. Historical reminder values
remain attached to discussions. Reminders are displayed in the app; no email/SMS is sent.

Timeline pagination uses `limit` and an opaque `cursor`. Pass `next_cursor` from one response
to the next request. Timestamp and UUID together provide stable ordering, even for equal
timestamps. Concurrent additions appear when the first page is refreshed.

Errors share this structure, including 404, 422, 503, and unexpected 500 responses:

```json
{"error": {"code": "lead_not_found", "message": "Lead does not exist", "details": null}}
```

Swagger documents validation, response models, examples, parameters, and error schemas.

## Suggestions

`GET /api/v1/leads/suggestions?q=pricng&limit=5` searches every pipeline stage.
The query requires 2–200 characters and `limit` is 1–10. Results contain current PostgreSQL
lead details, a `match_field`, and a Solr `snippet`; matching discussions are preferred,
including historical notes that differ from the latest summary. Multi-valued highlighting
can return empty fragments for nonmatching discussions; the adapter skips those fragments.

`snippet` is plain text with U+E000/U+E001 match delimiters. Render the text through escaped
text nodes and explicit highlight elements, never through raw HTML. Missing excerpts are
null. Solr outages return a structured 503. No schema change or reindex is required for
existing lead documents because their complete discussion text was already indexed.

## Example flow

```sh
curl -i http://localhost:8000/api/v1/leads \
  -H 'Content-Type: application/json' \
  -d '{"name":"Sarah Connor","company":"Acme Corp","phone":"555-0199"}'
```

Replace `LEAD_ID` below with the ID from the response:

```sh
curl http://localhost:8000/api/v1/leads/LEAD_ID/discussions \
  -H 'Content-Type: application/json' \
  -d '{"note":"Discussed team pricing","follow_up_at":"2026-10-20T14:00:00+05:30"}'
curl -X PATCH http://localhost:8000/api/v1/leads/LEAD_ID \
  -H 'Content-Type: application/json' -d '{"status":"qualified"}'
curl 'http://localhost:8000/api/v1/leads?status=qualified&q=pricing'
```

The final search matches after the worker indexes the discussion.

## Architecture

```text
backend/src/leadflow/
  core/                  Configuration, DB sessions, errors, health
  features/leads/        Lead models, schemas, repository, service, routes
  features/discussions/  Timeline models, schemas, pagination, service, routes
  features/search/       Search protocol, Solr adapter, outbox model, worker
  scripts/               Idempotent seed and reindex commands
backend/migrations/      Versioned upgrades and downgrades
backend/tests/           Fast API/service tests and real-service integration tests
```

HTTP handling, business rules, and persistence have separate responsibilities. Services
compose repositories through injected SQLAlchemy sessions. Search depends on a Python
Protocol so Solr can be substituted in tests. Shared code stays small; modules import each
other through explicit Python boundaries rather than communicating over internal HTTP.

Lead writes and outbox events commit in one transaction. PostgreSQL row locks serialize
updates per lead to keep the latest discussion summary correct. The separate worker locks
outbox rows with `SKIP LOCKED`, locks the corresponding lead, builds its current search
document, and indexes it idempotently. Successful events are removed; failures retain their
attempt count and retry time. Solr failure never rolls back a saved user discussion.

To rebuild search documents without changing source data:

```sh
sudo docker compose exec api python -m leadflow.scripts.reindex
```

## Migrations

From `backend/`:

```sh
uv run alembic upgrade head
uv run alembic current
uv run alembic check
uv run alembic revision --autogenerate -m "describe change"
uv run alembic downgrade -1
```

Review generated migrations and supply both upgrade and downgrade logic. Downgrading the
initial migration removes all application tables and their data; use a disposable database
for rollback verification. Application startup never silently calls `create_all`.

## Tests

Fast tests use isolated in-memory SQLite databases and fake search adapters. They cover
HTTP validation, persistence, filters, pinning, immediate summaries, reminder behavior,
error responses, indexing/retries, cursor validation, timezone boundaries, and OpenAPI.
They do not establish PostgreSQL locking behavior or Solr analyzer behavior.

```sh
cd backend
uv run pytest -q
uv run ruff check .
uv run ruff format --check .
```

Real-service tests additionally cover migration up/down/up and ORM drift, seed idempotency,
cursor pagination, concurrent discussion writes, and searching real indexed discussion text.
Integration tests skip unless their connection variables are set. Use the isolated test stack:

```sh
# From repository root:
sudo docker compose -f compose.test.yaml up -d --wait
cd backend
TEST_DATABASE_URL=postgresql+psycopg://leadflow:test_only@localhost:55432/leadflow_test \
TEST_SOLR_URL=http://localhost:58983/solr/leads_test \
uv run pytest tests/integration -q
cd ..
sudo docker compose -f compose.test.yaml down
```

Integration tests reset the database schema and must run serially against a dedicated database
whose name ends in `_test`. Test services use separate ports and temporary storage.
Future features should add behavior tests beside the relevant feature tests and use real-service
tests for PostgreSQL-specific SQL, migrations, concurrency, or Solr behavior.

## Delivery status

Backend source, locked dependencies, environment template, Compose setups, migrations,
seed/reindex commands, Swagger documentation, and tests are included. Frontend screenshots are available in [screenshots](screenshots/).
