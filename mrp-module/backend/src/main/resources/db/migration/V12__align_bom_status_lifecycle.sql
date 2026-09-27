-- Align the application BOM lifecycle with the existing PostgreSQL status column.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_mrp_bom_status') THEN
        ALTER TABLE mrp_bom ADD CONSTRAINT ck_mrp_bom_status
            CHECK (status IN ('DRAFT', 'ACTIVE', 'INACTIVE', 'OBSOLETE'));
    END IF;
END $$;
