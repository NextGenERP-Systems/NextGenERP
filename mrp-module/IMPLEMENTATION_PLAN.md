# MRP Module Implementation Plan

## Implementation status — current baseline

### Completed cloud-development gate

- The single persistent GCP database `nextgen_mrp` is reachable through the IAP tunnel.
- The reviewed Flyway chain has been applied successfully through V29.
- Read-only verification confirmed PostgreSQL 16.15, `uuid-ossp`, 34 public tables and successful Flyway history.
- The local Docker backend and frontend were verified against `nextgen_mrp`; the runtime endpoint reported database `nextgen_mrp`, migration `29` and status `UP`.
- The backend was verified using the restricted `mrp_app` login; `mrp_migration` is reserved for Flyway operations.
- The normal local Compose stack starts only MRP backend/frontend services; it does not start a PostgreSQL container.

The following slices are implemented and verified against the disposable Docker PostgreSQL stack using the single database name `nextgen_mrp`:

- Cloud-connected Compose configuration with local Docker application services and no normal local PostgreSQL dependency.
- Flyway migrations through V29, including MRP runs, inventory movements, quality constraints, state-transition audit history, BOM revision uniqueness, effective-date filtering, explicit planning dates, calculation cutoffs, execution quantity/date constraints, Job Card operation traceability, active time-log uniqueness, unique MRP requirement snapshots, MRP-run production-plan lineage, Work Order plan lineage, operation/time-log state constraints and production-plan quantity bounds.
- MPS draft/submission/conversion lifecycle with idempotent retries.
- Persisted MRP calculation snapshots and planner review with idempotent review.
- MRP shortage recommendations now distinguish manufactured subassemblies from purchasable leaf items using the MRP BOM master.
- BOM validation and approval lifecycle.
- Work Order submission, child dependency validation and quality-gated completion.
- Idempotent material consumption and finished-goods movement recording.
- Idempotent MRP inventory reservations created when work orders are submitted.
- Job Card `ISSUE_TO_WIP` and `SCRAP` movements with idempotent start/completion retries.
- Work-order material and operating-cost snapshots derived from BOM definitions.
- Explicit idempotent MRP run release transition (`REVIEWED` -> `RELEASED`).
- Explicit MRP-run-to-production-plan lineage and idempotent Work Order generation from submitted plans.
- Manufactured-subassembly shortage actions now generate idempotent child Work Orders under the generated parent Work Order.
- Work Order completion now persists produced quantity and actual execution timestamps alongside finished-goods movement.
- Work Order completion retries reconcile an existing finished-goods movement with the Work Order state.
- Job Card operation progress uses a pessimistic database lock to prevent concurrent quantity overwrites.
- Final Job Card completion requires cumulative passed inspection quantity to cover the completed quantity.
- Final Work Order completion requires cumulative passed inspection quantity to cover the production quantity.
- Database constraint failures now return a stable API conflict response without exposing SQL details.
- Readable inventory movement and state-transition audit APIs.
- Audited state transitions for MPS submission/conversion, Production Plan generation/submission, MRP review, Quality Inspection creation, Work Order execution, and Job Card execution.
- Dockerized backend tests, frontend build, migration smoke tests and end-to-end local-stack verification.
- Guarded migration-only Compose job with explicit baseline control for manual cloud deployment.
- Read-only Production Plans frontend view with persisted plan, source MRP run and planned/produced quantity visibility.
- Persisted MRP Runs frontend view with review, release and Production Plan commands.
- Production Plans frontend controls for submit and idempotent Work Order generation.
- Search and client-side pagination for persisted MRP Runs and Production Plans.
- Client-side pagination for the persisted Work Orders operational view.
- Search and client-side pagination for the Job Cards execution view.
- Search and client-side pagination for the Quality Inspection log view.
- Search and client-side pagination for the BoM selection view.
- Dedicated `docker-compose.production.yml` with separate migration profile and application/migration credentials; Compose configuration validated without deployment.
- Guarded `deploy-mrp-production.ps1` wrapper requiring explicit confirmation, validating the single `nextgen_mrp` JDBC target and refusing to start services when migration fails.
- Production wrapper now waits for backend actuator and frontend HTTP health checks before reporting deployment success.
- Frontend production build and disposable PostgreSQL end-to-end verification after the Production Plans slice.

The next implementation gate is to complete the remaining MRP-only execution and frontend contract coverage, then prepare the manual GCP deployment runbook. Cross-module integration remains deferred. The initial MRP database migration is complete; future structural migrations still require backup, review and the guarded migration job.

## Decision

Use one dedicated persistent database for the MRP module:

- `nextgen_mrp`: the single MRP database used by local Docker development, cloud deployment and production.

The MRP frontend and backend will run locally in Docker. During normal development, the backend will connect through the existing IAP tunnel to `nextgen_mrp`. A local PostgreSQL container remains available only for isolated tests or offline work.

No MRP-to-Sales, MRP-to-HRM, MRP-to-Accounting, or other module integration will be implemented in this phase. MRP will use its current isolated foundation and mock/reference data until the later integration phase.

## Current deployment facts

- The previous MRP Compose configuration started a local PostgreSQL container; normal development now targets the persistent `nextgen_mrp` database through the IAP tunnel. An isolated test-only PostgreSQL container remains available.
- `mrp-module/connect-cloud-db.ps1` forwards local port `5433` to the GCP VM PostgreSQL port.
- Workflow provides the preferred operating pattern: Dockerized application services connecting to a persistent cloud database through `host.docker.internal` and an IAP tunnel.
- The MRP backend uses `ddl-auto: none`; schema changes must therefore be delivered explicitly.
- The GCP VM is currently running and hosts the existing PostgreSQL container. Do not start, restart or modify the VM automatically as part of code changes.

## Non-negotiable safeguards

1. `nextgen_mrp` is the only MRP database; do not create a second MRP database.
2. Never apply seed data or destructive initialization scripts to the persistent database.
3. Never use Hibernate `ddl-auto: update` against the cloud database.
4. Take and verify a backup before every structural migration.
5. Keep MRP database tables and migrations inside the MRP module.
6. Do not add cross-module database foreign keys or direct database reads.
7. Keep the current unrelated `.gitignore` change untouched.

## Target operating model

### Local development

```text
Browser
  -> MRP frontend container
  -> MRP backend container
  -> host.docker.internal:5433
  -> IAP tunnel
  -> GCP PostgreSQL / nextgen_mrp
```

Required local steps:

1. Start the IAP tunnel.
2. Start the MRP frontend/backend Compose profile.
3. Confirm the backend health response identifies `nextgen_mrp` and the expected environment.
4. Apply reviewed database migrations before exercising changed schema behavior.

### Production deployment

```text
Versioned MRP images on the VM
  -> migration job using a migration role
  -> validation
  -> MRP backend/frontend Compose services
  -> nextgen_mrp production database
```

The migration job and application runtime must use separate database credentials.

## Phase 0 — Cloud and data safety baseline

### Work items

- Verify the GCP VM state and actual PostgreSQL container name.
- Verify that `nextgen_mrp` exists and identify its PostgreSQL version and extensions.
- Capture a schema-only dump, data row counts, indexes, constraints and database size.
- Create a full backup and restore it into a temporary database.
- Confirm that the existing `nextgen_mrp` database is the single MRP database used by the VM deployment and local IAP-connected development.
- Decide which controlled reference-data operations are allowed against the persistent database; never run the full sandbox seed script automatically.
- Record the database connection and backup runbook.

### Exit gate

The single `nextgen_mrp` database is reachable through the IAP tunnel, backup restoration is verified, and the live database topology is documented.

## Phase 1 — Cloud-connected Docker development

### Work items

- Add a cloud-development Compose profile for MRP.
- Configure the backend to use `host.docker.internal:5433/nextgen_mrp`.
- Add the Docker host gateway mapping required by Windows.
- Remove the local PostgreSQL service from the normal cloud-development profile.
- Keep a separate local-database test profile for repeatable automated tests.
- Add a backend health response showing database name, environment and migration version without exposing credentials.
- Verify that frontend requests continue to use the local MRP backend.

### Exit gate

Editing MRP locally in Docker reads and writes the one persistent GCP MRP database through the tunnel.

## Phase 2 — Versioned schema migrations

### Work items

- Add Flyway to the MRP backend.
- Baseline the actual existing MRP schema rather than assuming `init-schema.sql` is current.
- Create a migration role and a restricted application role. **Completed:** `mrp_migration` and `mrp_app` are configured and the local backend runs with `mrp_app`.
- Convert future schema changes into numbered migration files.
- Separate structural migrations, reference data and sandbox seed data.
- Add migration checks to the local cloud-development startup process.
- Replace the current remote initialization approach with backup, migrate and validate commands.
- Test every migration against a restored copy of production before applying it to production.

### Exit gate

The same migration sequence works against the persistent `nextgen_mrp` database and a restored backup copy, with no destructive initialization step.

## Phase 3 — MRP domain and schema integrity

### Work items

- Define explicit state machines for BoMs, MRP runs, production plans, work orders, operations, Job Cards and inspections.
- Add database checks for quantities, dates, rates, confidence values and supported statuses.
- Add indexes for operational foreign keys and planning queries.
- Align JPA entities with all live schema fields.
- Remove automatic creation of placeholder items and BoMs from production workflows.
- Introduce immutable BoM revisions with approval status and effective dates.
- Preserve the exact BoM revision used by each production plan and work order.
- Add audit history for state transitions and critical manufacturing commands.

### Exit gate

Invalid quantities, invalid transitions, missing master records and edits to released manufacturing definitions are rejected consistently by the application and database.

## Phase 4 — Deterministic BoM and MRP engine

### Work items

- Validate BoM cycles before approval.
- Validate sub-BoM output items and UOM compatibility.
- Correct recursive explosion quantity normalization using each BoM output quantity.
- Filter explosions to approved and effective revisions.
- Distinguish manufactured subassemblies from purchasable/raw leaf requirements.
- Aggregate requirements by item, warehouse and requirement date.
- Add persisted MRP run records containing input parameters and a data cutoff.
- Persist exploded requirements, stock allocations, shortages and recommended actions.
- Add planner review, override reasons and approval before release.
- Make repeated calculations and releases idempotent.

### Exit gate

A fixed database snapshot and fixed planning input always produce reproducible requirements, allocations and shortage results.

## Phase 5 — Production planning and work-order execution

### Work items

- Link each production-plan item to its MRP run and generated work orders.
- Release plans idempotently.
- Generate parent and child work orders from approved MRP actions.
- Snapshot material and operation requirements into the work order.
- Link each Job Card to one specific work-order operation.
- Implement start, pause, resume and complete commands with validation.
- Enforce one active time log per Job Card and employee.
- Update operation progress and work-order produced quantities atomically.
- Enforce child work-order dependencies.
- Reconcile planned and actual material, labor, scrap and operating costs.

### Exit gate

One approved plan quantity can be traced through parent/child work orders, operations and Job Cards without duplicate release or completion records.

## Phase 6 — Isolated MRP inventory and quality closure

This phase improves the current MRP sandbox inventory model only. It does not integrate with Sales or another module.

### Work items

- Replace mutable consumption counters with auditable MRP inventory movements.
- Add reservation, stores-to-WIP, consumption, reversal, scrap and finished-goods movement types.
- Add source-document and idempotency references to movements.
- Attach inspections to work orders, operations, templates and quantities.
- Calculate reading status on the server from quality limits.
- Reject incomplete mandatory inspections.
- Prevent finished-goods completion until required quality gates pass.

### Exit gate

Completing a Job Card or work order produces consistent MRP-side consumption, scrap, quality, finished quantity and cost records.

## Phase 7 — Workflow-aligned MRP frontend

### Work items

- Keep the existing MRP App Router structure and centralized API client.
- Match the Workflow module’s enterprise layout, blue/slate visual language and operational dashboard approach.
- Add dashboard metrics for shortages, work-order state, capacity and cost variance.
- Add searchable, paginated views for BoMs, MRP runs, plans, work orders, Job Cards and quality inspections. Production Plans now has the initial searchable persisted view; the remaining views and pagination are still pending.
- Add clear loading, empty, validation and backend-error states.
- Keep mock fallback behind an explicit demo mode; normal development must use `nextgen_mrp`.
- Add state-transition controls instead of unrestricted entity editing. MRP Run review/release/plan creation and Production Plan submit/Work Order generation are now covered; remaining screens still require the same contract treatment.

### Exit gate

Every normal MRP UI action persists to the cloud development database and can be verified through the API and database records.

## Phase 8 — Manual GCP deployment

### Work items

- Add a dedicated MRP production Compose definition without combining MRP source code with other modules.
- Use versioned backend and frontend images.
- Run the migration job before starting the new backend.
- Validate migration version, database connectivity and key table counts.
- Deploy the MRP services manually through the VM Compose workflow.
- Add health, log and resource checks suitable for the VM’s available capacity.
- Document rollback as application-image rollback plus forward-fix migration policy.

### Exit gate

The MRP release process can be repeated manually with a backup, migration, validation, deployment and smoke-test record.

## Phase 9 — MRP-only AI features

AI is deferred until deterministic planning and execution are stable.

- Add forecast-run provenance, model/version and confidence metadata.
- Persist AI recommendations separately from approved ERP facts.
- Run inference asynchronously with retry and failure states.
- Require human approval before AI recommendations create planning actions.
- Provide deterministic behavior when AI is unavailable.

## Verification strategy

Each work item must include tests at the appropriate level:

- Migration tests against PostgreSQL.
- BoM explosion golden cases, including cycles and repeated components.
- State-transition tests.
- Concurrent Job Card and material-consumption tests.
- Idempotent retry tests.
- Database constraint tests.
- End-to-end cloud-development tests from BoM through work-order completion.
- Frontend API contract tests.
- Production deployment smoke tests using a restored database copy.

## First implementation batch

The first implementation batch should be:

1. Cloud VM/database read-only verification and backup runbook.
2. Read-only verification and backup validation for the single persistent `nextgen_mrp` database.
3. Cloud-development Docker profile using the IAP tunnel.
4. Flyway baseline against the existing `nextgen_mrp` schema.
5. Migration and environment health checks.

Only after these five items are verified should domain schema changes or new MRP functionality be implemented.
