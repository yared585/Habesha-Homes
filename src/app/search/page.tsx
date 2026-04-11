'use client'

// Note: metadata must be in a server component wrapper for full SEO
// Dynamic title is handled via useEffect below

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Search, SlidersHorizontal, MapIcon, List, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Spinner } from '@/components/ui/Spinner'
import { PropertyMap } from '@/components/property/PropertyMap'
import { formatETB } from '@/lib/utils'
import type { Property, PropertyFilters, Neighborhood } from '@/types'

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [properties, setProperties] = useState<Property[]>([])
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(1)

  const [filters, setFilters] = useState<PropertyFilters>({
    query: searchParams.get('q') || '',
    listing_intent: (['sale','rent','both'].includes(searchParams.get('intent') || '') ? searchParams.get('intent') as any : undefined),
    neighborhoods: searchParams.get('neighborhoods')?.split(',').filter(Boolean) || [],
    furnished: searchParams.get('furnished') || undefined,
  })

  // Sync filters when URL changes (e.g. clicking Buy/Rent in navbar)
  useEffect(() => {
    const intent = searchParams.get('intent')
    setFilters(f => ({
      ...f,
      query: searchParams.get('q') || '',
      listing_intent: (['sale','rent','both'].includes(intent || '') ? intent as any : undefined),
      neighborhoods: searchParams.get('neighborhoods')?.split(',').filter(Boolean) || [],
      furnished: searchParams.get('furnished') || undefined,
    }))
    setPage(1)
  }, [searchParams.get('intent'), searchParams.get('q')])

  useEffect(() => {
    loadNeighborhoods()
  }, [])

  useEffect(() => {
    search()
  }, [filters, page])

  async function loadNeighborhoods() {
    const supabase = createClient()
    const { data } = await supabase.from('neighborhoods').select('*').order('avg_price_per_sqm_etb', { ascending: false })
    setNeighborhoods((data || []) as Neighborhood[])
  }

  async function search() {
    setLoading(true)
    const params = new URLSearchParams()
    if (filters.query) params.set('q', filters.query)
    if (filters.listing_intent) params.set('intent', filters.listing_intent)
    if (filters.neighborhoods?.length) params.set('neighborhoods', filters.neighborhoods.join(','))
    if (filters.min_price_etb) params.set('min_price', filters.min_price_etb.toString())
    if (filters.max_price_etb) params.set('max_price', filters.max_price_etb.toString())
    if (filters.min_bedrooms) params.set('min_beds', filters.min_bedrooms.toString())
    if (filters.furnished) params.set('furnished', filters.furnished)
    if (filters.sort) params.set('sort', filters.sort)
    params.set('page', page.toString())

    const res = await fetch(`/api/properties?${params}`)
    if (res.ok) {
      const data = await res.json()
      setProperties(data.data || [])
      setTotal(data.total || 0)
    }
    setLoading(false)
  }

  function updateFilter(key: keyof PropertyFilters, value: any) {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPage(1)
  }

  function toggleNeighborhood(name: string) {
    const current = filters.neighborhoods || []
    const updated = current.includes(name) ? current.filter(n => n !== name) : [...current, name]
    updateFilter('neighborhoods', updated)
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 16px' }}>

      {/* Search bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 220, display: 'flex', background: 'white', border: '1px solid #e0e0e0', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px', color: '#aaa' }}>
            <Search size={16} />
          </div>
          <input
            type="text"
            value={filters.query || ''}
            onChange={e => updateFilter('query', e.target.value)}
            placeholder="Search properties... / ፍለጋ..."
            style={{ flex: 1, border: 'none', outline: 'none', padding: '10px 0', fontSize: 14 }}
          />
          {filters.query && (
            <button onClick={() => updateFilter('query', '')} style={{ background: 'none', border: 'none', padding: '0 12px', cursor: 'pointer', color: '#aaa' }}>
              <X size={14} />
            </button>
          )}
        </div>

        {/* Intent toggle */}
        <div style={{ display: 'flex', background: 'white', border: '1px solid #e0e0e0', borderRadius: 8, overflow: 'hidden' }}>
          {[{ label: 'All', value: undefined }, { label: 'Buy', value: 'sale' }, { label: 'Rent', value: 'rent' }].map(({ label, value }) => (
            <button key={label} onClick={() => updateFilter('listing_intent', value)} style={{
              background: filters.listing_intent === value ? '#111' : 'transparent',
              color: filters.listing_intent === value ? 'white' : '#555',
              border: 'none', padding: '10px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 500
            }}>
              {label}
            </button>
          ))}
        </div>

        <button onClick={() => setShowFilters(!showFilters)} style={{
          display: 'flex', alignItems: 'center', gap: 6, background: 'white',
          border: '1px solid #e0e0e0', borderRadius: 8, padding: '10px 14px', cursor: 'pointer', fontSize: 13
        }}>
          <SlidersHorizontal size={15} /> Filters
        </button>

        {/* View toggle */}
        <div style={{ display: 'flex', background: 'white', border: '1px solid #e0e0e0', borderRadius: 8, overflow: 'hidden' }}>
          <button onClick={() => setViewMode('list')} style={{ background: viewMode === 'list' ? '#111' : 'transparent', color: viewMode === 'list' ? 'white' : '#555', border: 'none', padding: '10px 12px', cursor: 'pointer' }}>
            <List size={15} />
          </button>
          <button onClick={() => setViewMode('map')} style={{ background: viewMode === 'map' ? '#111' : 'transparent', color: viewMode === 'map' ? 'white' : '#555', border: 'none', padding: '10px 12px', cursor: 'pointer' }}>
            <MapIcon size={15} />
          </button>
        </div>
      </div>

      {/* Neighborhood chips */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
        {neighborhoods.slice(0, 10).map(n => (
          <button
            key={n.id}
            onClick={() => toggleNeighborhood(n.name)}
            style={{
              background: (filters.neighborhoods || []).includes(n.name) ? '#1D9E75' : 'white',
              color: (filters.neighborhoods || []).includes(n.name) ? 'white' : '#555',
              border: '1px solid #e0e0e0', borderRadius: 20,
              padding: '5px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 500
            }}
          >
            {n.name} {n.name_amharic ? `/ ${n.name_amharic}` : ''}
          </button>
        ))}
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div style={{ background: 'white', border: '1px solid #eee', borderRadius: 10, padding: 20, marginBottom: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 6 }}>Min Price (ETB)</label>
              <input type="number" placeholder="e.g. 1000000" onChange={e => updateFilter('min_price_etb', parseInt(e.target.value) || undefined)}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13 }} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 6 }}>Max Price (ETB)</label>
              <input type="number" placeholder="e.g. 5000000" onChange={e => updateFilter('max_price_etb', parseInt(e.target.value) || undefined)}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13 }} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 6 }}>Min Bedrooms</label>
              <select onChange={e => updateFilter('min_bedrooms', parseInt(e.target.value) || undefined)}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13 }}>
                <option value="">Any</option>
                {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}+</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 6 }}>Property Type</label>
              <select onChange={e => updateFilter('property_types', e.target.value ? [e.target.value] : undefined)}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13 }}>
                <option value="">Any</option>
                {['apartment','villa','house','condominium','commercial','land'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 6 }}>Furnished</label>
              <select onChange={e => updateFilter('furnished', e.target.value || undefined)}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13 }}>
                <option value="">Any</option>
                <option value="furnished">Furnished</option>
                <option value="semi-furnished">Semi-furnished</option>
                <option value="unfurnished">Unfurnished</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 6 }}>Sort by</label>
              <select onChange={e => updateFilter('sort', e.target.value)}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13 }}>
                <option value="newest">Newest first</option>
                <option value="price_asc">Price: Low to high</option>
                <option value="price_desc">Price: High to low</option>
                <option value="featured">Featured first</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Results count */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, fontSize: 13, color: '#888' }}>
        <span>{loading ? 'Searching...' : `${total.toLocaleString()} properties found`}</span>
        <select value={(filters as any).sort || 'newest'} onChange={e => updateFilter('sort', e.target.value)} style={{ border: '1px solid #e0e0e0', borderRadius: 6, padding: '6px 10px', fontSize: 12, fontFamily: 'inherit', outline: 'none' }}>
          <option value="newest">Newest first</option>
          <option value="price_asc">Price: Low to high</option>
          <option value="price_desc">Price: High to low</option>
          <option value="featured">Featured first</option>
        </select>
      </div>

      {/* Map view */}
      {viewMode === 'map' && (
        <div style={{ marginBottom: 20, position: 'relative' }}>
          <PropertyMap properties={properties} height={500} center={{ lat: 9.0192, lng: 38.7892 }} zoom={13} />
          {loading && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.65)', borderRadius: 12, zIndex: 20 }}>
              <Spinner size="lg" />
            </div>
          )}
        </div>
      )}

      {/* List view */}
      {viewMode === 'list' && (
        <>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {[1,2,3,4,5,6,7,8].map(i => (
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
          ) : properties.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 24px', background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--border)' }}>
              <div style={{ width: 64, height: 64, borderRadius: 20, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <Search size={26} color="var(--text-4)"/>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', margin: '0 0 8px' }}>No properties found</h3>
              <p style={{ fontSize: 14, color: 'var(--text-3)', margin: '0 0 24px', lineHeight: 1.6 }}>
                Try adjusting your filters or search in a different area.
              </p>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={() => { setFilters({ query: '', listing_intent: undefined, neighborhoods: [] }); setPage(1) }}
                  style={{ padding: '10px 20px', background: 'var(--green)', color: '#fff', border: 'none', borderRadius: 'var(--r-lg)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Clear filters
                </button>
                <Link href="/search" style={{ padding: '10px 20px', background: 'var(--surface-2)', color: 'var(--text-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>
                  Browse all
                </Link>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {properties.map(property => (
                <Link key={property.id} href={`/property/${property.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{ background: 'white', borderRadius: 10, overflow: 'hidden', border: '1px solid #eee', transition: 'all .2s' }}>
                    <div style={{ height: 180, background: '#e8f5e9', position: 'relative', overflow: 'hidden' }}>
                      {property.cover_image_url && (
                        <Image src={property.cover_image_url} alt={property.title} fill sizes="(max-width: 768px) 100vw, 350px" style={{ objectFit: 'cover' }}/>
                      )}
                      <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 5 }}>
                        {property.is_featured && <span style={{ background: '#1D9E75', color: 'white', fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>Featured</span>}
                        {property.title_verified && <span style={{ background: 'white', color: '#1D9E75', fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>✓ Verified</span>}
                      </div>
                    </div>
                    <div style={{ padding: 14 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#111', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{property.title}</div>
                      <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>
                        {(property as any).neighborhood?.name || property.city}
                      </div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: '#1D9E75', marginBottom: 6 }}>
                        {formatETB(property.listing_intent === 'rent' ? property.rent_per_month_etb : property.price_etb)}
                        {property.listing_intent === 'rent' && <span style={{ fontSize: 12, fontWeight: 400 }}>/mo</span>}
                      </div>
                      <div style={{ display: 'flex', gap: 10, fontSize: 12, color: '#666' }}>
                        {property.bedrooms && <span>{property.bedrooms} bed</span>}
                        {property.bathrooms && <span>{property.bathrooms} bath</span>}
                        {property.size_sqm && <span>{property.size_sqm}m²</span>}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {total > 20 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32 }}>
              {page > 1 && (
                <button onClick={() => setPage(p => p - 1)} style={{ padding: '8px 16px', border: '1px solid #e0e0e0', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>
                  ← Previous
                </button>
              )}
              <span style={{ padding: '8px 16px', fontSize: 13, color: '#888' }}>
                Page {page} of {Math.ceil(total / 20)}
              </span>
              {page < Math.ceil(total / 20) && (
                <button onClick={() => setPage(p => p + 1)} style={{ padding: '8px 16px', border: '1px solid #e0e0e0', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>
                  Next →
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Loading search...</div>}>
      <SearchContent />
    </Suspense>
  )
}
