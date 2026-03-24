/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  env: {
    NEXT_PUBLIC_USD_TO_ETB_RATE: process.env.USD_TO_ETB_RATE || '56.5',
  },
}

module.exports = nextConfig