# NextGen ERP — Stock & Inventory 360 Module

Enterprise-grade, real-time double-entry stock ledger, multi-warehouse bin cache, FIFO/Moving Average valuation engine, and serial/batch traceability system for **NextGen ERP**.

---

## 1. Architectural Highlights & Tech Stack

* **Backend**: Java 21 + Spring Boot 3.3.3 + Spring Data JPA + PostgreSQL + OpenAPI/Swagger.
  - **Port**: `8083` (Context Path: `/`)
  - **Pattern**: Clean Architecture / Domain-Driven Design (DDD).
* **Database**: PostgreSQL schema `stock` (or `public`):
  - **Immutable Ledger**: `stock_ledger_entries` (immutable double-entry SLEs with quantity and valuation differentials).
  - **Real-Time Bin Cache**: `bins` (`actual_qty`, `ordered_qty`, `reserved_qty`, `projected_qty`, `valuation_rate`, `stock_queue`).
  - **Valuation Engines**: `FIFOValuationEngine` (queue simulation) & `MovingAverageValuationEngine`.
  - **Universal Stock Entries**: `stock_entries` (Material Receipt, Issue, Transfer, Manufacture, Repack).
  - **Traceability**: `batches`, `serial_nos`, `quality_inspections`, `stock_reconciliations`.
* **Frontend**: Next.js 14 (App Router) + React 18 + TypeScript + Tailwind CSS + Lucide Icons + Recharts.
  - **Port**: `3002` (Route: `/stock`)
  - **Navigation**: Integrated with global NextGen `AppSwitcher` linking Sales, HRM, Workflow, and Stock.

---

## 2. Quick Start

### Run with Docker Compose
```bash
docker compose -f docker-compose.stock.yml up -d
```

### Local Development

#### 1. Backend
```bash
cd NextGenERP/stock-module/backend
mvn spring-boot:run
# Swagger UI available at: http://localhost:8083/swagger-ui.html
```

#### 2. Frontend
```bash
cd NextGenERP/stock-module/frontend
npm install
npm run dev
# Web app available at: http://localhost:3002/stock
```
