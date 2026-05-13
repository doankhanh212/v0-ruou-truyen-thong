/** @type {import('next').NextConfig} */
const nextConfig = {
  // Build output: standalone bundle for compact PM2/Docker deploys.
  // Generates .next/standalone with only the deps the server actually uses.
  output: 'standalone',

  // TypeScript errors must fail the build in production.
  typescript: {
    ignoreBuildErrors: false,
  },

  images: {
    // TẮT TỐI ƯU HÓA ẢNH CỦA NEXT.JS ĐỂ SỬA LỖI KHÔNG HIỂN THỊ ẢNH UPLOAD ĐỘNG TRÊN VPS
    unoptimized: true,
    
    // Các cấu hình dưới đây sẽ tạm thời bị vô hiệu hóa bởi unoptimized: true. 
    // Giữ lại để dùng sau này nếu đổi sang lưu ảnh trên CDN / AWS S3.
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      // Add external image hosts here if you ever serve from a CDN/storage bucket.
      // Example: { protocol: 'https', hostname: 'cdn.yourdomain.com' },
    ],
  },

  turbopack: {
    root: process.cwd(),
  },

  async redirects() {
    return [
      { source: '/bang-gia', destination: '/san-pham', permanent: true },
    ]
  },
}

export default nextConfig
// module.exports = nextConfig; 