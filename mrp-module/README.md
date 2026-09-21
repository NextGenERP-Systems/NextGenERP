# NextGen ERP - Production & Manufacturing (MRP) Module

> An enterprise Production & Manufacturing (MRP) module developed in **absolute isolation** for NextGenERP. Engineered with a **Java 21 / Spring Boot 3** backend, **Next.js 14 / Tailwind CSS / Lucide / Recharts (Zinc/Grey glassmorphism)** frontend, **PostgreSQL 15+** relational engine, PostgreSQL **Recursive Common Table Expressions (CTEs)** for multi-level BoM tree explosions, **Pessimistic Row Locking (`SELECT FOR UPDATE`)** for real-time concurrency control, **Parent-Child Work Order foreign key (`parent_wo_id`)** tracking, and **PostgreSQL Row Level Security (RLS)** policies.

---

## 1. Domain Architecture & ERPNext Mapping

| ERPNext Feature | NextGen ERP Implementation | Technical Highlights |
| :--- | :--- | :--- |
| **Multi-Level BoM Explosion** | `view_mrp_bom_explosion` CTE View | PostgreSQL Recursive CTE explodes 10+ levels of sub-assemblies directly in DB layer, returning depth & path. |
| **Nested Work Orders** | `WorkOrder` (`parent_wo_id`) | Automatic parent-child hierarchy linking sub-assembly production to main finished goods Work Orders. |
| **Real-Time Consumption** | `WorkOrderItem` (`actual_consumed_qty`) | Real-time shop floor logging with over-consumption tracking and standard cost variance reporting. |
| **Concurrency Protection** | `@Lock(LockModeType.PESSIMISTIC_WRITE)` | Prevents race conditions and double-counting during simultaneous shop floor Job Card completions. |
| **MRP Wizard** | `MrpWizardService` | 4-Step Material Shortage calculator exploding BoMs against inventory stock. |
| **Sandbox Security** | PostgreSQL RLS (`mrp_shop_floor_worker` vs `mrp_production_manager`) | Enforces role-based data isolation right in the database layer. |
| **Data Teardown Script** | `teardown-sandbox.sql` | One-click clean truncation of mock testing states. |

---

## 2. Directory Structure

```
NextGenERP/
└── mrp-module/
    ├── backend/                      # Java 21 / Spring Boot 3 / JPA / PostgreSQL CTE / OpenAPI
    │   ├── src/main/java/com/nextgen/erp/mrp/
    │   │   ├── domain/               # Entities (Bom, WorkOrder, JobCard, Workstation) & Repositories
    │   │   ├── application/          # Services (BomService, WorkOrderService, JobCardService, MrpWizardService)
    │   │   ├── config/               # Security & CORS Config
    │   │   └── presentation/         # REST Controllers & Swagger APIs
    │   ├── pom.xml
    │   └── Dockerfile
    ├── frontend/                     # Next.js 14 (App Router) / TypeScript / Tailwind / Lucide
    │   ├── src/app/
    │   │   ├── page.tsx              # Executive KPI Dashboard & Variance Charts
    │   │   ├── boms/page.tsx         # Interactive BoM Visual Tree Explosion
    │   │   ├── work-orders/page.tsx  # Work Order Command Center & Nested Hierarchy
    │   │   ├── job-cards/page.tsx    # Mobile/Tablet Worker Execution & Over-Consumption Modal
    │   │   ├── workstations/page.tsx # Machine Capacity & Load Gantt View
    │   │   ├── mrp-wizard/page.tsx   # 4-Step Material Shortage & Production Plan Wizard
    │   │   ├── quality/page.tsx      # Quality Inspection Checklist
    │   │   └── sandbox/page.tsx      # Teardown Script Execution & RLS Role Switcher
    │   ├── src/components/           # Navbar, Sidebar, Zinc/Grey Layout
    │   ├── src/lib/api.ts            # API Client with Resilient Offline Fallback
    │   └── Dockerfile
    ├── database/
    │   ├── init-schema.sql           # PostgreSQL Schema (CTEs, RLS, Parent WO Foreign Keys)
    │   ├── seed-data.sql             # Enterprise Seed Dataset (Multi-level EV Drone BOM)
    │   └── teardown-sandbox.sql      # Sandbox Teardown & Reset Script
    ├── docker-compose.yml            # Isolated Multi-container Orchestration
    └── README.md
```

---

## 3. Quick Start & Local Execution

### Running with Docker Compose (Cloud-Connected Local Mode)
```bash
cd mrp-module
# Start the IAP tunnel in a separate terminal first:
# powershell -ExecutionPolicy Bypass -File .\connect-cloud-db.ps1
docker compose up -d --build
```
- **MRP Dashboard UI**: `http://localhost:3005`
- **Spring Boot API**: `http://localhost:8085/api/v1/mrp/boms`
- **Swagger OpenAPI Docs**: `http://localhost:8085/swagger-ui.html`
- **Database identity check**: `http://localhost:8085/api/v1/mrp/runtime/database`
- **Database**: the Dockerized backend connects through the IAP tunnel to the persistent GCP `nextgen_mrp` database on local port `5433`.
- Set `SPRING_DATASOURCE_USERNAME` and `SPRING_DATASOURCE_PASSWORD` before starting the Compose stack.
- Normal mode keeps `NEXT_PUBLIC_MRP_DEMO_MODE=false`; enable demo fallback explicitly only for demonstrations.
- Flyway remains disabled by default during normal application startup. Structural changes must use the reviewed, guarded migration job after backup and validation.

### Optional Local PostgreSQL Test Mode

The normal Compose stack does not start a local PostgreSQL container. For isolated tests or offline development only:

```bash
docker compose -f docker-compose.test.yml up -d --build
```

This test mode uses the local `nextgen-mrp-postgres-test` container and must not be used for normal development data.

To test Flyway against a disposable fresh schema:

```powershell
docker compose -p mrp-flyway-test -f docker-compose.test.yml -f docker-compose.flyway-test.yml up -d --build
docker compose -p mrp-flyway-test -f docker-compose.test.yml -f docker-compose.flyway-test.yml down -v
```

To verify that the current migration chain applies successfully to the disposable schema:

```powershell
powershell -ExecutionPolicy Bypass -File .\verify-flyway-stack.ps1
```

This override is test-only; never use it with the cloud-connected Compose profile.

For the manual cloud deployment migration job, set the database credentials and
explicitly choose the baseline mode after backup and restore verification:

```powershell
$env:SPRING_FLYWAY_BASELINE_ON_MIGRATE = "false"
powershell -ExecutionPolicy Bypass -File .\run-mrp-migration.ps1 -ConfirmProductionMigration
```

Set `SPRING_FLYWAY_BASELINE_ON_MIGRATE` to `true` only for the reviewed
one-time baseline of an existing schema without Flyway history. Never use the
migration job with seed data or disposable database initialization scripts.

### Manual Production Deployment

Production uses the dedicated MRP-only `docker-compose.production.yml`, not the
developer Compose file. Set versioned `MRP_BACKEND_IMAGE` and `MRP_FRONTEND_IMAGE`
values plus the single `nextgen_mrp` JDBC URL and separate application/migration
credentials on the VM. After backup and migration review, run:

```powershell
powershell -ExecutionPolicy Bypass -File .\deploy-mrp-production.ps1 -ConfirmProductionDeployment
```

The wrapper validates the target database and runs the migration profile before
starting the application services. It is never run automatically by local code changes.

Run the repeatable local smoke gate with:

```powershell
powershell -ExecutionPolicy Bypass -File .\verify-local-stack.ps1
```

### Running Standalone Frontend (Developer Mode)
```bash
cd mrp-module/frontend
npm install
npm run dev
```
Open [http://localhost:3005](http://localhost:3005) in your browser. Normal development reads and writes the persistent cloud database. Offline mock behavior is available only when `NEXT_PUBLIC_MRP_DEMO_MODE=true` is explicitly supplied before building the frontend image.
