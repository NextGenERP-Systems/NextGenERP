CREATE UNIQUE INDEX IF NOT EXISTS uq_mrp_job_card_active_time_log
    ON mrp_job_card_time_log(job_card_id)
    WHERE end_time IS NULL;
