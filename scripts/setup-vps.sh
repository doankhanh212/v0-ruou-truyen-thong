#!/bin/bash
# =============================================================
#  SETUP VPS LẦN ĐẦU — Cửu Long Mỹ Tửu
#  Ubuntu 22.04 LTS
#  Chạy với: bash scripts/setup-vps.sh
#  Tất cả các bước đều idempotent — chạy lại không hỏng.
# =============================================================
set -euo pipefail

# ── Màu sắc terminal ──────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'
ok()   { echo -e "${GREEN}[OK]${RESET} $*"; }
info() { echo -e "${CYAN}[--]${RESET} $*"; }
warn() { echo -e "${YELLOW}[!!]${RESET} $*"; }
fail() { echo -e "${RED}[FAIL]${RESET} $*"; exit 1; }
step() { echo -e "\n${BOLD}${CYAN}===> $*${RESET}"; }

# ── Biến cấu hình ────────────────────────────────────────────
APP_DIR="/var/www/cuulongmytuu"
UPLOADS_DIR="/var/lib/cuulongmytuu/uploads"
DB_NAME="cuulongmytuu"
DB_USER="cuulong"

# ── Bước 0: Kiểm tra .env ────────────────────────────────────
step "Kiểm tra .env"
ENV_FILE="$APP_DIR/.env"
if [ ! -f "$ENV_FILE" ]; then
  fail ".env không tồn tại tại $ENV_FILE\nHãy tạo file .env trước khi chạy script này."
fi

# Đọc biến từ .env — dùng grep/sed thay vì source để tránh lỗi $2a$ trong bcrypt hash
_env_get() {
  grep -E "^${1}=" "$ENV_FILE" | head -1 | sed -E "s|^${1}=||;s|^['\"]||;s|['\"]$||"
}
DATABASE_URL=$(_env_get DATABASE_URL)
REDIS_URL=$(_env_get REDIS_URL)
ADMIN_USERNAME=$(_env_get ADMIN_USERNAME)
ADMIN_PASSWORD_HASH=$(_env_get ADMIN_PASSWORD_HASH)
SESSION_SECRET=$(_env_get SESSION_SECRET)
NEXT_PUBLIC_SITE_URL=$(_env_get NEXT_PUBLIC_SITE_URL)

# Kiểm tra các biến bắt buộc
MISSING=()
[ -z "${DATABASE_URL:-}" ]        && MISSING+=("DATABASE_URL")
[ -z "${REDIS_URL:-}" ]           && MISSING+=("REDIS_URL")
[ -z "${ADMIN_USERNAME:-}" ]      && MISSING+=("ADMIN_USERNAME")
[ -z "${SESSION_SECRET:-}" ]      && MISSING+=("SESSION_SECRET")
[ -z "${NEXT_PUBLIC_SITE_URL:-}" ] && MISSING+=("NEXT_PUBLIC_SITE_URL")

# Kiểm tra giá trị placeholder chưa thay
[[ "${ADMIN_PASSWORD_HASH:-}" == *"REPLACE_WITH_BCRYPT_HASH"* ]] && MISSING+=("ADMIN_PASSWORD_HASH (vẫn là placeholder)")
[[ "${SESSION_SECRET:-}" == *"GENERATE_32"* ]]                   && MISSING+=("SESSION_SECRET (vẫn là placeholder)")

if [ ${#MISSING[@]} -gt 0 ]; then
  echo -e "${RED}[FAIL]${RESET} Các biến .env chưa được cấu hình đúng:"
  for v in "${MISSING[@]}"; do echo "  - $v"; done
  echo ""
  echo "Sinh SESSION_SECRET:"
  echo "  node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
  echo ""
  echo "Sinh ADMIN_PASSWORD_HASH:"
  echo "  node -e \"console.log(require('bcryptjs').hashSync('MatKhauCuaBan', 12))\""
  exit 1
fi
ok ".env hợp lệ"

# ── Bước 1: Cập nhật hệ thống ────────────────────────────────
step "Cập nhật hệ thống"
apt-get update -qq
apt-get upgrade -y -qq
apt-get install -y -qq curl git build-essential ufw
ok "Hệ thống đã cập nhật"

# ── Bước 2: Firewall ─────────────────────────────────────────
step "Cấu hình Firewall (UFW)"
ufw --force reset > /dev/null 2>&1 || true
ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
ok "UFW: SSH + Nginx mở, mọi thứ khác đóng"

# ── Bước 3: Node.js 22 LTS ───────────────────────────────────
step "Cài Node.js 22 LTS"
if ! command -v node &>/dev/null || [[ "$(node -e 'process.exit(parseInt(process.versions.node))')" -lt 20 ]]; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi
ok "Node $(node -v) | npm $(npm -v)"

# ── Bước 4: PM2 ──────────────────────────────────────────────
step "Cài PM2"
if ! command -v pm2 &>/dev/null; then
  npm install -g pm2
fi
if ! pm2 list 2>/dev/null | grep -q "pm2-logrotate"; then
  pm2 install pm2-logrotate 2>/dev/null || true
  pm2 set pm2-logrotate:max_size 10M 2>/dev/null || true
  pm2 set pm2-logrotate:retain 7 2>/dev/null || true
  pm2 set pm2-logrotate:compress true 2>/dev/null || true
fi
ok "PM2 $(pm2 -v)"

# ── Bước 5: PostgreSQL ───────────────────────────────────────
step "Cài & cấu hình PostgreSQL"
if ! command -v psql &>/dev/null; then
  apt-get install -y postgresql postgresql-contrib
fi
systemctl enable postgresql
systemctl start postgresql

# Trích password từ DATABASE_URL: postgresql://user:pass@host/db
DB_PASS=$(echo "$DATABASE_URL" | sed -E 's|postgresql://[^:]+:([^@]+)@.*|\1|')

# Tạo user + database nếu chưa có
sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" | grep -q 1 || \
  sudo -u postgres psql -c "CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASS';"

sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" | grep -q 1 || \
  sudo -u postgres psql -c "CREATE DATABASE $DB_NAME;"

sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
sudo -u postgres psql -c "ALTER DATABASE $DB_NAME OWNER TO $DB_USER;"
ok "PostgreSQL: database '$DB_NAME' + user '$DB_USER' sẵn sàng"

# ── Bước 6: Redis ────────────────────────────────────────────
step "Cài & cấu hình Redis"
if ! command -v redis-cli &>/dev/null; then
  apt-get install -y redis-server
fi

# Trích Redis password từ REDIS_URL
REDIS_PASS=$(echo "$REDIS_URL" | sed -E 's|redis://[^:]*:([^@]+)@.*|\1|')

REDIS_CONF="/etc/redis/redis.conf"
# bind chỉ localhost
sed -i 's/^bind .*/bind 127.0.0.1 ::1/' "$REDIS_CONF"
# đặt password
if grep -q "^requirepass " "$REDIS_CONF"; then
  sed -i "s|^requirepass .*|requirepass $REDIS_PASS|" "$REDIS_CONF"
else
  echo "requirepass $REDIS_PASS" >> "$REDIS_CONF"
fi
# giới hạn memory
grep -q "^maxmemory " "$REDIS_CONF" || echo "maxmemory 256mb" >> "$REDIS_CONF"
grep -q "^maxmemory-policy " "$REDIS_CONF" || echo "maxmemory-policy allkeys-lru" >> "$REDIS_CONF"

systemctl enable redis-server
systemctl restart redis-server
# Chờ Redis khởi động
sleep 2
redis-cli -a "$REDIS_PASS" ping | grep -q PONG && ok "Redis: PONG" || warn "Redis ping thất bại, kiểm tra log"

# ── Bước 7: Nginx ────────────────────────────────────────────
step "Cài & cấu hình Nginx"
if ! command -v nginx &>/dev/null; then
  apt-get install -y nginx certbot python3-certbot-nginx
fi

DOMAIN=$(echo "$NEXT_PUBLIC_SITE_URL" | sed -E 's|https?://||;s|/$||')

NGINX_CONF="/etc/nginx/sites-available/cuulongmytuu"
cat > "$NGINX_CONF" <<NGINXEOF
upstream nextjs {
  server 127.0.0.1:3000;
  keepalive 64;
}

limit_req_zone \$binary_remote_addr zone=api_zone:10m rate=30r/s;
limit_req_zone \$binary_remote_addr zone=login_zone:10m rate=2r/s;

server {
  listen 80;
  listen [::]:80;
  server_name $DOMAIN www.$DOMAIN;

  gzip on;
  gzip_vary on;
  gzip_proxied any;
  gzip_min_length 1024;
  gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;

  client_max_body_size 5M;
  proxy_read_timeout 30s;
  proxy_connect_timeout 10s;

  location /_next/static/ {
    proxy_pass http://nextjs;
    proxy_http_version 1.1;
    proxy_set_header Connection "";
    proxy_set_header Host \$host;
    add_header Cache-Control "public, max-age=31536000, immutable";
  }

  location /uploads/ {
    alias $UPLOADS_DIR/;
    expires 30d;
    add_header Cache-Control "public, max-age=2592000";
    try_files \$uri =404;
  }

  location = /api/auth/login {
    limit_req zone=login_zone burst=5 nodelay;
    proxy_pass http://nextjs;
    proxy_http_version 1.1;
    proxy_set_header Connection "";
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }

  location /api/ {
    limit_req zone=api_zone burst=50 nodelay;
    proxy_pass http://nextjs;
    proxy_http_version 1.1;
    proxy_set_header Connection "";
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }

  location / {
    proxy_pass http://nextjs;
    proxy_http_version 1.1;
    proxy_set_header Connection "";
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }
}
NGINXEOF

ln -sfn "$NGINX_CONF" /etc/nginx/sites-enabled/cuulongmytuu
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl enable nginx
systemctl restart nginx
ok "Nginx: domain $DOMAIN cấu hình xong (HTTP, chưa có SSL)"

# ── Bước 8: Thư mục uploads ──────────────────────────────────
step "Tạo thư mục uploads persistent"
mkdir -p "$UPLOADS_DIR"
chown -R "$USER:$USER" "$UPLOADS_DIR" 2>/dev/null || true
ok "Uploads dir: $UPLOADS_DIR"

# ── Bước 9: Symlink uploads trong public/ ────────────────────
step "Symlink public/uploads"
cd "$APP_DIR"
rm -rf public/uploads
ln -sfn "$UPLOADS_DIR" public/uploads
ok "public/uploads → $UPLOADS_DIR"

# ── Bước 10: Cài npm deps ────────────────────────────────────
step "Cài npm dependencies"
cd "$APP_DIR"
npm ci
ok "npm ci xong"

# ── Bước 11: Prisma generate + migrate ───────────────────────
step "Prisma generate + migrate"
cd "$APP_DIR"
npx prisma generate
npx prisma migrate deploy
ok "Database migrations áp dụng xong"

# ── Bước 12: Build Next.js ───────────────────────────────────
step "Build Next.js (production)"
cd "$APP_DIR"
npm run build
ok "Build xong"

# ── Bước 13: Bundle standalone ───────────────────────────────
step "Bundle standalone"
cd "$APP_DIR"
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/
rm -rf .next/standalone/public/uploads
ln -sfn "$UPLOADS_DIR" .next/standalone/public/uploads
ok "Standalone bundle sẵn sàng"

# ── Bước 14: Tạo logs dir + start PM2 ───────────────────────
step "Khởi động PM2"
cd "$APP_DIR"
mkdir -p logs
if pm2 list | grep -q "cuulongmytuu"; then
  pm2 reload cuulongmytuu
else
  pm2 start ecosystem.config.cjs
fi
pm2 save

# PM2 autostart on reboot
PM2_STARTUP=$(pm2 startup systemd -u root --hp /root 2>&1 | grep "^sudo" || true)
if [ -n "$PM2_STARTUP" ]; then
  eval "$PM2_STARTUP"
fi
ok "PM2 chạy và đã cấu hình autostart"

# ── Bước 15: Health check ────────────────────────────────────
step "Health check"
sleep 5
HEALTH=$(curl -fsS http://localhost:3000/api/health 2>/dev/null || echo "{}")
echo "  $HEALTH"
if echo "$HEALTH" | grep -q '"ok":true'; then
  ok "App đang chạy: http://localhost:3000"
else
  warn "Health check trả kết quả không như kỳ vọng — kiểm tra: pm2 logs cuulongmytuu"
fi

# ── Hoàn thành ───────────────────────────────────────────────
echo ""
echo -e "${GREEN}${BOLD}============================================"
echo "  SETUP HOÀN THÀNH!"
echo "============================================${RESET}"
echo ""
echo -e "  App đang chạy:  ${CYAN}http://$DOMAIN${RESET}"
echo -e "  Admin panel:    ${CYAN}http://$DOMAIN/admin${RESET}"
echo ""
echo -e "${YELLOW}Bước tiếp theo — SSL (Let's Encrypt):${RESET}"
echo "  certbot --nginx -d $DOMAIN -d www.$DOMAIN"
echo ""
echo -e "${YELLOW}Kiểm tra logs:${RESET}"
echo "  pm2 logs cuulongmytuu"
echo ""
