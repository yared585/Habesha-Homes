'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Property } from '@/types'

interface UsePropertiesOptions {
  limit?: number
  intent?: 'sale' | 'rent'
  featured?: boolean
  agentId?: string
  sortBy?: 'recent' | 'views' | 'price_asc' | 'price_desc'
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

    if (opts.sortBy === 'views') {
      query = query.order('views', { ascending: false })
    } else if (opts.sortBy === 'price_asc') {
      query = query.order('price_etb', { ascending: true })
    } else if (opts.sortBy === 'price_desc') {
      query = query.order('price_etb', { ascending: false })
    } else {
      query = query
        .order('is_featured', { ascending: false })
        .order('listed_at', { ascending: false })
    }

    query = query.limit(opts.limit || 6)

    query.then(({ data, count: c }) => {
      setProperties((data || []) as unknown as Property[])
      setCount(c || 0)
      setLoading(false)
    })
  }, [opts.intent, opts.featured, opts.agentId, opts.limit, opts.sortBy])

  return { properties, loading, count }
}

export function useNeighborhoods(limit = 8) {
  const [neighborhoods, setNeighborhoods] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    createClient().from('neighborhoods').select('id, name, name_amharic, avg_price_per_sqm_etb, price_trend_12m')
      .not('avg_price_per_sqm_etb', 'is', null)
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

export function usePropertyCounts() {
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const sb = createClient()
    Promise.all([
      sb.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'active').or('property_type.ilike.house,property_type.ilike.villa,property_type.ilike.houses,property_type.ilike.home'),
      sb.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'active').or('property_type.ilike.apartment,property_type.ilike.condominium,property_type.ilike.flat,property_type.ilike.apartments'),
      sb.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'active').or('property_type.ilike.land,property_type.ilike.plot,property_type.ilike.land_plot'),
      sb.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'active').or('property_type.ilike.commercial,property_type.ilike.office,property_type.ilike.shop'),
      sb.from('projects').select('*', { count: 'exact', head: true }),
    ]).then(([houses, apartments, land, commercial, developments]) => {
      setCounts({
        house: houses.count || 0,
        apartment: apartments.count || 0,
        land: land.count || 0,
        commercial: commercial.count || 0,
        developments: developments.count || 0,
      })
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])
  return { counts, loading }
}
