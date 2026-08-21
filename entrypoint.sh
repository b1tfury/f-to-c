#!/bin/sh
set -eu
cd /app/packages/db
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
