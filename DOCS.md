# Rượu Truyền Thống — Tài liệu CMS

Hệ thống quản lý nội dung (CMS) cho website thương mại điện tử rượu truyền thống Việt Nam.
Viết bằng **Next.js 16 (App Router) + Prisma + PostgreSQL + Redis**.

---

## Mục lục

1. [Tổng quan tính năng](#1-tổng-quan-tính-năng)
2. [Kiến trúc kỹ thuật](#2-kiến-trúc-kỹ-thuật)
3. [Cài đặt môi trường dev (local)](#3-cài-đặt-môi-trường-dev-local)
4. [Hướng dẫn dùng admin](#4-hướng-dẫn-dùng-admin)
5. [Setup VPS Ubuntu 24.04 từ đầu](#5-setup-vps-ubuntu-2404-từ-đầu)
6. [Triển khai production](#6-triển-khai-production)
7. [Quy trình deploy lần sau](#7-quy-trình-deploy-lần-sau)
8. [Backup & monitoring](#8-backup--monitoring)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Tổng quan tính năng

### Frontend (khách hàng truy cập)
- **Trang chủ** `/` — banner carousel auto-slide, sản phẩm nổi bật, social proof
- **Sản phẩm** `/san-pham` — danh sách + filter danh mục + search
- **Chi tiết sản phẩm** `/san-pham/[slug]` — ảnh, mô tả, giá, nút Chat Zalo
- **Tin tức** `/news` — list bài viết với featured post + grid 3 cột
- **Chi tiết tin tức** `/news/[slug]` — hero image + nội dung + related products + related posts
- **Giới thiệu** `/gioi-thieu` — nội dung tĩnh quản lý qua admin (có template fallback đẹp)
- **Liên hệ** `/lien-he` — thông tin liên hệ + giờ làm việc + CTA
- **Chatbot AI** — trợ lý AI dùng OpenRouter (Llama 3.3 / Gemma / GPT-OSS), trả lời theo dữ liệu thực có trên web. Mỗi tab khách hàng độc lập, không lẫn lộn.
- **Floating buttons** — nút Zalo + gọi điện cố định góc phải dưới
- **Tracking** — page views, click Zalo, click Call lưu vào DB

### Admin panel `/admin`
- **Dashboard** — thống kê tổng quan + biểu đồ truy cập theo tháng (đường dừng ở ngày hiện tại, hover hiện tooltip chi tiết)
- **Sản phẩm** — CRUD đầy đủ, upload ảnh, gắn danh mục
- **Danh mục** — CRUD, sort order, kích hoạt/ẩn
- **Nội dung Section** — sửa text/ảnh các block trên trang chủ (hero badge, hero title, CTA labels...)
- **Banner** — quản lý ảnh carousel hero, hỗ trợ nhiều ảnh + sort order
- **Thư viện ảnh** — upload media chung
- **SEO Pages** — quản lý meta title/description/keywords/OG image cho từng slug
- **Quản lý trang tĩnh**:
  - **Tin tức / Blog** — list + edit fullscreen 2 cột với TipTap editor đầy đủ (font, size, color, line-height, table, image, HTML toggle)
  - **Giới thiệu** + **Liên hệ** — chỉnh sửa qua editor giống Tin tức
- **Chatbot AI** — trang nhập OpenRouter API key + bật/tắt + test key + hướng dẫn 4 bước
- **Chatbot Rules** — luật override gợi ý sản phẩm cho chatbot (priority-based)
- **Cài đặt** — thông tin doanh nghiệp: hotline, Zalo URL, địa chỉ, Google Analytics, Google Map
- **Tracking logs** — xem log truy cập thô

### Editor TipTap (dùng trong cả Posts & Pages)
- Bold, Italic, Underline, Strike, Code inline
- Heading H1/H2/H3, Paragraph
- Font family, Font size (12-64px), Line height (1.0-2.5)
- Color chữ + Highlight nền (10 màu chữ, 7 màu highlight)
- Bullet list, Ordered list, Blockquote, Horizontal rule
- Text align left/center/right
- Insert link, image (upload qua `/api/media`), table 3×3 resize
- **HTML toggle** — chuyển sang chế độ raw HTML khi cần code phức tạp
- Undo/Redo

---

## 2. Kiến trúc kỹ thuật

```
┌─────────────────────────────────────────────────────────────┐
│                      Khách / Admin                          │
└──────────────┬──────────────────────────────────────────────┘
               │ HTTPS
        ┌──────▼──────┐
        │    Nginx    │ ← rate limit lớp 1 (DDoS), SSL termination
        └──────┬──────┘
               │ HTTP keepalive
        ┌──────▼──────┐
        │  Next.js    │ ← App Router, RSC, Server Actions, /api/*
        │  (PM2 x N)  │   PM2 cluster mode, auto-restart
        └──┬─────┬────┘
           │     │
   ┌───────▼┐ ┌──▼──────┐
   │Postgres│ │  Redis  │ ← rate limit lớp 2, cache (banners, SEO, settings, chatbot context)
   │  15+   │ │   7+    │
   └────────┘ └─────────┘
```

### Stack chi tiết
- **Next.js 16.2** (App Router, Turbopack dev, output: `standalone`)
- **React 19**, **TypeScript strict**
- **Tailwind CSS 3.4** + **lucide-react** icons
- **Prisma 6.x** ORM với PostgreSQL
- **Redis** (ioredis) cho rate-limit + cache + dedup
- **iron-session** cho admin auth (cookie-based)
- **bcryptjs** hash password admin
- **sanitize-html** + **Zod** validate input
- **TipTap** (StarterKit + extensions) WYSIWYG editor
- **OpenRouter** cho chatbot AI (fallback qua nhiều free models)
- **PM2** process manager (cluster mode)

### Cấu trúc thư mục
```
app/
  (admin)/admin/...     # Layout admin riêng (sidebar + header)
  (site)/...            # Layout public (header + footer + floating buttons)
  api/
    admin/...           # Admin APIs (auth required)
    chatbot/{ai,status} # Chatbot endpoints
    products/...        # Public catalog APIs
    track/...           # Analytics tracking
components/
  admin/                # Components dành riêng admin (editor, table, form...)
  ui/                   # shadcn/ui primitives
  *.tsx                 # Public components (hero, footer, chatbot widget...)
lib/
  db.ts                 # Prisma singleton
  redis.ts              # Redis client (ioredis, fail-open)
  auth.ts               # iron-session helpers
  seo.ts                # SEO helpers
  sanitize-page-html.ts # Shared sanitize options
  chatbot-*.ts          # Chatbot AI logic
  ...
prisma/
  schema.prisma         # DB schema
  migrations/           # Auto-generated migrations
  seed.ts               # Seed dữ liệu mẫu
scripts/
  setup-vps.sh          # Setup VPS Ubuntu lần đầu
  deploy.sh             # Deploy lần sau (zero-downtime)
proxy.ts                # Next.js 16 proxy (auth guard cho /admin)
ecosystem.config.cjs    # PM2 config
```

---

## 3. Cài đặt môi trường dev (local)

### Yêu cầu
- **Node.js 20+** (khuyến nghị 22 LTS)
- **PostgreSQL 14+** đang chạy local
- **Redis** (optional cho dev — code fail-open nếu không có)
- **Git**

### Bước 1: Clone & cài deps
```bash
git clone <REPO_URL> ruou-truyen-thong
cd ruou-truyen-thong/v0-ruou-truyen-thong
npm install
```

### Bước 2: Tạo file `.env`
Copy từ `.env.example`:
```bash
cp .env.example .env
```

Chỉnh các giá trị:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/rttt_dev
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$2b$10$...            # bcrypt hash của password
SESSION_SECRET=                           # chuỗi random ≥ 32 ký tự
ZALO_PHONE=84902931119                    # số Zalo không có dấu +
NEXT_PUBLIC_SITE_URL=http://localhost:3000
REDIS_URL=redis://localhost:6379          # bỏ qua nếu chưa có Redis
```

Sinh `ADMIN_PASSWORD_HASH`:
```bash
node -e "console.log(require('bcryptjs').hashSync('YOUR_PASSWORD_HERE', 10))"
```

Sinh `SESSION_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Bước 3: Migrate DB + seed dữ liệu mẫu
```bash
npx prisma migrate dev
npx prisma db seed
```

### Bước 4: Chạy dev server
```bash
npm run dev
```

Mở `http://localhost:3000` (frontend), `http://localhost:3000/admin/login` (admin).

---

## 4. Hướng dẫn dùng admin

### Đăng nhập
1. Vào `/admin/login`
2. Username/password lấy từ `ADMIN_USERNAME` và password gốc đã hash trong `.env`

### Cấu hình lần đầu
1. **Cài đặt** (`/admin/settings`) → nhập hotline, Zalo URL, địa chỉ, fanpage URL
2. **SEO Pages** (`/admin/seo`) → tạo SEO meta cho `gioi-thieu`, `lien-he`, etc.
3. **Banner** (`/admin/banner`) → upload 1-5 ảnh banner trang chủ (khuyến nghị 1200×900 px)
4. **Danh mục** → tạo các nhóm sản phẩm
5. **Sản phẩm** → tạo sản phẩm và gắn vào danh mục
6. **Chatbot AI** (`/admin/chatbot-ai`) → nhập OpenRouter API key (xem hướng dẫn trong trang)

### Quản lý trang tĩnh
- **Tin tức** (`/admin/posts`) — bấm "+ Thêm bài viết" → editor fullscreen 2 cột (nội dung trái, ảnh đại diện + SEO + xuất bản phải)
- **Giới thiệu** (`/admin/pages/gioi-thieu`) và **Liên hệ** (`/admin/pages/lien-he`) — cùng editor 2 cột

### Chatbot AI
1. Tới `/admin/chatbot-ai`
2. Làm theo 4 bước hướng dẫn để lấy API key OpenRouter (miễn phí, không cần thẻ)
3. Dán key → bấm **Test & Lưu**
4. Widget AI ✨ xuất hiện ở góc trái dưới trang chủ
5. Widget tự ẩn nếu admin tắt hoặc chưa cấu hình — khách không thấy lỗi

---

## 5. Setup VPS Ubuntu 24.04 từ đầu

Yêu cầu: VPS Ubuntu 24.04 LTS với **≥ 2 vCPU, 2GB RAM, 20GB disk**.

### 5.1 Cập nhật hệ thống + firewall
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git build-essential ufw
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
```

### 5.2 Cài Node.js 22 LTS
```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node -v   # phải in v22.x
```

### 5.3 Cài PostgreSQL 16
```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable --now postgresql
```

Tạo database + user:
```bash
sudo -u postgres psql <<'EOF'
CREATE DATABASE rttt_prod;
CREATE USER rttt_user WITH ENCRYPTED PASSWORD 'CHANGE_ME_STRONG_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE rttt_prod TO rttt_user;
ALTER DATABASE rttt_prod OWNER TO rttt_user;
EOF
```

`DATABASE_URL` sẽ là:
```
postgresql://rttt_user:CHANGE_ME_STRONG_PASSWORD@localhost:5432/rttt_prod?connection_limit=5&pool_timeout=10
```

### 5.4 Cài Redis với password
```bash
sudo apt install -y redis-server
```

Sửa `/etc/redis/redis.conf`:
```conf
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

### 5.5 Cài Nginx + Certbot (SSL)
```bash
sudo apt install -y nginx certbot python3-certbot-nginx
sudo systemctl enable --now nginx
```

### 5.6 Cài PM2 + log rotate
```bash
sudo npm install -g pm2
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

---

## 6. Triển khai production

### 6.1 Clone code + uploads directory
```bash
sudo mkdir -p /var/www
sudo chown $USER:$USER /var/www
cd /var/www
git clone <YOUR_REPO_URL> rttt
cd rttt/v0-ruou-truyen-thong

# Persistent uploads ngoài thư mục code (để git pull không xoá ảnh)
sudo mkdir -p /var/lib/rttt/uploads
sudo chown -R $USER:$USER /var/lib/rttt/uploads
rm -rf public/uploads
ln -sfn /var/lib/rttt/uploads public/uploads

mkdir -p logs
```

### 6.2 Tạo `.env` production
```bash
cat > .env <<'EOF'
NODE_ENV=production

# DB — connection_limit để tránh exhaust pool dưới PM2 cluster
DATABASE_URL=postgresql://rttt_user:CHANGE_ME_STRONG_PASSWORD@localhost:5432/rttt_prod?connection_limit=5&pool_timeout=10

# Redis
REDIS_URL=redis://default:CHANGE_ME_REDIS_PASSWORD@localhost:6379

# Admin auth
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$2a$12$REPLACE_WITH_BCRYPT_HASH
SESSION_SECRET=GENERATE_32_RANDOM_CHARS_OR_MORE

# Business
ZALO_PHONE=84902931119
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# Chatbot AI — có thể để trống, admin nhập qua UI /admin/chatbot-ai
# OPENROUTER_API_KEY=sk-or-v1-...
EOF

chmod 600 .env
```

Sinh `ADMIN_PASSWORD_HASH` trên máy local (bcrypt):
```bash
node -e "console.log(require('bcryptjs').hashSync('YOUR_PASSWORD', 12))"
```

Sinh `SESSION_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 6.3 Cài deps + build
```bash
npm ci
npx prisma generate
npx prisma migrate deploy

# CHỈ LẦN ĐẦU — tạo dữ liệu mẫu. Bỏ qua nếu import DB từ chỗ khác.
# npx prisma db seed

npm run build

# Bundle standalone (Next.js không tự copy public + static)
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/

# Symlink uploads bên trong standalone
rm -rf .next/standalone/public/uploads
ln -sfn /var/lib/rttt/uploads .next/standalone/public/uploads
```

### 6.4 Khởi động PM2
```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup    # In ra 1 lệnh sudo — copy chạy nó để PM2 auto-start sau reboot
```

Kiểm tra:
```bash
pm2 status
pm2 logs rttt --lines 50
curl http://localhost:4271/api/health
# Mong đợi: {"ok":true,"checks":{"db":true,"redis":true,...}}
```

### 6.5 Nginx config
Tạo `/etc/nginx/sites-available/rttt`:

```nginx
upstream rttt_app {
  server 127.0.0.1:4271;
  keepalive 64;
}

# Rate limit zone (lớp DDoS đầu tiên trước khi vào Next.js)
limit_req_zone $binary_remote_addr zone=api_zone:10m rate=30r/s;
limit_req_zone $binary_remote_addr zone=login_zone:10m rate=2r/s;

server {
  listen 80;
  listen [::]:80;
  server_name yourdomain.com www.yourdomain.com;
  return 301 https://yourdomain.com$request_uri;
}

server {
  listen 443 ssl http2;
  listen [::]:443 ssl http2;
  server_name www.yourdomain.com;
  return 301 https://yourdomain.com$request_uri;
  # SSL certs Certbot sẽ tự chèn vào sau
}

server {
  listen 443 ssl http2;
  listen [::]:443 ssl http2;
  server_name yourdomain.com;

  # Compression
  gzip on;
  gzip_vary on;
  gzip_proxied any;
  gzip_min_length 1024;
  gzip_types text/plain text/css application/json application/javascript
             text/xml application/xml application/xml+rss text/javascript image/svg+xml;

  # Limits
  client_max_body_size 5M;
  proxy_read_timeout 30s;
  proxy_connect_timeout 10s;

  # Cache Next.js immutable assets — 1 năm
  location /_next/static/ {
    proxy_pass http://rttt_app;
    proxy_http_version 1.1;
    proxy_set_header Connection "";
    proxy_set_header Host $host;
    add_header Cache-Control "public, max-age=31536000, immutable";
  }

  # Phục vụ uploads trực tiếp từ Nginx (nhanh hơn qua Next.js)
  location /uploads/ {
    alias /var/lib/rttt/uploads/;
    expires 30d;
    add_header Cache-Control "public, max-age=2592000";
    try_files $uri =404;
  }

  # Login: rate limit chặt hơn
  location = /api/auth/login {
    limit_req zone=login_zone burst=5 nodelay;
    proxy_pass http://rttt_app;
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
    proxy_pass http://rttt_app;
    proxy_http_version 1.1;
    proxy_set_header Connection "";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    # Cho phép streaming response (chatbot AI)
    proxy_buffering off;
    proxy_cache off;
  }

  # Tất cả phần còn lại
  location / {
    proxy_pass http://rttt_app;
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
sudo ln -sf /etc/nginx/sites-available/rttt /etc/nginx/sites-enabled/rttt
sudo nginx -t
sudo systemctl reload nginx
```

### 6.6 Cài SSL Let's Encrypt
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Certbot sẽ:
- Tự chèn `ssl_certificate` lines vào nginx config
- Tự setup cron auto-renew

Test renew:
```bash
sudo certbot renew --dry-run
```

---

## 7. Quy trình deploy lần sau

Tạo file `/var/www/rttt/v0-ruou-truyen-thong/scripts/deploy.sh` (nếu chưa có):

```bash
#!/bin/bash
set -euo pipefail
cd /var/www/rttt/v0-ruou-truyen-thong

git pull --ff-only

npm ci
npx prisma migrate deploy
npm run build

# Re-bundle standalone
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/
rm -rf .next/standalone/public/uploads
ln -sfn /var/lib/rttt/uploads .next/standalone/public/uploads

# Zero-downtime reload
pm2 reload rttt

# Health check
sleep 3
curl -fsS http://localhost:4271/api/health || (echo "HEALTH FAIL"; exit 1)
echo "Deploy OK"
```

```bash
chmod +x scripts/deploy.sh
```

Mỗi lần đẩy code mới:
```bash
ssh user@vps "cd /var/www/rttt/v0-ruou-truyen-thong && ./scripts/deploy.sh"
```

---

## 8. Backup & monitoring

### 8.1 Backup tự động hàng ngày
Tạo `/etc/cron.daily/rttt-backup` (chạy `sudo`):

```bash
#!/bin/bash
set -euo pipefail
TS=$(date +%Y%m%d-%H%M)
BACKUP_DIR=/var/backups/rttt
mkdir -p "$BACKUP_DIR"

# Database
PGPASSWORD=CHANGE_ME_STRONG_PASSWORD pg_dump \
  -h localhost -U rttt_user rttt_prod \
  | gzip > "$BACKUP_DIR/db-$TS.sql.gz"

# Uploads (ảnh khách hàng)
tar -czf "$BACKUP_DIR/uploads-$TS.tar.gz" -C /var/lib/rttt uploads/

# Giữ 14 ngày gần nhất
find "$BACKUP_DIR" -name "*.gz" -mtime +14 -delete
```

```bash
sudo chmod +x /etc/cron.daily/rttt-backup
sudo /etc/cron.daily/rttt-backup   # Test ngay
```

**Khuyến nghị**: đẩy backup off-site (Backblaze B2, Cloudflare R2, S3). Khi VPS chết, bạn vẫn có data.

### 8.2 Monitoring miễn phí
- **UptimeRobot** — ping `https://yourdomain.com/api/health` mỗi 5 phút, alert qua email/Telegram khi xuống
- **PM2 logs** — `pm2 logs rttt` (đã rotate sẵn)
- **Nginx access log** — `sudo tail -f /var/log/nginx/access.log`
- **Postgres slow queries** — bật log_min_duration_statement = 1000ms trong `/etc/postgresql/16/main/postgresql.conf`

---

## 9. Troubleshooting

| Triệu chứng | Nguyên nhân thường gặp | Fix |
|---|---|---|
| `/api/health` trả `db:false` | Sai `DATABASE_URL` hoặc Postgres chưa chạy | `sudo systemctl status postgresql` |
| `/api/health` trả `redis:false` | Sai password trong `REDIS_URL` hoặc Redis chưa chạy | `redis-cli -a YOUR_PASS ping` |
| Trang load chậm 2-4s | Redis xuống → cache fallthrough | Check `pm2 logs` xem có `[redis]` errors |
| Ảnh upload không hiển thị | Symlink `public/uploads` chưa được tạo trong `.next/standalone/public/` | Chạy lại `ln -sfn /var/lib/rttt/uploads .next/standalone/public/uploads` |
| Build fail "NEXT_PUBLIC_SITE_URL is required" | `.env` chưa có dòng này, hoặc `NODE_ENV=production` chưa được set | Bổ sung vào `.env` |
| 500 trên `/admin/login` | `ADMIN_PASSWORD_HASH` không phải bcrypt hash hợp lệ | Hash lại bằng `bcryptjs.hashSync(...)` |
| Mỗi user chỉ login được 1 lần (bị logout mỗi reload) | `SESSION_SECRET` khác nhau giữa các PM2 worker | Set trong `.env` chứ KHÔNG phải trong `ecosystem.config.cjs` |
| Chatbot AI báo "không khả dụng" cho admin | Chưa cấu hình API key | Vào `/admin/chatbot-ai` nhập key OpenRouter |
| Chatbot AI báo 429 ngay | Provider model free đang bị rate limit upstream | Code đã tự fallback qua các model khác. Đợi vài phút |
| Nginx 502 Bad Gateway | PM2 app crashed hoặc port sai | `pm2 status` xem state, `pm2 logs` xem lỗi |
| Banner upload >3MB bị fail | Limit `client_max_body_size 5M` trong Nginx | Tăng giới hạn nếu cần |

---

## Checklist trước khi tin "đã deploy xong"

- [ ] `curl https://yourdomain.com/api/health` trả `{"ok":true,"db":true,"redis":true}`
- [ ] Trang chủ hiển thị banner + sản phẩm thực
- [ ] `/admin/login` login được, `/admin/products` mở được
- [ ] Upload ảnh ở admin → file nằm trong `/var/lib/rttt/uploads/`
- [ ] Sản phẩm vừa upload hiển thị trên trang chủ trong vòng 60s
- [ ] DevTools → Network: ảnh trả `Content-Type: image/avif` hoặc `image/webp` (Next.js tự convert)
- [ ] DevTools → Network: response HTML/JSON có `Content-Encoding: gzip`
- [ ] `/sitemap.xml` chứa URL `https://yourdomain.com/...` (KHÔNG phải localhost)
- [ ] SSL grade A+ trên `https://www.ssllabs.com/ssltest/`
- [ ] `pm2 status` tất cả workers `online`, không restart liên tục
- [ ] Chatbot AI bật được, trả lời tiếng Việt mượt
- [ ] Test responsive trên Chrome DevTools mobile mode (iPhone, Pixel, iPad)

---

## Tham khảo nhanh

| File / Path | Mục đích |
|---|---|
| `prisma/schema.prisma` | Schema database |
| `lib/admin/menu.ts` | Menu sidebar admin (1 chỗ duy nhất) |
| `lib/seo.ts` | SITE_NAME, helpers SEO |
| `lib/site-content.ts` | Thông tin công ty (companyInfo) |
| `lib/chatbot-ai-config.ts` | Cấu hình OpenRouter + danh sách model |
| `lib/chatbot-context.ts` | Build context cho AI từ DB |
| `lib/sanitize-page-html.ts` | Options sanitize HTML (dùng chung cho posts/pages) |
| `proxy.ts` | Auth guard cho `/admin/*` |
| `ecosystem.config.cjs` | PM2 config (cluster mode, port 4271) |
