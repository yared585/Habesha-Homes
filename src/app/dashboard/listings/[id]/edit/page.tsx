'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { Check, ArrowLeft, Save, Trash2 } from 'lucide-react'
import { PhotoUpload } from '@/components/property/PhotoUpload'

const PROPERTY_TYPES = ['apartment','villa','house','condominium','land','office','commercial','warehouse']
const CITIES = ['Addis Ababa','Dire Dawa','Hawassa','Bahir Dar','Mekelle','Adama','Jimma']
const NEIGHBORHOODS = ['Bole','Kazanchis','Megenagna','CMC','Sarbet','Gerji','Piassa','Kolfe','Lebu','Lideta','Kirkos','Yeka']
const AMENITIES_LIST = ['Generator','Security guard','Parking','Elevator','Swimming pool','Gym','Internet','Water tank','CCTV','Balcony','Garden','Furnished']

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 14px', border: '1.5px solid #e0dfd9',
  borderRadius: 10, fontSize: 14, outline: 'none', color: '#111',
  background: '#fff', transition: 'border .15s', fontFamily: 'inherit',
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ fontSize: 13, fontWeight: 600, color: '#333', display: 'block', marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  )
}

const PLAN_LIMITS: Record<string, number> = { free: 3, basic: 10, pro: Infinity, premium: Infinity }

export default function EditListingPage() {
  const router = useRouter()
  const params = useParams()
  const { profile, loading } = useAuth(true)
  const [form, setForm] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [forbidden, setForbidden] = useState(false)

  useEffect(() => {
    if (params.id && profile) loadListing(params.id as string)
  }, [params.id, profile])

  async function loadListing(id: string) {
    const sb = createClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) return

    const { data } = await sb.from('properties').select('*').eq('id', id).single()
    if (!data) return

    // Ownership check — only the agent who owns it (or admin) can edit
    if (data.agent_id !== user.id && profile?.role !== 'admin') {
      setForbidden(true)
      return
    }

    setForm(data)
  }

  function set(partial: any) {
    setForm((p: any) => ({ ...p, ...partial }))
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    const sb = createClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) { setError('Not authenticated'); setSaving(false); return }

    // If listing was rejected, resubmit for review — but check limit first
    let newStatus: string | undefined
    if (form.status === 'rejected') {
      const planRaw = (profile as any)?.subscription_plan as string | undefined
      const plan = planRaw || 'free'
      const limit = PLAN_LIMITS[plan] ?? 3

      if (isFinite(limit)) {
        const { count } = await sb
          .from('properties')
          .select('*', { count: 'exact', head: true })
          .eq('agent_id', user.id)
          .not('status', 'in', '("rejected","withdrawn","expired")')

        if ((count || 0) >= limit) {
          setError(`You've reached your ${limit}-listing limit on the ${plan} plan. Upgrade to resubmit this listing.`)
          setSaving(false)
          return
        }
      }
      newStatus = 'pending_review'
    }

    const { error: err } = await sb
      .from('properties')
      .update({
        title: form.title,
        title_amharic: form.title_amharic,
        listing_intent: form.listing_intent,
        property_type: form.property_type,
        price_etb: form.price_etb ? parseFloat(form.price_etb) : null,
        rent_per_month_etb: form.rent_per_month_etb ? parseFloat(form.rent_per_month_etb) : null,
        is_negotiable: form.is_negotiable,
        bedrooms: form.bedrooms ? parseInt(form.bedrooms) : null,
        bathrooms: form.bathrooms ? parseInt(form.bathrooms) : null,
        size_sqm: form.size_sqm ? parseFloat(form.size_sqm) : null,
        description: form.description,
        city: form.city,
        address: form.address,
        amenities: form.amenities || [],
        cover_image_url: form.photos?.[0] || form.cover_image_url,
        photos: form.photos || [],
        video_url: form.video_url,
        updated_at: new Date().toISOString(),
        // Only set status if resubmitting a rejected listing
        ...(newStatus ? { status: newStatus } : {}),
      })
      // Ownership enforced at DB level too — agent_id must match
      .eq('id', form.id)
      .eq('agent_id', user.id)

    if (err) { setError(err.message); setSaving(false); return }
    setSuccess(true)
    setTimeout(() => router.push('/dashboard'), 1500)
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this listing? This cannot be undone.')) return
    setDeleting(true)
    const sb = createClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) return
    // Ownership enforced — agent_id must match
    await sb.from('properties').delete().eq('id', form.id).eq('agent_id', user.id)
    router.push('/dashboard')
  }

  if (loading || (!form && !forbidden)) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#aaa', fontSize: 14 }}>
      Loading listing...
    </div>
  )

  if (forbidden) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 12, color: '#111' }}>
      <div style={{ fontSize: 18, fontWeight: 700 }}>Access denied</div>
      <div style={{ fontSize: 14, color: '#888' }}>You don't have permission to edit this listing.</div>
      <button onClick={() => router.push('/dashboard')} style={{ marginTop: 8, padding: '9px 20px', background: '#1a3d2b', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontFamily: 'inherit' }}>
        Back to dashboard
      </button>
    </div>
  )

  return (
    <div style={{ background: '#f9f9f7', minHeight: '100vh', padding: '32px 24px' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => router.push('/dashboard')}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', border: '1px solid #eae9e4', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontSize: 13, color: '#555', fontFamily: 'inherit' }}
            >
              <ArrowLeft size={14}/> Back
            </button>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111', margin: 0 }}>Edit listing</h1>
          </div>
          <button onClick={handleDelete} disabled={deleting}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontSize: 13, color: '#dc2626', fontFamily: 'inherit' }}
          >
            <Trash2 size={14}/> {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>

        <div style={{ background: '#fff', border: '1px solid #eae9e4', borderRadius: 16, padding: 28, display: 'grid', gap: 20 }}>

          {/* Status badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: '#888' }}>Status:</span>
            <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: form.status === 'active' ? '#f0fdf4' : '#fef9ec', color: form.status === 'active' ? '#16a34a' : '#d97706' }}>
              {form.status}
            </span>
          </div>

          {/* Intent toggle */}
          <Field label="Listing type">
            <div style={{ display: 'flex', gap: 10 }}>
              {(['sale', 'rent'] as const).map(i => (
                <button key={i} type="button" onClick={() => set({ listing_intent: i })}
                  style={{ flex: 1, padding: '10px', borderRadius: 10, border: `2px solid ${form.listing_intent === i ? '#16a34a' : '#e0dfd9'}`, background: form.listing_intent === i ? '#f0fdf4' : '#fff', fontSize: 14, fontWeight: 600, color: form.listing_intent === i ? '#16a34a' : '#888', cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  {i === 'sale' ? '🏠 For Sale' : '🔑 For Rent'}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Title (English)">
            <input value={form.title || ''} onChange={e => set({ title: e.target.value })} style={inputStyle}
              onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#16a34a'}
              onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#e0dfd9'}
            />
          </Field>

          <Field label="Title (Amharic)">
            <input value={form.title_amharic || ''} onChange={e => set({ title_amharic: e.target.value })} style={inputStyle}
              onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#16a34a'}
              onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#e0dfd9'}
            />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Property type">
              <select value={form.property_type || ''} onChange={e => set({ property_type: e.target.value })}
                style={{ ...inputStyle, cursor: 'pointer' }}
                onFocus={e => (e.target as HTMLSelectElement).style.borderColor = '#16a34a'}
                onBlur={e => (e.target as HTMLSelectElement).style.borderColor = '#e0dfd9'}
              >
                {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </Field>
            <Field label={form.listing_intent === 'rent' ? 'Monthly rent (ETB)' : 'Sale price (ETB)'}>
              <input type="number" value={form.listing_intent === 'rent' ? (form.rent_per_month_etb || '') : (form.price_etb || '')}
                onChange={e => set(form.listing_intent === 'rent' ? { rent_per_month_etb: e.target.value } : { price_etb: e.target.value })}
                style={inputStyle}
                onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#16a34a'}
                onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#e0dfd9'}
              />
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
            {[
              { label: 'Bedrooms', key: 'bedrooms' },
              { label: 'Bathrooms', key: 'bathrooms' },
              { label: 'Size (m²)', key: 'size_sqm' },
            ].map(({ label, key }) => (
              <Field key={key} label={label}>
                <input type="number" value={form[key] || ''} onChange={e => set({ [key]: e.target.value })} style={inputStyle}
                  onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#16a34a'}
                  onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#e0dfd9'}
                />
              </Field>
            ))}
          </div>

          <Field label="City">
            <select value={form.city || ''} onChange={e => set({ city: e.target.value })}
              style={{ ...inputStyle, cursor: 'pointer' }}
              onFocus={e => (e.target as HTMLSelectElement).style.borderColor = '#16a34a'}
              onBlur={e => (e.target as HTMLSelectElement).style.borderColor = '#e0dfd9'}
            >
              {CITIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </Field>

          <Field label="Address">
            <input value={form.address || ''} onChange={e => set({ address: e.target.value })} style={inputStyle}
              onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#16a34a'}
              onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#e0dfd9'}
            />
          </Field>

          {/* Amenities */}
          <Field label="Amenities">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {AMENITIES_LIST.map(a => {
                const selected = (form.amenities || []).includes(a)
                return (
                  <button key={a} type="button"
                    onClick={() => set({ amenities: selected ? (form.amenities || []).filter((x: string) => x !== a) : [...(form.amenities || []), a] })}
                    style={{ padding: '6px 14px', borderRadius: 20, border: `1.5px solid ${selected ? '#16a34a' : '#e0dfd9'}`, background: selected ? '#f0fdf4' : '#fff', fontSize: 13, color: selected ? '#16a34a' : '#666', cursor: 'pointer', fontWeight: selected ? 600 : 400, fontFamily: 'inherit' }}
                  >
                    {selected && '✓ '}{a}
                  </button>
                )
              })}
            </div>
          </Field>

          {/* Description */}
          <Field label="Description">
            <textarea value={form.description || ''} onChange={e => set({ description: e.target.value })} rows={4}
              style={{ ...inputStyle, resize: 'vertical' }}
              onFocus={e => (e.target as HTMLTextAreaElement).style.borderColor = '#16a34a'}
              onBlur={e => (e.target as HTMLTextAreaElement).style.borderColor = '#e0dfd9'}
            />
          </Field>

          {/* Video URL */}
          <Field label="Video tour URL (YouTube or Vimeo)">
            <input value={form.video_url || ''} onChange={e => set({ video_url: e.target.value })}
              placeholder="https://www.youtube.com/watch?v=..."
              style={inputStyle}
              onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#16a34a'}
              onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#e0dfd9'}
            />
            {form.video_url && (
              <div style={{ fontSize: 12, color: '#16a34a', marginTop: 4 }}>✓ Video tour will be shown on your listing</div>
            )}
          </Field>

          {/* Photos */}
          <Field label="Photos">
            <PhotoUpload
              onUpload={(urls) => set({ photos: urls, cover_image_url: urls[0] || form.cover_image_url })}
              maxPhotos={8}
              existingPhotos={form.photos || (form.cover_image_url ? [form.cover_image_url] : [])}
            />
          </Field>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#dc2626' }}>{error}</div>
          )}

          {success && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#16a34a' }}>✓ Saved! Redirecting to dashboard...</div>
          )}

          <button onClick={handleSave} disabled={saving}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: saving ? '#9ca3af' : '#16a34a', color: '#fff', border: 'none', padding: '13px', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
          >
            <Save size={16}/> {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
