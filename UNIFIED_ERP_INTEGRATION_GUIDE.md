# NextGen ERP - Unified Architecture & Integration Guide
**Consolidating Sales, HRM, and Workflow Modules into a Single Unified ERP System**

---

## 1. Executive Summary & Architecture Overview

Currently, **NextGen ERP** consists of three modular applications developed with independent backends, databases, and frontends:
1. **Sales Module**: Spring Boot (`:8080`), PostgreSQL (`nextgen_erp`), Next.js (`:3000`)
2. **HRM Module**: Spring Boot (`:8080`), PostgreSQL (`nextgen_erp`), Next.js (`:3001`)
3. **Workflow & Doc Module**: Spring Boot (`:8081`), PostgreSQL (`nextgen_erp`), Next.js (`:3001` / Next 16)

While having isolated containers and repositories is convenient for initial prototyping, an Enterprise Resource Planning (ERP) platform achieves its core value through **seamless data flow**, **unified authentication (SSO/RBAC)**, **shared transactional integrity**, and a **single user experience (UX)**.

```
+-----------------------------------------------------------------------------------+
|                           UNIFIED FRONTEND (Next.js - Port 3000)                  |
|  [ Global Navigation / App Switcher / Unified Theme / Single Login / RBAC Shell ] |
+-----------------------------------------------------------------------------------+
              |                           |                           |
        /sales/* (Sales)            /hrm/* (HRM)            /workflow/* (Workflows)
              \                           |                           /
               +--------------------------+--------------------------+
                                          |
                         +---------------------------------+
                         |      API GATEWAY / REVERSE PROXY|  (or Single Monolith)
                         |       Nginx / Spring Cloud      |
                         +---------------------------------+
                                    /     |     \
          +------------------------+      |      +------------------------+
          |                               |                               |
+-------------------+           +-------------------+           +-------------------+
|   Sales Service   |           |    HRM Service    |           |  Workflow Service |
| (Spring Boot:8080)|           | (Spring Boot:8081)|           | (Spring Boot:8082)|
+-------------------+           +-------------------+           +-------------------+
          \                               |                               /
           \                              |                              /
            +-----------------------------+-----------------------------+
                                          |
                     +-----------------------------------------+
                     |        CENTRALIZED POSTGRESQL DB        |
                     |  Single Engine (Port 5432)              |
                     |  - Shared Core (`users`, `companies`)   |
                     |  - PostgreSQL Schemas (sales, hrm, wf)  |
                     +-----------------------------------------+
```

---

## 2. Database Unification (Single PostgreSQL Engine)

### 2.1 Schema Strategy: PostgreSQL Schemas vs Public Namespace
To combine the three databases into one PostgreSQL database without table naming collisions, there are two primary patterns:

#### **Pattern A: Multi-Schema Namespace (Recommended for High Modular Cleanliness)**
PostgreSQL natively supports separate `SCHEMAS` within the same database:
- `core`: Shared tables (`users`, `roles`, `companies`, `audit_logs`, `attachments`)
- `sales`: Sales tables (`customers`, `quotations`, `sales_orders`, `sales_invoices`, `delivery_notes`, `items`, `price_lists`)
- `hrm`: HRM tables (`departments`, `designations`, `branches`, `employees`, `attendance`, `leaves`, `payroll`, `salary_slips`)
- `workflow`: Workflow tables (`workflows`, `workflow_states`, `workflow_transitions`, `document_templates`, `ai_ocr_extractions`)

```sql
-- Create isolated schemas
CREATE SCHEMA IF NOT EXISTS core;
CREATE SCHEMA IF NOT EXISTS sales;
CREATE SCHEMA IF NOT EXISTS hrm;
CREATE SCHEMA IF NOT EXISTS workflow;
```

#### **Pattern B: Single Consolidated `public` Schema with Domain Prefixes**
Since all three modules already have largely unique table names (e.g., `quotations`, `employees`, `workflows`), they can exist in the `public` schema by unifying only the overlapping tables (`users`, `audit_logs`).

---

### 2.2 Unifying Shared Entities & Foreign Key Relationships

#### 1. Single Source of Truth for Users & Authentication
Instead of each module having its own `users` table:
```sql
CREATE TABLE core.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE core.roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE, -- 'ROLE_ADMIN', 'ROLE_HR_MANAGER', 'ROLE_SALES_MANAGER'
    description TEXT
);

CREATE TABLE core.user_roles (
    user_id UUID REFERENCES core.users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES core.roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);
```

#### 2. Cross-Module Foreign Keys
Once unified, entities can cross-reference naturally:
* **HRM to Core**: `hrm.employees.user_id REFERENCES core.users(id)`
* **Sales to HRM**: `sales.sales_orders.sales_person_id REFERENCES hrm.employees(id)`
* **Sales to Workflow**: Workflow engine attaches to Sales Orders via `workflow.workflow_transitions.document_type = 'SALES_ORDER'` and `document_id = sales_orders.id`.
* **HRM to Workflow**: Leave applications approvals run through the workflow state engine.

---

### 2.3 Consolidated Database Initialization Script
Create a unified migration directory:
```
NextGenERP/database/
├── 00-init-extensions-and-schemas.sql
├── 01-core-schema.sql
├── 02-hrm-schema.sql
├── 03-sales-schema.sql
├── 04-workflow-schema.sql
├── 05-unified-seed-data.sql
```

---

## 3. Backend Unification Architectures

Depending on the team's operational preference, there are two distinct architecture approaches:

---

### Option 1: Multi-Module Spring Boot Monolith (Fastest & Simplest to Maintain)
Convert the individual Spring Boot projects into a **Maven Multi-Module Project**.

#### Project Directory Structure:
```
NextGenERP/backend/
├── pom.xml (Parent POM)
├── erp-core/             # Shared entities, JWT security, Common DTOs, Exception Handlers
│   ├── pom.xml
│   └── src/main/java/com/nextgen/erp/core/
├── erp-sales/            # Sales Controllers, Services, Repositories
│   ├── pom.xml
│   └── src/main/java/com/nextgen/erp/sales/
├── erp-hrm/              # HRM Controllers, Services, Repositories
│   ├── pom.xml
│   └── src/main/java/com/nextgen/erp/hrm/
├── erp-workflow/         # Workflow & Document Automation Services
│   ├── pom.xml
│   └── src/main/java/com/nextgen/erp/workflow/
└── erp-server/           # Main SpringBootApplication runnable on port 8080
    ├── pom.xml
    └── src/main/java/com/nextgen/erp/NextGenErpApplication.java
```

#### Benefits of Option 1:
1. **Single JAR & Single JVM**: Runs inside one container (minimal memory footprint).
2. **ACID Transactions**: Can perform cross-module atomic transactions (e.g. approving a sales commission directly generating an HRM payroll bonus entry in a single transaction `@Transactional`).
3. **Single Port (`8080`)**: All APIs unified under:
   - `/api/auth/**`
   - `/api/sales/**`
   - `/api/hrm/**`
   - `/api/workflow/**`
4. **Unified Spring Security**: A single JWT filter validates tokens across all routes.

---

### Option 2: Microservices with API Gateway & Shared Database (Preserves Existing Codebases)
If you want to keep the existing Spring Boot codebases untouched:

#### Port & Route Allocation:
* **API Gateway (Nginx or Spring Cloud Gateway)**: Port `8080` (public entry point)
* **Auth & Core Service**: Port `8081` (Handles Login, JWT, User Management)
* **Sales Service**: Port `8082` (Routes: `/api/sales/**`)
* **HRM Service**: Port `8083` (Routes: `/api/hrm/**`)
* **Workflow Service**: Port `8084` (Routes: `/api/workflow/**`)

#### Shared JWT Secret:
All microservices use the **exact same JWT signing secret** (`JWT_SECRET_KEY`) so that a token issued by the Auth service is trusted and parsed by Sales, HRM, and Workflow without inter-service RPC calls.

---

## 4. Frontend Unification (Single Next.js Portal)

### 4.1 Root Shell & App Router Organization
Merge the three Next.js frontends into one unified Next.js App Router project.

```
NextGenERP/frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx               # Main ERP Shell (Sidebar, Topbar, Global Search)
│   │   │   ├── page.tsx                 # Central Executive Dashboard
│   │   │   │
│   │   │   ├── sales/                   # Merged from sales-module/frontend/src/app/sales
│   │   │   │   ├── customers/
│   │   │   │   ├── quotations/
│   │   │   │   ├── orders/
│   │   │   │   ├── invoices/
│   │   │   │   └── analytics/
│   │   │   │
│   │   │   ├── hrm/                     # Merged from hrm-module/frontend/src/app/hrm
│   │   │   │   ├── employees/
│   │   │   │   ├── attendance/
│   │   │   │   ├── leaves/
│   │   │   │   └── payroll/
│   │   │   │
│   │   │   ├── workflow/                # Merged from workflow-module/frontend/src/app
│   │   │   │   ├── templates/
│   │   │   │   ├── designer/
│   │   │   │   ├── approvals/
│   │   │   │   └── ocr/
│   │   │   │
│   │   │   └── settings/                # Unified Administration
│   │   │       ├── users/
│   │   │       ├── roles/
│   │   │       └── company/
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── UnifiedSidebar.tsx       # Collapsible navigation with Module Switcher
│   │   │   ├── Topbar.tsx              # Notifications, User Profile, Global Search
│   │   │   └── ModuleSwitcher.tsx      # Dropdown to jump between Sales, HRM, Workflow
│   │   ├── ui/                         # Shared Shadcn / Radix UI components
│   │   └── common/                     # Unified Data Tables, Status Badges, OCR viewer
│   │
│   ├── lib/
│   │   ├── api-client.ts               # Axios / Fetch client with unified Bearer Token interceptor
│   │   └── auth.ts                     # Single Session / JWT handler
│   └── types/                          # Shared TypeScript interfaces
```

### 4.2 Unified Navigation & Module Switcher UI Pattern
The main sidebar provides quick-switching between modules while preserving standard breadcrumbs:

```tsx
// Example Module Switcher Concept
export const ERP_MODULES = [
  { id: 'sales', label: 'Sales & Distribution', icon: ShoppingCart, href: '/sales/orders' },
  { id: 'hrm', label: 'Human Resource Management', icon: Users, href: '/hrm/employees' },
  { id: 'workflow', label: 'Workflow & Automation', icon: GitMerge, href: '/workflow/designer' },
  { id: 'analytics', label: 'Executive Analytics', icon: BarChart3, href: '/dashboard' },
  { id: 'settings', label: 'System Administration', icon: Settings, href: '/settings/users' }
];
```

### 4.3 Unified API Client Configuration
All frontend requests flow to a single base API URL:
```typescript
// src/lib/api-client.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
});

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

---

## 5. Unified Docker Architecture (`docker-compose.yml`)

Here is the blueprint for running the entire unified NextGen ERP system with **1 Database container**, **Backend service(s)**, and **1 Frontend container**:

```yaml
version: '3.8'

services:
  # =========================================================================
  # 1. Centralized PostgreSQL Database
  # =========================================================================
  db:
    image: postgres:16-alpine
    container_name: nextgen_erp_db
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${DB_USER:-postgres}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-postgres}
      POSTGRES_DB: ${DB_NAME:-nextgen_erp}
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./database/init-schemas:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-postgres} -d ${DB_NAME:-nextgen_erp}"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - erp_network

  # =========================================================================
  # 2. Unified Backend (Spring Boot Monolith or Gateway)
  # =========================================================================
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: nextgen_erp_backend
    restart: unless-stopped
    ports:
      - "8080:8080"
    environment:
      SPRING_PROFILES_ACTIVE: prod
      SPRING_DATASOURCE_URL: jdbc:postgresql://db:5432/nextgen_erp
      SPRING_DATASOURCE_USERNAME: ${DB_USER:-postgres}
      SPRING_DATASOURCE_PASSWORD: ${DB_PASSWORD:-postgres}
      SPRING_JPA_HIBERNATE_DDL_AUTO: update
      JWT_SECRET: ${JWT_SECRET:-9a6182c617b2f09b1eab8523f2f0fc91d3d139e}
      GOOGLE_CLOUD_PROJECT: ${GOOGLE_CLOUD_PROJECT:-nextgen-erp-7753216}
    depends_on:
      db:
        condition: service_healthy
    networks:
      - erp_network

  # =========================================================================
  # 3. Unified Frontend (Next.js Application)
  # =========================================================================
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        NEXT_PUBLIC_API_URL: http://localhost:8080/api
    container_name: nextgen_erp_frontend
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - BACKEND_INTERNAL_URL=http://backend:8080/api
    depends_on:
      - backend
    networks:
      - erp_network

volumes:
  pgdata:
    driver: local

networks:
  erp_network:
    driver: bridge
```

---

## 6. Migration Roadmap (Step-by-Step)

| Phase | Milestone | Deliverable |
| :--- | :--- | :--- |
| **Phase 1: DB Merge** | Unify schema into single DB | Run combined schema on single PostgreSQL instance. Reconcile `users` and seed data. |
| **Phase 2: Auth Sync** | Shared JWT & RBAC | Standardize JWT claims across all endpoints (`/api/auth`, `/api/sales`, `/api/hrm`, `/api/workflow`). |
| **Phase 3: Frontend Shell**| Create Unified App Shell | Setup top-level Next.js repo with unified sidebar, routing `/sales`, `/hrm`, `/workflow`, and single login page. |
| **Phase 4: Component Copy**| Migrate pages & components | Copy page components from independent module frontend folders into matching subdirectories. |
| **Phase 5: Unified Docker**| Single Compose file | Verify `docker compose up -d` boots up the whole suite cleanly on ports `3000` (UI) and `8080` (API). |

---
*NextGen ERP Architectural Blueprint*
