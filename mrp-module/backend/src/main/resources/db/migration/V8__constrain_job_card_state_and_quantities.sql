-- Bound Job Card lifecycle and quantity invariants at the database layer.
-- Verify existing values before applying this migration to a persistent database.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_mrp_job_card_status') THEN
        ALTER TABLE mrp_job_card ADD CONSTRAINT ck_mrp_job_card_status
            CHECK (status IN ('OPEN', 'WORK_IN_PROGRESS', 'COMPLETED', 'CANCELLED'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_mrp_job_card_for_qty_positive') THEN
        ALTER TABLE mrp_job_card ADD CONSTRAINT ck_mrp_job_card_for_qty_positive CHECK (for_quantity > 0);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_mrp_job_card_completed_qty_nonnegative') THEN
        ALTER TABLE mrp_job_card ADD CONSTRAINT ck_mrp_job_card_completed_qty_nonnegative CHECK (completed_quantity >= 0);
    END IF;
END $$;
