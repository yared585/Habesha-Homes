import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://habeshaproperties.com'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const supabase = createClient()
  const { data: p } = await supabase
    .from('projects')
    .select('name, description, city, location, cover_image_url, developer_name, total_units, available_units, min_price_etb, max_price_etb, status')
    .eq('id', params.id)
    .single()

  if (!p) {
    return {
      title: 'New Development',
      description: "View new property development details on Habesha Properties, Ethiopia's leading real estate marketplace.",
    }
  }

  const city = p.city || p.location || 'Addis Ababa'
  const devName = p.developer_name ? ` by ${p.developer_name}` : ''
  const seoTitle = p.name
    ? `${p.name}${devName} — New Development in ${city}`
    : `New Development in ${city}`

  const priceRange = p.min_price_etb
    ? `Starting from ETB ${Number(p.min_price_etb).toLocaleString()}.`
    : ''
  const units = p.available_units != null
    ? `${p.available_units} units available.`
    : ''

  const descParts = [
    p.description ? p.description.slice(0, 160) + (p.description.length > 160 ? '...' : '') : `New real estate development in ${city}, Ethiopia.`,
    priceRange,
    units,
    'View floor plans, unit availability and contact the developer on Habesha Properties.',
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
      url: `${APP_URL}/project/${params.id}`,
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
      canonical: `${APP_URL}/project/${params.id}`,
    },
  }
}

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
