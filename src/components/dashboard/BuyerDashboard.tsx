'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, MessageSquare, Shield, Search, Eye, MapPin, Phone, Mail, Clock, ArrowRight, User, Edit } from 'lucide-react'
import { Card, StatCard, EmptyState } from '@/components/ui'
import { createClient, getClientUser } from '@/lib/supabase/client'
import { formatETB } from '@/lib/utils'
import type { Property, Profile } from '@/types'

interface Props {
  profile: Profile
  saved: Property[]
  stats: { saved: number; inquiries: number; reports: number }
}

const QUICK_ACTIONS = [
  { emoji: '🔍', title: 'Search properties', desc: 'Browse all listings', href: '/search', color: '#111' },
  { emoji: '🤖', title: 'AI assistant', desc: 'Ask anything in Amharic or English', href: '/ai-reports', color: '#16a34a' },
  { emoji: '🔒', title: 'Fraud check', desc: 'Verify a title document', href: '/ai-reports', color: '#dc2626' },
  { emoji: '🌍', title: 'Diaspora guide', desc: 'Buy Ethiopian property from abroad', href: '/diaspora', color: '#2563eb' },
]

export function BuyerDashboard({ profile, saved, stats }: Props) {
  const [tab, setTab] = useState<'overview' | 'saved' | 'inquiries' | 'profile'>('overview')
  const [inquiries, setInquiries] = useState<any[]>([])
  const [loadingInquiries, setLoadingInquiries] = useState(false)

  useEffect(() => {
    if (tab === 'inquiries') loadInquiries()
  }, [tab])

  async function loadInquiries() {
    setLoadingInquiries(true)
    const sb = createClient()
    const user = await getClientUser()
    if (!user) return

    const { data } = await sb
      .from('inquiries')
      .select('*,property:properties(id,title,cover_image_url,price_etb,rent_per_month_etb,listing_intent,city),agent:profiles!inquiries_agent_id_fkey(full_name,email,phone)')
      .eq('email', profile.email)
      .order('created_at', { ascending: false })
      .limit(50)

    setInquiries(data || [])
    setLoadingInquiries(false)
  }

  const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'saved', label: `Saved (${stats.saved})` },
    { id: 'inquiries', label: `Inquiries (${stats.inquiries})` },
    { id: 'profile', label: 'Profile' },
  ]

  return (
    <>
      {/* Welcome */}
      <div style={{ background: '#0d2318', borderRadius: 14, padding: '18px 22px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 2 }}>
            Welcome back, {profile.full_name?.split(' ')[0] || 'there'} 👋
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>Buyer account · {profile.email}</div>
        </div>
        <Link href="/search" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#16a34a', color: '#fff', padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
          <Search size={14}/> Browse properties
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12, marginBottom: 24 }}>
        <StatCard icon={<Heart size={17}/>} label="Saved properties" value={stats.saved} color="#dc2626"/>
        <StatCard icon={<MessageSquare size={17}/>} label="Inquiries sent" value={stats.inquiries} color="#2563eb"/>
        <StatCard icon={<Shield size={17}/>} label="AI reports" value={stats.reports} color="#16a34a"/>
        <StatCard icon={<Eye size={17}/>} label="Properties viewed" value="—" color="#d97706"/>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 20, borderBottom: '2px solid #eae9e4', overflowX: 'auto' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)} style={{
            background: 'none', border: 'none', padding: '10px 16px', cursor: 'pointer', fontSize: 13,
            fontWeight: tab === t.id ? 700 : 400, color: tab === t.id ? '#16a34a' : '#888',
            borderBottom: tab === t.id ? '2px solid #16a34a' : '2px solid transparent',
            marginBottom: -2, transition: 'all .15s', fontFamily: 'inherit', whiteSpace: 'nowrap',
          }}>{t.label}</button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab === 'overview' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12, marginBottom: 24 }}>
            {QUICK_ACTIONS.map(({ emoji, title, desc, href, color }) => (
              <Link key={title} href={href} style={{ textDecoration: 'none' }}>
                <Card hover>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{emoji}</div>
                  <div style={{ fontWeight: 700, fontSize: 13, color, marginBottom: 4 }}>{title}</div>
                  <div style={{ fontSize: 12, color: '#888', lineHeight: 1.5 }}>{desc}</div>
                </Card>
              </Link>
            ))}
          </div>

          {/* Recent saved */}
          {saved.length > 0 && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h2 style={{ fontSize: 17, fontWeight: 800, color: '#111', margin: 0 }}>Recently saved</h2>
                <button onClick={() => setTab('saved')} style={{ fontSize: 13, color: '#16a34a', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}>
                  View all →
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 14 }}>
                {saved.slice(0, 3).map((p: any) => (
                  <Link key={p.id} href={`/property/${p.id}`} style={{ textDecoration: 'none' }}>
                    <div style={{ background: '#fff', border: '1px solid #eae9e4', borderRadius: 12, overflow: 'hidden', transition: 'box-shadow .15s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'}
                      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'}
                    >
                      <div style={{ height: 130, background: '#f0f0ec', overflow: 'hidden', position: 'relative' }}>
                        {p.cover_image_url && <Image src={p.cover_image_url} alt={p.title || ''} fill sizes="280px" style={{ objectFit: 'cover' }}/>}
                      </div>
                      <div style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: '#111', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: '#16a34a' }}>{formatETB(p.price_etb || p.rent_per_month_etb)}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* SAVED */}
      {tab === 'saved' && (
        saved.length === 0
          ? <EmptyState icon={<Heart size={40}/>} title="No saved properties yet" description="Click the ♡ heart on any listing to save it here"
              action={<Link href="/search" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#16a34a', color: '#fff', padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}><Search size={14}/> Browse properties</Link>}
            />
          : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
              {saved.map((p: any) => (
                <Link key={p.id} href={`/property/${p.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#fff', border: '1px solid #eae9e4', borderRadius: 12, overflow: 'hidden' }}>
                    <div style={{ height: 150, background: '#f0f0ec', overflow: 'hidden', position: 'relative' }}>
                      {p.cover_image_url && <Image src={p.cover_image_url} alt={p.title || ''} fill sizes="280px" style={{ objectFit: 'cover' }}/>}
                    </div>
                    <div style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#111', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#888', marginBottom: 8 }}>
                        <MapPin size={11}/>{p.city}
                      </div>
                      <div style={{ fontSize: 17, fontWeight: 800, color: '#16a34a' }}>
                        {formatETB(p.price_etb || p.rent_per_month_etb)}
                        {p.listing_intent === 'rent' && <span style={{ fontSize: 12, fontWeight: 400, color: '#aaa' }}>/mo</span>}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
      )}

      {/* INQUIRIES */}
      {tab === 'inquiries' && (
        loadingInquiries ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#aaa', fontSize: 14 }}>Loading inquiries...</div>
        ) : inquiries.length === 0 ? (
          <EmptyState icon={<MessageSquare size={40}/>} title="No inquiries yet" description="When you contact agents about properties, your messages appear here"
            action={<Link href="/search" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#16a34a', color: '#fff', padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}><Search size={14}/> Find properties</Link>}
          />
        ) : (
          inquiries.map(inq => (
            <div key={inq.id} style={{ background: '#fff', border: '1px solid #eae9e4', borderRadius: 12, padding: 16, marginBottom: 10 }}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                {/* Property photo */}
                {inq.property?.cover_image_url && (
                  <div style={{ width: 60, height: 50, borderRadius: 8, overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                    <Image src={inq.property.cover_image_url} alt="" fill style={{ objectFit: 'cover' }}/>
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {inq.property && (
                    <Link href={`/property/${inq.property_id}`} style={{ fontSize: 14, fontWeight: 600, color: '#111', textDecoration: 'none', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {inq.property.title}
                    </Link>
                  )}
                  <div style={{ fontSize: 12, color: '#aaa', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={11}/> {new Date(inq.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              </div>

              <div style={{ fontSize: 13, color: '#555', background: '#f9f9f7', padding: '10px 14px', borderRadius: 8, marginBottom: 12, lineHeight: 1.7 }}>
                {inq.message}
              </div>

              {/* Agent reply info */}
              {inq.agent && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0' }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#fff', fontWeight: 700, flexShrink: 0 }}>
                    {inq.agent.full_name?.[0]?.toUpperCase() || 'A'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#111' }}>{inq.agent.full_name}</div>
                    <div style={{ fontSize: 11, color: '#888' }}>Agent</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {inq.agent.email && (
                      <a href={`mailto:${inq.agent.email}`} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#16a34a', textDecoration: 'none', fontWeight: 600 }}>
                        <Mail size={12}/> Reply
                      </a>
                    )}
                    {inq.agent.phone && (
                      <a href={`tel:${inq.agent.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#555', textDecoration: 'none' }}>
                        <Phone size={12}/> Call
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )
      )}

      {/* PROFILE */}
      {tab === 'profile' && (
        <div style={{ display: 'grid', gap: 16, maxWidth: 500 }}>
          <div style={{ background: '#fff', border: '1px solid #eae9e4', borderRadius: 14, padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: '#fff', fontWeight: 700, overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                {(profile as any).avatar_url
                  ? <Image src={(profile as any).avatar_url} alt="" fill style={{ objectFit: 'cover' }}/>
                  : profile.full_name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#111' }}>{profile.full_name}</div>
                <div style={{ fontSize: 13, color: '#888' }}>{profile.email}</div>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#2563eb', background: '#eff6ff', padding: '2px 8px', borderRadius: 10, display: 'inline-block', marginTop: 4 }}>Buyer</span>
              </div>
            </div>
            <div style={{ display: 'grid', gap: 10 }}>
              {[
                { label: 'Phone', value: profile.phone },
                { label: 'Member since', value: new Date((profile as any).created_at || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div style={{ fontSize: 11, color: '#aaa', marginBottom: 3 }}>{label}</div>
                  <div style={{ fontSize: 14, color: '#111', background: '#f9f9f7', padding: '9px 12px', borderRadius: 8, border: '1px solid #eae9e4' }}>{value || '—'}</div>
                </div>
              ))}
            </div>
            <Link href="/profile" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#16a34a', color: '#fff', padding: '10px 18px', borderRadius: 9, fontSize: 13, fontWeight: 600, textDecoration: 'none', marginTop: 16 }}>
              <Edit size={13}/> Edit profile
            </Link>
          </div>
          <div style={{ background: '#f9f9f7', border: '1px solid #eae9e4', borderRadius: 12, padding: '14px 18px', fontSize: 14, color: '#555', lineHeight: 1.6 }}>
            Want to list a property?{' '}
            <Link href="/contact" style={{ color: '#16a34a', fontWeight: 600, textDecoration: 'none' }}>Contact us to upgrade to agent →</Link>
          </div>
        </div>
      )}
    </>
  )
}
