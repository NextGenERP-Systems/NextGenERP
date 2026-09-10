# NextGen ERP - Workflow Database Guide & Persistence Best Practices

## 1. Architecture & Persistence Overview

Your Workflow Module database (`workflow_db`) is hosted inside a PostgreSQL container on your Google Cloud Compute Engine VM (`nextgen-erp-core-vm`).

- **Data Persistence**: Data files are stored on a persistent disk attached to your GCE VM.
- **Container Lifecycle**: Running `docker compose down` or restarting services locally does **NOT** delete or clear your cloud database.
- **Data Safety**: Your database content is permanently stored in cloud persistent storage until explicitly dropped.

---

## 2. Connecting to Database via pgAdmin 4

To visually inspect tables, run custom SQL queries, or export/import data using pgAdmin 4:

### Step 1: Start the Secure Tunnel (IAP Tunnel)
Before opening pgAdmin 4, ensure the secure IAP tunnel script is running on your machine:

```powershell
powershell -ExecutionPolicy Bypass -File .\connect-cloud-db.ps1
```
*(Keep this terminal window open while using pgAdmin 4).*

### Step 2: Register Server in pgAdmin 4
1. Open **pgAdmin 4**.
2. In the left panel, right-click **Servers** > **Register** > **Server...**
3. **General Tab**:
   - Name: `NextGen Cloud DB`
4. **Connection Tab**:
   - **Host name/address**: `localhost`
   - **Port**: `5432`
   - **Maintenance database**: `workflow_db`
   - **Username**: `postgres`
   - **Password**: `postgres`
5. Click **Save**.

Now you can expand **Servers > NextGen Cloud DB > Databases > workflow_db > Schemas > public > Tables** to view and edit all your tables!

---

## 3. Creating Backups & Restores

### Option A: Via pgAdmin 4 (GUI)
1. Right-click on `workflow_db` in pgAdmin 4.
2. Select **Backup...**
3. Choose a filename (e.g. `workflow_backup_2026.sql`), format (Custom or Plain), and click **Backup**.
4. To restore, right-click `workflow_db` and select **Restore...**

### Option B: Via Command Line (GCP SSH)
You can take a full database dump directly from your VM using `gcloud`:

```powershell
# Take a backup dump on the VM
gcloud compute ssh nextgen-erp-core-vm --zone=us-central1-a --project=nextgen-erp-7753216 --command="sudo docker exec nextgen-workflow-postgres pg_dump -U postgres workflow_db > /tmp/workflow_db_backup.sql"

# Download the backup file to your local computer
gcloud compute scp nextgen-erp-core-vm:/tmp/workflow_db_backup.sql ./workflow_db_backup.sql --zone=us-central1-a --project=nextgen-erp-7753216
```

---

## 4. Key Management Commands Reference

| Action | Command / Method |
| :--- | :--- |
| **Start DB Tunnel** | `.\connect-cloud-db.ps1` |
| **Re-apply Schema** | `.\init-remote-db.ps1` |
| **Start Local App** | `docker compose up -d` |
| **Stop Local App** | `docker compose down` |
