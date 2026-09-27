# MRP Cloud Database Runbook

The MRP module uses one persistent PostgreSQL database: `nextgen_mrp`. Local Docker development reaches it through the IAP tunnel; the normal MRP Compose stack does not start PostgreSQL.

## One-time administrator prerequisites

Before the restricted `mrp_migration` role runs the first migration, connect as
the PostgreSQL administrator to `nextgen_mrp` and run:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'mrp_shop_floor_worker') THEN
        CREATE ROLE mrp_shop_floor_worker;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'mrp_production_manager') THEN
        CREATE ROLE mrp_production_manager;
    END IF;
END
$$;
```

These database-level operations are intentionally not performed by Flyway.

The application must use a separate restricted login. Create it as an
administrator, choosing the password privately:

```sql
CREATE ROLE mrp_app LOGIN PASSWORD 'choose-a-private-password';
GRANT CONNECT ON DATABASE nextgen_mrp TO mrp_app;
GRANT USAGE ON SCHEMA public TO mrp_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO mrp_app;
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO mrp_app;

ALTER DEFAULT PRIVILEGES FOR ROLE mrp_migration IN SCHEMA public
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO mrp_app;
ALTER DEFAULT PRIVILEGES FOR ROLE mrp_migration IN SCHEMA public
GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO mrp_app;
```

The local Docker backend uses `mrp_app`; `mrp_migration` is reserved for
Flyway migration jobs.

## Read-only preflight

From `mrp-module`:

```powershell
powershell -ExecutionPolicy Bypass -File .\verify-cloud-db.ps1
```

This only describes the configured VM. It must not be treated as proof that PostgreSQL is available. The VM, PostgreSQL container, database, port, credentials and backup status must be confirmed separately by the deployment operator.

## Local cloud-connected run

1. Confirm the VM and PostgreSQL service are intentionally online.
2. Start the tunnel in one terminal:

   ```powershell
   powershell -ExecutionPolicy Bypass -File .\connect-cloud-db.ps1
   ```

3. In another terminal, set the database credentials and start MRP:

   ```powershell
   $env:SPRING_DATASOURCE_USERNAME = "<application-role>"
   $env:SPRING_DATASOURCE_PASSWORD = "<application-password>"
   docker compose up -d --build
   ```

4. Verify the backend health and call `GET /api/v1/mrp/runtime/database`. It must report `databaseName: nextgen_mrp`; after Flyway is enabled, a release containing the current repository migrations must report migration version `29` or higher. Do not perform state-changing smoke tests until that identity is correct. Validation failures use HTTP 400 with `code: VALIDATION_ERROR`; invalid state commands use HTTP 409 with `code: INVALID_STATE`.

For the private UI/API, start `connect-private-app.ps1` in another terminal. MRP
Compose host ports bind only to `127.0.0.1`; do not add public firewall access.

## Migration gate

Flyway is present but disabled by default. Do not set `SPRING_FLYWAY_ENABLED=true` until all of these are complete:

- A schema-only dump and full backup of `nextgen_mrp` exist.
- The full backup has been restored and verified.
- The live schema has been compared with Flyway migrations and the JPA entities.
- The actual PostgreSQL version, extensions, roles and permissions are recorded.
- A baseline migration has been reviewed and tested against the restored copy.
- The migration role and restricted application role are available.

Never apply `seed-data.sql` to the persistent cloud database. It is only for the isolated test container.

## Production deployment order

The dedicated production definition is `docker-compose.production.yml`. It contains only
the MRP backend, MRP frontend and an explicit migration profile; it does not combine MRP
source code or services with another ERP module.

After backup and migration review, run this sequence manually on the VM:

```powershell
docker compose -f docker-compose.production.yml --profile migration run --rm mrp-migration
docker compose -f docker-compose.production.yml up -d mrp-backend mrp-frontend
docker compose -f docker-compose.production.yml ps
```

The guarded wrapper `deploy-mrp-production.ps1 -ConfirmProductionDeployment` performs
the same sequence after validating required variables and confirming the JDBC URL targets
`nextgen_mrp`. It then waits for the backend actuator health endpoint and frontend HTTP
response before reporting success. It is intentionally never run automatically by code changes.

The production file requires versioned `MRP_BACKEND_IMAGE` and `MRP_FRONTEND_IMAGE`
values, the single `nextgen_mrp` JDBC URL, separate migration credentials, and restricted
application credentials. Do not place those values in the repository.

1. Back up and verify the backup.
2. Run the reviewed migration using the migration credential. The repository provides `run-mrp-migration.ps1 -ConfirmProductionMigration`, which starts only the migration-only backend and exits after Flyway completes; it does not start the frontend or PostgreSQL. Set `SPRING_FLYWAY_BASELINE_ON_MIGRATE=true` only for the one-time reviewed baseline of an existing schema without Flyway history; use `false` after the baseline exists.
3. Validate migration version, required tables, constraints and row counts.
4. Deploy the versioned MRP images manually through the VM Compose workflow.
5. Verify a representative Work Order state history through `GET /api/v1/mrp/state-audit/WORK_ORDER/{workOrderId}`.
6. Run smoke tests and record the release result.
