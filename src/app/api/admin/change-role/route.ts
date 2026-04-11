import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(req: NextRequest) {
  // Verify requester is authenticated
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify requester is admin (server-side check)
  const { data: adminProfile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (adminProfile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { targetUserId, newRole } = await req.json()
  if (!targetUserId || !newRole) {
    return NextResponse.json({ error: 'Missing targetUserId or newRole' }, { status: 400 })
  }

  const validRoles = ['admin', 'agent', 'buyer']
  if (!validRoles.includes(newRole)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  }

  // Fetch current role + name for the audit record
  const { data: target } = await supabaseAdmin
    .from('profiles')
    .select('role, full_name, email')
    .eq('id', targetUserId)
    .single()

  const oldRole = target?.role ?? 'unknown'

  // Apply the role change
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ role: newRole })
    .eq('id', targetUserId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Write audit log — non-critical, ignore if table doesn't exist yet
  try {
    await supabaseAdmin.from('audit_logs').insert({
      admin_id: user.id,
      action: 'role_change',
      target_user_id: targetUserId,
      old_value: oldRole,
      new_value: newRole,
      metadata: {
        target_name: target?.full_name ?? null,
        target_email: target?.email ?? null,
      },
    })
  } catch {
    // Table not yet created — role change still succeeds
  }

  return NextResponse.json({ success: true, oldRole, newRole })
}
