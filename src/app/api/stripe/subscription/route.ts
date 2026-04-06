import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://habeshaproperties.com'

// USD amounts in cents
const PLAN_PRICES: Record<string, { amount: number; label: string }> = {
  basic:   { amount: 100,  label: 'Basic Plan — 10 listings, 1 featured/month' },
  pro:     { amount: 300,  label: 'Pro Plan — Unlimited listings, 3 featured/month' },
  premium: { amount: 500,  label: 'Premium Plan — Unlimited listings, 10 featured/month' },
}

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  const { plan } = await request.json()

  if (!plan || !PLAN_PRICES[plan]) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  const { amount, label } = PLAN_PRICES[plan]

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Habesha Properties ${label}`,
            description: `Monthly subscription for Habesha Properties agent listing plan`,
          },
          unit_amount: amount,
          recurring: { interval: 'month' },
        },
        quantity: 1,
      }],
      metadata: { user_id: user.id, plan: plan },
      customer_email: user.email,
      success_url: `${APP_URL}/dashboard?subscribed=true&plan=${plan}`,
      cancel_url: `${APP_URL}/pricing`,
    })

    // Update subscription plan after checkout session is created.
    // For production, use a Stripe webhook (checkout.session.completed) instead.
    await supabase
      .from('profiles')
      .update({ subscription_plan: plan })
      .eq('id', user.id)

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('Stripe error:', err)
    return NextResponse.json({ error: err.message || 'Failed to create checkout session' }, { status: 500 })
  }
}
