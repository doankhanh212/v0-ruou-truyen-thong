/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
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
