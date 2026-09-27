ALTER TABLE mrp_work_order ADD COLUMN IF NOT EXISTS production_plan_id VARCHAR(100);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_mrp_work_order_production_plan') THEN
        ALTER TABLE mrp_work_order
            ADD CONSTRAINT fk_mrp_work_order_production_plan
            FOREIGN KEY (production_plan_id) REFERENCES mrp_production_plan(plan_id);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_mrp_work_order_production_plan
    ON mrp_work_order(production_plan_id);
