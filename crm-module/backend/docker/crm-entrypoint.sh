#!/bin/sh
set -eu

: "${POSTGRES_USER:=crm}"
: "${POSTGRES_DB:=nextgen_erp}"
: "${POSTGRES_PASSWORD:?Set CRM_DB_PASSWORD before starting CRM}"
export POSTGRES_USER POSTGRES_DB POSTGRES_PASSWORD

/usr/local/bin/docker-entrypoint.sh postgres &
postgres_pid=$!
app_pid=

stop_children() {
    if [ -n "$app_pid" ]; then
        kill -TERM "$app_pid" 2>/dev/null || true
    fi
    kill -TERM "$postgres_pid" 2>/dev/null || true
    wait "$postgres_pid" 2>/dev/null || true
}
trap stop_children EXIT INT TERM

until pg_isready -h 127.0.0.1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" >/dev/null 2>&1; do
    if ! kill -0 "$postgres_pid" 2>/dev/null; then
        echo "PostgreSQL exited before becoming ready." >&2
        exit 1
    fi
    sleep 1
done

export SPRING_DATASOURCE_URL="jdbc:postgresql://127.0.0.1:5432/${POSTGRES_DB}"
export SPRING_DATASOURCE_USERNAME="$POSTGRES_USER"
export SPRING_DATASOURCE_PASSWORD="$POSTGRES_PASSWORD"
su-exec appuser java -jar /app/app.jar &
app_pid=$!

set +e
wait "$app_pid"
status=$?
set -e
exit "$status"
