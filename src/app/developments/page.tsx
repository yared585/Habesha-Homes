'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { MapPin, Building2, ArrowRight, Eye } from 'lucide-react'
import { formatETB } from '@/lib/utils'

export default function DevelopmentsPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    createClient()
      .from('projects')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .then(({ data }) => { setProjects(data || []); setLoading(false) })
  }, [])

  return (
    <div style={{ background: '#f9f9f7', minHeight: '100vh' }}>
      <div style={{ background: '#0d2318', padding: '48px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: 5, marginBottom: 16 }}>
            {['#078930','#FCDD09','#DA121A'].map(c => <div key={c} style={{ width: 28, height: 3, borderRadius: 2, background: c }}/>)}
          </div>
          <h1 style={{ fontSize: 'clamp(28px,5vw,42px)', fontWeight: 900, color: '#fff', margin: '0 0 10px', letterSpacing: '-.025em' }}>
            New Developments
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', margin: 0 }}>
            Off-plan and new construction projects across Ethiopia
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 20 }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 340, borderRadius: 16 }}/>)}
          </div>
        ) : projects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 24px', background: '#fff', borderRadius: 16, border: '1px solid #eae9e4' }}>
            <Building2 size={48} color="#e0dfd9" style={{ marginBottom: 16 }}/>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111', marginBottom: 8 }}>No developments yet</h2>
            <p style={{ fontSize: 14, color: '#888', marginBottom: 20 }}>Check back soon — new projects are being added regularly.</p>
            <Link href="/search" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#16a34a', color: '#fff', padding: '11px 22px', borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
              Browse all listings <ArrowRight size={14}/>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 20 }}>
            {projects.map(p => (
              <Link key={p.id} href={`/project/${p.id}`} style={{ textDecoration: 'none' }}>
                <div style={{ background: '#fff', border: '1px solid #eae9e4', borderRadius: 16, overflow: 'hidden', transition: 'box-shadow .15s, transform .15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 30px rgba(0,0,0,0.1)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; (e.currentTarget as HTMLDivElement).style.transform = 'none' }}
                >
                  {/* Image */}
                  <div style={{ height: 200, background: '#f0f0ec', position: 'relative', overflow: 'hidden' }}>
                    {p.cover_image_url
                      ? <img src={p.cover_image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy"/>
                      : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Building2 size={40} color="#ccc"/></div>
                    }
                    {p.is_featured && (
                      <div style={{ position: 'absolute', top: 12, left: 12, background: '#f59e0b', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>Featured</div>
                    )}
                    <div style={{ position: 'absolute', bottom: 12, right: 12, background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 11, padding: '3px 10px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Eye size={11}/>{p.views || 0} views
                    </div>
                  </div>

                  {/* Body */}
                  <div style={{ padding: '16px 18px' }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 6 }}>{p.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#888', marginBottom: 12 }}>
                      <MapPin size={11}/>{p.neighborhood || p.city}
                    </div>

                    {/* Unit availability */}
                    <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                      {[
                        { label: 'Total', value: p.total_units || 0 },
                        { label: 'Available', value: p.available_units || 0, color: '#16a34a' },
                        { label: 'Sold', value: p.sold_units || 0, color: '#dc2626' },
                      ].map(({ label, value, color }) => (
                        <div key={label} style={{ textAlign: 'center', flex: 1, background: '#f9f9f7', borderRadius: 8, padding: '8px 4px' }}>
                          <div style={{ fontSize: 16, fontWeight: 800, color: color || '#111' }}>{value}</div>
                          <div style={{ fontSize: 10, color: '#aaa' }}>{label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Price */}
                    {p.min_price_etb && (
                      <div style={{ fontSize: 18, fontWeight: 800, color: '#16a34a', marginBottom: 8 }}>
                        from {formatETB(p.min_price_etb)}
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid #f0f0ec' }}>
                      <span style={{ fontSize: 12, color: '#888', textTransform: 'capitalize' }}>{p.construction_status}</span>
                      <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 600 }}>View project →</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
