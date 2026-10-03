-- Disposable test-database prerequisites. The schema itself is owned by Flyway V1.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'mrp_app') THEN
    CREATE ROLE mrp_app;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'mrp_readonly') THEN
    CREATE ROLE mrp_readonly;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'mrp_shop_floor_worker') THEN
    CREATE ROLE mrp_shop_floor_worker;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'mrp_production_manager') THEN
    CREATE ROLE mrp_production_manager;
  END IF;
END $$;
