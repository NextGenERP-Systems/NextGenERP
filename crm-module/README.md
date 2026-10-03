# CRM module

CRM runs independently of Sales. APIs use `/api/v1/crm/**`; there are no calls
to Sales during qualification or opportunity updates. Customer IDs remain UUID
values. `CONVERTED_TO_CUSTOMER` is currently an internal conversion-intent marker;
it does not create a Sales customer.

Docker Compose runs PostgreSQL and the CRM backend in one `crm-module`
container. The API is available at `http://localhost:8088`; Swagger UI is at
`http://localhost:8088/swagger-ui/index.html`. PostgreSQL data lives in the
`crm-module_crm-postgres-data` Docker volume and survives container restarts.
Set `CRM_DB_PASSWORD` in a local `.env` file before starting the Compose
project. The root `.gitignore` excludes `.env`. This bundled setup is for local
review; the API port is bound to localhost.

From this directory in PowerShell:

```powershell
Set-Content .env 'CRM_DB_PASSWORD=choose-a-local-password'
docker compose up --build -d
```

Stop it with `docker compose down`. This keeps the database volume. To inspect
startup logs, run `docker compose logs -f crm-module`.

## Existing installations

CRM now uses `crm_flyway_schema_history` so other modules' migration histories
do not collide with CRM versions. V2 and V3 remain unchanged.

If CRM V2/V3 were previously applied using `flyway_schema_history`, normal
startup with the new table will fail on the existing tables until adoption is
performed. After backup and schema verification, manually run
`database/adopt-crm-flyway-history.sql` on that database. It copies only the two
successful CRM migration records, including their original checksums, into a
new CRM history table. The legacy history remains intact. Restart CRM and
confirm Flyway validates both migrations and Hibernate validates the schema.

Do not baseline at version 3 to bypass missing or mismatched migration records.
If a failed startup already created `crm_flyway_schema_history`, inspect and
reconcile that table before adopting; the script deliberately rejects this case.

## API behavior

PUT is a full replacement: provide the required fields and desired reference
IDs. Optional master-data references can be cleared by omitting them or using
null. An opportunity needs a prospect ID or customer ID on both create and PUT.
Invalid payloads/references return 400, missing resources return 404, and
qualification/deletion conflicts return 409.

Use `POST /api/v1/crm/leads/{id}/qualify` to qualify a lead. Repeated or
concurrent qualification returns the already linked prospect. Qualification
cannot be reversed through PUT. Existing qualified leads without a persisted
conversion link return 409; CRM does not guess links by matching names.

## Verification

Run `powershell -NoProfile -File ./verify-local-stack.ps1` from this directory.
The script creates uniquely named disposable Docker resources, runs Java 21
Maven verification against PostgreSQL, and removes its database and network.
Tests cover lifecycle CRUD, master-data persistence, response serialization,
concurrent qualification, validation, reference deletion, and migration-history
isolation. They require dedicated `CRM_TEST_DATABASE_*` variables and do not
inherit the application's usual database connection.

## Phase 3 interactions and history

V4 creates CRM interaction, appointment, conversion-link and history tables.
Existing leads and opportunities receive `BASELINE` history entries at migration
time. Earlier transition dates are unknown and are not synthesized. New and
updated lead/opportunity writes add history in the same transaction. Qualification
stores a unique lead/prospect link, so retrying an already converted lead returns
its linked prospect. Old qualified leads without lineage return 409 and are not
matched to prospects by name.

Interaction requests identify exactly one CRM target with `targetType` (`LEAD`,
`PROSPECT`, `OPPORTUNITY`) and `targetId`. Paginated list endpoints accept the
same pair as query parameters. Page size is capped at 100. Hard deletion of a
lead, prospect or opportunity referenced by history or interactions returns
409, preserving its audit trail. Appointments require `endsAt` after `startsAt`.
Completed activities without `occurredAt` receive a UTC server timestamp.

- `/api/v1/crm/activities`
- `/api/v1/crm/notes`
- `/api/v1/crm/appointments`
- `/api/v1/crm/leads/{id}/history`
- `/api/v1/crm/opportunities/{id}/history`

History actor IDs are populated only when the authenticated request principal
is a UUID; the API does not accept an actor ID from request bodies. CRM currently
has no authentication configuration, so actor fields remain null.

Java 21 `mvn clean verify` passes all 10 PostgreSQL integration tests using the
disposable database runner `verify-local-stack.ps1`. Coverage includes activity,
note and appointment endpoints, lead and opportunity history, hard-delete
protection, validation and missing targets, plus an isolated upgrade from V2/V3
with existing rows to V4. The runner checks CRM migration isolation against
Sales and foreign Flyway sentinels. The CRM frontend is still pending.

## Phase 4 contacts, competitors, and Customer 360

V5 adds CRM contacts with exactly one owner (lead, prospect, opportunity or
external customer UUID), competitors, and opportunity/competitor comparisons.
The database allows one primary contact per owner. Contact list responses are
paginated; page size is capped at 100. Contact CRUD is under
`/api/v1/crm/contacts`. Competitor CRUD and opportunity comparison CRUD are
available under `/api/v1/crm/competitors` and
`/api/v1/crm/opportunities/{id}/competitors`.

`GET /api/v1/crm/customers/{customerId}/360` and
`GET /api/v1/crm/prospects/{prospectId}/360` combine CRM records and recent
interactions with the Sales dashboard when available. CRM calls only the
customer-scoped Sales endpoint `/api/v1/customers/{id}/dashboard`. Connect and
read timeouts bound the call; the response keeps CRM data and reports
`salesStatus` as `AVAILABLE`, `NOT_FOUND`, `UNAVAILABLE`, or `NOT_CONFIGURED`
when enrichment cannot be returned. The Compose default uses
`host.docker.internal:8080`; set `SALES_SERVICE_URL` when Sales uses another
address.

The disposable suite also verifies contact ownership and primary constraints,
competitor comparisons, Customer 360 aggregation and Sales-unavailable fallback,
and an isolated V4-to-V5 migration. All 10 integration tests passed on
3 October 2026.

## Phase 5 campaigns and communications

V6 adds an independent campaign and communication backend. Campaigns support
validated lifecycle changes, budgets and cost records, paginated membership,
member status history, deduplicated touchpoints and explicit attribution links.
Lead qualification and opportunity writes preserve supplied attribution in the
same CRM transaction. Attribution is explicit; delivery status does not imply
that a person responded.

Create and manage campaigns at `/api/v1/crm/campaigns`. Campaign subresources
include `/members`, `/costs` and `/touchpoints`; attribution can be inspected at
`/leads/{id}/attribution`, `/prospects/{id}/attribution` and
`/opportunities/{id}/attribution`. Templates, preferences and message queue
operations are under `/message-templates`, `/contacts/{id}/communication-preferences`
and `/messages`. The CRM Swagger UI lists request/response contracts.

Email and SMS content is rendered and snapshotted when a message is enqueued.
Unknown or opted-out recipient eligibility blocks dispatch. Enqueueing is
idempotent; provider acceptance and confirmed delivery are distinct states.
The default adapters are offline, and the delivery worker is disabled by
default (`CRM_COMMUNICATION_WORKER_ENABLED=false`). Provider callback processing
requires `CRM_COMMUNICATION_CALLBACK_SECRET`; real credentials/provider
selection and authenticated authorization are not configured by this phase.
Do not enable external delivery until authentication/authorization and provider
configuration are established.

The Phase 5 disposable verifier runs Java 21 Maven verification with PostgreSQL
16.15, exercises fresh and V5-to-V6 migrations, and compares a before/after
fingerprint of non-CRM tables, columns, constraints, indexes and relevant
objects against the Sales schema fixture. Phase 5 finished with 13 tests,
0 failures/errors/skips. The verifier makes fixture-only normalizations in a
temporary copy; it does not modify Sales schema source files. Sales browser
workflows and simultaneous live Sales/CRM runtime checks remain pending: the
current frontend tree lacks the `/sales/leads` and `/sales/opportunities`
routes. See [`CRM_PHASE5_PLAN.md`](../CRM_PHASE5_PLAN.md) for the full execution
matrix and remaining safety-gate evidence.

## Phases 6 and 7: contracts, service, and analytics

V7 adds independent CRM contracts and item snapshots, fulfilment records,
warranty claims with status history, and maintenance schedules and visits.
External customer and product IDs remain scalar UUIDs. CRM does not create Sales
orders, inventory movements, accounting entries, or warranty transactions.
Warranty claims require an item with a recorded warranty window. Maintenance
uses a fixed day interval and IANA timezone; a completed visit advances the
schedule's next due date. See
[`CRM_PHASE6_7_PLAN.md`](../CRM_PHASE6_7_PLAN.md) for route details and lifecycle
semantics.

Read-only reports are under `/api/v1/crm/analytics/**` (`overview`, `funnel`,
`pipeline`, `campaigns`, and `service`). Date filters are inclusive UTC dates,
default to the latest 365 days, and are capped at ten years. Contract amounts
are grouped by currency and are not collected revenue. Existing opportunity
amounts have no currency field; their aggregate is raw and unconverted. Campaign
reports use explicit attribution records and do not claim ROI.

V8 adds only CRM reporting indexes. Phase 8 prerequisite verification on
3 October 2026 passed 20 PostgreSQL integration tests, including V6-to-V8
upgrades, inclusive warranty boundaries, lifecycle transitions, timezone
recurrence, overdue-visit ordering, analytics fixtures and optional filters.
The complete Sales safety gate still requires its outstanding browser evidence.

## Phase 8 frontend

The independent Next.js frontend is implemented in `crm-module/frontend`. See
[`CRM_PHASE8_PLAN.md`](../CRM_PHASE8_PLAN.md). It covers the dashboard,
opportunity Kanban, Customer 360, acquisition and interaction workflows,
campaign/communication screens, and contract/service screens under `/crm/**`.
The implementation adds read-only CRM lookups, opportunity update preconditions,
field validation responses, and service detail endpoints. It preserves Sales
source/routes and all existing CRM migration files. Reports now handle unfiltered
requests correctly and distinguish true stage entry from ordinary edits;
overdue visits cannot move maintenance dates backward.

From `crm-module/frontend`, run `npm ci` and `npm run dev`, then open
`http://127.0.0.1:3008/crm` with the CRM backend running on 8088. Alternatively,
from `crm-module`, use `docker compose --profile frontend up --build -d` for
the optional frontend service. The default backend-only Compose startup and
PostgreSQL volume are preserved. See the
[frontend runbook](frontend/README.md) and
[API contract inventory](frontend/API_CONTRACTS.md) for configuration and limits.

Verification on 3 October 2026: 20 PostgreSQL integration tests, 5 frontend
unit tests and 7 browser tests passed; type checks, lint and production build
passed. Browser tests used disposable CRM data with Sales offline and exercised
acquisition, Kanban, interactions, 360 fallback, reports, communication preparation,
contracts, warranty and maintenance. Production dependency audit found no
vulnerabilities; the development lint dependency advisory is documented in the
frontend runbook.

Repeat local acceptance with
`powershell -NoProfile -File ./verify-local-stack.ps1 -WithBrowser`.
Add `-SalesImage sales-module-backend:latest` to check an existing local Sales
image alongside CRM. This verifies the specified image, not a new Sales source
build. Results are recorded in `phase8-verification.json` after successful runtime
checks. The recorded run passed Sales startup and GET leads/opportunities/customers,
plus two CRM browser smoke tests with both modules running. The Sales image
initialized its disposable schema before the CRM fingerprint; the before/after
hash was `dec44c19e9b712b78beeb1fcb09b5095`. See the actual
[verification evidence](phase8-verification.json).

CRM frontend delivery does not close the full Phase 8 gate: the Sales
source still lacks `/sales/leads` and `/sales/opportunities`, and Sales browser
workflows have not been signed off.

## New to CRM? Start here

CRM means **Customer Relationship Management**. It helps a team keep track of
people and companies that may buy from it, the sales conversations with them,
and the work promised after a sale. In this project, CRM is a separate
application. Its pages live under `/crm`, and its API lives under
`/api/v1/crm`.

Some useful words:

- A **lead** is a person or company the team may want to work with.
- A **prospect** is a company/person record created when a lead is qualified.
- An **opportunity** is a possible deal being worked on. Its sales stage shows
  how far it has progressed.
- An **interaction** is a note, activity, or appointment that records contact
  with someone.
- A **campaign** groups outreach, such as an event or email campaign.
- **Customer 360** is a single view of CRM information for a customer or
  prospect, with optional extra information from Sales when available.

The normal first journey is **Lead → Prospect → Opportunity → update the deal
stage → record follow-ups**. A lead is not automatically a Sales customer. A
WON opportunity records CRM's conversion intent; it does not create a Sales
customer or order. Email and SMS screens prepare messages in an offline queue;
they do not send real messages in the local setup.

## Start the application

You need Docker Desktop with Docker Compose, Node.js 22 or newer, and npm. The
frontend and backend are separate processes during local development. Start the
database and backend first.

1. Open PowerShell in `NextGenERP/crm-module` and create a local password file
   (the `.env` file is ignored by Git):

   ```powershell
   Set-Content .env 'CRM_DB_PASSWORD=choose-a-local-password'
   ```

2. Build and start PostgreSQL and the CRM backend:

   ```powershell
   docker compose up --build -d
   docker compose logs -f crm-module
   ```

   Wait until the logs show that the application has started. The backend API
   is at `http://localhost:8088`; its interactive API reference is at
   `http://localhost:8088/swagger-ui/index.html`.

3. In a second PowerShell window, start the frontend:

   ```powershell
   cd ..\crm-module\frontend
   npm ci
   npm run dev
   ```

4. Open <http://127.0.0.1:3008/crm>. Use the left navigation to open Leads,
   Prospects, Opportunities, Contacts, Campaigns, Communications, Service, and
   Reports.

To stop the containers, run `docker compose down` from `crm-module`. This keeps
the local database volume so records remain next time. The optional frontend
container can instead be started with
`docker compose --profile frontend up --build -d` from `crm-module`.

## Try it from the browser

Use made-up names and addresses. These steps save records into the local CRM
database, so avoid real customer details. Labels can vary slightly as screens
evolve; the route and key field names below match the current frontend.

1. **Add a lead.** Open `/crm/leads/new`. Enter a first name and company name
   (for example, `Jamie` and `Northwind Demo`), then click **Save**. The saved
   lead page should show the company name. Open **Leads** to see it in the list.
2. **Qualify the lead.** On the lead page click **Qualify lead**. CRM should
   create or open the linked prospect and take you to its page. Open the
   **Prospects** workspace and confirm the company appears.
3. **Add an opportunity.** Open `/crm/opportunities/new`. Enter an opportunity
   name, the prospect ID shown on the prospect page, an amount, and a
   probability. Save. The opportunity page should open and retain those values.
4. **Move it through the pipeline.** Open `/crm/opportunities/board`. Find the
   opportunity and select a different stage using its stage selector (or move
   its card). Reload the page: it should still be in the selected stage. Open
   the opportunity again and confirm its prospect and amount are still there.
5. **Record a follow-up.** On a lead, prospect, or opportunity detail page, use
   its notes/activity/appointment sections to add a short note or activity.
   Save and confirm the new entry appears in that record's history/activity
   area.
6. **Check reports.** Open **Reports** and view Overview, Funnel, Pipeline,
   Campaigns, or Service. A newly saved lead and opportunity should affect the
   relevant counts. Reports are read-only; they do not create or change records.

For another simple check, open **Contacts**, create a contact linked to a
customer UUID (a random UUID is fine for a demo), and confirm it appears after
saving. Do not expect Sales enrichment unless Sales is running and has that
customer. A status such as `NOT_FOUND` or `UNAVAILABLE` is a valid fallback.

Communications are safe to explore locally: create a template or prepare a
message only with a demo contact. The default provider is offline and the
delivery worker is disabled. A queued message is not proof of delivery and no
real email or SMS should be sent by this setup.

### What success looks like

- A saved record opens on its own detail page and remains after a browser reload.
- The lead qualification action opens a prospect linked to that lead.
- The opportunity appears in the pipeline stage you selected and keeps its
  other details.
- Notes and activities remain visible on the related record.
- Reports load and reflect the records you added. An empty report is normal
  before you create matching data.
- When the backend is stopped, the frontend displays an error instead of
  pretending a save succeeded. Start the backend and reload to try again.

If a save fails, first check that Docker is running and inspect
`docker compose logs --tail 100 crm-module`. Confirm the backend is reachable at
`http://localhost:8088/swagger-ui/index.html`, then refresh the CRM page. A
validation message usually means a required value is missing or a reference ID
is invalid. An opportunity must be linked to a prospect or customer.

## Implementation phases at a glance

These are the delivery phases documented in this repository. Phases 1–8 are
implemented and locally verified for CRM; the separate, full Sales acceptance
gate described below is still open.

| Phase | What was added |
| --- | --- |
| 1. Backend foundation | CRM backend structure, database entities, and the base needed to build CRM data independently. |
| 2. Core sales lifecycle | Create, read, update, and delete leads, prospects, and opportunities; validate inputs and references; qualify leads safely; handle missing records and conflicts. |
| 3. Interactions and history | Notes, activities, appointments, and an audit history for lead/opportunity changes; conversion links make lead qualification repeatable. |
| 4. Relationships and Customer 360 | Contacts, competitors, opportunity comparisons, and a combined customer/prospect view with optional Sales enrichment. |
| 5. Campaigns and communications | Campaigns, members, costs, touchpoints, attribution, templates, consent preferences, and an offline message queue. |
| 6. Contracts and after-sales service | Contract snapshots and items, fulfilments, warranty claims, maintenance schedules, and visits. These are CRM records and do not create inventory or accounting transactions. |
| 7. Analytics | Read-only overview, funnel, pipeline, campaign, and service reports, with CRM-only reporting indexes. |
| 8. Frontend | A standalone browser workspace for the dashboard, acquisition pipeline, Customer 360, campaigns, communications, service, and reports. |

The phase plans contain the detailed scope and evidence: [Phase 3 and 4
record](../CRM_MRP_REVIEW_AND_PHASE3_PLAN.md), [Phase 5
plan](../CRM_PHASE5_PLAN.md), [Phases 6 and 7
plan](../CRM_PHASE6_7_PLAN.md), and [Phase 8
plan](../CRM_PHASE8_PLAN.md). The Phase 8 record also explains the remaining
Sales gate: required Sales browser routes/workflows have not been signed off.
This does not prevent using and locally verifying the independent CRM.

## Where to make changes

- Browser pages and API display logic: `crm-module/frontend/src`.
- Frontend routes/screens: `crm-module/frontend/src/app/crm` and
  `crm-module/frontend/src/components`.
- Backend API endpoints: `crm-module/backend/src/main/java/com/nextgen/erp/crm/presentation/controller`.
- Backend business rules: `crm-module/backend/src/main/java/com/nextgen/erp/crm/service`.
- Database migrations: `crm-module/backend/src/main/resources/db/migration`.
- Browser and backend verification: `crm-module/frontend/tests` and
  `crm-module/verify-local-stack.ps1`.

Keep CRM endpoints under `/api/v1/crm/**` and schema changes in CRM-owned
objects. Read the [frontend runbook](frontend/README.md) and
[API contract inventory](frontend/API_CONTRACTS.md) before changing those
contracts. To run the full automated local acceptance suite in disposable
containers, use `powershell -NoProfile -File ./verify-local-stack.ps1
-WithBrowser` from `crm-module`; it is separate from the browser-only manual
walkthrough above.
