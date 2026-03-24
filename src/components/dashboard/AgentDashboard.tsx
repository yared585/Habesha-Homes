'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Home, Eye, MessageSquare, TrendingUp, Plus, Building2, Star, Phone, Mail, Edit, BarChart3, Clock, CheckCircle, XCircle, AlertCircle, ArrowUp, ArrowDown } from 'lucide-react'
import { Card, StatCard, EmptyState } from '@/components/ui'
import { formatETB } from '@/lib/utils'
import type { Property, Profile } from '@/types'

interface Props {
  profile: Profile
  properties: Property[]
  stats: { listings: number; views: number; inquiries: number }
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; icon: React.ReactNode; label: string }> = {
    active:         { bg: '#f0fdf4', color: '#16a34a', icon: <CheckCircle size={11}/>, label: 'Active' },
    pending_review: { bg: '#fef9ec', color: '#d97706', icon: <Clock size={11}/>, label: 'Pending' },
    rejected:       { bg: '#fef2f2', color: '#dc2626', icon: <XCircle size={11}/>, label: 'Rejected' },
    sold:           { bg: '#eff6ff', color: '#2563eb', icon: <CheckCircle size={11}/>, label: 'Sold' },
  }
  const s = map[status] || { bg: '#f9f9f7', color: '#888', icon: <AlertCircle size={11}/>, label: status }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20, background: s.bg, color: s.color, whiteSpace: 'nowrap' }}>
      {s.icon}{s.label}
    </span>
  )
}

function ListingCard({ p, inquiryCount }: { p: any; inquiryCount: number }) {
  const price = p.listing_intent === 'rent' ? p.rent_per_month_etb : p.price_etb
  const viewsPerDay = p.views > 0 ? (p.views / Math.max(1, Math.ceil((Date.now() - new Date(p.listed_at || p.created_at).getTime()) / 86400000))).toFixed(1) : '0'
  const convRate = p.views > 0 ? ((inquiryCount / p.views) * 100).toFixed(1) : '0'

  return (
    <div style={{ background: '#fff', border: '1px solid #eae9e4', borderRadius: 14, overflow: 'hidden', marginBottom: 12 }}>
      <div style={{ display: 'flex', gap: 0 }}>
        {/* Photo */}
        <div style={{ width: 120, flexShrink: 0, background: '#f0f0ec', position: 'relative' }}>
          {p.cover_image_url
            ? <img src={p.cover_image_url} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', minHeight: 100 }}/>
            : <div style={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Building2 size={28} color="#d0d0cc"/></div>
          }
          {p.is_featured && (
            <div style={{ position: 'absolute', top: 6, left: 6, background: '#f59e0b', color: '#fff', fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 10 }}>⭐ Featured</div>
          )}
        </div>

        {/* Main info */}
        <div style={{ flex: 1, padding: '14px 16px', minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{p.title}</div>
            <StatusBadge status={p.status}/>
          </div>
          <div style={{ fontSize: 13, color: '#888', marginBottom: 10 }}>
            {p.city} {p.neighborhood?.name ? `· ${p.neighborhood.name}` : ''} · {p.property_type}
            {p.bedrooms ? ` · ${p.bedrooms} bed` : ''}{p.size_sqm ? ` · ${p.size_sqm}m²` : ''}
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#16a34a', marginBottom: 12 }}>
            {formatETB(price)}{p.listing_intent === 'rent' && <span style={{ fontSize: 12, fontWeight: 400, color: '#aaa' }}>/mo</span>}
          </div>

          {/* Performance stats */}
          <div style={{ display: 'flex', gap: 20, padding: '10px 14px', background: '#f9f9f7', borderRadius: 10, marginBottom: 12, flexWrap: 'wrap' }}>
            {[
              { icon: <Eye size={13}/>, label: 'Views', value: p.views || 0, sub: `${viewsPerDay}/day`, color: '#2563eb' },
              { icon: <MessageSquare size={13}/>, label: 'Inquiries', value: inquiryCount, sub: `${convRate}% rate`, color: '#d97706' },
              { icon: <BarChart3 size={13}/>, label: 'Saves', value: p.saves || 0, sub: 'bookmarks', color: '#7c3aed' },
            ].map(({ icon, label, value, sub, color }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ color, display: 'flex' }}>{icon}</div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#111', lineHeight: 1 }}>{value}</div>
                  <div style={{ fontSize: 10, color: '#aaa' }}>{label} · {sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            <Link href={`/property/${p.id}`} target="_blank"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, padding: '6px 12px', borderRadius: 7, border: '1px solid #e0dfd9', color: '#555', textDecoration: 'none' }}
            ><Eye size={12}/> View listing</Link>
            <Link href={`/dashboard/listings/${p.id}/edit`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, padding: '6px 12px', borderRadius: 7, border: 'none', background: '#f0fdf4', color: '#16a34a', textDecoration: 'none', fontWeight: 600 }}
            ><Edit size={12}/> Edit</Link>
            {p.status === 'pending_review' && (
              <span style={{ fontSize: 12, padding: '6px 12px', borderRadius: 7, background: '#fef9ec', color: '#d97706', fontWeight: 600 }}>
                ⏳ Under review
              </span>
            )}
            {p.status === 'rejected' && (
              <span style={{ fontSize: 12, padding: '6px 12px', borderRadius: 7, background: '#fef2f2', color: '#dc2626', fontWeight: 600 }}>
                ✗ Rejected — edit and resubmit
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const AI_TOOLS = [
  { emoji: '✍️', title: 'AI listing writer', desc: 'Claude writes your listing in Amharic and English.', href: '/dashboard/listings/new', btn: 'Create listing', color: '#16a34a' },
  { emoji: '🔍', title: 'Fraud check', desc: 'Run a title fraud check for your buyer clients.', href: '/ai-reports', btn: 'Run check', color: '#dc2626' },
  { emoji: '📊', title: 'Property valuation', desc: 'Get instant AI valuation to price listings correctly.', href: '/ai-reports', btn: 'Get valuation', color: '#2563eb' },
  { emoji: '📄', title: 'Contract analyzer', desc: 'Highlight dangerous clauses in any contract.', href: '/ai-reports', btn: 'Analyze', color: '#d97706' },
]

export function AgentDashboard({ profile, properties, stats }: Props) {
  const [tab, setTab] = useState<'listings' | 'inquiries' | 'ai' | 'settings'>('listings')
  const [inquiries, setInquiries] = useState<any[]>([])
  const [inquiryCounts, setInquiryCounts] = useState<Record<string, number>>({})
  const [loadingInquiries, setLoadingInquiries] = useState(false)
  const [agentData, setAgentData] = useState<any>(null)

  useEffect(() => {
    loadExtra()
  }, [])

  async function loadExtra() {
    const sb = createClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) return

    // Load inquiries
    setLoadingInquiries(true)
    const { data: inqs } = await sb
      .from('inquiries')
      .select('*,property:properties(title,cover_image_url)')
      .eq('agent_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    setInquiries(inqs || [])

    // Count per property
    const counts: Record<string, number> = {}
    ;(inqs || []).forEach((i: any) => {
      counts[i.property_id] = (counts[i.property_id] || 0) + 1
    })
    setInquiryCounts(counts)
    setLoadingInquiries(false)

    // Load agent data
    const { data: agent } = await sb.from('agents').select('*').eq('id', user.id).single()
    setAgentData(agent)
  }

  // Stats derived from real data
  const totalViews = properties.reduce((sum, p) => sum + (p.views || 0), 0)
  const totalSaves = properties.reduce((sum, p) => sum + ((p as any).saves || 0), 0)
  const activeCount = properties.filter(p => p.status === 'active').length
  const pendingCount = properties.filter(p => p.status === 'pending_review').length
  const totalInquiries = inquiries.length
  const convRate = totalViews > 0 ? ((totalInquiries / totalViews) * 100).toFixed(1) : '0'

  // Top performing listing
  const topListing = [...properties].sort((a, b) => (b.views || 0) - (a.views || 0))[0]

  return (
    <>
      {/* Welcome bar */}
      <div style={{ background: '#0d2318', borderRadius: 14, padding: '18px 22px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 2 }}>
            Welcome back, {profile.full_name?.split(' ')[0] || 'Agent'} 👋
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>
            {agentData?.agency_name} · {agentData?.is_verified ? '✓ Verified agent' : 'Unverified — contact admin to verify'}
          </div>
        </div>
        <Link href="/dashboard/listings/new"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#16a34a', color: '#fff', padding: '11px 20px', borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}
        >
          <Plus size={15}/> Add listing
        </Link>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12, marginBottom: 24 }}>
        <StatCard icon={<Home size={17}/>} label="Active listings" value={activeCount} color="#16a34a"/>
        <StatCard icon={<Eye size={17}/>} label="Total views" value={totalViews} color="#2563eb"/>
        <StatCard icon={<MessageSquare size={17}/>} label="Inquiries" value={totalInquiries} color="#d97706"/>
        <StatCard icon={<BarChart3 size={17}/>} label="Saves" value={totalSaves} color="#7c3aed"/>
        <StatCard icon={<TrendingUp size={17}/>} label="Conv. rate" value={`${convRate}%`} color="#16a34a"/>
        {pendingCount > 0 && <StatCard icon={<Clock size={17}/>} label="Pending review" value={pendingCount} color="#d97706"/>}
      </div>

      {/* Top performer */}
      {topListing && topListing.views > 0 && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
          <Star size={16} color="#16a34a" fill="#16a34a"/>
          <div style={{ fontSize: 13, color: '#15803d' }}>
            <strong>Top performer:</strong> "{topListing.title}" — {topListing.views} views
          </div>
          <Link href={`/property/${topListing.id}`} target="_blank" style={{ marginLeft: 'auto', fontSize: 12, color: '#16a34a', textDecoration: 'none', fontWeight: 600 }}>View →</Link>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 20, borderBottom: '2px solid #eae9e4', overflowX: 'auto' }}>
        {[
          { id: 'listings', label: `Listings (${properties.length})` },
          { id: 'inquiries', label: `Inquiries${totalInquiries > 0 ? ` (${totalInquiries})` : ''}` },
          { id: 'ai', label: '🤖 AI Tools' },
          { id: 'settings', label: 'Settings' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)} style={{
            background: 'none', border: 'none', padding: '10px 16px', cursor: 'pointer', fontSize: 13,
            fontWeight: tab === t.id ? 700 : 400,
            color: tab === t.id ? '#16a34a' : '#888',
            borderBottom: tab === t.id ? '2px solid #16a34a' : '2px solid transparent',
            marginBottom: -2, transition: 'all .15s', fontFamily: 'inherit', whiteSpace: 'nowrap',
          }}>{t.label}</button>
        ))}
      </div>

      {/* LISTINGS TAB */}
      {tab === 'listings' && (
        properties.length === 0
          ? <EmptyState icon={<Building2 size={48}/>} title="No listings yet" description="Add your first property to start getting inquiries"
              action={<Link href="/dashboard/listings/new" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#16a34a', color: '#fff', padding: '11px 22px', borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}><Plus size={15}/> Add first listing</Link>}
            />
          : <div>{properties.map(p => <ListingCard key={p.id} p={p} inquiryCount={inquiryCounts[p.id] || 0}/>)}</div>
      )}

      {/* INQUIRIES TAB */}
      {tab === 'inquiries' && (
        <div>
          {loadingInquiries ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#aaa', fontSize: 14 }}>Loading inquiries...</div>
          ) : inquiries.length === 0 ? (
            <EmptyState icon={<MessageSquare size={48}/>} title="No inquiries yet" description="When buyers contact you about your listings, they'll appear here"/>
          ) : (
            inquiries.map(inq => (
              <div key={inq.id} style={{ background: '#fff', border: '1px solid #eae9e4', borderRadius: 12, padding: '16px', marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: '#111' }}>{inq.name || 'Anonymous'}</div>
                    <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                      {inq.email && <a href={`mailto:${inq.email}`} style={{ color: '#16a34a', textDecoration: 'none' }}>{inq.email}</a>}
                      {inq.phone && <span> · <a href={`tel:${inq.phone}`} style={{ color: '#16a34a', textDecoration: 'none' }}>{inq.phone}</a></span>}
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: '#bbb' }}>{new Date(inq.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                </div>
                {inq.property && (
                  <div style={{ fontSize: 12, color: '#2563eb', marginBottom: 8 }}>
                    Re: <Link href={`/property/${inq.property_id}`} style={{ color: '#2563eb' }}>{inq.property.title}</Link>
                  </div>
                )}
                <div style={{ fontSize: 13, color: '#555', background: '#f9f9f7', padding: '10px 14px', borderRadius: 8, lineHeight: 1.7, marginBottom: 10 }}>
                  {inq.message}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {inq.email && (
                    <a href={`mailto:${inq.email}?subject=Re: ${inq.property?.title || 'Your inquiry'}`}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, padding: '7px 14px', borderRadius: 7, background: '#16a34a', color: '#fff', textDecoration: 'none', fontWeight: 600 }}
                    ><Mail size={12}/> Reply by email</a>
                  )}
                  {inq.phone && (
                    <a href={`tel:${inq.phone}`}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, padding: '7px 14px', borderRadius: 7, border: '1px solid #e0dfd9', color: '#555', textDecoration: 'none' }}
                    ><Phone size={12}/> Call</a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* AI TOOLS TAB */}
      {tab === 'ai' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 14 }}>
          {AI_TOOLS.map(({ emoji, title, desc, href, btn, color }) => (
            <Card key={title} hover>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{emoji}</div>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#111', marginBottom: 6 }}>{title}</div>
              <div style={{ fontSize: 13, color: '#666', lineHeight: 1.6, marginBottom: 14 }}>{desc}</div>
              <Link href={href} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: color, color: '#fff', padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>{btn}</Link>
            </Card>
          ))}
        </div>
      )}

      {/* SETTINGS TAB */}
      {tab === 'settings' && (
        <div style={{ display: 'grid', gap: 16 }}>
          <Card>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#111', marginBottom: 20 }}>Agent profile</h3>
            <div style={{ display: 'grid', gap: 12 }}>
              {[
                { label: 'Full name', value: profile.full_name },
                { label: 'Email', value: profile.email },
                { label: 'Phone', value: profile.phone },
                { label: 'Agency', value: agentData?.agency_name },
                { label: 'Plan', value: agentData?.subscription_plan || 'Free' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 14, color: '#111', background: '#f9f9f7', padding: '10px 14px', borderRadius: 8, border: '1px solid #eae9e4' }}>{value || '—'}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <Link href="/profile" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#16a34a', color: '#fff', padding: '10px 18px', borderRadius: 9, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                <Edit size={13}/> Edit profile
              </Link>
              <Link href={`/agent/${profile.id}`} target="_blank" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff', border: '1px solid #eae9e4', color: '#555', padding: '10px 18px', borderRadius: 9, fontSize: 13, textDecoration: 'none' }}>
                View public profile →
              </Link>
            </div>
          </Card>
          <div style={{ background: agentData?.is_verified ? '#f0fdf4' : '#fef9ec', border: `1px solid ${agentData?.is_verified ? '#bbf7d0' : '#fde68a'}`, borderRadius: 12, padding: '14px 18px' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: agentData?.is_verified ? '#15803d' : '#d97706', marginBottom: 4 }}>
              {agentData?.is_verified ? '✓ Verified agent' : '⚠ Not yet verified'}
            </div>
            <div style={{ fontSize: 13, color: '#888' }}>
              {agentData?.is_verified ? 'Your profile shows a verified badge to buyers.' : 'Contact the admin to get your account verified. Verified agents get more inquiries.'}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
