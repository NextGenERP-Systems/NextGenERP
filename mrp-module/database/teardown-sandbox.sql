-- =============================================================================
-- NextGen ERP - Production & Manufacturing (MRP) Sandbox Teardown Script
-- Safely truncates and cleans up all MRP transactional and mock testing data
-- =============================================================================

BEGIN;

-- Disable triggers temporarily for fast truncate
SET CONSTRAINTS ALL DEFERRED;

TRUNCATE TABLE 
    mrp_job_card_time_log,
    mrp_job_card,
    mrp_work_order_operation,
    mrp_work_order_item,
    mrp_work_order,
    mrp_scrap_item,
    mrp_quality_inspection_reading,
    mrp_quality_inspection,
    mrp_production_plan_item,
    mrp_production_plan,
    mrp_downtime_entry,
    mrp_mock_stock_ledger
CASCADE;

-- Optional: Reset default sequences if any
-- RESTART WITH 1 for specific IDs if needed

COMMIT;

-- Output confirmation
SELECT 'NextGen ERP MRP Sandbox environment successfully reset and truncated!' AS status;
