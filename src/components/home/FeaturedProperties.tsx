'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import { PropertyCard } from '@/components/property/PropertyCard'
import { useProperties } from '@/hooks/useProperties'
import type { Property } from '@/types'

// ── Title pools — pick one fresh on each page load ────────────────────────────
const TRENDING_TITLES = [
  { title: 'Trending Homes',        subtitle: 'Most viewed properties right now' },
  { title: 'Hot Right Now',         subtitle: 'Properties getting the most attention' },
  { title: 'Popular This Week',     subtitle: 'Homes everyone is looking at' },
  { title: 'In High Demand',        subtitle: 'These listings are moving fast' },
  { title: 'Most Viewed',           subtitle: 'Top properties by popularity' },
]

const FORYOU_TITLES = [
  { title: 'Homes for You',         subtitle: 'Freshest listings added to the platform' },
  { title: 'Recommended for You',   subtitle: 'New properties you should not miss' },
  { title: 'Just Added',            subtitle: 'The latest listings on Habesha Homes' },
  { title: 'New on Habesha Homes',  subtitle: 'Recently listed — be the first to inquire' },
  { title: 'You Might Like These',  subtitle: 'Handpicked from our latest listings' },
]

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// ── Horizontal scroll row ─────────────────────────────────────────────────────
function ScrollRow({
  title,
  subtitle,
  searchHref,
  intent,
  sortBy,
}: {
  title: string
  subtitle: string
  searchHref: string
  intent?: 'sale' | 'rent'
  sortBy?: 'recent' | 'views' | 'price_asc' | 'price_desc'
}) {
  const { properties, loading, count } = useProperties({ limit: 6, intent, sortBy })

  const cardSlot = {
    flex: '0 0 calc((100% - 48px) / 3.3)',
    minWidth: 250,
    scrollSnapAlign: 'start' as const,
  }

  return (
    <div style={{ marginBottom: 44 }}>
      {/* Row header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 14, gap: 12 }}>
        <div>
          <h3 style={{ margin: '0 0 3px', fontSize: 19, fontWeight: 700, color: '#111', letterSpacing: '-.02em' }}>{title}</h3>
          <p style={{ margin: 0, fontSize: 12.5, color: '#aaa' }}>{subtitle}</p>
        </div>
        {!loading && count > 0 && (
          <Link
            href={searchHref}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600, color: '#16a34a', textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}
            onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.textDecoration = 'underline'}
            onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.textDecoration = 'none'}
          >
            See all {count} homes <ArrowRight size={13}/>
          </Link>
        )}
      </div>

      {/* Loading skeletons */}
      {loading && (
        <div style={{ display: 'flex', gap: 16, overflow: 'hidden' }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ ...cardSlot, borderRadius: 12, overflow: 'hidden', background: '#fff', border: '1px solid #eae9e4' }}>
              <div className="skeleton-img"/>
              <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div className="skeleton-line" style={{ width: '55%', height: 16 }}/>
                <div className="skeleton-line" style={{ width: '75%', height: 10 }}/>
                <div className="skeleton-line" style={{ width: '45%', height: 10 }}/>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Scroll row */}
      {!loading && properties.length > 0 && (
        <div className="scroll-hide" style={{
          display: 'flex', gap: 16,
          overflowX: 'auto', paddingBottom: 6,
          scrollSnapType: 'x mandatory',
        }}>
          {properties.map((p: Property) => (
            <div key={p.id} style={cardSlot}>
              <PropertyCard property={p}/>
            </div>
          ))}

          {/* See all card at the end */}
          <Link
            href={searchHref}
            style={{
              ...cardSlot, minWidth: 160, textDecoration: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column', gap: 12,
              background: '#f5f5f2', border: '1.5px solid #e5e4df',
              borderRadius: 12, transition: 'all .18s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#ebebea'; (e.currentTarget as HTMLAnchorElement).style.borderColor = '#ccc' }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#f5f5f2'; (e.currentTarget as HTMLAnchorElement).style.borderColor = '#e5e4df' }}
          >
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowRight size={20} color="#fff"/>
            </div>
            <div style={{ textAlign: 'center', padding: '0 12px' }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: '#111', marginBottom: 3 }}>See all homes</div>
              <div style={{ fontSize: 11.5, color: '#999' }}>{count} properties</div>
            </div>
          </Link>
        </div>
      )}

      {/* Empty */}
      {!loading && properties.length === 0 && (
        <div style={{ padding: '28px 0', textAlign: 'center', color: '#bbb', fontSize: 13 }}>
          No listings yet in this category.
        </div>
      )}
    </div>
  )
}

// ── Main section ─────────────────────────────────────────────────────────────
export function FeaturedProperties() {
  // Start with index 0 (stable for SSR), randomize after hydration on client only
  const [trending, setTrending] = useState(TRENDING_TITLES[0])
  const [forYou,   setForYou]   = useState(FORYOU_TITLES[0])

  useEffect(() => {
    setTrending(pick(TRENDING_TITLES))
    setForYou(pick(FORYOU_TITLES))
  }, [])

  return (
    <section style={{ padding: 'clamp(28px, 3vw, 48px) 24px', background: '#fafaf8' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Section heading */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 20, padding: '4px 12px', marginBottom: 8 }}>
            <Sparkles size={11} color="#16a34a"/>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', letterSpacing: '.07em', textTransform: 'uppercase' }}>Featured listings</span>
          </div>
          <h2 style={{
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontSize: 'clamp(26px, 4vw, 42px)',
            fontWeight: 400, color: '#1a1a18',
            margin: 0, lineHeight: 1.08, letterSpacing: '-.02em',
          }}>
            Verified properties{' '}
            <span style={{ color: '#f59e0b' }}>in Ethiopia</span>
          </h2>
        </div>

        {/* Row 1 — Featured */}
        <ScrollRow
          title="Featured Homes"
          subtitle="Handpicked verified listings across Ethiopia"
          searchHref="/search"
          sortBy="recent"
        />

        {/* Row 2 — Trending (most viewed) */}
        <ScrollRow
          title={trending.title}
          subtitle={trending.subtitle}
          searchHref="/search"
          sortBy="views"
        />

        {/* Row 3 — For You (newest) */}
        <ScrollRow
          title={forYou.title}
          subtitle={forYou.subtitle}
          searchHref="/search"
          sortBy="recent"
        />

      </div>
    </section>
  )
}
