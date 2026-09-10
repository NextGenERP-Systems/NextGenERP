# NextGen ERP - Finance & Accounting Module (Accounts)

Production-grade Enterprise Finance, Accounting, and General Ledger domain module for NextGen ERP, modeled after the **ERPNext / Frappe Standard Accounting Engine**.

---

## 🏛️ Core Features & Capabilities

1. **Chart of Accounts (CoA)**:
   - 5 Root Ledger Groups (`Asset`, `Liability`, `Equity`, `Income`, `Expense`).
   - Group vs Leaf node hierarchy with real-time running balance drill-down.
2. **General Ledger (GL) & Double-Entry Bookkeeping**:
   - Automated invariant validation: $\sum \text{Debit} == \sum \text{Credit}$.
   - Immutable audit trail of every monetary movement.
3. **Accounts Receivable (AR) & Sales Invoicing**:
   - Customer invoicing with GST output tax calculations.
   - Auto-credits Revenue, auto-debits Accounts Receivable.
4. **Accounts Payable (AP) & Purchase Invoicing**:
   - Supplier bills, operating expenses, and Input Tax Credit (ITC).
5. **Multi-Mode Payment Entries**:
   - Customer payment receipts, supplier disbursements, and bank-to-bank transfers.
6. **Corporate Banking & Bank Reconciliation**:
   - Real-time bank GL balance synchronization and cleared transaction ledger.
7. **Cost Centers & Departmental Budgets**:
   - Expense allocations, variance tracking, and budget ceilings.
8. **Live Financial Statements**:
   - **Balance Sheet** (Assets = Liabilities + Equity)
   - **Profit & Loss (P&L)** (Operating Income - Operating Expenses = Net Profit)
   - **Trial Balance** (Aggregate Debit vs Credit proofs)
   - **General Ledger Audit Book**

---

## 🌐 Port Allocations & Services

- **Frontend UI**: `http://localhost:3004/accounts` (Next.js 14 App Router, visionOS Liquid Glass)
- **Backend API**: `http://localhost:8084/api/v1` (Spring Boot 3.3, Java 21)
- **PostgreSQL 16 Database**: `localhost:5434` (Database: `nextgen_erp_accounting`)
