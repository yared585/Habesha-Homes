'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, MapPin, TrendingUp, Home, Building2, Map, ChevronDown, Check, Sparkles, Shield, Users, Award } from 'lucide-react'
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
        borderRadius: 8, padding: '9px 10px', cursor: 'pointer', fontSize: 13,
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
  const [intent, setIntent]       = useState<'sale' | 'rent'>('sale')
  const [city, setCity]           = useState('Addis Ababa')
  const [type, setType]           = useState('Any type')
  const [price, setPrice]         = useState('Any price')
  const [beds, setBeds]           = useState('Any beds')
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
    <section style={{
      background: 'linear-gradient(160deg, #0d2318 0%, #091a0e 55%, #071410 100%)',
      padding: 'clamp(56px, 8vw, 96px) 24px clamp(48px, 6vw, 80px)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Dot grid pattern */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.045,
        backgroundImage: 'radial-gradient(circle, #4ade80 1px, transparent 1px)',
        backgroundSize: '30px 30px',
        pointerEvents: 'none',
      }}/>

      {/* Radial glow — top center */}
      <div style={{
        position: 'absolute', top: -160, left: '50%', transform: 'translateX(-50%)',
        width: 800, height: 500, borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(22,163,74,0.18) 0%, transparent 68%)',
        pointerEvents: 'none',
      }}/>

      {/* Right accent glow */}
      <div style={{
        position: 'absolute', bottom: -80, right: -100,
        width: 500, height: 400, borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(74,222,128,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }}/>

      <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>

        {/* AI badge */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(22,163,74,0.12)', border: '1px solid rgba(74,222,128,0.28)', borderRadius: 24, padding: '6px 16px' }}>
            <Sparkles size={12} color="#4ade80"/>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#4ade80', letterSpacing: '.1em' }}>CLAUDE AI · SPEAKS AMHARIC · 24/7</span>
          </div>
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: 'clamp(38px, 7vw, 76px)',
          fontWeight: 900,
          color: '#fff',
          textAlign: 'center',
          lineHeight: 1.04,
          letterSpacing: '-.035em',
          margin: '0 0 20px',
        }}>
          Find Your Dream Home<br/>
          <span style={{ color: '#4ade80' }}>in Ethiopia</span>
        </h1>

        {/* Sub-headline */}
        <p style={{
          textAlign: 'center',
          fontSize: 'clamp(14px, 2vw, 18px)',
          color: 'rgba(255,255,255,0.52)',
          margin: '0 auto 44px',
          maxWidth: 560,
          lineHeight: 1.65,
        }}>
          ቤት ፈልጉ — AI fraud detection, instant valuations,<br/>
          and verified agents across Ethiopia.
        </p>

        {/* Search card */}
        <div style={{
          background: '#fff',
          borderRadius: 18,
          padding: '22px 22px 18px',
          boxShadow: '0 40px 100px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.06)',
          maxWidth: 900,
          margin: '0 auto 52px',
        }}>
          {/* Buy / Rent toggle */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
            <div style={{ display: 'inline-flex', background: '#f2f2ef', borderRadius: 9, padding: 3, flexShrink: 0 }}>
              {(['sale', 'rent'] as const).map(i => (
                <button key={i} onClick={() => { setIntent(i); setPrice('Any price'); setFurnished('Any') }} style={{
                  padding: '7px 22px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700,
                  background: intent === i ? '#0d2318' : 'transparent',
                  color: intent === i ? '#fff' : '#999',
                  transition: 'all .15s', fontFamily: 'inherit',
                }}>
                  {i === 'sale' ? 'Buy' : 'Rent'}
                </button>
              ))}
            </div>
            <div style={{ height: 20, width: 1, background: '#e8e8e4', flexShrink: 0 }}/>
            <div className="hero-filters" style={{ display: 'flex', gap: 7, alignItems: 'center', flexWrap: 'wrap', flex: 1 }}>
              <Dropdown id="city"  value={city}  options={CITIES} onChange={setCity}  icon={<MapPin size={13}/>}    active={activeDD} setActive={setActiveDD}/>
              <Dropdown id="type"  value={type}  options={TYPES}  onChange={setType}  icon={<Building2 size={13}/>} active={activeDD} setActive={setActiveDD}/>
              <Dropdown id="price" value={price} options={intent === 'sale' ? SALE_PRICES : RENT_PRICES} onChange={setPrice} icon={<TrendingUp size={13}/>} active={activeDD} setActive={setActiveDD}/>
              <Dropdown id="beds"  value={beds}  options={BEDS}   onChange={setBeds}  icon={<Home size={13}/>}      active={activeDD} setActive={setActiveDD}/>
              {intent === 'rent' && (
                <Dropdown id="furn" value={furnished} options={FURNISHED} onChange={setFurnished} icon={<Sparkles size={13}/>} active={activeDD} setActive={setActiveDD}/>
              )}
            </div>
          </div>

          {/* Action row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <Link href={buildUrl()} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#16a34a', color: '#fff', padding: '10px 26px', borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: 'none', transition: 'all .15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#15803d'; (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#16a34a'; (e.currentTarget as HTMLAnchorElement).style.transform = 'none' }}
              >
                <Search size={14}/> Search properties
              </Link>
              <Link href="/search?view=map" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color: '#666', padding: '10px 16px', borderRadius: 10, fontSize: 13, textDecoration: 'none', border: '1.5px solid #e0dfd9', transition: 'all .15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#16a34a'; (e.currentTarget as HTMLAnchorElement).style.color = '#16a34a' }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#e0dfd9'; (e.currentTarget as HTMLAnchorElement).style.color = '#666' }}
              >
                <Map size={13}/> Map view
              </Link>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: '#ccc', fontWeight: 500 }}>Popular:</span>
              {['Bole', 'Kazanchis', 'CMC', 'Diaspora', 'Land'].map(t => (
                <Link key={t} href={`/search?q=${encodeURIComponent(t)}`}
                  style={{ fontSize: 11, color: '#777', padding: '3px 10px', border: '1px solid #e5e4df', borderRadius: 20, textDecoration: 'none', transition: 'all .15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#16a34a'; (e.currentTarget as HTMLAnchorElement).style.color = '#16a34a' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#e5e4df'; (e.currentTarget as HTMLAnchorElement).style.color = '#777' }}
                >{t}</Link>
              ))}
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(24px,4vw,64px)', flexWrap: 'wrap' }}>
          {[
            { icon: <Home size={16}/>, val: stats.listings, suffix: stats.listings > 0 ? '+' : '', label: 'Active listings' },
            { icon: <Users size={16}/>, val: stats.agents, suffix: '', label: 'Verified agents' },
            { icon: <Award size={16}/>, val: stats.reports, suffix: '', label: 'AI reports run' },
            { icon: <Shield size={16}/>, val: 98, suffix: '%', label: 'Satisfaction rate' },
          ].map(({ icon, val, suffix, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: loading ? 0.5 : 1, transition: 'opacity .3s' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4ade80', flexShrink: 0 }}>
                {icon}
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', lineHeight: 1, letterSpacing: '-.02em' }}>
                  <Counter end={val} suffix={suffix}/>
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', marginTop: 2 }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
