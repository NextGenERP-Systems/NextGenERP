# MRP database migrations

Migrations are intentionally disabled by default through `SPRING_FLYWAY_ENABLED=false`.

Before enabling Flyway against the persistent `nextgen_mrp` database:

1. Confirm the live database and PostgreSQL version.
2. Take and verify a backup.
3. Install the `uuid-ossp` extension as an administrator.
4. Create the `mrp_shop_floor_worker` and `mrp_production_manager` roles as an administrator.
5. Compare the live schema with the repository schema and JPA mappings.
6. Baseline the existing schema explicitly when it is not empty and has no Flyway history.
7. Enable Flyway for the migration operation.
8. Validate the migration history and critical table counts.

The migration role deliberately does not install extensions or create roles.
Those database-level operations remain administrator-only prerequisites.

Do not place seed data or destructive reset statements in this directory. Sandbox data belongs in the isolated test Compose profile.
