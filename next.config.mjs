/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  typescript: {
    ignoreBuildErrors: false,
  },

  images: {
    // Serve uploaded files exactly as-is. This is important for VPS standalone
    // deployments where uploads live under standalone/public/uploads.
    unoptimized: true,
  },

  turbopack: {
    root: process.cwd(),
  },

  async redirects() {
    return [
      {
        source: '/bang-gia',
        destination: '/san-pham',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
