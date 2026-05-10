/** @type {import('next').NextConfig} */
const nextConfig = {
  // Build output: standalone bundle for compact PM2/Docker deploys.
  // Generates .next/standalone with only the deps the server actually uses.
  output: 'standalone',

  // TypeScript errors must fail the build in production.
  typescript: {
    ignoreBuildErrors: false,
  },

  // Image optimization via `sharp` (installed as dependency).
  // - Serves AVIF/WebP automatically based on Accept header.
  // - Resizes responsively per `sizes` attribute on each <Image>.
  // - 30-day cache on optimized output.
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      // Add external image hosts here if you ever serve from a CDN/storage bucket.
      // Example: { protocol: 'https', hostname: 'cdn.cuulongmytuu.vn' },
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
