import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, full_name, email, phone, role, is_diaspora, diaspora_country, agency_name } = body

    console.log('Creating profile for:', { id, email, role })

    if (!id || !email) {
      return NextResponse.json({ error: 'Missing id or email' }, { status: 400 })
    }

    // Use service role key to bypass RLS
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Validate role — must be one of the enum values
    const validRoles = ['buyer', 'seller', 'agent', 'admin']
    const cleanRole = validRoles.includes(role) ? role : 'buyer'

    console.log('Using role:', cleanRole)

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id,
        email,
        full_name: full_name || email.split('@')[0],
        phone: phone || null,
        role: cleanRole,
        is_diaspora: is_diaspora || false,
        diaspora_country: diaspora_country || null,
        preferred_language: 'en',
      }, { onConflict: 'id' })

    if (profileError) {
      console.error('Profile upsert error:', JSON.stringify(profileError))
      return NextResponse.json({ error: profileError.message, details: profileError }, { status: 500 })
    }

    console.log('Profile created successfully')

    // Create agent record if role is agent
    if (cleanRole === 'agent') {
      const { error: agentError } = await supabaseAdmin
        .from('agents')
        .upsert({
          id,
          agency_name: agency_name || full_name || 'My Agency',
          subscription_plan: 'free',
          is_verified: false,
          rating: 0,
          total_listings: 0,
          total_sales: 0,
        }, { onConflict: 'id' })

      if (agentError) {
        console.error('Agent upsert error:', JSON.stringify(agentError))
        // Don't fail — profile was created, agent record is secondary
      }
    }

    return NextResponse.json({ success: true, role: cleanRole })
  } catch (err: any) {
    console.error('Create profile exception:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
