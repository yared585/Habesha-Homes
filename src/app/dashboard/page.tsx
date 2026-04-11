'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { AgentDashboard } from '@/components/dashboard/AgentDashboard'
import { BuyerDashboard } from '@/components/dashboard/BuyerDashboard'
import { createClient } from '@/lib/supabase/client'
import type { Property } from '@/types'

export default function DashboardPage() {
  const { profile, loading } = useAuth(true)
  const router = useRouter()
  const [properties, setProperties] = useState<Property[]>([])
  const [saved, setSaved] = useState<Property[]>([])
  const [stats, setStats] = useState({ listings: 0, views: 0, inquiries: 0, saved: 0, reports: 0 })
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    loadData()
  }, [profile])

  async function loadData() {
    const sb = createClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) return

    if (profile?.role === 'developer') {
      router.push('/dashboard/developer')
      return
    }
    if (profile?.role === 'agent') {
      const [{ data: props, count }, { count: inqCount }] = await Promise.all([
        sb.from('properties').select('*, neighborhood:neighborhoods(name)', { count: 'exact' }).eq('agent_id', user.id).order('created_at', { ascending: false }).limit(20),
        sb.from('inquiries').select('*', { count: 'exact', head: true }).eq('agent_id', user.id),
      ])
      const totalViews = (props || []).reduce((sum: number, p: any) => sum + (p.views || 0), 0)
      setProperties((props || []) as unknown as Property[])
      setStats(s => ({ ...s, listings: count || 0, views: totalViews, inquiries: inqCount || 0 }))
    } else {
      const [{ data: savedProps, count: savedCount }, { count: inqCount }, { count: reportCount }] = await Promise.all([
        sb.from('saved_properties').select('property:properties(*)', { count: 'exact' }).eq('user_id', user.id).limit(10),
        sb.from('inquiries').select('*', { count: 'exact', head: true }).eq('buyer_id', user.id),
        sb.from('ai_reports').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      ])
      setSaved(((savedProps || []).map((s: any) => s.property).filter(Boolean)) as unknown as Property[])
      setStats(s => ({ ...s, saved: savedCount || 0, inquiries: inqCount || 0, reports: reportCount || 0 }))
    }
    setDataLoading(false)
  }

  if (loading || !profile) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#aaa', fontSize: 14 }}>
      Loading your dashboard...
    </div>
  )

  const isAgent = profile.role === 'agent'

  return (
    <div style={{ background: '#f9f9f7', minHeight: '100vh', padding: '32px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: '#111', margin: '12px 0 4px', letterSpacing: '-.02em' }}>
              Welcome back, {profile.full_name?.split(' ')[0] || 'there'} 👋
            </h1>
            <p style={{ fontSize: 14, color: '#888', margin: 0 }}>
              {isAgent ? '✦ Agent dashboard' : 'Your property journey'}
            </p>
          </div>
          {isAgent && (
            <Link href="/dashboard/listings/new" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#16a34a', color: '#fff', padding: '11px 22px', borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
              <Plus size={16}/> Add new listing
            </Link>
          )}
        </div>

        {isAgent
          ? <AgentDashboard profile={profile} properties={properties} stats={{ listings: stats.listings, views: stats.views, inquiries: stats.inquiries }} loading={dataLoading}/>
          : <BuyerDashboard profile={profile} saved={saved} stats={{ saved: stats.saved, inquiries: stats.inquiries, reports: stats.reports }}/>
        }
      </div>
    </div>
  )
}
