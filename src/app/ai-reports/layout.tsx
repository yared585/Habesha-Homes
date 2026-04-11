import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Property Reports — Fraud Check, Valuation & Contract Analysis',
  description: 'Use AI to protect your Ethiopian real estate transaction. Run title fraud checks, get instant property valuations, analyze contracts for hidden risks and research neighborhoods — all powered by AI, in English and Amharic.',
  keywords: [
    'property fraud check Ethiopia',
    'title deed verification Ethiopia',
    'AI property valuation Ethiopia',
    'contract analysis Ethiopia',
    'real estate fraud detection Addis Ababa',
    'property valuation Addis Ababa',
    'Ethiopian property title check',
    'land fraud Ethiopia',
    'AI real estate Ethiopia',
    'neighborhood report Addis Ababa',
  ],
  openGraph: {
    title: 'AI Property Reports — Habesha Properties',
    description: 'Fraud checks, valuations and contract analysis powered by AI for Ethiopian real estate. In English and Amharic.',
    type: 'website',
    siteName: 'Habesha Properties',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Property Reports — Habesha Properties',
    description: 'AI-powered fraud checks, property valuations and contract analysis for Ethiopian real estate.',
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_APP_URL || 'https://habeshaproperties.com'}/ai-reports`,
  },
}

export default function AIReportsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
