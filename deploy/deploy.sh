#!/usr/bin/env bash
#
# Script setup VPS produksi untuk SINGGAH.
# Dijalankan SEKALI di VPS yang masih kosong, sebagai user dengan sudo.
#
#   sudo bash deploy.sh <domain-api>
# Contoh:
#   sudo bash deploy.sh api.singgah.site
#
# Yang dikerjakan:
#   1. nginx + certbot (HTTPS)
#   2. Docker + Redis
#   3. Node.js + PM2
#   4. Menyalakan aplikasi sebagai proses PM2
#
# Yang TIDAK dikerjakan (sengaja, demi keamanan):
#   - tidak menyalin .env ke mana pun; itu harus kamu isi sendiri
#   - tidak mencetak password ke layar

set -euo pipefail

DOMAIN="${1:-}"
REPO_DIR="$HOME/singgah"

if [[ -z "$DOMAIN" ]]; then
  echo "Pakai: sudo bash deploy.sh <domain-api>" >&2
  echo "Contoh: sudo bash deploy.sh api.singgah.site" >&2
  exit 1
fi

say() { printf '\n\033[1;36m==> %s\033[0m\n' "$1"; }
warn() { printf '\033[1;33m[!] %s\033[0m\n' "$1"; }
die() { printf '\033[1;31m[x] %s\033[0m\n' "$1" >&2; exit 1; }

# ---------------------------------------------------------------
say "1/6  Memasang nginx dan certbot"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq nginx certbot python3-certbot-nginx curl git ufw

say "2/6  Membuka port 80, 443, dan 22"
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

say "3/6  Memasang Node.js 22 + PM2"
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y -qq nodejs
fi
npm install -g pm2

say "4/6  Memasang Docker + menjalankan Redis"
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
  usermod -aG docker "$USER"
fi
mkdir -p "$REPO_DIR/deploy"
if [[ -f "$PWD/deploy/docker-compose.yml" ]]; then
  cp "$PWD/deploy/docker-compose.yml" "$REPO_DIR/deploy/"
  cd "$REPO_DIR/deploy"
  docker compose up -d
  cd "$REPO_DIR"
fi
docker compose -f "$REPO_DIR/deploy/docker-compose.yml" exec -T redis redis-cli ping \
  | grep -q PONG || warn "Redis belum menjawab PONG; cek lagi nanti."

say "5/6  Memasang konfigurasi nginx untuk $DOMAIN"
SRC_NGINX="$REPO_DIR/deploy/nginx/singgah.conf"
[[ -f "$SRC_NGINX" ]] || die "Tidak ditemukan $SRC_NGINX"

# Ganti nama domain agar tidak perlu edit manual.
sed "s/api\.singgah\.site/${DOMAIN}/g" "$SRC_NGINX" \
  > /etc/nginx/sites-available/singgah

# Placeholder sertifikat supaya "nginx -t" tidak gagal sebelum certbot jalan.
mkdir -p /etc/nginx/ssl-placeholder
openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
  -keyout /etc/nginx/ssl-placeholder/privkey.pem \
  -out /etc/nginx/ssl-placeholder/fullchain.pem 2>/dev/null
sed -i "s#/etc/letsencrypt/live/${DOMAIN}#/etc/nginx/ssl-placeholder#g" \
  /etc/nginx/sites-available/singgah

ln -sf /etc/nginx/sites-available/singgah /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

say "6/6  Minta sertifikat HTTPS"
# certbot perlu nginx yang sudah jalan; lalu pointer path otomatis kembali
# ke /etc/letsencrypt/live/<domain>.
certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos \
  --redirect --register-unsafely-without-email || \
  die "Gagal meminta sertifikat. Pastikan domain sudah diarahkan ke IP VPS ini."

# Kembalikan path ke lokasi sertifikat asli.
sed -i "s#/etc/nginx/ssl-placeholder#/etc/letsencrypt/live/${DOMAIN}#g" \
  /etc/nginx/sites-available/singgah
nginx -t
systemctl reload nginx

say "Selesai"
cat <<EOF

Langkah_manual yang masih harus kamu kerjakan:

  1. Buat file env produksi:
       nano $REPO_DIR/server/.env
     Minimal isinya:
       NODE_ENV=production
       PORT=5000
       TRUST_PROXY=2          # WAJIB 2: request lewat Vercel -> nginx -> Node
       PM2_INSTANCES=3
       REDIS_URL=redis://127.0.0.1:6379
       FRONTEND_URL=https://frontend-anda.vercel.app
       SERVER_BACKLOG=8192
     (isi juga kredensial TiDB & SESSION_SECRET dari .env lokal)

  2. Jalankan aplikasi:
       cd $REPO_DIR/server
       npm ci --omit=dev
       pm2 start ecosystem.config.js
       pm2 save && pm2 startup

  3. Di Vercel, set env:
       BACKEND_ORIGIN=https://$DOMAIN
     lalu deploy ulang frontend.

  4. Uji:
       curl -I https://$DOMAIN/api/news?limit=1     -> harus 200
       cd server && npm run test:load                -> harus 7/7

EOF
