import type { Metadata, Viewport } from 'next'
import { Toaster } from 'react-hot-toast'
import { GoogleAnalytics } from '@next/third-parties/google'
import { cookies } from 'next/headers'
import { IntlProvider } from '@/components/providers/IntlProvider'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import './globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export const metadata: Metadata = {
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  title: { default: 'Habesha Properties — Buy, Sell & Rent Property in Ethiopia', template: '%s | Habesha Properties' },
  description: "Ethiopia's leading property marketplace. Find houses for sale and apartments for rent in Addis Ababa — Bole, CMC, Kazanchis, Megenagna, Ayat, Sarbet, Gerji, Lideta. AI fraud detection, valuations and Amharic support. ቤት ለሽያጭ እና ለኪራይ በአዲስ አበባ።",
  keywords: [
    // Core intent searches
    'houses for sale in Ethiopia',
    'apartments for rent Addis Ababa',
    'Ethiopian real estate',
    'Addis Ababa housing',
    'buy house Addis Ababa',
    'property for sale Ethiopia',
    'property for rent Ethiopia',
    'real estate Ethiopia',
    // Neighborhoods
    'Bole apartments for sale',
    'Bole apartments for rent',
    'CMC houses Addis Ababa',
    'Kazanchis property',
    'Megenagna apartments',
    'Ayat real estate',
    'Sarbet houses',
    'Gerji apartments',
    'Lideta property',
    'Piassa real estate',
    // Diaspora
    'buy property in Ethiopia from abroad',
    'Ethiopian diaspora real estate',
    'invest in Ethiopian property',
    'diaspora housing Ethiopia',
    'Ethiopia property investment',
    // Property types
    'apartments Ethiopia',
    'villas for sale Addis Ababa',
    'land for sale Ethiopia',
    'commercial property Addis Ababa',
    'condominiums Ethiopia',
    // Amharic
    'ቤት ለሽያጭ',
    'ቤት ለኪራይ',
    'አዲስ አበባ ቤት',
    'ቦሌ ቤት',
    'ኮንዶሚኒየም ለሽያጭ',
    'ኪራይ ቤት አዲስ አበባ',
    // Brand
    'Habesha Properties',
    'habeshaproperties.com',
  ],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://habeshaproperties.com'),
  openGraph: {
    title: 'Habesha Properties — Buy, Sell & Rent Property in Ethiopia',
    description: "Ethiopia's leading property marketplace. Houses for sale and apartments for rent in Addis Ababa — Bole, CMC, Kazanchis, Megenagna, Ayat and more. AI-powered search.",
    type: 'website',
    locale: 'en_US',
    siteName: 'Habesha Properties',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Habesha Properties — Ethiopian Real Estate' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Habesha Properties — Buy, Sell & Rent Property in Ethiopia',
    description: "Find houses for sale and apartments for rent in Addis Ababa. AI fraud detection, valuations and Amharic support.",
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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies()
  const raw = cookieStore.get('NEXT_LOCALE')?.value
  const locale = ['en', 'am'].includes(raw || '') ? (raw as string) : 'en'
  const messages = (await import(`../../messages/${locale}.json`)).default

  return (
    <html lang={locale}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://api.mapbox.com/mapbox-gl-js/v3.6.0/mapbox-gl.css" rel="stylesheet" />
      </head>
      <body>
        <IntlProvider locale={locale} messages={messages}>
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
        </IntlProvider>
      </body>
      {process.env.NEXT_PUBLIC_GA_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
      )}
    </html>
  )
}
