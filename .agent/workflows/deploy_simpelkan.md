# 🚀 WORKFLOW: DEPLOYMENT SIMPEL KAN KE VPS `31.97.187.71`

## 🎯 Tujuan
Melakukan deployment sistem SIMPEL KAN ke server VPS `31.97.187.71` dengan domain `simpelkan.wiradashboard-ep.online` dengan status zero-downtime, zero-port-collision, dan perlindungan 100% terhadap sistem lain (`wiradashboard-ep` & `indra-arica`).

---

## 🛑 CHECKLIST PRA-DEPLOYMENT (WAJIB DIVERIFIKASI SEBELUM EKSEKUSI)
- [ ] Baca dan patuhi `PANDUAN_ISOLASI_VPS_SIMPELKAN_31.97.187.71.md`.
- [ ] Verifikasi port `8001`, `8002`, `3002`, `27017` tidak disentuh.
- [ ] Pastikan file `/etc/nginx/sites-available/wiradashboard-ep.conf` dan `indra-arica.conf` TIDAK disentuh.
- [ ] Pastikan container docker `mongodb` TIDAK dimatikan.
- [ ] Bundle frontend Vite telah di-build di lokal (`npm run build`).

---

## 📋 LANGKAH-LANGKAH EKSEKUSI (STEP-BY-STEP)

### Langkah 1: Build Frontend Lokal
Kompilasi asset di mesin lokal untuk menghindari beban CPU/RAM berlebih di VPS:
```powershell
npm run build
```

### Langkah 2: Persiapan Direktori di VPS
Buat direktori kerja terisolasi di server:
```bash
mkdir -p /var/www/apps/simpelkan
chown -R www-data:www-data /var/www/apps/simpelkan
```

### Langkah 3: Transfer Source Code & Build Bundle
Kirim kode dan folder `public/build` yang telah dikompilasi ke `/var/www/apps/simpelkan`.

### Langkah 4: Konfigurasi Environment & Database
Di `/var/www/apps/simpelkan`:
1. Buat file `.env`:
   - `APP_NAME="SIMPEL KAN"`
   - `APP_ENV=production`
   - `APP_DEBUG=false`
   - `APP_URL=https://simpelkan.wiradashboard-ep.online`
   - `DB_CONNECTION=sqlite`
   - `DB_DATABASE=/var/www/apps/simpelkan/database/database.sqlite`
2. Siapkan database SQLite:
   ```bash
   touch /var/www/apps/simpelkan/database/database.sqlite
   chown -R www-data:www-data /var/www/apps/simpelkan/database
   ```
3. Install dependensi & migrasi:
   ```bash
   composer install --no-dev --prefer-dist --optimize-autoloader --no-interaction
   php artisan key:generate --force
   php artisan migrate --force
   php artisan db:seed --class=BelanjaV2Seeder --force
   php artisan storage:link
   ```

### Langkah 5: Optimasi Cache Laravel
```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
```

### Langkah 6: Konfigurasi Virtual Host Nginx
1. Buat `/etc/nginx/sites-available/simpelkan.conf`:
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
2. Enable vhost:
   ```bash
   ln -sf /etc/nginx/sites-available/simpelkan.conf /etc/nginx/sites-enabled/simpelkan.conf
   ```
3. Uji sintaks & reload:
   ```bash
   nginx -t && systemctl reload nginx
   ```

### Langkah 7: Penerbitan SSL Certbot
```bash
certbot --nginx -d simpelkan.wiradashboard-ep.online --cert-name simpelkan.wiradashboard-ep.online --non-interactive --agree-tos -m admin@wiradashboard-ep.online
```

### Langkah 8: Verifikasi Kesehatan Sistem Pasca-Deploy
1. Tes endpoint Simpelkan:
   ```bash
   curl -I https://simpelkan.wiradashboard-ep.online
   ```
2. Tes endpoint sistem eksisting (Pastikan tetap HTTP 200 OK):
   ```bash
   curl -I https://wiradashboard-ep.online
   curl -I https://api.wiradashboard-ep.online
   curl -I https://indra-arica.digital
   curl -I https://api.indra-arica.digital
   ```
