import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const PRODUCTS = {
  fraud_check: { name: 'Title Fraud Detection', price: 4900, description: 'AI-powered title document fraud check — 30 second results' },
  valuation: { name: 'Property Valuation Report', price: 2500, description: 'Instant AI valuation with rental yield and investment verdict' },
  contract: { name: 'Contract Analyzer', price: 999, description: 'Claude reads your contract and highlights dangerous clauses' },
  neighborhood: { name: 'Neighborhood Report', price: 1499, description: 'Safety, transport, flood risk and investment outlook' },
  diaspora: { name: 'Diaspora Due Diligence Package', price: 9900, description: 'Full due diligence bundle — fraud check, valuation, contract, neighborhood' },
}

export async function POST(req: NextRequest) {
  try {
    const { report_type, property_id, user_id, user_email } = await req.json()

    const product = PRODUCTS[report_type as keyof typeof PRODUCTS]
    if (!product) return NextResponse.json({ error: 'Invalid report type' }, { status: 400 })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://habesha-homes.vercel.app'

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.name,
            description: product.description,
            images: ['https://habesha-homes.vercel.app/og-image.png'],
          },
          unit_amount: product.price,
        },
        quantity: 1,
      }],
      mode: 'payment',
      customer_email: user_email,
      success_url: `${appUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}&report_type=${report_type}`,
      cancel_url: `${appUrl}/payment/cancel`,
      metadata: {
        report_type,
        property_id: property_id || '',
        user_id: user_id || '',
      },
    })

    // Save pending payment to database
    if (user_id) {
      await supabaseAdmin.from('payments').insert({
        user_id,
        report_type,
        amount_usd: product.price / 100,
        stripe_session_id: session.id,
        status: 'pending',
        property_id: property_id || null,
      })
    }

    return NextResponse.json({ url: session.url, session_id: session.id })
  } catch (err: any) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
