// src/app/api/claude/valuation/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateValuation } from '@/lib/claude'

export const runtime = 'nodejs'
export const maxDuration = 60

// Current Addis Ababa market data (ETB per m²)
// In production: fetch from your database, updated by admin
const MARKET_DATA: Record<string, number> = {
  'Bole': 78000,
  'Kazanchis': 52000,
  'Megenagna': 58000,
  'Sarbet': 44000,
  'Gerji': 41000,
  'CMC': 49000,
  'Piassa': 32000,
  'Kolfe': 22000,
  'Lebu': 15000,
  'Lideta': 38000,
  'Akaki': 18000,
  'Nifas Silk': 35000,
  'Addis Ababa': 40000 // default
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Auth required' }, { status: 401 })

    const { property_id } = await request.json()
    if (!property_id) return NextResponse.json({ error: 'property_id required' }, { status: 400 })

    // Fetch property
    const { data: property } = await supabase
      .from('properties')
      .select('*, neighborhood:neighborhoods(*)')
      .eq('id', property_id)
      .single()

    if (!property) return NextResponse.json({ error: 'Property not found' }, { status: 404 })

    // Generate valuation
    const result = await generateValuation(property as any, MARKET_DATA)

    // Save report — try to save but don't fail if columns don't exist
    try {
      await supabase.from('ai_reports').insert({
        property_id,
        user_id: user.id,
        report_type: 'valuation',
        is_paid: false,
        status: 'completed',
      })
    } catch (e) {
      console.log('Report save skipped:', e)
    }

    return NextResponse.json({ success: true, result })

  } catch (error) {
    console.error('Valuation error:', error)
    return NextResponse.json({ error: 'Valuation failed' }, { status: 500 })
  }
}
