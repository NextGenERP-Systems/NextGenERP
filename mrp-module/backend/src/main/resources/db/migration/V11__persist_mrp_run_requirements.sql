-- Persist deterministic MRP calculation inputs and requirement snapshots.
CREATE TABLE IF NOT EXISTS mrp_run (
    run_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bom_no VARCHAR(100) NOT NULL REFERENCES mrp_bom(bom_no),
    planned_qty DECIMAL(15, 4) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'CALCULATED',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mrp_run_requirement (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    run_id UUID NOT NULL REFERENCES mrp_run(run_id) ON DELETE CASCADE,
    item_code VARCHAR(100) NOT NULL REFERENCES mrp_mock_item(item_code),
    required_qty DECIMAL(15, 4) NOT NULL,
    stock_qty DECIMAL(15, 4) NOT NULL DEFAULT 0.0000,
    shortage_qty DECIMAL(15, 4) NOT NULL DEFAULT 0.0000,
    recommended_action VARCHAR(50) NOT NULL
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_mrp_run_planned_qty_positive') THEN
        ALTER TABLE mrp_run ADD CONSTRAINT ck_mrp_run_planned_qty_positive CHECK (planned_qty > 0);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_mrp_run_status') THEN
        ALTER TABLE mrp_run ADD CONSTRAINT ck_mrp_run_status CHECK (status IN ('CALCULATED', 'REVIEWED', 'RELEASED', 'CANCELLED'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_mrp_run_requirement_required_positive') THEN
        ALTER TABLE mrp_run_requirement ADD CONSTRAINT ck_mrp_run_requirement_required_positive CHECK (required_qty > 0);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_mrp_run_requirement_stock_nonnegative') THEN
        ALTER TABLE mrp_run_requirement ADD CONSTRAINT ck_mrp_run_requirement_stock_nonnegative CHECK (stock_qty >= 0);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_mrp_run_requirement_shortage_nonnegative') THEN
        ALTER TABLE mrp_run_requirement ADD CONSTRAINT ck_mrp_run_requirement_shortage_nonnegative CHECK (shortage_qty >= 0);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_mrp_run_requirement_run ON mrp_run_requirement (run_id);
