'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, MapPin, TrendingUp, Home, Building2, Map, ChevronDown, Check } from 'lucide-react'
import { useTranslations } from 'next-intl'

const CITIES      = ['Addis Ababa','Dire Dawa','Hawassa','Bahir Dar','Mekelle','Adama','Jimma']
const TYPES       = ['Any type','Apartment','Villa','House','Condominium','Commercial','Land','Office']
const BEDS        = ['Any beds','Studio','1+','2+','3+','4+','5+']
const SALE_PRICES = ['Any price','Under ETB 1M','ETB 1M–3M','ETB 3M–6M','ETB 6M–10M','Over ETB 10M']
const RENT_PRICES = ['Any price','Under ETB 5K','ETB 5K–15K','ETB 15K–30K','ETB 30K–60K','Over ETB 60K']

function Dropdown({ id, value, options, onChange, icon, placeholder, active, setActive }: {
  id: string; value: string; options: string[]; onChange: (v: string) => void
  icon: React.ReactNode; placeholder: string
  active: string | null; setActive: (v: string | null) => void
}) {
  const open = active === id
  const changed = value !== options[0]
  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <button
        onClick={() => setActive(open ? null : id)}
        style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '0 12px', height: 44, cursor: 'pointer',
          background: 'transparent', border: 'none',
          fontFamily: 'inherit', transition: 'background .15s',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = '#f7f7f5'}
        onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}
      >
        <span style={{ color: changed ? '#1a3d2b' : '#bbb', display: 'flex', flexShrink: 0 }}>{icon}</span>
        <span style={{ fontSize: 13, color: changed ? '#1a3d2b' : '#555', fontWeight: changed ? 600 : 400 }}>
          {changed ? value : placeholder}
        </span>
        <ChevronDown size={10} color="#bbb" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}/>
      </button>
      {open && (
        <>
          <div onClick={() => setActive(null)} style={{ position: 'fixed', inset: 0, zIndex: 998 }}/>
          <div style={{
            position: 'absolute', top: 'calc(100% + 6px)', left: 0,
            background: '#fff', border: '1px solid #e5e4df',
            borderRadius: 12, boxShadow: '0 16px 48px rgba(0,0,0,0.14)',
            zIndex: 999, overflow: 'hidden', minWidth: 190,
          }}>
            {options.map(opt => (
              <button key={opt} onClick={() => { onChange(opt); setActive(null) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 9, width: '100%',
                  padding: '9px 14px', border: 'none', fontSize: 13,
                  background: opt === value ? '#f0fdf4' : 'transparent',
                  color: opt === value ? '#1a3d2b' : '#333',
                  cursor: 'pointer', fontWeight: opt === value ? 600 : 400,
                  fontFamily: 'inherit', transition: 'background .1s',
                }}
                onMouseEnter={e => { if (opt !== value) (e.currentTarget as HTMLButtonElement).style.background = '#f9f9f7' }}
                onMouseLeave={e => { if (opt !== value) (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
              >
                {opt === value ? <Check size={12} color="#1a3d2b" style={{ flexShrink: 0 }}/> : <span style={{ width: 12, flexShrink: 0 }}/>}
                {opt}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function Divider() {
  return <div style={{ width: 1, height: 22, background: '#e8e8e4', flexShrink: 0, alignSelf: 'center' }}/>
}

export function Hero() {
  const tl = useTranslations('hero')
  const [intent, setIntent] = useState<'sale' | 'rent'>('sale')
  const [city, setCity]     = useState('Addis Ababa')
  const [type, setType]     = useState('Any type')
  const [price, setPrice]   = useState('Any price')
  const [beds, setBeds]     = useState('Any beds')
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
      background: '#fff',
      padding: 'clamp(14px, 3vw, 20px) clamp(16px, 4vw, 24px) clamp(12px, 2vw, 18px)',
      borderBottom: '1px solid #ebebeb',
      position: 'relative',
    }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>

        {/* headline */}
        <div style={{ textAlign: 'center', marginBottom: 14 }}>
          <h1 style={{
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontSize: 'clamp(28px, 6vw, 46px)',
            fontWeight: 400, color: '#111',
            lineHeight: 1.1, letterSpacing: '-.02em', margin: '0 0 10px',
          }}>
            {tl('title')}{' '}
            <em style={{ fontStyle: 'italic', color: '#c17f2a' }}>{tl('title_highlight')}</em>
          </h1>
        </div>

        {/* search bar — pill style */}
        <div className="hero-filter-bar-desktop" style={{
          background: '#fff',
          border: '1px solid #ddd',
          borderRadius: 50,
          boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
          display: 'flex',
          alignItems: 'center',
          padding: '5px 5px 5px 6px',
          marginBottom: 14,
          overflow: 'visible',
          position: 'relative',
        }}>
          {/* buy/rent tabs */}
          <div style={{ display: 'flex', gap: 2, padding: '0 4px', flexShrink: 0 }}>
            {(['sale', 'rent'] as const).map(i => (
              <button key={i}
                onClick={() => { setIntent(i); setPrice('Any price') }}
                style={{
                  padding: '6px 14px', border: 'none', borderRadius: 24,
                  cursor: 'pointer', fontSize: 12.5, fontWeight: 700,
                  fontFamily: 'inherit', transition: 'all .15s',
                  background: intent === i ? '#1a3d2b' : 'transparent',
                  color: intent === i ? '#fff' : '#888',
                }}>
                {i === 'sale' ? tl('buy') : tl('rent')}
              </button>
            ))}
          </div>

          <Divider/>
          <Dropdown id="city"  value={city}  options={CITIES}  onChange={setCity}  icon={<MapPin size={12}/>}    placeholder={tl('location')}      active={activeDD} setActive={setActiveDD}/>
          <Divider/>
          <Dropdown id="type"  value={type}  options={TYPES}   onChange={setType}  icon={<Building2 size={12}/>} placeholder={tl('property_type')} active={activeDD} setActive={setActiveDD}/>
          <Divider/>
          <Dropdown id="price" value={price} options={intent === 'sale' ? SALE_PRICES : RENT_PRICES} onChange={setPrice} icon={<TrendingUp size={12}/>} placeholder={tl('price_range')} active={activeDD} setActive={setActiveDD}/>
          <Divider/>
          <Dropdown id="beds"  value={beds}  options={BEDS}    onChange={setBeds}  icon={<Home size={12}/>}      placeholder={tl('bedrooms')}      active={activeDD} setActive={setActiveDD}/>

          {/* map + search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 4px 0 6px', marginLeft: 'auto', flexShrink: 0 }}>
            <Link href="/search?view=map"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11.5, color: '#aaa', padding: '6px 8px', borderRadius: 8, textDecoration: 'none', transition: 'all .12s', border: '1px solid #eee' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#1a3d2b'; (e.currentTarget as HTMLAnchorElement).style.borderColor = '#1a3d2b' }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#aaa'; (e.currentTarget as HTMLAnchorElement).style.borderColor = '#eee' }}
            ><Map size={11}/> {tl('map')}</Link>
            <Link href={buildUrl()}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: '#1a3d2b', color: '#fff',
                padding: '9px 20px', borderRadius: 50,
                fontSize: 13, fontWeight: 700, textDecoration: 'none',
                transition: 'all .18s', whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#2d5a3d' }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#1a3d2b' }}
            ><Search size={13}/> {tl('search')}</Link>
          </div>
        </div>

        {/* mobile search */}
        <div className="hero-filter-bar-mobile" style={{ padding: '0' }}>
          <button
            onClick={() => window.location.href = '/search'}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              width: '100%', background: '#fff', border: '1.5px solid #e0e0e0',
              borderRadius: 50, padding: '10px 10px 10px 18px',
              cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: '0 2px 16px rgba(0,0,0,0.1)', marginBottom: 10,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>Anywhere in Ethiopia</span>
              <span style={{ fontSize: 11, color: '#aaa' }}>Any type · Any price</span>
            </div>
            <span style={{
              background: '#1a3d2b', color: '#fff', borderRadius: '50%',
              width: 34, height: 34, display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexShrink: 0,
            }}>
              <Search size={14}/>
            </span>
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link href="/search?intent=sale" style={{ flex: 1, textAlign: 'center', padding: '9px', background: '#f0fdf4', color: '#1a3d2b', borderRadius: 24, fontSize: 13, fontWeight: 600, textDecoration: 'none', border: '1px solid #bbf7d0' }}>{tl('buy')}</Link>
            <Link href="/search?intent=rent" style={{ flex: 1, textAlign: 'center', padding: '9px', background: '#f0fdf4', color: '#1a3d2b', borderRadius: 24, fontSize: 13, fontWeight: 600, textDecoration: 'none', border: '1px solid #bbf7d0' }}>{tl('rent')}</Link>
            <Link href="/search?view=map" style={{ flex: 1, textAlign: 'center', padding: '9px', background: '#f5f5f2', color: '#555', borderRadius: 24, fontSize: 13, fontWeight: 600, textDecoration: 'none', border: '1px solid #e8e7e2' }}>{tl('map')}</Link>
          </div>
        </div>


        {/* popular pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, flexWrap: 'nowrap' as const, overflowX: 'auto', scrollbarWidth: 'none' as const, paddingBottom: 2 }}>
          <span style={{ fontSize: 11, color: '#bbb', fontWeight: 500 }}>{tl('popular')}:</span>
          {['Bole', 'Kazanchis', 'CMC', 'Megenagna', 'Land'].map(t => (
            <Link key={t} href={`/search?q=${encodeURIComponent(t)}`}
              style={{ fontSize: 11, color: '#888', padding: '3px 12px', border: '1px solid #e5e4df', borderRadius: 20, textDecoration: 'none', transition: 'all .12s', background: '#fff' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#1a3d2b'; (e.currentTarget as HTMLAnchorElement).style.color = '#1a3d2b' }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#e5e4df'; (e.currentTarget as HTMLAnchorElement).style.color = '#888' }}
            >{t}</Link>
          ))}
        </div>

      </div>
    </section>
  )
}
