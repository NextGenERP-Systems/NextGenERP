# NextGen ERP - Sales (Selling) Module

> A state-of-the-art enterprise Sales & Selling domain system inspired by ERPNext, engineered with a **Java 21 / Spring Boot 3** backend, **Next.js 14 / Tailwind CSS / shadcn/ui (Zinc/Grey)** frontend, **PostgreSQL** relational engine, and automated **GCP Always Free Tier (`e2-micro`)** cloud deployment via `gcloud` CLI.

---

## 1. Domain Architecture & ERPNext Mapping

| ERPNext Selling Feature | NextGen ERP Implementation | Technical Highlights |
| :--- | :--- | :--- |
| **Quotation Engine** | `QuotationService` + `PricingEngine` + `TaxCalculationEngine` | Line item discount %, multi-tier compounding/additive tax templates (`ON_NET_TOTAL`, `ACTUAL`, `ON_PREVIOUS_ROW_TOTAL`), header-level discount allocation, live recalculation. |
| **Sales Order Lifecycle** | `SalesOrderService` + Status State Machine | States: `DRAFT` $\rightarrow$ `TO_DELIVER_AND_BILL` $\rightarrow$ `TO_DELIVER` $\rightarrow$ `TO_BILL` $\rightarrow$ `COMPLETED` / `CANCELLED`. |
| **Customer Credit Control** | `CreditLimitValidator` | Pre-submission gating: validates `outstanding_balance + order_amount <= credit_limit` with bypass flags and RFC 7807 problem details. |
| **Sales Team Commissions** | `CommissionEngine` | Enforces 100% split validation across sales reps and calculates incentive pools based on commission-eligible line items. |
| **Stock Reservation (SRE)** | `StockReservationRepository` | Automatically creates Stock Reservation Entries against warehouses on order submission. |

---

## 2. Directory Structure

```
NextGenERP/
└── sales-module/
    ├── backend/                      # Java 21 / Spring Boot 3 / JPA / OpenAPI
    │   ├── src/main/java/com/nextgen/erp/sales/
    │   │   ├── domain/               # Core DDD Aggregates & Engines
    │   │   ├── application/          # Use Cases, DTOs, Services
    │   │   ├── infrastructure/       # JPA Repositories & Config
    │   │   └── presentation/         # REST Controllers & RFC 7807 Handlers
    │   ├── src/test/java/            # Comprehensive Unit & Engine Tests
    │   ├── pom.xml
    │   └── Dockerfile
    ├── frontend/                     # Next.js 14 (App Router) / TypeScript / shadcn/ui
    │   ├── src/app/
    │   │   ├── sales/page.tsx        # Executive KPI Dashboard
    │   │   ├── sales/quotations/     # Interactive Quotation Builder
    │   │   ├── sales/orders/         # Sales Order Command Center & SRE Inspector
    │   │   ├── sales/customers/      # Customer 360 & Credit Limit Monitoring
    │   │   └── sales/analytics/      # Commission Leaderboards & Velocity
    │   ├── src/components/           # Zinc/Grey Glassmorphism UI & Layout
    │   ├── src/lib/api.ts            # API Client with Mock Fallback
    │   └── Dockerfile
    ├── database/
    │   ├── init-schema.sql           # PostgreSQL Schema (16 tables, UUIDs, ENUMs)
    │   └── seed-data.sql             # Enterprise Seed Dataset
    ├── gcp-deployment/
    │   ├── deploy-gcp-free-tier.sh   # Automated GCP CLI (gcloud) Provisioning Script
    │   ├── docker-compose.yml        # Multi-container orchestration
    │   └── nginx.conf                # Reverse proxy configuration
    └── README.md
```

---

## 3. Quick Start & Local Execution

### Prerequisites:
- **Node.js**: v18+ (v20+ recommended)
- **Java**: JDK 21+
- **PostgreSQL**: 15+ (or run via Docker)

### Option A: Running with Docker Compose (Fastest)
```bash
cd sales-module/gcp-deployment
docker compose up --build -d
```
- **Next.js UI**: `http://localhost:3000` (or `http://localhost/` via Nginx)
- **Spring Boot API**: `http://localhost:8080/api/v1`
- **Swagger UI**: `http://localhost:8080/swagger-ui.html`

### Option B: Running Locally (Developer Mode)

#### 1. Database Setup:
```bash
psql -U postgres -d nextgen_erp -f sales-module/database/init-schema.sql
psql -U postgres -d nextgen_erp -f sales-module/database/seed-data.sql
```

#### 2. Backend:
```bash
cd sales-module/backend
mvn clean spring-boot:run
```

#### 3. Frontend:
```bash
cd sales-module/frontend
npm install
npm run dev
```

---

## 4. Google Cloud Free Tier Automated Deployment (`gcloud` CLI)

The automated script [`deploy-gcp-free-tier.sh`](./gcp-deployment/deploy-gcp-free-tier.sh) provisions a VM instance strictly within the **Google Cloud Always Free Tier** limits:
- **Machine Type**: `e2-micro` (2 vCPUs, 1 GB memory)
- **Region**: `us-central1-a` (Iowa, eligible for Always Free Tier)
- **Boot Disk**: `30 GB` Standard Persistent Disk (`pd-standard`)
- **Firewall Rules**: Automatically configured for HTTP (80), HTTPS (443), API (8080), and UI (3000).

### Deploying via GCP CLI:
```bash
# 1. Login to your Google Cloud account
gcloud auth login

# 2. Run the deployment script
cd sales-module/gcp-deployment
./deploy-gcp-free-tier.sh
```

The script will output the external public IP address of your VM and initialize the NextGen ERP services.
