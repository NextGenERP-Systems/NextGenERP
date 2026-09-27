ALTER TABLE mrp_production_plan ADD COLUMN IF NOT EXISTS source_mrp_run_id UUID;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_mrp_production_plan_source_run') THEN
        ALTER TABLE mrp_production_plan
            ADD CONSTRAINT fk_mrp_production_plan_source_run
            FOREIGN KEY (source_mrp_run_id) REFERENCES mrp_run(run_id);
    END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS uq_mrp_production_plan_source_run
    ON mrp_production_plan(source_mrp_run_id)
    WHERE source_mrp_run_id IS NOT NULL;
