'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Bed, Bath, Square, Calendar, Heart, Share2, Phone, Mail, TrendingUp, Shield, BarChart3, CheckCircle, ChevronDown, ChevronUp, Eye, Star, Clock, X, ChevronLeft, ChevronRight, Grid } from 'lucide-react'
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

    console.log('Inquiry submitted for property:', property.id)

    await sb.from('inquiries').insert({
      property_id: property.id,
      agent_id: property.agent_id,
      name: form.name,
      email: form.email,
      phone: form.phone,
      message: form.message,
    })

    console.log('Inquiry saved, agent data:', JSON.stringify((property as any).agent))

    // Email agent
    const agentEmail = (property.agent as any)?.profile?.email
    const agentName = (property.agent as any)?.agency_name || (property.agent as any)?.profile?.full_name || 'Agent'
    console.log('Sending inquiry email to:', agentEmail)

    if (agentEmail) {
      const emailResponse = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'inquiry',
          to: agentEmail,
          data: { agentName, buyerName: form.name, buyerEmail: form.email, buyerPhone: form.phone, message: form.message, propertyTitle: property.title, propertyId: property.id }
        })
      })
      console.log('Email API response:', emailResponse.status)
    } else {
      console.log('No agent email found — skipping email notification')
    }

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
      <div className="contact-name-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
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

// ── Lightbox ──────────────────────────────────────────────────────────────
function Lightbox({ images, startIndex, onClose }: { images: { url: string }[], startIndex: number, onClose: () => void }) {
  const [idx, setIdx] = useState(startIndex)
  const prev = () => setIdx(i => Math.max(0, i - 1))
  const next = () => setIdx(i => Math.min(images.length - 1, i + 1))

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [])

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 1000, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', flexShrink: 0 }}>
        <span style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>{idx + 1} / {images.length}</span>
        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
          <X size={18}/>
        </button>
      </div>

      {/* Main image */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', minHeight: 0, padding: '0 60px' }}>
        <img src={images[idx].url} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 8 }}/>
        {idx > 0 && (
          <button onClick={prev} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .15s' }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.25)'}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.12)'}
          ><ChevronLeft size={22}/></button>
        )}
        {idx < images.length - 1 && (
          <button onClick={next} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .15s' }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.25)'}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.12)'}
          ><ChevronRight size={22}/></button>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div style={{ display: 'flex', gap: 6, padding: '14px 20px', overflowX: 'auto', flexShrink: 0, justifyContent: 'center' }}>
          {images.map((img, i) => (
            <img key={i} src={img.url} onClick={() => setIdx(i)} alt=""
              style={{ width: 72, height: 52, objectFit: 'cover', borderRadius: 6, cursor: 'pointer', flexShrink: 0, opacity: i === idx ? 1 : 0.45, border: i === idx ? '2px solid #16a34a' : '2px solid transparent', transition: 'all .15s' }}
            />
          ))}
        </div>
      )}
    </div>
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
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxStart, setLightboxStart] = useState(0)
  const [similar, setSimilar] = useState<Property[]>([])

  function openLightbox(i: number) { setLightboxStart(i); setLightboxOpen(true) }

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
      // Fetch similar properties
      const { data: sim } = await sb.from('properties')
        .select('*,neighborhood:neighborhoods(*),agent:agents(*,profile:profiles(full_name,avatar_url))')
        .eq('city', data.city)
        .eq('listing_intent', data.listing_intent)
        .eq('status', 'approved')
        .neq('id', id)
        .limit(4)
      if (sim) setSimilar(sim as unknown as Property[])
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

  if (loading) return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
      <div className="skeleton" style={{ width: '100%', height: 420, borderRadius: 16, marginBottom: 28 }}/>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 340px', gap: 32 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="skeleton" style={{ width: '60%', height: 32, borderRadius: 8 }}/>
          <div className="skeleton" style={{ width: '35%', height: 28, borderRadius: 8 }}/>
          <div className="skeleton" style={{ width: '45%', height: 16, borderRadius: 6 }}/>
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            {[70, 70, 80].map((w, i) => <div key={i} className="skeleton" style={{ width: w, height: 13, borderRadius: 6 }}/>)}
          </div>
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {['100%','95%','88%','72%'].map((w, i) => <div key={i} className="skeleton" style={{ width: w, height: 13, borderRadius: 6 }}/>)}
          </div>
        </div>
        <div style={{ background: '#f9f9f7', borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="skeleton" style={{ width: '55%', height: 18, borderRadius: 6 }}/>
          {[44, 44, 80, 46].map((h, i) => <div key={i} className="skeleton" style={{ width: '100%', height: h, borderRadius: 10 }}/>)}
        </div>
      </div>
    </div>
  )
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
    <div className="property-page-body" style={{ background: '#f9f9f7', minHeight: '100vh', overflowX: 'hidden', maxWidth: '100vw' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px', overflowX: 'hidden' }}>

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

        <div className="property-detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr minmax(0, 380px)', gap: 28, alignItems: 'start', minWidth: 0 }}>

          {/* ── LEFT COLUMN ── */}
          <div style={{ minWidth: 0, overflow: 'hidden' }}>

            {/* Gallery */}
            {lightboxOpen && images.length > 0 && (
              <Lightbox images={images} startIndex={lightboxStart} onClose={() => setLightboxOpen(false)}/>
            )}
            <div className="property-photo-wrapper" style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 20, position: 'relative' }}>
              {images.length === 0 ? (
                <div style={{ height: 380, background: '#f0f0ec', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: 14 }}>No photos available</div>
              ) : images.length === 1 ? (
                /* Single image — full width */
                <div style={{ position: 'relative', cursor: 'zoom-in' }} onClick={() => openLightbox(0)}>
                  <img src={images[0].url} alt={title} style={{ width: '100%', height: 460, objectFit: 'cover', display: 'block' }}/>
                </div>
              ) : (
                /* Zillow-style: main left + 2 stacked right */
                <div className="property-photo-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '230px 230px', gap: 3 }}>
                  {/* Main large image — spans 2 rows */}
                  <div style={{ gridRow: '1 / 3', position: 'relative', cursor: 'zoom-in', overflow: 'hidden' }} onClick={() => openLightbox(0)}>
                    <img src={images[0].url} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform .3s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.02)'}
                      onMouseLeave={e => (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)'}
                    />
                  </div>
                  {/* Top-right image */}
                  <div style={{ position: 'relative', cursor: 'zoom-in', overflow: 'hidden' }} onClick={() => openLightbox(1)}>
                    <img src={images[1].url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform .3s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.02)'}
                      onMouseLeave={e => (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)'}
                    />
                  </div>
                  {/* Bottom-right image */}
                  <div style={{ position: 'relative', cursor: 'zoom-in', overflow: 'hidden' }} onClick={() => openLightbox(images.length > 2 ? 2 : 1)}>
                    <img src={images[Math.min(2, images.length - 1)].url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform .3s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.02)'}
                      onMouseLeave={e => (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)'}
                    />
                    {/* "See all photos" button overlaid on bottom-right */}
                    {images.length > 3 && (
                      <button onClick={e => { e.stopPropagation(); openLightbox(0) }}
                        style={{ position: 'absolute', bottom: 14, right: 14, display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.95)', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 600, color: '#111', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.2)', transition: 'all .15s' }}
                        onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = '#fff'}
                        onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.95)'}
                      >
                        <Grid size={14}/> See all {images.length} photos
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Badges */}
              <div style={{ position: 'absolute', top: 14, left: 14, display: 'flex', gap: 7, zIndex: 2 }}>
                {property.is_featured && <span style={{ background: '#16a34a', color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 11px', borderRadius: 20 }}>Featured</span>}
                {property.title_verified && <span style={{ background: 'rgba(255,255,255,0.95)', color: '#15803d', fontSize: 11, fontWeight: 700, padding: '4px 11px', borderRadius: 20 }}>✓ Verified</span>}
              </div>

              {/* Action buttons */}
              <div style={{ position: 'absolute', top: 14, right: 14, display: 'flex', gap: 8, zIndex: 2 }}>
                <button onClick={toggleSave} style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.92)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }}>
                  <Heart size={16} fill={saved ? '#dc2626' : 'none'} color={saved ? '#dc2626' : '#555'}/>
                </button>
                <button onClick={shareProperty} style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.92)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }}>
                  <Share2 size={16} color="#555"/>
                </button>
              </div>
              {copied && <div style={{ position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)', background: '#111', color: '#fff', fontSize: 12, padding: '6px 14px', borderRadius: 8, zIndex: 2, whiteSpace: 'nowrap' }}>Link copied!</div>}
            </div>

            {/* Title + price */}
            <div style={{ background: '#fff', border: '1px solid #eae9e4', borderRadius: 14, padding: '16px 18px', marginBottom: 12 }}>

              {/* Badge row + meta row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ background: property.listing_intent === 'rent' ? '#1d4ed8' : '#166534', color: '#fff', fontSize: 10, fontWeight: 800, padding: '3px 9px', borderRadius: 20, letterSpacing: '.06em' }}>
                    {property.listing_intent === 'rent' ? 'FOR RENT' : 'FOR SALE'}
                  </span>
                  {property.property_type && (
                    <span style={{ background: '#f5f5f2', color: '#555', fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20, textTransform: 'capitalize' }}>
                      {property.property_type}
                    </span>
                  )}
                  {property.title_verified && (
                    <span style={{ background: '#f0fdf4', color: '#15803d', fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20, border: '1px solid #bbf7d0' }}>✓ Verified</span>
                  )}
                  {property.is_featured && (
                    <span style={{ background: '#fefce8', color: '#a16207', fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20, border: '1px solid #fde68a' }}>★ Featured</span>
                  )}
                </div>
                <div style={{ fontSize: 11, color: '#bbb', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <span>Listed {timeAgo(property.listed_at || property.created_at)}</span>
                  <span>· {property.views || 0} views</span>
                </div>
              </div>

              {/* Title + location */}
              <h1 style={{ fontSize: 'clamp(18px,2.5vw,24px)', fontWeight: 900, color: '#111', margin: '0 0 4px', lineHeight: 1.2, letterSpacing: '-.02em' }}>{title}</h1>
              {property.title_amharic && lang === 'en' && (
                <div style={{ fontSize: 13, color: '#aaa', marginBottom: 6 }}>{property.title_amharic}</div>
              )}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 4, fontSize: 13, color: '#666', marginBottom: 12 }}>
                <MapPin size={13} color="#888" style={{ flexShrink: 0, marginTop: 2 }}/>
                <span style={{ overflowWrap: 'break-word', wordBreak: 'break-word' }}>{[property.address, (property as any).neighborhood?.name, property.city].filter(Boolean).join(', ')}</span>
              </div>

              {/* Price + specs inline */}
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 16, paddingTop: 12, borderTop: '1px solid #f0f0ec' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span style={{ fontSize: 28, fontWeight: 900, color: '#111', lineHeight: 1, letterSpacing: '-.02em' }}>{formatETB(price)}</span>
                    {property.listing_intent === 'rent' && <span style={{ fontSize: 13, color: '#888' }}>/mo</span>}
                  </div>
                  {property.price_usd && <div style={{ fontSize: 12, color: '#bbb', marginTop: 2 }}>≈ ${property.price_usd.toLocaleString()} USD</div>}
                  {property.is_negotiable && <div style={{ fontSize: 11, color: '#d97706', fontWeight: 700, marginTop: 2 }}>Negotiable</div>}
                </div>

                <div style={{ width: 1, height: 36, background: '#eae9e4', flexShrink: 0 }}/>

                {/* Compact specs */}
                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                  {[
                    { icon: <Bed size={14}/>, value: property.bedrooms, label: 'bd' },
                    { icon: <Bath size={14}/>, value: property.bathrooms, label: 'ba' },
                    { icon: <Square size={14}/>, value: property.size_sqm ? `${property.size_sqm}` : null, label: 'm²' },
                    { icon: <Calendar size={14}/>, value: property.year_built, label: '' },
                  ].filter(s => s.value != null).map(({ icon, value, label }) => (
                    <div key={label + value} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 14, color: '#333', fontWeight: 600 }}>
                      <span style={{ color: '#999', display: 'flex' }}>{icon}</span>
                      {value}{label && <span style={{ color: '#aaa', fontWeight: 400, fontSize: 12 }}>{label}</span>}
                    </div>
                  ))}
                </div>
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
              <div className="property-tabs-bar" style={{ display: 'flex', borderBottom: '1px solid #eae9e4' }}>
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
                      <div style={{ marginBottom: 20 }}>
                        <h2 style={{ fontSize: 14, fontWeight: 800, color: '#111', marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid #f0f0ec', display: 'flex', alignItems: 'center', gap: 7, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                          <span style={{ width: 3, height: 14, background: '#374151', borderRadius: 2, display: 'inline-block' }}/>About this property
                        </h2>
                        <p style={{ fontSize: 14, color: '#555', lineHeight: 1.8, margin: 0 }}>{desc}</p>
                      </div>
                    )}

                    {/* Amenities */}
                    {amenities.length > 0 && (
                      <div style={{ marginBottom: 20 }}>
                        <h2 style={{ fontSize: 14, fontWeight: 800, color: '#111', marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid #f0f0ec', display: 'flex', alignItems: 'center', gap: 7, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                          <span style={{ width: 3, height: 14, background: '#374151', borderRadius: 2, display: 'inline-block' }}/>Amenities & features
                        </h2>
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

                    {/* Property details */}
                    <div style={{ marginBottom: 20 }}>
                      <h2 style={{ fontSize: 14, fontWeight: 800, color: '#111', marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid #f0f0ec', display: 'flex', alignItems: 'center', gap: 7, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                        <span style={{ width: 3, height: 14, background: '#374151', borderRadius: 2, display: 'inline-block' }}/>Property details
                      </h2>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 24px' }}>
                        {[
                          { icon: '🏠', label: 'Property type', value: property.property_type },
                          { icon: '📋', label: 'Listing type',  value: property.listing_intent === 'rent' ? 'For Rent' : 'For Sale' },
                          { icon: '📍', label: 'City',          value: property.city },
                          { icon: '🏘', label: 'Neighborhood',  value: (property as any).neighborhood?.name },
                          { icon: '🛏', label: 'Bedrooms',      value: property.bedrooms != null ? `${property.bedrooms} bed${property.bedrooms !== 1 ? 's' : ''}` : null },
                          { icon: '🚿', label: 'Bathrooms',     value: property.bathrooms != null ? `${property.bathrooms} bath${property.bathrooms !== 1 ? 's' : ''}` : null },
                          { icon: '📐', label: 'Floor area',    value: property.size_sqm ? `${property.size_sqm} m²` : null },
                          { icon: '🏢', label: 'Floor',         value: (property as any).floor_number ? `Floor ${(property as any).floor_number}` : null },
                          { icon: '📅', label: 'Year built',    value: property.year_built },
                          { icon: '🕐', label: 'Listed',        value: timeAgo(property.listed_at || property.created_at) },
                        ].filter(r => r.value != null).map(({ icon, label, value }) => (
                          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid #f5f5f2' }}>
                            <span style={{ fontSize: 15, flexShrink: 0, width: 22, textAlign: 'center' }}>{icon}</span>
                            <span style={{ fontSize: 12.5, color: '#888', flex: 1 }}>{label}</span>
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#111', textTransform: 'capitalize', textAlign: 'right' }}>{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Video tour */}
                    {(property as any).video_url && (
                      <div style={{ marginBottom: 20 }}>
                        <h2 style={{ fontSize: 14, fontWeight: 800, color: '#111', marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid #f0f0ec', display: 'flex', alignItems: 'center', gap: 7, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                          <span style={{ width: 3, height: 14, background: '#374151', borderRadius: 2, display: 'inline-block' }}/>🎥 Video tour
                        </h2>
                        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: 12, overflow: 'hidden' }}>
                          <iframe src={getVideoEmbedUrl((property as any).video_url)} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen/>
                        </div>
                      </div>
                    )}

                    {/* Location map */}
                    <div style={{ marginBottom: 20 }}>
                      <h2 style={{ fontSize: 14, fontWeight: 800, color: '#111', marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid #f0f0ec', display: 'flex', alignItems: 'center', gap: 7, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                        <span style={{ width: 3, height: 14, background: '#374151', borderRadius: 2, display: 'inline-block' }}/>📍 Location
                      </h2>
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
                      <h2 style={{ fontSize: 14, fontWeight: 800, color: '#111', marginBottom: 4, paddingBottom: 8, borderBottom: '1px solid #f0f0ec', display: 'flex', alignItems: 'center', gap: 7, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                        <span style={{ width: 3, height: 14, background: '#374151', borderRadius: 2, display: 'inline-block' }}/>📈 Neighborhood price trend
                      </h2>
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
          <div className="property-detail-sidebar" style={{ position: 'sticky', top: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Price card */}
            <div style={{ background: '#fff', border: '1px solid #eae9e4', borderRadius: 16, padding: '18px 20px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: '#111', marginBottom: 2 }}>
                {formatETB(price)}
                {property.listing_intent === 'rent' && <span style={{ fontSize: 13, fontWeight: 400, color: '#aaa' }}>/mo</span>}
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
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#fff', fontWeight: 700, overflow: 'hidden', flexShrink: 0 }}>
                  {(property.agent as any)?.profile?.avatar_url
                    ? <img src={(property.agent as any).profile.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
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

          </div>
        </div>

        {/* Similar properties */}
        {similar.length > 0 && (
          <div style={{ marginTop: 40, paddingTop: 32, borderTop: '1px solid #eae9e4' }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#111', marginBottom: 4, letterSpacing: '-.02em' }}>
              Similar properties in {property.city}
            </h2>
            <p style={{ fontSize: 14, color: '#888', marginBottom: 20 }}>
              {property.listing_intent === 'rent' ? 'Other rentals' : 'Other properties for sale'} in this area
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
              {similar.map(sim => {
                const simPrice = sim.listing_intent === 'rent' ? sim.rent_per_month_etb : sim.price_etb
                const simPhotos: string[] = (sim as any).photos?.length ? (sim as any).photos : sim.cover_image_url ? [sim.cover_image_url] : []
                return (
                  <Link key={sim.id} href={`/property/${sim.id}`} style={{ textDecoration: 'none', display: 'block', background: '#fff', border: '1px solid #eae9e4', borderRadius: 14, overflow: 'hidden', transition: 'box-shadow .2s, transform .2s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = 'none'; (e.currentTarget as HTMLAnchorElement).style.transform = 'none' }}
                  >
                    <div style={{ position: 'relative', paddingBottom: '57%', background: '#f0f0ec', overflow: 'hidden' }}>
                      {simPhotos[0]
                        ? <img src={simPhotos[0]} alt={sim.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}/>
                        : <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc', fontSize: 12 }}>No photo</div>
                      }
                      <span style={{ position: 'absolute', top: 10, left: 10, background: sim.listing_intent === 'rent' ? '#1d4ed8' : '#16a34a', color: '#fff', fontSize: 9, fontWeight: 800, padding: '2px 8px', borderRadius: 20, letterSpacing: '.06em' }}>
                        {sim.listing_intent === 'rent' ? 'RENT' : 'SALE'}
                      </span>
                    </div>
                    <div style={{ padding: '12px 14px' }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#16a34a', marginBottom: 3 }}>{formatETB(simPrice)}{sim.listing_intent === 'rent' && <span style={{ fontSize: 11, fontWeight: 400, color: '#aaa' }}>/mo</span>}</div>
                      <div style={{ display: 'flex', gap: 10, fontSize: 12, color: '#666', marginBottom: 6 }}>
                        {sim.bedrooms != null && <span><Bed size={11} style={{ display: 'inline', marginRight: 3 }}/>{sim.bedrooms} bd</span>}
                        {sim.bathrooms != null && <span><Bath size={11} style={{ display: 'inline', marginRight: 3 }}/>{sim.bathrooms} ba</span>}
                        {sim.size_sqm != null && <span><Square size={11} style={{ display: 'inline', marginRight: 3 }}/>{sim.size_sqm} m²</span>}
                      </div>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: '#222', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 3 }}>{sim.title}</div>
                      <div style={{ fontSize: 11.5, color: '#999', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <MapPin size={10} color="#ccc"/>{(sim as any).neighborhood?.name || sim.city}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

      </div>

      {/* Mobile sticky contact bar */}
      <div className="mobile-sticky-bar" style={{ display: 'none', position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: '1px solid #eae9e4', padding: '12px 16px', zIndex: 50, boxShadow: '0 -4px 20px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#16a34a', lineHeight: 1 }}>{formatETB(price)}</div>
            {property.listing_intent === 'rent' && <div style={{ fontSize: 11, color: '#aaa' }}>per month</div>}
          </div>
          {(property.agent as any)?.profile?.phone && (
            <a href={`tel:${(property.agent as any).profile.phone}`}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#0d2318', color: '#fff', padding: '11px 18px', borderRadius: 10, textDecoration: 'none', fontSize: 14, fontWeight: 700, flexShrink: 0 }}
            >
              <Phone size={15}/> Call
            </a>
          )}
          <button onClick={() => document.querySelector('.property-contact-form')?.scrollIntoView({ behavior: 'smooth' })}
            style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '11px 18px', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}
          >
            Contact
          </button>
        </div>
      </div>
    </div>
  )
}
