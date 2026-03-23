'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { MapPin, Phone, Mail, Star, Shield, Building2, CheckCircle, MessageSquare } from 'lucide-react'
import { PropertyCard } from '@/components/property/PropertyCard'
import type { Property } from '@/types'

export default function AgentProfilePage() {
  const params = useParams()
  const [agent, setAgent] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [showContact, setShowContact] = useState(false)
  const [inquiry, setInquiry] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)

  useEffect(() => {
    if (params.id) loadAgent(params.id as string)
  }, [params.id])

  async function loadAgent(id: string) {
    const sb = createClient()

    const [{ data: agentData }, { data: profileData }, { data: props }] = await Promise.all([
      sb.from('agents').select('*').eq('id', id).single(),
      sb.from('profiles').select('*').eq('id', id).single(),
      sb.from('properties').select('*,neighborhood:neighborhoods(name)').eq('agent_id', id).eq('status', 'active').order('listed_at', { ascending: false }),
    ])

    setAgent(agentData)
    setProfile(profileData)
    setProperties((props || []) as unknown as Property[])
    setLoading(false)
  }

  async function sendInquiry(e: React.FormEvent) {
    e.preventDefault()
    const sb = createClient()
    await sb.from('inquiries').insert({
      agent_id: params.id,
      name: inquiry.name,
      email: inquiry.email,
      message: inquiry.message,
    })
    setSent(true)
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#aaa', fontSize: 14 }}>
      Loading agent profile...
    </div>
  )

  if (!agent || !profile) return (
    <div style={{ textAlign: 'center', padding: '80px 24px' }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111', marginBottom: 8 }}>Agent not found</h2>
      <Link href="/search" style={{ color: '#16a34a', textDecoration: 'none' }}>Browse properties →</Link>
    </div>
  )

  return (
    <div style={{ background: '#f9f9f7', minHeight: '100vh' }}>

      {/* Hero banner */}
      <div style={{ background: '#0d2318', padding: '40px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>

            {/* Avatar */}
            <div style={{ flexShrink: 0 }}>
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.full_name} style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.2)' }}/>
              ) : (
                <div style={{ width: 90, height: 90, borderRadius: '50%', background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, color: '#fff', fontWeight: 700, border: '3px solid rgba(255,255,255,0.2)' }}>
                  {profile.full_name?.[0]?.toUpperCase() || 'A'}
                </div>
              )}
            </div>

            {/* Info */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                <h1 style={{ fontSize: 26, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-.02em' }}>
                  {profile.full_name}
                </h1>
                {agent.is_verified && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700, color: '#4ade80' }}>
                    <CheckCircle size={11}/> Verified
                  </span>
                )}
              </div>
              <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', marginBottom: 12 }}>
                {agent.agency_name}
              </div>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                {[
                  { label: 'Active listings', val: properties.length },
                  { label: 'Total sales', val: agent.total_sales || 0 },
                  { label: 'Rating', val: agent.rating ? `${agent.rating}/5` : 'New' },
                ].map(({ label, val }) => (
                  <div key={label}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>{val}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact button */}
            <div style={{ flexShrink: 0 }}>
              <button onClick={() => setShowContact(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#16a34a', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                <MessageSquare size={15}/> Contact agent
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 28, alignItems: 'start' }}>

          {/* Left — listings */}
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#111', marginBottom: 20, letterSpacing: '-.01em' }}>
              Active listings ({properties.length})
            </h2>
            {properties.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0', background: '#fff', borderRadius: 16, border: '1px solid #eae9e4' }}>
                <Building2 size={40} color="#d0d0cc" style={{ marginBottom: 12 }}/>
                <p style={{ fontSize: 14, color: '#888' }}>No active listings yet</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 18 }}>
                {properties.map(p => <PropertyCard key={p.id} property={p}/>)}
              </div>
            )}
          </div>

          {/* Right — agent card */}
          <div style={{ display: 'grid', gap: 14 }}>
            <div style={{ background: '#fff', border: '1px solid #eae9e4', borderRadius: 14, padding: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 16 }}>Contact information</h3>
              {profile.phone && (
                <a href={`tel:${profile.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid #f5f5f2', textDecoration: 'none', color: '#333', fontSize: 14 }}>
                  <Phone size={15} color="#16a34a"/>{profile.phone}
                </a>
              )}
              {profile.email && (
                <a href={`mailto:${profile.email}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid #f5f5f2', textDecoration: 'none', color: '#333', fontSize: 14 }}>
                  <Mail size={15} color="#16a34a"/>{profile.email}
                </a>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', fontSize: 14, color: '#333' }}>
                <Building2 size={15} color="#16a34a"/>{agent.agency_name}
              </div>
              <button onClick={() => setShowContact(true)}
                style={{ width: '100%', marginTop: 12, background: '#16a34a', color: '#fff', border: 'none', padding: '11px', borderRadius: 9, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Send message
              </button>
            </div>

            {/* Plan badge */}
            <div style={{ background: agent.subscription_plan === 'free' ? '#f9f9f7' : '#f0fdf4', border: `1px solid ${agent.subscription_plan === 'free' ? '#eae9e4' : '#bbf7d0'}`, borderRadius: 12, padding: 14, textAlign: 'center' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: agent.subscription_plan === 'free' ? '#888' : '#16a34a', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                {agent.subscription_plan === 'free' ? 'Free plan' : '✦ Pro agent'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact modal */}
      {showContact && (
        <div onClick={() => setShowContact(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 18, padding: 28, width: '100%', maxWidth: 440, boxShadow: '0 24px 60px rgba(0,0,0,0.2)' }}>
            {sent ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <CheckCircle size={48} color="#16a34a" style={{ marginBottom: 16 }}/>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: '#111', marginBottom: 8 }}>Message sent!</h3>
                <p style={{ fontSize: 14, color: '#888', marginBottom: 20 }}>{profile.full_name} will get back to you soon.</p>
                <button onClick={() => setShowContact(false)}
                  style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 9, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
                >Close</button>
              </div>
            ) : (
              <>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#111', marginBottom: 4 }}>Contact {profile.full_name}</h3>
                <p style={{ fontSize: 13, color: '#888', marginBottom: 20 }}>{agent.agency_name}</p>
                <form onSubmit={sendInquiry} style={{ display: 'grid', gap: 12 }}>
                  {[
                    { key: 'name', label: 'Your name', type: 'text', placeholder: 'Full name' },
                    { key: 'email', label: 'Your email', type: 'email', placeholder: 'email@example.com' },
                  ].map(({ key, label, type, placeholder }) => (
                    <div key={key}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 5 }}>{label}</label>
                      <input type={type} placeholder={placeholder} required
                        value={(inquiry as any)[key]}
                        onChange={e => setInquiry(i => ({ ...i, [key]: e.target.value }))}
                        style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e0dfd9', borderRadius: 9, fontSize: 14, outline: 'none', fontFamily: 'inherit' }}
                        onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#16a34a'}
                        onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#e0dfd9'}
                      />
                    </div>
                  ))}
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 5 }}>Message</label>
                    <textarea placeholder="I'm interested in your properties..." required rows={3}
                      value={inquiry.message}
                      onChange={e => setInquiry(i => ({ ...i, message: e.target.value }))}
                      style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e0dfd9', borderRadius: 9, fontSize: 14, outline: 'none', fontFamily: 'inherit', resize: 'vertical' }}
                      onFocus={e => (e.target as HTMLTextAreaElement).style.borderColor = '#16a34a'}
                      onBlur={e => (e.target as HTMLTextAreaElement).style.borderColor = '#e0dfd9'}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button type="button" onClick={() => setShowContact(false)}
                      style={{ flex: 1, background: '#f5f5f2', border: 'none', padding: '11px', borderRadius: 9, fontSize: 14, color: '#555', cursor: 'pointer', fontFamily: 'inherit' }}
                    >Cancel</button>
                    <button type="submit"
                      style={{ flex: 2, background: '#16a34a', color: '#fff', border: 'none', padding: '11px', borderRadius: 9, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
                    >Send message</button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
