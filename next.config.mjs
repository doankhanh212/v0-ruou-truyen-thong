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
        source: '/news',
        destination: '/tin-tuc',
        permanent: true,
      },
      {
        source: '/news/:slug',
        destination: '/tin-tuc/:slug',
        permanent: true,
      },
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
