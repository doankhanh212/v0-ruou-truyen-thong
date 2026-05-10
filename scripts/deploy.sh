#!/bin/bash
# Deploy script cho Ubuntu VPS
# Chạy từ thư mục gốc project: bash scripts/deploy.sh
set -euo pipefail

cd /var/www/cuulongmytuu

echo "==> Cài dependencies..."
npm ci

echo "==> Generate Prisma client..."
npx prisma generate

echo "==> Migrate database..."
npx prisma migrate deploy

echo "==> Build Next.js..."
npm run build

echo "==> Bundle standalone..."
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/

echo "==> Symlink uploads..."
rm -rf .next/standalone/public/uploads
ln -sfn /var/lib/cuulongmytuu/uploads .next/standalone/public/uploads

echo "==> Reload PM2 (zero-downtime)..."
pm2 reload cuulongmytuu

echo "==> Health check..."
sleep 3
curl -fsS http://localhost:3000/api/health || (echo "HEALTH FAIL" && exit 1)

echo ""
echo "Deploy OK!"
