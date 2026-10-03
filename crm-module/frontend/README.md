# NextGen CRM frontend

Standalone Next.js App Router application. Every workspace page is under
`/crm/**`, and browser business-data requests use `/api/v1/crm/**` only.
Customer 360 enrichment is handled by the CRM backend with read-only Sales
fallback; the browser never calls Sales directly.

## Local review

Use Node 22 or newer (verified with Node 24). Start the CRM backend using the
parent module's instructions; its local API origin is `http://localhost:8088`.
From `crm-module/frontend`:

```powershell
npm ci
npm run dev
```

Open `http://127.0.0.1:3008/crm`. The launcher checks the configured port before
starting and binds to loopback. Configure another port/backend for the current
PowerShell process when necessary:

```powershell
$env:CRM_FRONTEND_PORT = '3018'
$env:CRM_API_URL = 'http://localhost:8088'
npm run dev
```

`CRM_API_URL` is a server-only origin, never a `NEXT_PUBLIC` variable. A narrowly
scoped Next.js rewrite forwards `/api/v1/crm/:path*` to that origin. No Sales
or catch-all proxy is configured. The API origin is embedded by production
builds: rebuild when changing it. `CRM_FRONTEND_PORT` affects launch only.

```powershell
npm run build
npm start
```

For the optional container frontend, run this from `crm-module`:

```powershell
docker compose --profile frontend up --build -d
```

The existing backend remains at 8088; the frontend binds localhost:3008 and
forwards internally to `crm-module:8085`. The backend's PostgreSQL volume and
default Compose startup remain unchanged. Container rendering uses the built
standalone server. Application architecture follows the
[Next.js installation guide](https://nextjs.org/docs/app/getting-started/installation).

## Workspaces

- Dashboard and reports: overview, funnel, current pipeline, campaign attribution
  and service. Dates are inclusive UTC dates; defaults come from the API.
- Acquisition: leads, qualification, prospects, opportunities and Kanban, with
  interaction/history panels and competitors. A keyboard stage selector provides
  the same operation as dragging a card.
- Customer/prospect 360: CRM sections plus optional Sales enrichment. Use known
  CRM-linked customer UUIDs or the dashboard lookup; no Sales customer directory
  dependency is introduced.
- Contacts: ownership/primary fields, email/SMS preferences and preference events.
- Campaigns: membership/status history, costs, touchpoints and attribution.
- Communications: templates and revisions, opt-in-aware message preparation,
  idempotent enqueueing, cancellation and delivery attempts. The worker remains
  disabled and provider adapters offline.
- Service: contracts/items/history, fulfilments, warranty claims and events,
  maintenance schedules and manually recorded visits.

Opportunity stage changes preserve the full PUT payload and submit the loaded
`expectedUpdatedAt` value. Concurrent edits return 409; failed optimistic board
moves roll back. Existing attribution links remain stored when no new touchpoint
is submitted. WON records internal conversion intent and creates no Sales record.

List adapters follow actual API contracts. Acquisition and template lists are
unpaged arrays; contacts/interactions/history use page envelopes. Campaign,
message and service lists return bounded pages without totals; their Next control
may lead to an empty page when the last page was exactly full. Search applies
only to loaded records. Nested lists disclose their API limits. Customer 360 is
a recent-record view, not a complete historical archive. See
[API_CONTRACTS.md](API_CONTRACTS.md) for details.

Opportunity values have no recorded currency and appear as raw amounts. Contract
snapshots and campaign costs retain their currencies and are not collected
revenue. Reports display the backend's definition version and semantics.

CRM currently has no authentication. This is a local review frontend; public
activation requires CRM authentication/authorization and provider configuration.

## Verification

```powershell
npm run typecheck
npm run lint
npm test
npm run build
npx playwright install chromium
```

From `crm-module`, run the full disposable PostgreSQL and browser verification:

```powershell
powershell -NoProfile -File ./verify-local-stack.ps1 -WithBrowser
```

To also exercise the locally available Sales backend image on the same
disposable database:

```powershell
powershell -NoProfile -File ./verify-local-stack.ps1 -WithBrowser -SalesImage sales-module-backend:latest
```

The runner uses unique containers/networks, randomly allocated loopback API and
frontend ports, disabled delivery and disposable fixtures. It rebuilds the
frontend against the review API, runs Playwright with managed server teardown,
compares the non-CRM schema fingerprint and writes `phase8-verification.json`
when successful. When a Sales image is supplied, it initializes its own schema
on this disposable database before the isolation fingerprint is taken. This
accounts for gaps between the SQL fixture and the image's entity mappings
(including `coupon_codes.max_uses`). Sales stops for offline CRM browser tests,
then restarts for API checks and CRM browser smoke tests while both modules run.
The final fingerprint must still match. No Sales source, normal application
database or production schema is changed. A local Sales image check is evidence
about that image; it is not a new Sales source build or complete Sales browser
acceptance.

For frontend-only iterations after a passing backend run, `-SkipBackendTests`
reuses the packaged jar and rejects source files newer than that package. The
result explicitly records that backend tests were not rerun; use the complete
command for acceptance after backend changes.

The disposable build points to a temporary API that is removed afterward.
Before ordinary `npm start`, unset review overrides and run `npm run build`
against your intended local backend again. Browser screenshots and traces are
under ignored `test-results`; the HTML report is under `playwright-report`.

Do not reuse normal application/database credentials for these tests. Direct
`npm run test:browser` writes fixtures to its configured backend, so use the
disposable runner unless you have explicitly prepared another disposable stack.

Known tooling limitation: Next's current lint plugin chain pulls `braces` 3.0.3,
which npm flags for a development-tool glob-pattern denial-of-service advisory.
No compatible fixed release was available during this implementation. ESLint 9
and TypeScript 6 are pinned to the versions accepted by the installed Next lint
plugins; upgrade together when those plugins support newer major versions.
