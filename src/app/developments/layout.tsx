import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'New Developments in Ethiopia — Off-Plan & Under Construction Properties',
  description: 'Browse new real estate developments and off-plan projects across Ethiopia. Find apartments, condominiums and mixed-use projects in Addis Ababa — Bole, CMC, Kazanchis and more. View floor plans, pricing and availability.',
  keywords: [
    'new developments Ethiopia',
    'off-plan properties Addis Ababa',
    'new apartments Ethiopia',
    'under construction properties Addis Ababa',
    'real estate developments Ethiopia',
    'new condominiums Addis Ababa',
    'property investment Ethiopia',
    'developer projects Ethiopia',
    'ቤት ልማት አዲስ አበባ',
  ],
  openGraph: {
    title: 'New Developments in Ethiopia — Habesha Properties',
    description: 'Browse new real estate developments and off-plan projects across Ethiopia. View floor plans, pricing and unit availability.',
    type: 'website',
    siteName: 'Habesha Properties',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'New Developments in Ethiopia — Habesha Properties',
    description: 'Off-plan and under-construction property projects in Addis Ababa and across Ethiopia.',
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_APP_URL || 'https://habeshaproperties.com'}/developments`,
  },
}

export default function DevelopmentsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
