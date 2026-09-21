# ==============================================================================
# NextGen ERP - Initialize Remote MRP Database on Sales VM via SSH / SCP
# ==============================================================================

throw @"
This legacy remote-initialization script is permanently disabled.

It is unsafe for the single persistent nextgen_mrp database because it applies
the full baseline schema and seed data directly to the cloud database.

Use CLOUD_DATABASE_RUNBOOK.md instead:
  1. Verify the VM and database read-only.
  2. Take and verify a backup.
  3. Run the versioned Flyway migration job.
  4. Validate the migration and deploy the application manually.

Never apply database/init-schema.sql or database/seed-data.sql to production.
"@
