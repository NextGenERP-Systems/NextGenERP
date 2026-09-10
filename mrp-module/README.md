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

### Running with Docker Compose (Isolated Mode)
```bash
cd mrp-module
docker compose up -d --build
```
- **MRP Dashboard UI**: `http://localhost:3005`
- **Spring Boot API**: `http://localhost:8085/api/v1/mrp/boms`
- **Swagger OpenAPI Docs**: `http://localhost:8085/swagger-ui.html`

### Running Standalone Frontend (Developer Mode)
```bash
cd mrp-module/frontend
npm install
npm run dev
```
Open [http://localhost:3005](http://localhost:3005) in your browser. All features work immediately with the resilient offline mock fallback store!
