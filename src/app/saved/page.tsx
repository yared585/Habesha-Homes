'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { PropertyCard } from '@/components/property/PropertyCard'
import { Heart, Search } from 'lucide-react'
import type { Property } from '@/types'

export default function SavedPage() {
  const router = useRouter()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSaved()
  }, [])

  async function loadSaved() {
    const sb = createClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    const { data } = await sb
      .from('saved_properties')
      .select('property:properties(*,neighborhood:neighborhoods(name,avg_price_per_sqm_etb),agent:agents(agency_name,is_verified))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    setProperties((data || []).map((d: any) => d.property).filter(Boolean) as Property[])
    setLoading(false)
  }

  if (loading) return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', padding: '32px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ marginBottom: 28 }}>
          <div className="skeleton-line" style={{ width: 220, height: 28, marginBottom: 10 }}/>
          <div className="skeleton-line" style={{ width: 120, height: 14 }}/>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 20 }}>
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="skeleton-card">
              <div className="skeleton-img"/>
              <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 9 }}>
                <div className="skeleton-line" style={{ width: '72%' }}/>
                <div className="skeleton-line" style={{ width: '44%', height: 10 }}/>
                <div className="skeleton-line" style={{ width: '52%', height: 20, marginTop: 2 }}/>
                <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
                  <div className="skeleton-line" style={{ width: 48 }}/>
                  <div className="skeleton-line" style={{ width: 48 }}/>
                  <div className="skeleton-line" style={{ width: 56 }}/>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ background: '#f9f9f7', minHeight: '100vh', padding: '32px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <Heart size={22} color="#dc2626" fill="#dc2626"/>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: '#111', margin: 0, letterSpacing: '-.02em' }}>Saved properties</h1>
          </div>
          <p style={{ fontSize: 14, color: '#888', margin: 0 }}>
            {properties.length === 0 ? 'No saved properties yet' : `${properties.length} saved propert${properties.length === 1 ? 'y' : 'ies'}`}
          </p>
        </div>

        {properties.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 24px', background: '#fff', borderRadius: 16, border: '1px solid #eae9e4' }}>
            <Heart size={48} color="#e0dfd9" style={{ marginBottom: 16 }}/>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111', marginBottom: 8 }}>No saved properties yet</h2>
            <p style={{ fontSize: 14, color: '#888', marginBottom: 24, lineHeight: 1.6 }}>
              Click the ♡ heart button on any property to save it here for later.
            </p>
            <Link href="/search" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#16a34a', color: '#fff', padding: '12px 28px', borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
              <Search size={15}/> Browse properties
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 20 }}>
            {properties.map(p => <PropertyCard key={p.id} property={p}/>)}
          </div>
        )}
      </div>
    </div>
  )
}
