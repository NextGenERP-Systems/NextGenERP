# NextGen ERP - Document & Workflow Automation Module

> A state-of-the-art enterprise Workflow & Document Automation system inspired by ERPNext, engineered with a **Java 21 / Spring Boot 3** backend, **Next.js 16 (Turbopack) / Tailwind CSS** frontend, **PostgreSQL 16** relational engine, and fully containerized for seamless development and deployment.

---

## 1. Domain Architecture & ERPNext Mapping

| ERPNext Workflow Feature | NextGen ERP Workflow Implementation | Technical Highlights |
| :--- | :--- | :--- |
| **Workflow State Machine** | `Workflow` + `WorkflowState` Aggregate | Configurable initial, optional, and final states, color-coded state tracking, dynamic update values. |
| **Workflow Transitions** | `WorkflowTransition` + `WorkflowTransitionRepository` | Rule-based transitions, role-based access control, condition expressions (SpEL), self-approval checks, and action tracking. |
| **Document Actions** | `DocumentService` + `WorkflowAction` | Approve, Reject, Submit actions driving state transitions. Comprehensive exception handling for illegal state changes. |
| **Audit Trail (History)** | `WorkflowHistory` | Complete provenance of document lifecycle events (who transitioned what, when, and from/to states) with user comments. |
| **Template Engine** | `DocumentTemplate` | Dynamic HTML templates for contracts, NDAs, and standard business documents. |
| **Roles & Permissions** | `Role` + `User` | Unified matrix tracking Users (admin, hr, finance, employee) against specific Roles (ADMIN, MANAGER, HR_MANAGER, FINANCE, EMPLOYEE). |

---

## 2. Directory Structure

```
NextGenERP/
└── workflow-module/
    ├── backend/                      # Java 21 / Spring Boot 3 / JPA
    │   ├── src/main/java/com/nextgen/erp/workflow/
    │   │   ├── domain/               # Core DDD Aggregates
    │   │   ├── application/          # Use Cases, DTOs, Services
    │   │   ├── infrastructure/       # JPA Repositories, DatabaseSeeder
    │   │   └── presentation/         # REST Controllers & API Endpoints
    │   └── Dockerfile                # Multi-stage Maven build
    ├── frontend/                     # Next.js 16 (App Router) / TypeScript
    │   ├── src/app/workflows/
    │   │   ├── dashboard/            # High-level analytics
    │   │   ├── documents/            # Document Listing & Details
    │   │   ├── approvals/            # Manager Inbox & Approvals Queue
    │   │   ├── kanban/               # Drag-and-drop state boards
    │   │   └── setup/                # System configuration (Roles, Workflows, Templates, Transitions)
    │   ├── src/components/           # NextGenERP standardized blue-600 Design System
    │   ├── src/lib/api.ts            # Centralized API Fetch Client
    │   └── Dockerfile                # Dev container with HMR (Hot Module Replacement)
    ├── database/                     # Backup guides & scripts
    └── docker-compose.yml            # Multi-container orchestration (PostgreSQL, Backend, Frontend)
```

---

## 3. Quick Start & Local Execution

We use a fully dockerized environment that supports **Hot Module Replacement (HMR)** for the frontend, allowing real-time UI updates without container restarts.

### Running with Docker Compose

1. **Start the containers in detached mode:**
   ```bash
   cd workflow-module
   docker-compose up -d --build
   ```

2. **Access the Application:**
   - **Frontend UI Portal**: [http://localhost:3002](http://localhost:3002)
   - **Spring Boot API Base URL**: [http://localhost:8082/api/v1](http://localhost:8082/api/v1)
   - **PostgreSQL Database**: `localhost:5432`

### Container Configuration
- **Database Seeding**: On startup, the Spring Boot `DatabaseSeeder` automatically initializes the schema and injects essential initial data:
  - Default Roles (`ADMIN`, `MANAGER`, `EMPLOYEE`, `HR_MANAGER`, `FINANCE`).
  - Sample Users (`admin_user`, `employee_user`, `hr_user`, `finance_user`).
  - Core Master States (`Draft`, `Pending Approval`, `Approved`, `Rejected`).
  - Standard Workflows and Document Templates (e.g., Leave Application, Purchase Order).

- **Frontend Development (HMR)**: The frontend container mounts your local `./frontend` folder into the container. Any edits made in `frontend/src/` will instantly hot-reload in your browser (`http://localhost:3002`).

---

## 4. UI Design System

The workflow module adheres strictly to the **NextGenERP `blue-600` UI palette**, deprecating any legacy indigo/zinc color schemes. All action buttons, active tab borders, focus rings, and badge highlights have been standardized for a uniform and premium user experience.
