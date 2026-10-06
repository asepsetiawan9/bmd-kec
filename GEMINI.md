# 🛡️ GLOBAL AI WORKSPACE PROTOCOLS

## 🤖 PANDUAN DEPLOYMENT KE VPS `31.97.187.71` (SIMUKTI BMD)
Setiap kali AI menerima perintah untuk melakukan deploy atau mengelola VPS `31.97.187.71`:
1. **Wajib Membaca**: Dokumen `PANDUAN_ISOLASI_VPS_SIMUKTI_31.97.187.71.md`.
2. **Larangan Keras (Absolute Guardrails)**:
   - DILARANG memodifikasi atau menghapus folder aplikasi eksisting di VPS:
     - `/var/www/apps/wiradashboard-ep`
     - `/var/www/apps/indra-arica`
     - `/var/www/apps/simpelkan`
   - DILARANG menabrak atau mem-bind port yang sedang digunakan: `8001`, `8002`, `3002`, `3000`, `27017`, `65529`, `1721`.
   - DILARANG memodifikasi Nginx config yang sudah ada (`wiradashboard-ep.conf`, `indra-arica.conf`, `simpelkan.conf`).
   - DILARANG me-reload Nginx tanpa tes sintaks: selalu jalankan `nginx -t` terlebih dahulu sebelum `systemctl reload nginx`.
   - DILARANG mematikan container MongoDB (`aea2c448f077`) atau service backend aplikasi lain (`wiradashboard-backend`, `indra-arica-backend`, `indra-arica-frontend`, `monarx-agent`).
   - DILARANG menjalankan `npm run build` atau `vite build` di VPS (kompilasi build wajib dilakukan lokal di Windows, lalu bundle di-upload).
   - DILARANG menjalankan Certbot tanpa opsi `--cert-name simukti.wiradashboard-ep.online` agar tidak menimpa sertifikat SSL domain lain.
3. **Standar Resmi SIMUKTI**:
   - Path root: `/var/www/apps/simukti`
   - Web root: `/var/www/apps/simukti/public`
   - Socket PHP: `unix:/run/php/php8.5-fpm.sock`
   - Nginx config: `/etc/nginx/sites-available/simukti.conf` (symlinked ke `/etc/nginx/sites-enabled/simukti.conf`)
   - Database: SQLite di `/var/www/apps/simukti/database/database.sqlite` (terisolasi, zero memory daemon overhead, WAL mode).
   - Domain: `https://simukti.wiradashboard-ep.online`
   - Git Repo: `https://github.com/asepsetiawan9/bmd-kec.git` (Branch: `main`)
   - Kredensial SSH: `root@31.97.187.71` (Port 22, Password: `Indra-arica2026`)
