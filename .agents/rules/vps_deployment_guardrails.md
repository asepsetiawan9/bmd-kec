# 🛡️ VPS MULTI-APP DEPLOYMENT GUARDRAILS (MANDATORY RULE)

## 🎯 Target Server: `31.97.187.71` (SIMPEL KAN Deployment)
- **Domain**: `simpelkan.wiradashboard-ep.online`
- **Reference Doc**: `PANDUAN_ISOLASI_VPS_SIMPELKAN_31.97.187.71.md`

## 🚨 MANDATORY INSTRUCTIONS FOR ANY AI AGENT:
Whenever the user instructs to "deploy", "setup server", "update VPS", or run any remote task on VPS `31.97.187.71`, the AI MUST strictly follow these rules:

### 1. Zero-Touch on Existing Applications
- **Wiradashboard-EP**: DO NOT touch `/var/www/apps/wiradashboard-ep`, port `8001`, or docker container `mongodb` (`27017`).
- **Indra-Arica**: DO NOT touch `/var/www/apps/indra-arica`, port `8002`, or port `3002`.
- **Nginx Configs**: DO NOT edit `/etc/nginx/sites-available/wiradashboard-ep.conf` or `/etc/nginx/sites-available/indra-arica.conf`.

### 2. Isolated Target Directory
- SIMPEL KAN MUST be deployed exclusively in: `/var/www/apps/simpelkan`.
- Ownership: `www-data:www-data`, permissions `775` on `storage` and `bootstrap/cache`.

### 3. Dedicated Socket & Zero Port Collision
- DO NOT bind or use ports: `8001`, `8002`, `3002`, `3000`, `27017`.
- SIMPEL KAN MUST connect via PHP-FPM Unix Socket: `unix:/run/php/php8.5-fpm.sock`.

### 4. Nginx Safety Check
- NEVER run `systemctl reload nginx` without running `nginx -t` first.
- All virtual host definitions for Simpelkan must reside in `/etc/nginx/sites-available/simpelkan.conf`.

### 5. Independent SSL Handling
- Use Certbot with explicit domain and cert-name:
  `certbot --nginx -d simpelkan.wiradashboard-ep.online --cert-name simpelkan.wiradashboard-ep.online`
  to never overwrite existing certificates.

### 6. Local Asset Compilation (No Server OOM)
- Run `npm run build` locally on the workstation.
- Sync/upload pre-built `public/build` to `/var/www/apps/simpelkan/public/build`.
- DO NOT run memory-intensive build processes directly on the VPS.
