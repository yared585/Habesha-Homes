import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error('Webhook signature error:', err.message)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    // Update payment status to completed
    await supabaseAdmin.from('payments')
      .update({
        status: 'completed',
        stripe_payment_intent: session.payment_intent as string,
      })
      .eq('stripe_session_id', session.id)

    // Create the AI report record
    const { report_type, property_id, user_id } = session.metadata || {}

    if (user_id && report_type) {
      await supabaseAdmin.from('ai_reports').insert({
        user_id,
        report_type,
        property_id: property_id || null,
        is_paid: true,
        status: 'pending',
        created_at: new Date().toISOString(),
      })
    }

    console.log('Payment completed:', session.id, report_type)
  }

  return NextResponse.json({ received: true })
}
