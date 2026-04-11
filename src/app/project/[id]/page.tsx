'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { MapPin, Building2, CheckCircle, Clock, Phone, Mail, ChevronDown, ChevronUp } from 'lucide-react'
import { formatETB } from '@/lib/utils'

function InquiryForm({ projectId, unitId }: { projectId: string; unitId?: string }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: "I'm interested in this development. Please contact me with more information." })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    await createClient().from('project_inquiries').insert({
      project_id: projectId,
      unit_id: unitId || null,
      ...form
    })
    setSent(true)
    setSending(false)
  }

  if (sent) return (
    <div style={{ textAlign: 'center', padding: '20px 0' }}>
      <CheckCircle size={40} color="#16a34a" style={{ marginBottom: 10 }}/>
      <div style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 6 }}>Message sent!</div>
      <div style={{ fontSize: 13, color: '#888' }}>The developer will contact you soon.</div>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {[
        { key: 'name', label: 'Full name', type: 'text', placeholder: 'Your name', required: true },
        { key: 'email', label: 'Email', type: 'email', placeholder: 'your@email.com', required: true },
        { key: 'phone', label: 'Phone', type: 'tel', placeholder: '+251 9XX XXX XXXX', required: false },
      ].map(({ key, label, type, placeholder, required }) => (
        <div key={key}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 5 }}>{label}</label>
          <input type={type} placeholder={placeholder} required={required}
            value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
            style={{ width: '100%', padding: '10px 13px', border: '1.5px solid #e0dfd9', borderRadius: 9, fontSize: 13, outline: 'none', fontFamily: 'inherit', transition: 'border .15s' }}
            onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#16a34a'}
            onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#e0dfd9'}
          />
        </div>
      ))}
      <div>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 5 }}>Message</label>
        <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={3} required
          style={{ width: '100%', padding: '10px 13px', border: '1.5px solid #e0dfd9', borderRadius: 9, fontSize: 13, outline: 'none', fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.6 }}
          onFocus={e => (e.target as HTMLTextAreaElement).style.borderColor = '#16a34a'}
          onBlur={e => (e.target as HTMLTextAreaElement).style.borderColor = '#e0dfd9'}
        />
      </div>
      <button type="submit" disabled={sending}
        style={{ background: sending ? '#9ca3af' : '#16a34a', color: '#fff', border: 'none', padding: '12px', borderRadius: 9, fontSize: 14, fontWeight: 700, cursor: sending ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
      >{sending ? 'Sending...' : 'Send inquiry'}</button>
    </form>
  )
}

export default function ProjectPage() {
  const params = useParams()
  const [project, setProject] = useState<any>(null)
  const [units, setUnits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)
  const [showAllUnits, setShowAllUnits] = useState(false)
  const [selectedUnit, setSelectedUnit] = useState<any>(null)
  const [showInquiry, setShowInquiry] = useState(false)

  useEffect(() => {
    if (params.id) load(params.id as string)
  }, [params.id])

  async function load(id: string) {
    const sb = createClient()
    const [{ data: proj }, { data: unitsData }] = await Promise.all([
      sb.from('projects').select('*').eq('id', id).single(),
      sb.from('units').select('*').eq('project_id', id).order('floor').order('unit_number'),
    ])
    if (proj) {
      setProject(proj)
      await sb.from('projects').update({ views: (proj.views || 0) + 1 }).eq('id', id)
    }
    setUnits(unitsData || [])
    setLoading(false)
  }

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#aaa', fontSize: 14 }}>Loading project...</div>
  if (!project) return <div style={{ textAlign: 'center', padding: 60 }}>Project not found. <Link href="/search">Back to search</Link></div>

  const images = project.images?.length ? project.images : project.cover_image_url ? [project.cover_image_url] : []
  const availableUnits = units.filter(u => u.status === 'available')
  const visibleUnits = showAllUnits ? units : units.slice(0, 6)

  const statusColor: Record<string, string> = {
    available: '#16a34a', reserved: '#d97706', sold: '#dc2626'
  }

  return (
    <div style={{ background: '#f9f9f7', minHeight: '100vh' }}>

      {/* Hero */}
      <div style={{ background: '#0d2318', padding: '32px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: 5, marginBottom: 12 }}>
            <Link href="/" style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Home</Link>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>/</span>
            <Link href="/developments" style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Developments</Link>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>/</span>
            <span style={{ fontSize: 13, color: '#fff' }}>{project.name}</span>
          </div>
          <h1 style={{ fontSize: 'clamp(24px,4vw,38px)', fontWeight: 900, color: '#fff', margin: '0 0 8px', letterSpacing: '-.02em' }}>{project.name}</h1>
          {project.name_amharic && <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', marginBottom: 12 }}>{project.name_amharic}</div>}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>
            <MapPin size={13}/>{project.neighborhood || project.city}, {project.city}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 28, alignItems: 'start' }}>

          {/* LEFT */}
          <div>
            {/* Gallery */}
            {images.length > 0 && (
              <div style={{ borderRadius: 14, overflow: 'hidden', marginBottom: 24, background: '#111' }}>
                <div style={{ position: 'relative', height: 420 }}>
                  <Image src={images[activeImage]} alt={project.name} fill sizes="(max-width: 768px) 100vw, 700px" style={{ objectFit: 'cover' }} priority/>
                </div>
                {images.length > 1 && (
                  <div style={{ display: 'flex', gap: 6, padding: '8px', background: '#111' }}>
                    {images.map((img: string, i: number) => (
                      <div key={i} onClick={() => setActiveImage(i)}
                        style={{ width: 80, height: 55, borderRadius: 6, cursor: 'pointer', overflow: 'hidden', flexShrink: 0, position: 'relative', opacity: i === activeImage ? 1 : 0.45, border: i === activeImage ? '2px solid #16a34a' : '2px solid transparent' }}
                      >
                        <Image src={img} alt="" fill style={{ objectFit: 'cover' }}/>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Key stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 12, marginBottom: 24 }}>
              {[
                { label: 'Total units', value: project.total_units || units.length },
                { label: 'Available', value: availableUnits.length, color: '#16a34a' },
                { label: 'Status', value: project.construction_status },
                { label: 'Completion', value: project.completion_date || 'TBD' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ background: '#fff', border: '1px solid #eae9e4', borderRadius: 12, padding: '14px 16px' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: color || '#111', lineHeight: 1 }}>{value}</div>
                  <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Description */}
            {project.description && (
              <div style={{ background: '#fff', border: '1px solid #eae9e4', borderRadius: 14, padding: 22, marginBottom: 20 }}>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111', marginBottom: 12 }}>About this development</h2>
                <p style={{ fontSize: 14, color: '#555', lineHeight: 1.8, margin: 0 }}>{project.description}</p>
              </div>
            )}

            {/* Amenities */}
            {project.amenities?.length > 0 && (
              <div style={{ background: '#fff', border: '1px solid #eae9e4', borderRadius: 14, padding: 22, marginBottom: 20 }}>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111', marginBottom: 14 }}>Amenities</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {project.amenities.map((a: string) => (
                    <span key={a} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#555', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '5px 12px', borderRadius: 20 }}>
                      <CheckCircle size={12} color="#16a34a"/>{a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Units table */}
            {units.length > 0 && (
              <div style={{ background: '#fff', border: '1px solid #eae9e4', borderRadius: 14, padding: 22, marginBottom: 20 }}>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111', marginBottom: 16 }}>Available units</h2>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #f0f0ec' }}>
                        {['Unit', 'Type', 'Floor', 'Beds', 'Size', 'Price', 'Status', ''].map(h => (
                          <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '.05em' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {visibleUnits.map(unit => (
                        <tr key={unit.id} style={{ borderBottom: '1px solid #f5f5f2' }}>
                          <td style={{ padding: '10px 12px', fontWeight: 600, color: '#111' }}>{unit.unit_number || '—'}</td>
                          <td style={{ padding: '10px 12px', color: '#555' }}>{unit.unit_type || '—'}</td>
                          <td style={{ padding: '10px 12px', color: '#555' }}>{unit.floor || '—'}</td>
                          <td style={{ padding: '10px 12px', color: '#555' }}>{unit.bedrooms || '—'}</td>
                          <td style={{ padding: '10px 12px', color: '#555' }}>{unit.size_sqm ? `${unit.size_sqm}m²` : '—'}</td>
                          <td style={{ padding: '10px 12px', fontWeight: 700, color: '#16a34a' }}>{unit.price_etb ? formatETB(unit.price_etb) : '—'}</td>
                          <td style={{ padding: '10px 12px' }}>
                            <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: `${statusColor[unit.status] || '#888'}18`, color: statusColor[unit.status] || '#888' }}>
                              {unit.status}
                            </span>
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            {unit.status === 'available' && (
                              <button onClick={() => { setSelectedUnit(unit); setShowInquiry(true) }}
                                style={{ fontSize: 11, padding: '5px 10px', borderRadius: 6, border: 'none', background: '#f0fdf4', color: '#16a34a', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}
                              >Inquire</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {units.length > 6 && (
                  <button onClick={() => setShowAllUnits(!showAllUnits)}
                    style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#16a34a', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}
                  >
                    {showAllUnits ? <><ChevronUp size={14}/> Show less</> : <><ChevronDown size={14}/> Show all {units.length} units</>}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR */}
          <div style={{ position: 'sticky', top: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Price card */}
            <div style={{ background: '#fff', border: '1px solid #eae9e4', borderRadius: 16, padding: 22, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
              {project.min_price_etb && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, color: '#aaa', marginBottom: 4 }}>Starting from</div>
                  <div style={{ fontSize: 26, fontWeight: 900, color: '#16a34a' }}>{formatETB(project.min_price_etb)}</div>
                  {project.max_price_etb && project.max_price_etb !== project.min_price_etb && (
                    <div style={{ fontSize: 13, color: '#aaa' }}>up to {formatETB(project.max_price_etb)}</div>
                  )}
                </div>
              )}

              <div style={{ fontSize: 13, fontWeight: 700, color: '#111', marginBottom: 14 }}>Express interest</div>
              <InquiryForm projectId={project.id}/>
            </div>

            {/* Progress */}
            <div style={{ background: '#fff', border: '1px solid #eae9e4', borderRadius: 14, padding: 18 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#111', marginBottom: 14 }}>Unit availability</div>
              {[
                { label: 'Available', count: project.available_units || availableUnits.length, color: '#16a34a' },
                { label: 'Reserved', count: project.reserved_units || 0, color: '#d97706' },
                { label: 'Sold', count: project.sold_units || 0, color: '#dc2626' },
              ].map(({ label, count, color }) => {
                const total = project.total_units || units.length || 1
                const pct = Math.round((count / total) * 100)
                return (
                  <div key={label} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
                      <span style={{ color: '#555' }}>{label}</span>
                      <span style={{ fontWeight: 600, color }}>{count} units ({pct}%)</span>
                    </div>
                    <div style={{ height: 6, background: '#f0f0ec', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'width .5s' }}/>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Construction status */}
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#16a34a', marginBottom: 4 }}>
                🏗️ {project.construction_status}
              </div>
              {project.completion_date && (
                <div style={{ fontSize: 12, color: '#555' }}>Expected completion: {project.completion_date}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Inquiry modal */}
      {showInquiry && selectedUnit && (
        <div onClick={() => setShowInquiry(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 18, padding: 28, width: '100%', maxWidth: 420, boxShadow: '0 24px 60px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#111', marginBottom: 4 }}>Inquire about Unit {selectedUnit.unit_number}</h3>
            <p style={{ fontSize: 13, color: '#888', marginBottom: 20 }}>
              {selectedUnit.unit_type} · {selectedUnit.bedrooms} bed · {selectedUnit.size_sqm}m² · {formatETB(selectedUnit.price_etb)}
            </p>
            <InquiryForm projectId={project.id} unitId={selectedUnit.id}/>
            <button onClick={() => setShowInquiry(false)} style={{ width: '100%', marginTop: 10, background: 'none', border: 'none', color: '#aaa', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}
