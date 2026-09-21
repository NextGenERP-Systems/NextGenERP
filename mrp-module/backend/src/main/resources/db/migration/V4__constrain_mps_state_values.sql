-- Review existing values and take a verified backup before applying to the live DB.
-- This migration is intentionally not enabled by default.

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_mrp_mps_source_type') THEN
        ALTER TABLE mrp_master_production_schedule
            ADD CONSTRAINT ck_mrp_mps_source_type
            CHECK (source_type IN ('FORECAST', 'SALES_ORDER', 'MANUAL'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_mrp_mps_status') THEN
        ALTER TABLE mrp_master_production_schedule
            ADD CONSTRAINT ck_mrp_mps_status
            CHECK (status IN ('DRAFT', 'SUBMITTED', 'COMPLETED', 'CANCELLED'));
    END IF;
END $$;
