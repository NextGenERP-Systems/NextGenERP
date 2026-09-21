-- Enforce positive quantities at the database boundary. Review existing rows
-- and take a verified backup before applying this migration to the live DB.

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_mrp_bom_quantity_positive') THEN
        ALTER TABLE mrp_bom ADD CONSTRAINT ck_mrp_bom_quantity_positive CHECK (quantity > 0);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_mrp_bom_item_qty_positive') THEN
        ALTER TABLE mrp_bom_item ADD CONSTRAINT ck_mrp_bom_item_qty_positive CHECK (qty > 0);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_mrp_work_order_qty_positive') THEN
        ALTER TABLE mrp_work_order ADD CONSTRAINT ck_mrp_work_order_qty_positive CHECK (qty_to_produce > 0);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_mrp_work_order_item_required_qty_positive') THEN
        ALTER TABLE mrp_work_order_item ADD CONSTRAINT ck_mrp_work_order_item_required_qty_positive CHECK (required_qty > 0);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_mrp_mps_planned_qty_positive') THEN
        ALTER TABLE mrp_master_production_schedule ADD CONSTRAINT ck_mrp_mps_planned_qty_positive CHECK (planned_qty > 0);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_mrp_plan_item_qty_positive') THEN
        ALTER TABLE mrp_production_plan_item ADD CONSTRAINT ck_mrp_plan_item_qty_positive CHECK (planned_qty > 0);
    END IF;
END $$;
