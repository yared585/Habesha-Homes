'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient, getClientUser } from '@/lib/supabase/client'

interface Props {
  reportType: 'fraud_check' | 'valuation' | 'contract' | 'neighborhood' | 'diaspora'
  propertyId?: string
  label?: string
  style?: React.CSSProperties
}

const PRICES: Record<string, string> = {
  fraud_check: '$49',
  valuation: '$25',
  contract: '$9.99',
  neighborhood: '$14.99',
  diaspora: '$99',
}

export function PayButton({ reportType, propertyId, label, style }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handlePay() {
    setLoading(true)

    const sb = createClient()
    const user = await getClientUser()

    if (!user) {
      router.push('/auth/login?redirect=/ai-reports')
      return
    }

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          report_type: reportType,
          property_id: propertyId || null,
          user_id: user.id,
          user_email: user.email,
        }),
      })

      const data = await res.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Payment failed: ' + (data.error || 'Unknown error'))
        setLoading(false)
      }
    } catch (err) {
      console.error('Payment error:', err)
      setLoading(false)
    }
  }

  const price = PRICES[reportType]

  return (
    <button
      onClick={handlePay}
      disabled={loading}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        gap: 8, background: loading ? '#9ca3af' : '#16a34a', color: '#fff',
        border: 'none', padding: '12px 24px', borderRadius: 10, fontSize: 14,
        fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
        transition: 'all .15s', fontFamily: 'inherit', width: '100%',
        ...style,
      }}
      onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = '#15803d' }}
      onMouseLeave={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = '#16a34a' }}
    >
      {loading ? 'Redirecting to payment...' : (label || `Pay ${price} — Get report`)}
    </button>
  )
}
