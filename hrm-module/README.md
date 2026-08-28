# NextGen ERP - Human Resource Management (HRM) Module

> A state-of-the-art enterprise Human Resource & People Operations domain system inspired by ERPNext, engineered with a **Java 21 / Spring Boot 3** backend, **Next.js 14 / Tailwind CSS / shadcn/ui (Zinc/Grey)** frontend, **PostgreSQL** relational engine, and automated **GCP Always Free Tier (`e2-micro`)** cloud deployment via `gcloud` CLI.

---

## 1. Domain Architecture & ERPNext Mapping

| ERPNext HRMS Feature | NextGen ERP HRM Implementation | Technical Highlights |
| :--- | :--- | :--- |
| **Employee 360 Master** | `EmployeeService` + `Employee` Aggregate | Full employee lifecycle (Probation $\rightarrow$ Active $\rightarrow$ Suspended $\rightarrow$ Left), reporting hierarchy, emergency contacts, statutory PAN/PF/ESI. |
| **Attendance & Shift Management** | `AttendanceService` + `ShiftType` Engine | Multi-shift rosters, punch check-in logs, late-entry/early-exit penalties, overtime hours calculation, and WFH/Half-Day states. |
| **Leave Management Engine** | `LeaveService` + `LeaveAllocation` Ledger | Dynamic leave accrual, carry-forward rollover, leave balance validation, multi-level approval workflow (`PENDING` $\rightarrow$ `APPROVED` $\rightarrow$ `REJECTED`). |
| **Payroll & Salary Slip Generator** | `PayrollEngine` + `SalarySlipService` | Configurable Earning & Deduction components (Basic, HRA, Special, PF, PT, TDS), formula computation, Loss of Pay (LOP) deduction, batch monthly processing, number-to-words currency converter. |
| **Recruitment & Staffing** | `RecruitmentService` + Kanban Pipeline | Staffing plans, Job Openings, Candidate Pipeline (Screening $\rightarrow$ Tech $\rightarrow$ HR $\rightarrow$ Offered), Job Offers with CTC breakdowns. |
| **Performance & Appraisals** | `AppraisalService` | Appraisal templates, KRA weightage scoring, multi-rater evaluations (Self, Manager, Final Score), increment/promotion recommendations. |
| **Expense Claims & Reimbursements** | `ExpenseClaimService` | Travel/Medical claims, receipt category validation, multi-tier approvals, payable reconciliation. |

---

## 2. Directory Structure

```
NextGenERP/
└── hrm-module/
    ├── backend/                      # Java 21 / Spring Boot 3 / JPA / OpenAPI
    │   ├── src/main/java/com/nextgen/erp/hrm/
    │   │   ├── domain/               # Core DDD Aggregates & Engines (PayrollEngine, NumberToWordsConverter)
    │   │   ├── application/          # Use Cases, DTOs, Services (Employee, Attendance, Leave, Payroll)
    │   │   ├── infrastructure/       # JPA Repositories & Config
    │   │   └── presentation/         # REST Controllers & RFC 7807 Handlers
    │   ├── pom.xml
    │   └── Dockerfile
    ├── frontend/                     # Next.js 14 (App Router) / TypeScript / shadcn/ui
    │   ├── src/app/
    │   │   ├── hrm/page.tsx          # Executive HR & Headcount KPI Dashboard
    │   │   ├── hrm/employees/        # Employee 360 Directory & Onboarding
    │   │   ├── hrm/attendance/       # Attendance Tracker & Shift Rostering
    │   │   ├── hrm/leaves/           # Leave Requests, Balances & Approvals
    │   │   ├── hrm/payroll/          # Batch Payroll Engine & Salary Slip Inspector
    │   │   ├── hrm/recruitment/      # Job Vacancies & Applicant Kanban
    │   │   ├── hrm/appraisals/       # Performance Reviews & KRA Scorecards
    │   │   ├── hrm/expense-claims/   # Employee Expense Reimbursements
    │   │   └── hrm/reports/          # HR Analytics & Headcount Velocity
    │   ├── src/components/           # Zinc/Grey Glassmorphism UI & Layout
    │   ├── src/lib/api.ts            # API Client with Offline Mock Fallback
    │   └── Dockerfile
    ├── database/
    │   ├── init-schema.sql           # PostgreSQL Schema (18 tables, UUIDs, ENUMs)
    │   └── seed-data.sql             # Enterprise Seed Dataset
    ├── gcp-deployment/
    │   ├── deploy-gcp-free-tier.sh   # Automated GCP CLI (gcloud) Provisioning Script
    │   ├── docker-compose.yml        # Multi-container orchestration
    │   └── nginx.conf                # Reverse proxy configuration
    └── README.md
```

---

## 3. Quick Start & Local Execution

### Option A: Running with Docker Compose (Multi-Container)
```bash
cd hrm-module/gcp-deployment
docker compose up --build -d
```
- **HRM UI Portal**: `http://localhost:3001` (or `http://localhost:81/` via Nginx)
- **Spring Boot API**: `http://localhost:8081/api/v1`
- **Swagger OpenAPI Docs**: `http://localhost:8081/swagger-ui.html`

### Option B: Running Standalone Frontend (Developer Mode)
```bash
cd hrm-module/frontend
npm install
npm run dev
```
Open [http://localhost:3001/hrm](http://localhost:3001/hrm) in your browser.
All dashboards, attendance punches, leave applications, and batch payroll generation are pre-wired with the rich offline mock dataset and work immediately!

---

## 4. Google Cloud Free Tier Automated Deployment (`gcloud` CLI)

The automated script [`deploy-gcp-free-tier.sh`](./gcp-deployment/deploy-gcp-free-tier.sh) provisions a VM instance strictly within the **Google Cloud Always Free Tier** limits:
- **Machine Type**: `e2-micro` (2 vCPUs, 1 GB memory)
- **Region**: `us-central1-a` (Iowa, eligible for Always Free Tier)
- **Boot Disk**: `30 GB` Standard Persistent Disk (`pd-standard`)
- **Firewall Rules**: Automatically configured for HTTP (81), API (8081), and UI (3001).

```bash
cd hrm-module/gcp-deployment
./deploy-gcp-free-tier.sh
```
