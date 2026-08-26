-- ============================================================================
-- NextGen ERP - Sales (Selling) Module Database Schema (PostgreSQL)
-- Derived from ERPNext Selling Architecture with Modern Relational Integrity
-- ============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Enum Types
CREATE TYPE customer_type_enum AS ENUM ('COMPANY', 'INDIVIDUAL', 'PARTNERSHIP');
CREATE TYPE quotation_status_enum AS ENUM ('DRAFT', 'OPEN', 'REPLIED', 'PARTIALLY_ORDERED', 'ORDERED', 'LOST', 'CANCELLED', 'EXPIRED');
CREATE TYPE sales_order_status_enum AS ENUM ('DRAFT', 'ON_HOLD', 'TO_DELIVER_AND_BILL', 'TO_DELIVER', 'TO_BILL', 'COMPLETED', 'CANCELLED', 'CLOSED');
CREATE TYPE delivery_status_enum AS ENUM ('NOT_DELIVERED', 'FULLY_DELIVERED', 'PARTLY_DELIVERED', 'CLOSED', 'NOT_APPLICABLE');
CREATE TYPE billing_status_enum AS ENUM ('NOT_BILLED', 'FULLY_BILLED', 'PARTLY_BILLED', 'CLOSED');
CREATE TYPE tax_charge_type_enum AS ENUM ('ON_NET_TOTAL', 'ACTUAL', 'ON_PREVIOUS_ROW_TOTAL');
CREATE TYPE discount_apply_on_enum AS ENUM ('GRAND_TOTAL', 'NET_TOTAL');
CREATE TYPE order_type_enum AS ENUM ('SALES', 'MAINTENANCE', 'SHOPPING_CART');
CREATE TYPE user_role_enum AS ENUM ('ROLE_ADMIN', 'ROLE_SALES_MANAGER', 'ROLE_SALES_USER');

-- 0. User & Authentication Master
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'ROLE_SALES_USER',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- 1. Master Tables: Customer Groups & Territories
CREATE TABLE IF NOT EXISTS customer_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    parent_id UUID REFERENCES customer_groups(id) ON DELETE SET NULL,
    is_group BOOLEAN DEFAULT FALSE,
    default_price_list_id UUID,
    default_payment_terms VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS territories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    parent_id UUID REFERENCES territories(id) ON DELETE SET NULL,
    is_group BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Customer Master
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_code VARCHAR(50) NOT NULL UNIQUE,
    customer_name VARCHAR(255) NOT NULL,
    customer_type customer_type_enum NOT NULL DEFAULT 'COMPANY',
    customer_group_id UUID REFERENCES customer_groups(id),
    territory_id UUID REFERENCES territories(id),
    default_currency VARCHAR(3) DEFAULT 'INR',
    tax_id VARCHAR(50),
    default_price_list_id UUID,
    payment_terms VARCHAR(100),
    is_internal_customer BOOLEAN DEFAULT FALSE,
    represents_company VARCHAR(100),
    credit_limit DECIMAL(15, 2) DEFAULT 50000.00,
    outstanding_balance DECIMAL(15, 2) DEFAULT 0.00,
    bypass_credit_limit_check BOOLEAN DEFAULT FALSE,
    is_frozen BOOLEAN DEFAULT FALSE,
    disabled BOOLEAN DEFAULT FALSE,
    email VARCHAR(255),
    phone VARCHAR(50),
    website VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'system',
    version INT DEFAULT 0
);

-- Customer Addresses
CREATE TABLE IF NOT EXISTS customer_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    address_title VARCHAR(100) NOT NULL,
    address_type VARCHAR(50) DEFAULT 'Billing', -- Billing, Shipping, Dispatch
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    country VARCHAR(100) NOT NULL,
    pincode VARCHAR(20),
    is_primary_address BOOLEAN DEFAULT FALSE,
    is_shipping_address BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Customer Contacts
CREATE TABLE IF NOT EXISTS customer_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    email_id VARCHAR(255),
    mobile_no VARCHAR(50),
    phone VARCHAR(50),
    department VARCHAR(100),
    designation VARCHAR(100),
    is_primary_contact BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Items & Pricing
CREATE TABLE IF NOT EXISTS items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_code VARCHAR(100) NOT NULL UNIQUE,
    item_name VARCHAR(255) NOT NULL,
    item_group VARCHAR(100) NOT NULL DEFAULT 'Products',
    stock_uom VARCHAR(20) NOT NULL DEFAULT 'Nos',
    is_stock_item BOOLEAN DEFAULT TRUE,
    is_sales_item BOOLEAN DEFAULT TRUE,
    standard_rate DECIMAL(15, 2) DEFAULT 0.00,
    last_purchase_rate DECIMAL(15, 2) DEFAULT 0.00,
    valuation_rate DECIMAL(15, 2) DEFAULT 0.00,
    max_discount DECIMAL(5, 2) DEFAULT 20.00,
    has_serial_no BOOLEAN DEFAULT FALSE,
    has_batch_no BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS price_lists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    price_list_name VARCHAR(100) NOT NULL UNIQUE,
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    buying BOOLEAN DEFAULT FALSE,
    selling BOOLEAN DEFAULT TRUE,
    enabled BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS item_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    price_list_id UUID NOT NULL REFERENCES price_lists(id) ON DELETE CASCADE,
    price_list_rate DECIMAL(15, 2) NOT NULL,
    valid_from DATE DEFAULT CURRENT_DATE,
    valid_upto DATE,
    UNIQUE(item_id, price_list_id)
);

CREATE TABLE IF NOT EXISTS product_bundles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    new_item_code VARCHAR(100) NOT NULL REFERENCES items(item_code),
    description TEXT,
    disabled BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS product_bundle_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bundle_id UUID NOT NULL REFERENCES product_bundles(id) ON DELETE CASCADE,
    item_code VARCHAR(100) NOT NULL REFERENCES items(item_code),
    qty DECIMAL(12, 4) NOT NULL DEFAULT 1.0,
    uom VARCHAR(20) DEFAULT 'Nos'
);

-- 4. Sales Tax Templates
CREATE TABLE IF NOT EXISTS sales_tax_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(150) NOT NULL UNIQUE,
    company VARCHAR(100) NOT NULL DEFAULT 'NextGen Corp',
    tax_category VARCHAR(50),
    is_default BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS sales_tax_template_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID NOT NULL REFERENCES sales_tax_templates(id) ON DELETE CASCADE,
    charge_type tax_charge_type_enum NOT NULL DEFAULT 'ON_NET_TOTAL',
    account_head VARCHAR(150) NOT NULL,
    rate DECIMAL(8, 4) NOT NULL,
    description VARCHAR(255),
    row_order INT NOT NULL DEFAULT 1
);

-- 5. Quotation Engine
CREATE TABLE IF NOT EXISTS quotations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quotation_number VARCHAR(50) NOT NULL UNIQUE,
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    valid_till DATE,
    customer_id UUID NOT NULL REFERENCES customers(id),
    customer_name VARCHAR(255) NOT NULL,
    order_type order_type_enum DEFAULT 'SALES',
    status quotation_status_enum NOT NULL DEFAULT 'DRAFT',
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    conversion_rate DECIMAL(12, 6) DEFAULT 1.000000,
    selling_price_list_id UUID REFERENCES price_lists(id),
    
    total_qty DECIMAL(15, 4) DEFAULT 0.0000,
    net_total DECIMAL(15, 2) DEFAULT 0.00,
    base_net_total DECIMAL(15, 2) DEFAULT 0.00,
    total_taxes_and_charges DECIMAL(15, 2) DEFAULT 0.00,
    base_total_taxes_and_charges DECIMAL(15, 2) DEFAULT 0.00,
    discount_amount DECIMAL(15, 2) DEFAULT 0.00,
    additional_discount_percentage DECIMAL(5, 2) DEFAULT 0.00,
    apply_discount_on discount_apply_on_enum DEFAULT 'GRAND_TOTAL',
    grand_total DECIMAL(15, 2) DEFAULT 0.00,
    base_grand_total DECIMAL(15, 2) DEFAULT 0.00,
    
    payment_terms_template VARCHAR(100),
    terms_and_conditions TEXT,
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'system',
    version INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS quotation_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quotation_id UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
    idx INT NOT NULL,
    item_id UUID NOT NULL REFERENCES items(id),
    item_code VARCHAR(100) NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    description TEXT,
    qty DECIMAL(15, 4) NOT NULL DEFAULT 1.0000,
    stock_uom VARCHAR(20) NOT NULL DEFAULT 'Nos',
    uom VARCHAR(20) NOT NULL DEFAULT 'Nos',
    conversion_factor DECIMAL(10, 4) DEFAULT 1.0000,
    stock_qty DECIMAL(15, 4) DEFAULT 1.0000,
    
    price_list_rate DECIMAL(15, 2) DEFAULT 0.00,
    base_price_list_rate DECIMAL(15, 2) DEFAULT 0.00,
    discount_percentage DECIMAL(5, 2) DEFAULT 0.00,
    discount_amount DECIMAL(15, 2) DEFAULT 0.00,
    rate DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    base_rate DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    base_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    net_rate DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    net_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    base_net_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    
    valuation_rate DECIMAL(15, 2) DEFAULT 0.00,
    gross_profit DECIMAL(15, 2) DEFAULT 0.00,
    ordered_qty DECIMAL(15, 4) DEFAULT 0.0000
);

-- 6. Sales Order Domain Aggregate
CREATE TABLE IF NOT EXISTS sales_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) NOT NULL UNIQUE,
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    delivery_date DATE NOT NULL,
    po_no VARCHAR(100),
    po_date DATE,
    
    customer_id UUID NOT NULL REFERENCES customers(id),
    customer_name VARCHAR(255) NOT NULL,
    order_type order_type_enum DEFAULT 'SALES',
    status sales_order_status_enum NOT NULL DEFAULT 'DRAFT',
    delivery_status delivery_status_enum NOT NULL DEFAULT 'NOT_DELIVERED',
    billing_status billing_status_enum NOT NULL DEFAULT 'NOT_BILLED',
    
    quotation_id UUID REFERENCES quotations(id),
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    conversion_rate DECIMAL(12, 6) DEFAULT 1.000000,
    selling_price_list_id UUID REFERENCES price_lists(id),
    
    total_qty DECIMAL(15, 4) DEFAULT 0.0000,
    total_net_weight DECIMAL(12, 4) DEFAULT 0.0000,
    net_total DECIMAL(15, 2) DEFAULT 0.00,
    base_net_total DECIMAL(15, 2) DEFAULT 0.00,
    total_taxes_and_charges DECIMAL(15, 2) DEFAULT 0.00,
    base_total_taxes_and_charges DECIMAL(15, 2) DEFAULT 0.00,
    discount_amount DECIMAL(15, 2) DEFAULT 0.00,
    additional_discount_percentage DECIMAL(5, 2) DEFAULT 0.00,
    apply_discount_on discount_apply_on_enum DEFAULT 'GRAND_TOTAL',
    grand_total DECIMAL(15, 2) DEFAULT 0.00,
    base_grand_total DECIMAL(15, 2) DEFAULT 0.00,
    advance_paid DECIMAL(15, 2) DEFAULT 0.00,
    
    per_delivered DECIMAL(5, 2) DEFAULT 0.00,
    per_billed DECIMAL(5, 2) DEFAULT 0.00,
    per_picked DECIMAL(5, 2) DEFAULT 0.00,
    
    reserve_stock BOOLEAN DEFAULT FALSE,
    skip_delivery_note BOOLEAN DEFAULT FALSE,
    payment_terms_template VARCHAR(100),
    terms_and_conditions TEXT,
    
    amount_eligible_for_commission DECIMAL(15, 2) DEFAULT 0.00,
    commission_rate DECIMAL(5, 2) DEFAULT 0.00,
    total_commission DECIMAL(15, 2) DEFAULT 0.00,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system',
    version INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS sales_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sales_order_id UUID NOT NULL REFERENCES sales_orders(id) ON DELETE CASCADE,
    idx INT NOT NULL,
    item_id UUID NOT NULL REFERENCES items(id),
    item_code VARCHAR(100) NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    description TEXT,
    warehouse VARCHAR(100) DEFAULT 'Main Warehouse',
    delivery_date DATE NOT NULL,
    
    qty DECIMAL(15, 4) NOT NULL DEFAULT 1.0000,
    stock_uom VARCHAR(20) NOT NULL DEFAULT 'Nos',
    uom VARCHAR(20) NOT NULL DEFAULT 'Nos',
    conversion_factor DECIMAL(10, 4) DEFAULT 1.0000,
    stock_qty DECIMAL(15, 4) DEFAULT 1.0000,
    
    price_list_rate DECIMAL(15, 2) DEFAULT 0.00,
    base_price_list_rate DECIMAL(15, 2) DEFAULT 0.00,
    discount_percentage DECIMAL(5, 2) DEFAULT 0.00,
    discount_amount DECIMAL(15, 2) DEFAULT 0.00,
    rate DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    base_rate DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    base_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    net_rate DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    net_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    base_net_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    
    valuation_rate DECIMAL(15, 2) DEFAULT 0.00,
    gross_profit DECIMAL(15, 2) DEFAULT 0.00,
    
    delivered_qty DECIMAL(15, 4) DEFAULT 0.0000,
    billed_amt DECIMAL(15, 2) DEFAULT 0.00,
    picked_qty DECIMAL(15, 4) DEFAULT 0.0000,
    delivered_by_supplier BOOLEAN DEFAULT FALSE,
    grant_commission BOOLEAN DEFAULT TRUE,
    prevdoc_quotation_item_id UUID
);

-- Sales Taxes applied on Quotation or Sales Order
CREATE TABLE IF NOT EXISTS sales_taxes_and_charges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    voucher_type VARCHAR(50) NOT NULL, -- 'Quotation', 'Sales Order', 'Sales Invoice'
    voucher_id UUID NOT NULL,
    idx INT NOT NULL,
    charge_type tax_charge_type_enum NOT NULL DEFAULT 'ON_NET_TOTAL',
    row_id INT, -- If charge_type is ON_PREVIOUS_ROW_TOTAL
    account_head VARCHAR(150) NOT NULL,
    description VARCHAR(255),
    rate DECIMAL(8, 4) NOT NULL DEFAULT 0.0000,
    tax_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    total DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    base_tax_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    base_total DECIMAL(15, 2) NOT NULL DEFAULT 0.00
);

-- Sales Team / Commissions Split Table
CREATE TABLE IF NOT EXISTS sales_teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    voucher_type VARCHAR(50) NOT NULL, -- 'Customer', 'Sales Order'
    voucher_id UUID NOT NULL,
    sales_person_name VARCHAR(100) NOT NULL,
    allocated_percentage DECIMAL(5, 2) NOT NULL, -- Sum of percentages must equal 100%
    allocated_amount DECIMAL(15, 2) DEFAULT 0.00,
    commission_rate DECIMAL(5, 2) DEFAULT 0.00,
    incentives DECIMAL(15, 2) DEFAULT 0.00
);

-- Payment Schedule & Milestones
CREATE TABLE IF NOT EXISTS payment_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sales_order_id UUID NOT NULL REFERENCES sales_orders(id) ON DELETE CASCADE,
    payment_term VARCHAR(100) NOT NULL,
    due_date DATE NOT NULL,
    invoice_portion DECIMAL(5, 2) NOT NULL, -- percentage
    payment_amount DECIMAL(15, 2) NOT NULL,
    outstanding DECIMAL(15, 2) NOT NULL,
    paid_amount DECIMAL(15, 2) DEFAULT 0.00
);

-- Stock Reservation Entries
CREATE TABLE IF NOT EXISTS stock_reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sales_order_id UUID NOT NULL REFERENCES sales_orders(id) ON DELETE CASCADE,
    sales_order_item_id UUID NOT NULL REFERENCES sales_order_items(id) ON DELETE CASCADE,
    item_code VARCHAR(100) NOT NULL,
    warehouse VARCHAR(100) NOT NULL,
    reserved_qty DECIMAL(15, 4) NOT NULL,
    delivered_qty DECIMAL(15, 4) DEFAULT 0.0000,
    status VARCHAR(50) DEFAULT 'Reserved', -- Reserved, Partially Delivered, Delivered, Cancelled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Quotation Enhancements for CRM & Win/Loss tracking
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS lost_reason VARCHAR(100);
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS competitor_name VARCHAR(150);
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS opportunity_id UUID;

-- 8. CRM: Leads and Opportunities
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_name VARCHAR(150) NOT NULL,
    company_name VARCHAR(150),
    email VARCHAR(150),
    phone VARCHAR(50),
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN', -- OPEN, CONTACTED, QUALIFIED, LOST
    lead_source VARCHAR(100) DEFAULT 'Website / Inbound',
    territory_id UUID REFERENCES territories(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    opportunity_from VARCHAR(50) NOT NULL DEFAULT 'LEAD', -- LEAD, CUSTOMER
    party_id UUID,
    party_name VARCHAR(150) NOT NULL,
    opportunity_type VARCHAR(100) DEFAULT 'Sales / ERP',
    status VARCHAR(50) NOT NULL DEFAULT 'QUALIFICATION', -- QUALIFICATION, PROPOSAL, NEGOTIATION, WON, LOST
    deal_size DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    probability DECIMAL(5, 2) DEFAULT 50.00, -- 0-100%
    expected_closing_date DATE,
    sales_stage VARCHAR(100) DEFAULT 'Discovery',
    contact_email VARCHAR(150),
    contact_phone VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Delivery Notes & Fulfilment
CREATE TABLE IF NOT EXISTS delivery_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    delivery_note_number VARCHAR(100) NOT NULL UNIQUE,
    sales_order_id UUID REFERENCES sales_orders(id) ON DELETE SET NULL,
    customer_id UUID NOT NULL REFERENCES customers(id),
    customer_name VARCHAR(150) NOT NULL,
    posting_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'SUBMITTED', -- DRAFT, SUBMITTED, COMPLETED, CANCELLED
    carrier VARCHAR(100),
    tracking_number VARCHAR(100),
    shipping_address TEXT,
    total_qty DECIMAL(15, 4) NOT NULL DEFAULT 0.0000,
    total_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS delivery_note_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    delivery_note_id UUID NOT NULL REFERENCES delivery_notes(id) ON DELETE CASCADE,
    sales_order_item_id UUID,
    item_id UUID REFERENCES items(id),
    item_code VARCHAR(100) NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    qty DECIMAL(15, 4) NOT NULL,
    uom VARCHAR(50) DEFAULT 'Nos',
    rate DECIMAL(15, 2) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    warehouse VARCHAR(100) DEFAULT 'Stores - Default'
);

-- 10. Sales Invoices & Billing
CREATE TABLE IF NOT EXISTS sales_invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number VARCHAR(100) NOT NULL UNIQUE,
    sales_order_id UUID REFERENCES sales_orders(id) ON DELETE SET NULL,
    delivery_note_id UUID REFERENCES delivery_notes(id) ON DELETE SET NULL,
    customer_id UUID NOT NULL REFERENCES customers(id),
    customer_name VARCHAR(150) NOT NULL,
    posting_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'UNPAID', -- DRAFT, UNPAID, PARTLY_PAID, PAID, OVERDUE, CANCELLED
    currency VARCHAR(10) DEFAULT 'INR',
    conversion_rate DECIMAL(10, 4) DEFAULT 1.0000,
    net_total DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    total_tax DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    grand_total DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    paid_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    outstanding_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    payment_terms VARCHAR(100) DEFAULT 'Payment due upon receipt',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sales_invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sales_invoice_id UUID NOT NULL REFERENCES sales_invoices(id) ON DELETE CASCADE,
    sales_order_item_id UUID,
    item_id UUID REFERENCES items(id),
    item_code VARCHAR(100) NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    qty DECIMAL(15, 4) NOT NULL,
    rate DECIMAL(15, 2) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    income_account VARCHAR(150) DEFAULT '4110 - Sales Revenue'
);

-- 11. Payment Entries (Customer Receipts & Advance Payments)
CREATE TABLE IF NOT EXISTS payment_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_number VARCHAR(100) NOT NULL UNIQUE,
    payment_type VARCHAR(50) NOT NULL DEFAULT 'RECEIVE', -- RECEIVE, PAY
    payment_mode VARCHAR(50) NOT NULL DEFAULT 'BANK_TRANSFER', -- BANK_TRANSFER, CREDIT_CARD, CHEQUE, CASH, UPI
    customer_id UUID NOT NULL REFERENCES customers(id),
    sales_invoice_id UUID REFERENCES sales_invoices(id) ON DELETE SET NULL,
    sales_order_id UUID REFERENCES sales_orders(id) ON DELETE SET NULL,
    posting_date DATE NOT NULL DEFAULT CURRENT_DATE,
    paid_amount DECIMAL(15, 2) NOT NULL,
    reference_no VARCHAR(100),
    reference_date DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Pricing Rules & Promotional Coupons
CREATE TABLE IF NOT EXISTS pricing_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(150) NOT NULL,
    apply_on VARCHAR(50) NOT NULL, -- ITEM_CODE, ITEM_GROUP, CUSTOMER, CUSTOMER_GROUP
    apply_key_id VARCHAR(150) NOT NULL,
    min_qty DECIMAL(15, 4) DEFAULT 1.0000,
    discount_percentage DECIMAL(5, 2) DEFAULT 0.00,
    discount_amount DECIMAL(15, 2) DEFAULT 0.00,
    is_free_item BOOLEAN DEFAULT FALSE,
    free_item_code VARCHAR(100),
    free_qty DECIMAL(15, 4) DEFAULT 0.0000,
    valid_from DATE DEFAULT CURRENT_DATE,
    valid_upto DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS coupon_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coupon_name VARCHAR(150) NOT NULL,
    coupon_code VARCHAR(50) NOT NULL UNIQUE,
    discount_type VARCHAR(50) NOT NULL DEFAULT 'PERCENTAGE', -- PERCENTAGE, FIXED_AMOUNT
    discount_value DECIMAL(15, 2) NOT NULL,
    min_order_amount DECIMAL(15, 2) DEFAULT 0.00,
    valid_upto DATE,
    used_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. General Ledger (GL) Double-Entry Accounting
CREATE TABLE IF NOT EXISTS gl_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    posting_date DATE NOT NULL DEFAULT CURRENT_DATE,
    voucher_type VARCHAR(50) NOT NULL, -- Sales Invoice, Payment Entry, Journal Entry
    voucher_no VARCHAR(100) NOT NULL,
    voucher_id UUID,
    account VARCHAR(150) NOT NULL, -- e.g. 1310 - Debtors / Accounts Receivable, 4110 - Sales Revenue
    debit DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    credit DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    remarks TEXT,
    is_cancelled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_gl_entries_voucher ON gl_entries(voucher_type, voucher_no);
CREATE INDEX IF NOT EXISTS idx_gl_entries_account ON gl_entries(account);
CREATE INDEX IF NOT EXISTS idx_gl_entries_customer ON gl_entries(customer_id);


-- Indexes for High-Performance Queries
CREATE INDEX IF NOT EXISTS idx_customers_code ON customers(customer_code);
CREATE INDEX IF NOT EXISTS idx_customers_group ON customers(customer_group_id);
CREATE INDEX IF NOT EXISTS idx_quotations_customer ON quotations(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(status);
CREATE INDEX IF NOT EXISTS idx_sales_orders_customer ON sales_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_orders_status ON sales_orders(status);
CREATE INDEX IF NOT EXISTS idx_sales_orders_date ON sales_orders(transaction_date);
CREATE INDEX IF NOT EXISTS idx_so_items_order ON sales_order_items(sales_order_id);
CREATE INDEX IF NOT EXISTS idx_taxes_voucher ON sales_taxes_and_charges(voucher_type, voucher_id);
CREATE INDEX IF NOT EXISTS idx_dn_sales_order ON delivery_notes(sales_order_id);
CREATE INDEX IF NOT EXISTS idx_si_sales_order ON sales_invoices(sales_order_id);
CREATE INDEX IF NOT EXISTS idx_si_customer ON sales_invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payment_entries(sales_invoice_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_opp_status ON opportunities(status);

