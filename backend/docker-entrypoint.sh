#!/bin/sh
set -e

echo "Starting backend container..."

# Ensure writable runtime directories
chmod -R 777 /var/www/storage
chmod -R 777 /var/www/bootstrap/cache

# Generate app key if missing (first deploy)
if [ -z "$APP_KEY" ]; then
  echo "APP_KEY missing. Generating..."
  php artisan key:generate --force
fi

# Ensure symlink exists for public storage paths
php artisan storage:link || true

echo "Running migrations..."
php artisan migrate --force

# Rebuild optimized caches
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "Starting Apache..."
apache2-foreground
