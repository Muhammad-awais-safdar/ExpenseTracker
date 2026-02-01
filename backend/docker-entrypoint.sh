#!/bin/sh
set -e

echo "🚀 Starting deployment..."

# Fix permissions again just in case (Render runs as arbitrary user sometimes, but usually root in Docker unless specified)
chmod -R 777 /var/www/storage
chmod -R 777 /var/www/storage

echo "📂 Running migrations..."
php artisan migrate --force

echo "🔥 Optimizing..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "✨ Starting server on port $PORT..."
php -S 0.0.0.0:10000 -t public
