'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, MapPin, TrendingUp, Home, Building2, Map, Zap } from 'lucide-react'
import { ChevronDown, Check } from 'lucide-react'
import { EthiopianFlag, AIPill } from '@/components/ui'
import { Counter, Sparkline, LiveStatItem } from '@/components/ui/DataViz'
import { useLiveStats } from '@/hooks/useProperties'

const CITIES = ['Addis Ababa','Dire Dawa','Hawassa','Bahir Dar','Mekelle','Adama','Jimma']
const TYPES  = ['Any type','Apartment','Villa','House','Condominium','Commercial','Land','Office']
const BEDS   = ['Any beds','Studio','1+','2+','3+','4+','5+']
const SALE_PRICES = ['Any price','Under ETB 1M','ETB 1M–3M','ETB 3M–6M','ETB 6M–10M','Over ETB 10M']
const RENT_PRICES = ['Any price','Under ETB 5K','ETB 5K–15K','ETB 15K–30K','ETB 30K–60K','Over ETB 60K']

const BOLE_TREND = [42,45,48,51,55,60,64,67,71,74,76,78]

// ── Dropdown ──────────────────────────────────────────────────────────────────
function Dropdown({ id, value, options, onChange, icon, active, setActive }: any) {
  const open = active === id
  const changed = value !== options[0]
  return (
    <div style={{ position: 'relative', flex: 1, minWidth: 130 }}>
      <button onClick={() => setActive(open ? null : id)} style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 8,
        background: changed ? '#f0fdf4' : '#fff',
        border: `1.5px solid ${changed ? '#16a34a' : '#e0dfd9'}`,
        borderRadius: 10, padding: '11px 14px', cursor: 'pointer', fontSize: 14,
        color: changed ? '#15803d' : '#555', transition: 'all .15s',
        fontWeight: changed ? 600 : 400, fontFamily: 'inherit',
      }}>
        <span style={{ color: changed ? '#16a34a' : '#888', display: 'flex' }}>{icon}</span>
        <span style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</span>
        <ChevronDown size={14} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s', color: '#aaa', flexShrink: 0 }}/>
      </button>
      {open && (
        <>
          <div onClick={() => setActive(null)} style={{ position: 'fixed', inset: 0, zIndex: 40 }}/>
          <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, background: '#fff', border: '1px solid #e0dfd9', borderRadius: 12, boxShadow: '0 12px 40px rgba(0,0,0,0.12)', zIndex: 50, overflow: 'hidden', minWidth: 180 }}>
            {options.map((opt: string) => (
              <button key={opt} onClick={() => { onChange(opt); setActive(null) }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '11px 14px', background: opt === value ? '#f0fdf4' : 'transparent', border: 'none', fontSize: 14, color: opt === value ? '#15803d' : '#333', cursor: 'pointer', textAlign: 'left', fontWeight: opt === value ? 600 : 400, fontFamily: 'inherit' }}
                onMouseEnter={e => { if (opt !== value) (e.currentTarget as HTMLButtonElement).style.background = '#f9f9f7' }}
                onMouseLeave={e => { if (opt !== value) (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
              >
                {opt === value ? <Check size={13} color="#16a34a" style={{ flexShrink: 0 }}/> : <span style={{ width: 13, flexShrink: 0 }}/>}
                {opt}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ── Live market card ──────────────────────────────────────────────────────────
function LiveMarketCard() {
  const { stats, loading } = useLiveStats()
  return (
    <div style={{ background: '#f9f9f7', border: '1px solid #eae9e4', borderRadius: 20, padding: 24, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 20 }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: loading ? '#d0d0cc' : '#16a34a' }}/>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#bbb', letterSpacing: '.07em', textTransform: 'uppercase' }}>
          {loading ? 'Loading...' : 'Live data'}
        </div>
      </div>
      <LiveStatItem label="Active listings" value={stats.listings} suffix={stats.listings > 0 ? '+' : ''} color="#16a34a" note={stats.listings === 0 ? 'Add properties to see data' : undefined}/>
      <LiveStatItem label="Verified agents" value={stats.agents} color="#111"/>
      <LiveStatItem label="AI reports run" value={stats.reports} color="#16a34a"/>
      <LiveStatItem label="Yearly price growth" value={14} suffix="%" color="#2563eb" note="Addis Ababa avg"/>
      <div style={{ borderTop: '1px solid #eae9e4', paddingTop: 16, marginTop: 2 }}>
        <div style={{ fontSize: 11, color: '#ccc', marginBottom: 6 }}>Bole price trend — 12 months</div>
        <Sparkline data={BOLE_TREND}/>
      </div>
    </div>
  )
}

// ── Hero ──────────────────────────────────────────────────────────────────────
export function Hero() {
  const [intent, setIntent] = useState<'sale' | 'rent'>('sale')
  const [city, setCity]   = useState('Addis Ababa')
  const [type, setType]   = useState('Any type')
  const [price, setPrice] = useState('Any price')
  const [beds, setBeds]   = useState('Any beds')
  const [activeDD, setActiveDD] = useState<string | null>(null)

  function buildUrl() {
    const p = new URLSearchParams({ intent })
    if (city !== 'Addis Ababa') p.set('city', city)
    if (type !== 'Any type') p.set('types', type.toLowerCase())
    if (beds !== 'Any beds' && beds !== 'Studio') p.set('min_beds', beds.replace('+', ''))
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
    <section style={{ background: '#fff', borderBottom: '1px solid #eae9e4', padding: '64px 24px 72px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <EthiopianFlag size="lg"/>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 48, alignItems: 'start', marginTop: 28 }}>
          <div>
            <div style={{ marginBottom: 22 }}><AIPill label="Powered by Claude AI · ክሎድ AI"/></div>

            <h1 style={{ fontSize: 'clamp(34px,5vw,60px)', fontWeight: 900, color: '#111', lineHeight: 1.05, margin: '0 0 18px', letterSpacing: '-.025em' }}>
              Ethiopia's smartest<br/>
              <span style={{ color: '#16a34a' }}>property marketplace</span>
            </h1>

            <p style={{ fontSize: 17, color: '#666', marginBottom: 36, lineHeight: 1.7, maxWidth: 520 }}>
              Buy, sell, rent and invest with AI that speaks Amharic — fraud detection, instant valuations, and expert guidance 24/7.
            </p>

            {/* Intent toggle */}
            <div style={{ display: 'inline-flex', background: '#f5f4f0', borderRadius: 12, padding: 4, marginBottom: 16 }}>
              {(['sale', 'rent'] as const).map(i => (
                <button key={i} onClick={() => { setIntent(i); setPrice('Any price') }} style={{
                  padding: '9px 28px', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600,
                  background: intent === i ? '#fff' : 'transparent', color: intent === i ? '#111' : '#888',
                  boxShadow: intent === i ? '0 2px 8px rgba(0,0,0,0.08)' : 'none', transition: 'all .15s', fontFamily: 'inherit',
                }}>
                  {i === 'sale' ? 'Buy' : 'Rent'}
                </button>
              ))}
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
              <Dropdown id="city"  value={city}  options={CITIES} onChange={setCity}  icon={<MapPin size={15}/>}    active={activeDD} setActive={setActiveDD}/>
              <Dropdown id="type"  value={type}  options={TYPES}  onChange={setType}  icon={<Building2 size={15}/>} active={activeDD} setActive={setActiveDD}/>
              <Dropdown id="price" value={price} options={intent === 'sale' ? SALE_PRICES : RENT_PRICES} onChange={setPrice} icon={<TrendingUp size={15}/>} active={activeDD} setActive={setActiveDD}/>
              <Dropdown id="beds"  value={beds}  options={BEDS}   onChange={setBeds}  icon={<Home size={15}/>}       active={activeDD} setActive={setActiveDD}/>
            </div>

            {/* CTA buttons */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Link href={buildUrl()} style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: '#111', color: '#fff', padding: '14px 32px', borderRadius: 12, fontSize: 15, fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', transition: 'all .15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#0d2318'; (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#111'; (e.currentTarget as HTMLAnchorElement).style.transform = 'none' }}
              >
                <Search size={17}/> Search properties
              </Link>
              <Link href="/search?view=map" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'transparent', color: '#555', padding: '14px 22px', borderRadius: 12, fontSize: 14, fontWeight: 500, textDecoration: 'none', border: '1.5px solid #e0dfd9', transition: 'all .15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#16a34a'; (e.currentTarget as HTMLAnchorElement).style.color = '#16a34a' }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#e0dfd9'; (e.currentTarget as HTMLAnchorElement).style.color = '#555' }}
              >
                <Map size={15}/> Map view
              </Link>
            </div>

            {/* Popular tags */}
            <div style={{ display: 'flex', gap: 8, marginTop: 20, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: '#bbb' }}>Popular:</span>
              {['Bole apartments', 'Kazanchis villas', 'CMC condos', 'Diaspora deals', 'Land for sale'].map(t => (
                <Link key={t} href={`/search?q=${encodeURIComponent(t)}`}
                  style={{ fontSize: 12, color: '#666', padding: '5px 13px', border: '1px solid #e5e4df', borderRadius: 20, textDecoration: 'none', transition: 'all .15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#16a34a'; (e.currentTarget as HTMLAnchorElement).style.color = '#16a34a' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#e5e4df'; (e.currentTarget as HTMLAnchorElement).style.color = '#666' }}
                >{t}</Link>
              ))}
            </div>
          </div>

          <LiveMarketCard/>
        </div>
      </div>
    </section>
  )
}
