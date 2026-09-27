-- Supports idempotent MPS-to-production-plan conversion lookups.
-- Review existing indexes and take a verified backup before applying live.

CREATE INDEX IF NOT EXISTS idx_mrp_plan_item_sales_order_ref
    ON mrp_production_plan_item (sales_order_ref);
