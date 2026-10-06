# 🛡️ PANDUAN PROTOKOL ISOLASI & ATURAN DEPLOYMENT VPS SIMPEL KAN
### Server: `31.97.187.71` (Hostname: `srv1995969` | User: `root`)
### Target URL: `https://simpelkan.wiradashboard-ep.online`
### Dokumen Audit Resmi: Live VPS Reconnaissance (6 Oktober 2026)

---

> [!IMPORTANT]
> **SERVER INI ADALAH PRODUCTION MULTI-TENANT DENGAN BEBERAPA SISTEM AKTIF.**
> Di dalam server VPS ini telah berjalan **2 SISTEM PRODUKSI UTAMA** (`WIRADASHBOARD-EP` & `INDRA-ARICA`) yang aktif melayani pengguna.
> **SETIAP AI AGENT (JARVIS) ATAU DEVOPS ENGINEER WAJIB MEMBACA & MEMATUHI ATURAN INI SECARA OTOMATIS SEBELUM MELAKUKAN PERINTAH DEPLOYMENT APA PUN.**
> Pelanggaran terhadap protokol ini dapat mengakibatkan downtime sistem lain, konflik port, atau korupsi database.

---

## 🗺️ 1. Peta Inventaris Sistem Eksisting di VPS (Live State)

| No | Sistem / Aplikasi | Domain | Direktori | Port / Socket | Service / Container | Database |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | **WIRADASHBOARD-EP** | `wiradashboard-ep.online`<br>`api.wiradashboard-ep.online` | `/var/www/apps/wiradashboard-ep/` | `127.0.0.1:8001` (FastAPI)<br>Nginx Port 80/443 | `wiradashboard-backend.service`<br>Docker `mongodb` | MongoDB 7.0 (`127.0.0.1:27017`)<br>DB: `dashboard_ep` |
| **2** | **INDRA-ARICA** | `indra-arica.digital`<br>`api.indra-arica.digital` | `/var/www/apps/indra-arica/` | `127.0.0.1:8002` (Laravel)<br>`127.0.0.1:3002` (Next SSR) | `indra-arica-backend.service`<br>`indra-arica-frontend.service` | SQLite:<br>`indra-arica/backend/database/database.sqlite` |
| **3** | **Security Agent** | - | System-wide | `127.0.0.1:65529`<br>`127.0.0.1:1721` | `monarx-agent` | N/A (Malware Real-time Shield) |

---

## 🛑 2. ATURAN LARANGAN MUTLAK (GUARDRAILS — GAK BOLEH DILAKUKAN)

### ❌ A. Port Terlarang (DILARANG Digunakan atau Dihubungi untuk Binding)
1. 🚫 **Port 8001**: Milik FastAPI Backend Wiradashboard.
2. 🚫 **Port 8002**: Milik Laravel API Backend Indra-Arica.
3. 🚫 **Port 3002**: Milik Next.js SSR Frontend Indra-Arica.
4. 🚫 **Port 3000**: Digunakan oleh background instance Node.js.
5. 🚫 **Port 27017**: Port database MongoDB production.
6. 🚫 **Port 65529 & 1721**: Port komunikasi internal Monarx Security Agent.
7. 🚫 **Port 80 & 443**: Dedicated Nginx Reverse Proxy (DILARANG dibind langsung oleh aplikasi aplikasi non-Nginx).
> **Solusi Standar**: SIMPEL KAN wajib menggunakan **Unix Domain Socket** PHP-FPM (`unix:/run/php/php8.5-fpm.sock`) yang dilayani langsung oleh Nginx FastCGI. Zero TCP port footprint!

### ❌ B. Direktori Terlarang (DILARANG Dimodifikasi, Dihapus, atau Ditimpa)
1. 🚫 `/var/www/apps/wiradashboard-ep/` (Beserta seluruh subfolder `backend`, `frontend`, dan `logs`).
2. 🚫 `/var/www/apps/indra-arica/` (Beserta seluruh subfolder `backend`, `frontend`, dan `logs`).
3. 🚫 `/var/lib/docker/` (Data layer MongoDB).
> **Solusi Standar**: Seluruh kode dan runtime SIMPEL KAN **WAJIB** terisolasi penuh di:
> `/var/www/apps/simpelkan/`

### ❌ C. Konfigurasi Nginx Terlarang
1. 🚫 **DILARANG MENGEDIT atau MENYENTUH**:
   - `/etc/nginx/sites-available/wiradashboard-ep.conf`
   - `/etc/nginx/sites-available/indra-arica.conf`
   - `/etc/nginx/sites-enabled/wiradashboard-ep.conf`
   - `/etc/nginx/sites-enabled/indra-arica.conf`
2. 🚫 **DILARANG RELOAD TANPA TEST**:
   - **WAJIB** mengeksekusi `nginx -t` terlebih dahulu sebelum melakukan `systemctl reload nginx`.
   - Jika `nginx -t` menghasilkan error, **DILARANG KERAS** me-reload Nginx karena akan melumpuhkan semua website di server!
> **Solusi Standar**: Buat file vhost independen:
> `/etc/nginx/sites-available/simpelkan.conf` dan symlink ke `/etc/nginx/sites-enabled/simpelkan.conf`.

### ❌ D. Service & Container Terlarang (DILARANG Stop / Kill / Restart)
1. 🚫 `systemctl stop/restart wiradashboard-backend.service`
2. 🚫 `systemctl stop/restart indra-arica-backend.service`
3. 🚫 `systemctl stop/restart indra-arica-frontend.service`
4. 🚫 `docker stop mongodb` atau `docker restart mongodb`
5. 🚫 `systemctl restart docker`
6. 🚫 `systemctl stop/disable monarx-agent`

### ❌ E. Larangan SSL & Certbot
1. 🚫 Dilarang menjalankan perintah Certbot tanpa menentukan `--cert-name` yang spesifik, untuk mencegah overwrite sertifikat domain `wiradashboard-ep.online` atau `indra-arica.digital`.
> **Solusi Standar**:
> `certbot --nginx -d simpelkan.wiradashboard-ep.online --cert-name simpelkan.wiradashboard-ep.online`

### ❌ F. Larangan Build Resource Berat di Server
1. 🚫 **DILARANG** menjalankan `npm run build` atau `vite build` langsung di server VPS.
2. Proses kompilasi JavaScript/CSS Vite memakan CPU dan memori tinggi yang dapat memicu lonjakan latency pada API `wiradashboard` dan `indra-arica`.
> **Solusi Standar**: Build frontend selalu dilakukan secara lokal (`npm run build`), lalu kirimkan folder `public/build` yang sudah jadi ke VPS.

---

## 🛠️ 3. STANDAR DEPLOYMENT SIMPEL KAN YANG WAJIB DIGUNAKAN

1. **Path Aplikasi**: `/var/www/apps/simpelkan`
2. **Owner & Permissions**:
   ```bash
   chown -R www-data:www-data /var/www/apps/simpelkan
   chmod -R 775 /var/www/apps/simpelkan/storage /var/www/apps/simpelkan/bootstrap/cache
   ```
3. **Database**: SQLite mandiri di `/var/www/apps/simpelkan/database/database.sqlite` (aman, terisolasi, zero daemon overhead).
4. **Eksekusi PHP-FPM**: Menggunakan pool aktif `php8.5-fpm` via `/run/php/php8.5-fpm.sock`.
5. **Nginx FastCGI Template**:
   ```nginx
   server {
       server_name simpelkan.wiradashboard-ep.online;
       root /var/www/apps/simpelkan/public;
       index index.php index.html;

       client_max_body_size 50M;

       location / {
           try_files $uri $uri/ /index.php?$query_string;
       }

       location ~ \.php$ {
           include snippets/fastcgi-php.conf;
           fastcgi_pass unix:/run/php/php8.5-fpm.sock;
           fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
           include fastcgi_params;
       }

       location ~ /\.(?!well-known).* {
           deny all;
       }

       access_log /var/log/nginx/simpelkan_access.log;
       error_log /var/log/nginx/simpelkan_error.log;
   }
   ```
6. **Graceful Reload**:
   ```bash
   nginx -t && systemctl reload nginx
   systemctl reload php8.5-fpm
   ```
