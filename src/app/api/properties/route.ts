// src/app/api/properties/route.ts
// Property search with filters, pagination, geospatial

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { PropertyFilters } from '@/types'

export async function GET(request: NextRequest) {
  const supabase = createClient()
  const { searchParams } = new URL(request.url)

  // Parse filters
  const page = parseInt(searchParams.get('page') || '1')
  const per_page = Math.min(parseInt(searchParams.get('per_page') || '20'), 50)
  const offset = (page - 1) * per_page

  const filters: PropertyFilters = {
    query: searchParams.get('q') || undefined,
    neighborhoods: searchParams.get('neighborhoods')?.split(',').filter(Boolean),
    property_types: searchParams.get('types')?.split(',').filter(Boolean) as any,
    listing_intent: searchParams.get('intent') as any || undefined,
    min_price_etb: searchParams.get('min_price') ? parseInt(searchParams.get('min_price')!) : undefined,
    max_price_etb: searchParams.get('max_price') ? parseInt(searchParams.get('max_price')!) : undefined,
    min_bedrooms: searchParams.get('min_beds') ? parseInt(searchParams.get('min_beds')!) : undefined,
    is_featured: searchParams.get('featured') === 'true' ? true : undefined,
    is_verified: searchParams.get('verified') === 'true' ? true : undefined,
  }

  const sort = searchParams.get('sort') || 'newest' // 'newest', 'price_asc', 'price_desc', 'featured'

  try {
    let query = supabase
      .from('properties')
      .select(`
        *,
        neighborhood:neighborhoods(
          id, name, name_amharic, avg_price_per_sqm_etb, price_trend_12m
        ),
        agent:agents(
          id, agency_name, agency_name_amharic, rating, is_verified,
          profile:profiles(full_name, avatar_url, phone)
        )
      `, { count: 'exact' })
      .eq('status', 'active')

    // Apply filters
    if (filters.query) {
      query = query.or(
        `title.ilike.%${filters.query}%,description.ilike.%${filters.query}%,address.ilike.%${filters.query}%,title_amharic.ilike.%${filters.query}%`
      )
    }

    if (filters.neighborhoods?.length) {
      // Get neighborhood IDs by name
      const { data: hoods } = await supabase
        .from('neighborhoods')
        .select('id')
        .in('name', filters.neighborhoods)
      const hoodIds = hoods?.map(h => h.id) || []
      if (hoodIds.length) query = query.in('neighborhood_id', hoodIds)
    }

    if (filters.property_types?.length) {
      query = query.in('property_type', filters.property_types)
    }

    if (filters.listing_intent) {
      query = query.or(`listing_intent.eq.${filters.listing_intent},listing_intent.eq.both`)
    }

    if (filters.min_price_etb) query = query.gte('price_etb', filters.min_price_etb)
    if (filters.max_price_etb) query = query.lte('price_etb', filters.max_price_etb)
    if (filters.min_bedrooms) query = query.gte('bedrooms', filters.min_bedrooms)
    if (filters.is_featured) query = query.eq('is_featured', true)
    if (filters.is_verified) query = query.eq('title_verified', true)

    // Sorting
    switch (sort) {
      case 'price_asc':
        query = query.order('price_etb', { ascending: true })
        break
      case 'price_desc':
        query = query.order('price_etb', { ascending: false })
        break
      case 'featured':
        query = query.order('is_featured', { ascending: false }).order('listed_at', { ascending: false })
        break
      default: // newest
        query = query.order('listed_at', { ascending: false })
    }

    query = query.range(offset, offset + per_page - 1)

    const { data: properties, error, count } = await query

    if (error) throw error

    return NextResponse.json({
      data: properties || [],
      total: count || 0,
      page,
      per_page,
      has_more: (count || 0) > offset + per_page
    })

  } catch (error) {
    console.error('Properties search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}

// Create new property listing
export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  try {
    const body = await request.json()

    // Get agent record if user is an agent
    const { data: agent } = await supabase
      .from('agents')
      .select('id, subscription_plan')
      .eq('profile_id', user.id)
      .single()

    const propertyData = {
      ...body,
      owner_id: user.id,
      agent_id: agent?.id || null,
      status: 'pending_review',
      listed_at: new Date().toISOString()
    }

    const { data: property, error } = await supabase
      .from('properties')
      .insert(propertyData)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data: property }, { status: 201 })

  } catch (error) {
    console.error('Create property error:', error)
    return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 })
  }
}
