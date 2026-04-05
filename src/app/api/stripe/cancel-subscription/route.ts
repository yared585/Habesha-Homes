import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })

export async function POST(_request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  // Fetch stripe_subscription_id from profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_subscription_id, subscription_plan')
    .eq('id', user.id)
    .single()

  if (!profile?.stripe_subscription_id) {
    return NextResponse.json({ error: 'No active Stripe subscription found' }, { status: 404 })
  }

  try {
    // Set cancel_at_period_end — keeps access until end of current billing period
    const subscription = await stripe.subscriptions.update(profile.stripe_subscription_id, {
      cancel_at_period_end: true,
    })

    const cancelAt = new Date(subscription.current_period_end * 1000).toISOString()

    // Mark cancellation pending in profiles
    await supabase
      .from('profiles')
      .update({ subscription_cancel_at_period_end: true })
      .eq('id', user.id)

    return NextResponse.json({
      cancelled: true,
      access_until: cancelAt,
      message: `Your plan will stay active until ${new Date(subscription.current_period_end * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}, then downgrade to Free.`,
    })
  } catch (err: any) {
    console.error('Stripe cancel error:', err)
    return NextResponse.json({ error: err.message || 'Failed to cancel subscription' }, { status: 500 })
  }
}
