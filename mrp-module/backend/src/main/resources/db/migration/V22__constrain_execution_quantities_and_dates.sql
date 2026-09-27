DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_mrp_work_order_produced_qty_valid') THEN
        ALTER TABLE mrp_work_order ADD CONSTRAINT ck_mrp_work_order_produced_qty_valid
            CHECK (produced_qty >= 0 AND produced_qty <= qty_to_produce);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_mrp_work_order_dates_valid') THEN
        ALTER TABLE mrp_work_order ADD CONSTRAINT ck_mrp_work_order_dates_valid
            CHECK (planned_end_date >= planned_start_date
                AND (actual_start_date IS NULL OR actual_end_date IS NULL OR actual_end_date >= actual_start_date));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_mrp_work_order_costs_nonnegative') THEN
        ALTER TABLE mrp_work_order ADD CONSTRAINT ck_mrp_work_order_costs_nonnegative
            CHECK (planned_operating_cost >= 0 AND actual_operating_cost >= 0
                AND planned_material_cost >= 0 AND actual_material_cost >= 0);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_mrp_job_card_completed_qty_valid') THEN
        ALTER TABLE mrp_job_card ADD CONSTRAINT ck_mrp_job_card_completed_qty_valid
            CHECK (completed_quantity >= 0 AND completed_quantity <= for_quantity);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_mrp_job_card_scrap_qty_nonnegative') THEN
        ALTER TABLE mrp_job_card ADD CONSTRAINT ck_mrp_job_card_scrap_qty_nonnegative
            CHECK (scrap_quantity >= 0);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_mrp_work_order_operation_time_nonnegative') THEN
        ALTER TABLE mrp_work_order_operation ADD CONSTRAINT ck_mrp_work_order_operation_time_nonnegative
            CHECK (time_in_mins >= 0 AND completed_qty >= 0);
    END IF;
END $$;
