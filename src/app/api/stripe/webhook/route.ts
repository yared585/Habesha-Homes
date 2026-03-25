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

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session

      await supabaseAdmin.from('payments')
        .update({
          status: 'completed',
          stripe_payment_intent: session.payment_intent as string,
        })
        .eq('stripe_session_id', session.id)

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

      // Find the payment record via payment intent ID and mark failed
      await supabaseAdmin.from('payments')
        .update({ status: 'failed' })
        .eq('stripe_payment_intent', intent.id)

      console.error('Payment failed:', intent.id, intent.last_payment_error?.message)
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const userId = subscription.metadata?.user_id

      if (userId) {
        await supabaseAdmin.from('agents')
          .update({ subscription_plan: 'free', subscription_expires_at: null })
          .eq('profile_id', userId)

        console.log('Subscription cancelled, downgraded to free:', userId)
      }
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      console.error('Invoice payment failed:', invoice.id, 'customer:', invoice.customer)
      // TODO: notify user via email (use Resend) and apply grace period logic
      break
    }

    default:
      // Unhandled event — safe to ignore
      break
  }

  return NextResponse.json({ received: true })
}
