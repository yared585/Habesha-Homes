import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'

export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  const supabase = createClient()
  const { data } = await supabase
    .from('properties')
    .select('title, description, cover_image_url, city, price_etb, price_usd, bedrooms, property_type')
    .eq('id', params.id)
    .single()

  if (!data) {
    return { title: 'Property Not Found' }
  }

  const desc = data.description?.slice(0, 155) ||
    `${data.bedrooms ? `${data.bedrooms}-bedroom ` : ''}${data.property_type} in ${data.city}. View photos, AI fraud check, and valuation on Habesha Homes.`

  return {
    title: data.title,
    description: desc,
    openGraph: {
      title: `${data.title} — Habesha Homes`,
      description: desc,
      images: data.cover_image_url ? [{ url: data.cover_image_url, width: 1200, height: 630 }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: data.title,
      description: desc,
      images: data.cover_image_url ? [data.cover_image_url] : [],
    },
  }
}

export default function PropertyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
