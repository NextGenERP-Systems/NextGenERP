-- One-time adoption for installations that applied CRM V2/V3 with the default
-- Flyway table. Back up and verify the database first. Run manually as the owner.
-- This creates only a CRM table and leaves the original history unchanged.
BEGIN;
DO $$
BEGIN
    IF to_regclass('public.crm_flyway_schema_history') IS NOT NULL THEN
        RAISE EXCEPTION 'CRM history already exists; inspect it instead of adopting again';
    END IF;
    IF to_regclass('public.flyway_schema_history') IS NULL THEN
        RAISE EXCEPTION 'No legacy history exists; use normal CRM startup for a fresh install';
    END IF;
    IF (SELECT count(*) FROM public.flyway_schema_history
        WHERE success AND ((version = '2' AND script = 'V2__init_crm_master_data.sql')
            OR (version = '3' AND script = 'V3__crm_phase2_tables.sql'))) <> 2 THEN
        RAISE EXCEPTION 'Legacy history must contain successful CRM V2 and V3 entries';
    END IF;
    IF to_regclass('public.crm_leads') IS NULL OR to_regclass('public.crm_prospects') IS NULL
        OR to_regclass('public.crm_opportunities') IS NULL THEN
        RAISE EXCEPTION 'CRM lifecycle tables are missing; reconcile the schema first';
    END IF;
END $$;
CREATE TABLE public.crm_flyway_schema_history
    (LIKE public.flyway_schema_history INCLUDING ALL);
INSERT INTO public.crm_flyway_schema_history
    SELECT * FROM public.flyway_schema_history
    WHERE success AND ((version = '2' AND script = 'V2__init_crm_master_data.sql')
        OR (version = '3' AND script = 'V3__crm_phase2_tables.sql'));
COMMIT;
