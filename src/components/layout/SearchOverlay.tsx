'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Search, Building2, Home, Globe, TrendingUp, Sparkles } from 'lucide-react'

const SUGGESTIONS = [
  { icon: <Building2 size={14}/>, text: 'Apartments in Bole for rent', href: '/search?q=bole&intent=rent' },
  { icon: <Home size={14}/>, text: 'Villa for sale in Kazanchis', href: '/search?q=kazanchis&intent=sale' },
  { icon: <Globe size={14}/>, text: 'Diaspora investment properties', href: '/diaspora' },
  { icon: <TrendingUp size={14}/>, text: 'High ROI neighborhoods Addis', href: '/search?sort=roi' },
]

export function SearchOverlay({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState('')
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    ref.current?.focus()
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [onClose])

  function go(e: React.FormEvent) {
    e.preventDefault()
    if (q.trim()) { window.location.href = `/search?q=${encodeURIComponent(q)}`; onClose() }
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 500, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 80, backdropFilter: 'blur(6px)' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 18, width: '100%', maxWidth: 600, margin: '0 16px', boxShadow: '0 32px 80px rgba(0,0,0,0.25)', overflow: 'hidden' }}>

        <form onSubmit={go}>
          <div style={{ display: 'flex', alignItems: 'center', padding: '16px 18px', borderBottom: '1px solid #f0f0ee', gap: 10 }}>
            <Search size={18} color="#9ca3af" style={{ flexShrink: 0 }}/>
            <input ref={ref} value={q} onChange={e => setQ(e.target.value)}
              placeholder="Search city, area, type... / ፍለጋ..."
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: 16, color: '#1a1a18', background: 'transparent', fontFamily: 'inherit' }}
            />
            <button type="button" onClick={onClose} style={{ background: '#f5f5f2', border: 'none', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', fontSize: 11, color: '#6b7280', fontFamily: 'monospace' }}>ESC</button>
          </div>
        </form>

        <div style={{ padding: '6px 0' }}>
          <div style={{ padding: '8px 18px 4px', fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.07em' }}>Popular searches</div>
          {SUGGESTIONS.map(({ icon, text, href }) => (
            <Link key={text} href={href} onClick={onClose}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', textDecoration: 'none', color: '#1a1a18', fontSize: 14, transition: 'background .1s' }}
              onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.background = '#f9f9f7'}
              onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'}
            >
              <span style={{ color: '#16a34a', display: 'flex' }}>{icon}</span>{text}
            </Link>
          ))}
        </div>

        <div style={{ padding: '10px 18px', borderTop: '1px solid #f0f0ee', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#9ca3af' }}>
          <Sparkles size={12} color="#16a34a"/> Claude AI — search in Amharic or English
        </div>
      </div>
    </div>
  )
}
