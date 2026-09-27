-- Derive and bound quality inspection lifecycle values.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_mrp_quality_inspected_qty_positive') THEN
        ALTER TABLE mrp_quality_inspection ADD CONSTRAINT ck_mrp_quality_inspected_qty_positive CHECK (inspected_qty > 0);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_mrp_quality_status') THEN
        ALTER TABLE mrp_quality_inspection ADD CONSTRAINT ck_mrp_quality_status CHECK (status IN ('PENDING', 'PASSED', 'FAILED'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_mrp_quality_reading_status') THEN
        ALTER TABLE mrp_quality_inspection_reading ADD CONSTRAINT ck_mrp_quality_reading_status CHECK (status IN ('PENDING', 'PASSED', 'FAILED'));
    END IF;
END $$;
