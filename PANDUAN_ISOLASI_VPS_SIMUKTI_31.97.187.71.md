# 🛡️ PANDUAN PROTOKOL ISOLASI & PANDUAN DEPLOYMENT VPS SIMUKTI BMD
### Server: `31.97.187.71` (Hostname: `srv1995969` | User: `root`)
### Target URL: `https://simukti.wiradashboard-ep.online`
### Dokumen Audit Resmi: Live VPS Inspection (6 Oktober 2026)

---

> [!IMPORTANT]
> **SERVER INI ADALAH PRODUCTION MULTI-TENANT DENGAN BEBERAPA SISTEM AKTIF.**
> Di dalam server VPS ini telah berjalan **3 SISTEM PRODUKSI LAIN** (`WIRADASHBOARD-EP`, `INDRA-ARICA`, dan `SIMPELKAN`) yang aktif melayani pengguna.
> **SETIAP AI AGENT (JARVIS) ATAU DEVOPS ENGINEER WAJIB MEMBACA & MEMATUHI SELURUH ATURAN DALAM DOKUMEN INI SEBELUM MENJALANKAN PERINTAH DEPLOYMENT APA PUN.**
> Pelanggaran terhadap protokol ini berpotensi merusak sistem lain, mematikan database MongoDB bersama, menabrak port aplikasi lain, atau menyebabkan *downtime* layanan publik!

---

## 🔑 1. Kredensial & Akses Server

| Parameter | Nilai Resmi |
| :--- | :--- |
| **IP Address** | `31.97.187.71` |
| **Port SSH** | `22` (Standard OpenSSH) |
| **Username** | `root` |
| **Password** | `Indra-arica2026` *(Catatan: SSH Key lokal juga sudah terautentikasi)* |
| **Hostname** | `srv1995969` (Ubuntu 24.04 LTS / Linux 7.0 Kernel) |
| **Target URL** | `https://simukti.wiradashboard-ep.online` |
| **Status DNS** | `simukti.wiradashboard-ep.online` ➔ `31.97.187.71` (**A Record Aktif & Resolving**) |
| **Git Repository** | `https://github.com/asepsetiawan9/bmd-kec.git` (Branch: `main`) |

---

## 🗺️ 2. Peta Inventaris Sistem Eksisting di VPS (Hasil Audit Langsung)

Berdasarkan inspeksi langsung via SSH pada 6 Oktober 2026, berikut inventaris resmi seluruh sistem yang sedang berjalan di VPS:

| No | Sistem / Aplikasi | Domain | Direktori Root | Port / Socket | Service / Container | Database |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | **WIRADASHBOARD-EP** | `wiradashboard-ep.online`<br>`api.wiradashboard-ep.online` | `/var/www/apps/wiradashboard-ep/` | `127.0.0.1:8001` (FastAPI)<br>Nginx 80/443 | `wiradashboard-backend.service`<br>Docker `mongodb` | MongoDB 7.0 (`127.0.0.1:27017`)<br>DB: `dashboard_ep` |
| **2** | **INDRA-ARICA** | `indra-arica.digital`<br>`api.indra-arica.digital` | `/var/www/apps/indra-arica/` | `127.0.0.1:8002` (Laravel API)<br>`127.0.0.1:3002` (Next.js SSR) | `indra-arica-backend.service`<br>`indra-arica-frontend.service` | SQLite:<br>`indra-arica/backend/database/database.sqlite` |
| **3** | **SIMPELKAN** | `simpelkan.wiradashboard-ep.online` | `/var/www/apps/simpelkan/` | Socket `php8.5-fpm.sock`<br>Nginx 80/443 | `php8.5-fpm.service` | SQLite:<br>`simpelkan/database/database.sqlite` |
| **4** | **MONARX SECURITY** | Internal Shield | System-wide | `127.0.0.1:65529`<br>`127.0.0.1:1721` | `monarx-agent.service` | Real-time Malware Protection |
| **5** | **SIMUKTI (Target Baru)** | `simukti.wiradashboard-ep.online` | `/var/www/apps/simukti/` | Socket `php8.5-fpm.sock`<br>Nginx 80/443 | `php8.5-fpm.service` | SQLite Terisolasi:<br>`simukti/database/database.sqlite` |

---

## 🛑 3. ATURAN LARANGAN MUTLAK (GUARDRAILS — ZERO COLLISION)

AI wajib mematuhi batasan-batasan ketat berikut:

### ❌ A. Larangan Port (DILARANG Digunakan atau Dihubungi untuk Binding)
1. 🚫 **Port 8001**: Milik Backend FastAPI Wiradashboard.
2. 🚫 **Port 8002**: Milik Backend Laravel Indra-Arica.
3. 🚫 **Port 3002**: Milik Next.js SSR Frontend Indra-Arica.
4. 🚫 **Port 3000**: Digunakan oleh background instance Node.js.
5. 🚫 **Port 27017**: Port database MongoDB production container `aea2c448f077`.
6. 🚫 **Port 65529 & 1721**: Port internal Monarx Security Agent.
7. 🚫 **Port 80 & 443**: Dedicated Nginx Reverse Proxy (DILARANG di-bind langsung oleh aplikasi tanpa melalui Nginx).
> **Solusi Standar SIMUKTI**: SIMUKTI wajib menggunakan **Unix Domain Socket** PHP-FPM (`unix:/run/php/php8.5-fpm.sock`) yang dilayani langsung oleh Nginx FastCGI. **Zero TCP port footprint!**

### ❌ B. Larangan Direktori (DILARANG Dimodifikasi, Dihapus, atau Ditimpa)
1. 🚫 `/var/www/apps/wiradashboard-ep/`
2. 🚫 `/var/www/apps/indra-arica/`
3. 🚫 `/var/www/apps/simpelkan/`
4. 🚫 `/var/lib/docker/` (Data layer MongoDB).
> **Solusi Standar SIMUKTI**: Seluruh file aplikasi SIMUKTI **WAJIB** terisolasi penuh di direktori:  
> `/var/www/apps/simukti/`

### ❌ C. Larangan Konfigurasi Nginx
1. 🚫 **DILARANG MENGEDIT atau MENYENTUH**:
   - `/etc/nginx/sites-available/wiradashboard-ep.conf`
   - `/etc/nginx/sites-available/indra-arica.conf`
   - `/etc/nginx/sites-available/simpelkan.conf`
   - Serta symlink-nya di `/etc/nginx/sites-enabled/`.
2. 🚫 **DILARANG RELOAD NGINX TANPA TEST SINTAKS**:
   - **WAJIB** menjalankan `nginx -t` terlebih dahulu sebelum melakukan `systemctl reload nginx`.
   - Jika `nginx -t` menghasilkan peringatan error sintaks, **DILARANG KERAS** me-reload Nginx karena akan melumpuhkan semua website yang ada di VPS!
> **Solusi Standar SIMUKTI**: Buat file konfigurasi vhost independen:  
> `/etc/nginx/sites-available/simukti.conf` dan aktifkan dengan symlink ke `/etc/nginx/sites-enabled/simukti.conf`.

### ❌ D. Larangan Service & Container (DILARANG Stop / Kill / Restart)
1. 🚫 `systemctl stop/restart wiradashboard-backend.service`
2. 🚫 `systemctl stop/restart indra-arica-backend.service`
3. 🚫 `systemctl stop/restart indra-arica-frontend.service`
4. 🚫 `docker stop mongodb` atau `docker restart mongodb`
5. 🚫 `systemctl restart docker`
6. 🚫 `systemctl stop/disable monarx-agent`

### ❌ E. Larangan Kompilasi Berat di VPS
1. 🚫 **DILARANG MENJALANKAN `npm run build` ATAU `npx vite build` DI VPS**.
2. Kompilasi bundle React/Tailwind di VPS dapat memicu lonjakan CPU/RAM hingga 100%, yang akan memicu OOM Killer dan menembak mati service API yang sedang aktif!
> **Solusi Standar SIMUKTI**: Kompilasi Vite selalu dilakukan di lokal Windows (`npm run build`), lalu folder `public/build` di-upload atau disertakan ke VPS.

### ❌ F. Larangan Certbot Tanpa Flag `--cert-name`
1. 🚫 Dilarang menjalankan `certbot --nginx` tanpa `--cert-name simukti.wiradashboard-ep.online` karena berisiko menimpa sertifikat SSL domain utama `wiradashboard-ep.online` atau `simpelkan.wiradashboard-ep.online`.

---

## 🏛️ 4. SPESIFIKASI TEKNIS RESMI SIMUKTI DI VPS

* **Root Directory**: `/var/www/apps/simukti`
* **Web Root**: `/var/www/apps/simukti/public`
* **Ownership**: `www-data:www-data`
* **Permissions**:
  * Direktori: `755`
  * Direktori writeable (`storage/`, `bootstrap/cache/`, `database/`): `775`
  * File database (`database/database.sqlite`): `664`
* **PHP Environment**: PHP 8.5.4 FPM
* **PHP-FPM Socket**: `unix:/run/php/php8.5-fpm.sock`
* **Database**: SQLite3 (`/var/www/apps/simukti/database/database.sqlite`) dengan WAL mode aktif.
* **Nginx Config Path**: `/etc/nginx/sites-available/simukti.conf`
* **Domain Name**: `simukti.wiradashboard-ep.online`

---

## 📋 5. STANDAR KONFIGURASI NGINX VHOST SIMUKTI (`simukti.conf`)

Simpan konfigurasi berikut di `/etc/nginx/sites-available/simukti.conf`:

```nginx
server {
    server_name simukti.wiradashboard-ep.online;

    root /var/www/apps/simukti/public;
    index index.php index.html;

    client_max_body_size 50M;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript application/rss+xml application/atom+xml image/svg+xml;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/run/php/php8.5-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    # Static Assets Caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    # Block Hidden Files except .well-known (for Certbot)
    location ~ /\.(?!well-known).* {
        deny all;
    }

    access_log /var/log/nginx/simukti_access.log;
    error_log /var/log/nginx/simukti_error.log;

    listen 80;
    listen [::]:80;
}
```

---

## 🚀 6. PANDUAN EKSEKUSI DEPLOYMENT LANGKAH DEMI LANGKAH (SOP AI)

Berikut adalah panduan eksekusi wajib saat AI diperintahkan untuk melakukan deployment:

### Langkah 1: Build Frontend di Komputer Lokal (Windows)
```powershell
# Di lokal Windows:
npm run build
```
Pastikan file `public/build/manifest.json` dan chunk assets di `public/build/assets/` terbuat dengan sempurna.

### Langkah 2: Pre-Flight Check VPS
Lakukan pengecekan kesehatan awal di VPS:
```bash
ssh root@31.97.187.71 "nginx -t && ls -la /run/php/php8.5-fpm.sock && free -h"
```

### Langkah 3: Setup Folder Aplikasi di VPS
Jika pertama kali deploy:
```bash
ssh root@31.97.187.71 "git clone https://github.com/asepsetiawan9/bmd-kec.git /var/www/apps/simukti"
```
Jika update deploy:
```bash
ssh root@31.97.187.71 "cd /var/www/apps/simukti && git pull origin main"
```

### Langkah 4: Transfer / Sinkronisasi Bundle Build Frontend
Jika `public/build` tidak di-commit ke Git, transfer folder lokal `public/build` ke VPS menggunakan `scp`:
```powershell
scp -r public/build root@31.97.187.71:/var/www/apps/simukti/public/
```

### Langkah 5: Setup Konfigurasi `.env` Production di VPS
Buat file `/var/www/apps/simukti/.env` dengan parameter penting:
```ini
APP_NAME="SIMUKTI"
APP_ENV=production
APP_KEY=base64:OrYGMk6j9RCEfPRxOlIY6x2Ulu3GC8yygn2/pY7GxgA=
APP_DEBUG=false
APP_URL=https://simukti.wiradashboard-ep.online

APP_LOCALE=id
APP_FALLBACK_LOCALE=id
APP_FAKER_LOCALE=id_ID

LOG_CHANNEL=daily
LOG_LEVEL=warning

DB_CONNECTION=sqlite
# DB_DATABASE otomatis mengarah ke database/database.sqlite

SESSION_DRIVER=database
SESSION_LIFETIME=120

CACHE_STORE=database
QUEUE_CONNECTION=sync
```

### Langkah 6: Install Dependencies Composer & Database Setup
Jalankan di server VPS:
```bash
ssh root@31.97.187.71 "cd /var/www/apps/simukti && composer install --no-dev --optimize-autoloader --no-interaction"
ssh root@31.97.187.71 "cd /var/www/apps/simukti && touch database/database.sqlite"
ssh root@31.97.187.71 "cd /var/www/apps/simukti && php8.5 artisan migrate --force"
ssh root@31.97.187.71 "cd /var/www/apps/simukti && php8.5 artisan db:seed --force"
ssh root@31.97.187.71 "cd /var/www/apps/simukti && php8.5 artisan storage:link || true"
```

### Langkah 7: Atur Ownership & Permission
```bash
ssh root@31.97.187.71 "chown -R www-data:www-data /var/www/apps/simukti"
ssh root@31.97.187.71 "chmod -R 775 /var/www/apps/simukti/storage /var/www/apps/simukti/bootstrap/cache /var/www/apps/simukti/database"
ssh root@31.97.187.71 "chmod 664 /var/www/apps/simukti/database/database.sqlite"
```

### Langkah 8: Aktifkan Nginx Vhost & Tes Sintaks
```bash
# Buat /etc/nginx/sites-available/simukti.conf
# Aktifkan symlink:
ssh root@31.97.187.71 "ln -sf /etc/nginx/sites-available/simukti.conf /etc/nginx/sites-enabled/simukti.conf"
# TES SINTAKS NGINX (WAJIB):
ssh root@31.97.187.71 "nginx -t"
# Jika OK, reload:
ssh root@31.97.187.71 "systemctl reload nginx"
```

### Langkah 9: Pasang SSL Certificate (Let's Encrypt Certbot)
```bash
ssh root@31.97.187.71 "certbot --nginx -d simukti.wiradashboard-ep.online --cert-name simukti.wiradashboard-ep.online --non-interactive --agree-tos -m admin@wiradashboard-ep.online"
```

### Langkah 10: Optimasi Cache Laravel Production
```bash
ssh root@31.97.187.71 "cd /var/www/apps/simukti && php8.5 artisan config:cache && php8.5 artisan route:cache && php8.5 artisan view:cache"
```

### Langkah 11: Verifikasi Post-Deployment
1. Uji endpoint SIMUKTI:
   ```bash
   curl -I https://simukti.wiradashboard-ep.online
   ```
   *(Harus mengembalikan HTTP 200 atau 302 ke login)*.
2. Uji endpoint sistem lain untuk memastikan **TIDAK TERGANGGU**:
   * `curl -I https://wiradashboard-ep.online` ➔ Harus HTTP 200
   * `curl -I https://indra-arica.digital` ➔ Harus HTTP 200
   * `curl -I https://simpelkan.wiradashboard-ep.online` ➔ Harus HTTP 200

---

## 🆘 7. PROTOKOL TANGGAP DARURAT & ROLLBACK

Jika terjadi kendala saat deployment:
1. **Nginx Error Sintaks**:
   Jika `nginx -t` gagal setelah memasang `simukti.conf`:
   ```bash
   rm /etc/nginx/sites-enabled/simukti.conf
   nginx -t && systemctl reload nginx
   ```
   Hal ini memastikan vhost lain langsung pulih seketika tanpa downtime.
2. **Database Permission Error (SQLite readonly)**:
   Periksa izin tulis folder `database` dan file `database.sqlite`:
   ```bash
   chown -R www-data:www-data /var/www/apps/simukti/database
   chmod 775 /var/www/apps/simukti/database
   chmod 664 /var/www/apps/simukti/database/database.sqlite
   ```
3. **Penyimpanan Storage Dokumen**:
   Pastikan symlink `public/storage` mengarah ke `/var/www/apps/simukti/storage/app/public`.
