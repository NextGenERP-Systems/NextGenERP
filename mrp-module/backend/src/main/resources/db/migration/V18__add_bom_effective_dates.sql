ALTER TABLE mrp_bom ADD COLUMN IF NOT EXISTS effective_from DATE;
ALTER TABLE mrp_bom ADD COLUMN IF NOT EXISTS effective_to DATE;
ALTER TABLE mrp_bom DROP CONSTRAINT IF EXISTS ck_mrp_bom_effective_dates;
ALTER TABLE mrp_bom ADD CONSTRAINT ck_mrp_bom_effective_dates
    CHECK (effective_to IS NULL OR effective_from IS NULL OR effective_to >= effective_from);
