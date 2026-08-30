-- ==============================================================================
-- NEXTGEN ERP: FINANCE & ACCOUNTING (ACCOUNTS MODULE) - POSTGRESQL SCHEMA
-- Reference: ERPNext / Frappe Standard Financial & Accounting Core
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. COST CENTERS
CREATE TABLE IF NOT EXISTS cost_centers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cost_center_code VARCHAR(50) UNIQUE NOT NULL,
    cost_center_name VARCHAR(150) NOT NULL,
    parent_cost_center_id UUID REFERENCES cost_centers(id) ON DELETE SET NULL,
    is_group BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. CHART OF ACCOUNTS (CoA)
CREATE TABLE IF NOT EXISTS chart_of_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_code VARCHAR(50) UNIQUE NOT NULL,
    account_name VARCHAR(150) NOT NULL,
    root_type VARCHAR(30) NOT NULL, -- ASSET, LIABILITY, EQUITY, INCOME, EXPENSE
    account_type VARCHAR(50), -- Bank, Cash, Receivable, Payable, Cost of Goods Sold, Tax, Direct Income, Operating Expense, etc.
    parent_account_id UUID REFERENCES chart_of_accounts(id) ON DELETE SET NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    is_group BOOLEAN DEFAULT false,
    balance NUMERIC(15, 2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. BANK ACCOUNTS
CREATE TABLE IF NOT EXISTS bank_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_name VARCHAR(150) NOT NULL,
    bank_name VARCHAR(150) NOT NULL,
    account_number VARCHAR(100) UNIQUE NOT NULL,
    ifsc_code VARCHAR(30),
    swift_code VARCHAR(30),
    branch_name VARCHAR(150),
    gl_account_id UUID REFERENCES chart_of_accounts(id) ON DELETE RESTRICT,
    currency VARCHAR(10) DEFAULT 'INR',
    current_balance NUMERIC(15, 2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. TAX TEMPLATES & CHARGES
CREATE TABLE IF NOT EXISTS tax_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(150) NOT NULL,
    tax_type VARCHAR(50) NOT NULL, -- OUTPUT_GST, INPUT_GST, TDS, VAT
    rate_percentage NUMERIC(5, 2) NOT NULL,
    account_id UUID REFERENCES chart_of_accounts(id) ON DELETE RESTRICT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. JOURNAL ENTRIES (Double-Entry Vouchers)
CREATE TABLE IF NOT EXISTS journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    voucher_number VARCHAR(50) UNIQUE NOT NULL,
    voucher_type VARCHAR(50) DEFAULT 'JOURNAL_ENTRY', -- JOURNAL_ENTRY, BANK_ENTRY, CASH_ENTRY, OPENING_ENTRY, CONTRA_ENTRY
    posting_date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_debit NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    total_credit NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    user_remarks TEXT,
    status VARCHAR(30) DEFAULT 'SUBMITTED', -- DRAFT, SUBMITTED, CANCELLED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS journal_entry_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    journal_entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES chart_of_accounts(id) ON DELETE RESTRICT,
    party_type VARCHAR(50), -- CUSTOMER, SUPPLIER, EMPLOYEE
    party_name VARCHAR(150),
    debit_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    credit_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    cost_center_id UUID REFERENCES cost_centers(id) ON DELETE SET NULL,
    remarks VARCHAR(255)
);

-- 6. GENERAL LEDGER ENTRIES (Immutable GL Book)
CREATE TABLE IF NOT EXISTS general_ledger_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    posting_date DATE NOT NULL DEFAULT CURRENT_DATE,
    account_id UUID NOT NULL REFERENCES chart_of_accounts(id) ON DELETE RESTRICT,
    voucher_type VARCHAR(50) NOT NULL, -- SALES_INVOICE, PURCHASE_INVOICE, PAYMENT_ENTRY, JOURNAL_ENTRY
    voucher_number VARCHAR(50) NOT NULL,
    voucher_id UUID NOT NULL,
    debit NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    credit NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    against_account VARCHAR(150),
    party_type VARCHAR(50),
    party_name VARCHAR(150),
    cost_center_id UUID REFERENCES cost_centers(id) ON DELETE SET NULL,
    remarks TEXT,
    is_cancelled BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. SALES INVOICES (Accounts Receivable)
CREATE TABLE IF NOT EXISTS sales_invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id VARCHAR(100),
    customer_name VARCHAR(150) NOT NULL,
    customer_email VARCHAR(150),
    posting_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    subtotal NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    total_tax NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    grand_total NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    rounded_total NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    outstanding_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(30) DEFAULT 'SUBMITTED', -- DRAFT, SUBMITTED, PARTLY_PAID, PAID, OVERDUE, CANCELLED
    in_words TEXT,
    currency VARCHAR(10) DEFAULT 'INR',
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sales_invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sales_invoice_id UUID NOT NULL REFERENCES sales_invoices(id) ON DELETE CASCADE,
    item_code VARCHAR(50) NOT NULL,
    item_name VARCHAR(200) NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL DEFAULT 1.00,
    rate NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    tax_rate NUMERIC(5, 2) DEFAULT 18.00,
    income_account_id UUID REFERENCES chart_of_accounts(id) ON DELETE RESTRICT
);

-- 8. PURCHASE INVOICES (Accounts Payable)
CREATE TABLE IF NOT EXISTS purchase_invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bill_number VARCHAR(50) UNIQUE NOT NULL,
    supplier_name VARCHAR(150) NOT NULL,
    supplier_email VARCHAR(150),
    supplier_gstin VARCHAR(50),
    posting_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    subtotal NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    total_tax NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    grand_total NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    outstanding_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(30) DEFAULT 'SUBMITTED', -- DRAFT, SUBMITTED, PARTLY_PAID, PAID, OVERDUE, CANCELLED
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS purchase_invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_invoice_id UUID NOT NULL REFERENCES purchase_invoices(id) ON DELETE CASCADE,
    item_name VARCHAR(200) NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL DEFAULT 1.00,
    rate NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    expense_account_id UUID REFERENCES chart_of_accounts(id) ON DELETE RESTRICT
);

-- 9. PAYMENT ENTRIES
CREATE TABLE IF NOT EXISTS payment_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_number VARCHAR(50) UNIQUE NOT NULL,
    payment_type VARCHAR(30) NOT NULL, -- RECEIVE, PAY, INTERNAL_TRANSFER
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    party_type VARCHAR(50), -- CUSTOMER, SUPPLIER, EMPLOYEE
    party_name VARCHAR(150),
    paid_from_account_id UUID NOT NULL REFERENCES chart_of_accounts(id) ON DELETE RESTRICT,
    paid_to_account_id UUID NOT NULL REFERENCES chart_of_accounts(id) ON DELETE RESTRICT,
    paid_amount NUMERIC(15, 2) NOT NULL,
    received_amount NUMERIC(15, 2) NOT NULL,
    mode_of_payment VARCHAR(50) DEFAULT 'BANK_TRANSFER', -- CASH, BANK_TRANSFER, CHEQUE, UPI, CREDIT_CARD
    reference_no VARCHAR(100),
    reference_date DATE,
    status VARCHAR(30) DEFAULT 'SUBMITTED', -- DRAFT, SUBMITTED, CANCELLED
    user_remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
