-- Keep work-order lifecycle values bounded at the database layer.
-- Verify existing values before applying this migration to a persistent database.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'ck_mrp_work_order_status'
    ) THEN
        ALTER TABLE mrp_work_order ADD CONSTRAINT ck_mrp_work_order_status
            CHECK (status IN ('DRAFT', 'NOT_STARTED', 'SUBMITTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'));
    END IF;
END $$;
