DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_mrp_plan_item_produced_qty_valid') THEN
        ALTER TABLE mrp_production_plan_item ADD CONSTRAINT ck_mrp_plan_item_produced_qty_valid
            CHECK (produced_qty >= 0 AND produced_qty <= planned_qty);
    END IF;
END $$;
