'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { PropertyGrid } from '@/components/property/PropertyCard'
import { SectionHeader } from '@/components/ui'
import { useProperties } from '@/hooks/useProperties'

export function FeaturedProperties() {
  const { properties, loading } = useProperties({ limit: 6, featured: false })

  return (
    <section style={{ padding: '80px 24px', background: '#fff', borderTop: '1px solid #eae9e4' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <SectionHeader
          title="Featured properties"
          subtitle="ተመራጭ ቤቶች — Verified and AI-analyzed listings"
          action={
            <Link href="/search" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 14, fontWeight: 700, color: '#16a34a', border: '1.5px solid #16a34a', padding: '9px 20px', borderRadius: 20, textDecoration: 'none', transition: 'all .15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#16a34a'; (e.currentTarget as HTMLAnchorElement).style.color = '#fff' }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; (e.currentTarget as HTMLAnchorElement).style.color = '#16a34a' }}
            >
              View all <ArrowRight size={14}/>
            </Link>
          }
        />
        <PropertyGrid properties={properties} loading={loading}/>
      </div>
    </section>
  )
}
