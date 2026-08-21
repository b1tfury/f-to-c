#!/bin/sh
set -eu
cd /app/packages/db
: "${DATABASE_URL:?DATABASE_URL is required}"
export DATABASE_AUTH_TOKEN="${DATABASE_AUTH_TOKEN:-any-token}"
# Deno --env-file only sees this file. An empty .env made migrate
# succeed against a local sqlite and leave libsql empty.
{
  printf 'DATABASE_URL=%s\n' "$DATABASE_URL"
  printf 'DATABASE_AUTH_TOKEN=%s\n' "$DATABASE_AUTH_TOKEN"
  [ -n "${CLICKHOUSE_URL:-}" ] && printf 'CLICKHOUSE_URL=%s\n' "$CLICKHOUSE_URL"
  [ -n "${CLICKHOUSE_USERNAME:-}" ] && printf 'CLICKHOUSE_USERNAME=%s\n' "$CLICKHOUSE_USERNAME"
  [ -n "${CLICKHOUSE_PASSWORD:-}" ] && printf 'CLICKHOUSE_PASSWORD=%s\n' "$CLICKHOUSE_PASSWORD"
} > .env
echo "migrating against ${DATABASE_URL}"
ls -la drizzle | head -n 20 || {
  echo "drizzle folder missing" >&2
  exit 1
}
i=0
until deno run -A --env-file .env src/migrate.mts; do
  i=$((i + 1))
  if [ "$i" -ge 30 ]; then
    echo "migrate failed after ${i} attempts" >&2
    exit 1
  fi
  echo "libsql not ready (attempt ${i}); retrying in 5s..."
  sleep 5
done
echo "migrations applied; keeping process alive"
deno eval "Deno.serve({ hostname: '0.0.0.0', port: Number(Deno.env.get('PORT') || '10000') }, () => new Response('ok\\n'));" &
exec sleep infinity
