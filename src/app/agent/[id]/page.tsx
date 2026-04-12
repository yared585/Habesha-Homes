'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Phone, Mail, Star, Shield, Building2, Home, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { PropertyCard } from '@/components/property/PropertyCard'
import type { Agent, Property } from '@/types'

type AgentWithProfile = Agent & {
  profile: { full_name: string | null; avatar_url: string | null; phone: string | null; email: string | null }
}

export default function AgentProfilePage() {
  const params = useParams()
  const [agent, setAgent] = useState<AgentWithProfile | null>(null)
  const [listings, setListings] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'active' | 'sold'>('active')

  useEffect(() => {
    if (params.id) load(params.id as string)
  }, [params.id])

  async function load(agentId: string) {
    const sb = createClient()

    const [{ data: agentData }, { data: props }] = await Promise.all([
      sb.from('agents')
        .select('*, profile:profiles(full_name, avatar_url, phone, email)')
        .eq('id', agentId)
        .single(),
      sb.from('properties')
        .select('*, neighborhood:neighborhoods(id, name, name_amharic, avg_price_per_sqm_etb, price_trend_12m)')
        .eq('agent_id', agentId)
        .in('status', ['active', 'sold', 'rented'])
        .order('created_at', { ascending: false }),
    ])

    if (agentData) setAgent(agentData as AgentWithProfile)
    if (props) setListings(props as unknown as Property[])
    setLoading(false)
  }

  const activeListings = listings.filter(p => p.status === 'active')
  const closedListings = listings.filter(p => p.status === 'sold' || p.status === 'rented')
  const displayed = tab === 'active' ? activeListings : closedListings

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#aaa', fontSize: 14 }}>
      Loading agent profile...
    </div>
  )

  if (!agent) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 12 }}>
      <div style={{ fontSize: 18, fontWeight: 700, color: '#111' }}>Agent not found</div>
      <Link href="/search" style={{ fontSize: 14, color: '#16a34a', textDecoration: 'none' }}>Browse listings →</Link>
    </div>
  )

  const avatarUrl = agent.profile?.avatar_url
  const name = agent.agency_name || agent.profile?.full_name || 'Agent'
  const initials = name[0]?.toUpperCase() || 'A'

  return (
    <div style={{ background: '#f9f9f7', minHeight: '100vh' }}>

      {/* ── Hero card ─────────────────────────────────────── */}
      <div style={{ background: '#0d2318', padding: '48px 24px 0' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap' as const }}>

            {/* Avatar */}
            <div style={{ width: 96, height: 96, borderRadius: '50%', background: '#1a3d2b', border: '3px solid rgba(255,255,255,0.15)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 800, color: '#fff', position: 'relative' }}>
              {avatarUrl
                ? <Image src={avatarUrl} alt={name} fill style={{ objectFit: 'cover' }}/>
                : initials}
            </div>

            {/* Name + meta */}
            <div style={{ flex: 1, paddingBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' as const }}>
                <h1 style={{ fontSize: 26, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-.02em' }}>{name}</h1>
                {agent.is_verified && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(22,163,74,0.2)', color: '#4ade80', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, border: '1px solid rgba(74,222,128,0.3)' }}>
                    <Shield size={11}/> Verified agent
                  </span>
                )}
              </div>

              {agent.specializations?.length > 0 && (
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 4 }}>
                  {agent.specializations.join(' · ')}
                </div>
              )}

              <div style={{ display: 'flex', gap: 20, marginTop: 10, flexWrap: 'wrap' as const }}>
                {agent.rating > 0 && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
                    <Star size={13} fill="#fbbf24" color="#fbbf24"/> {agent.rating.toFixed(1)} ({agent.review_count} reviews)
                  </span>
                )}
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
                  <Home size={13}/> {activeListings.length} active listings
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
                  <CheckCircle size={13}/> {agent.total_sales || closedListings.length} sold/rented
                </span>
              </div>
            </div>

            {/* Contact buttons */}
            <div style={{ display: 'flex', gap: 10, paddingBottom: 24, flexWrap: 'wrap' as const }}>
              {agent.profile?.phone && (
                <a href={`tel:${agent.profile.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#16a34a', color: '#fff', padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                  <Phone size={14}/> Call
                </a>
              )}
              {agent.profile?.email && (
                <a href={`mailto:${agent.profile.email}`} style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.15)' }}>
                  <Mail size={14}/> Email
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────── */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24, alignItems: 'start' }}>

          {/* ── Listings ────────────────────────────────── */}
          <div>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, background: '#eae9e4', borderRadius: 10, padding: 4, marginBottom: 20, width: 'fit-content' }}>
              {([['active', `Active (${activeListings.length})`], ['sold', `Sold / Rented (${closedListings.length})`]] as const).map(([key, label]) => (
                <button key={key} onClick={() => setTab(key)}
                  style={{ padding: '7px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', background: tab === key ? '#fff' : 'transparent', color: tab === key ? '#111' : '#888', boxShadow: tab === key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', transition: 'all .15s' }}
                >
                  {label}
                </button>
              ))}
            </div>

            {displayed.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0', color: '#bbb' }}>
                <Building2 size={36} style={{ opacity: .3, marginBottom: 12 }}/>
                <p style={{ fontSize: 14, margin: 0 }}>
                  {tab === 'active' ? 'No active listings at the moment.' : 'No sold or rented listings yet.'}
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                {displayed.map(p => <PropertyCard key={p.id} property={p}/>)}
              </div>
            )}
          </div>

          {/* ── Sidebar ─────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Bio */}
            {agent.bio && (
              <div style={{ background: '#fff', border: '1px solid #eae9e4', borderRadius: 14, padding: 20 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: '#111', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '.04em' }}>About</h3>
                <p style={{ fontSize: 13, color: '#555', lineHeight: 1.7, margin: 0 }}>{agent.bio}</p>
              </div>
            )}

            {/* Areas served */}
            {agent.areas_served?.length > 0 && (
              <div style={{ background: '#fff', border: '1px solid #eae9e4', borderRadius: 14, padding: 20 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: '#111', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '.04em' }}>Areas served</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6 }}>
                  {agent.areas_served.map(area => (
                    <span key={area} style={{ fontSize: 12, padding: '4px 10px', background: '#f0fdf4', color: '#16a34a', borderRadius: 20, fontWeight: 600 }}>
                      <MapPin size={9} style={{ marginRight: 3 }}/>{area}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* License */}
            {agent.license_number && (
              <div style={{ background: '#fff', border: '1px solid #eae9e4', borderRadius: 14, padding: 20 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: '#111', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '.04em' }}>License</h3>
                <div style={{ fontSize: 13, color: '#555', fontFamily: 'monospace' }}>{agent.license_number}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
