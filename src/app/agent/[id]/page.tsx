'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Bed, Bath, Square, Calendar, Heart, Share2, Phone, Mail, TrendingUp, Shield, BarChart3, CheckCircle, ChevronDown, ChevronUp, Eye, Star, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { PropertyChat } from '@/components/ai/PropertyChat'
import { FraudCheckUpload } from '@/components/ai/FraudCheckUpload'
import { ValuationReport } from '@/components/ai/ValuationReport'
import { PropertyMap } from '@/components/property/PropertyMap'
import { PriceHistoryChart } from '@/components/charts/PriceHistoryChart'
import { formatETB, timeAgo } from '@/lib/utils'
import type { Property, Language } from '@/types'

function getVideoEmbedUrl(url: string): string {
  if (!url) return ''
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`
  const vimeo = url.match(/vimeo\.com\/(\d+)/)
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`
  return url
}

// ── Inquiry form (Zillow-style) ────────────────────────────────────────────
function InquiryForm({ property }: { property: Property }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', move_in: '', message: `Hi, I'm interested in this property. Please contact me with more information.` })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [showMore, setShowMore] = useState(false)

  useEffect(() => {
    // Pre-fill from logged in user
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      createClient().from('profiles').select('full_name,email,phone').eq('id', user.id).single()
        .then(({ data }) => {
          if (data) setForm(f => ({ ...f, name: data.full_name || '', email: data.email || '', phone: data.phone || '' }))
        })
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    setError('')
    const sb = createClient()

    await sb.from('inquiries').insert({
      property_id: property.id,
      agent_id: property.agent_id,
      name: form.name,
      email: form.email,
      phone: form.phone,
      message: form.message,
    })

    await fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'inquiry',
        data: { propertyId: property.id, buyerName: form.name, buyerEmail: form.email, buyerPhone: form.phone, message: form.message }
      })
    }).catch(() => {})

    setSent(true)
    setSending(false)
  }

  const inp = (field: string, label: string, type = 'text', required = false, placeholder = '') => (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 5 }}>{label}{required && <span style={{ color: '#dc2626' }}> *</span>}</label>
      <input type={type} value={(form as any)[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} required={required} placeholder={placeholder}
        style={{ width: '100%', padding: '10px 13px', border: '1.5px solid #e0dfd9', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'inherit', color: '#111', transition: 'border .15s' }}
        onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#16a34a'}
        onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#e0dfd9'}
      />
    </div>
  )

  if (sent) return (
    <div style={{ textAlign: 'center', padding: '24px 16px' }}>
      <CheckCircle size={44} color="#16a34a" style={{ marginBottom: 12 }}/>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111', marginBottom: 6 }}>Message sent!</h3>
      <p style={{ fontSize: 14, color: '#888', lineHeight: 1.6 }}>
        {(property.agent as any)?.agency_name || 'The agent'} will contact you soon at <strong>{form.email}</strong>
      </p>
      <button onClick={() => setSent(false)} style={{ marginTop: 14, fontSize: 13, color: '#16a34a', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit' }}>
        Send another message
      </button>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="inquiry-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {inp('name', 'Full name', 'text', true, 'Your full name')}
        {inp('email', 'Email', 'email', true, 'your@email.com')}
      </div>
      {inp('phone', 'Phone number', 'tel', false, '+251 9XX XXX XXXX')}

      {property.listing_intent === 'rent' && inp('move_in', 'Move-in date', 'date', false)}

      {/* Message */}
      <div>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 5 }}>Message <span style={{ color: '#dc2626' }}>*</span></label>
        <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} required rows={4}
          style={{ width: '100%', padding: '10px 13px', border: '1.5px solid #e0dfd9', borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: 'inherit', resize: 'vertical', color: '#111', lineHeight: 1.6, transition: 'border .15s' }}
          onFocus={e => (e.target as HTMLTextAreaElement).style.borderColor = '#16a34a'}
          onBlur={e => (e.target as HTMLTextAreaElement).style.borderColor = '#e0dfd9'}
        />
      </div>

      {error && <div style={{ fontSize: 12, color: '#dc2626', background: '#fef2f2', padding: '8px 12px', borderRadius: 7 }}>{error}</div>}

      <button type="submit" disabled={sending}
        style={{ background: sending ? '#9ca3af' : '#16a34a', color: '#fff', border: 'none', padding: '13px', borderRadius: 9, fontSize: 15, fontWeight: 700, cursor: sending ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'all .15s' }}
        onMouseEnter={e => { if (!sending) (e.currentTarget as HTMLButtonElement).style.background = '#15803d' }}
        onMouseLeave={e => { if (!sending) (e.currentTarget as HTMLButtonElement).style.background = '#16a34a' }}
      >
        {sending ? 'Sending...' : 'Send message'}
      </button>

      <p style={{ fontSize: 11, color: '#bbb', textAlign: 'center', margin: 0, lineHeight: 1.6 }}>
        By sending you agree to our <Link href="/terms" style={{ color: '#16a34a' }}>Terms</Link>. Your contact info is shared with the agent.
      </p>
    </form>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function PropertyDetailPage() {
  const params = useParams()
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)
  const [saved, setSaved] = useState(false)
  const [lang, setLang] = useState<Language>('en')
  const [tab, setTab] = useState<'overview' | 'ai' | 'fraud' | 'valuation'>('overview')
  const [showAllAmenities, setShowAllAmenities] = useState(false)
  const [copied, setCopied] = useState(false)

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
      await sb.from('properties').update({ views: (data.views || 0) + 1 }).eq('id', id)
      // Check if saved
      const { data: { user } } = await sb.auth.getUser()
      if (user) {
        const { data: savedData } = await sb.from('saved_properties').select('id').eq('user_id', user.id).eq('property_id', id).maybeSingle()
        if (savedData) setSaved(true)
      }
    }
    setLoading(false)
  }

  async function toggleSave() {
    const sb = createClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) { window.location.href = '/auth/login'; return }
    if (saved) {
      await sb.from('saved_properties').delete().eq('user_id', user.id).eq('property_id', property!.id)
      setSaved(false)
    } else {
      await sb.from('saved_properties').insert({ user_id: user.id, property_id: property!.id })
      setSaved(true)
    }
  }

  function shareProperty() {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#aaa', fontSize: 14 }}>Loading property...</div>
  if (!property) return <div style={{ textAlign: 'center', padding: 60 }}>Property not found. <Link href="/search">Back to search</Link></div>

  const photos: string[] = (property as any).photos?.length ? (property as any).photos : property.cover_image_url ? [property.cover_image_url] : []
  const images = photos.map((url: string) => ({ url, caption: null, order: 0 }))
  const price = property.listing_intent === 'rent' ? property.rent_per_month_etb : property.price_etb
  const title = lang === 'am' && property.title_amharic ? property.title_amharic : property.title
  const desc = lang === 'am' && property.description_amharic ? property.description_amharic : property.description
  const amenities = property.amenities || []
  const visibleAmenities = showAllAmenities ? amenities : amenities.slice(0, 8)

  const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'ai', label: '🤖 AI Assistant' },
    { id: 'fraud', label: '🔍 Fraud Check' },
    { id: 'valuation', label: '📊 Valuation' },
  ]

  return (
    <div style={{ background: '#f9f9f7', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', gap: 6, fontSize: 13, color: '#aaa', marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <Link href="/" style={{ color: '#aaa', textDecoration: 'none' }}>Home</Link>
          <span>/</span>
          <Link href="/search" style={{ color: '#aaa', textDecoration: 'none' }}>Search</Link>
          <span>/</span>
          <Link href={`/search?neighborhoods=${(property as any).neighborhood?.name}`} style={{ color: '#aaa', textDecoration: 'none' }}>{(property as any).neighborhood?.name || property.city}</Link>
          <span>/</span>
          <span style={{ color: '#555' }}>{title}</span>
        </div>

        <div className="property-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 28, alignItems: 'start' }}>

          {/* ── LEFT COLUMN ── */}
          <div>

            {/* Gallery */}
            <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 20, background: '#111', position: 'relative' }}>
              {images.length > 0 ? (
                <>
                  <div style={{ position: 'relative', height: 520 }}>
                    <Image src={images[activeImage]?.url} alt={title} fill sizes="(max-width: 768px) 100vw, 800px" style={{ objectFit: 'cover' }} priority/>
                  </div>
                  <div style={{ position: 'absolute', bottom: 14, right: 14, background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 20 }}>
                    {activeImage + 1} / {images.length}
                  </div>
                  {images.length > 1 && activeImage > 0 && (
                    <button onClick={() => setActiveImage(i => i - 1)} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 38, height: 38, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
                  )}
                  {images.length > 1 && activeImage < images.length - 1 && (
                    <button onClick={() => setActiveImage(i => i + 1)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 38, height: 38, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
                  )}
                  {/* Badges */}
                  <div style={{ position: 'absolute', top: 14, left: 14, display: 'flex', gap: 7 }}>
                    {property.is_featured && <span style={{ background: '#16a34a', color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 11px', borderRadius: 20 }}>Featured</span>}
                    {property.title_verified && <span style={{ background: 'rgba(255,255,255,0.95)', color: '#15803d', fontSize: 11, fontWeight: 700, padding: '4px 11px', borderRadius: 20 }}>✓ Verified</span>}
                  </div>
                  {/* Action buttons on image */}
                  <div style={{ position: 'absolute', top: 14, right: 14, display: 'flex', gap: 8 }}>
                    <button onClick={toggleSave} style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Heart size={16} fill={saved ? '#dc2626' : 'none'} color={saved ? '#dc2626' : '#555'}/>
                    </button>
                    <button onClick={shareProperty} style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Share2 size={16} color="#555"/>
                    </button>
                  </div>
                  {copied && <div style={{ position: 'absolute', bottom: 50, right: 14, background: '#111', color: '#fff', fontSize: 12, padding: '6px 12px', borderRadius: 8 }}>Link copied!</div>}
                </>
              ) : (
                <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: 14 }}>No photos</div>
              )}
              {images.length > 1 && (
                <div style={{ display: 'flex', gap: 6, padding: '8px 8px', background: '#111', overflowX: 'auto' }}>
                  {images.map((img, i) => (
                    <div key={i} onClick={() => setActiveImage(i)}
                      style={{ width: 90, height: 60, borderRadius: 8, cursor: 'pointer', flexShrink: 0, overflow: 'hidden', position: 'relative', opacity: i === activeImage ? 1 : 0.45, border: i === activeImage ? '2px solid #16a34a' : '2px solid transparent', transition: 'all .15s' }}
                    >
                      <Image src={img.url} alt="" fill style={{ objectFit: 'cover' }}/>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Title + price */}
            <div style={{ background: '#fff', border: '1px solid #eae9e4', borderRadius: 14, padding: '20px 22px', marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 10 }}>
                <div>
                  <h1 style={{ fontSize: 'clamp(18px,3vw,26px)', fontWeight: 900, color: '#111', margin: '0 0 6px', lineHeight: 1.2, letterSpacing: '-.02em' }}>{title}</h1>
                  {property.title_amharic && lang === 'en' && <div style={{ fontSize: 14, color: '#aaa' }}>{property.title_amharic}</div>}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#888', marginTop: 6 }}>
                    <MapPin size={13} color="#16a34a"/>
                    {property.address || (property as any).neighborhood?.name || property.city}, {property.city}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span style={{ fontSize: 30, fontWeight: 900, color: '#16a34a', lineHeight: 1 }}>
                      {formatETB(price)}
                    </span>
                    {property.listing_intent === 'rent' && <span style={{ fontSize: 14, color: '#aaa' }}>/mo</span>}
                  </div>
                  {property.price_usd && <div style={{ fontSize: 13, color: '#bbb', marginTop: 2 }}>≈ ${property.price_usd?.toLocaleString()} USD</div>}
                  {property.is_negotiable && <div style={{ fontSize: 12, color: '#d97706', fontWeight: 600, marginTop: 4 }}>Price negotiable</div>}
                </div>
              </div>

              {/* Key specs bar */}
              <div style={{ display: 'flex', gap: 0, borderTop: '1px solid #f0f0ec', paddingTop: 14, flexWrap: 'wrap' }}>
                {[
                  { icon: <Bed size={15}/>, value: property.bedrooms, label: property.bedrooms === 1 ? 'Bedroom' : 'Bedrooms' },
                  { icon: <Bath size={15}/>, value: property.bathrooms, label: property.bathrooms === 1 ? 'Bathroom' : 'Bathrooms' },
                  { icon: <Square size={15}/>, value: property.size_sqm ? `${property.size_sqm}m²` : null, label: 'Floor area' },
                  { icon: <Calendar size={15}/>, value: property.year_built, label: 'Year built' },
                  { icon: <Eye size={15}/>, value: property.views, label: 'Views' },
                ].filter(s => s.value).map(({ icon, value, label }, i, arr) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 7, paddingRight: 20, marginRight: 20, borderRight: i < arr.length - 1 ? '1px solid #f0f0ec' : 'none', marginBottom: 6 }}>
                    <span style={{ color: '#16a34a' }}>{icon}</span>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#111', lineHeight: 1 }}>{value}</div>
                      <div style={{ fontSize: 11, color: '#aaa' }}>{label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Language toggle */}
            <div style={{ display: 'inline-flex', background: '#fff', border: '1px solid #eae9e4', borderRadius: 8, padding: 3, marginBottom: 16 }}>
              {(['en', 'am'] as Language[]).map(l => (
                <button key={l} onClick={() => setLang(l)} style={{ padding: '5px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: lang === l ? '#0d2318' : 'transparent', color: lang === l ? '#fff' : '#888', transition: 'all .15s', fontFamily: 'inherit' }}>
                  {l === 'en' ? 'English' : 'አማርኛ'}
                </button>
              ))}
            </div>

            {/* Tabs */}
            <div style={{ background: '#fff', border: '1px solid #eae9e4', borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
              <div style={{ display: 'flex', borderBottom: '1px solid #eae9e4' }}>
                {TABS.map(t => (
                  <button key={t.id} onClick={() => setTab(t.id as any)} style={{
                    flex: 1, background: 'none', border: 'none', padding: '14px 8px', cursor: 'pointer', fontSize: 13, fontWeight: tab === t.id ? 700 : 400,
                    color: tab === t.id ? '#16a34a' : '#888', borderBottom: tab === t.id ? '2px solid #16a34a' : '2px solid transparent',
                    transition: 'all .15s', fontFamily: 'inherit', whiteSpace: 'nowrap',
                  }}>{t.label}</button>
                ))}
              </div>

              <div style={{ padding: 22 }}>
                {tab === 'overview' && (
                  <div>
                    {/* Description */}
                    {desc && (
                      <div style={{ marginBottom: 24 }}>
                        <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111', marginBottom: 10 }}>About this property</h2>
                        <p style={{ fontSize: 14, color: '#555', lineHeight: 1.8, margin: 0 }}>{desc}</p>
                      </div>
                    )}

                    {/* Amenities */}
                    {amenities.length > 0 && (
                      <div style={{ marginBottom: 24 }}>
                        <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111', marginBottom: 12 }}>Amenities & features</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 8 }}>
                          {visibleAmenities.map(a => (
                            <div key={a} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#555' }}>
                              <CheckCircle size={14} color="#16a34a" style={{ flexShrink: 0 }}/>{a}
                            </div>
                          ))}
                        </div>
                        {amenities.length > 8 && (
                          <button onClick={() => setShowAllAmenities(!showAllAmenities)} style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#16a34a', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}>
                            {showAllAmenities ? <><ChevronUp size={14}/> Show less</> : <><ChevronDown size={14}/> Show all {amenities.length} amenities</>}
                          </button>
                        )}
                      </div>
                    )}

                    {/* Property details table */}
                    <div style={{ marginBottom: 24 }}>
                      <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111', marginBottom: 12 }}>Property details</h2>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, border: '1px solid #eae9e4', borderRadius: 10, overflow: 'hidden' }}>
                        {[
                          { label: 'Property type', value: property.property_type },
                          { label: 'Listing type', value: property.listing_intent === 'rent' ? 'For Rent' : 'For Sale' },
                          { label: 'City', value: property.city },
                          { label: 'Neighborhood', value: (property as any).neighborhood?.name },
                          { label: 'Bedrooms', value: property.bedrooms },
                          { label: 'Bathrooms', value: property.bathrooms },
                          { label: 'Floor area', value: property.size_sqm ? `${property.size_sqm} m²` : null },
                          { label: 'Floor number', value: (property as any).floor_number },
                          { label: 'Year built', value: property.year_built },
                          { label: 'Listed', value: timeAgo(property.listed_at || property.created_at) },
                        ].filter(r => r.value).map(({ label, value }, i) => (
                          <div key={label} style={{ padding: '11px 14px', borderBottom: '1px solid #f0f0ec', borderRight: i % 2 === 0 ? '1px solid #eae9e4' : 'none', background: i % 4 < 2 ? '#fff' : '#fafaf8' }}>
                            <div style={{ fontSize: 11, color: '#aaa', marginBottom: 3 }}>{label}</div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: '#111', textTransform: 'capitalize' }}>{String(value)}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Video tour */}
                    {(property as any).video_url && (
                      <div style={{ marginBottom: 24 }}>
                        <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111', marginBottom: 12 }}>🎥 Video tour</h2>
                        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: 12, overflow: 'hidden' }}>
                          <iframe src={getVideoEmbedUrl((property as any).video_url)} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen/>
                        </div>
                      </div>
                    )}

                    {/* Location map */}
                    <div style={{ marginBottom: 24 }}>
                      <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111', marginBottom: 12 }}>📍 Location</h2>
                      <PropertyMap
                        properties={[property]}
                        center={(property as any).lat ? { lat: (property as any).lat, lng: (property as any).lng } : { lat: 9.0192, lng: 38.7892 }}
                        zoom={15} height={300}
                      />
                      <div style={{ fontSize: 12, color: '#888', marginTop: 8 }}>
                        {property.address || ''} {(property as any).neighborhood?.name ? `· ${(property as any).neighborhood.name}` : ''} · {property.city}
                      </div>
                    </div>

                    {/* Neighborhood price history */}
                    <div style={{ marginBottom: 8 }}>
                      <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111', marginBottom: 4 }}>📈 Neighborhood price history</h2>
                      <p style={{ fontSize: 13, color: '#888', marginBottom: 14 }}>
                        12-month price trend for {(property as any).neighborhood?.name || property.city}
                      </p>
                      <PriceHistoryChart neighborhood={(property as any).neighborhood?.name || 'Bole'}/>
                      {(property as any).neighborhood && (
                        <div style={{ display: 'flex', gap: 16, marginTop: 14, padding: '12px 16px', background: '#f0fdf4', borderRadius: 10, border: '1px solid #bbf7d0' }}>
                          <div>
                            <div style={{ fontSize: 18, fontWeight: 800, color: '#16a34a' }}>
                              ETB {(((property as any).neighborhood.avg_price_per_sqm_etb || 0) / 1000).toFixed(0)}K/m²
                            </div>
                            <div style={{ fontSize: 11, color: '#888' }}>Avg price per m²</div>
                          </div>
                          <div>
                            <div style={{ fontSize: 18, fontWeight: 800, color: '#16a34a' }}>
                              +{(property as any).neighborhood.price_trend_12m?.toFixed(1) || '0'}%
                            </div>
                            <div style={{ fontSize: 11, color: '#888' }}>12-month growth</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {tab === 'ai' && <PropertyChat property={property} initialLanguage={lang}/>}
                {tab === 'fraud' && <FraudCheckUpload propertyId={property.id} existingResult={property.title_verification_report}/>}
                {tab === 'valuation' && <ValuationReport property={property}/>}
              </div>
            </div>
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <div className="property-sidebar" style={{ position: 'sticky', top: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Price card */}
            <div style={{ background: '#fff', border: '1px solid #eae9e4', borderRadius: 16, padding: '20px 22px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#16a34a', marginBottom: 2 }}>
                {formatETB(price)}
                {property.listing_intent === 'rent' && <span style={{ fontSize: 14, fontWeight: 400, color: '#aaa' }}>/mo</span>}
              </div>
              {property.is_negotiable && <div style={{ fontSize: 12, color: '#d97706', fontWeight: 600, marginBottom: 12 }}>Price negotiable</div>}

              {/* Call button */}
              {(property.agent as any)?.profile?.phone && (
                <a href={`tel:${(property.agent as any).profile.phone}`}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#0d2318', color: '#fff', padding: '13px', borderRadius: 10, textDecoration: 'none', fontSize: 15, fontWeight: 700, marginBottom: 10, transition: 'all .15s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.background = '#16a34a'}
                  onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.background = '#0d2318'}
                >
                  <Phone size={16}/> Call {(property.agent as any)?.agency_name?.split(' ')[0] || 'Agent'}
                </a>
              )}

              <div style={{ borderTop: '1px solid #eae9e4', paddingTop: 16, marginTop: 4 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#111', marginBottom: 14 }}>Contact agent</div>
                <InquiryForm property={property}/>
              </div>
            </div>

            {/* Agent card */}
            <div style={{ background: '#fff', border: '1px solid #eae9e4', borderRadius: 14, padding: '16px 18px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 12 }}>Listed by</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#fff', fontWeight: 700, overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                  {(property.agent as any)?.profile?.avatar_url
                    ? <Image src={(property.agent as any).profile.avatar_url} alt="" fill style={{ objectFit: 'cover' }}/>
                    : ((property.agent as any)?.agency_name || 'A')[0]}
                </div>
                <div>
                  <Link href={`/agent/${property.agent_id}`} style={{ fontSize: 15, fontWeight: 700, color: '#111', textDecoration: 'none' }}>
                    {(property.agent as any)?.agency_name || (property.agent as any)?.profile?.full_name || 'Private seller'}
                  </Link>
                  <div style={{ fontSize: 12, color: '#16a34a', marginTop: 2 }}>
                    {(property.agent as any)?.is_verified && '✓ Verified agent'}
                  </div>
                </div>
              </div>
              <Link href={`/agent/${property.agent_id}`} style={{ display: 'block', textAlign: 'center', fontSize: 13, color: '#16a34a', border: '1.5px solid #16a34a', padding: '9px', borderRadius: 8, textDecoration: 'none', fontWeight: 600, transition: 'all .15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#16a34a'; (e.currentTarget as HTMLAnchorElement).style.color = '#fff' }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; (e.currentTarget as HTMLAnchorElement).style.color = '#16a34a' }}
              >
                View all listings →
              </Link>
            </div>

            {/* AI Reports upsell */}
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 14, padding: '16px 18px' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#15803d', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                ⚡ AI Due Diligence
              </div>
              {[
                { icon: <Shield size={13}/>, title: 'Fraud check', price: '$49', tab: 'fraud' },
                { icon: <BarChart3 size={13}/>, title: 'Valuation report', price: '$25', tab: 'valuation' },
                { icon: <TrendingUp size={13}/>, title: 'Neighborhood report', price: '$14.99', tab: 'overview' },
              ].map(({ icon, title, price: p, tab: t }) => (
                <button key={title} onClick={() => setTab(t as any)}
                  style={{ width: '100%', background: '#fff', border: '1px solid #bbf7d0', borderRadius: 8, padding: '9px 12px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7, fontFamily: 'inherit', transition: 'all .15s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.borderColor = '#16a34a'}
                  onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.borderColor = '#bbf7d0'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#16a34a' }}>
                    {icon}<span style={{ fontSize: 13, color: '#333', fontWeight: 500 }}>{title}</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#16a34a' }}>{p}</span>
                </button>
              ))}
              <Link href={`/ai-reports`} style={{ display: 'block', textAlign: 'center', background: '#16a34a', color: '#fff', padding: '10px', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 700, marginTop: 4 }}>
                Full package — $99
              </Link>
            </div>

            {/* Stats */}
            <div style={{ fontSize: 12, color: '#bbb', textAlign: 'center' }}>
              <Clock size={11} style={{ display: 'inline', marginRight: 4 }}/>
              Listed {timeAgo(property.listed_at || property.created_at)} · {property.views || 0} views
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
