'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Building2, Eye, MessageSquare, TrendingUp, Plus, CheckCircle, Clock, XCircle, Edit, BarChart3, Users, DollarSign } from 'lucide-react'
import { formatETB } from '@/lib/utils'

function StatCard({ icon, label, value, color = '#16a34a' }: { icon: React.ReactNode; label: string; value: number | string; color?: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #eae9e4', borderRadius: 12, padding: '16px 20px' }}>
      <div style={{ width: 34, height: 34, borderRadius: 9, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontSize: 24, fontWeight: 800, color: '#111', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>{label}</div>
    </div>
  )
}

export default function DeveloperDashboard() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [projects, setProjects] = useState<any[]>([])
  const [inquiries, setInquiries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'projects' | 'inquiries'>('projects')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const sb = createClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    const { data: profileData } = await sb.from('profiles').select('*').eq('id', user.id).single()
    if (!profileData || profileData.role !== 'developer') { router.push('/'); return }
    setProfile(profileData)

    const { data: projectsData } = await sb
      .from('projects')
      .select('*')
      .eq('developer_id', user.id)
      .order('created_at', { ascending: false })

    setProjects(projectsData || [])

    // Load inquiries for all projects
    if (projectsData?.length) {
      const projectIds = projectsData.map(p => p.id)
      const { data: inqData } = await sb
        .from('project_inquiries')
        .select('*,project:projects(name)')
        .in('project_id', projectIds)
        .order('created_at', { ascending: false })
        .limit(50)
      setInquiries(inqData || [])
    }

    setLoading(false)
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#aaa', fontSize: 14 }}>
      Loading developer dashboard...
    </div>
  )

  const totalUnits = projects.reduce((s, p) => s + (p.total_units || 0), 0)
  const availableUnits = projects.reduce((s, p) => s + (p.available_units || 0), 0)
  const soldUnits = projects.reduce((s, p) => s + (p.sold_units || 0), 0)
  const totalViews = projects.reduce((s, p) => s + (p.views || 0), 0)

  return (
    <div style={{ background: '#f9f9f7', minHeight: '100vh', padding: '24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ background: '#0d2318', borderRadius: 14, padding: '20px 24px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 2 }}>Developer Dashboard</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{profile?.full_name} · {profile?.email}</div>
          </div>
          <Link href="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#16a34a', color: '#fff', padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
            <Plus size={14}/> Request new project
          </Link>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12, marginBottom: 24 }}>
          <StatCard icon={<Building2 size={16}/>} label="Total projects" value={projects.length} color="#16a34a"/>
          <StatCard icon={<Users size={16}/>} label="Total units" value={totalUnits} color="#2563eb"/>
          <StatCard icon={<CheckCircle size={16}/>} label="Available" value={availableUnits} color="#16a34a"/>
          <StatCard icon={<TrendingUp size={16}/>} label="Sold" value={soldUnits} color="#d97706"/>
          <StatCard icon={<Eye size={16}/>} label="Total views" value={totalViews} color="#7c3aed"/>
          <StatCard icon={<MessageSquare size={16}/>} label="Inquiries" value={inquiries.length} color="#dc2626"/>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 2, marginBottom: 20, borderBottom: '2px solid #eae9e4' }}>
          {[
            { id: 'projects', label: `Projects (${projects.length})` },
            { id: 'inquiries', label: `Inquiries (${inquiries.length})` },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as any)} style={{
              background: 'none', border: 'none', padding: '10px 16px', cursor: 'pointer', fontSize: 13,
              fontWeight: tab === t.id ? 700 : 400, color: tab === t.id ? '#16a34a' : '#888',
              borderBottom: tab === t.id ? '2px solid #16a34a' : '2px solid transparent',
              marginBottom: -2, transition: 'all .15s', fontFamily: 'inherit',
            }}>{t.label}</button>
          ))}
        </div>

        {/* PROJECTS */}
        {tab === 'projects' && (
          projects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 24px', background: '#fff', borderRadius: 16, border: '1px solid #eae9e4' }}>
              <Building2 size={48} color="#e0dfd9" style={{ marginBottom: 16 }}/>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111', marginBottom: 8 }}>No projects yet</h3>
              <p style={{ fontSize: 14, color: '#888', marginBottom: 20 }}>Contact us to set up your first development project.</p>
              <Link href="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#16a34a', color: '#fff', padding: '11px 22px', borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
                Contact us
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 14 }}>
              {projects.map(p => (
                <div key={p.id} style={{ background: '#fff', border: '1px solid #eae9e4', borderRadius: 14, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', gap: 0 }}>
                    {/* Cover */}
                    <div style={{ width: 140, flexShrink: 0, background: '#f0f0ec' }}>
                      {p.cover_image_url
                        ? <img src={p.cover_image_url} style={{ width: '100%', height: '100%', objectFit: 'cover', minHeight: 110 }} loading="lazy"/>
                        : <div style={{ height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Building2 size={32} color="#ccc"/></div>
                      }
                    </div>
                    {/* Info */}
                    <div style={{ flex: 1, padding: '16px 20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <div>
                          <div style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 4 }}>{p.name}</div>
                          <div style={{ fontSize: 13, color: '#888' }}>{p.neighborhood || p.city} · {p.construction_status}</div>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, flexShrink: 0,
                          background: p.status === 'active' ? '#f0fdf4' : '#fef9ec',
                          color: p.status === 'active' ? '#16a34a' : '#d97706'
                        }}>{p.status}</span>
                      </div>

                      {/* Unit stats */}
                      <div style={{ display: 'flex', gap: 20, marginBottom: 14 }}>
                        {[
                          { label: 'Total', value: p.total_units || 0, color: '#111' },
                          { label: 'Available', value: p.available_units || 0, color: '#16a34a' },
                          { label: 'Reserved', value: p.reserved_units || 0, color: '#d97706' },
                          { label: 'Sold', value: p.sold_units || 0, color: '#2563eb' },
                          { label: 'Views', value: p.views || 0, color: '#888' },
                        ].map(({ label, value, color }) => (
                          <div key={label}>
                            <div style={{ fontSize: 16, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
                            <div style={{ fontSize: 10, color: '#aaa' }}>{label}</div>
                          </div>
                        ))}
                      </div>

                      {/* Price range */}
                      {p.min_price_etb && (
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#16a34a', marginBottom: 12 }}>
                          {formatETB(p.min_price_etb)} — {formatETB(p.max_price_etb)}
                        </div>
                      )}

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Link href={`/project/${p.id}`} target="_blank"
                          style={{ fontSize: 12, padding: '6px 12px', borderRadius: 7, border: '1px solid #e0dfd9', color: '#555', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
                        ><Eye size={12}/> View page</Link>
                        <Link href={`/dashboard/developer/project/${p.id}`}
                          style={{ fontSize: 12, padding: '6px 12px', borderRadius: 7, border: 'none', background: '#f0fdf4', color: '#16a34a', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}
                        ><Edit size={12}/> Manage units</Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* INQUIRIES */}
        {tab === 'inquiries' && (
          inquiries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', background: '#fff', borderRadius: 14, border: '1px solid #eae9e4', color: '#aaa', fontSize: 14 }}>
              No inquiries yet
            </div>
          ) : (
            inquiries.map(inq => (
              <div key={inq.id} style={{ background: '#fff', border: '1px solid #eae9e4', borderRadius: 12, padding: '16px', marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: '#111' }}>{inq.name}</div>
                    <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                      <a href={`mailto:${inq.email}`} style={{ color: '#16a34a', textDecoration: 'none' }}>{inq.email}</a>
                      {inq.phone && <span> · <a href={`tel:${inq.phone}`} style={{ color: '#16a34a', textDecoration: 'none' }}>{inq.phone}</a></span>}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, color: '#bbb' }}>{new Date(inq.created_at).toLocaleDateString()}</div>
                    {inq.project && <div style={{ fontSize: 11, color: '#16a34a', marginTop: 2 }}>{inq.project.name}</div>}
                  </div>
                </div>
                <div style={{ fontSize: 13, color: '#555', background: '#f9f9f7', padding: '10px 14px', borderRadius: 8, lineHeight: 1.7 }}>
                  {inq.message}
                </div>
                <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                  <a href={`mailto:${inq.email}`} style={{ fontSize: 12, padding: '6px 14px', borderRadius: 7, background: '#16a34a', color: '#fff', textDecoration: 'none', fontWeight: 600 }}>
                    Reply by email
                  </a>
                  {inq.phone && (
                    <a href={`tel:${inq.phone}`} style={{ fontSize: 12, padding: '6px 14px', borderRadius: 7, border: '1px solid #e0dfd9', color: '#555', textDecoration: 'none' }}>
                      Call
                    </a>
                  )}
                </div>
              </div>
            ))
          )
        )}

      </div>
    </div>
  )
}
