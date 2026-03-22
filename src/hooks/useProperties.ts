'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Property } from '@/types'

interface UsePropertiesOptions {
  limit?: number
  intent?: 'sale' | 'rent'
  featured?: boolean
  agentId?: string
}

export function useProperties(opts: UsePropertiesOptions = {}) {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [count, setCount] = useState(0)

  useEffect(() => {
    const sb = createClient()
    let query = sb.from('properties')
      .select('*,neighborhood:neighborhoods(name,name_amharic),agent:agents(agency_name,is_verified)', { count: 'exact' })
      .eq('status', 'active')

    if (opts.intent) query = query.eq('listing_intent', opts.intent)
    if (opts.featured) query = query.eq('is_featured', true)
    if (opts.agentId) query = query.eq('agent_id', opts.agentId)

    query = query
      .order('is_featured', { ascending: false })
      .order('listed_at', { ascending: false })
      .limit(opts.limit || 6)

    query.then(({ data, count: c }) => {
      setProperties((data || []) as unknown as Property[])
      setCount(c || 0)
      setLoading(false)
    })
  }, [opts.intent, opts.featured, opts.agentId, opts.limit])

  return { properties, loading, count }
}

export function useNeighborhoods(limit = 8) {
  const [neighborhoods, setNeighborhoods] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    createClient().from('neighborhoods').select('*')
      .order('avg_price_per_sqm_etb', { ascending: false })
      .limit(limit)
      .then(({ data }) => { setNeighborhoods(data || []); setLoading(false) })
  }, [limit])

  return { neighborhoods, loading }
}

export function useLiveStats() {
  const [stats, setStats] = useState({ listings: 0, agents: 0, reports: 0, neighborhoods: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const sb = createClient()
    Promise.all([
      sb.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      sb.from('agents').select('*', { count: 'exact', head: true }).eq('is_verified', true),
      sb.from('ai_reports').select('*', { count: 'exact', head: true }),
      sb.from('neighborhoods').select('*', { count: 'exact', head: true }),
    ]).then(([p, a, r, n]) => {
      setStats({ listings: p.count || 0, agents: a.count || 0, reports: r.count || 0, neighborhoods: n.count || 0 })
      setLoading(false)
    })
  }, [])

  return { stats, loading }
}
