'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Plus, Edit2, Save, X, CheckCircle, Clock, XCircle } from 'lucide-react'
import { formatETB } from '@/lib/utils'

const STATUS_OPTIONS = ['available', 'reserved', 'sold']
const UNIT_TYPES = ['Studio', '1 Bedroom', '2 Bedroom', '3 Bedroom', 'Penthouse', 'Duplex', 'Commercial']

export default function ProjectManagePage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<any>(null)
  const [units, setUnits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingUnit, setEditingUnit] = useState<string | null>(null)
  const [newUnit, setNewUnit] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (params.id) load(params.id as string)
  }, [params.id])

  async function load(id: string) {
    const sb = createClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    const [{ data: proj }, { data: unitsData }] = await Promise.all([
      sb.from('projects').select('*').eq('id', id).single(),
      sb.from('units').select('*').eq('project_id', id).order('floor').order('unit_number'),
    ])

    if (!proj || (proj.developer_id !== user.id)) {
      // Check if admin
      const { data: profile } = await sb.from('profiles').select('role').eq('id', user.id).single()
      if (profile?.role !== 'admin') { router.push('/dashboard'); return }
    }

    setProject(proj)
    setUnits(unitsData || [])
    setLoading(false)
  }

  async function saveUnit(unit: any) {
    setSaving(true)
    const sb = createClient()
    if (unit.id && unit.id !== 'new') {
      await sb.from('units').update({
        unit_number: unit.unit_number,
        unit_type: unit.unit_type,
        floor: unit.floor ? parseInt(unit.floor) : null,
        bedrooms: unit.bedrooms ? parseInt(unit.bedrooms) : null,
        bathrooms: unit.bathrooms ? parseInt(unit.bathrooms) : null,
        size_sqm: unit.size_sqm ? parseFloat(unit.size_sqm) : null,
        price_etb: unit.price_etb ? parseFloat(unit.price_etb) : null,
        status: unit.status,
        buyer_name: unit.buyer_name || null,
        notes: unit.notes || null,
      }).eq('id', unit.id)
      setUnits(u => u.map(x => x.id === unit.id ? { ...x, ...unit } : x))
    } else {
      const { data } = await sb.from('units').insert({
        project_id: params.id,
        unit_number: unit.unit_number,
        unit_type: unit.unit_type,
        floor: unit.floor ? parseInt(unit.floor) : null,
        bedrooms: unit.bedrooms ? parseInt(unit.bedrooms) : null,
        bathrooms: unit.bathrooms ? parseInt(unit.bathrooms) : null,
        size_sqm: unit.size_sqm ? parseFloat(unit.size_sqm) : null,
        price_etb: unit.price_etb ? parseFloat(unit.price_etb) : null,
        status: unit.status || 'available',
      }).select().single()
      if (data) setUnits(u => [...u, data])
      setNewUnit(null)
    }

    // Update project unit counts
    await updateUnitCounts()
    setEditingUnit(null)
    setSaving(false)
  }

  async function updateUnitCounts() {
    const sb = createClient()
    const { data: allUnits } = await sb.from('units').select('status').eq('project_id', params.id as string)
    if (!allUnits) return
    await sb.from('projects').update({
      total_units: allUnits.length,
      available_units: allUnits.filter(u => u.status === 'available').length,
      reserved_units: allUnits.filter(u => u.status === 'reserved').length,
      sold_units: allUnits.filter(u => u.status === 'sold').length,
    }).eq('id', params.id as string)
  }

  async function deleteUnit(id: string) {
    if (!confirm('Delete this unit?')) return
    await createClient().from('units').delete().eq('id', id)
    setUnits(u => u.filter(x => x.id !== id))
    await updateUnitCounts()
  }

  const statusIcon: Record<string, React.ReactNode> = {
    available: <CheckCircle size={13} color="#16a34a"/>,
    reserved: <Clock size={13} color="#d97706"/>,
    sold: <XCircle size={13} color="#dc2626"/>,
  }

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#aaa' }}>Loading...</div>

  return (
    <div style={{ background: '#f9f9f7', minHeight: '100vh', padding: '24px' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/dashboard/developer" style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', border: '1px solid #eae9e4', borderRadius: 8, padding: '7px 14px', textDecoration: 'none', fontSize: 13, color: '#555' }}>
              <ArrowLeft size={13}/> Back
            </Link>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: '#111', margin: 0 }}>{project?.name}</h1>
              <div style={{ fontSize: 12, color: '#888' }}>Unit inventory management</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link href={`/project/${params.id}`} target="_blank"
              style={{ fontSize: 13, padding: '8px 16px', borderRadius: 8, border: '1px solid #e0dfd9', color: '#555', textDecoration: 'none' }}
            >View public page</Link>
            <button onClick={() => setNewUnit({ unit_number: '', unit_type: '2 Bedroom', floor: '', bedrooms: '', bathrooms: '', size_sqm: '', price_etb: '', status: 'available' })}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#16a34a', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
            ><Plus size={14}/> Add unit</button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Total units', value: units.length, color: '#111' },
            { label: 'Available', value: units.filter(u => u.status === 'available').length, color: '#16a34a' },
            { label: 'Reserved', value: units.filter(u => u.status === 'reserved').length, color: '#d97706' },
            { label: 'Sold', value: units.filter(u => u.status === 'sold').length, color: '#dc2626' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: '#fff', border: '1px solid #eae9e4', borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Add new unit form */}
        {newUnit && (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#15803d', marginBottom: 12 }}>Add new unit</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 10 }}>
              {[
                { key: 'unit_number', label: 'Unit #', placeholder: 'e.g. A-101' },
                { key: 'floor', label: 'Floor', placeholder: '1' },
                { key: 'bedrooms', label: 'Beds', placeholder: '2' },
                { key: 'bathrooms', label: 'Baths', placeholder: '2' },
                { key: 'size_sqm', label: 'Size m²', placeholder: '85' },
                { key: 'price_etb', label: 'Price ETB', placeholder: '3500000' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>{label}</label>
                  <input value={newUnit[key]} onChange={e => setNewUnit((u: any) => ({ ...u, [key]: e.target.value }))} placeholder={placeholder}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #bbf7d0', borderRadius: 7, fontSize: 13, outline: 'none', fontFamily: 'inherit' }}
                  />
                </div>
              ))}
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Type</label>
                <select value={newUnit.unit_type} onChange={e => setNewUnit((u: any) => ({ ...u, unit_type: e.target.value }))}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #bbf7d0', borderRadius: 7, fontSize: 13, outline: 'none', fontFamily: 'inherit' }}
                >
                  {UNIT_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button onClick={() => saveUnit(newUnit)} disabled={saving}
                style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#16a34a', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
              ><Save size={13}/> {saving ? 'Saving...' : 'Save unit'}</button>
              <button onClick={() => setNewUnit(null)} style={{ background: 'none', border: '1px solid #e0dfd9', padding: '8px 14px', borderRadius: 7, fontSize: 13, color: '#555', cursor: 'pointer', fontFamily: 'inherit' }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Units table */}
        <div style={{ background: '#fff', border: '1px solid #eae9e4', borderRadius: 14, overflow: 'hidden' }}>
          {units.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', color: '#aaa', fontSize: 14 }}>
              No units yet. Click "Add unit" to start building your inventory.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead style={{ background: '#f9f9f7' }}>
                <tr>
                  {['Unit #', 'Type', 'Floor', 'Beds/Baths', 'Size', 'Price', 'Status', 'Buyer', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '.04em', borderBottom: '1px solid #eae9e4' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {units.map(unit => (
                  editingUnit === unit.id ? (
                    <tr key={unit.id} style={{ background: '#fafff8', borderBottom: '1px solid #eae9e4' }}>
                      {['unit_number', 'unit_type', 'floor', 'bedrooms', 'size_sqm', 'price_etb', 'status', 'buyer_name'].map((field, i) => (
                        <td key={field} style={{ padding: '8px 10px' }}>
                          {field === 'status' ? (
                            <select defaultValue={unit[field]}
                              onChange={e => setUnits(u => u.map(x => x.id === unit.id ? { ...x, [field]: e.target.value } : x))}
                              style={{ width: '100%', padding: '6px', border: '1px solid #bbf7d0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit' }}
                            >
                              {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                            </select>
                          ) : field === 'unit_type' ? (
                            <select defaultValue={unit[field]}
                              onChange={e => setUnits(u => u.map(x => x.id === unit.id ? { ...x, [field]: e.target.value } : x))}
                              style={{ width: '100%', padding: '6px', border: '1px solid #bbf7d0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit' }}
                            >
                              {UNIT_TYPES.map(t => <option key={t}>{t}</option>)}
                            </select>
                          ) : (
                            <input defaultValue={unit[field]}
                              onChange={e => setUnits(u => u.map(x => x.id === unit.id ? { ...x, [field]: e.target.value } : x))}
                              style={{ width: '100%', padding: '6px 8px', border: '1px solid #bbf7d0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit' }}
                            />
                          )}
                        </td>
                      ))}
                      <td style={{ padding: '8px 10px' }}>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button onClick={() => saveUnit(units.find(u => u.id === unit.id))} disabled={saving}
                            style={{ display: 'flex', alignItems: 'center', gap: 3, background: '#16a34a', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: 6, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}
                          ><Save size={11}/> Save</button>
                          <button onClick={() => setEditingUnit(null)}
                            style={{ background: 'none', border: '1px solid #e0dfd9', padding: '5px 8px', borderRadius: 6, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}
                          ><X size={11}/></button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr key={unit.id} style={{ borderBottom: '1px solid #f5f5f2' }}
                      onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = '#fafaf8'}
                      onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'}
                    >
                      <td style={{ padding: '11px 14px', fontWeight: 600, color: '#111' }}>{unit.unit_number || '—'}</td>
                      <td style={{ padding: '11px 14px', color: '#555' }}>{unit.unit_type || '—'}</td>
                      <td style={{ padding: '11px 14px', color: '#555' }}>{unit.floor || '—'}</td>
                      <td style={{ padding: '11px 14px', color: '#555' }}>{unit.bedrooms || '—'}/{unit.bathrooms || '—'}</td>
                      <td style={{ padding: '11px 14px', color: '#555' }}>{unit.size_sqm ? `${unit.size_sqm}m²` : '—'}</td>
                      <td style={{ padding: '11px 14px', fontWeight: 700, color: '#16a34a' }}>{unit.price_etb ? formatETB(unit.price_etb) : '—'}</td>
                      <td style={{ padding: '11px 14px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 10,
                          background: unit.status === 'available' ? '#f0fdf4' : unit.status === 'reserved' ? '#fef9ec' : '#fef2f2',
                          color: unit.status === 'available' ? '#16a34a' : unit.status === 'reserved' ? '#d97706' : '#dc2626'
                        }}>
                          {statusIcon[unit.status]}{unit.status}
                        </span>
                      </td>
                      <td style={{ padding: '11px 14px', color: '#888', fontSize: 12 }}>{unit.buyer_name || '—'}</td>
                      <td style={{ padding: '11px 14px' }}>
                        <div style={{ display: 'flex', gap: 5 }}>
                          <button onClick={() => setEditingUnit(unit.id)}
                            style={{ display: 'flex', alignItems: 'center', gap: 3, background: '#f0fdf4', color: '#16a34a', border: 'none', padding: '5px 10px', borderRadius: 6, fontSize: 11, cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}
                          ><Edit2 size={11}/> Edit</button>
                          <button onClick={() => deleteUnit(unit.id)}
                            style={{ background: '#fef2f2', color: '#dc2626', border: 'none', padding: '5px 8px', borderRadius: 6, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}
                          >×</button>
                        </div>
                      </td>
                    </tr>
                  )
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  )
}
