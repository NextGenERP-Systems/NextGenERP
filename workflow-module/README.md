# NextGen ERP - Document & Workflow Automation Module

> A state-of-the-art enterprise Workflow & Document Automation system inspired by ERPNext, engineered with a **Java 21 / Spring Boot 3** backend, **Next.js 14 / Tailwind CSS / shadcn/ui (Zinc/Grey)** frontend, **PostgreSQL** relational engine, and automated **GCP Always Free Tier (`e2-micro`)** cloud deployment via `gcloud` CLI.

---

## 1. Domain Architecture & ERPNext Mapping

| ERPNext Workflow Feature | NextGen ERP Workflow Implementation | Technical Highlights |
| :--- | :--- | :--- |
| **Workflow State Machine** | `Workflow` + `WorkflowState` Aggregate | Configurable initial, optional, and final states, color-coded state tracking, dynamic update values. |
| **Workflow Transitions** | `WorkflowTransition` + `WorkflowTransitionRepository` | Rule-based transitions, role-based access control, condition expressions (SpEL), self-approval checks, and action tracking. |
| **Document Actions** | `DocumentService` + `WorkflowAction` | Approve, Reject, Submit actions driving state transitions. Comprehensive exception handling for illegal state changes. |
| **Audit Trail (History)** | `WorkflowHistory` | Complete provenance of document lifecycle events (who transitioned what, when, and from/to states) with user comments. |
| **Template Engine** | `DocumentTemplate` | Dynamic HTML templates for contracts, NDAs, and standard business documents. |
| **Attachments (GCS)** | `Document` (`gcsAttachmentUrl`) | Cloud-ready integration for attaching signed PDFs and evidences to workflow transactions. |

---

## 2. Directory Structure

```
NextGenERP/
└── workflow-module/
    ├── backend/                      # Java 21 / Spring Boot 3 / JPA / OpenAPI
    │   ├── src/main/java/com/nextgen/erp/workflow/
    │   │   ├── domain/               # Core DDD Aggregates (Workflow, State, Transition, Document)
    │   │   ├── application/          # Use Cases, DTOs, Services (DocumentService, WorkflowService)
    │   │   ├── infrastructure/       # JPA Repositories & Config
    │   │   └── presentation/         # REST Controllers & API Endpoints
    │   ├── pom.xml
    │   └── Dockerfile
    ├── frontend/                     # Next.js 14 (App Router) / TypeScript / shadcn/ui
    │   ├── src/app/
    │   │   ├── documents/            # Document Listing & Creation
    │   │   ├── approvals/            # Manager Inbox & Approvals Queue
    │   │   ├── templates/            # HTML Template Builder
    │   │   └── setup/                # Workflow State Machine Builder
    │   ├── src/components/           # Zinc/Grey Glassmorphism UI & Layout
    │   ├── src/lib/api.ts            # API Client with Offline Mock Fallback (Resilience)
    │   └── Dockerfile
    ├── database/
    │   ├── init-schema.sql           # PostgreSQL Schema (Workflows, Documents, History)
    │   └── seed-data.sql             # Enterprise Seed Dataset (Standard Contract Workflow)
    ├── gcp-deployment/
    │   ├── deploy-gcp-free-tier.sh   # Automated GCP CLI (gcloud) Provisioning Script
    │   ├── docker-compose.yml        # Multi-container orchestration (PostgreSQL, Backend, Frontend, Nginx)
    │   └── nginx.conf                # Reverse proxy configuration
    └── README.md
```

---

## 3. Quick Start & Local Execution

### Option A: Running with Docker Compose (Multi-Container)
```bash
cd workflow-module/gcp-deployment
docker compose up --build -d
```
- **Workflow UI Portal**: `http://localhost:3000` (or `http://localhost:81/` via Nginx)
- **Spring Boot API**: `http://localhost:8080/api/v1`
- **Swagger OpenAPI Docs**: `http://localhost:8080/swagger-ui.html`

### Option B: Running Standalone Frontend (Developer Mode)
```bash
cd workflow-module/frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.
All workflow approvals, document creations, and state machine configurations are pre-wired with the rich **Offline Mock Fallback** mechanism and work immediately even without the Java backend!

---

## 4. Google Cloud Free Tier Automated Deployment (`gcloud` CLI)

The automated script [`deploy-gcp-free-tier.sh`](./gcp-deployment/deploy-gcp-free-tier.sh) provisions a VM instance strictly within the **Google Cloud Always Free Tier** limits:
- **Machine Type**: `e2-micro` (2 vCPUs, 1 GB memory)
- **Region**: `us-central1-a` (Iowa, eligible for Always Free Tier)
- **Boot Disk**: `30 GB` Standard Persistent Disk (`pd-standard`)
- **Firewall Rules**: Automatically configured for HTTP (81), API (8080), and UI (3000).

```bash
cd workflow-module/gcp-deployment
./deploy-gcp-free-tier.sh
```
