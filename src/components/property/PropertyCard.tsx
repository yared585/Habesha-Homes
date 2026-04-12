'use client'

import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Bed, Bath, Maximize2, Camera, Heart } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { createClient, getClientUser } from '@/lib/supabase/client'
import type { Property } from '@/types'

// ── Save button ──────────────────────────────────────────────────────────────
function SaveButton({ propertyId }: { propertyId: string }) {
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getClientUser().then(user => {
      if (!user) return
      createClient().from('saved_properties').select('id').eq('user_id', user.id).eq('property_id', propertyId).maybeSingle()
        .then(({ data }) => { if (data) setSaved(true) })
    })
  }, [propertyId])

  async function toggle(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    const sb = createClient()
    const user = await getClientUser()
    if (!user) { window.location.href = '/auth/login'; return }
    setLoading(true)
    if (saved) {
      await sb.from('saved_properties').delete().eq('user_id', user.id).eq('property_id', propertyId)
      setSaved(false)
    } else {
      await sb.from('saved_properties').insert({ user_id: user.id, property_id: propertyId })
      setSaved(true)
    }
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      style={{
        position: 'absolute', top: 12, right: 12,
        width: 36, height: 36, borderRadius: '50%',
        background: saved ? '#fff' : 'rgba(255,255,255,0.85)',
        border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        transition: 'all .15s', zIndex: 2,
        backdropFilter: 'blur(4px)',
      }}
      onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = '#fff'}
      onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = saved ? '#fff' : 'rgba(255,255,255,0.85)'}
    >
      <Heart size={17} fill={saved ? '#dc2626' : 'none'} color={saved ? '#dc2626' : '#555'} style={{ transition: 'all .2s' }}/>
    </button>
  )
}

interface Props {
  property: Property
}

export function PropertyCard({ property: p }: Props) {
  const t = useTranslations('property')
  const [hov, setHov] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)
  const price = p.listing_intent === 'rent' ? p.rent_per_month_etb : p.price_etb
  const isRent = p.listing_intent === 'rent'
  const isBoth = p.listing_intent === 'both'
  const agent = (p as any).agent
  const photos: string[] = (p as any).photos
  const photoCount = photos?.length || (p.cover_image_url ? 1 : 0)

  return (
    <Link href={`/property/${p.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          background: '#fff',
          borderRadius: 16,
          border: '0.5px solid #ebebeb',
          transition: 'box-shadow .2s, transform .2s',
          boxShadow: hov ? '0 8px 32px rgba(0,0,0,0.13)' : '0 2px 8px rgba(0,0,0,0.05)',
          transform: hov ? 'translateY(-3px)' : 'none',
          cursor: 'pointer',
        }}
      >
        {/* ── Image ───────────────────────────────────────── */}
        <div style={{ position: 'relative', paddingBottom: '56%', background: '#f0f0ec', overflow: 'hidden', borderRadius: '16px 16px 0 0' }}>
          {p.cover_image_url
            ? <img
                src={p.cover_image_url}
                alt={p.title}
                style={{
                  position: 'absolute', inset: 0,
                  width: '100%', height: '100%', objectFit: 'cover',
                  transition: 'transform .4s',
                  transform: hov ? 'scale(1.03)' : 'scale(1)',
                  opacity: imgLoaded ? 1 : 0,
                }}
                loading="lazy"
                decoding="async"
                onLoad={() => setImgLoaded(true)}
              />
            : <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Camera size={36} color="#ccc"/>
              </div>
          }

          {/* Dark gradient overlay at bottom */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 72, background: 'linear-gradient(to top, rgba(0,0,0,0.45), transparent)', pointerEvents: 'none' }}/>

          {/* Intent badge — top left */}
          <div style={{
            position: 'absolute', top: 10, left: 10,
            background: isRent ? '#2563eb' : isBoth ? '#7c3aed' : '#16a34a',
            color: '#fff',
            fontSize: 10,
            fontWeight: 700,
            padding: '3px 10px',
            borderRadius: 20,
            letterSpacing: '.04em',
          }}>
            {isRent ? 'For rent' : isBoth ? 'For sale & rent' : 'For sale'}
          </div>

          {/* Verified badge — top left, below intent */}
          {p.title_verified && (
            <div style={{
              position: 'absolute', top: 40, left: 12,
              background: 'rgba(255,255,255,0.92)',
              color: '#15803d', fontSize: 10, fontWeight: 700,
              padding: '3px 8px', borderRadius: 6,
              display: 'flex', alignItems: 'center', gap: 3,
            }}>
              ✓ {t('verified')}
            </div>
          )}

          {/* Save button — top right */}
          <SaveButton propertyId={p.id}/>

          {/* Photo count — bottom left */}
          {photoCount > 0 && (
            <div style={{
              position: 'absolute', bottom: 10, left: 12,
              display: 'flex', alignItems: 'center', gap: 5,
              color: '#fff', fontSize: 11, fontWeight: 600,
            }}>
              <Camera size={12}/> {photoCount}
            </div>
          )}
        </div>

        {/* ── Card body ───────────────────────────────────── */}
        <div style={{ padding: '12px 14px 16px', display: 'flex', flexDirection: 'column', gap: 1 }}>

          {/* Price */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: '#111', letterSpacing: '-.02em' }}>
              ETB {(price || 0).toLocaleString()}
            </span>
            {isRent && <span style={{ fontSize: 10.5, color: '#888', fontWeight: 500 }}>/mo</span>}
            {!isRent && p.price_usd && (
              <span style={{ fontSize: 10.5, color: '#bbb' }}>≈ ${p.price_usd.toLocaleString()}</span>
            )}
          </div>

          {/* Specs — pipe-separated single line */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: '#333', fontWeight: 500 }}>
            {p.bedrooms != null && <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Bed size={11} color="#888"/> {p.bedrooms} {t('beds')}</span>}
            {p.bedrooms != null && p.bathrooms != null && <span style={{ color: '#ccc' }}>|</span>}
            {p.bathrooms != null && <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Bath size={11} color="#888"/> {p.bathrooms} {t('baths')}</span>}
            {(p.bedrooms != null || p.bathrooms != null) && p.size_sqm != null && <span style={{ color: '#ccc' }}>|</span>}
            {p.size_sqm != null && <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Maximize2 size={10} color="#888"/> {p.size_sqm} m²</span>}
          </div>

          {/* Title — single line, below specs */}
          <div style={{ fontSize: 13, fontWeight: 600, color: '#222', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {p.title}
          </div>

          {/* Location */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10.5, color: '#bbb' }}>
            <MapPin size={10} color="#d0d0d0"/>
            {(p as any).neighborhood?.name ? `${(p as any).neighborhood.name}, ${p.city}` : p.city}
          </div>

          {/* Agent strip */}
          {agent && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4, paddingTop: 6, borderTop: '1px solid #f0f0ee' }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', flexShrink: 0, background: '#e8e7e2', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700, color: '#888', position: 'relative' }}>
                {agent?.profile?.avatar_url
                  ? <Image src={agent.profile.avatar_url} alt="" fill style={{ objectFit: 'cover' }}/>
                  : (agent?.agency_name?.[0] || 'A')}
              </div>
              <span style={{ fontSize: 10.5, color: '#aaa', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {agent?.agency_name || 'Agent'}
              </span>
              {agent?.is_verified && <span style={{ fontSize: 10, color: '#16a34a', fontWeight: 600, flexShrink: 0 }}>✓</span>}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

// ── Property grid ─────────────────────────────────────────────────────────────
export function PropertyGrid({ properties, loading, columns = 3 }: { properties: Property[]; loading: boolean; columns?: number }) {
  const grid = { display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${columns === 2 ? 400 : 300}px, 1fr))`, gap: 16 }

  if (loading) return (
    <div className="property-card-grid" style={grid}>
      {[1, 2, 3].map(i => (
        <div key={i} className="skeleton" style={{ height: 340, borderRadius: 12 }}/>
      ))}
    </div>
  )

  if (properties.length === 0) return (
    <div style={{ textAlign: 'center', padding: '60px 0', color: '#bbb' }}>
      <Camera size={48} style={{ opacity: .2, marginBottom: 16 }}/>
      <p style={{ fontSize: 15 }}>No listings yet</p>
    </div>
  )

  return (
    <div className="property-card-grid" style={grid}>
      {properties.map(p => <PropertyCard key={p.id} property={p}/>)}
    </div>
  )
}
