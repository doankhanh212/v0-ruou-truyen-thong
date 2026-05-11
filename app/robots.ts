import type { MetadataRoute } from 'next'
import { absoluteUrl, getSiteUrl } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/*',
          '/api/',
          '/_next/',
          '/*?utm_*',
          '/*?gclid=*',
          '/*?fbclid=*',
          '/*?ref=*',
          '/*?preview=true',
          '/*?q=*',
        ],
      },
      {
        userAgent: 'GPTBot',
        disallow: '/',
      },
      {
        userAgent: 'CCBot',
        disallow: '/',
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: getSiteUrl(),
  }
}
