'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { Check, ArrowRight, ArrowLeft, Home, MapPin, Image, Sparkles, Building2 } from 'lucide-react'
import { PhotoUpload } from '@/components/property/PhotoUpload'

// ── Types ─────────────────────────────────────────────────────────────────────
interface ListingForm {
  // Step 1 — Basics
  title: string
  title_amharic: string
  listing_intent: 'sale' | 'rent'
  property_type: string
  price_etb: string
  rent_per_month_etb: string
  is_negotiable: boolean
  // Step 2 — Details
  bedrooms: string
  bathrooms: string
  size_sqm: string
  year_built: string
  floor_number: string
  amenities: string[]
  description: string
  // Step 3 — Location
  city: string
  neighborhood_name: string
  address: string
  // Step 4 — Photos (URLs for now)
  cover_image_url: string
  photos: string[]
  video_url: string
  lat: string
  lng: string
}

const INITIAL: ListingForm = {
  title: '', title_amharic: '', listing_intent: 'sale', property_type: 'apartment',
  price_etb: '', rent_per_month_etb: '', is_negotiable: false,
  bedrooms: '', bathrooms: '', size_sqm: '', year_built: '', floor_number: '',
  amenities: [], description: '',
  city: 'Addis Ababa', neighborhood_name: '', address: '',
  cover_image_url: '',
  photos: [],
  video_url: '',
  lat: '',
  lng: '',
}

const PROPERTY_TYPES = ['apartment','villa','house','condominium','land','office','commercial','warehouse']
const CITIES = ['Addis Ababa','Dire Dawa','Hawassa','Bahir Dar','Mekelle','Adama','Jimma']
const NEIGHBORHOODS = ['Bole','Kazanchis','Megenagna','CMC','Sarbet','Gerji','Piassa','Kolfe','Lebu','Lideta','Kirkos','Yeka']
const AMENITIES_LIST = ['Generator','Security guard','Parking','Elevator','Swimming pool','Gym','Internet','Water tank','CCTV','Balcony','Garden','Furnished']
const STEPS = [
  { id: 1, label: 'Basics', icon: <Home size={16}/> },
  { id: 2, label: 'Details', icon: <Building2 size={16}/> },
  { id: 3, label: 'Location', icon: <MapPin size={16}/> },
  { id: 4, label: 'Photos', icon: <Image size={16}/> },
  { id: 5, label: 'AI Write', icon: <Sparkles size={16}/> },
]

// ── Shared input style ────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px', border: '1.5px solid #e0dfd9',
  borderRadius: 10, fontSize: 14, outline: 'none', color: '#111',
  background: '#fff', transition: 'border .15s', fontFamily: 'inherit',
}

function Input({ label, value, onChange, placeholder, type = 'text', required }: any) {
  return (
    <div>
      <label style={{ fontSize: 13, fontWeight: 600, color: '#333', display: 'block', marginBottom: 6 }}>
        {label}{required && <span style={{ color: '#dc2626' }}> *</span>}
      </label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required}
        style={inputStyle}
        onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#16a34a'}
        onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#e0dfd9'}
      />
    </div>
  )
}

function Select({ label, value, onChange, options, required }: any) {
  return (
    <div>
      <label style={{ fontSize: 13, fontWeight: 600, color: '#333', display: 'block', marginBottom: 6 }}>
        {label}{required && <span style={{ color: '#dc2626' }}> *</span>}
      </label>
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ ...inputStyle, cursor: 'pointer' }}
        onFocus={e => (e.target as HTMLSelectElement).style.borderColor = '#16a34a'}
        onBlur={e => (e.target as HTMLSelectElement).style.borderColor = '#e0dfd9'}
      >
        {options.map((o: string) => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
      </select>
    </div>
  )
}

// ── Step components ───────────────────────────────────────────────────────────
function Step1({ form, set }: { form: ListingForm; set: (f: Partial<ListingForm>) => void }) {
  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111', margin: 0 }}>Property basics</h2>

      {/* Intent toggle */}
      <div>
        <label style={{ fontSize: 13, fontWeight: 600, color: '#333', display: 'block', marginBottom: 8 }}>Listing type *</label>
        <div style={{ display: 'flex', gap: 10 }}>
          {(['sale', 'rent'] as const).map(i => (
            <button key={i} type="button" onClick={() => set({ listing_intent: i })}
              style={{ flex: 1, padding: '12px', borderRadius: 10, border: `2px solid ${form.listing_intent === i ? '#16a34a' : '#e0dfd9'}`, background: form.listing_intent === i ? '#f0fdf4' : '#fff', fontSize: 14, fontWeight: 600, color: form.listing_intent === i ? '#16a34a' : '#888', cursor: 'pointer', transition: 'all .15s', fontFamily: 'inherit' }}
            >
              {i === 'sale' ? '🏠 For Sale' : '🔑 For Rent'}
            </button>
          ))}
        </div>
      </div>

      <Input label="Property title (English)" value={form.title} onChange={(v: string) => set({ title: v })} placeholder="e.g. Modern 3-bedroom apartment in Bole" required/>
      <Input label="Property title (Amharic)" value={form.title_amharic} onChange={(v: string) => set({ title_amharic: v })} placeholder="ለምሳሌ፡ ዘመናዊ 3 መኝታ ክፍል ቤት ቦሌ"/>
      <Select label="Property type" value={form.property_type} onChange={(v: string) => set({ property_type: v })} options={PROPERTY_TYPES} required/>

      {/* Price */}
      {form.listing_intent === 'sale' ? (
        <Input label="Sale price (ETB)" type="number" value={form.price_etb} onChange={(v: string) => set({ price_etb: v })} placeholder="e.g. 3500000" required/>
      ) : (
        <Input label="Monthly rent (ETB)" type="number" value={form.rent_per_month_etb} onChange={(v: string) => set({ rent_per_month_etb: v })} placeholder="e.g. 25000" required/>
      )}

      <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14, color: '#333' }}>
        <input type="checkbox" checked={form.is_negotiable} onChange={e => set({ is_negotiable: e.target.checked })} style={{ width: 16, height: 16, accentColor: '#16a34a' }}/>
        Price is negotiable
      </label>
    </div>
  )
}

function Step2({ form, set }: { form: ListingForm; set: (f: Partial<ListingForm>) => void }) {
  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111', margin: 0 }}>Property details</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Input label="Bedrooms" type="number" value={form.bedrooms} onChange={(v: string) => set({ bedrooms: v })} placeholder="e.g. 3"/>
        <Input label="Bathrooms" type="number" value={form.bathrooms} onChange={(v: string) => set({ bathrooms: v })} placeholder="e.g. 2"/>
        <Input label="Size (m²)" type="number" value={form.size_sqm} onChange={(v: string) => set({ size_sqm: v })} placeholder="e.g. 120"/>
        <Input label="Year built" type="number" value={form.year_built} onChange={(v: string) => set({ year_built: v })} placeholder="e.g. 2020"/>
        <Input label="Floor number" type="number" value={form.floor_number} onChange={(v: string) => set({ floor_number: v })} placeholder="e.g. 4"/>
      </div>

      {/* Amenities */}
      <div>
        <label style={{ fontSize: 13, fontWeight: 600, color: '#333', display: 'block', marginBottom: 10 }}>Amenities</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {AMENITIES_LIST.map(a => {
            const selected = form.amenities.includes(a)
            return (
              <button key={a} type="button"
                onClick={() => set({ amenities: selected ? form.amenities.filter(x => x !== a) : [...form.amenities, a] })}
                style={{ padding: '7px 14px', borderRadius: 20, border: `1.5px solid ${selected ? '#16a34a' : '#e0dfd9'}`, background: selected ? '#f0fdf4' : '#fff', fontSize: 13, color: selected ? '#16a34a' : '#666', cursor: 'pointer', fontWeight: selected ? 600 : 400, transition: 'all .15s', fontFamily: 'inherit' }}
              >
                {selected && '✓ '}{a}
              </button>
            )
          })}
        </div>
      </div>

      {/* Description */}
      <div>
        <label style={{ fontSize: 13, fontWeight: 600, color: '#333', display: 'block', marginBottom: 6 }}>Description</label>
        <textarea value={form.description} onChange={e => set({ description: e.target.value })} rows={4}
          placeholder="Describe the property — location highlights, condition, nearby landmarks..."
          style={{ ...inputStyle, resize: 'vertical' }}
          onFocus={e => (e.target as HTMLTextAreaElement).style.borderColor = '#16a34a'}
          onBlur={e => (e.target as HTMLTextAreaElement).style.borderColor = '#e0dfd9'}
        />
        <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>Or skip this — AI will write it for you in Step 5</div>
      </div>
    </div>
  )
}

function Step3({ form, set }: { form: ListingForm; set: (f: Partial<ListingForm>) => void }) {
  // Neighborhood coordinates lookup
  const HOOD_COORDS: Record<string, {lat: number, lng: number}> = {
    'Bole': {lat: 9.0192, lng: 38.7892}, 'Kazanchis': {lat: 9.0238, lng: 38.7614},
    'Megenagna': {lat: 9.0367, lng: 38.7991}, 'CMC': {lat: 9.0522, lng: 38.8119},
    'Sarbet': {lat: 9.0024, lng: 38.7502}, 'Gerji': {lat: 9.0298, lng: 38.8201},
    'Piassa': {lat: 9.0336, lng: 38.7469}, 'Kolfe': {lat: 9.0154, lng: 38.7021},
    'Lebu': {lat: 8.9735, lng: 38.7234}, 'Lideta': {lat: 9.0168, lng: 38.7389},
    'Kirkos': {lat: 9.0134, lng: 38.7571}, 'Yeka': {lat: 9.0512, lng: 38.8042},
  }

  function selectNeighborhood(n: string) {
    const coords = HOOD_COORDS[n]
    set({ neighborhood_name: n, lat: coords ? coords.lat.toString() : form.lat, lng: coords ? coords.lng.toString() : form.lng })
  }

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111', margin: 0 }}>Location</h2>
      <Select label="City" value={form.city} onChange={(v: string) => set({ city: v })} options={CITIES} required/>
      <div>
        <label style={{ fontSize: 13, fontWeight: 600, color: '#333', display: 'block', marginBottom: 8 }}>Neighborhood</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {NEIGHBORHOODS.map(n => {
            const selected = form.neighborhood_name === n
            return (
              <button key={n} type="button" onClick={() => selectNeighborhood(n)}
                style={{ padding: '7px 14px', borderRadius: 20, border: `1.5px solid ${selected ? '#16a34a' : '#e0dfd9'}`, background: selected ? '#f0fdf4' : '#fff', fontSize: 13, color: selected ? '#16a34a' : '#666', cursor: 'pointer', fontWeight: selected ? 600 : 400, transition: 'all .15s', fontFamily: 'inherit' }}
              >
                {n}
              </button>
            )
          })}
        </div>
      </div>
      <Input label="Full address" value={form.address} onChange={(v: string) => set({ address: v })} placeholder="e.g. Bole Sub City, Woreda 03, House No. 456"/>

      {/* Exact coordinates */}
      <div>
        <label style={{ fontSize: 13, fontWeight: 600, color: '#333', display: 'block', marginBottom: 6 }}>
          Exact coordinates <span style={{ fontSize: 11, color: '#aaa', fontWeight: 400 }}>(optional — auto-filled from neighborhood)</span>
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Input label="Latitude" value={form.lat} onChange={(v: string) => set({ lat: v })} placeholder="e.g. 9.0192"/>
          <Input label="Longitude" value={form.lng} onChange={(v: string) => set({ lng: v })} placeholder="e.g. 38.7892"/>
        </div>
        {form.lat && form.lng && (
          <div style={{ fontSize: 12, color: '#16a34a', marginTop: 6 }}>
            ✓ Location set — property will show on map
          </div>
        )}
        <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>
          To get exact coordinates: open Google Maps → right click on your property → click the coordinates shown
        </div>
      </div>
    </div>
  )
}

function Step4({ form, set }: { form: ListingForm; set: (f: Partial<ListingForm>) => void }) {
  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111', margin: 0 }}>Photos & Video</h2>

      {/* Photos */}
      <div>
        <label style={{ fontSize: 13, fontWeight: 600, color: '#333', display: 'block', marginBottom: 6 }}>
          Property photos <span style={{ fontSize: 11, color: '#aaa', fontWeight: 400 }}>(first photo = cover image)</span>
        </label>
        <PhotoUpload
          onUpload={(urls) => set({ cover_image_url: urls[0] || '', photos: urls })}
          maxPhotos={8}
          existingPhotos={form.photos || (form.cover_image_url ? [form.cover_image_url] : [])}
        />
      </div>

      {/* Video URL */}
      <div>
        <label style={{ fontSize: 13, fontWeight: 600, color: '#333', display: 'block', marginBottom: 6 }}>
          Video tour URL <span style={{ fontSize: 11, color: '#aaa', fontWeight: 400 }}>(YouTube or Vimeo — optional)</span>
        </label>
        <input
          type="url"
          value={form.video_url}
          onChange={e => set({ video_url: e.target.value })}
          placeholder="https://www.youtube.com/watch?v=..."
          style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e0dfd9', borderRadius: 10, fontSize: 14, outline: 'none', color: '#111', background: '#fff', fontFamily: 'inherit', transition: 'border .15s' }}
          onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#16a34a'}
          onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#e0dfd9'}
        />
        {form.video_url && (
          <div style={{ fontSize: 12, color: '#16a34a', marginTop: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
            ✓ Video tour will be shown on your listing page
          </div>
        )}
        <div style={{ fontSize: 11, color: '#aaa', marginTop: 6 }}>
          Upload your property video to YouTube first, then paste the link here
        </div>
      </div>
    </div>
  )
}

function Step5({ form, set, onGenerate, generating, generated }: any) {
  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Sparkles size={24} color="#16a34a"/>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111', margin: 0 }}>AI listing writer</h2>
      </div>
      <p style={{ fontSize: 14, color: '#666', margin: 0, lineHeight: 1.6 }}>
        Claude AI will write a compelling listing description in Amharic and English based on your property details.
      </p>
      <button type="button" onClick={onGenerate} disabled={generating}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, background: generating ? '#9ca3af' : '#16a34a', color: '#fff', border: 'none', padding: '14px', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: generating ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'all .15s' }}
      >
        <Sparkles size={16}/> {generating ? 'Claude is writing...' : 'Write with Claude AI'}
      </button>
      {generated && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#16a34a', marginBottom: 8 }}>✓ AI-generated description:</div>
          <textarea value={form.description} onChange={e => set({ description: e.target.value })} rows={8}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
          <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>You can edit the AI-generated text above before publishing</div>
        </div>
      )}
      {!generated && !generating && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: 14, fontSize: 13, color: '#15803d', lineHeight: 1.6 }}>
          💡 Claude will use your property details — type, size, location, amenities — to write a professional listing in both languages. Takes about 10 seconds.
        </div>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function NewListingPage() {
  const router = useRouter()
  const { profile, loading } = useAuth(true)
  const [step, setStep] = useState(1)
  const [form, setFormState] = useState<ListingForm>(INITIAL)
  const [submitting, setSubmitting] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState(false)
  const [error, setError] = useState('')

  function set(partial: Partial<ListingForm>) {
    setFormState(prev => ({ ...prev, ...partial }))
  }

  async function generateDescription() {
    setGenerating(true)
    try {
      const prompt = `Write a compelling real estate listing description for this Ethiopian property:
Type: ${form.property_type}
Intent: For ${form.listing_intent}
Location: ${form.neighborhood_name}, ${form.city}
Size: ${form.size_sqm}m²
Bedrooms: ${form.bedrooms}
Bathrooms: ${form.bathrooms}
Price: ETB ${form.listing_intent === 'sale' ? form.price_etb : form.rent_per_month_etb}
Amenities: ${form.amenities.join(', ')}

Write two paragraphs:
1. English description (professional and appealing)
2. Amharic description (አማርኛ)

Keep each paragraph under 100 words.`

      const res = await fetch('/api/claude/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      })
      const data = await res.json()
      if (data.text) {
        set({ description: data.text })
        setGenerated(true)
      } else {
        throw new Error('No response')
      }
    } catch (e) {
      setError('AI generation failed. Please write description manually.')
    } finally {
      setGenerating(false)
    }
  }

  async function handleSubmit() {
    setSubmitting(true)
    setError('')
    const sb = createClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    // Find neighborhood id
    const { data: hood } = await sb.from('neighborhoods')
      .select('id').eq('name', form.neighborhood_name).single()

    // Make sure agent record exists first
    await sb.from('agents').upsert({
      id: user.id,
      agency_name: profile?.full_name || 'My Agency',
      subscription_plan: 'free',
      is_verified: false,
    })

    const { data: property, error: err } = await sb.from('properties').insert({
      title: form.title,
      title_amharic: form.title_amharic || null,
      listing_intent: form.listing_intent,
      property_type: form.property_type,
      price_etb: form.price_etb ? parseFloat(form.price_etb) : null,
      rent_per_month_etb: form.rent_per_month_etb ? parseFloat(form.rent_per_month_etb) : null,
      is_negotiable: form.is_negotiable,
      bedrooms: form.bedrooms ? parseInt(form.bedrooms) : null,
      bathrooms: form.bathrooms ? parseInt(form.bathrooms) : null,
      size_sqm: form.size_sqm ? parseFloat(form.size_sqm) : null,
      year_built: form.year_built ? parseInt(form.year_built) : null,
      floor_number: form.floor_number ? parseInt(form.floor_number) : null,
      amenities: form.amenities,
      description: form.description || null,
      city: form.city,
      address: form.address || null,
      neighborhood_id: hood?.id || null,
      cover_image_url: form.cover_image_url || null,
      video_url: form.video_url || null,
      coordinates: form.lat && form.lng ? `SRID=4326;POINT(${form.lng} ${form.lat})` : null,
      lat: form.lat ? parseFloat(form.lat) : null,
      lng: form.lng ? parseFloat(form.lng) : null,
      agent_id: user.id,
      status: 'pending_review',
      listed_at: new Date().toISOString(),
    }).select().single()

    if (err) {
      setError(err.message)
      setSubmitting(false)
      return
    }

    router.push('/dashboard?listing=created')
  }

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#aaa', fontSize: 14 }}>Loading...</div>
  if (!profile || profile.role !== 'agent') return (
    <div style={{ textAlign: 'center', padding: '80px 24px' }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: '#111', marginBottom: 12 }}>Agents only</h2>
      <p style={{ fontSize: 15, color: '#888' }}>You need an agent account to list properties.</p>
    </div>
  )

  return (
    <div style={{ background: '#f9f9f7', minHeight: '100vh', padding: '32px 24px' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#111', margin: '0 0 6px', letterSpacing: '-.02em' }}>Add new listing</h1>
          <p style={{ fontSize: 14, color: '#888', margin: 0 }}>Fill in the details — Claude AI will help write the description</p>
        </div>

        {/* Step indicators */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 32, background: '#fff', borderRadius: 12, border: '1px solid #eae9e4', overflow: 'hidden' }}>
          {STEPS.map(({ id, label, icon }) => {
            const done = step > id
            const active = step === id
            return (
              <div key={id} style={{ flex: 1, padding: '12px 8px', textAlign: 'center', background: active ? '#16a34a' : done ? '#f0fdf4' : '#fff', borderRight: id < 5 ? '1px solid #eae9e4' : 'none', cursor: done ? 'pointer' : 'default', transition: 'all .2s' }}
                onClick={() => done && setStep(id)}
              >
                <div style={{ color: active ? '#fff' : done ? '#16a34a' : '#aaa', display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
                  {done ? <Check size={16}/> : icon}
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: active ? '#fff' : done ? '#16a34a' : '#aaa' }}>{label}</div>
              </div>
            )
          })}
        </div>

        {/* Form card */}
        <div style={{ background: '#fff', border: '1px solid #eae9e4', borderRadius: 16, padding: 32, marginBottom: 20 }}>
          {step === 1 && <Step1 form={form} set={set}/>}
          {step === 2 && <Step2 form={form} set={set}/>}
          {step === 3 && <Step3 form={form} set={set}/>}
          {step === 4 && <Step4 form={form} set={set}/>}
          {step === 5 && <Step5 form={form} set={set} onGenerate={generateDescription} generating={generating} generated={generated}/>}
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: '#dc2626', marginBottom: 16 }}>{error}</div>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
          {step > 1 ? (
            <button type="button" onClick={() => setStep(s => s - 1)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1.5px solid #e0dfd9', color: '#555', padding: '12px 20px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              <ArrowLeft size={15}/> Back
            </button>
          ) : <div/>}

          {step < 5 ? (
            <button type="button" onClick={() => setStep(s => s + 1)}
              disabled={step === 1 && (!form.title || (!form.price_etb && !form.rent_per_month_etb))}
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#16a34a', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', opacity: step === 1 && (!form.title || (!form.price_etb && !form.rent_per_month_etb)) ? 0.5 : 1 }}
            >
              Continue <ArrowRight size={15}/>
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={submitting}
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: submitting ? '#9ca3af' : '#16a34a', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
            >
              <Check size={16}/> {submitting ? 'Publishing...' : 'Publish listing'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
