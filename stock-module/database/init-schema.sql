-- NextGen ERP - Stock & Inventory Module Schema
-- PostgreSQL DDL with Double-Entry Stock Ledger, Bin Cache, Valuation & Traceability

CREATE SCHEMA IF NOT EXISTS stock;
SET search_path TO stock, public;

-- 1. Units of Measure (UOM)
CREATE TABLE IF NOT EXISTS uoms (
    id VARCHAR(64) PRIMARY KEY,
    uom_name VARCHAR(100) NOT NULL UNIQUE,
    symbol VARCHAR(20),
    must_be_whole_number BOOLEAN DEFAULT FALSE,
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Item Groups (Hierarchical Category Tree)
CREATE TABLE IF NOT EXISTS item_groups (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE,
    parent_id VARCHAR(64) REFERENCES item_groups(id) ON DELETE SET NULL,
    is_group BOOLEAN DEFAULT FALSE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Items Master
CREATE TABLE IF NOT EXISTS items (
    id VARCHAR(64) PRIMARY KEY,
    item_code VARCHAR(100) NOT NULL UNIQUE,
    item_name VARCHAR(255) NOT NULL,
    item_group_id VARCHAR(64) REFERENCES item_groups(id),
    stock_uom VARCHAR(64) NOT NULL REFERENCES uoms(id),
    is_stock_item BOOLEAN DEFAULT TRUE,
    valuation_method VARCHAR(30) DEFAULT 'FIFO', -- 'FIFO', 'Moving Average'
    standard_rate DECIMAL(18, 4) DEFAULT 0.0000,
    opening_stock DECIMAL(18, 4) DEFAULT 0.0000,
    safety_stock DECIMAL(18, 4) DEFAULT 0.0000,
    lead_time_days INT DEFAULT 0,
    has_variants BOOLEAN DEFAULT FALSE,
    variant_of VARCHAR(64) REFERENCES items(id) ON DELETE SET NULL,
    has_batch_no BOOLEAN DEFAULT FALSE,
    has_serial_no BOOLEAN DEFAULT FALSE,
    inspection_required_before_receipt BOOLEAN DEFAULT FALSE,
    inspection_required_before_delivery BOOLEAN DEFAULT FALSE,
    default_warehouse_id VARCHAR(64),
    description TEXT,
    barcode VARCHAR(100),
    image_url VARCHAR(500),
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. UOM Conversions
CREATE TABLE IF NOT EXISTS uom_conversions (
    id VARCHAR(64) PRIMARY KEY,
    item_id VARCHAR(64) NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    from_uom VARCHAR(64) NOT NULL REFERENCES uoms(id),
    to_uom VARCHAR(64) NOT NULL REFERENCES uoms(id),
    conversion_factor DECIMAL(18, 6) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Warehouses (Hierarchical Tree)
CREATE TABLE IF NOT EXISTS warehouses (
    id VARCHAR(64) PRIMARY KEY,
    warehouse_name VARCHAR(150) NOT NULL UNIQUE,
    parent_warehouse_id VARCHAR(64) REFERENCES warehouses(id) ON DELETE SET NULL,
    is_group BOOLEAN DEFAULT FALSE,
    warehouse_type VARCHAR(50) DEFAULT 'Stores', -- 'Stores', 'Work In Progress', 'Finished Goods', 'Quarantine', 'Transit', 'Scrap'
    company_name VARCHAR(150) DEFAULT 'NextGen Corp',
    account_id VARCHAR(64),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'USA',
    is_disabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Bins (Real-time aggregation cache per Item + Warehouse)
CREATE TABLE IF NOT EXISTS bins (
    id VARCHAR(64) PRIMARY KEY,
    item_id VARCHAR(64) NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    warehouse_id VARCHAR(64) NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    actual_qty DECIMAL(18, 4) DEFAULT 0.0000,
    ordered_qty DECIMAL(18, 4) DEFAULT 0.0000,
    reserved_qty DECIMAL(18, 4) DEFAULT 0.0000,
    indented_qty DECIMAL(18, 4) DEFAULT 0.0000,
    planned_qty DECIMAL(18, 4) DEFAULT 0.0000,
    projected_qty DECIMAL(18, 4) DEFAULT 0.0000,
    valuation_rate DECIMAL(18, 4) DEFAULT 0.0000,
    stock_value DECIMAL(18, 4) DEFAULT 0.0000,
    stock_queue JSONB DEFAULT '[]', -- Internal FIFO queue [[qty, rate], ...]
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_bin_item_warehouse UNIQUE (item_id, warehouse_id)
);

-- 7. Batches
CREATE TABLE IF NOT EXISTS batches (
    id VARCHAR(64) PRIMARY KEY,
    batch_id VARCHAR(100) NOT NULL UNIQUE,
    item_id VARCHAR(64) NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    manufacturing_date DATE,
    expiry_date DATE,
    batch_qty DECIMAL(18, 4) DEFAULT 0.0000,
    supplier_batch_no VARCHAR(100),
    description TEXT,
    is_disabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Serial Numbers
CREATE TABLE IF NOT EXISTS serial_nos (
    id VARCHAR(64) PRIMARY KEY,
    serial_no VARCHAR(100) NOT NULL UNIQUE,
    item_id VARCHAR(64) NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    warehouse_id VARCHAR(64) REFERENCES warehouses(id) ON DELETE SET NULL,
    batch_id VARCHAR(64) REFERENCES batches(id) ON DELETE SET NULL,
    status VARCHAR(30) DEFAULT 'Active', -- 'Active', 'Delivered', 'Expired', 'Defective'
    purchase_rate DECIMAL(18, 4) DEFAULT 0.0000,
    warranty_expiry_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Stock Ledger Entries (Immutable Audit Ledger)
CREATE TABLE IF NOT EXISTS stock_ledger_entries (
    id VARCHAR(64) PRIMARY KEY,
    item_id VARCHAR(64) NOT NULL REFERENCES items(id),
    warehouse_id VARCHAR(64) NOT NULL REFERENCES warehouses(id),
    posting_date DATE NOT NULL,
    posting_time TIME NOT NULL,
    voucher_type VARCHAR(64) NOT NULL, -- 'Stock Entry', 'Purchase Receipt', 'Delivery Note', 'Stock Reconciliation'
    voucher_no VARCHAR(100) NOT NULL,
    voucher_detail_no VARCHAR(100),
    actual_qty DECIMAL(18, 4) NOT NULL, -- +ve for inward, -ve for outward
    qty_after_transaction DECIMAL(18, 4) NOT NULL,
    incoming_rate DECIMAL(18, 4) DEFAULT 0.0000,
    valuation_rate DECIMAL(18, 4) NOT NULL,
    stock_value DECIMAL(18, 4) NOT NULL,
    stock_value_difference DECIMAL(18, 4) NOT NULL,
    batch_id VARCHAR(64) REFERENCES batches(id) ON DELETE SET NULL,
    serial_nos TEXT, -- Comma-separated or JSON list
    stock_queue JSONB, -- Snapshot of FIFO queue after transaction
    is_cancelled BOOLEAN DEFAULT FALSE,
    fiscal_year VARCHAR(20),
    company VARCHAR(150) DEFAULT 'NextGen Corp',
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Universal Stock Entries (Receipt, Issue, Transfer, Manufacture, Repack)
CREATE TABLE IF NOT EXISTS stock_entries (
    id VARCHAR(64) PRIMARY KEY,
    entry_number VARCHAR(100) NOT NULL UNIQUE,
    purpose VARCHAR(50) NOT NULL, -- 'Material Receipt', 'Material Issue', 'Material Transfer', 'Manufacture', 'Repack', 'Send to Subcontractor'
    posting_date DATE NOT NULL,
    posting_time TIME NOT NULL,
    from_warehouse_id VARCHAR(64) REFERENCES warehouses(id),
    to_warehouse_id VARCHAR(64) REFERENCES warehouses(id),
    total_incoming_value DECIMAL(18, 4) DEFAULT 0.0000,
    total_outgoing_value DECIMAL(18, 4) DEFAULT 0.0000,
    value_difference DECIMAL(18, 4) DEFAULT 0.0000,
    additional_costs DECIMAL(18, 4) DEFAULT 0.0000,
    work_order_id VARCHAR(64),
    bom_id VARCHAR(64),
    status VARCHAR(30) DEFAULT 'Draft', -- 'Draft', 'Submitted', 'Cancelled'
    remarks TEXT,
    created_by VARCHAR(100) DEFAULT 'system',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Stock Entry Items
CREATE TABLE IF NOT EXISTS stock_entry_items (
    id VARCHAR(64) PRIMARY KEY,
    stock_entry_id VARCHAR(64) NOT NULL REFERENCES stock_entries(id) ON DELETE CASCADE,
    item_id VARCHAR(64) NOT NULL REFERENCES items(id),
    source_warehouse_id VARCHAR(64) REFERENCES warehouses(id),
    target_warehouse_id VARCHAR(64) REFERENCES warehouses(id),
    qty DECIMAL(18, 4) NOT NULL,
    uom_id VARCHAR(64) REFERENCES uoms(id),
    basic_rate DECIMAL(18, 4) DEFAULT 0.0000,
    amount DECIMAL(18, 4) DEFAULT 0.0000,
    additional_cost DECIMAL(18, 4) DEFAULT 0.0000,
    valuation_rate DECIMAL(18, 4) DEFAULT 0.0000,
    batch_id VARCHAR(64) REFERENCES batches(id),
    serial_nos TEXT,
    is_scrap_item BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Landed Cost Vouchers (Cost Absorption Engine)
CREATE TABLE IF NOT EXISTS landed_cost_vouchers (
    id VARCHAR(64) PRIMARY KEY,
    voucher_number VARCHAR(100) NOT NULL UNIQUE,
    posting_date DATE NOT NULL,
    distribute_charges_based_on VARCHAR(30) DEFAULT 'Amount', -- 'Amount', 'Qty', 'Distribute Manually'
    total_taxes_and_charges DECIMAL(18, 4) DEFAULT 0.0000,
    status VARCHAR(30) DEFAULT 'Draft', -- 'Draft', 'Submitted', 'Cancelled'
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS landed_cost_items (
    id VARCHAR(64) PRIMARY KEY,
    voucher_id VARCHAR(64) NOT NULL REFERENCES landed_cost_vouchers(id) ON DELETE CASCADE,
    receipt_document_type VARCHAR(50) NOT NULL, -- 'Purchase Receipt', 'Stock Entry'
    receipt_document_id VARCHAR(64) NOT NULL,
    item_id VARCHAR(64) NOT NULL REFERENCES items(id),
    qty DECIMAL(18, 4) NOT NULL,
    rate DECIMAL(18, 4) NOT NULL,
    amount DECIMAL(18, 4) NOT NULL,
    applicable_charges DECIMAL(18, 4) DEFAULT 0.0000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS landed_cost_taxes (
    id VARCHAR(64) PRIMARY KEY,
    voucher_id VARCHAR(64) NOT NULL REFERENCES landed_cost_vouchers(id) ON DELETE CASCADE,
    expense_account VARCHAR(100) NOT NULL,
    description TEXT,
    amount DECIMAL(18, 4) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. Quality Inspections
CREATE TABLE IF NOT EXISTS quality_inspections (
    id VARCHAR(64) PRIMARY KEY,
    inspection_number VARCHAR(100) NOT NULL UNIQUE,
    inspection_type VARCHAR(30) NOT NULL, -- 'Incoming', 'Outgoing', 'In Process'
    reference_type VARCHAR(50) NOT NULL, -- 'Purchase Receipt', 'Delivery Note', 'Stock Entry'
    reference_id VARCHAR(64) NOT NULL,
    item_id VARCHAR(64) NOT NULL REFERENCES items(id),
    sample_size DECIMAL(18, 4) DEFAULT 1.0000,
    inspection_date DATE NOT NULL,
    inspector VARCHAR(100),
    status VARCHAR(30) DEFAULT 'Accepted', -- 'Accepted', 'Rejected'
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quality_inspection_readings (
    id VARCHAR(64) PRIMARY KEY,
    inspection_id VARCHAR(64) NOT NULL REFERENCES quality_inspections(id) ON DELETE CASCADE,
    parameter_name VARCHAR(150) NOT NULL,
    specification TEXT,
    min_value DECIMAL(18, 4),
    max_value DECIMAL(18, 4),
    reading_value DECIMAL(18, 4),
    status VARCHAR(30) DEFAULT 'Accepted', -- 'Accepted', 'Rejected'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. Stock Reconciliations (Physical Inventory Count Adjustments)
CREATE TABLE IF NOT EXISTS stock_reconciliations (
    id VARCHAR(64) PRIMARY KEY,
    reconciliation_number VARCHAR(100) NOT NULL UNIQUE,
    posting_date DATE NOT NULL,
    posting_time TIME NOT NULL,
    purpose VARCHAR(50) DEFAULT 'Stock Reconciliation', -- 'Opening Stock', 'Stock Reconciliation'
    status VARCHAR(30) DEFAULT 'Draft', -- 'Draft', 'Submitted', 'Cancelled'
    difference_amount DECIMAL(18, 4) DEFAULT 0.0000,
    expense_account VARCHAR(100) DEFAULT 'Stock Adjustment - NC',
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stock_reconciliation_items (
    id VARCHAR(64) PRIMARY KEY,
    reconciliation_id VARCHAR(64) NOT NULL REFERENCES stock_reconciliations(id) ON DELETE CASCADE,
    item_id VARCHAR(64) NOT NULL REFERENCES items(id),
    warehouse_id VARCHAR(64) NOT NULL REFERENCES warehouses(id),
    current_qty DECIMAL(18, 4) DEFAULT 0.0000,
    current_valuation_rate DECIMAL(18, 4) DEFAULT 0.0000,
    current_stock_value DECIMAL(18, 4) DEFAULT 0.0000,
    qty DECIMAL(18, 4) NOT NULL, -- Physical actual count
    valuation_rate DECIMAL(18, 4) NOT NULL,
    amount_difference DECIMAL(18, 4) DEFAULT 0.0000,
    batch_id VARCHAR(64) REFERENCES batches(id),
    serial_nos TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for maximum query performance on ledger and bins
CREATE INDEX IF NOT EXISTS idx_sle_item_wh ON stock_ledger_entries(item_id, warehouse_id, posting_date, posting_time);
CREATE INDEX IF NOT EXISTS idx_sle_voucher ON stock_ledger_entries(voucher_type, voucher_no);
CREATE INDEX IF NOT EXISTS idx_bin_item ON bins(item_id);
CREATE INDEX IF NOT EXISTS idx_bin_warehouse ON bins(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_stock_entry_status ON stock_entries(status, purpose);
CREATE INDEX IF NOT EXISTS idx_items_code ON items(item_code);
CREATE INDEX IF NOT EXISTS idx_warehouses_parent ON warehouses(parent_warehouse_id);
