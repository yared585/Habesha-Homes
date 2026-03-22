'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Home, Eye, MessageSquare, TrendingUp, Plus, Building2, User } from 'lucide-react'
import { Card, StatCard, Button, EmptyState } from '@/components/ui'
import type { Property, Profile } from '@/types'

interface Props {
  profile: Profile
  properties: Property[]
  stats: { listings: number; views: number; inquiries: number }
}

function PropRow({ p }: { p: Property }) {
  const price = p.listing_intent === 'rent' ? p.rent_per_month_etb : p.price_etb
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: '#fff', border: '1px solid #eae9e4', borderRadius: 12, marginBottom: 8 }}>
      <div style={{ width: 56, height: 44, borderRadius: 8, background: '#f0f0ec', overflow: 'hidden', flexShrink: 0 }}>
        {p.cover_image_url && <img src={p.cover_image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</div>
        <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>ETB {(price || 0).toLocaleString()} · {p.property_type}</div>
      </div>
      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: p.status === 'active' ? '#f0fdf4' : '#fef9ec', color: p.status === 'active' ? '#16a34a' : '#d97706', flexShrink: 0 }}>
        {p.status}
      </span>
      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        <Link href={`/property/${p.id}`} style={{ fontSize: 12, padding: '5px 11px', borderRadius: 7, border: '1px solid #e0dfd9', color: '#555', textDecoration: 'none' }}>View</Link>
        <Link href={`/dashboard/listings/${p.id}/edit`} style={{ fontSize: 12, padding: '5px 11px', borderRadius: 7, border: '1px solid #e0dfd9', color: '#555', textDecoration: 'none' }}>Edit</Link>
      </div>
    </div>
  )
}

const AI_TOOLS = [
  { emoji: '✍️', title: 'AI listing writer', desc: 'Claude writes your listing in Amharic and English from photos.', href: '/dashboard/listings/new', btn: 'Create listing', color: '#16a34a' },
  { emoji: '🔍', title: 'Fraud check', desc: 'Run a title fraud check for your buyer clients.', href: '/ai-reports#fraud', btn: 'Run check', color: '#dc2626' },
  { emoji: '📊', title: 'Property valuation', desc: 'Get instant AI valuation to price listings correctly.', href: '/ai-reports#valuation', btn: 'Get valuation', color: '#2563eb' },
  { emoji: '📄', title: 'Contract analyzer', desc: 'Highlight dangerous clauses in any contract.', href: '/ai-reports#contract', btn: 'Analyze', color: '#d97706' },
]

export function AgentDashboard({ profile, properties, stats }: Props) {
  const [tab, setTab] = useState<'listings' | 'ai' | 'settings'>('listings')

  return (
    <>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 14, marginBottom: 28 }}>
        <StatCard icon={<Home size={18}/>} label="Active listings" value={stats.listings} color="#16a34a"/>
        <StatCard icon={<Eye size={18}/>} label="Total views" value={stats.views} color="#2563eb"/>
        <StatCard icon={<MessageSquare size={18}/>} label="Inquiries" value={stats.inquiries} color="#d97706"/>
        <StatCard icon={<TrendingUp size={18}/>} label="This month" value="—" color="#7c3aed"/>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '2px solid #eae9e4' }}>
        {[{ id: 'listings', label: 'My listings' }, { id: 'ai', label: '🤖 AI tools' }, { id: 'settings', label: 'Settings' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)} style={{
            background: 'none', border: 'none', padding: '10px 16px', cursor: 'pointer', fontSize: 14,
            fontWeight: tab === t.id ? 700 : 400,
            color: tab === t.id ? '#16a34a' : '#888',
            borderBottom: tab === t.id ? '2px solid #16a34a' : '2px solid transparent',
            marginBottom: -2, transition: 'all .15s', fontFamily: 'inherit',
          }}>{t.label}</button>
        ))}
      </div>

      {/* Listings */}
      {tab === 'listings' && (
        properties.length === 0
          ? <EmptyState icon={<Building2 size={48}/>} title="No listings yet" description="Add your first property to start getting inquiries"
              action={<Link href="/dashboard/listings/new" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#16a34a', color: '#fff', padding: '11px 22px', borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}><Plus size={15}/> Add first listing</Link>}
            />
          : <div>{properties.map(p => <PropRow key={p.id} p={p}/>)}</div>
      )}

      {/* AI tools */}
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

      {/* Settings */}
      {tab === 'settings' && (
        <Card>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: '#111', marginBottom: 20 }}>Agent profile</h3>
          <div style={{ display: 'grid', gap: 12 }}>
            {[{ label: 'Full name', value: profile.full_name }, { label: 'Email', value: profile.email }, { label: 'Phone', value: profile.phone }].map(({ label, value }) => (
              <div key={label}>
                <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 14, color: '#111', background: '#f9f9f7', padding: '10px 14px', borderRadius: 8, border: '1px solid #eae9e4' }}>{value || '—'}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, padding: 12, background: '#f0fdf4', borderRadius: 10, border: '1px solid #bbf7d0', fontSize: 13, color: '#15803d' }}>
            ✦ Agent account · <strong>Free plan</strong>
          </div>
        </Card>
      )}
    </>
  )
}
