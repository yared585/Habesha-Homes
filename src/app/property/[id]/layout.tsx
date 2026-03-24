import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://habesha-homes.vercel.app'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const supabase = createClient()
  const { data: p } = await supabase
    .from('properties')
    .select('*, neighborhood:neighborhoods(name)')
    .eq('id', params.id)
    .single()

  if (!p) return { title: 'Property Not Found' }

  const price = p.listing_intent === 'rent' ? p.rent_per_month_etb : p.price_etb
  const priceStr = price ? `ETB ${price.toLocaleString()}` : ''
  const neighborhood = (p as any).neighborhood?.name || p.city
  const intent = p.listing_intent === 'rent' ? 'for Rent' : 'for Sale'
  const beds = p.bedrooms ? `${p.bedrooms} bedroom ` : ''
  const type = p.property_type || 'property'

  const title = `${p.title} — ${priceStr}`
  const description = `${beds}${type} ${intent} in ${neighborhood}, ${p.city}. ${priceStr}${p.listing_intent === 'rent' ? '/month' : ''}. ${p.size_sqm ? `${p.size_sqm}m². ` : ''}${p.description?.slice(0, 120) || 'View details on Habesha Homes.'}`

  return {
    title,
    description,
    keywords: [
      `${type} ${intent} ${neighborhood}`,
      `${p.city} real estate`,
      `${neighborhood} property`,
      `Ethiopia ${type}`,
      `ቤት ${p.listing_intent === 'rent' ? 'ለኪራይ' : 'ለሽያጭ'}`,
      `${neighborhood} ቤት`,
    ],
    openGraph: {
      title,
      description,
      type: 'article',
      url: `${APP_URL}/property/${params.id}`,
      images: [
        {
          url: p.cover_image_url || `${APP_URL}/og-image.png`,
          width: 1200,
          height: 630,
          alt: p.title,
        }
      ],
      siteName: 'Habesha Homes',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [p.cover_image_url || `${APP_URL}/og-image.png`],
    },
    alternates: {
      canonical: `${APP_URL}/property/${params.id}`,
    },
  }
}

export default function PropertyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
