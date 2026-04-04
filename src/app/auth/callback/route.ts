// IMPORTANT: Add these URLs in Supabase Dashboard → Authentication → URL Configuration → Redirect URLs:
//   https://www.habeshaproperties.com/auth/callback
//   http://localhost:3000/auth/callback

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login?error=missing_code`)
  }

  const supabase = createClient()

  const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)
  if (sessionError || !sessionData.user) {
    return NextResponse.redirect(`${origin}/auth/login?error=exchange_failed`)
  }

  const user = sessionData.user

  // Check if a profile already exists
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', user.id)
    .single()

  // Create profile if it doesn't exist
  if (!profile) {
    await supabase.from('profiles').insert({
      id: user.id,
      full_name: user.user_metadata.full_name || user.email?.split('@')[0],
      email: user.email,
      role: 'buyer',
      created_at: new Date().toISOString(),
    })
  }

  // Redirect based on role
  const role = profile?.role ?? 'buyer'
  if (role === 'admin') return NextResponse.redirect(`${origin}/admin`)
  if (role === 'agent') return NextResponse.redirect(`${origin}/dashboard`)
  if (role === 'developer') return NextResponse.redirect(`${origin}/dashboard/developer`)
  return NextResponse.redirect(`${origin}/saved`)
}
