import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://habeshaproperties.com'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const supabase = createClient()
  const { data: p } = await supabase
    .from('properties')
    .select('title, description, price_etb, rent_per_month_etb, listing_intent, city, property_type, bedrooms, cover_image_url, neighborhood:neighborhoods(name)')
    .eq('id', params.id)
    .single()

  if (!p) {
    return {
      title: 'Property Listing',
      description: "View property details on Habesha Properties, Ethiopia's leading real estate marketplace.",
    }
  }

  const neighborhood = (p.neighborhood as any)?.name as string | undefined
  const city = p.city || 'Addis Ababa'
  const location = [neighborhood, city].filter(Boolean).join(', ')
  const intent = p.listing_intent === 'rent' ? 'for Rent' : 'for Sale'
  const price = p.listing_intent === 'rent' ? p.rent_per_month_etb : p.price_etb
  const priceStr = price ? `ETB ${Number(price).toLocaleString()}` : ''
  const type = p.property_type
    ? p.property_type.charAt(0).toUpperCase() + p.property_type.slice(1)
    : 'Property'
  const beds = p.bedrooms ? `${p.bedrooms}-Bedroom ` : ''

  const seoTitle = p.title
    ? `${p.title} — ${location}`
    : `${beds}${type} ${intent} in ${location}`

  const descParts = [
    `${beds}${type} ${intent} in ${location}.`,
    priceStr ? `${priceStr}${p.listing_intent === 'rent' ? '/month' : ''}.` : '',
    p.description ? p.description.slice(0, 140) + (p.description.length > 140 ? '...' : '') : '',
    'View photos, contact the agent and get an AI valuation on Habesha Properties.',
  ]
  const description = descParts.filter(Boolean).join(' ')

  const images = p.cover_image_url
    ? [{ url: p.cover_image_url, width: 1200, height: 630, alt: seoTitle }]
    : []

  return {
    title: seoTitle,
    description,
    openGraph: {
      title: seoTitle,
      description,
      type: 'website',
      url: `${APP_URL}/agent/${params.id}`,
      images,
      siteName: 'Habesha Properties',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description,
      images: images.map(i => i.url),
    },
    alternates: {
      canonical: `${APP_URL}/agent/${params.id}`,
    },
  }
}

export default function AgentPropertyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
