'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Bed, Bath, Square, Calendar, Heart, Share2, Phone, Mail, TrendingUp, Shield, BarChart3 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { PropertyChat } from '@/components/ai/PropertyChat'
import { FraudCheckUpload } from '@/components/ai/FraudCheckUpload'
import { ValuationReport } from '@/components/ai/ValuationReport'
import { PropertyMap } from '@/components/property/PropertyMap'
import { PriceHistoryChart } from '@/components/charts/PriceHistoryChart'
import { formatETB, timeAgo } from '@/lib/utils'
import type { Property, Language } from '@/types'

export default function PropertyDetailPage() {
  const params = useParams()
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)
  const [saved, setSaved] = useState(false)
  const [lang, setLang] = useState<Language>('en')
  const [tab, setTab] = useState<'overview' | 'ai' | 'fraud' | 'valuation'>('overview')
  const [showInquiry, setShowInquiry] = useState(false)
  const [inquiry, setInquiry] = useState({ name: '', email: '', phone: '', message: '' })

  useEffect(() => {
    if (params.id) load(params.id as string)
  }, [params.id])

  async function load(id: string) {
    const sb = createClient()
    const { data } = await sb
      .from('properties')
      .select('*,neighborhood:neighborhoods(*),agent:agents(*,profile:profiles(full_name,avatar_url,phone,email))')
      .eq('id', id).single()
    if (data) {
      setProperty(data as unknown as Property)
      // Increment view count
      await sb.from('properties').update({ views: (data.views || 0) + 1 }).eq('id', id)
    }
    setLoading(false)
  }

  async function sendInquiry(e: React.FormEvent) {
    e.preventDefault()
    if (!property) return
    await createClient().from('inquiries').insert({ property_id: property.id, agent_id: property.agent_id, ...inquiry })
    setShowInquiry(false)
    alert('Message sent!')
  }

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text-3)', fontSize: 14 }}>Loading property...</div>
  if (!property) return <div style={{ textAlign: 'center', padding: 60 }}>Property not found. <Link href="/search">Back to search</Link></div>

  // Support both photos array and legacy cover_image_url
  const photos: string[] = (property as any).photos?.length
    ? (property as any).photos
    : property.cover_image_url
    ? [property.cover_image_url]
    : []
  const images = photos.map((url: string) => ({ url, caption: null, order: 0 }))
  const price = property.listing_intent === 'rent' ? property.rent_per_month_etb : property.price_etb
  const title = lang === 'am' && property.title_amharic ? property.title_amharic : property.title
  const desc = lang === 'am' && property.description_amharic ? property.description_amharic : property.description

  const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'ai', label: '🤖 AI Assistant' },
    { id: 'fraud', label: '🔍 Fraud Check' },
    { id: 'valuation', label: '📊 Valuation' },
  ]

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', gap: 8, fontSize: 13, color: 'var(--text-3)', marginBottom: 20 }}>
        <Link href="/" style={{ color: 'var(--text-3)', textDecoration: 'none' }}>Home</Link>
        <span>/</span>
        <Link href="/search" style={{ color: 'var(--text-3)', textDecoration: 'none' }}>Search</Link>
        <span>/</span>
        <span style={{ color: 'var(--text)' }}>{(property as any).neighborhood?.name || property.city}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32, alignItems: 'start' }}>
        {/* LEFT */}
        <div>
          {/* Gallery */}
          <div style={{ borderRadius: 'var(--r-xl)', overflow: 'hidden', marginBottom: 24, position: 'relative' }}>
            {images.length > 0 ? (
              <>
                {/* Main image with navigation */}
                <div style={{ position: 'relative', background: '#000' }}>
                  <img src={images[activeImage]?.url} alt={title} style={{ width: '100%', height: 520, objectFit: 'cover', display: 'block' }} />
                  {/* Counter */}
                  <div style={{ position: 'absolute', bottom: 14, right: 14, background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 20 }}>
                    {activeImage + 1} / {images.length}
                  </div>
                  {/* Prev button */}
                  {images.length > 1 && activeImage > 0 && (
                    <button onClick={() => setActiveImage(i => i - 1)}
                      style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >‹</button>
                  )}
                  {/* Next button */}
                  {images.length > 1 && activeImage < images.length - 1 && (
                    <button onClick={() => setActiveImage(i => i + 1)}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >›</button>
                  )}
                </div>
                {/* Thumbnails */}
                {images.length > 1 && (
                  <div style={{ display: 'flex', gap: 6, padding: '8px 0', overflowX: 'auto' }}>
                    {images.map((img, i) => (
                      <img key={i} src={img.url} onClick={() => setActiveImage(i)}
                        style={{ width: 90, height: 65, objectFit: 'cover', borderRadius: 8, cursor: 'pointer', flexShrink: 0, opacity: i === activeImage ? 1 : 0.5, border: i === activeImage ? '2px solid #16a34a' : '2px solid transparent', transition: 'all .15s' }}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div style={{ height: 400, background: '#f0f0ec', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', borderRadius: 16 }}>No photos uploaded</div>
            )}
            {/* Badges */}
            <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', gap: 7 }}>
              {property.is_featured && <span style={{ background: 'var(--green)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 11px', borderRadius: 'var(--r-full)' }}>Featured</span>}
              {property.title_verified && <span style={{ background: 'rgba(255,255,255,0.95)', color: 'var(--green-dark)', fontSize: 11, fontWeight: 700, padding: '4px 11px', borderRadius: 'var(--r-full)' }}>✓ AI Verified</span>}
            </div>
            <button onClick={() => setLang(l => l === 'en' ? 'am' : 'en')} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: 'var(--r-full)', padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: 'var(--text)' }}>
              {lang === 'en' ? 'አማርኛ' : 'English'}
            </button>
          </div>

          {/* Title & price */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 400, color: 'var(--text)', margin: 0, flex: 1, lineHeight: 1.2 }}>{title}</h1>
              <div style={{ display: 'flex', gap: 8, marginLeft: 16 }}>
                <button onClick={() => setSaved(!saved)} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '8px 10px', cursor: 'pointer' }}>
                  <Heart size={16} color={saved ? 'var(--red)' : 'var(--text-3)'} fill={saved ? 'var(--red)' : 'none'} />
                </button>
                <button style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '8px 10px', cursor: 'pointer' }}>
                  <Share2 size={16} color="var(--text-3)" />
                </button>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-3)', fontSize: 13, marginBottom: 14 }}>
              <MapPin size={13} /> {property.address || ''} {(property as any).neighborhood?.name}, {property.city}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 34, color: 'var(--green)' }}>
                {formatETB(price)}{property.listing_intent === 'rent' && <span style={{ fontSize: 16, fontWeight: 400 }}>/mo</span>}
              </span>
              {property.price_usd && <span style={{ fontSize: 16, color: 'var(--text-3)' }}>≈ ${property.price_usd.toLocaleString()}</span>}
              {property.is_negotiable && <span style={{ fontSize: 12, background: 'var(--gold-light)', color: 'var(--gold)', padding: '3px 10px', borderRadius: 'var(--r-full)', fontWeight: 600 }}>Negotiable</span>}
            </div>
          </div>

          {/* Specs */}
          <div style={{ display: 'flex', gap: 20, padding: '14px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', marginBottom: 24, flexWrap: 'wrap' }}>
            {[
              { icon: <Bed size={16} />, value: property.bedrooms, label: 'beds' },
              { icon: <Bath size={16} />, value: property.bathrooms, label: 'baths' },
              { icon: <Square size={16} />, value: property.size_sqm ? `${property.size_sqm}m²` : null, label: '' },
              { icon: <Calendar size={16} />, value: property.year_built, label: 'built' },
            ].filter(s => s.value).map(({ icon, value, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 14, color: 'var(--text-2)' }}>
                <span style={{ color: 'var(--green)' }}>{icon}</span>
                <strong style={{ color: 'var(--text)' }}>{value}</strong> {label}
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 2, borderBottom: '2px solid var(--border)', marginBottom: 24 }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id as any)} style={{
                background: 'none', border: 'none', padding: '10px 16px', cursor: 'pointer',
                fontSize: 13, fontWeight: 500,
                color: tab === t.id ? 'var(--green)' : 'var(--text-3)',
                borderBottom: tab === t.id ? '2px solid var(--green)' : '2px solid transparent',
                marginBottom: -2
              }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {tab === 'overview' && (
            <div>
              {desc && (
                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 10 }}>Description</h3>
                  <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.8 }}>{desc}</p>
                </div>
              )}
              {property.amenities?.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>Amenities</h3>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {property.amenities.map(a => (
                      <span key={a} style={{ background: 'var(--green-light)', color: 'var(--green-dark)', padding: '5px 12px', borderRadius: 'var(--r-full)', fontSize: 13, fontWeight: 500 }}>{a}</span>
                    ))}
                  </div>
                </div>
              )}
              {/* Price history chart */}
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>Neighborhood price history</h3>
                <PriceHistoryChart neighborhood={(property as any).neighborhood?.name || 'Addis Ababa'} />
              </div>
              {property.coordinates && (
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>Location</h3>
                  <PropertyMap properties={[property]} center={property.coordinates} zoom={15} height={280} />
                </div>
              )}
            </div>
          )}
          {tab === 'ai' && <PropertyChat property={property} initialLanguage={lang} />}
          {tab === 'fraud' && <FraudCheckUpload propertyId={property.id} existingResult={property.title_verification_report} />}
          {tab === 'valuation' && <ValuationReport property={property} />}
        </div>

        {/* RIGHT SIDEBAR */}
        <div style={{ position: 'sticky', top: 24 }}>
          {/* Agent card */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: 20, marginBottom: 14, boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#fff', fontWeight: 700, overflow: 'hidden', flexShrink: 0 }}>
                {(property.agent as any)?.profile?.avatar_url
                  ? <img src={(property.agent as any).profile.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : ((property.agent as any)?.agency_name || 'A')[0]}
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>{(property.agent as any)?.agency_name || (property.agent as any)?.profile?.full_name || 'Private seller'}</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
                  {(property.agent as any)?.is_verified && <span style={{ color: 'var(--green)', fontWeight: 600 }}>✓ Verified agent</span>}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {(property.agent as any)?.profile?.phone && (
                <a href={`tel:${(property.agent as any).profile.phone}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: 'var(--green)', color: '#fff', padding: 12, borderRadius: 'var(--r-lg)', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
                  <Phone size={15} /> Call agent
                </a>
              )}
              <button onClick={() => setShowInquiry(!showInquiry)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: 'var(--surface)', border: '1px solid var(--green)', color: 'var(--green)', padding: 12, borderRadius: 'var(--r-lg)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                <Mail size={15} /> Send message
              </button>
            </div>

            {showInquiry && (
              <form onSubmit={sendInquiry} style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 9 }}>
                {['name', 'email', 'phone'].map(field => (
                  <input key={field} placeholder={field.charAt(0).toUpperCase() + field.slice(1)} required={field !== 'phone'}
                    value={(inquiry as any)[field]} onChange={e => setInquiry(p => ({ ...p, [field]: e.target.value }))}
                    style={{ padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', fontSize: 13, outline: 'none', color: 'var(--text)', background: 'var(--bg)' }} />
                ))}
                <textarea placeholder="I'm interested in this property..." rows={3} required
                  value={inquiry.message} onChange={e => setInquiry(p => ({ ...p, message: e.target.value }))}
                  style={{ padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', fontSize: 13, resize: 'vertical', outline: 'none', color: 'var(--text)', background: 'var(--bg)' }} />
                <button type="submit" style={{ background: 'var(--green)', color: '#fff', border: 'none', borderRadius: 'var(--r-md)', padding: '10px', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>Send inquiry</button>
              </form>
            )}
          </div>

          {/* AI reports upsell */}
          <div style={{ background: 'var(--green-light)', border: '1px solid var(--green)', borderRadius: 'var(--r-xl)', padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--green-dark)', marginBottom: 12 }}>🤖 AI Reports</div>
            {[
              { title: 'Fraud check', desc: 'Verify title document', price: '$49', tab: 'fraud', icon: <Shield size={14} /> },
              { title: 'Valuation', desc: 'Instant price estimate', price: '$25', tab: 'valuation', icon: <BarChart3 size={14} /> },
              { title: 'Neighborhood', desc: 'Area intelligence', price: '$14.99', tab: 'overview', icon: <TrendingUp size={14} /> },
            ].map(({ title, desc, price, tab: t, icon }) => (
              <button key={title} onClick={() => setTab(t as any)} style={{
                width: '100%', background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--r-md)', padding: '10px 12px', cursor: 'pointer',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7, textAlign: 'left'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: 'var(--green)' }}>{icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{desc}</div>
                  </div>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--green)' }}>{price}</span>
              </button>
            ))}
            <button onClick={() => window.location.href = `/ai-reports?property_id=${property.id}&type=due_diligence`} style={{
              width: '100%', background: 'var(--green)', color: '#fff', border: 'none',
              borderRadius: 'var(--r-md)', padding: '10px', cursor: 'pointer', fontSize: 13, fontWeight: 600, marginTop: 4
            }}>
              Full diaspora package — $99
            </button>
          </div>

          <div style={{ fontSize: 11, color: 'var(--text-4)', textAlign: 'center', marginTop: 10 }}>
            Listed {timeAgo(property.listed_at || property.created_at)} · {property.views} views
          </div>
        </div>
      </div>
    </div>
  )
}
