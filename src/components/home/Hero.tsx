'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, MapPin, TrendingUp, Home, Building2, Map, ChevronDown, Check } from 'lucide-react'

const CITIES      = ['Addis Ababa','Dire Dawa','Hawassa','Bahir Dar','Mekelle','Adama','Jimma']
const TYPES       = ['Any type','Apartment','Villa','House','Condominium','Commercial','Land','Office']
const BEDS        = ['Any beds','Studio','1+','2+','3+','4+','5+']
const SALE_PRICES = ['Any price','Under ETB 1M','ETB 1M–3M','ETB 3M–6M','ETB 6M–10M','Over ETB 10M']
const RENT_PRICES = ['Any price','Under ETB 5K','ETB 5K–15K','ETB 15K–30K','ETB 30K–60K','Over ETB 60K']
const FURNISHED   = ['Any','Furnished','Unfurnished','Semi-furnished']

// Dropdown — popup uses position:fixed so it escapes ANY parent clipping
function Dropdown({ id, label, value, options, onChange, icon, active, setActive }: {
  id: string; label: string; value: string; options: string[]; onChange: (v: string) => void;
  icon: React.ReactNode; active: string | null; setActive: (v: string | null) => void
}) {
  const open = active === id
  const changed = value !== options[0]

  return (
    <div style={{ position: 'relative', flex: '1 1 0', minWidth: 0 }}>
      {/* Trigger button */}
      <button
        onClick={() => setActive(open ? null : id)}
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
          width: '100%', padding: '10px 14px 9px', cursor: 'pointer',
          background: 'transparent', border: 'none', fontFamily: 'inherit',
          transition: 'background .15s', borderRadius: 10,
        }}
        onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = '#f5f5f2'}
        onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}
      >
        <span style={{ fontSize: 10, fontWeight: 600, color: '#aaa', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 2 }}>{label}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, width: '100%' }}>
          <span style={{ color: changed ? '#16a34a' : '#ccc', display: 'flex', flexShrink: 0 }}>{icon}</span>
          <span style={{ fontSize: 13.5, color: changed ? '#15803d' : '#333', fontWeight: changed ? 600 : 400, flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</span>
          <ChevronDown size={11} color="#bbb" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s', flexShrink: 0 }}/>
        </span>
      </button>

      {/* Dropdown panel */}
      {open && (
        <>
          <div onClick={() => setActive(null)} style={{ position: 'fixed', inset: 0, zIndex: 998 }}/>
          <div style={{
            position: 'absolute', top: 'calc(100% + 6px)', left: 0,
            background: '#fff', border: '1px solid #e5e4df',
            borderRadius: 12, boxShadow: '0 16px 48px rgba(0,0,0,0.16)',
            zIndex: 999, overflow: 'hidden', minWidth: 192,
          }}>
            {options.map(opt => (
              <button key={opt} onClick={() => { onChange(opt); setActive(null) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 9, width: '100%',
                  padding: '10px 14px', border: 'none', fontSize: 13.5,
                  background: opt === value ? '#f0fdf4' : 'transparent',
                  color: opt === value ? '#15803d' : '#333',
                  cursor: 'pointer', fontWeight: opt === value ? 600 : 400,
                  fontFamily: 'inherit', transition: 'background .1s',
                }}
                onMouseEnter={e => { if (opt !== value) (e.currentTarget as HTMLButtonElement).style.background = '#f9f9f7' }}
                onMouseLeave={e => { if (opt !== value) (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
              >
                {opt === value
                  ? <Check size={13} color="#16a34a" style={{ flexShrink: 0 }}/>
                  : <span style={{ width: 13, flexShrink: 0 }}/>
                }
                {opt}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export function Hero() {
  const [intent, setIntent]       = useState<'sale' | 'rent'>('sale')
  const [city, setCity]           = useState('Addis Ababa')
  const [type, setType]           = useState('Any type')
  const [price, setPrice]         = useState('Any price')
  const [beds, setBeds]           = useState('Any beds')
  const [furnished, setFurnished] = useState('Any')
  const [activeDD, setActiveDD]   = useState<string | null>(null)

  function buildUrl() {
    const p = new URLSearchParams({ intent })
    if (city !== 'Addis Ababa') p.set('city', city)
    if (type !== 'Any type') p.set('types', type.toLowerCase())
    if (beds !== 'Any beds' && beds !== 'Studio') p.set('min_beds', beds.replace('+', ''))
    if (furnished !== 'Any') p.set('furnished', furnished.toLowerCase())
    if (price !== 'Any price') {
      const ranges: Record<string, [number, number]> = {
        'Under ETB 1M':[0,1000000],'ETB 1M–3M':[1000000,3000000],
        'ETB 3M–6M':[3000000,6000000],'ETB 6M–10M':[6000000,10000000],
        'Over ETB 10M':[10000000,999999999],'Under ETB 5K':[0,5000],
        'ETB 5K–15K':[5000,15000],'ETB 15K–30K':[15000,30000],
        'ETB 30K–60K':[30000,60000],'Over ETB 60K':[60000,999999],
      }
      const r = ranges[price]
      if (r) { p.set('min_price', r[0].toString()); p.set('max_price', r[1].toString()) }
    }
    return `/search?${p}`
  }

  return (
    <section style={{
      background: 'linear-gradient(165deg, #0c2016 0%, #0d2318 50%, #091b0e 100%)',
      padding: 'clamp(44px, 6vw, 72px) 24px clamp(40px, 5vw, 60px)',
      position: 'relative', overflow: 'visible',
    }}>
      {/* Dot grid */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.035,
          backgroundImage: 'radial-gradient(circle, #86efac 1px, transparent 1px)',
          backgroundSize: '28px 28px' }}/>
        <div style={{ position: 'absolute', top: -180, left: '50%', transform: 'translateX(-50%)',
          width: 860, height: 520, borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(22,163,74,0.16) 0%, transparent 65%)' }}/>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>

        {/* ── Headline ────────────────────────────────────────── */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>

          {/* Feature pills */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 22 }}>
            {[
              { dot: '#4ade80', text: 'AI Fraud Detection' },
              { dot: '#60a5fa', text: 'Instant Valuations' },
              { dot: '#fbbf24', text: 'Verified Agents' },
              { dot: '#e879f9', text: 'ቤት ፈልጉ' },
            ].map(({ dot, text }) => (
              <span key={text} style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 20, padding: '4px 12px', fontSize: 11,
                color: 'rgba(255,255,255,0.5)', fontWeight: 500,
              }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: dot, flexShrink: 0 }}/>
                {text}
              </span>
            ))}
          </div>

          {/* Serif headline */}
          <h1 style={{
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontSize: 'clamp(40px, 7vw, 76px)',
            fontWeight: 400, color: '#fff',
            lineHeight: 1.08, letterSpacing: '-.01em', margin: 0,
          }}>
            Find Your Home{' '}
            <em style={{ color: '#4ade80', fontStyle: 'italic' }}>in Ethiopia</em>
          </h1>
        </div>

        {/* ── Search card ──────────────────────────────────────── */}
        {/* IMPORTANT: no overflow:hidden here — dropdowns must escape freely */}
        <div style={{
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04)',
          marginBottom: 40,
        }}>
          {/* Buy / Rent tabs */}
          <div style={{ display: 'flex', padding: '12px 14px 0', gap: 4 }}>
            {(['sale', 'rent'] as const).map(i => (
              <button key={i}
                onClick={() => { setIntent(i); setPrice('Any price'); setFurnished('Any') }}
                style={{
                  padding: '7px 20px', border: 'none', borderRadius: '8px 8px 0 0',
                  cursor: 'pointer', fontSize: 13.5, fontWeight: 700,
                  fontFamily: 'inherit', transition: 'all .15s',
                  background: intent === i ? '#f0fdf4' : 'transparent',
                  color: intent === i ? '#16a34a' : '#aaa',
                  borderBottom: intent === i ? '2px solid #16a34a' : '2px solid transparent',
                }}>
                {i === 'sale' ? 'Buy' : 'Rent'}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: '#f0f0ee', margin: '0 14px' }}/>

          {/* Filter row — NO overflow:hidden so dropdowns open freely */}
          <div style={{ display: 'flex', alignItems: 'stretch', padding: '4px 8px' }}>

            <Dropdown id="city"  label="Location" value={city}  options={CITIES} onChange={setCity}  icon={<MapPin size={13}/>}    active={activeDD} setActive={setActiveDD}/>

            {/* Vertical divider */}
            <div style={{ width: 1, background: '#eeede9', margin: '10px 0', flexShrink: 0 }}/>

            <Dropdown id="type"  label="Property type" value={type}  options={TYPES}  onChange={setType}  icon={<Building2 size={13}/>} active={activeDD} setActive={setActiveDD}/>

            <div style={{ width: 1, background: '#eeede9', margin: '10px 0', flexShrink: 0 }}/>

            <Dropdown id="price" label="Price range" value={price} options={intent === 'sale' ? SALE_PRICES : RENT_PRICES} onChange={setPrice} icon={<TrendingUp size={13}/>} active={activeDD} setActive={setActiveDD}/>

            <div style={{ width: 1, background: '#eeede9', margin: '10px 0', flexShrink: 0 }}/>

            <Dropdown id="beds"  label="Bedrooms" value={beds}  options={BEDS}   onChange={setBeds}  icon={<Home size={13}/>}      active={activeDD} setActive={setActiveDD}/>

            {intent === 'rent' && (
              <>
                <div style={{ width: 1, background: '#eeede9', margin: '10px 0', flexShrink: 0 }}/>
                <Dropdown id="furn" label="Furnished" value={furnished} options={FURNISHED} onChange={setFurnished} icon={<Building2 size={13}/>} active={activeDD} setActive={setActiveDD}/>
              </>
            )}

            {/* Search button */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '8px 10px 8px 6px', flexShrink: 0, gap: 8 }}>
              <Link href="/search?view=map"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#bbb', padding: '8px 10px', borderRadius: 8, textDecoration: 'none', transition: 'all .12s', whiteSpace: 'nowrap', border: '1px solid #eae9e4' }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#16a34a'; (e.currentTarget as HTMLAnchorElement).style.borderColor = '#16a34a' }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#bbb'; (e.currentTarget as HTMLAnchorElement).style.borderColor = '#eae9e4' }}
              ><Map size={12}/> Map</Link>
              <Link href={buildUrl()}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: '#16a34a', color: '#fff',
                  padding: '10px 24px', borderRadius: 10,
                  fontSize: 14, fontWeight: 700, textDecoration: 'none',
                  transition: 'all .18s', whiteSpace: 'nowrap',
                  boxShadow: '0 2px 10px rgba(22,163,74,0.35)',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#15803d'; (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 6px 20px rgba(22,163,74,0.45)'; (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#16a34a'; (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 2px 10px rgba(22,163,74,0.35)'; (e.currentTarget as HTMLAnchorElement).style.transform = 'none' }}
              ><Search size={14}/> Search</Link>
            </div>
          </div>

          {/* Popular searches */}
          <div style={{ padding: '8px 16px 12px', display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', borderTop: '1px solid #f5f5f2' }}>
            <span style={{ fontSize: 11, color: '#ccc', fontWeight: 500, flexShrink: 0 }}>Popular:</span>
            {['Bole', 'Kazanchis', 'CMC', 'Megenagna', 'Land'].map(t => (
              <Link key={t} href={`/search?q=${encodeURIComponent(t)}`}
                style={{ fontSize: 11, color: '#999', padding: '3px 10px', border: '1px solid #eae9e4', borderRadius: 20, textDecoration: 'none', transition: 'all .12s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#16a34a'; (e.currentTarget as HTMLAnchorElement).style.color = '#16a34a' }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#eae9e4'; (e.currentTarget as HTMLAnchorElement).style.color = '#999' }}
              >{t}</Link>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
