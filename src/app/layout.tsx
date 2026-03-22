import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'Habesha Homes', template: '%s — Habesha Homes' },
  description: "Ethiopia's most intelligent property marketplace. Buy, sell, rent with Claude AI assistance in Amharic and English.",
  keywords: ['Ethiopian real estate', 'Addis Ababa property', 'ቤት ለሽያጭ', 'ቤት ለኪራይ'],
  openGraph: {
    title: 'Habesha Homes',
    description: "Ethiopia's AI-powered property marketplace",
    type: 'website',
  }
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
    </html>
  )
}
