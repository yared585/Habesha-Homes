'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MapPin, Building2 } from 'lucide-react'
import { Badge } from '@/components/ui'
import type { Property } from '@/types'

interface Props {
  property: Property
}

export function PropertyCard({ property: p }: Props) {
  const [hov, setHov] = useState(false)
  const price = p.listing_intent === 'rent' ? p.rent_per_month_etb : p.price_etb

  return (
    <Link href={`/property/${p.id}`} style={{ textDecoration: 'none' }}>
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          background: '#fff', borderRadius: 16, overflow: 'hidden',
          border: '1px solid #eae9e4', transition: 'all .22s',
          boxShadow: hov ? '0 16px 48px rgba(0,0,0,0.12)' : '0 2px 8px rgba(0,0,0,0.04)',
          transform: hov ? 'translateY(-4px)' : 'none',
        }}
      >
        {/* Image */}
        <div style={{ height: 210, background: '#f0f0ec', position: 'relative', overflow: 'hidden' }}>
          {p.cover_image_url
            ? <img src={p.cover_image_url} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .4s', transform: hov ? 'scale(1.04)' : 'scale(1)' }}/>
            : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Building2 size={44} color="#d0cfc9"/></div>
          }
          {/* Top badges */}
          <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6 }}>
            {p.is_featured && <Badge color="green">Featured</Badge>}
            {p.title_verified && <span style={{ background: 'rgba(255,255,255,0.95)', color: '#15803d', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>✓ Verified</span>}
          </div>
          {/* Intent badge */}
          <div style={{ position: 'absolute', bottom: 12, right: 12, background: 'rgba(255,255,255,0.95)', borderRadius: 20, padding: '4px 10px', fontSize: 11, fontWeight: 700, color: p.listing_intent === 'rent' ? '#2563eb' : '#16a34a' }}>
            {p.listing_intent === 'rent' ? 'For Rent' : 'For Sale'}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '16px 18px' }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#111', marginBottom: 6, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {p.title}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#888', marginBottom: 12 }}>
            <MapPin size={12}/> {(p as any).neighborhood?.name || p.city}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: '#16a34a' }}>
              ETB {(price || 0).toLocaleString()}
            </span>
            {p.listing_intent === 'rent' && <span style={{ fontSize: 12, color: '#aaa' }}>/mo</span>}
            {p.price_usd && <span style={{ fontSize: 12, color: '#bbb' }}>≈ ${p.price_usd.toLocaleString()}</span>}
          </div>
          <div style={{ display: 'flex', gap: 14, fontSize: 13, color: '#666', paddingTop: 12, borderTop: '1px solid #f5f5f2' }}>
            {p.bedrooms && <span>{p.bedrooms} bed</span>}
            {p.bathrooms && <span>{p.bathrooms} bath</span>}
            {p.size_sqm && <span>{p.size_sqm}m²</span>}
          </div>
        </div>
      </div>
    </Link>
  )
}

// ── Property grid ─────────────────────────────────────────────────────────────
export function PropertyGrid({ properties, loading, columns = 3 }: { properties: Property[]; loading: boolean; columns?: number }) {
  const grid = { display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${columns === 2 ? 340 : 300}px, 1fr))`, gap: 22 }

  if (loading) return (
    <div style={grid}>
      {[1, 2, 3].map(i => (
        <div key={i} className="skeleton" style={{ height: 340, borderRadius: 16 }}/>
      ))}
    </div>
  )

  if (properties.length === 0) return (
    <div style={{ textAlign: 'center', padding: '60px 0', color: '#bbb' }}>
      <Building2 size={48} style={{ opacity: .2, marginBottom: 16 }}/>
      <p style={{ fontSize: 15 }}>No listings yet — add properties after setting up Supabase</p>
    </div>
  )

  return (
    <div style={grid}>
      {properties.map(p => <PropertyCard key={p.id} property={p}/>)}
    </div>
  )
}
