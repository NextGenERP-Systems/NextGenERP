DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_mrp_work_order_operation_sequence_positive') THEN
        ALTER TABLE mrp_work_order_operation ADD CONSTRAINT ck_mrp_work_order_operation_sequence_positive
            CHECK (sequence_no > 0);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_mrp_work_order_operation_status') THEN
        ALTER TABLE mrp_work_order_operation ADD CONSTRAINT ck_mrp_work_order_operation_status
            CHECK (status IN ('OPEN', 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_mrp_job_card_time_log_values') THEN
        ALTER TABLE mrp_job_card_time_log ADD CONSTRAINT ck_mrp_job_card_time_log_values
            CHECK (time_in_mins >= 0 AND completed_qty >= 0);
    END IF;
END $$;
