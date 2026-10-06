#!/usr/bin/env bash
# ==============================================================================
# SIMUKTI Database & Storage Document Backup Script - Kecamatan Mekarmukti
# Jalankan via Cron setiap jam 02:00 WIB:
# 0 2 * * * /var/www/apps/simukti/deployment/backup.sh >> /var/log/simukti_backup.log 2>&1
# ==============================================================================

set -euo pipefail

APP_DIR="/var/www/apps/simukti"
BACKUP_DIR="${APP_DIR}/backup"
UPLOADS_DIR="${APP_DIR}/storage/app/public"
RETENTION_DAYS=30
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")

echo "=========================================================="
echo "[$(date +"%Y-%m-%d %H:%M:%S")] Memulai Backup Harian SIMUKTI..."
echo "=========================================================="

# 1. Pastikan folder backup tersedia
mkdir -p "${BACKUP_DIR}"

# 2. Eksekusi Backup via Artisan SIMUKTI
cd "${APP_DIR}"
echo "-> Menjalankan backup database melalui Laravel Artisan..."
php8.5 artisan simukti:backup-database --retention=${RETENTION_DAYS}

# 3. Kompresi file sql jika ada
find "${BACKUP_DIR}" -maxdepth 1 -name "simukti_backup_*.sql" -exec gzip -9 {} \;

# 4. Backup sinkronisasi folder uploads/storage ke arsip backup
echo "-> Menyinkronkan file upload dokumen hukum dan foto aset..."
UPLOADS_BACKUP="${BACKUP_DIR}/uploads_sync"
mkdir -p "${UPLOADS_BACKUP}"
rsync -av --delete "${UPLOADS_DIR}/" "${UPLOADS_BACKUP}/"

# 5. Pembersihan file backup lama (> 30 hari)
echo "-> Membersihkan file backup yang lebih tua dari ${RETENTION_DAYS} hari..."
find "${BACKUP_DIR}" -type f -name "simukti_backup_*.sql.gz" -mtime +${RETENTION_DAYS} -delete

echo "[$(date +"%Y-%m-%d %H:%M:%S")] Backup Harian SIMUKTI selesai dengan sukses!"
