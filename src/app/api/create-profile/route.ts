import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

// Service-role client for writes that bypass RLS (only used after auth is verified)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// Roles that can be set through self-registration.
// 'admin' is intentionally excluded — admin must be granted directly in Supabase.
const SELF_ASSIGNABLE_ROLES = ['buyer', 'seller', 'agent'] as const

export async function POST(req: NextRequest) {
  try {
    // 1. Verify the caller is authenticated
    const supabase = createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await req.json()
    const { id, full_name, email, phone, role, is_diaspora, diaspora_country, agency_name } = body

    if (!id || !email) {
      return NextResponse.json({ error: 'Missing id or email' }, { status: 400 })
    }

    // 2. Only allow users to create/update their own profile
    if (user.id !== id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 3. Prevent privilege escalation — never allow admin via this route
    const cleanRole = SELF_ASSIGNABLE_ROLES.includes(role) ? role : 'buyer'

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
      console.error('Profile upsert error:', profileError)
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

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
        console.error('Agent upsert error:', agentError)
        // Don't fail — profile was created, agent record is secondary
      }
    }

    return NextResponse.json({ success: true, role: cleanRole })
  } catch (err: any) {
    console.error('Create profile exception:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
