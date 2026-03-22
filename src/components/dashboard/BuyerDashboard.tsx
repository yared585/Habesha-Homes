'use client'

import Link from 'next/link'
import { Heart, MessageSquare, Shield, Search, Building2, User } from 'lucide-react'
import { Card, StatCard, EmptyState } from '@/components/ui'
import type { Property, Profile } from '@/types'

interface Props {
  profile: Profile
  saved: Property[]
  stats: { saved: number; inquiries: number; reports: number }
}

const QUICK_ACTIONS = [
  { emoji: '🔍', title: 'Search properties', desc: 'Browse all listings with smart filters', href: '/search', color: '#111' },
  { emoji: '🤖', title: 'Ask AI assistant', desc: 'Get answers in Amharic or English 24/7', href: '/ai-reports', color: '#16a34a' },
  { emoji: '🔒', title: 'Fraud check', desc: 'Verify a title document before you pay', href: '/ai-reports#fraud', color: '#dc2626' },
  { emoji: '🌍', title: 'Diaspora guide', desc: 'Buy Ethiopian property from abroad', href: '/diaspora', color: '#2563eb' },
]

export function BuyerDashboard({ profile, saved, stats }: Props) {
  return (
    <>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 14, marginBottom: 28 }}>
        <StatCard icon={<Heart size={18}/>} label="Saved properties" value={stats.saved} color="#dc2626"/>
        <StatCard icon={<MessageSquare size={18}/>} label="Inquiries sent" value={stats.inquiries} color="#2563eb"/>
        <StatCard icon={<Shield size={18}/>} label="AI reports" value={stats.reports} color="#16a34a"/>
        <StatCard icon={<Search size={18}/>} label="Properties viewed" value="—" color="#d97706"/>
      </div>

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14, marginBottom: 28 }}>
        {QUICK_ACTIONS.map(({ emoji, title, desc, href, color }) => (
          <Link key={title} href={href} style={{ textDecoration: 'none' }}>
            <Card hover>
              <div style={{ fontSize: 26, marginBottom: 10 }}>{emoji}</div>
              <div style={{ fontWeight: 700, fontSize: 14, color, marginBottom: 4 }}>{title}</div>
              <div style={{ fontSize: 12, color: '#888', lineHeight: 1.5 }}>{desc}</div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Saved properties */}
      <h2 style={{ fontSize: 18, fontWeight: 800, color: '#111', marginBottom: 16 }}>Saved properties</h2>
      {saved.length === 0
        ? <EmptyState
            icon={<Heart size={40}/>}
            title="No saved properties yet"
            description="Browse listings and click the heart icon to save properties you like"
            action={<Link href="/search" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#16a34a', color: '#fff', padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}><Search size={14}/> Browse properties</Link>}
          />
        : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
            {saved.map((p: any) => (
              <Link key={p.id} href={`/property/${p.id}`} style={{ textDecoration: 'none' }}>
                <Card hover>
                  <div style={{ height: 130, background: '#f0f0ec', borderRadius: 8, overflow: 'hidden', marginBottom: 12 }}>
                    {p.cover_image_url && <img src={p.cover_image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>}
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#111', marginBottom: 4 }}>{p.title}</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#16a34a' }}>ETB {((p.price_etb || p.rent_per_month_etb) || 0).toLocaleString()}</div>
                </Card>
              </Link>
            ))}
          </div>
        )
      }

      {/* Profile */}
      <div style={{ marginTop: 28 }}>
        <Card>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 16 }}>Your profile</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
            <div style={{ width: 50, height: 50, borderRadius: '50%', background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: '#fff', fontWeight: 700 }}>
              {profile.full_name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>{profile.full_name}</div>
              <div style={{ fontSize: 13, color: '#888' }}>{profile.email}</div>
              <div style={{ fontSize: 11, color: '#16a34a', fontWeight: 600, marginTop: 2 }}>Buyer account</div>
            </div>
          </div>
          <div style={{ fontSize: 13, color: '#888', padding: 12, background: '#f9f9f7', borderRadius: 8 }}>
            Want to list a property?{' '}
            <Link href="/contact" style={{ color: '#16a34a', fontWeight: 600, textDecoration: 'none' }}>Contact us to upgrade to agent</Link>
          </div>
        </Card>
      </div>
    </>
  )
}
