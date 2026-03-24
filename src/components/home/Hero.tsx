'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, MapPin, TrendingUp, Home, Building2, Map, ChevronDown, Check, Sparkles } from 'lucide-react'
import { Counter } from '@/components/ui/DataViz'
import { useLiveStats } from '@/hooks/useProperties'

const CITIES = ['Addis Ababa','Dire Dawa','Hawassa','Bahir Dar','Mekelle','Adama','Jimma']
const TYPES  = ['Any type','Apartment','Villa','House','Condominium','Commercial','Land','Office']
const BEDS   = ['Any beds','Studio','1+','2+','3+','4+','5+']
const SALE_PRICES = ['Any price','Under ETB 1M','ETB 1M–3M','ETB 3M–6M','ETB 6M–10M','Over ETB 10M']
const RENT_PRICES = ['Any price','Under ETB 5K','ETB 5K–15K','ETB 15K–30K','ETB 30K–60K','Over ETB 60K']
const FURNISHED = ['Any','Furnished','Unfurnished','Semi-furnished']

function Dropdown({ id, value, options, onChange, icon, active, setActive }: any) {
  const open = active === id
  const changed = value !== options[0]
  return (
    <div style={{ position: 'relative', flex: 1, minWidth: 100 }}>
      <button onClick={() => setActive(open ? null : id)} style={{
        display: 'flex', alignItems: 'center', gap: 6, width: '100%',
        background: changed ? '#f0fdf4' : '#fff',
        border: `1.5px solid ${changed ? '#16a34a' : '#e0dfd9'}`,
        borderRadius: 8, padding: '8px 10px', cursor: 'pointer', fontSize: 12,
        color: changed ? '#15803d' : '#555', fontWeight: changed ? 600 : 400,
        fontFamily: 'inherit', transition: 'all .15s', whiteSpace: 'nowrap',
      }}>
        <span style={{ color: changed ? '#16a34a' : '#aaa', display: 'flex', flexShrink: 0 }}>{icon}</span>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', flex: 1, textAlign: 'left' }}>{value}</span>
        <ChevronDown size={11} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s', color: '#bbb', flexShrink: 0 }}/>
      </button>
      {open && (
        <>
          <div onClick={() => setActive(null)} style={{ position: 'fixed', inset: 0, zIndex: 40 }}/>
          <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, background: '#fff', border: '1px solid #e0dfd9', borderRadius: 10, boxShadow: '0 8px 30px rgba(0,0,0,0.12)', zIndex: 50, overflow: 'hidden', minWidth: 160 }}>
            {options.map((opt: string) => (
              <button key={opt} onClick={() => { onChange(opt); setActive(null) }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 12px', background: opt === value ? '#f0fdf4' : 'transparent', border: 'none', fontSize: 13, color: opt === value ? '#15803d' : '#333', cursor: 'pointer', fontWeight: opt === value ? 600 : 400, fontFamily: 'inherit' }}
                onMouseEnter={e => { if (opt !== value) (e.currentTarget as HTMLButtonElement).style.background = '#f9f9f7' }}
                onMouseLeave={e => { if (opt !== value) (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
              >
                {opt === value ? <Check size={12} color="#16a34a" style={{ flexShrink: 0 }}/> : <span style={{ width: 12, flexShrink: 0 }}/>}
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
  const [intent, setIntent] = useState<'sale' | 'rent'>('sale')
  const [city, setCity]       = useState('Addis Ababa')
  const [type, setType]       = useState('Any type')
  const [price, setPrice]     = useState('Any price')
  const [beds, setBeds]       = useState('Any beds')
  const [furnished, setFurnished] = useState('Any')
  const [activeDD, setActiveDD]   = useState<string | null>(null)
  const { stats, loading }        = useLiveStats()

  function buildUrl() {
    const p = new URLSearchParams({ intent })
    if (city !== 'Addis Ababa') p.set('city', city)
    if (type !== 'Any type') p.set('types', type.toLowerCase())
    if (beds !== 'Any beds' && beds !== 'Studio') p.set('min_beds', beds.replace('+', ''))
    if (furnished !== 'Any') p.set('furnished', furnished.toLowerCase())
    if (price !== 'Any price') {
      const ranges: Record<string, [number, number]> = {
        'Under ETB 1M': [0,1000000], 'ETB 1M–3M': [1000000,3000000],
        'ETB 3M–6M': [3000000,6000000], 'ETB 6M–10M': [6000000,10000000],
        'Over ETB 10M': [10000000,999999999], 'Under ETB 5K': [0,5000],
        'ETB 5K–15K': [5000,15000], 'ETB 15K–30K': [15000,30000],
        'ETB 30K–60K': [30000,60000], 'Over ETB 60K': [60000,999999],
      }
      const r = ranges[price]
      if (r) { p.set('min_price', r[0].toString()); p.set('max_price', r[1].toString()) }
    }
    return `/search?${p}`
  }

  return (
    <section style={{ background: '#fff', borderBottom: '1px solid #eae9e4', padding: '16px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Title row — small */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 900, color: '#111', margin: 0, letterSpacing: '-.015em', display: 'inline' }}>
              Ethiopia's smartest{' '}
            </h1>
            <span style={{ fontSize: 18, fontWeight: 900, color: '#16a34a' }}>property marketplace</span>
            <span style={{ fontSize: 12, color: '#bbb', marginLeft: 12 }}>
              AI fraud detection · valuations · Amharic 24/7
            </span>
          </div>
        </div>

        {/* Search box */}
        <div style={{ background: '#f9f9f7', border: '1px solid #eae9e4', borderRadius: 12, padding: '10px 14px', marginBottom: 8 }}>
          {/* Row 1 — toggle + all filters */}
          <div className="hero-filters" style={{ display: 'flex', gap: 7, alignItems: 'center', flexWrap: 'wrap', marginBottom: 8, width: '100%' }}>
            {/* Buy/Rent */}
            <div style={{ display: 'inline-flex', background: '#fff', borderRadius: 7, padding: 2, border: '1px solid #eae9e4', flexShrink: 0 }}>
              {(['sale', 'rent'] as const).map(i => (
                <button key={i} onClick={() => { setIntent(i); setPrice('Any price'); setFurnished('Any') }} style={{
                  padding: '5px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                  background: intent === i ? '#0d2318' : 'transparent',
                  color: intent === i ? '#fff' : '#888',
                  transition: 'all .15s', fontFamily: 'inherit',
                }}>
                  {i === 'sale' ? 'Buy' : 'Rent'}
                </button>
              ))}
            </div>

            <Dropdown id="city"  value={city}  options={CITIES} onChange={setCity}  icon={<MapPin size={12}/>}    active={activeDD} setActive={setActiveDD}/>
            <Dropdown id="type"  value={type}  options={TYPES}  onChange={setType}  icon={<Building2 size={12}/>} active={activeDD} setActive={setActiveDD}/>
            <Dropdown id="price" value={price} options={intent === 'sale' ? SALE_PRICES : RENT_PRICES} onChange={setPrice} icon={<TrendingUp size={12}/>} active={activeDD} setActive={setActiveDD}/>
            <Dropdown id="beds"  value={beds}  options={BEDS}   onChange={setBeds}  icon={<Home size={12}/>}      active={activeDD} setActive={setActiveDD}/>
            {intent === 'rent' && (
              <Dropdown id="furn" value={furnished} options={FURNISHED} onChange={setFurnished} icon={<Sparkles size={12}/>} active={activeDD} setActive={setActiveDD}/>
            )}
          </div>

          {/* Row 2 — buttons + popular */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 7 }}>
              <Link href={buildUrl()} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#16a34a', color: '#fff', padding: '8px 22px', borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}
                onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.background = '#15803d'}
                onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.background = '#16a34a'}
              >
                <Search size={13}/> Search
              </Link>
              <Link href="/search?view=map" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#666', padding: '8px 14px', borderRadius: 8, fontSize: 12, textDecoration: 'none', border: '1.5px solid #e0dfd9' }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#16a34a'; (e.currentTarget as HTMLAnchorElement).style.color = '#16a34a' }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#e0dfd9'; (e.currentTarget as HTMLAnchorElement).style.color = '#666' }}
              >
                <Map size={12}/> Map
              </Link>
            </div>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: 10, color: '#ccc' }}>Popular:</span>
              {['Bole', 'Kazanchis', 'CMC', 'Diaspora', 'Land'].map(t => (
                <Link key={t} href={`/search?q=${encodeURIComponent(t)}`}
                  style={{ fontSize: 11, color: '#888', padding: '2px 9px', border: '1px solid #e5e4df', borderRadius: 20, textDecoration: 'none' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#16a34a'; (e.currentTarget as HTMLAnchorElement).style.color = '#16a34a' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#e5e4df'; (e.currentTarget as HTMLAnchorElement).style.color = '#888' }}
                >{t}</Link>
              ))}
            </div>
          </div>
        </div>

        {/* Live data — right aligned compact row */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: loading ? '#ccc' : '#16a34a' }}/>
              <span style={{ fontSize: 10, color: '#bbb', fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase' }}>Live</span>
            </div>
            {[
              { label: 'Listings', val: stats.listings, suffix: stats.listings > 0 ? '+' : '', color: '#16a34a' },
              { label: 'Agents', val: stats.agents, suffix: '', color: '#555' },
              { label: 'Reports', val: stats.reports, suffix: '', color: '#555' },
              { label: 'Growth', val: 14, suffix: '%', color: '#2563eb' },
            ].map(({ label, val, suffix, color }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 14, fontWeight: 800, color, lineHeight: 1 }}><Counter end={val} suffix={suffix}/></div>
                <div style={{ fontSize: 9, color: '#bbb' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
