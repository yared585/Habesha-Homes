import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import { GoogleAnalytics } from '@next/third-parties/google'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'Habesha Properties — Ethiopian Property Marketplace', template: '%s | Habesha Properties' },
  description: "Ethiopia's smartest property marketplace. Buy, sell and rent homes in Addis Ababa and across Ethiopia. AI fraud detection, valuations, and Amharic support.",
  keywords: [
    'Ethiopian real estate', 'Addis Ababa property', 'Ethiopia homes for sale',
    'apartments for rent Addis Ababa', 'ቤት ለሽያጭ', 'ቤት ለኪራይ', 'አዲስ አበባ ቤት',
    'Bole apartments', 'Ethiopia property market', 'diaspora real estate Ethiopia',
    'buy house Ethiopia', 'Ethiopian property investment'
  ],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://habeshaproperties.com'),
  openGraph: {
    title: 'Habesha Properties — Ethiopian Property Marketplace',
    description: "Buy, sell and rent properties across Ethiopia. AI-powered fraud detection and valuations.",
    type: 'website',
    locale: 'en_US',
    siteName: 'Habesha Properties',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Habesha Properties' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Habesha Properties — Ethiopian Property Marketplace',
    description: "Buy, sell and rent properties across Ethiopia with AI assistance.",
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_APP_URL || 'https://habeshaproperties.com',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://api.mapbox.com/mapbox-gl-js/v3.6.0/mapbox-gl.css" rel="stylesheet" />
      </head>
      <body>
        <Navbar />
        <main style={{ minHeight: '100vh' }}>{children}</main>
        <Footer />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: 'var(--font-body)',
              fontSize: 14,
              borderRadius: 'var(--r-md)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-md)',
              background: 'var(--surface)',
              color: 'var(--text)',
            },
            success: { iconTheme: { primary: 'var(--green)', secondary: '#fff' } },
          }}
        />
      </body>
      {process.env.NEXT_PUBLIC_GA_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
      )}
    </html>
  )
}
