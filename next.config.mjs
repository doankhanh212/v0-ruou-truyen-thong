/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  typescript: {
    ignoreBuildErrors: false,
  },

  images: {
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
      {
        source: '/trang-chu',
        destination: '/',
        permanent: true,
      },
      {
        source: '/trangchu',
        destination: '/',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
