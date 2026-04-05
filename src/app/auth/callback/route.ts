// IMPORTANT: Add these URLs in Supabase Dashboard → Authentication → URL Configuration → Redirect URLs:
//   https://www.habeshaproperties.com/auth/callback
//   http://localhost:3000/auth/callback

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    const res = NextResponse.redirect(new URL('/auth/login?error=missing_code', request.url))
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    return res
  }

  const supabase = createClient()

  const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)
  if (sessionError || !sessionData.user) {
    const res = NextResponse.redirect(new URL('/auth/login?error=exchange_failed', request.url))
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    return res
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
  let redirectPath = '/saved'
  if (role === 'admin') redirectPath = '/admin'
  else if (role === 'agent') redirectPath = '/dashboard'
  else if (role === 'developer') redirectPath = '/dashboard/developer'

  const response = NextResponse.redirect(new URL(redirectPath, request.url))
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
  return response
}
