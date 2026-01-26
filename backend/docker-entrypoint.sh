#!/bin/sh
set -e

echo "🚀 Starting deployment..."

# Create database file if it doesn't exist
if [ ! -f /var/www/database/database.sqlite ]; then
    echo "Creating database.sqlite..."
    touch /var/www/database/database.sqlite
fi

# Fix permissions again just in case (Render runs as arbitrary user sometimes, but usually root in Docker unless specified)
# We can't always chown if we are not root but we can try chmod if we own it.
chmod 777 /var/www/database/database.sqlite
chmod -R 777 /var/www/storage

echo "📂 Running migrations..."
php artisan migrate --force --seed

echo "🔥 Optimizing..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "✨ Starting server on port $PORT..."
php -S 0.0.0.0:10000 -t public
