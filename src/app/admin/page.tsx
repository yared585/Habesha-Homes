'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { PhotoUpload } from '@/components/property/PhotoUpload'
import {
  CheckCircle, XCircle, Eye, Users, Home, TrendingUp, Shield,
  Clock, Search, Star, AlertTriangle, DollarSign, Activity,
  BarChart3, Building2, Globe, Trash2, RefreshCw, Download, Plus, Save
} from 'lucide-react'

type Tab = 'overview' | 'listings' | 'agents' | 'users' | 'reports' | 'inquiries' | 'developments'
type ListingFilter = 'all' | 'pending_review' | 'active' | 'rejected'

function StatCard({ icon, label, value, sub, color = '#16a34a' }: { icon: React.ReactNode; label: string; value: number | string; sub?: string; color?: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #eae9e4', borderRadius: 12, padding: '18px 20px' }}>
      <div style={{ width: 36, height: 36, borderRadius: 9, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: '#111', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: '#bbb', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; color: string }> = {
    active:         { bg: '#f0fdf4', color: '#16a34a' },
    pending_review: { bg: '#fef9ec', color: '#d97706' },
    rejected:       { bg: '#fef2f2', color: '#dc2626' },
    sold:           { bg: '#eff6ff', color: '#2563eb' },
    rented:         { bg: '#f5f3ff', color: '#7c3aed' },
  }
  const s = styles[status] || { bg: '#f9f9f7', color: '#888' }
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: s.bg, color: s.color, whiteSpace: 'nowrap' }}>
      {status.replace('_', ' ')}
    </span>
  )
}

const BLANK_PROJECT = {
  name: '', city: 'Addis Ababa', neighborhood: '', developer_id: '', developer_display_name: '',
  cover_image_url: '', images: [] as string[], video_url: '',
  total_units: '', available_units: '', min_price_etb: '', max_price_etb: '',
  construction_status: 'under_construction', completion_date: '',
  description: '', amenities: '', status: 'active',
}

export default function AdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('overview')
  const [listingFilter, setListingFilter] = useState<ListingFilter>('pending_review')
  const [search, setSearch] = useState('')
  const [properties, setProperties] = useState<any[]>([])
  const [agents, setAgents] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [inquiries, setInquiries] = useState<any[]>([])
  const [reports, setReports] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [developers, setDevelopers] = useState<any[]>([])
  const [showNewProject, setShowNewProject] = useState(false)
  const [newProject, setNewProject] = useState<any>({ ...BLANK_PROJECT })
  const [savingProject, setSavingProject] = useState(false)
  const [stats, setStats] = useState({
    totalListings: 0, activeListings: 0, pendingListings: 0, rejectedListings: 0,
    totalAgents: 0, verifiedAgents: 0,
    totalUsers: 0, buyerUsers: 0,
    totalInquiries: 0, totalReports: 0,
    totalRevenue: 0,
  })

  useEffect(() => { checkAdmin() }, [])

  async function checkAdmin() {
    const sb = createClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) { router.push('/auth/login'); return }
    const { data: profile } = await sb.from('profiles').select('role').eq('id', user.id).single()
    if (!profile || profile.role !== 'admin') { router.push('/'); return }
    await loadAll()
  }

  async function loadAll() {
    const sb = createClient()
    const [
      { data: props, count: totalProps },
      { count: activeCount },
      { count: pendingCount },
      { count: rejectedCount },
      { data: agentsData, count: agentCount },
      { count: verifiedCount },
      { data: usersData, count: userCount },
      { count: buyerCount },
      { data: inqData, count: inqCount },
      { data: repsData, count: repCount },
      { data: payments },
      { data: projectsData },
    ] = await Promise.all([
      sb.from('properties').select('*,agent:agents(agency_name,is_verified,profile:profiles(full_name,email))', { count: 'exact' }).order('created_at', { ascending: false }).limit(200),
      sb.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      sb.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'pending_review'),
      sb.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'rejected'),
      sb.from('agents').select('*,profile:profiles(full_name,email,avatar_url,phone,created_at)', { count: 'exact' }).order('created_at', { ascending: false }),
      sb.from('agents').select('*', { count: 'exact', head: true }).eq('is_verified', true),
      sb.from('profiles').select('*', { count: 'exact' }).order('created_at', { ascending: false }).limit(200),
      sb.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'buyer'),
      sb.from('inquiries').select('*,property:properties(title),agent:profiles!inquiries_agent_id_fkey(full_name,email)', { count: 'exact' }).order('created_at', { ascending: false }).limit(100),
      sb.from('ai_reports').select('*,user:profiles(full_name,email)', { count: 'exact' }).order('created_at', { ascending: false }).limit(100),
      sb.from('payments').select('amount_usd,status').eq('status', 'completed'),
      sb.from('projects').select('*,developer:profiles(full_name,email)').order('created_at', { ascending: false }),
    ])

    const revenue = (payments || []).reduce((sum: number, p: any) => sum + (p.amount_usd || 0), 0)
    const devUsers = (usersData || []).filter((u: any) => u.role === 'developer')

    setProperties(props || [])
    setAgents(agentsData || [])
    setUsers(usersData || [])
    setInquiries(inqData || [])
    setReports(repsData || [])
    setProjects(projectsData || [])
    setDevelopers(devUsers)
    setStats({
      totalListings: totalProps || 0,
      activeListings: activeCount || 0,
      pendingListings: pendingCount || 0,
      rejectedListings: rejectedCount || 0,
      totalAgents: agentCount || 0,
      verifiedAgents: verifiedCount || 0,
      totalUsers: userCount || 0,
      buyerUsers: buyerCount || 0,
      totalInquiries: inqCount || 0,
      totalReports: repCount || 0,
      totalRevenue: revenue,
    })
    setLoading(false)
  }

  async function updateListingStatus(id: string, status: string) {
    const { error } = await createClient().from('properties').update({ status, updated_at: new Date().toISOString() }).eq('id', id)
    if (error) { alert('Failed to update: ' + error.message); return }
    setProperties(p => p.map(x => x.id === id ? { ...x, status } : x))
    if (status === 'active') {
      const property = properties.find(p => p.id === id)
      const agentEmail = property?.agent?.profile?.email
      const agentName = property?.agent?.agency_name || property?.agent?.profile?.full_name
      if (agentEmail) {
        await fetch('/api/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'listing_approved', to: agentEmail, data: { agentName, propertyTitle: property?.title, propertyId: id } })
        }).catch(() => {})
      }
    }
    setStats(s => ({
      ...s,
      activeListings: status === 'active' ? s.activeListings + 1 : s.activeListings - (properties.find(p => p.id === id)?.status === 'active' ? 1 : 0),
      pendingListings: Math.max(0, s.pendingListings - (properties.find(p => p.id === id)?.status === 'pending_review' ? 1 : 0)),
    }))
  }

  async function deleteProperty(id: string) {
    if (!confirm('Delete this listing permanently? This cannot be undone.')) return
    const sb = createClient()
    await sb.from('ai_chat_sessions').delete().eq('property_id', id)
    await sb.from('saved_properties').delete().eq('property_id', id)
    await sb.from('inquiries').delete().eq('property_id', id)
    const { error } = await sb.from('properties').delete().eq('id', id)
    if (error) { alert('Failed to delete: ' + error.message); return }
    setProperties(p => p.filter(x => x.id !== id))
  }

  async function verifyAgent(id: string, verified: boolean) {
    await createClient().from('agents').update({ is_verified: verified }).eq('id', id)
    setAgents(a => a.map(x => x.id === id ? { ...x, is_verified: verified } : x))
    setStats(s => ({ ...s, verifiedAgents: verified ? s.verifiedAgents + 1 : s.verifiedAgents - 1 }))
  }

  async function changeUserRole(id: string, role: string) {
    const { error } = await createClient().from('profiles').update({ role: role as any }).eq('id', id)
    if (error) { console.error('Role change error:', error); alert('Failed to change role: ' + error.message); return }
    setUsers(u => u.map(x => x.id === id ? { ...x, role } : x))
  }

  async function featureProperty(id: string, featured: boolean) {
    const until = featured ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null
    const { error } = await createClient().from('properties').update({ is_featured: featured, featured_until: until }).eq('id', id)
    if (error) { alert('Failed to feature: ' + error.message); return }
    setProperties(p => p.map(x => x.id === id ? { ...x, is_featured: featured } : x))
  }

  async function createProject() {
    if (!newProject.name) { alert('Project name is required'); return }
    setSavingProject(true)
    const { data, error } = await createClient().from('projects').insert({
      name: newProject.name,
      city: newProject.city,
      neighborhood: newProject.neighborhood || null,
      developer_id: newProject.developer_id,
      developer_name: newProject.developer_display_name || null,
      cover_image_url: newProject.cover_image_url || null,
      images: newProject.images?.length ? newProject.images : [],
      video_url: newProject.video_url || null,
      total_units: newProject.total_units ? parseInt(newProject.total_units) : 0,
      available_units: newProject.available_units ? parseInt(newProject.available_units) : parseInt(newProject.total_units) || 0,
      min_price_etb: newProject.min_price_etb ? parseFloat(newProject.min_price_etb) : null,
      max_price_etb: newProject.max_price_etb ? parseFloat(newProject.max_price_etb) : null,
      construction_status: newProject.construction_status,
      completion_date: newProject.completion_date || null,
      description: newProject.description || null,
      amenities: newProject.amenities ? newProject.amenities.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
      status: newProject.status,
    }).select('*,developer:profiles(full_name,email)').single()
    if (error) { alert('Failed to create: ' + error.message); setSavingProject(false); return }
    setProjects(p => [data, ...p])
    setNewProject({ ...BLANK_PROJECT })
    setShowNewProject(false)
    setSavingProject(false)
    alert('✓ Project created! The developer can now see it in their dashboard.')
  }

  async function deleteProject(id: string) {
    if (!confirm('Delete this project? This cannot be undone.')) return
    await createClient().from('projects').delete().eq('id', id)
    setProjects(p => p.filter(x => x.id !== id))
  }

  const filteredProps = properties.filter(p => {
    const matchStatus = listingFilter === 'all' || p.status === listingFilter
    const matchSearch = !search || p.title?.toLowerCase().includes(search.toLowerCase()) || p.city?.toLowerCase().includes(search.toLowerCase()) || p.agent?.agency_name?.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const TABS: { id: Tab; label: string; count?: number }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'listings', label: 'Listings', count: stats.totalListings },
    { id: 'agents', label: 'Agents', count: stats.totalAgents },
    { id: 'users', label: 'Users', count: stats.totalUsers },
    { id: 'inquiries', label: 'Inquiries', count: stats.totalInquiries },
    { id: 'reports', label: 'AI Reports', count: stats.totalReports },
    { id: 'developments', label: 'Developments', count: projects.length },
  ]

  const inp = (key: string, label: string, placeholder = '', type = 'text') => (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 5 }}>{label}</label>
      <input type={type} placeholder={placeholder} value={newProject[key]}
        onChange={e => setNewProject((p: any) => ({ ...p, [key]: e.target.value }))}
        style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e0dfd9', borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: 'inherit' }}
        onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#16a34a'}
        onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#e0dfd9'}
      />
    </div>
  )

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#aaa', fontSize: 14 }}>
      Loading admin panel...
    </div>
  )

  return (
    <div style={{ background: '#f9f9f7', minHeight: '100vh', padding: '24px' }}>
      <div style={{ maxWidth: 1300, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <div style={{ display: 'flex', gap: 5, marginBottom: 8 }}>
              {['#078930','#FCDD09','#DA121A'].map(c => <div key={c} style={{ width: 22, height: 2.5, borderRadius: 2, background: c }}/>)}
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: '#111', margin: '0 0 2px', letterSpacing: '-.02em' }}>Admin Panel</h1>
            <p style={{ fontSize: 12, color: '#888', margin: 0 }}>Habesha Homes · Platform Management</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={loadAll} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', border: '1px solid #eae9e4', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontSize: 13, color: '#555', fontFamily: 'inherit' }}>
              <RefreshCw size={13}/> Refresh
            </button>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#0d2318', color: '#fff', borderRadius: 8, padding: '8px 16px', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
              <Globe size={13}/> View site
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 2, marginBottom: 24, borderBottom: '2px solid #eae9e4', overflowX: 'auto' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              background: 'none', border: 'none', padding: '10px 16px', cursor: 'pointer', fontSize: 13,
              fontWeight: tab === t.id ? 700 : 400, color: tab === t.id ? '#16a34a' : '#888',
              borderBottom: tab === t.id ? '2px solid #16a34a' : '2px solid transparent',
              marginBottom: -2, transition: 'all .15s', fontFamily: 'inherit', whiteSpace: 'nowrap',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              {t.label}
              {t.count !== undefined && (
                <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 10, background: tab === t.id ? '#16a34a' : '#e0dfd9', color: tab === t.id ? '#fff' : '#888' }}>
                  {t.count}
                </span>
              )}
              {t.id === 'listings' && stats.pendingListings > 0 && (
                <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 10, background: '#d97706', color: '#fff' }}>
                  {stats.pendingListings}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {tab === 'overview' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12, marginBottom: 24 }}>
              <StatCard icon={<Home size={16}/>} label="Total listings" value={stats.totalListings} sub={`${stats.activeListings} active`} color="#16a34a"/>
              <StatCard icon={<Clock size={16}/>} label="Pending review" value={stats.pendingListings} sub="Needs approval" color="#d97706"/>
              <StatCard icon={<Building2 size={16}/>} label="Total agents" value={stats.totalAgents} sub={`${stats.verifiedAgents} verified`} color="#2563eb"/>
              <StatCard icon={<Users size={16}/>} label="Total users" value={stats.totalUsers} sub={`${stats.buyerUsers} buyers`} color="#7c3aed"/>
              <StatCard icon={<Activity size={16}/>} label="Inquiries" value={stats.totalInquiries} color="#d97706"/>
              <StatCard icon={<DollarSign size={16}/>} label="Revenue" value={`$${stats.totalRevenue.toFixed(0)}`} sub="AI reports sold" color="#16a34a"/>
            </div>

            {stats.pendingListings > 0 && (
              <div style={{ background: '#fff', border: '1px solid #fde68a', borderRadius: 14, padding: 20, marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <AlertTriangle size={16} color="#d97706"/>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#d97706' }}>{stats.pendingListings} listing{stats.pendingListings > 1 ? 's' : ''} waiting for approval</span>
                  <button onClick={() => setTab('listings')} style={{ marginLeft: 'auto', fontSize: 12, color: '#16a34a', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}>Review all →</button>
                </div>
                {properties.filter(p => p.status === 'pending_review').slice(0, 3).map(p => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderTop: '1px solid #f5f5f2' }}>
                    <div style={{ width: 48, height: 38, borderRadius: 7, background: '#f0f0ec', overflow: 'hidden', flexShrink: 0 }}>
                      {p.cover_image_url && <img src={p.cover_image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</div>
                      <div style={{ fontSize: 11, color: '#888' }}>{p.agent?.agency_name} · {p.city} · ETB {((p.price_etb || p.rent_per_month_etb) || 0).toLocaleString()}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => updateListingStatus(p.id, 'active')} style={{ fontSize: 12, padding: '5px 12px', borderRadius: 7, border: 'none', background: '#f0fdf4', color: '#16a34a', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}>✓ Approve</button>
                      <button onClick={() => updateListingStatus(p.id, 'rejected')} style={{ fontSize: 12, padding: '5px 12px', borderRadius: 7, border: 'none', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}>✗ Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="admin-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ background: '#fff', border: '1px solid #eae9e4', borderRadius: 14, padding: 18 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 14 }}>Recent listings</div>
                {properties.slice(0, 5).map(p => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #f5f5f2' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</div>
                      <div style={{ fontSize: 11, color: '#aaa' }}>{new Date(p.created_at).toLocaleDateString()}</div>
                    </div>
                    <StatusBadge status={p.status}/>
                  </div>
                ))}
              </div>
              <div style={{ background: '#fff', border: '1px solid #eae9e4', borderRadius: 14, padding: 18 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 14 }}>Recent signups</div>
                {users.slice(0, 5).map(u => (
                  <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #f5f5f2' }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#fff', fontWeight: 700, flexShrink: 0 }}>
                      {u.full_name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.full_name || u.email}</div>
                      <div style={{ fontSize: 11, color: '#aaa' }}>{u.role} · {new Date(u.created_at || Date.now()).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── LISTINGS ── */}
        {tab === 'listings' && (
          <>
            <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <Search size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#aaa' }}/>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search listings..."
                  style={{ padding: '9px 14px 9px 32px', border: '1.5px solid #e0dfd9', borderRadius: 9, fontSize: 13, outline: 'none', fontFamily: 'inherit', background: '#fff', width: 240 }}
                />
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {(['all', 'pending_review', 'active', 'rejected'] as const).map(f => (
                  <button key={f} onClick={() => setListingFilter(f)}
                    style={{ padding: '7px 13px', borderRadius: 8, border: `1.5px solid ${listingFilter === f ? '#16a34a' : '#e0dfd9'}`, background: listingFilter === f ? '#f0fdf4' : '#fff', fontSize: 12, color: listingFilter === f ? '#16a34a' : '#666', cursor: 'pointer', fontWeight: listingFilter === f ? 600 : 400, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5 }}
                  >
                    {f === 'pending_review' ? 'Pending' : f.charAt(0).toUpperCase() + f.slice(1)}
                    {f === 'pending_review' && stats.pendingListings > 0 && <span style={{ background: '#d97706', color: '#fff', fontSize: 10, fontWeight: 700, padding: '1px 5px', borderRadius: 8 }}>{stats.pendingListings}</span>}
                  </button>
                ))}
              </div>
              <span style={{ fontSize: 12, color: '#aaa', marginLeft: 'auto' }}>{filteredProps.length} listings</span>
            </div>
            {filteredProps.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0', background: '#fff', borderRadius: 14, border: '1px solid #eae9e4', color: '#aaa', fontSize: 14 }}>No listings found</div>
            ) : (
              filteredProps.map(p => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: '#fff', border: '1px solid #eae9e4', borderRadius: 12, marginBottom: 8 }}>
                  <div style={{ width: 64, height: 50, borderRadius: 8, background: '#f0f0ec', overflow: 'hidden', flexShrink: 0 }}>
                    {p.cover_image_url && <img src={p.cover_image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</div>
                    <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                      {p.agent?.agency_name || p.agent?.profile?.full_name || 'Unknown'} · {p.city} · ETB {((p.price_etb || p.rent_per_month_etb) || 0).toLocaleString()}
                      {p.bedrooms ? ` · ${p.bedrooms}bed` : ''}{p.size_sqm ? ` · ${p.size_sqm}m²` : ''}
                    </div>
                    <div style={{ fontSize: 11, color: '#bbb', marginTop: 2 }}>{new Date(p.created_at).toLocaleDateString()} · {p.views || 0} views · {p.is_featured ? '⭐ Featured' : ''}</div>
                  </div>
                  <StatusBadge status={p.status}/>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <Link href={`/property/${p.id}`} target="_blank" style={{ fontSize: 11, padding: '5px 10px', borderRadius: 7, border: '1px solid #e0dfd9', color: '#555', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}><Eye size={11}/> View</Link>
                    {p.status !== 'active' && <button onClick={() => updateListingStatus(p.id, 'active')} style={{ fontSize: 11, padding: '5px 10px', borderRadius: 7, border: 'none', background: '#f0fdf4', color: '#16a34a', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle size={11}/> Approve</button>}
                    {p.status === 'active' && <button onClick={() => updateListingStatus(p.id, 'pending_review')} style={{ fontSize: 11, padding: '5px 10px', borderRadius: 7, border: 'none', background: '#fef9ec', color: '#d97706', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}>Suspend</button>}
                    {p.status !== 'rejected' && <button onClick={() => updateListingStatus(p.id, 'rejected')} style={{ fontSize: 11, padding: '5px 10px', borderRadius: 7, border: 'none', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4 }}><XCircle size={11}/> Reject</button>}
                    <button onClick={() => featureProperty(p.id, !p.is_featured)} style={{ fontSize: 11, padding: '5px 10px', borderRadius: 7, border: 'none', background: p.is_featured ? '#fef9ec' : '#fffbeb', color: '#d97706', cursor: 'pointer', fontFamily: 'inherit' }}>{p.is_featured ? '★ Unfeature' : '☆ Feature'}</button>
                    <button onClick={() => deleteProperty(p.id)} style={{ fontSize: 11, padding: '5px 10px', borderRadius: 7, border: 'none', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4 }}><Trash2 size={11}/></button>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {/* ── AGENTS ── */}
        {tab === 'agents' && (
          <>
            <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <Search size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#aaa' }}/>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search agents..."
                  style={{ padding: '9px 14px 9px 32px', border: '1.5px solid #e0dfd9', borderRadius: 9, fontSize: 13, outline: 'none', fontFamily: 'inherit', background: '#fff', width: 240 }}
                />
              </div>
              <span style={{ fontSize: 12, color: '#aaa', marginLeft: 'auto' }}>{stats.verifiedAgents} verified of {stats.totalAgents}</span>
            </div>
            {agents.filter(a => !search || a.agency_name?.toLowerCase().includes(search.toLowerCase()) || a.profile?.email?.toLowerCase().includes(search.toLowerCase())).map(a => (
              <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: '#fff', border: '1px solid #eae9e4', borderRadius: 12, marginBottom: 8 }}>
                <div style={{ width: 46, height: 46, borderRadius: '50%', background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#fff', fontWeight: 700, flexShrink: 0, overflow: 'hidden' }}>
                  {a.profile?.avatar_url ? <img src={a.profile.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/> : (a.agency_name?.[0] || 'A')}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#111' }}>{a.agency_name}</div>
                  <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{a.profile?.email} · {a.profile?.phone || 'No phone'}</div>
                  <div style={{ fontSize: 11, color: '#bbb', marginTop: 2 }}>Plan: {a.subscription_plan} · Sales: {a.total_sales || 0} · Rating: {a.rating ? `${a.rating}/5` : 'None'}</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: a.is_verified ? '#f0fdf4' : '#f9f9f7', color: a.is_verified ? '#16a34a' : '#888', flexShrink: 0 }}>
                  {a.is_verified ? '✓ Verified' : 'Unverified'}
                </span>
                <div style={{ display: 'flex', gap: 7, flexShrink: 0 }}>
                  <Link href={`/agent/${a.id}`} target="_blank" style={{ fontSize: 12, padding: '6px 11px', borderRadius: 7, border: '1px solid #e0dfd9', color: '#555', textDecoration: 'none' }}>Profile</Link>
                  <button onClick={() => verifyAgent(a.id, !a.is_verified)} style={{ fontSize: 12, padding: '6px 11px', borderRadius: 7, border: 'none', background: a.is_verified ? '#fef2f2' : '#f0fdf4', color: a.is_verified ? '#dc2626' : '#16a34a', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}>
                    {a.is_verified ? 'Unverify' : '✓ Verify'}
                  </button>
                </div>
              </div>
            ))}
          </>
        )}

        {/* ── USERS ── */}
        {tab === 'users' && (
          <>
            <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <Search size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#aaa' }}/>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..."
                  style={{ padding: '9px 14px 9px 32px', border: '1.5px solid #e0dfd9', borderRadius: 9, fontSize: 13, outline: 'none', fontFamily: 'inherit', background: '#fff', width: 240 }}
                />
              </div>
              <span style={{ fontSize: 12, color: '#aaa', marginLeft: 'auto' }}>{stats.totalUsers} total users</span>
            </div>
            {users.filter(u => !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())).map(u => (
              <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 16px', background: '#fff', border: '1px solid #eae9e4', borderRadius: 12, marginBottom: 8 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, color: '#fff', fontWeight: 700, flexShrink: 0, overflow: 'hidden' }}>
                  {u.avatar_url ? <img src={u.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/> : (u.full_name?.[0]?.toUpperCase() || 'U')}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#111' }}>{u.full_name || 'No name'}</div>
                  <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{u.email} {u.phone ? `· ${u.phone}` : ''}</div>
                  <div style={{ fontSize: 11, color: '#bbb', marginTop: 2 }}>Joined {new Date(u.created_at || Date.now()).toLocaleDateString()} {u.is_diaspora ? '· 🌍 Diaspora' : ''}</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, flexShrink: 0,
                  background: u.role === 'admin' ? '#fef2f2' : u.role === 'agent' ? '#f0fdf4' : '#eff6ff',
                  color: u.role === 'admin' ? '#dc2626' : u.role === 'agent' ? '#16a34a' : '#2563eb'
                }}>{u.role}</span>
                <select value={u.role} onChange={e => changeUserRole(u.id, e.target.value)}
                  style={{ fontSize: 12, padding: '7px 10px', borderRadius: 7, border: '1px solid #e0dfd9', background: '#fff', cursor: 'pointer', fontFamily: 'inherit', outline: 'none' }}
                >
                  <option value="buyer">Buyer</option>
                  <option value="agent">Agent</option>
                  <option value="developer">Developer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            ))}
          </>
        )}

        {/* ── INQUIRIES ── */}
        {tab === 'inquiries' && (
          <>
            <div style={{ marginBottom: 16, fontSize: 13, color: '#888' }}>{stats.totalInquiries} total inquiries from buyers</div>
            {inquiries.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0', background: '#fff', borderRadius: 14, border: '1px solid #eae9e4', color: '#aaa', fontSize: 14 }}>No inquiries yet</div>
            ) : (
              inquiries.map(i => (
                <div key={i.id} style={{ padding: '14px 16px', background: '#fff', border: '1px solid #eae9e4', borderRadius: 12, marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: '#111' }}>{i.name || 'Anonymous'}</div>
                      <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{i.email} {i.phone ? `· ${i.phone}` : ''}</div>
                    </div>
                    <div style={{ fontSize: 11, color: '#bbb' }}>{new Date(i.created_at).toLocaleDateString()}</div>
                  </div>
                  {i.property && (
                    <div style={{ fontSize: 12, color: '#2563eb', marginBottom: 6 }}>
                      Re: <Link href={`/property/${i.property_id}`} target="_blank" style={{ color: '#2563eb' }}>{i.property.title}</Link>
                    </div>
                  )}
                  <div style={{ fontSize: 13, color: '#555', background: '#f9f9f7', padding: '10px 14px', borderRadius: 8, lineHeight: 1.6 }}>{i.message}</div>
                </div>
              ))
            )}
          </>
        )}

        {/* ── AI REPORTS ── */}
        {tab === 'reports' && (
          <>
            <div style={{ marginBottom: 16, fontSize: 13, color: '#888' }}>{stats.totalReports} AI reports generated · ${stats.totalRevenue.toFixed(2)} revenue</div>
            {reports.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0', background: '#fff', borderRadius: 14, border: '1px solid #eae9e4', color: '#aaa', fontSize: 14 }}>No AI reports yet</div>
            ) : (
              reports.map(r => (
                <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 16px', background: '#fff', border: '1px solid #eae9e4', borderRadius: 12, marginBottom: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#111' }}>{r.report_type?.replace('_', ' ')}</div>
                    <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{r.user?.email || 'Unknown user'}</div>
                    <div style={{ fontSize: 11, color: '#bbb', marginTop: 2 }}>{new Date(r.created_at).toLocaleDateString()}</div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: r.is_paid ? '#f0fdf4' : '#fef9ec', color: r.is_paid ? '#16a34a' : '#d97706' }}>{r.is_paid ? 'Paid' : 'Free'}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: r.status === 'completed' ? '#f0fdf4' : '#fef9ec', color: r.status === 'completed' ? '#16a34a' : '#d97706' }}>{r.status}</span>
                </div>
              ))
            )}
          </>
        )}

        {/* ── DEVELOPMENTS ── */}
        {tab === 'developments' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: '#888' }}>{projects.length} projects · {developers.length} developer accounts</div>
              <button onClick={() => setShowNewProject(!showNewProject)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#16a34a', color: '#fff', border: 'none', padding: '9px 16px', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
              ><Plus size={14}/> Create project</button>
            </div>

            {showNewProject && (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 14, padding: 22, marginBottom: 20 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#15803d', marginBottom: 16 }}>New development project</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12, marginBottom: 14 }}>
                  {inp('name', 'Project name', 'e.g. Bole Heights Residences')}
                  {inp('city', 'City', 'Addis Ababa')}
                  {inp('neighborhood', 'Neighborhood', 'e.g. Bole')}
                  {inp('total_units', 'Total units', '24', 'number')}
                  {inp('available_units', 'Available units', '20', 'number')}
                  {inp('min_price_etb', 'Min price (ETB)', '3000000', 'number')}
                  {inp('max_price_etb', 'Max price (ETB)', '8000000', 'number')}
                  {inp('completion_date', 'Completion date', 'Q4 2026')}
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 5 }}>Developer account</label>
                    <select value={newProject.developer_id} onChange={e => setNewProject((p: any) => ({ ...p, developer_id: e.target.value }))}
                      style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e0dfd9', borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: 'inherit', background: '#fff' }}
                    >
                      <option value="">— Select developer account —</option>
                      {developers.map(d => <option key={d.id} value={d.id}>{d.full_name} ({d.email})</option>)}
                    </select>
                    {developers.length === 0 && <div style={{ fontSize: 11, color: '#d97706', marginTop: 4 }}>⚠ No developer accounts yet. Go to Users tab → change a user role to Developer first.</div>}
                  </div>
                  {inp('developer_display_name', 'Developer / company name (shown publicly)', 'e.g. Sunshine Real Estate')}
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 5 }}>Construction status</label>
                    <select value={newProject.construction_status} onChange={e => setNewProject((p: any) => ({ ...p, construction_status: e.target.value }))}
                      style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e0dfd9', borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: 'inherit', background: '#fff' }}
                    >
                      {['planned', 'under_construction', 'completed'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 5 }}>Visibility</label>
                    <select value={newProject.status} onChange={e => setNewProject((p: any) => ({ ...p, status: e.target.value }))}
                      style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e0dfd9', borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: 'inherit', background: '#fff' }}
                    >
                      <option value="active">Active — visible to buyers</option>
                      <option value="pending_review">Draft — hidden from buyers</option>
                    </select>
                  </div>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 5 }}>Description</label>
                  <textarea value={newProject.description} onChange={e => setNewProject((p: any) => ({ ...p, description: e.target.value }))} rows={2} placeholder="Brief description of the project..."
                    style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e0dfd9', borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: 'inherit', resize: 'vertical' }}
                    onFocus={e => (e.target as HTMLTextAreaElement).style.borderColor = '#16a34a'}
                    onBlur={e => (e.target as HTMLTextAreaElement).style.borderColor = '#e0dfd9'}
                  />
                </div>
                <div style={{ marginBottom: 16 }}>
                  {inp('amenities', 'Amenities (comma separated)', 'Generator, Parking, Swimming pool, Gym')}
                </div>

                {/* Photos */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 8 }}>
                    Project photos
                  </label>
                  <PhotoUpload
                    onUpload={(urls) => setNewProject((p: any) => ({ ...p, cover_image_url: urls[0] || '', images: urls }))}
                    existingPhotos={newProject.images || (newProject.cover_image_url ? [newProject.cover_image_url] : [])}
                  />
                </div>

                {/* Video URL */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 5 }}>
                    Video URL (YouTube or Vimeo link)
                  </label>
                  <input type="url" placeholder="https://youtube.com/watch?v=..." value={newProject.video_url}
                    onChange={e => setNewProject((p: any) => ({ ...p, video_url: e.target.value }))}
                    style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e0dfd9', borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: 'inherit' }}
                    onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#16a34a'}
                    onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#e0dfd9'}
                  />
                  <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>Upload your video to YouTube first, then paste the link here</div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={createProject} disabled={savingProject}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, background: savingProject ? '#9ca3af' : '#16a34a', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: savingProject ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
                  ><Save size={14}/> {savingProject ? 'Creating...' : 'Create project'}</button>
                  <button onClick={() => { setShowNewProject(false); setNewProject({ ...BLANK_PROJECT }) }}
                    style={{ background: '#fff', border: '1px solid #e0dfd9', padding: '10px 16px', borderRadius: 9, fontSize: 13, color: '#555', cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                </div>
              </div>
            )}

            {projects.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px', background: '#fff', borderRadius: 14, border: '1px solid #eae9e4', color: '#aaa', fontSize: 14 }}>
                No projects yet. Click "Create project" to add one.
              </div>
            ) : (
              projects.map(p => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: '#fff', border: '1px solid #eae9e4', borderRadius: 12, marginBottom: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: '#111', marginBottom: 4 }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: '#888' }}>{p.developer_name || p.developer?.full_name || 'No developer'} · {p.city}{p.neighborhood ? ` · ${p.neighborhood}` : ''}</div>
                    <div style={{ fontSize: 11, color: '#bbb', marginTop: 2 }}>{p.total_units || 0} units · {p.available_units || 0} available · {p.construction_status}</div>
                  </div>
                  <StatusBadge status={p.status}/>
                  <div style={{ display: 'flex', gap: 7, flexShrink: 0 }}>
                    <Link href={`/project/${p.id}`} target="_blank" style={{ fontSize: 12, padding: '6px 11px', borderRadius: 7, border: '1px solid #e0dfd9', color: '#555', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}><Eye size={12}/> View</Link>
                    <Link href={`/dashboard/developer/project/${p.id}`} target="_blank" style={{ fontSize: 12, padding: '6px 11px', borderRadius: 7, border: 'none', background: '#f0fdf4', color: '#16a34a', textDecoration: 'none', fontWeight: 600 }}>Manage units</Link>
                    <button onClick={() => deleteProject(p.id)} style={{ fontSize: 12, padding: '6px 10px', borderRadius: 7, border: 'none', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center' }}><Trash2 size={12}/></button>
                  </div>
                </div>
              ))
            )}
          </>
        )}

      </div>
    </div>
  )
}
