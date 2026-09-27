CREATE UNIQUE INDEX IF NOT EXISTS uq_mrp_run_requirement_item
    ON mrp_run_requirement(run_id, item_code);
