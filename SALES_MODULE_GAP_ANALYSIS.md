# NextGen ERP Sales Module — Gap Analysis vs. ERPNext (Selling Module) — *v3 Re-check*

> **Scope:** Third deep re-run of the comparison between **ERPNext Selling** (`erpnext/erpnext/selling`)
> and **NextGen ERP Sales** (`NextGenERP/sales-module` — Java 21 / Spring Boot 3 backend, Next.js 14 frontend, PostgreSQL).
>
> **Why v3:** Since v2, the user added **General Ledger (double-entry)**, **wired Pricing Rules & Coupons into
> Quotation/Order pricing**, **2 new reports** (Sales Trends, Customer Acquisition), an invoice-tax derivation
> from the parent order, and a `NumberToWordsConverter`. This revision re-confirms each item from the code and
> re-scores the remaining gaps.

---

## 1. Executive Summary

The v3 batch **closes the two most important remaining gaps** from the prior review:

1. **✅ General-Ledger / double-entry accounting is now implemented** — `GlEntry` model + `gl_entries` table
   + `GeneralLedgerService` posting **Debit Debtors / Credit Sales Revenue / Credit Tax Payable** on invoice creation,
   and **Debit Bank-or-Cash / Credit Debtors** on payment — and it is **wired into** `SalesInvoiceService`
   (`postSalesInvoiceGl`) and `PaymentEntryService` (`postPaymentEntryGl`). A `GeneralLedgerController` exposes
   all GL entries + a **per-customer ledger**, both consumed by the frontend (`getGlEntries`, `getCustomerLedger`).
2. **✅ Pricing Rules & Coupons are now applied inside transactions** — `QuotationService` and `SalesOrderService`
   both inject `PricingRuleEngine`, auto-resolve the best volume / promotional rule
   (`findBestRule(item, group, qty)`) when no manual discount is given, and apply coupon discounts
   (`validateAndApplyCoupon`) to the doc — no longer a dead CRUD + `/coupons/apply` stub.

Invoice tax also improved: when created **from a Sales Order**, the invoice re-uses the **parent order's effective
tax ratio** (`totalTaxesAndCharges / netTotal`) instead of the prior blanket 8.25%.

**Remaining gaps after this update** (prioritised):
1. ⚠️ **Invoice tax still not full TaxCalculationEngine/templates** — the SO-ratio reuse is an improvement, but a
   standalone invoice (no SO) still hard-codes `8.25%`; it does not run the `TaxCalculationEngine` or `sales_tax_templates`.
2. ⚠️ **Pricing Rules: free-item & per-rule margin/rate** — rules wire **discount % / amount** and **coupons**, but the
   `is_free_item`/`free_item_code`/`free_qty` fields are captured but **not injected** as a free line, and there is
   no rate-with-margin.
3. ⚠️ **`NumberToWordsConverter` exists but is not called anywhere** — created as a utility; not yet invoked to print
   "in words" on quotes/orders/invoices.
4. ⚠️ **No GL reversal on cancellation** — no reverse-entry when an invoice/payment is cancelled (only forward posting).
5. ❌ **No rounding / `rounded_total` / `base_rounded_total` / `in_words` fields**, and **multi-currency PLC double-book
   (base_\*)** is still only partially consistent.
6. ❌ **Logistics** – Delivery Schedule, packing list, **drop-ship**, **subcontracting**, batch/serial/barcode.
7. ❌ **Procurement / manufacturing** links – Blanket Order, Material Request / PO, Work Order.
8. ❌ **Commerce/meta** – recurring (`auto_repeat`), inter-company, project/cost-center dims, Incoterms/shipping-rule.
9. ❌ **Governance/comms** – approval workflow, **Selling Settings** doctype, email/SMS notifications, templated
   **print formats** (generic print modal only), sales **partner** doctype.

---

## 2. What Was Added in v3 (Confirmed by Direct Code Reads)

| New item | Where | Behaviour confirmed |
|---|---|---|
| **General Ledger (GL)** | `GlEntry` model, `gl_entries` table, `GeneralLedgerService`, `GeneralLedgerController`, `GlEntryDto` | `postSalesInvoiceGl`: Debit **Debtors (1310)** = grand_total, Credit **Sales Revenue (4110)** = net_total, Credit **Tax Payable (2210)** = tax. `postPaymentEntryGl`: Debit **Bank/Cash**, Credit **Debtors**. Endpoints: `GET /accounts/gl-entries`, `GET /accounts/customer-ledger/{id}`. |
| **GL wired in** | `SalesInvoiceService.java:123`, `PaymentEntryService.java:89` | Invoice and Payment services both call `generalLedgerService.post*` after save. |
| **Pricing Rules wired** | `QuotationService.java:32,94,147`; `SalesOrderService.java:40,110,170` | Both inject `PricingRuleEngine`, call `findBestRule()` for discount if no manual discount, and call `validateAndApplyCoupon()` to apply coupon. |
| **2 new reports** | `SalesReportsService.getSalesTrendsReport`, `getCustomerAcquisitionReport` + DTOs + controller + `api.ts` | `GET /reports/sales-trends`, `GET /reports/customer-acquisition`. |
| **Invoice tax from parent SO** | `SalesInvoiceService.createSalesInvoice` | When `salesOrderId` present, computes `taxRatio = SO.totalTaxesAndCharges / SO.netTotal` and applies to invoice net_total (fallback 8.25% otherwise). |
| **`NumberToWordsConverter`** | `application/service/NumberToWordsConverter.java` | Utility class (INR converter). ⚠️ **Not called by any service yet** (no `NumberToWordsConverter.convert(...)` references found). |
| **`app.jar`** | `backend/app.jar` | Packaged build artifact present. |

**Report endpoints now exposed (6 total):**
- `GET /reports/sales-order-analysis`
- `GET /reports/customer-credit-aging`
- `GET /reports/win-loss-funnel`
- `GET /reports/item-sales-history`
- `GET /reports/sales-trends` *(new)*
- `GET /reports/customer-acquisition` *(new)*

**Accounting endpoints now exposed:**
- `GET /api/v1/accounts/gl-entries`
- `GET /api/v1/accounts/customer-ledger/{customerId}`

Frontend: `api.ts` has `getGlEntries()`, `getCustomerLedger(id)`, `getSalesTrendsReport()`, `getCustomerAcquisitionReport()`.

---

## 3. Updated Feature-by-Feature Matrix

| # | ERPNext (Selling) feature | NextGen ERP | Detail / Notes |
|---|---------------------------|-------------|----------------|
| 1 | **Quotation engine** | ✅ Implemented | CRUD + multi-tier tax + pricing/coupon wiring; status lifecycle |
| 2 | **Lead / Opportunity CRM** | ✅ Added | Lead & Opportunity CRUD + status/stage; `Quotation.opportunityId` link |
| 3 | **Lead/Opp → Quotation conversion** | ⚠️ Partial | entities + link exist; **no automated conversion carry-forward** |
| 4 | **Quotation status scheduler** | ✅ Added | `QuotationExpiryScheduler` auto-flips to EXPIRED |
| 5 | **Competitors / lost reasons** | ⚠️ Partial | `QuotationLostReason` + win/loss report; no `competitors` table |
| 6 | **Sales Order lifecycle** | ✅ Implemented | DRAFT→…→COMPLETED/CANCELLED; ON_HOLD/CLOSED not auto-driven |
| 7 | **SO → Delivery Note** | ✅ Added | `from-order`; auto `per_delivered`/`delivery_status` from DN qty |
| 8 | **SO → Sales Invoice** | ✅ Added | `from-order` + `from-delivery`; auto `per_billed`/`billing_status` |
| 9 | **Payment Entry (receipt/advance)** | ✅ Added | Allocates to invoice, updates customer balance & SO `advance_paid` |
| 10 | **GL / double-entry ledger** | ✅ **ADDED v3** | `GlEntry` + `gl_entries`; Debit Debtors/Credit Revenue+Tax on invoice; Bank/Cash↔Debtors on payment; customer ledger endpoint |
| 11 | **GL reversal on cancel** | ⚠️ Missing | only forward posting; no reverse-entry on invoice/payment cancel |
| 12 | **Invoice tax via TaxCalculationEngine/templates** | ⚠️ Partial | reuses parent-SO tax ratio; standalone still hard-codes 8.25%, no engine |
| 13 | **Pricing Rules applied in docs** | ✅ **ADDED v3** | `findBestRule` discount % / amount auto-applied on quote & order; coupons applied |
| 14 | **Pricing free-item / rate-with-margin** | ⚠️ Partial | `is_free_item` fields captured but not injected as line; no margin-rate |
| 15 | **Coupons (percent/fixed, min, max-use)** | ✅ Implemented | CRUD + in-doc apply + `/coupons/apply` |
| 16 | **Delivery Schedule (multi-milestone)** | ❌ Missing | no schedules per order line |
| 17 | **Packing list / packed_items** | ❌ Missing | only product_bundle schema |
| 18 | **Drop-ship / subcontracting** | ❌ Missing | `delivered_by_supplier` flag present only |
| 19 | **Batch / Serial / Barcode / Scan** | ❌ Missing | only `has_serial_no`/`has_batch_no` flags |
| 20 | **Payment Terms Template / Schedule** | ⚠️ Partial | `payment_schedules` table; no terms-template doctype / auto-milestones |
| 21 | **Stock Reservations (SRE)** | ✅ Implemented | auto-create on submit, release on cancel |
| 22 | **Customer credit limit (single)** | ✅ Implemented | pre-submit gating + bypass + RFC 7807 |
| 23 | **Customer credit limit (per category/company)** | ⚠️ Partial | single column vs ERPNext child table |
| 24 | **Customer balances / AR ageing** | ✅ Added | ageing report (0-30/31-60/61-90/90+) driven by invoice+payment; customer ledger |
| 25 | **Multi-currency / PLC base_* double-book** | ⚠️ Partial | `conversion_rate`; base_* not fully consistent; no PLC currency |
| 26 | **Rounding / in-words / rounded_total** | ⚠️ Partial | `NumberToWordsConverter` exists but **not wired**; no rounding fields |
| 27 | **Tax category / item-tax templates** | ⚠️ Partial | `tax_category` col + templates schema; not auto-resolved in invoice |
| 28 | **Sales Partner** | ❌ Missing | no separate partner doctype/commission |
| 29 | **Sales Team / Commissions** | ✅ Implemented | 100% split + incentives |
| 30 | **Reports** | ✅ 6 added | SO-Analysis, Credit-Aging, Win/Loss, Item-History, Sales-Trends, Customer-Acquisition |
| 31 | **Number cards / dashboards** | ⚠️ Partial | KPI dashboard + analytics; no ERPNext number-card set |
| 32 | **POS page** | ❌ Missing | |
| 33 | **Sales Funnel page** | ❌ Missing | (funnel exists as report, not page) |
| 34 | **Print formats / PDF** | ⚠️ Partial | generic `PrintDocumentModal`; no templated ERPNext formats; in-words not wired |
| 35 | **Recurring / auto_repeat** | ❌ Missing | |
| 36 | **Inter-company / multi-company** | ❌ Missing | single `company` value |
| 37 | **Project / cost-center (accounting dims)** | ❌ Missing | |
| 38 | **Approval / authorization workflow** | ❌ Missing | |
| 39 | **Selling Settings doctype** | ⚠️ Partial | defaults hard-coded |
| 40 | **Email / SMS notifications** | ❌ Missing | |
| 41 | **Audit trail / amended_from** | ⚠️ Partial | version/created_by columns only |
| 42 | **Onboarding / tours / bulk import** | ❌ Missing | |
| 43 | **Incoterms / shipping rule** | ⚠️ Partial | columns exist, no engine |
| 44 | **Return / credit-note flow** | ❌ Missing | |

---

## 4. Deep Dive — Areas Still Missing in NextGen ERP

### 🟠 4.1 Accounting — GL added, but hardening needed
- ✅ **Double-entry GL exists** (invoice + payment) and is wired; customer ledger endpoint works.
- ⚠️ **No GL reversal on cancel** — an invoice/payment cancel won't post contra entries, so the ledger can skew.
- ⚠️ **Invoice tax is not full-template** — it reuses parent-SO ratio if present, else hard-codes 8.25%; it does
  **not** run `TaxCalculationEngine`/`sales_tax_templates` for standalone invoices.
- ⚠️ **Bank reconciliation / trial balance** — no statement view or trial-balance report beyond flat GL listing.
- ⚠️ Deferred revenue / accruals, invoice-level discount booking, multi-currency base_* double-book still absent.

### 🟠 4.2 Pricing — rules & coupons wired, but incomplete rule semantics
- ✅ Rules (`findBestRule`) apply discount %/amount on Quotation & SO line pricing when no manual discount.
- ✅ Coupons validated & applied inside docs.
- ⚠️ `is_free_item` / `free_item_code` / `free_qty` are captured in rules but **not injected as a free line**.
- ⚠️ No **rate-with-margin**, priority/stacking, or `ignore_pricing_rule` toggle.
- ⚠️ No **item_tax template** per line (ERPNext `item_tax_rate` / `item_wise_tax_details`).

### 🟠 4.3 CRM — no Lead/Opportunity → Quotation conversion machine
- Entities + `Quotation.opportunityId` exist; nothing **creates a Quotation from a Lead/Opportunity** or
  carries status/items (ERPNext mappers `prevdoc_docname`, opportunity-status updates on submit/cancel).
- No `competitors` table for lost-quote analysis (win/loss uses only `lostReason`).

### 🟠 4.4 Fulfilment / logistics depth
- **Delivery Schedule** (multiple delivery milestones — ERPNext `services/delivery_schedule.py`).
- **Packing list / packed_items** auto-build from bundles.
- **Drop-ship** (`delivered_by_supplier`, supplier, customer warehouse); **subcontracting** (`services/subcontracting.py`).
- **Batch / serial / barcode** — only flags; no tracking or scan UI.

### 🟠 4.5 Procurement / manufacturing interfaces
- No **Material Request / Purchase Order** link from SO, no **Blanket Order**, no **Work Order / Production Plan**
  link (`work_order_qty`, `produced_qty`, `bom_no`).

### 🟠 4.6 Reporting (now 6, still below ERPNext's ~15)
Still missing: `quotation_trends`, `customer_acquisition_and_loyalty` *(as loyalty report)*, `inactive_customers`,
`customer_wise_item_price`, `payment_terms_status_for_sales_order`, `pending_so_items_for_purchase_request`,
`sales_person`/`sales_partner`/`territory` variance & commission summaries, `available_stock_for_packing_items`,
number cards / dashboard charts.

### 🟡 4.7 Commerce / contract / meta-field fidelity
- **Recurring** (`auto_repeat`), **inter-company**, **project / cost-center**, **Incoterms / shipping-rule**.
- **Multi-currency PLC** & consistent **base_\***; **rounding / in-words** — `NumberToWordsConverter` exists but is
  **not wired** to any doc/DTO yet.

### 🟡 4.8 Governance, comms & experience
- Approval / authorization gate, **Selling Settings** doctype, email/SMS notifications, **templated print formats**
  (one generic modal), audit/`amended_from`, onboarding/tours, bulk import, **POS**, **Sales Partner** doctype.
10. ⚠️ **Reports** – now 6 (still below ERPNext's ~15).