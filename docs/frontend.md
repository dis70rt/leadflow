# Frontend development

## Stack and setup

Next.js App Router, React, strict TypeScript, TanStack Query, Zustand, next-themes,
Radix Dialog, Phosphor icons, and self-hosted Geist. Requires Node.js 22.12+ and npm.

Start FastAPI, PostgreSQL, Solr, and the indexing worker using the root Compose setup:

```sh
sudo docker compose up --build -d api worker
cd frontend
npm ci
npm run dev
```

The root `.env` is shared with the backend; there is no separate frontend environment file.
`API_BASE_URL` is the server-only upstream URL, defaulting to `http://127.0.0.1:8000`.
Compose overrides it to `http://api:8000`. `WEB_PORT` sets the Docker host port
(default 3000); it does not change the internal Next.js port. `BUSINESS_TIMEZONE` controls today's follow-up
grouping and displayed discussion/reminder timestamps. The date input uses the browser's
local timezone, explicitly labeled, and submits an ISO timestamp with an offset converted to UTC.

Production: `npm run build && npm start`, or the Compose `web` service. The Docker image
uses Next.js standalone output and runs as the unprivileged Node user.

## Feature boundaries and state

- `features/leads`: lead contracts, HTTP adapter, query keys/hooks, creation, list, filters.
- `features/discussions`: discussion contracts, HTTP adapter, infinite timeline, note form.
- `features/search`: fuzzy suggestions, combobox keyboard state, safe snippet highlighting.
- `features/workspace`: composition, sidebar, summary, selected lead, filters, pagination.
- `features/auth`: demo session and UI gating. No passwords or authentication tokens.
- `components/ui`: Radix modal, feedback states, theme toggle, branding.
- `lib/http`: injected request interface, Fetch implementation, structured API errors.
- `providers`: query client, theme persistence, shared clock and business timezone.

TanStack Query owns server records; Zustand does not duplicate them. Mutations update the
lead detail cache from the response and invalidate related lists/counts and timelines.
Status totals use actual filtered API totals. Search is debounced; matching list queries
refresh every five seconds because Solr indexing is asynchronous. Requests support cancellation.

Workspace UI state resets on sign-out. Session storage contains only the demo name/email,
and signing out clears cached records. The theme persists in local storage. The login is
explicitly a demo; it does not secure the FastAPI API or the proxy.

Forms retain drafts on failed requests, prevent duplicate submissions, and confirm before
discarding unsaved changes. Dialogs trap focus, support Escape, and have accessible titles.
Loading, empty, validation, retry, and disconnected-backend states are rendered explicitly.
Theme-aware skeletons mirror the workspace, lead rows, and timeline while initial data loads;
background refreshes preserve existing records. Skeleton regions announce loading accessibly,
and shimmer is disabled for reduced-motion preferences.
Reduced-motion preferences are respected. Mobile users retain access to theme and sign-out.
Body text uses 16px, primary workspace content uses 14–16px, and supporting text stays
at 12–13px. Wider desktop content, roomier rows, and larger dialogs support that scale.

Pagination comes from the backend. The follow-up count says "in this view" because it
counts the currently loaded page and filters rather than claiming a global reminder total.
Relative discussion times and overdue states refresh every minute.

## Search suggestions

The search field fetches up to five suggestions after a 250ms debounce using
`GET /api/v1/leads/suggestions`. Suggestions include name, company, status, and a matching
excerpt from discussion history or lead details. Matching words are rendered as React
`mark` elements; Solr text is never injected as HTML. Suggestions span all lead stages,
while the list keeps its selected status filter.

Arrow keys select a suggestion. Tab fills the selected (or first) lead name while keeping
focus in the search input; Enter opens the selected (or first) lead timeline. Clicking a
suggestion also fills its name and opens the timeline. Choosing a lead clears the status
filter so the selected result can appear in the list. Escape dismisses the popup without
clearing the query. Clicking works on desktop and mobile. Loading skeletons,
empty feedback, errors, and retry are supported. Query cancellation and separate cache keys
prevent older requests from replacing the current suggestions. The same typo-tolerant
query construction powers list results, so a misspelled search can still find a lead after
the popup is dismissed.

## Fast checks

```sh
cd frontend
npm run typecheck
npm run lint
npm run format:check
npm test
npm run build
```

Unit tests cover timezone boundaries, relative times, request contracts, explicit reminder
clearing, error parsing, pagination resets, and session-state cleanup.

## Browser tests

```sh
cd frontend
npx playwright install chromium
npm run test:e2e
```

The default suite intercepts API requests with deterministic fixtures. It covers demo login,
lead creation, status updates, discussions/reminders, filters/search, theme persistence,
keyboard dismissal, sign-out, and mobile overflow. It does not require a running backend.
The opt-in real-backend test skips by default.

Playwright starts a dev server unless one is running at its base URL. If port 3000 belongs
to another project, select another port:

```sh
PLAYWRIGHT_BASE_URL=http://localhost:3001 npm run test:e2e
```

Use one Next.js dev process per frontend directory. `npm run dev -- --port 3001` starts
that preview explicitly. Generated browser reports/traces are ignored by Git.

## Real browser integration

Use the disposable PostgreSQL/Solr test stack. From the repository root:

```sh
sudo docker compose -f compose.test.yaml up -d --wait
cd backend
export DATABASE_URL=postgresql+psycopg://leadflow:test_only@localhost:55432/leadflow_test
export SOLR_URL=http://localhost:58983/solr/leads_test
uv run alembic upgrade head
uv run uvicorn leadflow.main:app --host 127.0.0.1 --port 18000
```

In a second terminal, run the worker against those same test services:

```sh
cd backend
DATABASE_URL=postgresql+psycopg://leadflow:test_only@localhost:55432/leadflow_test \
SOLR_URL=http://localhost:58983/solr/leads_test \
uv run python -m leadflow.features.search.worker
```

Stop any existing frontend dev process. In a third terminal:

```sh
cd frontend
API_BASE_URL=http://127.0.0.1:18000 npm run dev -- --port 3002
```

In a fourth terminal:

```sh
cd frontend
PLAYWRIGHT_BASE_URL=http://localhost:3002 LIVE_BACKEND_TESTS=1 \
npm run test:e2e -- live.spec.ts
```

This creates a uniquely named test lead, saves a real discussion and reminder, updates its
status, reloads to verify persistence, and waits for Solr to find the discussion through
the Next.js proxy. It leaves data only in the disposable test stack. Stop the three temporary
processes afterward and run `sudo docker compose -f compose.test.yaml down` from the root.
The test stack uses temporary storage; do not aim these tests at valuable data.

## Verified checks

During implementation, 14 frontend unit tests, nine mocked browser workflows, and the
separate real-backend browser workflow passed. The standalone production build was run
against the development backend and captured without browser errors or horizontal overflow.
The backend's 41 tests also passed with PostgreSQL/Solr integration enabled.

`npm audit --omit=dev` reported no production dependency vulnerabilities. The development
lint toolchain currently reports five high-severity findings through `braces`/`micromatch`;
the registry does not offer a compatible fix for that dependency chain. Do not apply
`npm audit fix --force` blindly: its suggested downgrade replaces the Next.js lint configuration.

## Screenshots

[All retained screenshots](screenshots/README.md),
[final dark workspace](screenshots/workspace-dark-final.png),
[light workspace](screenshots/workspace-light.png),
[timeline dialog](screenshots/timeline-light.png),
[demo login](screenshots/login-dark.png),
[mobile workspace](screenshots/workspace-mobile.png).

The dark palette derives from the official
[Tokyo Night night colors](https://github.com/folke/tokyonight.nvim/blob/main/extras/lua/tokyonight_night.lua).
The installed taste skill's minimalist guidance was adapted for a functional CRM workspace.

## Landing illustration

The landing page shows a CRM workflow: new leads, discussions, and reminders
converge on LeadFlow, then connect to qualification, follow-up, and won deals.
Dots travel along the SVG connections, with a subtle pulse around the central
workspace. Nodes use HTML text and existing Phosphor icons for readable labels.

`src/components/illustrations/crm-workflow.tsx` owns the diagram and animation
lifecycle. Native SVG motion pauses offscreen, in hidden tabs, and for reduced
motion; reduced-motion users see the complete static diagram. There are no
illustration captions, controls, external scripts, or extra animation packages.

The superseded paper-plane source and screenshots are preserved as historical
design artifacts under `docs/illustrations` and `docs/screenshots`; application
code and assets for that version have been removed. Browser checks were skipped
for this revision at the user's request.
