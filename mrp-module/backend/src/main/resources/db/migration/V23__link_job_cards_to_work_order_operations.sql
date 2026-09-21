ALTER TABLE mrp_job_card ADD COLUMN IF NOT EXISTS work_order_operation_id UUID;

UPDATE mrp_job_card jc
SET work_order_operation_id = woop.id
FROM mrp_work_order_operation woop
WHERE jc.work_order_operation_id IS NULL
  AND jc.work_order_id = woop.work_order_id
  AND jc.operation_id = woop.operation_id;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_mrp_job_card_work_order_operation') THEN
        ALTER TABLE mrp_job_card
            ADD CONSTRAINT fk_mrp_job_card_work_order_operation
            FOREIGN KEY (work_order_operation_id) REFERENCES mrp_work_order_operation(id);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_mrp_job_card_work_order_operation
    ON mrp_job_card(work_order_operation_id);
