# 🛡️ GLOBAL AI WORKSPACE PROTOCOLS

## 🤖 PANDUAN DEPLOYMENT KE VPS `31.97.187.71` (SIMPEL KAN)
Setiap kali AI menerima perintah untuk melakukan deploy atau mengelola VPS `31.97.187.71`:
1. **Wajib Membaca**: Dokumen `PANDUAN_ISOLASI_VPS_SIMPELKAN_31.97.187.71.md`.
2. **Larangan Keras**:
   - DILARANG memodifikasi atau menghapus folder `/var/www/apps/wiradashboard-ep` dan `/var/www/apps/indra-arica`.
   - DILARANG menabrak port yang sedang digunakan: `8001`, `8002`, `3002`, `3000`, `27017`.
   - DILARANG memodifikasi Nginx config yang sudah ada (`wiradashboard-ep.conf`, `indra-arica.conf`).
   - DILARANG me-reload Nginx tanpa tes sintaks: selalu jalankan `nginx -t` terlebih dahulu.
   - DILARANG mematikan container MongoDB (`aea2c448f077`) atau service backend aplikasi lain.
   - DILARANG menjalankan `npm run build` di VPS (kompilasi build dilakukan lokal, lalu bundle di-upload).
3. **Standar Simpelkan**:
   - Path root: `/var/www/apps/simpelkan`
   - Socket PHP: `unix:/run/php/php8.5-fpm.sock`
   - Nginx config: `/etc/nginx/sites-available/simpelkan.conf`
   - Database: SQLite di `database/database.sqlite` (terisolasi dan ringan).
   - Domain: `https://simpelkan.wiradashboard-ep.online`
