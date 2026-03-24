import { ImageResponse } from 'next/og'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'edge'
export const size = { width: 1200, height: 630 }

export default async function Image({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: property } = await supabase
    .from('properties')
    .select('title, price_etb, rent_per_month_etb, listing_intent, city, cover_image_url, bedrooms, property_type')
    .eq('id', params.id)
    .single()

  const price = property?.listing_intent === 'rent' ? property?.rent_per_month_etb : property?.price_etb
  const priceStr = price ? `ETB ${(price / 1000000).toFixed(1)}M` : ''

  return new ImageResponse(
    <div style={{ display: 'flex', width: '100%', height: '100%', background: '#0d2318', position: 'relative' }}>
      {property?.cover_image_url && (
        <img src={property.cover_image_url} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3 }}/>
      )}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(13,35,24,0.95) 50%, rgba(13,35,24,0.6))' }}/>
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 80px', width: '100%' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {['#078930','#FCDD09','#DA121A'].map(c => (
            <div key={c} style={{ width: 40, height: 4, borderRadius: 2, background: c }}/>
          ))}
        </div>
        <div style={{ fontSize: 18, color: '#4ade80', fontWeight: 600, marginBottom: 12 }}>
          {property?.listing_intent === 'rent' ? 'For Rent' : 'For Sale'} · {property?.city || 'Addis Ababa'}
        </div>
        <div style={{ fontSize: 48, fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: 20, maxWidth: 700 }}>
          {property?.title || 'Property Listing'}
        </div>
        {priceStr && (
          <div style={{ fontSize: 36, fontWeight: 800, color: '#4ade80' }}>{priceStr}</div>
        )}
        <div style={{ position: 'absolute', bottom: 40, right: 80, fontSize: 20, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
          Habesha Homes
        </div>
      </div>
    </div>
  )
}
