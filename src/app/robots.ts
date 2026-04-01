import { MetadataRoute } from 'next'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://habeshaproperties.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/dashboard', '/profile', '/api/'],
      }
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
  }
}
