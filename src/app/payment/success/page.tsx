'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, ArrowRight, Sparkles } from 'lucide-react'
import { Suspense } from 'react'

const REPORT_NAMES: Record<string, string> = {
  fraud_check: 'Title Fraud Detection',
  valuation: 'Property Valuation Report',
  contract: 'Contract Analyzer',
  neighborhood: 'Neighborhood Report',
  diaspora: 'Diaspora Due Diligence Package',
}

function SuccessContent() {
  const params = useSearchParams()
  const reportType = params.get('report_type') || ''
  const reportName = REPORT_NAMES[reportType] || 'AI Report'

  return (
    <div style={{ minHeight: '100vh', background: '#f9f9f7', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>

        {/* Success icon */}
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#f0fdf4', border: '2px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <CheckCircle size={40} color="#16a34a"/>
        </div>

        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#111', marginBottom: 8, letterSpacing: '-.02em' }}>
          Payment successful!
        </h1>
        <p style={{ fontSize: 16, color: '#888', marginBottom: 32, lineHeight: 1.6 }}>
          Your <strong style={{ color: '#111' }}>{reportName}</strong> is being processed. Claude AI will analyze your request and deliver results within minutes.
        </p>

        {/* What happens next */}
        <div style={{ background: '#fff', border: '1px solid #eae9e4', borderRadius: 16, padding: 24, marginBottom: 24, textAlign: 'left' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 16 }}>What happens next</div>
          {[
            { step: '01', text: 'Claude AI processes your request' },
            { step: '02', text: 'Report delivered to your dashboard' },
            { step: '03', text: 'Email notification when ready' },
          ].map(({ step, text }) => (
            <div key={step} style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#16a34a', minWidth: 24 }}>{step}</span>
              <span style={{ fontSize: 14, color: '#555' }}>{text}</span>
            </div>
          ))}
          <div style={{ marginTop: 16, padding: '10px 14px', background: '#f0fdf4', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#15803d' }}>
            <Sparkles size={14}/> Most reports are ready in under 2 minutes
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#16a34a', color: '#fff', padding: '12px 24px', borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
            Go to dashboard <ArrowRight size={14}/>
          </Link>
          <Link href="/search" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#fff', color: '#555', border: '1px solid #eae9e4', padding: '12px 20px', borderRadius: 10, fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>
            Browse properties
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#aaa' }}>Loading...</div>}>
      <SuccessContent/>
    </Suspense>
  )
}
