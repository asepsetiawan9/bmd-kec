#!/usr/bin/env bash
# ==============================================================================
# SIMUKTI Zero-Downtime Deployment Script - Kecamatan Mekarmukti
# Target VPS: 31.97.187.71 (Root: /var/www/apps/simukti)
# Domain: https://simukti.wiradashboard-ep.online
# Usage: ./deployment/deploy.sh
# ==============================================================================

set -euo pipefail

echo "🚀 Memulai Deployment SIMUKTI BMD ke Production (31.97.187.71)..."

# 1. Mode Pemeliharaan Sementara
php artisan down --secret="simukti-deploy-bypass-token" || true

# 2. Update Source Code
echo "📥 Menarik pembaruan terbaru dari repository Git..."
git pull origin main

# 3. Instalasi PHP Dependencies
echo "📦 Menginstall dependencies Composer production..."
composer install --no-dev --prefer-dist --optimize-autoloader --no-interaction

# 4. Inisialisasi & Migrasi Database SQLite
echo "🗄️ Menjalankan migrasi database SQLite..."
touch database/database.sqlite
php artisan migrate --force

# 5. Link Storage Publik
echo "🔗 Memastikan symbolic link storage terpasang..."
php artisan storage:link || true

# 6. Set File Permissions
echo "🔒 Mengatur hak akses www-data..."
chown -R www-data:www-data /var/www/apps/simukti
chmod -R 775 /var/www/apps/simukti/storage /var/www/apps/simukti/bootstrap/cache /var/www/apps/simukti/database
chmod 664 /var/www/apps/simukti/database/database.sqlite

# 7. Optimasi Caching Laravel
echo "🧹 Memperbarui cache konfigurasi, route, dan view..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 8. Reload PHP-FPM Service (Isolasi murni)
echo "🔄 Melakukan graceful reload PHP 8.5-FPM..."
systemctl reload php8.5-fpm || true

# 9. Nonaktifkan Mode Pemeliharaan
php artisan up

echo "✅ Deployment SIMUKTI BMD berhasil diselesaikan!"
