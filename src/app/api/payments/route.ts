// src/app/api/payments/route.ts
// Handles Stripe (international) and Telebirr (Ethiopia) payments

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

const USD_TO_ETB = parseFloat(process.env.USD_TO_ETB_RATE || '56.5')

// ---- Stripe Payment Intent ----
export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  const body = await request.json()
  const { payment_type, reference_id, currency = 'USD', gateway = 'stripe' } = body

  try {
    // Determine amount based on payment type
    const pricing = getPricing(payment_type, currency)
    if (!pricing) {
      return NextResponse.json({ error: 'Invalid payment type' }, { status: 400 })
    }

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        amount_usd: pricing.usd,
        amount_etb: pricing.etb,
        currency,
        payment_type,
        reference_id,
        description: pricing.description,
        gateway,
        status: 'pending',
        metadata: { reference_id }
      })
      .select()
      .single()

    if (paymentError) throw paymentError

    if (gateway === 'stripe') {
      return handleStripePayment(payment, pricing, user.id, currency)
    } else if (gateway === 'telebirr') {
      return handleTelebirrPayment(payment, pricing, body.phone_number)
    }

    return NextResponse.json({ error: 'Unknown gateway' }, { status: 400 })

  } catch (error) {
    console.error('Payment error:', error)
    return NextResponse.json({ error: 'Payment initialization failed' }, { status: 500 })
  }
}

async function handleStripePayment(
  payment: any,
  pricing: ReturnType<typeof getPricing>,
  userId: string,
  currency: string
) {
  if (!pricing) return NextResponse.json({ error: 'Invalid pricing' }, { status: 400 })

  // Amount in cents for Stripe
  const amount = currency === 'USD'
    ? Math.round(pricing.usd * 100)
    : Math.round(pricing.etb * 100) // ETB doesn't use cents but Stripe requires integer

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: currency.toLowerCase(),
    metadata: {
      payment_id: payment.id,
      user_id: userId,
      payment_type: payment.payment_type,
    },
    automatic_payment_methods: { enabled: true },
  })

  // Update payment with Stripe ID
  const supabase = createClient()
  await supabase
    .from('payments')
    .update({ gateway_payment_id: paymentIntent.id })
    .eq('id', payment.id)

  return NextResponse.json({
    payment_id: payment.id,
    client_secret: paymentIntent.client_secret,
    gateway: 'stripe',
  })
}

async function handleTelebirrPayment(
  payment: any,
  pricing: ReturnType<typeof getPricing>,
  phoneNumber: string
) {
  if (!pricing) return NextResponse.json({ error: 'Invalid pricing' }, { status: 400 })

  // Telebirr API integration
  // Based on Telebirr H5Pay API
  try {
    const telebirrPayload = {
      appId: process.env.TELEBIRR_APP_ID || '',
      appKey: process.env.TELEBIRR_APP_KEY || '',
      shortCode: process.env.TELEBIRR_SHORT_CODE || '',
      outTradeNo: payment.id,
      subject: payment.description || 'Habesha Properties Payment',
      totalAmount: pricing.etb.toString(),
      timeoutExpress: '30',
      notifyUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/telebirr-webhook`,
      returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?payment_id=${payment.id}`,
      receiverIdentifier: phoneNumber,
      nonce: Math.random().toString(36).substring(7),
      timestamp: Date.now().toString(),
    }

    // Sign the request (Telebirr requires RSA signature)
    // In production, implement proper RSA signing with your private key
    const signedPayload = await signTelebirrRequest(telebirrPayload)

    // Update payment record
    const supabase = createClient()
    await supabase
      .from('payments')
      .update({ gateway_payment_id: payment.id, gateway_status: 'pending' })
      .eq('id', payment.id)

    return NextResponse.json({
      payment_id: payment.id,
      gateway: 'telebirr',
      telebirr_payload: signedPayload,
      amount_etb: pricing.etb,
    })
  } catch (error) {
    console.error('Telebirr error:', error)
    return NextResponse.json({ error: 'Telebirr initialization failed' }, { status: 500 })
  }
}

async function signTelebirrRequest(payload: Record<string, string>) {
  // Production: use your Telebirr private key to sign
  // This is a placeholder — replace with actual Telebirr signing logic
  const sortedParams = Object.keys(payload)
    .sort()
    .map(key => `${key}=${payload[key]}`)
    .join('&')

  return {
    ...payload,
    sign: Buffer.from(sortedParams).toString('base64'), // Replace with RSA signing
    signType: 'SHA256WithRSA'
  }
}

function getPricing(paymentType: string, currency: string) {
  const prices: Record<string, { usd: number; etb: number; description: string }> = {
    'ai_report_valuation': {
      usd: 25,
      etb: Math.round(25 * USD_TO_ETB),
      description: 'AI Property Valuation Report'
    },
    'ai_report_fraud_check': {
      usd: 49,
      etb: Math.round(49 * USD_TO_ETB),
      description: 'Title Document Fraud Check'
    },
    'ai_report_contract': {
      usd: 19.99,
      etb: Math.round(19.99 * USD_TO_ETB),
      description: 'Contract Danger Analysis'
    },
    'ai_report_neighborhood': {
      usd: 14.99,
      etb: Math.round(14.99 * USD_TO_ETB),
      description: 'Neighborhood Intelligence Report'
    },
    'featured_listing': {
      usd: 50,
      etb: Math.round(50 * USD_TO_ETB),
      description: 'Featured Property Listing (30 days)'
    },
    'due_diligence': {
      usd: 99,
      etb: Math.round(99 * USD_TO_ETB),
      description: 'Full Due Diligence Package'
    },
    'agent_subscription_basic': {
      usd: 29,
      etb: Math.round(29 * USD_TO_ETB),
      description: 'Basic Agent Subscription (Monthly)'
    },
    'agent_subscription_pro': {
      usd: 59,
      etb: Math.round(59 * USD_TO_ETB),
      description: 'Pro Agent Subscription (Monthly)'
    },
    'agent_subscription_enterprise': {
      usd: 149,
      etb: Math.round(149 * USD_TO_ETB),
      description: 'Enterprise Agent Subscription (Monthly)'
    },
  }
  return prices[paymentType] || null
}