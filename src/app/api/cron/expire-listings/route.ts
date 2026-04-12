// Runs daily — marks active listings as expired when expires_at has passed,
// and sends a 7-day warning email to agents whose listing is expiring soon.
// Triggered by Vercel Cron. Protected by CRON_SECRET.

export const runtime = 'nodejs'
export const maxDuration = 60

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = 'Habesha Properties <noreply@habeshaproperties.com>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://habeshaproperties.com'

async function run() {
  const supabase = createClient()
  const now = new Date().toISOString()

  // ── 1. Expire overdue listings ─────────────────────────────────────────────
  const { data: expired, error: expireError } = await supabase
    .from('properties')
    .update({ status: 'expired', updated_at: now })
    .eq('status', 'active')
    .lt('expires_at', now)
    .select('id, title, owner_id')

  if (expireError) throw new Error('Expire query failed: ' + expireError.message)

  // ── 2. Find listings expiring in 7 days — send warning email ──────────────
  const in7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  const in6Days = new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString()

  const { data: expiringSoon } = await supabase
    .from('properties')
    .select('id, title, expires_at, owner_id, profiles:owner_id(full_name, email)')
    .eq('status', 'active')
    .gte('expires_at', in6Days)
    .lte('expires_at', in7Days)

  const warningsSent: string[] = []

  for (const p of expiringSoon || []) {
    const profile = p.profiles as any
    if (!profile?.email) continue

    const daysLeft = Math.ceil((new Date(p.expires_at).getTime() - Date.now()) / 86_400_000)

    await resend.emails.send({
      from: FROM,
      to: profile.email,
      subject: `Your listing "${p.title}" expires in ${daysLeft} days`,
      html: `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f9f9f7;font-family:system-ui,-apple-system,sans-serif;">
<div style="max-width:560px;margin:0 auto;padding:32px 16px;">
  <div style="background:#0d2318;border-radius:14px 14px 0 0;padding:28px 32px;text-align:center;">
    <h1 style="color:#fff;font-size:22px;font-weight:800;margin:0 0 6px;">Listing Expiring Soon ⏰</h1>
    <p style="color:rgba(255,255,255,0.6);font-size:14px;margin:0;">Action required to keep your listing live</p>
  </div>
  <div style="background:#fff;padding:32px;border:1px solid #eae9e4;border-top:none;">
    <p style="font-size:15px;color:#333;margin:0 0 16px;">Hi <strong>${profile.full_name || 'Agent'}</strong>,</p>
    <p style="font-size:15px;color:#333;margin:0 0 24px;">
      Your listing will expire in <strong>${daysLeft} day${daysLeft !== 1 ? 's' : ''}</strong>. Renew it from your dashboard to keep it visible to buyers.
    </p>
    <div style="background:#fef9ec;border:1px solid #fde68a;border-radius:10px;padding:16px;margin-bottom:24px;">
      <div style="font-size:16px;font-weight:700;color:#111;">${p.title}</div>
      <div style="font-size:13px;color:#d97706;margin-top:4px;">Expires ${new Date(p.expires_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
    </div>
    <div style="text-align:center;">
      <a href="${APP_URL}/dashboard" style="display:inline-block;background:#16a34a;color:#fff;padding:13px 32px;border-radius:10px;font-size:15px;font-weight:700;text-decoration:none;">
        Renew listing →
      </a>
    </div>
  </div>
  <div style="background:#f9f9f7;border:1px solid #eae9e4;border-top:none;border-radius:0 0 14px 14px;padding:16px 32px;text-align:center;">
    <p style="font-size:12px;color:#aaa;margin:0;">Habesha Properties · <a href="${APP_URL}" style="color:#16a34a;">${APP_URL}</a></p>
  </div>
</div>
</body></html>`,
    }).catch(() => { /* non-critical */ })

    warningsSent.push(p.id)
  }

  return {
    expired: expired?.length ?? 0,
    expiredIds: expired?.map(p => p.id) ?? [],
    warningsSent: warningsSent.length,
    timestamp: now,
  }
}

export async function GET(req: NextRequest) {
  const secret = req.headers.get('authorization')?.replace('Bearer ', '')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const result = await run()
    return NextResponse.json(result)
  } catch (err: any) {
    console.error('expire-listings cron error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// Allow manual trigger from admin panel
export async function POST(req: NextRequest) {
  const secret = req.headers.get('authorization')?.replace('Bearer ', '')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const result = await run()
    return NextResponse.json(result)
  } catch (err: any) {
    console.error('expire-listings cron error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
