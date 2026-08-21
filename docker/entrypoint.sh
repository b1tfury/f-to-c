#!/bin/sh
set -eu
cd /var/www/html

if [ -n "${RENDER_EXTERNAL_URL:-}" ]; then
  export APP_URL="${APP_URL:-$RENDER_EXTERNAL_URL}"
fi

if [ -z "${DATABASE_URL:-}" ] && [ -n "${INTERNAL_DATABASE_URL:-}" ]; then
  export DATABASE_URL="$INTERNAL_DATABASE_URL"
fi

# Plugin cannot return the Postgres password. Fall back to sqlite so the
# page still boots; switch to pgsql when DATABASE_URL or DB_PASSWORD is set.
if [ -z "${DATABASE_URL:-}" ] && [ -z "${DB_PASSWORD:-}" ]; then
  export DB_CONNECTION=sqlite
  export DB_DATABASE=/var/www/html/database/database.sqlite
  touch "$DB_DATABASE" || true
fi

mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views storage/logs bootstrap/cache

php artisan migrate --force --no-interaction

if [ -n "${CACHET_ADMIN_EMAIL:-}" ] && [ -n "${CACHET_ADMIN_PASSWORD:-}" ]; then
  php artisan cachet:make:user \
    "${CACHET_ADMIN_EMAIL}" \
    --password="${CACHET_ADMIN_PASSWORD}" \
    --admin=1 \
    --name="${CACHET_ADMIN_NAME:-Sahil Kharb}" \
    || true
fi

php artisan config:cache
php artisan route:cache || true
php artisan view:cache || true

php artisan schedule:work &
php artisan queue:work --sleep=3 --tries=3 --timeout=90 &

exec php artisan serve --host=0.0.0.0 --port="${PORT:-8000}"
