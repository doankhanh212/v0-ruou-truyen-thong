# Deploy Cửu Long Mỹ Tửu lên VPS production

Hướng dẫn dành cho VPS Ubuntu 22.04 LTS (2 vCPU / 2GB RAM trở lên).
Mọi bước đều idempotent — chạy lại không hỏng gì.

---

## 0. Chuẩn bị VPS

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git build-essential ufw
```

Firewall:
```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

---

## 1. Cài runtime

```bash
# Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# PostgreSQL 15
sudo apt install -y postgresql postgresql-contrib

# Redis (BẮT BUỘC — rate limit + cache phụ thuộc)
sudo apt install -y redis-server

# Nginx + Certbot
sudo apt install -y nginx certbot python3-certbot-nginx

# PM2 + log rotate
sudo npm i -g pm2
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

---

## 2. PostgreSQL setup

```bash
sudo -u postgres psql <<'EOF'
CREATE DATABASE cuulongmytuu;
CREATE USER cuulong WITH ENCRYPTED PASSWORD 'CHANGE_ME_STRONG_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE cuulongmytuu TO cuulong;
ALTER DATABASE cuulongmytuu OWNER TO cuulong;
EOF
```

`DATABASE_URL` sẽ là:
```
postgresql://cuulong:CHANGE_ME_STRONG_PASSWORD@localhost:5432/cuulongmytuu?connection_limit=5&pool_timeout=10
```

---

## 3. Redis setup (đặt password)

Sửa `/etc/redis/redis.conf`:
```
bind 127.0.0.1 ::1
requirepass CHANGE_ME_REDIS_PASSWORD
maxmemory 256mb
maxmemory-policy allkeys-lru
```

```bash
sudo systemctl restart redis-server
sudo systemctl enable redis-server
```

`REDIS_URL` sẽ là:
```
redis://default:CHANGE_ME_REDIS_PASSWORD@localhost:6379
```

---

## 4. Persistent uploads directory

**QUAN TRỌNG**: ảnh khách hàng PHẢI nằm ngoài thư mục code, nếu không mỗi `git pull` + rebuild sẽ mất sạch.

```bash
sudo mkdir -p /var/lib/cuulongmytuu/uploads
sudo chown -R $USER:$USER /var/lib/cuulongmytuu/uploads
```

Sau khi clone repo (bước 6), tạo symlink:
```bash
cd /var/www/cuulongmytuu
rm -rf public/uploads
ln -sfn /var/lib/cuulongmytuu/uploads public/uploads
```

---

## 5. Tạo admin password hash

Trên máy local (hoặc VPS):
```bash
node -e "console.log(require('bcryptjs').hashSync(process.argv[1], 12))" 'YOUR_ADMIN_PASSWORD'
```
Copy chuỗi `$2a$12$...` cho biến `ADMIN_PASSWORD_HASH`.

---

## 6. Clone & cấu hình

```bash
sudo mkdir -p /var/www
sudo chown $USER:$USER /var/www
cd /var/www
git clone <YOUR_REPO_URL> cuulongmytuu
cd cuulongmytuu
```

Tạo `.env`:
```bash
cat > .env <<'EOF'
NODE_ENV=production

# Database — phải dùng connection_limit để tránh exhaust pool dưới PM2 cluster
DATABASE_URL=postgresql://cuulong:CHANGE_ME_STRONG_PASSWORD@localhost:5432/cuulongmytuu?connection_limit=5&pool_timeout=10

# Redis (BẮT BUỘC trong production)
REDIS_URL=redis://default:CHANGE_ME_REDIS_PASSWORD@localhost:6379

# Auth
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$2a$12$REPLACE_WITH_BCRYPT_HASH
SESSION_SECRET=GENERATE_32_RANDOM_CHARS_OR_MORE

# Business
ZALO_PHONE=84902931119
NEXT_PUBLIC_SITE_URL=https://cuulongmytuu.vn
EOF

chmod 600 .env
```

Sinh `SESSION_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 7. Symlink uploads + tạo logs dir

```bash
rm -rf public/uploads
ln -sfn /var/lib/cuulongmytuu/uploads public/uploads
mkdir -p logs
```

---

## 8. Cài deps + migrate DB + build

```bash
npm ci
npx prisma generate
npx prisma migrate deploy

# (Chỉ chạy lần đầu để tạo dữ liệu mẫu — bỏ qua nếu đã có DB production)
# npx prisma db seed

npm run build
```

Build thành công sẽ có `.next/standalone/`. Copy static + public sang đó để PM2 chạy được:
```bash
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/
```

Tạo symlink uploads bên trong standalone (để Next phục vụ ảnh đã upload):
```bash
rm -rf .next/standalone/public/uploads
ln -sfn /var/lib/cuulongmytuu/uploads .next/standalone/public/uploads
```

---

## 9. Khởi động với PM2

```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup     # in ra một lệnh sudo, copy chạy nó để PM2 auto-start sau reboot
```

Kiểm tra:
```bash
pm2 status
pm2 logs cuulongmytuu --lines 50
curl http://localhost:4271/api/health
```

Mong đợi: `{"ok":true,"checks":{"db":true,"redis":true,...}}`

---

## 10. Nginx + SSL

`/etc/nginx/sites-available/cuulongmytuu`:

```nginx
upstream nextjs {
  server 127.0.0.1:4271;
  keepalive 64;
}

# Rate limit zone (song song với rate-limit Redis trong app, đây là lớp DDoS đầu tiên)
limit_req_zone $binary_remote_addr zone=api_zone:10m rate=30r/s;
limit_req_zone $binary_remote_addr zone=login_zone:10m rate=2r/s;

server {
  listen 80;
  listen [::]:80;
  server_name cuulongmytuu.vn www.cuulongmytuu.vn;
  return 301 https://cuulongmytuu.vn$request_uri;
}

server {
  listen 443 ssl http2;
  listen [::]:443 ssl http2;
  server_name www.cuulongmytuu.vn;
  return 301 https://cuulongmytuu.vn$request_uri;

  # SSL certs (Certbot sẽ chèn sau)
}

server {
  listen 443 ssl http2;
  listen [::]:443 ssl http2;
  server_name cuulongmytuu.vn;

  # Compression
  gzip on;
  gzip_vary on;
  gzip_proxied any;
  gzip_min_length 1024;
  gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;

  # Limits
  client_max_body_size 5M;
  proxy_read_timeout 30s;
  proxy_connect_timeout 10s;

  # Cache Next.js immutable static assets — 1 năm
  location /_next/static/ {
    proxy_pass http://nextjs;
    proxy_http_version 1.1;
    proxy_set_header Connection "";
    proxy_set_header Host $host;
    add_header Cache-Control "public, max-age=31536000, immutable";
  }

  # Phục vụ uploads trực tiếp từ Nginx (nhanh hơn qua Next)
  location /uploads/ {
    alias /var/lib/cuulongmytuu/uploads/;
    expires 30d;
    add_header Cache-Control "public, max-age=2592000";
    try_files $uri =404;
  }

  # Login: rate limit chặt hơn ở Nginx
  location = /api/auth/login {
    limit_req zone=login_zone burst=5 nodelay;
    proxy_pass http://nextjs;
    proxy_http_version 1.1;
    proxy_set_header Connection "";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  # API
  location /api/ {
    limit_req zone=api_zone burst=50 nodelay;
    proxy_pass http://nextjs;
    proxy_http_version 1.1;
    proxy_set_header Connection "";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  # Tất cả phần còn lại
  location / {
    proxy_pass http://nextjs;
    proxy_http_version 1.1;
    proxy_set_header Connection "";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

Enable + reload:
```bash
sudo ln -s /etc/nginx/sites-available/cuulongmytuu /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

SSL (Let's Encrypt):
```bash
sudo certbot --nginx -d cuulongmytuu.vn -d www.cuulongmytuu.vn
```

Certbot sẽ tự edit nginx config thêm `ssl_certificate` lines. Sau đó nó set cron auto-renew.

---

## 11. Backup tự động

`/etc/cron.daily/cuulongmytuu-backup` (chạy `sudo`):

```bash
#!/bin/bash
set -euo pipefail
TS=$(date +%Y%m%d-%H%M)
BACKUP_DIR=/var/backups/cuulongmytuu
mkdir -p "$BACKUP_DIR"

# DB
PGPASSWORD=CHANGE_ME_STRONG_PASSWORD pg_dump \
  -h localhost -U cuulong cuulongmytuu \
  | gzip > "$BACKUP_DIR/db-$TS.sql.gz"

# Uploads
tar -czf "$BACKUP_DIR/uploads-$TS.tar.gz" -C /var/lib/cuulongmytuu uploads/

# Giữ 14 ngày
find "$BACKUP_DIR" -name "*.gz" -mtime +14 -delete
```

```bash
sudo chmod +x /etc/cron.daily/cuulongmytuu-backup
sudo /etc/cron.daily/cuulongmytuu-backup   # test ngay
```

Tốt hơn: đẩy backup lên storage off-site (Backblaze B2, Cloudflare R2). Sau cũng làm được.

---

## 12. Quy trình deploy lần sau

Tạo `scripts/deploy.sh` trên VPS:

```bash
#!/bin/bash
set -euo pipefail
cd /var/www/cuulongmytuu

git pull --ff-only

npm ci --omit=dev=false
npx prisma migrate deploy
npm run build

# Re-bundle standalone
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/
rm -rf .next/standalone/public/uploads
ln -sfn /var/lib/cuulongmytuu/uploads .next/standalone/public/uploads

# Zero-downtime reload
pm2 reload cuulongmytuu

# Health check
sleep 3
curl -fsS http://localhost:3000/api/health || (echo "HEALTH FAIL"; exit 1)
echo "Deploy OK"
```

```bash
chmod +x scripts/deploy.sh
```

Mỗi lần đẩy code: `ssh vps "cd /var/www/cuulongmytuu && ./scripts/deploy.sh"`.

---

## 13. Monitoring miễn phí

- **UptimeRobot** (free): ping `https://cuulongmytuu.vn/api/health` mỗi 5 phút, alert email/Telegram.
- **PM2 logs**: `pm2 logs cuulongmytuu` (đã rotate sẵn).
- **Nginx access**: `sudo tail -f /var/log/nginx/access.log`.

---

## Checklist verify sau deploy

- [ ] `curl https://cuulongmytuu.vn/api/health` trả `ok:true, db:true, redis:true`
- [ ] Trang chủ hiển thị banner + sản phẩm thực
- [ ] `/admin/login` login được, `/admin/products` mở được
- [ ] Upload ảnh ở admin → file nằm trong `/var/lib/cuulongmytuu/uploads/`
- [ ] Sản phẩm vừa upload hiển thị trên trang chủ trong vòng 60s
- [ ] DevTools → Network: ảnh trả về `Content-Type: image/avif` hoặc `image/webp` (không phải `image/jpeg` gốc)
- [ ] DevTools → Network: response có `Content-Encoding: gzip` cho HTML/JSON
- [ ] `/sitemap.xml` chứa URL `https://cuulongmytuu.vn/...` (KHÔNG phải localhost)
- [ ] Nginx SSL: A+ score trên `https://www.ssllabs.com/ssltest/`
- [ ] `pm2 status`: tất cả workers `online`, không restart liên tục

---

## Troubleshooting nhanh

| Triệu chứng | Nguyên nhân thường gặp |
|---|---|
| `/api/health` trả `db:false` | sai `DATABASE_URL` hoặc Postgres chưa chạy: `sudo systemctl status postgresql` |
| `/api/health` trả `redis:false` | sai password trong `REDIS_URL` hoặc Redis chưa chạy: `redis-cli -a PASSWORD ping` |
| Trang load chậm 2-4s | Redis xuống → cache fallthrough. Kiểm tra `pm2 logs` xem có `[redis]` errors |
| Ảnh upload mới không hiển thị | Symlink `public/uploads` chưa được tạo trong `.next/standalone/public/` |
| Build fail "NEXT_PUBLIC_SITE_URL is required" | `.env` chưa có dòng này, hoặc `NODE_ENV=production` chưa được set |
| 500 trên `/admin/login` | `ADMIN_PASSWORD_HASH` không phải bcrypt hash hợp lệ |
| Mỗi user chỉ login được 1 lần | `SESSION_SECRET` khác nhau giữa các PM2 worker → **set trong `.env` chứ không phải ecosystem.config.cjs** |
