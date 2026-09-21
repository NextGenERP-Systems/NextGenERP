ALTER TABLE mrp_run ADD COLUMN IF NOT EXISTS calculation_cutoff_at TIMESTAMP WITH TIME ZONE;
UPDATE mrp_run SET calculation_cutoff_at = created_at WHERE calculation_cutoff_at IS NULL;
ALTER TABLE mrp_run ALTER COLUMN calculation_cutoff_at SET NOT NULL;
