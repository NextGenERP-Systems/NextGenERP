-- =============================================================================
-- NextGen ERP - Production & Manufacturing (MRP) Module Schema
-- Relational Engine: PostgreSQL 15+
-- Features: Parent-Child WOs, Real-time Consumption, Postgres Recursive CTEs, RLS
-- =============================================================================

-- uuid-ossp is a database prerequisite and must be installed once by the
-- PostgreSQL administrator. Migrations intentionally do not install extensions
-- because the migration role is not granted database-level CREATE privileges.

-- ENUMS mapped as standard VARCHAR(50) for JDBC / JPA compatibility

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
    revision_number INT NOT NULL DEFAULT 1,
    effective_from DATE,
    effective_to DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    routing_id VARCHAR(100) REFERENCES mrp_routing(routing_id),
    raw_material_cost DECIMAL(15, 4) NOT NULL DEFAULT 0.0000,
    operating_cost DECIMAL(15, 4) NOT NULL DEFAULT 0.0000,
    scrap_cost DECIMAL(15, 4) NOT NULL DEFAULT 0.0000,
    total_cost DECIMAL(15, 4) NOT NULL DEFAULT 0.0000,
    created_by VARCHAR(100) DEFAULT 'system',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE mrp_bom ADD CONSTRAINT ck_mrp_bom_quantity_positive CHECK (quantity > 0);
ALTER TABLE mrp_bom ADD CONSTRAINT ck_mrp_bom_status CHECK (status IN ('DRAFT', 'ACTIVE', 'INACTIVE', 'OBSOLETE'));
ALTER TABLE mrp_bom ADD CONSTRAINT ck_mrp_bom_effective_dates CHECK (effective_to IS NULL OR effective_from IS NULL OR effective_to >= effective_from);
CREATE UNIQUE INDEX uq_mrp_bom_item_revision ON mrp_bom(item_code, revision_number);

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
ALTER TABLE mrp_bom_item ADD CONSTRAINT ck_mrp_bom_item_qty_positive CHECK (qty > 0);

CREATE TABLE mrp_bom_secondary_item (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bom_no VARCHAR(100) NOT NULL REFERENCES mrp_bom(bom_no) ON DELETE CASCADE,
    item_code VARCHAR(100) NOT NULL REFERENCES mrp_mock_item(item_code),
    item_name VARCHAR(255) NOT NULL,
    qty DECIMAL(15, 4) NOT NULL,
    uom VARCHAR(20) NOT NULL DEFAULT 'Nos',
    valuation_rate DECIMAL(15, 4) NOT NULL DEFAULT 0.0000
);

CREATE TABLE mrp_item_alternative (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_code VARCHAR(100) NOT NULL REFERENCES mrp_mock_item(item_code),
    alternative_item_code VARCHAR(100) NOT NULL REFERENCES mrp_mock_item(item_code),
    two_way BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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
    production_plan_id VARCHAR(100),
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
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    planned_operating_cost DECIMAL(15, 4) DEFAULT 0.0000,
    actual_operating_cost DECIMAL(15, 4) DEFAULT 0.0000,
    planned_material_cost DECIMAL(15, 4) DEFAULT 0.0000,
    actual_material_cost DECIMAL(15, 4) DEFAULT 0.0000,
    version INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE mrp_work_order ADD CONSTRAINT ck_mrp_work_order_qty_positive CHECK (qty_to_produce > 0);
ALTER TABLE mrp_work_order ADD CONSTRAINT ck_mrp_work_order_status
    CHECK (status IN ('DRAFT', 'NOT_STARTED', 'SUBMITTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'));
CREATE INDEX idx_mrp_work_order_production_plan ON mrp_work_order(production_plan_id);
ALTER TABLE mrp_work_order ADD CONSTRAINT ck_mrp_work_order_produced_qty_valid
    CHECK (produced_qty >= 0 AND produced_qty <= qty_to_produce);
ALTER TABLE mrp_work_order ADD CONSTRAINT ck_mrp_work_order_dates_valid
    CHECK (planned_end_date >= planned_start_date
        AND (actual_start_date IS NULL OR actual_end_date IS NULL OR actual_end_date >= actual_start_date));
ALTER TABLE mrp_work_order ADD CONSTRAINT ck_mrp_work_order_costs_nonnegative
    CHECK (planned_operating_cost >= 0 AND actual_operating_cost >= 0
        AND planned_material_cost >= 0 AND actual_material_cost >= 0);

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
ALTER TABLE mrp_work_order_item ADD CONSTRAINT ck_mrp_work_order_item_required_qty_positive CHECK (required_qty > 0);

CREATE TABLE mrp_inventory_movement (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_code VARCHAR(100) NOT NULL REFERENCES mrp_mock_item(item_code),
    warehouse_id VARCHAR(100) REFERENCES mrp_mock_warehouse(warehouse_id),
    quantity DECIMAL(15, 4) NOT NULL,
    movement_type VARCHAR(50) NOT NULL,
    work_order_id VARCHAR(100) REFERENCES mrp_work_order(work_order_id),
    source_reference VARCHAR(150) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE mrp_inventory_movement ADD CONSTRAINT ck_mrp_inventory_movement_quantity_positive CHECK (quantity > 0);
ALTER TABLE mrp_inventory_movement ADD CONSTRAINT ck_mrp_inventory_movement_type
    CHECK (movement_type IN ('RESERVATION', 'ISSUE_TO_WIP', 'CONSUMPTION', 'REVERSAL', 'SCRAP', 'RECEIPT', 'FINISHED_GOODS', 'TRANSFER'));

CREATE TABLE mrp_state_transition_audit (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(80) NOT NULL,
    entity_id VARCHAR(120) NOT NULL,
    from_status VARCHAR(50),
    to_status VARCHAR(50) NOT NULL,
    action VARCHAR(80) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_mrp_state_audit_entity ON mrp_state_transition_audit(entity_type, entity_id, created_at);

CREATE TABLE mrp_work_order_operation (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    work_order_id VARCHAR(100) NOT NULL REFERENCES mrp_work_order(work_order_id) ON DELETE CASCADE,
    sequence_no INT NOT NULL,
    operation_id VARCHAR(100) NOT NULL REFERENCES mrp_operation(operation_id),
    workstation_id VARCHAR(100) NOT NULL REFERENCES mrp_workstation(workstation_id),
    time_in_mins DECIMAL(10, 2) NOT NULL,
    completed_qty DECIMAL(15, 4) NOT NULL DEFAULT 0.0000,
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN'
);
ALTER TABLE mrp_work_order_operation ADD CONSTRAINT ck_mrp_work_order_operation_time_nonnegative
    CHECK (time_in_mins >= 0 AND completed_qty >= 0);
ALTER TABLE mrp_work_order_operation ADD CONSTRAINT ck_mrp_work_order_operation_sequence_positive
    CHECK (sequence_no > 0);
ALTER TABLE mrp_work_order_operation ADD CONSTRAINT ck_mrp_work_order_operation_status
    CHECK (status IN ('OPEN', 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'));

-- -----------------------------------------------------------------------------
-- 5. JOB CARDS & REAL-TIME TIME LOGS
-- -----------------------------------------------------------------------------
CREATE TABLE mrp_job_card (
    job_card_id VARCHAR(100) PRIMARY KEY,
    work_order_id VARCHAR(100) NOT NULL REFERENCES mrp_work_order(work_order_id) ON DELETE CASCADE,
    operation_id VARCHAR(100) NOT NULL REFERENCES mrp_operation(operation_id),
    work_order_operation_id UUID REFERENCES mrp_work_order_operation(id),
    workstation_id VARCHAR(100) NOT NULL REFERENCES mrp_workstation(workstation_id),
    for_quantity DECIMAL(15, 4) NOT NULL,
    completed_quantity DECIMAL(15, 4) NOT NULL DEFAULT 0.0000,
    transferred_qty DECIMAL(15, 4) NOT NULL DEFAULT 0.0000,
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN',
    assigned_employee_id VARCHAR(100) REFERENCES mrp_mock_employee(employee_id),
    scheduled_start_time TIMESTAMP WITH TIME ZONE,
    scheduled_end_time TIMESTAMP WITH TIME ZONE,
    total_time_in_mins DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    scrap_quantity DECIMAL(15, 4) DEFAULT 0.0000,
    scrap_reason VARCHAR(255),
    version INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_mrp_job_card_work_order_operation ON mrp_job_card(work_order_operation_id);

CREATE TABLE mrp_job_card_time_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_card_id VARCHAR(100) NOT NULL REFERENCES mrp_job_card(job_card_id) ON DELETE CASCADE,
    employee_id VARCHAR(100) REFERENCES mrp_mock_employee(employee_id),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    time_in_mins DECIMAL(10, 2) DEFAULT 0.00,
    completed_qty DECIMAL(15, 4) DEFAULT 0.00
);
CREATE UNIQUE INDEX uq_mrp_job_card_active_time_log
    ON mrp_job_card_time_log(job_card_id)
    WHERE end_time IS NULL;
ALTER TABLE mrp_job_card_time_log ADD CONSTRAINT ck_mrp_job_card_time_log_values
    CHECK (time_in_mins >= 0 AND completed_qty >= 0);
ALTER TABLE mrp_job_card ADD CONSTRAINT ck_mrp_job_card_status
    CHECK (status IN ('OPEN', 'WORK_IN_PROGRESS', 'COMPLETED', 'CANCELLED'));
ALTER TABLE mrp_job_card ADD CONSTRAINT ck_mrp_job_card_for_qty_positive CHECK (for_quantity > 0);
ALTER TABLE mrp_job_card ADD CONSTRAINT ck_mrp_job_card_completed_qty_nonnegative CHECK (completed_quantity >= 0);
ALTER TABLE mrp_job_card ADD CONSTRAINT ck_mrp_job_card_completed_qty_valid
    CHECK (completed_quantity <= for_quantity);
ALTER TABLE mrp_job_card ADD CONSTRAINT ck_mrp_job_card_scrap_qty_nonnegative CHECK (scrap_quantity >= 0);

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
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    remarks TEXT,
    inspection_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE mrp_quality_inspection_reading (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inspection_id VARCHAR(100) NOT NULL REFERENCES mrp_quality_inspection(inspection_id) ON DELETE CASCADE,
    parameter_name VARCHAR(255) NOT NULL,
    reading_value DECIMAL(15, 4) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PASSED'
);
ALTER TABLE mrp_quality_inspection ADD CONSTRAINT ck_mrp_quality_inspected_qty_positive CHECK (inspected_qty > 0);
ALTER TABLE mrp_quality_inspection ADD CONSTRAINT ck_mrp_quality_status CHECK (status IN ('PENDING', 'PASSED', 'FAILED'));
ALTER TABLE mrp_quality_inspection_reading ADD CONSTRAINT ck_mrp_quality_reading_status CHECK (status IN ('PENDING', 'PASSED', 'FAILED'));

-- -----------------------------------------------------------------------------
-- 7. MATERIAL REQUIREMENT PLANNING (MRP), MPS & DEMAND FORECASTING
-- -----------------------------------------------------------------------------
CREATE TABLE mrp_sales_forecast (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    forecast_id VARCHAR(100) NOT NULL UNIQUE,
    item_code VARCHAR(100) NOT NULL REFERENCES mrp_mock_item(item_code),
    period_start_date DATE NOT NULL,
    period_end_date DATE NOT NULL,
    forecast_qty DECIMAL(15, 4) NOT NULL,
    confidence_score DECIMAL(5, 2) DEFAULT 100.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE mrp_run (
    run_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bom_no VARCHAR(100) NOT NULL REFERENCES mrp_bom(bom_no),
    planned_qty DECIMAL(15, 4) NOT NULL,
    planning_date DATE NOT NULL DEFAULT CURRENT_DATE,
    calculation_cutoff_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'CALCULATED',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE mrp_run ADD CONSTRAINT ck_mrp_run_planned_qty_positive CHECK (planned_qty > 0);
ALTER TABLE mrp_run ADD CONSTRAINT ck_mrp_run_status CHECK (status IN ('CALCULATED', 'REVIEWED', 'RELEASED', 'CANCELLED'));

CREATE TABLE mrp_run_requirement (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    run_id UUID NOT NULL REFERENCES mrp_run(run_id) ON DELETE CASCADE,
    item_code VARCHAR(100) NOT NULL REFERENCES mrp_mock_item(item_code),
    required_qty DECIMAL(15, 4) NOT NULL,
    stock_qty DECIMAL(15, 4) NOT NULL DEFAULT 0.0000,
    shortage_qty DECIMAL(15, 4) NOT NULL DEFAULT 0.0000,
    recommended_action VARCHAR(50) NOT NULL
);
ALTER TABLE mrp_run_requirement ADD CONSTRAINT ck_mrp_run_requirement_required_positive CHECK (required_qty > 0);
ALTER TABLE mrp_run_requirement ADD CONSTRAINT ck_mrp_run_requirement_stock_nonnegative CHECK (stock_qty >= 0);
ALTER TABLE mrp_run_requirement ADD CONSTRAINT ck_mrp_run_requirement_shortage_nonnegative CHECK (shortage_qty >= 0);
CREATE INDEX IF NOT EXISTS idx_mrp_run_requirement_run ON mrp_run_requirement (run_id);
CREATE UNIQUE INDEX uq_mrp_run_requirement_item ON mrp_run_requirement (run_id, item_code);

CREATE TABLE mrp_master_production_schedule (
    mps_id VARCHAR(100) PRIMARY KEY,
    item_code VARCHAR(100) NOT NULL REFERENCES mrp_mock_item(item_code),
    bom_no VARCHAR(100) NOT NULL REFERENCES mrp_bom(bom_no),
    schedule_date DATE NOT NULL,
    planned_qty DECIMAL(15, 4) NOT NULL,
    source_type VARCHAR(50) NOT NULL DEFAULT 'FORECAST',
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE mrp_master_production_schedule ADD CONSTRAINT ck_mrp_mps_planned_qty_positive CHECK (planned_qty > 0);
ALTER TABLE mrp_master_production_schedule ADD CONSTRAINT ck_mrp_mps_source_type CHECK (source_type IN ('FORECAST', 'SALES_ORDER', 'MANUAL'));
ALTER TABLE mrp_master_production_schedule ADD CONSTRAINT ck_mrp_mps_status CHECK (status IN ('DRAFT', 'SUBMITTED', 'COMPLETED', 'CANCELLED'));

CREATE TABLE mrp_production_plan (
    plan_id VARCHAR(100) PRIMARY KEY,
    source_mrp_run_id UUID REFERENCES mrp_run(run_id),
    posting_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    created_by VARCHAR(100) DEFAULT 'planner',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE mrp_production_plan ADD CONSTRAINT ck_mrp_production_plan_status
    CHECK (status IN ('DRAFT', 'SUBMITTED', 'COMPLETED', 'CANCELLED'));
CREATE UNIQUE INDEX uq_mrp_production_plan_source_run
    ON mrp_production_plan(source_mrp_run_id) WHERE source_mrp_run_id IS NOT NULL;
ALTER TABLE mrp_work_order
    ADD CONSTRAINT fk_mrp_work_order_production_plan
    FOREIGN KEY (production_plan_id) REFERENCES mrp_production_plan(plan_id);

CREATE TABLE mrp_production_plan_item (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id VARCHAR(100) NOT NULL REFERENCES mrp_production_plan(plan_id) ON DELETE CASCADE,
    item_code VARCHAR(100) NOT NULL REFERENCES mrp_mock_item(item_code),
    bom_no VARCHAR(100) NOT NULL REFERENCES mrp_bom(bom_no),
    planned_qty DECIMAL(15, 4) NOT NULL,
    produced_qty DECIMAL(15, 4) NOT NULL DEFAULT 0.0000,
    sales_order_ref VARCHAR(100)
);
CREATE INDEX IF NOT EXISTS idx_mrp_plan_item_sales_order_ref ON mrp_production_plan_item (sales_order_ref);
ALTER TABLE mrp_production_plan_item ADD CONSTRAINT ck_mrp_plan_item_qty_positive CHECK (planned_qty > 0);
ALTER TABLE mrp_production_plan_item ADD CONSTRAINT ck_mrp_plan_item_produced_qty_valid
    CHECK (produced_qty >= 0 AND produced_qty <= planned_qty);

-- -----------------------------------------------------------------------------
-- 8. SUBCONTRACTING ORDERS
-- -----------------------------------------------------------------------------
CREATE TABLE mrp_subcontract_order (
    subcontract_id VARCHAR(100) PRIMARY KEY,
    work_order_id VARCHAR(100) NOT NULL REFERENCES mrp_work_order(work_order_id) ON DELETE CASCADE,
    supplier_id VARCHAR(100) NOT NULL,
    item_code VARCHAR(100) NOT NULL REFERENCES mrp_mock_item(item_code),
    qty DECIMAL(15, 4) NOT NULL,
    service_cost DECIMAL(15, 4) NOT NULL DEFAULT 0.0000,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    warehouse_from VARCHAR(100) DEFAULT 'WH-STORES',
    warehouse_to VARCHAR(100) DEFAULT 'WH-SUBCONTRACTOR',
    materials_dispatched BOOLEAN DEFAULT FALSE,
    dispatch_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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
    category VARCHAR(50) NOT NULL,
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
        (bi.qty / NULLIF(parent_bom.quantity, 0))::NUMERIC(15,4) AS required_qty,
        bi.uom,
        bi.standard_rate::NUMERIC(15,4) AS standard_rate,
        bi.amount::NUMERIC(15,4) AS amount,
        bi.sub_bom_no,
        1 AS level_depth,
        ARRAY[bi.item_code::text] AS path
    FROM mrp_bom_item bi
    JOIN mrp_bom parent_bom ON parent_bom.bom_no = bi.bom_no
        AND parent_bom.is_active = TRUE AND parent_bom.status = 'ACTIVE'

    UNION ALL

    SELECT 
        bt.root_bom_no,
        child_bi.item_code,
        child_bi.item_name,
        (bt.required_qty * child_bi.qty / NULLIF(child_bom.quantity, 0))::NUMERIC(15,4) AS required_qty,
        child_bi.uom,
        child_bi.standard_rate::NUMERIC(15,4) AS standard_rate,
        (bt.required_qty * child_bi.qty / NULLIF(child_bom.quantity, 0) * child_bi.standard_rate)::NUMERIC(15,4) AS amount,
        child_bi.sub_bom_no,
        bt.level_depth + 1,
        bt.path || child_bi.item_code::text
    FROM bom_tree bt
    JOIN mrp_bom_item child_bi ON bt.sub_bom_no = child_bi.bom_no
    JOIN mrp_bom child_bom ON child_bom.bom_no = child_bi.bom_no
        AND child_bom.is_active = TRUE AND child_bom.status = 'ACTIVE'
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

CREATE POLICY p_manager_all_wo ON mrp_work_order FOR ALL TO mrp_production_manager USING (true);
CREATE POLICY p_manager_all_plan ON mrp_production_plan FOR ALL TO mrp_production_manager USING (true);

CREATE POLICY p_worker_read_wo ON mrp_work_order FOR SELECT TO mrp_shop_floor_worker USING (true);
CREATE POLICY p_worker_all_jc ON mrp_job_card FOR ALL TO mrp_shop_floor_worker USING (true);

CREATE OR REPLACE FUNCTION explode_mrp_bom(p_bom_no VARCHAR, p_planning_date DATE)
RETURNS TABLE (root_bom_no VARCHAR, item_code VARCHAR, item_name VARCHAR,
    total_exploded_qty NUMERIC, uom VARCHAR, standard_rate NUMERIC,
    total_exploded_amount NUMERIC, level_depth INTEGER, path TEXT[])
LANGUAGE sql AS $$
WITH RECURSIVE bom_tree AS (
    SELECT bi.bom_no AS root_bom_no, bi.item_code, bi.item_name,
        (bi.qty / NULLIF(parent_bom.quantity, 0))::NUMERIC(15,4) AS required_qty,
        bi.uom, bi.standard_rate::NUMERIC(15,4) AS standard_rate,
        (bi.qty / NULLIF(parent_bom.quantity, 0) * bi.standard_rate)::NUMERIC(15,4) AS amount,
        bi.sub_bom_no, 1 AS level_depth, ARRAY[bi.item_code::text] AS path
    FROM mrp_bom_item bi JOIN mrp_bom parent_bom ON parent_bom.bom_no = bi.bom_no
        AND parent_bom.bom_no = p_bom_no AND parent_bom.is_active = TRUE AND parent_bom.status = 'ACTIVE'
        AND (parent_bom.effective_from IS NULL OR parent_bom.effective_from <= p_planning_date)
        AND (parent_bom.effective_to IS NULL OR parent_bom.effective_to >= p_planning_date)
    UNION ALL
    SELECT bt.root_bom_no, child_bi.item_code, child_bi.item_name,
        (bt.required_qty * child_bi.qty / NULLIF(child_bom.quantity, 0))::NUMERIC(15,4),
        child_bi.uom, child_bi.standard_rate::NUMERIC(15,4),
        (bt.required_qty * child_bi.qty / NULLIF(child_bom.quantity, 0) * child_bi.standard_rate)::NUMERIC(15,4),
        child_bi.sub_bom_no, bt.level_depth + 1, bt.path || child_bi.item_code::text
    FROM bom_tree bt JOIN mrp_bom_item child_bi ON bt.sub_bom_no = child_bi.bom_no
    JOIN mrp_bom child_bom ON child_bom.bom_no = child_bi.bom_no
        AND child_bom.is_active = TRUE AND child_bom.status = 'ACTIVE'
        AND (child_bom.effective_from IS NULL OR child_bom.effective_from <= p_planning_date)
        AND (child_bom.effective_to IS NULL OR child_bom.effective_to >= p_planning_date)
)
SELECT root_bom_no, item_code, item_name, SUM(required_qty)::NUMERIC(15,4), uom,
    standard_rate, SUM(amount)::NUMERIC(15,4), level_depth, path
FROM bom_tree GROUP BY root_bom_no, item_code, item_name, uom, standard_rate, level_depth, path;
$$;
