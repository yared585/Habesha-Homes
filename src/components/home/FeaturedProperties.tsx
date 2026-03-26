'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Building2, Home, Key, Sparkles, TrendingUp } from 'lucide-react'
import { PropertyCard } from '@/components/property/PropertyCard'
import { useProperties } from '@/hooks/useProperties'

type Tab = 'all' | 'sale' | 'rent'

const TABS: { id: Tab; label: string }[] = [
  { id: 'all',  label: 'All listings' },
  { id: 'sale', label: 'For sale' },
  { id: 'rent', label: 'For rent' },
]

export function FeaturedProperties() {
  const [tab, setTab] = useState<Tab>('all')
  const { properties, loading, count } = useProperties({
    limit: 6,
    intent: tab === 'all' ? undefined : tab,
  })

  return (
    <section style={{ padding: 'clamp(56px, 7vw, 80px) 24px', background: '#fafaf8' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* ── Section header ────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 20, padding: '4px 12px', marginBottom: 12 }}>
              <TrendingUp size={11} color="#16a34a"/>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', letterSpacing: '.07em', textTransform: 'uppercase' }}>Featured listings</span>
            </div>
            <h2 style={{
              fontFamily: "'Instrument Serif', Georgia, serif",
              fontSize: 'clamp(26px, 4vw, 40px)',
              fontWeight: 400, color: '#1a1a18',
              margin: 0, lineHeight: 1.1, letterSpacing: '-.01em',
            }}>
              Verified properties <em style={{ fontStyle: 'italic', color: '#16a34a' }}>in Ethiopia</em>
            </h2>
          </div>

          <Link
            href={`/search${tab === 'sale' ? '?intent=sale' : tab === 'rent' ? '?intent=rent' : ''}`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 14, fontWeight: 600, color: '#16a34a', border: '1.5px solid #16a34a', padding: '9px 20px', borderRadius: 20, textDecoration: 'none', transition: 'all .15s', flexShrink: 0 }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#16a34a'; (e.currentTarget as HTMLAnchorElement).style.color = '#fff' }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; (e.currentTarget as HTMLAnchorElement).style.color = '#16a34a' }}
          >
            View all <ArrowRight size={14}/>
          </Link>
        </div>

        {/* ── Filter tabs ───────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #e5e4df', marginBottom: 32, gap: 2 }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: '10px 20px', border: 'none', background: 'transparent',
                cursor: 'pointer', fontSize: 13.5, fontWeight: tab === t.id ? 600 : 400,
                color: tab === t.id ? '#16a34a' : '#888',
                borderBottom: `2.5px solid ${tab === t.id ? '#16a34a' : 'transparent'}`,
                marginBottom: '-1px', transition: 'all .15s', fontFamily: 'inherit',
                letterSpacing: tab === t.id ? '.01em' : '0',
              }}
            >{t.label}</button>
          ))}
          {!loading && count > 0 && (
            <span style={{ marginLeft: 'auto', fontSize: 12, color: '#bbb', paddingBottom: 12 }}>
              {count} {count === 1 ? 'property' : 'properties'}
            </span>
          )}
        </div>

        {/* ── Loading skeletons ─────────────────────────────── */}
        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 22 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ borderRadius: 16, overflow: 'hidden', background: '#fff', border: '1px solid #eae9e4' }}>
                <div className="skeleton-img"/>
                <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div className="skeleton-line" style={{ width: '70%' }}/>
                  <div className="skeleton-line" style={{ width: '45%', height: 10 }}/>
                  <div className="skeleton-line" style={{ width: '55%', height: 22, borderRadius: 6 }}/>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Property grid ─────────────────────────────────── */}
        {!loading && properties.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 22 }}>
            {properties.map(p => <PropertyCard key={p.id} property={p}/>)}
          </div>
        )}

        {/* ── Empty / coming-soon state ─────────────────────── */}
        {!loading && properties.length === 0 && (
          <div style={{
            background: '#fff', border: '1.5px dashed #d0cfc9',
            borderRadius: 20, padding: 'clamp(40px, 6vw, 64px) 32px',
            textAlign: 'center',
          }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: '#0d2318', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Sparkles size={24} color="#4ade80"/>
            </div>
            <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 24, fontWeight: 400, color: '#1a1a18', marginBottom: 10 }}>
              Listings coming soon
            </div>
            <p style={{ fontSize: 14, color: '#888', marginBottom: 28, maxWidth: 360, margin: '0 auto 28px', lineHeight: 1.65 }}>
              {tab === 'sale' ? 'No properties for sale yet.' : tab === 'rent' ? 'No rental properties yet.' : 'No active listings yet.'}{' '}
              Agents are onboarding — be the first to list your property.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/search" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#0d2318', color: '#fff', padding: '11px 24px', borderRadius: 12, fontSize: 14, fontWeight: 600, textDecoration: 'none', transition: 'all .15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#16a34a' }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#0d2318' }}
              >Browse all <ArrowRight size={14}/></Link>
              <Link href="/auth/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#f0fdf4', color: '#16a34a', padding: '11px 24px', borderRadius: 12, fontSize: 14, fontWeight: 600, textDecoration: 'none', border: '1.5px solid #bbf7d0', transition: 'all .15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#dcfce7' }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#f0fdf4' }}
              >List your property</Link>
            </div>
          </div>
        )}

        {/* ── Bottom CTA when results show ─────────────────── */}
        {!loading && properties.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <Link
              href={`/search${tab === 'sale' ? '?intent=sale' : tab === 'rent' ? '?intent=rent' : ''}`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#0d2318', color: '#fff', padding: '13px 32px', borderRadius: 12, fontSize: 14, fontWeight: 600, textDecoration: 'none', transition: 'all .18s', boxShadow: '0 2px 12px rgba(13,35,24,0.2)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#16a34a'; (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 6px 20px rgba(22,163,74,0.3)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#0d2318'; (e.currentTarget as HTMLAnchorElement).style.transform = 'none'; (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 2px 12px rgba(13,35,24,0.2)' }}
            >
              Browse all properties <ArrowRight size={14}/>
            </Link>
          </div>
        )}

      </div>
    </section>
  )
}
