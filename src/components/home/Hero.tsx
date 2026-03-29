'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, MapPin, TrendingUp, Home, Building2, Map, ChevronDown, Check } from 'lucide-react'

const CITIES      = ['Addis Ababa','Dire Dawa','Hawassa','Bahir Dar','Mekelle','Adama','Jimma']
const TYPES       = ['Any type','Apartment','Villa','House','Condominium','Commercial','Land','Office']
const BEDS        = ['Any beds','Studio','1+','2+','3+','4+','5+']
const SALE_PRICES = ['Any price','Under ETB 1M','ETB 1M–3M','ETB 3M–6M','ETB 6M–10M','Over ETB 10M']
const RENT_PRICES = ['Any price','Under ETB 5K','ETB 5K–15K','ETB 15K–30K','ETB 30K–60K','Over ETB 60K']

// Compact single-line dropdown — no stacked label
function Dropdown({ id, value, options, onChange, icon, placeholder, active, setActive }: {
  id: string; value: string; options: string[]; onChange: (v: string) => void;
  icon: React.ReactNode; placeholder: string;
  active: string | null; setActive: (v: string | null) => void
}) {
  const open    = active === id
  const changed = value !== options[0]

  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <button
        onClick={() => setActive(open ? null : id)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '0 14px', height: 52, cursor: 'pointer',
          background: 'transparent', border: 'none',
          fontFamily: 'inherit', transition: 'background .15s',
          borderRadius: 0, whiteSpace: 'nowrap',
        }}
        onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = '#f7f7f5'}
        onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}
      >
        <span style={{ color: changed ? '#16a34a' : '#ccc', display: 'flex', flexShrink: 0 }}>{icon}</span>
        <span style={{ fontSize: 13.5, color: changed ? '#15803d' : '#444', fontWeight: changed ? 600 : 400 }}>
          {changed ? value : placeholder}
        </span>
        <ChevronDown size={11} color="#bbb" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}/>
      </button>

      {open && (
        <>
          <div onClick={() => setActive(null)} style={{ position: 'fixed', inset: 0, zIndex: 998 }}/>
          <div style={{
            position: 'absolute', top: 'calc(100% + 6px)', left: 0,
            background: '#fff', border: '1px solid #e5e4df',
            borderRadius: 12, boxShadow: '0 16px 48px rgba(0,0,0,0.14)',
            zIndex: 999, overflow: 'hidden', minWidth: 200,
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
                  : <span style={{ width: 13, flexShrink: 0 }}/>}
                {opt}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// Thin divider between filter items
function Divider() {
  return <div style={{ width: 1, height: 24, background: '#eeede9', flexShrink: 0, alignSelf: 'center' }}/>
}

export function Hero() {
  const [intent, setIntent]     = useState<'sale' | 'rent'>('sale')
  const [city, setCity]         = useState('Addis Ababa')
  const [type, setType]         = useState('Any type')
  const [price, setPrice]       = useState('Any price')
  const [beds, setBeds]         = useState('Any beds')
  const [activeDD, setActiveDD] = useState<string | null>(null)

  function buildUrl() {
    const p = new URLSearchParams({ intent })
    if (city !== 'Addis Ababa') p.set('city', city)
    if (type !== 'Any type') p.set('types', type.toLowerCase())
    if (beds !== 'Any beds' && beds !== 'Studio') p.set('min_beds', beds.replace('+', ''))
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
      padding: 'clamp(32px, 4vw, 56px) 24px clamp(24px, 3vw, 40px)',
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

      <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative' }}>

        {/* Headline */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1 style={{
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontSize: 'clamp(32px, 5vw, 58px)',
            fontWeight: 400, color: '#fff',
            lineHeight: 1.06, letterSpacing: '-.02em', margin: 0,
          }}>
            Find Your Home{' '}
            <span style={{ color: '#f59e0b' }}>in Ethiopia</span>
          </h1>
        </div>

        {/* Search card */}
        <div style={{
          background: '#fff',
          borderRadius: 14,
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          overflow: 'visible',
        }}>
          {/* Single filter row — desktop */}
          <div className="hero-filter-bar-desktop" style={{ alignItems: 'center', overflow: 'visible' }}>

            {/* Buy / Rent inline toggle */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '0 6px 0 10px', gap: 2, flexShrink: 0 }}>
              {(['sale', 'rent'] as const).map(i => (
                <button key={i}
                  onClick={() => { setIntent(i); setPrice('Any price') }}
                  style={{
                    padding: '6px 14px', border: 'none', borderRadius: 8,
                    cursor: 'pointer', fontSize: 13, fontWeight: 700,
                    fontFamily: 'inherit', transition: 'all .15s',
                    background: intent === i ? '#f0fdf4' : 'transparent',
                    color: intent === i ? '#16a34a' : '#bbb',
                  }}>
                  {i === 'sale' ? 'Buy' : 'Rent'}
                </button>
              ))}
            </div>

            <Divider/>
            <Dropdown id="city"  value={city}  options={CITIES}   onChange={setCity}  icon={<MapPin size={13}/>}    placeholder="Location"     active={activeDD} setActive={setActiveDD}/>
            <Divider/>
            <Dropdown id="type"  value={type}  options={TYPES}    onChange={setType}  icon={<Building2 size={13}/>} placeholder="Property type" active={activeDD} setActive={setActiveDD}/>
            <Divider/>
            <Dropdown id="price" value={price} options={intent === 'sale' ? SALE_PRICES : RENT_PRICES} onChange={setPrice} icon={<TrendingUp size={13}/>} placeholder="Price range" active={activeDD} setActive={setActiveDD}/>
            <Divider/>
            <Dropdown id="beds"  value={beds}  options={BEDS}     onChange={setBeds}  icon={<Home size={13}/>}      placeholder="Bedrooms"     active={activeDD} setActive={setActiveDD}/>

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 10px 0 8px', marginLeft: 'auto', flexShrink: 0 }}>
              <Link href="/search?view=map"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#bbb', padding: '8px 10px', borderRadius: 8, textDecoration: 'none', transition: 'all .12s', border: '1px solid #eae9e4' }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#16a34a'; (e.currentTarget as HTMLAnchorElement).style.borderColor = '#16a34a' }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#bbb'; (e.currentTarget as HTMLAnchorElement).style.borderColor = '#eae9e4' }}
              ><Map size={12}/> Map</Link>

              <Link href={buildUrl()}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  background: '#16a34a', color: '#fff',
                  padding: '10px 22px', borderRadius: 9,
                  fontSize: 14, fontWeight: 700, textDecoration: 'none',
                  transition: 'all .18s', whiteSpace: 'nowrap',
                  boxShadow: '0 2px 10px rgba(22,163,74,0.35)',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#15803d'; (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#16a34a'; (e.currentTarget as HTMLAnchorElement).style.transform = 'none' }}
              ><Search size={14}/> Search</Link>
            </div>
          </div>

          {/* Mobile search button */}
          <div className="hero-filter-bar-mobile" style={{ padding: '12px' }}>
            <Link href="/search"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                background: '#16a34a', color: '#fff', borderRadius: 10,
                padding: '14px', fontSize: 16, fontWeight: 700, textDecoration: 'none',
              }}
            >
              <Search size={18}/> Search properties in Ethiopia
            </Link>
            <div style={{ display: 'flex', gap: 8, marginTop: 10, justifyContent: 'center' }}>
              <Link href="/search?intent=sale" style={{ flex: 1, textAlign: 'center', padding: '10px', background: '#f0fdf4', color: '#16a34a', borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: 'none', border: '1px solid #bbf7d0' }}>Buy</Link>
              <Link href="/search?intent=rent" style={{ flex: 1, textAlign: 'center', padding: '10px', background: '#f0fdf4', color: '#16a34a', borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: 'none', border: '1px solid #bbf7d0' }}>Rent</Link>
              <Link href="/search?view=map" style={{ flex: 1, textAlign: 'center', padding: '10px', background: '#f5f5f2', color: '#555', borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: 'none', border: '1px solid #e8e7e2' }}>Map</Link>
            </div>
          </div>

          {/* Popular searches */}
          <div style={{ padding: '8px 16px 10px', display: 'flex', alignItems: 'center', gap: 6, borderTop: '1px solid #f5f5f2', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, color: '#ccc', fontWeight: 500 }}>Popular:</span>
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
