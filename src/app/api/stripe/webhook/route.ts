import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// Map Stripe price unit_amount (cents) → plan name
const AMOUNT_TO_PLAN: Record<number, string> = {
  100: 'basic',
  300: 'pro',
  500: 'premium',
}

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

  switch (event.type) {

    // ── AI report payment ─────────────────────────────────────────────────
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session

      // Update payment record
      await supabaseAdmin.from('payments')
        .update({
          status: 'completed',
          stripe_payment_intent: session.payment_intent as string,
        })
        .eq('stripe_session_id', session.id)

      const { report_type, property_id, user_id, plan } = session.metadata || {}

      // AI report purchase
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

      // Agent subscription activation — save customer + subscription IDs + period end
      console.log('Webhook metadata:', session.metadata)
      console.log('User ID:', user_id, 'Plan:', plan)
      if (session.mode === 'subscription' && user_id && plan) {
        const sub = await stripe.subscriptions.retrieve(session.subscription as string)
        const { error } = await supabaseAdmin
          .from('profiles')
          .update({
            subscription_plan: plan,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            subscription_cancel_at_period_end: false,
            subscription_current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          })
          .eq('id', user_id)
        console.log('Profile update error:', error)
      }

      console.log('Checkout completed:', session.id, 'type:', session.mode, report_type || plan)
      break
    }

    case 'checkout.session.expired': {
      const session = event.data.object as Stripe.Checkout.Session
      await supabaseAdmin.from('payments')
        .update({ status: 'expired' })
        .eq('stripe_session_id', session.id)
      console.log('Checkout expired:', session.id)
      break
    }

    case 'payment_intent.payment_failed': {
      const intent = event.data.object as Stripe.PaymentIntent
      await supabaseAdmin.from('payments')
        .update({ status: 'failed' })
        .eq('stripe_payment_intent', intent.id)
      console.error('Payment failed:', intent.id, intent.last_payment_error?.message)
      break
    }

    // ── Agent subscription updated (renewal, plan change, cancel_at_period_end) ──
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription

      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('stripe_customer_id', sub.customer as string)
        .single()

      if (!profile) break

      const item = sub.items.data[0]
      const amount = item?.price?.unit_amount ?? 0
      const plan = AMOUNT_TO_PLAN[amount]

      const updates: Record<string, any> = {
        subscription_cancel_at_period_end: sub.cancel_at_period_end,
        stripe_subscription_id: sub.id,
        subscription_current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
      }
      if (plan) updates.subscription_plan = plan

      await supabaseAdmin.from('profiles').update(updates).eq('id', profile.id)
      console.log('Subscription updated for profile', profile.id, updates)
      break
    }

    // ── Subscription cancelled / expired → downgrade to free ──────────────
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription

      // Try by stripe_customer_id first (new flow)
      let profileId: string | null = null
      const { data: byCustomer } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('stripe_customer_id', sub.customer as string)
        .single()
      profileId = byCustomer?.id ?? null

      // Fallback: legacy metadata user_id
      if (!profileId && sub.metadata?.user_id) {
        profileId = sub.metadata.user_id
      }

      if (profileId) {
        await supabaseAdmin
          .from('profiles')
          .update({
            subscription_plan: 'free',
            stripe_subscription_id: null,
            subscription_cancel_at_period_end: false,
            subscription_current_period_end: null,
          })
          .eq('id', profileId)
        console.log('Subscription deleted, downgraded to free:', profileId)
      }

      // Also update legacy agents table if it exists
      if (sub.metadata?.user_id) {
        await supabaseAdmin.from('agents')
          .update({ subscription_plan: 'free', subscription_expires_at: null })
          .eq('profile_id', sub.metadata.user_id)
          // ignore errors if legacy agents table column doesn't exist
      }
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      console.error('Invoice payment failed:', invoice.id, 'customer:', invoice.customer)
      break
    }

    default:
      break
  }

  return NextResponse.json({ received: true }, { status: 200 })
}
