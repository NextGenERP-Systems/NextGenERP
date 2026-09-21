-- Keep production-plan lifecycle values bounded at the database layer.
-- Verify existing values before applying this migration to a persistent database.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'ck_mrp_production_plan_status'
    ) THEN
        ALTER TABLE mrp_production_plan ADD CONSTRAINT ck_mrp_production_plan_status
            CHECK (status IN ('DRAFT', 'SUBMITTED', 'COMPLETED', 'CANCELLED'));
    END IF;
END $$;
