-- =============================================================================
-- NextGen ERP - Production & Manufacturing (MRP) Module Schema
-- Relational Engine: PostgreSQL 15+
-- Features: Parent-Child WOs, Real-time Consumption, Postgres Recursive CTEs, RLS
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- ENUMS
-- -----------------------------------------------------------------------------
CREATE TYPE mrp_bom_status AS ENUM ('DRAFT', 'ACTIVE', 'CANCELLED');
CREATE TYPE mrp_wo_status AS ENUM ('DRAFT', 'SUBMITTED', 'NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'STOPPED', 'CANCELLED');
CREATE TYPE mrp_job_card_status AS ENUM ('OPEN', 'WORK_IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'CANCELLED');
CREATE TYPE mrp_quality_status AS ENUM ('PENDING', 'PASSED', 'FAILED');
CREATE TYPE mrp_plan_status AS ENUM ('DRAFT', 'SUBMITTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE mrp_downtime_category AS ENUM ('BREAKDOWN', 'MAINTENANCE', 'TOOLING', 'MATERIAL_SHORTAGE', 'POWER_OUTAGE', 'OPERATOR_UNAVAILABLE');

-- -----------------------------------------------------------------------------
-- 1. ISOLATED MOCK FOUNDATION TABLES (SANDBOX ADAPTERS)
-- -----------------------------------------------------------------------------
CREATE TABLE mrp_mock_item (
    item_code VARCHAR(100) PRIMARY KEY,
    item_name VARCHAR(255) NOT NULL,
    item_group VARCHAR(100) NOT NULL,
    uom VARCHAR(20) NOT NULL DEFAULT 'Nos',
    standard_rate DECIMAL(15, 4) NOT NULL DEFAULT 0.0000,
    is_stock_item BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE mrp_mock_warehouse (
    warehouse_id VARCHAR(100) PRIMARY KEY,
    warehouse_name VARCHAR(255) NOT NULL,
    warehouse_type VARCHAR(50) NOT NULL DEFAULT 'Stores',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE mrp_mock_employee (
    employee_id VARCHAR(100) PRIMARY KEY,
    employee_name VARCHAR(255) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    hourly_rate DECIMAL(15, 4) NOT NULL DEFAULT 0.0000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE mrp_mock_stock_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_code VARCHAR(100) NOT NULL REFERENCES mrp_mock_item(item_code),
    warehouse_id VARCHAR(100) NOT NULL REFERENCES mrp_mock_warehouse(warehouse_id),
    actual_qty DECIMAL(15, 4) NOT NULL,
    valuation_rate DECIMAL(15, 4) NOT NULL,
    voucher_type VARCHAR(50) NOT NULL,
    voucher_no VARCHAR(100) NOT NULL,
    posting_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 2. WORKSTATIONS & OPERATIONS
-- -----------------------------------------------------------------------------
CREATE TABLE mrp_workstation (
    workstation_id VARCHAR(100) PRIMARY KEY,
    workstation_name VARCHAR(255) NOT NULL,
    hourly_cost DECIMAL(15, 4) NOT NULL DEFAULT 0.0000,
    electricity_cost_per_hour DECIMAL(15, 4) DEFAULT 0.0000,
    consumables_cost_per_hour DECIMAL(15, 4) DEFAULT 0.0000,
    rent_cost_per_hour DECIMAL(15, 4) DEFAULT 0.0000,
    working_hours_per_day DECIMAL(5, 2) NOT NULL DEFAULT 8.00,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE mrp_operation (
    operation_id VARCHAR(100) PRIMARY KEY,
    operation_name VARCHAR(255) NOT NULL,
    default_workstation_id VARCHAR(100) REFERENCES mrp_workstation(workstation_id),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE mrp_routing (
    routing_id VARCHAR(100) PRIMARY KEY,
    routing_name VARCHAR(255) NOT NULL,
    item_code VARCHAR(100) REFERENCES mrp_mock_item(item_code),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE mrp_routing_operation (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    routing_id VARCHAR(100) NOT NULL REFERENCES mrp_routing(routing_id) ON DELETE CASCADE,
    sequence_no INT NOT NULL,
    operation_id VARCHAR(100) NOT NULL REFERENCES mrp_operation(operation_id),
    workstation_id VARCHAR(100) NOT NULL REFERENCES mrp_workstation(workstation_id),
    time_in_mins DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    batch_size INT NOT NULL DEFAULT 1
);

-- -----------------------------------------------------------------------------
-- 3. BILL OF MATERIALS (BOM)
-- -----------------------------------------------------------------------------
CREATE TABLE mrp_bom (
    bom_no VARCHAR(100) PRIMARY KEY,
    item_code VARCHAR(100) NOT NULL REFERENCES mrp_mock_item(item_code),
    item_name VARCHAR(255) NOT NULL,
    quantity DECIMAL(15, 4) NOT NULL DEFAULT 1.0000,
    uom VARCHAR(20) NOT NULL DEFAULT 'Nos',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    status mrp_bom_status NOT NULL DEFAULT 'DRAFT',
    routing_id VARCHAR(100) REFERENCES mrp_routing(routing_id),
    raw_material_cost DECIMAL(15, 4) NOT NULL DEFAULT 0.0000,
    operating_cost DECIMAL(15, 4) NOT NULL DEFAULT 0.0000,
    scrap_cost DECIMAL(15, 4) NOT NULL DEFAULT 0.0000,
    total_cost DECIMAL(15, 4) NOT NULL DEFAULT 0.0000,
    created_by VARCHAR(100) DEFAULT 'system',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE mrp_bom_item (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bom_no VARCHAR(100) NOT NULL REFERENCES mrp_bom(bom_no) ON DELETE CASCADE,
    item_code VARCHAR(100) NOT NULL REFERENCES mrp_mock_item(item_code),
    item_name VARCHAR(255) NOT NULL,
    qty DECIMAL(15, 4) NOT NULL,
    uom VARCHAR(20) NOT NULL DEFAULT 'Nos',
    standard_rate DECIMAL(15, 4) NOT NULL DEFAULT 0.0000,
    amount DECIMAL(15, 4) NOT NULL DEFAULT 0.0000,
    sub_bom_no VARCHAR(100) REFERENCES mrp_bom(bom_no)
);

CREATE TABLE mrp_bom_operation (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bom_no VARCHAR(100) NOT NULL REFERENCES mrp_bom(bom_no) ON DELETE CASCADE,
    sequence_no INT NOT NULL,
    operation_id VARCHAR(100) NOT NULL REFERENCES mrp_operation(operation_id),
    workstation_id VARCHAR(100) NOT NULL REFERENCES mrp_workstation(workstation_id),
    time_in_mins DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    operating_cost DECIMAL(15, 4) NOT NULL DEFAULT 0.0000
);

-- -----------------------------------------------------------------------------
-- 4. WORK ORDERS & NESTED HIERARCHY
-- -----------------------------------------------------------------------------
CREATE TABLE mrp_work_order (
    work_order_id VARCHAR(100) PRIMARY KEY,
    parent_wo_id VARCHAR(100) REFERENCES mrp_work_order(work_order_id) ON DELETE SET NULL,
    production_item VARCHAR(100) NOT NULL REFERENCES mrp_mock_item(item_code),
    item_name VARCHAR(255) NOT NULL,
    bom_no VARCHAR(100) NOT NULL REFERENCES mrp_bom(bom_no),
    qty_to_produce DECIMAL(15, 4) NOT NULL,
    produced_qty DECIMAL(15, 4) NOT NULL DEFAULT 0.0000,
    source_warehouse VARCHAR(100) REFERENCES mrp_mock_warehouse(warehouse_id),
    wip_warehouse VARCHAR(100) REFERENCES mrp_mock_warehouse(warehouse_id),
    fg_warehouse VARCHAR(100) REFERENCES mrp_mock_warehouse(warehouse_id),
    planned_start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    planned_end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    actual_start_date TIMESTAMP WITH TIME ZONE,
    actual_end_date TIMESTAMP WITH TIME ZONE,
    status mrp_wo_status NOT NULL DEFAULT 'DRAFT',
    planned_operating_cost DECIMAL(15, 4) DEFAULT 0.0000,
    actual_operating_cost DECIMAL(15, 4) DEFAULT 0.0000,
    planned_material_cost DECIMAL(15, 4) DEFAULT 0.0000,
    actual_material_cost DECIMAL(15, 4) DEFAULT 0.0000,
    version INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE mrp_work_order_item (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    work_order_id VARCHAR(100) NOT NULL REFERENCES mrp_work_order(work_order_id) ON DELETE CASCADE,
    item_code VARCHAR(100) NOT NULL REFERENCES mrp_mock_item(item_code),
    item_name VARCHAR(255) NOT NULL,
    required_qty DECIMAL(15, 4) NOT NULL,
    transferred_qty DECIMAL(15, 4) NOT NULL DEFAULT 0.0000,
    actual_consumed_qty DECIMAL(15, 4) NOT NULL DEFAULT 0.0000,
    uom VARCHAR(20) NOT NULL DEFAULT 'Nos',
    standard_rate DECIMAL(15, 4) NOT NULL DEFAULT 0.0000
);

CREATE TABLE mrp_work_order_operation (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    work_order_id VARCHAR(100) NOT NULL REFERENCES mrp_work_order(work_order_id) ON DELETE CASCADE,
    sequence_no INT NOT NULL,
    operation_id VARCHAR(100) NOT NULL REFERENCES mrp_operation(operation_id),
    workstation_id VARCHAR(100) NOT NULL REFERENCES mrp_workstation(workstation_id),
    time_in_mins DECIMAL(10, 2) NOT NULL,
    completed_qty DECIMAL(15, 4) NOT NULL DEFAULT 0.0000,
    status mrp_job_card_status NOT NULL DEFAULT 'OPEN'
);

-- -----------------------------------------------------------------------------
-- 5. JOB CARDS & REAL-TIME TIME LOGS
-- -----------------------------------------------------------------------------
CREATE TABLE mrp_job_card (
    job_card_id VARCHAR(100) PRIMARY KEY,
    work_order_id VARCHAR(100) NOT NULL REFERENCES mrp_work_order(work_order_id) ON DELETE CASCADE,
    operation_id VARCHAR(100) NOT NULL REFERENCES mrp_operation(operation_id),
    workstation_id VARCHAR(100) NOT NULL REFERENCES mrp_workstation(workstation_id),
    for_quantity DECIMAL(15, 4) NOT NULL,
    completed_quantity DECIMAL(15, 4) NOT NULL DEFAULT 0.0000,
    transferred_qty DECIMAL(15, 4) NOT NULL DEFAULT 0.0000,
    status mrp_job_card_status NOT NULL DEFAULT 'OPEN',
    assigned_employee_id VARCHAR(100) REFERENCES mrp_mock_employee(employee_id),
    total_time_in_mins DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    version INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE mrp_job_card_time_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_card_id VARCHAR(100) NOT NULL REFERENCES mrp_job_card(job_card_id) ON DELETE CASCADE,
    employee_id VARCHAR(100) REFERENCES mrp_mock_employee(employee_id),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    time_in_mins DECIMAL(10, 2) DEFAULT 0.00,
    completed_qty DECIMAL(15, 4) DEFAULT 0.00
);

-- -----------------------------------------------------------------------------
-- 6. QUALITY CHECK & INSPECTION
-- -----------------------------------------------------------------------------
CREATE TABLE mrp_quality_template (
    template_id VARCHAR(100) PRIMARY KEY,
    template_name VARCHAR(255) NOT NULL,
    item_code VARCHAR(100) REFERENCES mrp_mock_item(item_code),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE mrp_quality_template_parameter (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id VARCHAR(100) NOT NULL REFERENCES mrp_quality_template(template_id) ON DELETE CASCADE,
    parameter_name VARCHAR(255) NOT NULL,
    min_value DECIMAL(15, 4),
    max_value DECIMAL(15, 4),
    acceptance_criteria VARCHAR(255)
);

CREATE TABLE mrp_quality_inspection (
    inspection_id VARCHAR(100) PRIMARY KEY,
    work_order_id VARCHAR(100) NOT NULL REFERENCES mrp_work_order(work_order_id),
    inspection_type VARCHAR(50) NOT NULL DEFAULT 'In-Process',
    inspected_by VARCHAR(100) NOT NULL,
    inspected_qty DECIMAL(15, 4) NOT NULL,
    status mrp_quality_status NOT NULL DEFAULT 'PENDING',
    remarks TEXT,
    inspection_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE mrp_quality_inspection_reading (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inspection_id VARCHAR(100) NOT NULL REFERENCES mrp_quality_inspection(inspection_id) ON DELETE CASCADE,
    parameter_name VARCHAR(255) NOT NULL,
    reading_value DECIMAL(15, 4) NOT NULL,
    status mrp_quality_status NOT NULL DEFAULT 'PASSED'
);

-- -----------------------------------------------------------------------------
-- 7. MATERIAL REQUIREMENT PLANNING (MRP) & PRODUCTION PLAN
-- -----------------------------------------------------------------------------
CREATE TABLE mrp_production_plan (
    plan_id VARCHAR(100) PRIMARY KEY,
    posting_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status mrp_plan_status NOT NULL DEFAULT 'DRAFT',
    created_by VARCHAR(100) DEFAULT 'planner',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE mrp_production_plan_item (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id VARCHAR(100) NOT NULL REFERENCES mrp_production_plan(plan_id) ON DELETE CASCADE,
    item_code VARCHAR(100) NOT NULL REFERENCES mrp_mock_item(item_code),
    bom_no VARCHAR(100) NOT NULL REFERENCES mrp_bom(bom_no),
    planned_qty DECIMAL(15, 4) NOT NULL,
    produced_qty DECIMAL(15, 4) NOT NULL DEFAULT 0.0000,
    sales_order_ref VARCHAR(100)
);

-- -----------------------------------------------------------------------------
-- 8. SCRAP & DOWNTIME TRACKING
-- -----------------------------------------------------------------------------
CREATE TABLE mrp_scrap_item (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    work_order_id VARCHAR(100) NOT NULL REFERENCES mrp_work_order(work_order_id) ON DELETE CASCADE,
    item_code VARCHAR(100) NOT NULL REFERENCES mrp_mock_item(item_code),
    scrap_qty DECIMAL(15, 4) NOT NULL,
    uom VARCHAR(20) NOT NULL DEFAULT 'Nos',
    financial_valuation DECIMAL(15, 4) NOT NULL DEFAULT 0.0000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE mrp_downtime_entry (
    downtime_id VARCHAR(100) PRIMARY KEY,
    workstation_id VARCHAR(100) NOT NULL REFERENCES mrp_workstation(workstation_id),
    operator_employee_id VARCHAR(100) REFERENCES mrp_mock_employee(employee_id),
    category mrp_downtime_category NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    downtime_in_mins DECIMAL(10, 2) DEFAULT 0.00,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 9. POSTGRES RECURSIVE CTE VIEW FOR MULTI-LEVEL BOM EXPLOSION
-- Explicit type casting to NUMERIC(15,4) to resolve PostgreSQL CTE recursive type matching
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW view_mrp_bom_explosion AS
WITH RECURSIVE bom_tree AS (
    SELECT 
        bi.bom_no AS root_bom_no,
        bi.item_code,
        bi.item_name,
        bi.qty::NUMERIC(15,4) AS required_qty,
        bi.uom,
        bi.standard_rate::NUMERIC(15,4) AS standard_rate,
        bi.amount::NUMERIC(15,4) AS amount,
        bi.sub_bom_no,
        1 AS level_depth,
        ARRAY[bi.item_code::text] AS path
    FROM mrp_bom_item bi

    UNION ALL

    SELECT 
        bt.root_bom_no,
        child_bi.item_code,
        child_bi.item_name,
        (bt.required_qty * child_bi.qty)::NUMERIC(15,4) AS required_qty,
        child_bi.uom,
        child_bi.standard_rate::NUMERIC(15,4) AS standard_rate,
        (bt.required_qty * child_bi.qty * child_bi.standard_rate)::NUMERIC(15,4) AS amount,
        child_bi.sub_bom_no,
        bt.level_depth + 1,
        bt.path || child_bi.item_code::text
    FROM bom_tree bt
    JOIN mrp_bom_item child_bi ON bt.sub_bom_no = child_bi.bom_no
)
SELECT 
    root_bom_no,
    item_code,
    item_name,
    SUM(required_qty)::NUMERIC(15,4) AS total_exploded_qty,
    uom,
    standard_rate,
    SUM(amount)::NUMERIC(15,4) AS total_exploded_amount,
    level_depth,
    path
FROM bom_tree
GROUP BY root_bom_no, item_code, item_name, uom, standard_rate, level_depth, path;

-- -----------------------------------------------------------------------------
-- 10. POSTGRES ROW LEVEL SECURITY (RLS) POLICIES FOR MOCK RBAC
-- -----------------------------------------------------------------------------
ALTER TABLE mrp_production_plan ENABLE ROW LEVEL SECURITY;
ALTER TABLE mrp_work_order ENABLE ROW LEVEL SECURITY;
ALTER TABLE mrp_job_card ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'mrp_shop_floor_worker') THEN
        CREATE ROLE mrp_shop_floor_worker;
    END IF;
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'mrp_production_manager') THEN
        CREATE ROLE mrp_production_manager;
    END IF;
END $$;

CREATE POLICY p_manager_all_wo ON mrp_work_order FOR ALL TO mrp_production_manager USING (true);
CREATE POLICY p_manager_all_plan ON mrp_production_plan FOR ALL TO mrp_production_manager USING (true);

CREATE POLICY p_worker_read_wo ON mrp_work_order FOR SELECT TO mrp_shop_floor_worker USING (true);
CREATE POLICY p_worker_all_jc ON mrp_job_card FOR ALL TO mrp_shop_floor_worker USING (true);
