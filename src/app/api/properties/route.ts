// src/app/api/properties/route.ts
// Property search with filters, pagination, geospatial

import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { PropertyFilters, PropertyType, ListingIntent } from '@/types'

// Service role client — bypasses RLS for admin operations like counting listings
function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.EMAIL_FROM || 'Habesha Properties <onboarding@resend.dev>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://habeshaproperties.com'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'yohanesy585@gmail.com'

async function notifyAdminNewListing(property: any, agentName: string, agentEmail: string) {
  const price = property.price_etb
    ? `ETB ${Number(property.price_etb).toLocaleString()}`
    : 'Not specified'

  const html = `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f9f9f7;font-family:system-ui,-apple-system,sans-serif;">
<div style="max-width:560px;margin:0 auto;padding:32px 16px;">
  <div style="background:#0d2318;border-radius:14px 14px 0 0;padding:28px 32px;text-align:center;">
    <h1 style="color:#fff;font-size:22px;font-weight:800;margin:0 0 6px;letter-spacing:-0.02em;">New Listing Submitted</h1>
    <p style="color:rgba(255,255,255,0.6);font-size:14px;margin:0;">Pending your review on Habesha Properties</p>
  </div>
  <div style="background:#fff;padding:32px;border:1px solid #eae9e4;border-top:none;">
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:18px;margin-bottom:24px;">
      <div style="font-size:12px;font-weight:700;color:#16a34a;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px;">Property</div>
      <div style="font-size:17px;font-weight:700;color:#111;margin-bottom:4px;">${property.title || 'Untitled'}</div>
      <div style="font-size:13px;color:#555;">${property.property_type || ''} · ${property.city || ''}</div>
    </div>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
      <tr><td style="font-size:13px;color:#888;padding:6px 0;width:110px;">Agent</td><td style="font-size:14px;font-weight:600;color:#111;">${agentName}</td></tr>
      <tr><td style="font-size:13px;color:#888;padding:6px 0;">Agent Email</td><td style="font-size:14px;color:#111;"><a href="mailto:${agentEmail}" style="color:#16a34a;">${agentEmail}</a></td></tr>
      <tr><td style="font-size:13px;color:#888;padding:6px 0;">Price</td><td style="font-size:14px;font-weight:600;color:#1a3d2b;">${price}</td></tr>
      <tr><td style="font-size:13px;color:#888;padding:6px 0;">Intent</td><td style="font-size:14px;color:#111;">${property.listing_intent || 'sale'}</td></tr>
      <tr><td style="font-size:13px;color:#888;padding:6px 0;">Bedrooms</td><td style="font-size:14px;color:#111;">${property.bedrooms ?? '—'}</td></tr>
    </table>
    <div style="text-align:center;">
      <a href="${APP_URL}/admin" style="display:inline-block;background:#1a3d2b;color:#fff;padding:13px 32px;border-radius:10px;font-size:15px;font-weight:700;text-decoration:none;">
        Review in Admin Panel →
      </a>
    </div>
  </div>
  <div style="background:#f9f9f7;border:1px solid #eae9e4;border-top:none;border-radius:0 0 14px 14px;padding:16px 32px;text-align:center;">
    <p style="font-size:12px;color:#aaa;margin:0;">Habesha Properties · <a href="${APP_URL}" style="color:#16a34a;">${APP_URL}</a></p>
  </div>
</div>
</body></html>`

  await resend.emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `New listing pending review: "${property.title || 'Untitled'}" — ${agentName}`,
    html,
  })
}

const VALID_INTENTS: ListingIntent[] = ['sale', 'rent', 'both']
const VALID_TYPES: PropertyType[] = ['apartment','villa','house','condominium','commercial','land','office','warehouse']

export async function GET(request: NextRequest) {
  const supabase = createClient()
  const { searchParams } = new URL(request.url)

  // Parse filters
  const page = parseInt(searchParams.get('page') || '1')
  const per_page = Math.min(parseInt(searchParams.get('per_page') || '20'), 50)
  const offset = (page - 1) * per_page

  const intentRaw = searchParams.get('intent')
  const typesRaw = searchParams.get('types')?.split(',').filter(Boolean) ?? []

  const filters: PropertyFilters = {
    query: searchParams.get('q') || undefined,
    neighborhoods: searchParams.get('neighborhoods')?.split(',').filter(Boolean),
    property_types: typesRaw.filter((t): t is PropertyType => VALID_TYPES.includes(t as PropertyType)),
    listing_intent: VALID_INTENTS.includes(intentRaw as ListingIntent) ? (intentRaw as ListingIntent) : undefined,
    min_price_etb: searchParams.get('min_price') ? parseInt(searchParams.get('min_price')!) : undefined,
    max_price_etb: searchParams.get('max_price') ? parseInt(searchParams.get('max_price')!) : undefined,
    min_bedrooms: searchParams.get('min_beds') ? parseInt(searchParams.get('min_beds')!) : undefined,
    is_featured: searchParams.get('featured') === 'true' ? true : undefined,
    is_verified: searchParams.get('verified') === 'true' ? true : undefined,
    furnished: searchParams.get('furnished') || undefined,
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
          profile:profiles(id, full_name, avatar_url, phone, email)
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
    if (filters.furnished && filters.furnished !== 'any') {
      const f = filters.furnished.toLowerCase()
      if (f === 'furnished') query = query.eq('is_furnished', true)
      else if (f === 'unfurnished') query = query.eq('is_furnished', false)
    }

    // Sorting — featured listings always appear first, then apply secondary sort
    switch (sort) {
      case 'price_asc':
        query = query.order('is_featured', { ascending: false }).order('price_etb', { ascending: true })
        break
      case 'price_desc':
        query = query.order('is_featured', { ascending: false }).order('price_etb', { ascending: false })
        break
      case 'featured':
        query = query.order('is_featured', { ascending: false }).order('listed_at', { ascending: false })
        break
      default: // newest — featured first, then newest
        query = query.order('is_featured', { ascending: false }).order('listed_at', { ascending: false })
    }

    query = query.range(offset, offset + per_page - 1)

    const { data: properties, error, count } = await query

    if (error) throw error

    return NextResponse.json(
      {
        data: properties || [],
        total: count || 0,
        page,
        per_page,
        has_more: (count || 0) > offset + per_page,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
          'Vary': 'Accept-Encoding',
        },
      }
    )

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

    // ── Subscription plan & listing limits ─────────────────────────────────
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_plan')
      .eq('id', user.id)
      .single()

    const plan = (profile?.subscription_plan as string) || 'free'
    const LIMITS: Record<string, number> = { free: 3, basic: 10, pro: Infinity, premium: Infinity }
    const UPGRADES: Record<string, string> = {
      free: 'Upgrade to Basic for ETB 100/month to add more listings.',
      basic: 'Upgrade to Pro for ETB 500/month for unlimited listings.',
    }
    const limit = LIMITS[plan] ?? 3

    if (isFinite(limit)) {
      // Use admin client to bypass RLS, fetch actual rows to avoid head:true count bugs
      const { data: existingRows } = await createAdminClient()
        .from('properties')
        .select('id, status')
        .or(`owner_id.eq.${user.id},agent_id.eq.${user.id}`)

      const count = (existingRows || []).filter(r => r.status !== 'rejected').length

      if (count >= limit) {
        return NextResponse.json({
          error: `You've reached your ${limit} listing limit. ${UPGRADES[plan] || 'Upgrade your plan to add more listings.'}`,
          code: 'LISTING_LIMIT_REACHED',
          plan,
          limit,
        }, { status: 403 })
      }
    }

    const { data: agent } = await supabase
      .from('agents')
      .select('id, subscription_plan')
      .eq('id', user.id)
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

    // Notify admin — non-blocking
    const { data: agentProfile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single()

    notifyAdminNewListing(
      property,
      agentProfile?.full_name || 'Unknown Agent',
      agentProfile?.email || '',
    ).catch(() => { /* non-critical */ })

    return NextResponse.json({ data: property }, { status: 201 })

  } catch (error) {
    console.error('Create property error:', error)
    return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 })
  }
}