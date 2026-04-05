import Link from 'next/link'
import { Check, ArrowRight, Sparkles } from 'lucide-react'
import { AgentPlans } from '@/components/pricing/AgentPlans'

export const metadata = {
  title: 'Pricing — Habesha Properties',
  description: 'Transparent pricing for Habesha Properties AI reports and agent plans',
}

const AI_REPORTS = [
  { emoji: '🤖', name: 'AI Assistant', price: 'Free', period: '', color: '#16a34a', features: ['Ask any property question', 'Amharic & English', 'Available 24/7', 'On every listing page'] },
  { emoji: '🔍', name: 'Fraud Detection', price: '$49', period: 'per report', color: '#dc2626', features: ['Title document analysis', 'AI Vision', '30 second results', 'SAFE/RISKY/FRAUD verdict', 'Red flag details'] },
  { emoji: '📊', name: 'Property Valuation', price: '$25', period: 'per report', color: '#2563eb', features: ['ETB & USD pricing', 'Rental yield estimate', 'Investment verdict', 'Market comparison', 'Neighborhood context'] },
  { emoji: '📄', name: 'Contract Analyzer', price: '$9.99', period: 'per contract', color: '#d97706', features: ['Full contract review', 'Dangerous clause detection', 'Amharic explanations', 'SIGN/AVOID verdict', 'Negotiation tips'] },
  { emoji: '🏘️', name: 'Neighborhood Report', price: '$14.99', period: 'per area', color: '#7c3aed', features: ['Safety score', 'Transport access', 'Flood risk assessment', 'Price trend analysis', '5-year outlook'] },
  { emoji: '🌍', name: 'Diaspora Package', price: '$99', period: 'bundle', color: '#16a34a', best: true, features: ['All 4 reports included', 'Remote buying guide', 'Agent connection', 'Priority support', 'Best value for diaspora investors'] },
]

export default function PricingPage() {
  return (
    <div style={{ background: '#fafaf8', minHeight: '100vh' }}>

      {/* Header */}
      <section style={{ background: '#0d2318', padding: '56px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 20, padding: '4px 14px', marginBottom: 20 }}>
            <Sparkles size={12} color="#4ade80"/>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#4ade80' }}>Transparent pricing</span>
          </div>
          <h1 style={{ fontSize: 'clamp(28px,5vw,48px)', fontWeight: 900, color: '#fff', margin: '0 0 14px', letterSpacing: '-.025em' }}>
            Simple, honest pricing
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', margin: 0, maxWidth: 500, marginLeft: 'auto', marginRight: 'auto' }}>
            Pay only for what you use. No hidden fees. Cancel anytime.
          </p>
        </div>
      </section>

      {/* Agent Plans — client component (handles Stripe + bank transfer) */}
      <AgentPlans/>

      {/* AI Reports */}
      <section style={{ padding: '64px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontSize: 30, fontWeight: 900, color: '#111', margin: '0 0 8px', letterSpacing: '-.02em' }}>AI Reports</h2>
            <p style={{ fontSize: 15, color: '#888', margin: 0 }}>Pay per report — no subscription needed for buyers</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16 }}>
            {AI_REPORTS.map(({ emoji, name, price, period, color, features, best }) => (
              <div key={name} style={{ background: '#fff', border: `1px solid ${best ? color : '#eae9e4'}`, borderRadius: 16, padding: 22, position: 'relative', boxShadow: best ? `0 0 0 2px ${color}` : 'none' }}>
                {best && (
                  <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: color, color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 14px', borderRadius: 20, whiteSpace: 'nowrap' }}>
                    BEST VALUE
                  </div>
                )}
                <div style={{ fontSize: 32, marginBottom: 12 }}>{emoji}</div>
                <div style={{ fontWeight: 800, fontSize: 17, color: '#111', marginBottom: 4 }}>{name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 16 }}>
                  <span style={{ fontSize: 28, fontWeight: 900, color }}>{price}</span>
                  {period && <span style={{ fontSize: 13, color: '#aaa' }}>{period}</span>}
                </div>
                <div style={{ marginBottom: 18 }}>
                  {features.map(f => (
                    <div key={f} style={{ display: 'flex', gap: 8, marginBottom: 7, fontSize: 13, color: '#555' }}>
                      <Check size={13} color={color} style={{ flexShrink: 0, marginTop: 1 }}/>{f}
                    </div>
                  ))}
                </div>
                <Link href={price === 'Free' ? '/search' : '/ai-reports'} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: color, color: '#fff', padding: '10px', borderRadius: 9, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                  {price === 'Free' ? 'Try free →' : `Get report — ${price}`}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '64px 24px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <h2 style={{ fontSize: 26, fontWeight: 900, color: '#111', marginBottom: 32, textAlign: 'center', letterSpacing: '-.02em' }}>Pricing FAQ</h2>
          {[
            { q: 'What payment methods do you accept?', a: 'International agents can pay by card (Visa, Mastercard, Amex) via Stripe in USD. Ethiopian agents can pay via CBE bank transfer in ETB. Plan is activated within 24 hours of payment confirmation.' },
            { q: 'What happens if I exceed my listing limit?', a: 'You will see a clear error when you try to add a listing above your plan limit. Upgrade your plan instantly to continue adding listings — no listings are lost.' },
            { q: 'Can I get a refund on AI reports?', a: 'AI reports are generated instantly and are non-refundable once processed. If you experience a technical error, contact us and we will regenerate your report at no charge.' },
            { q: 'How does the Free plan work?', a: 'The Free plan lets you list up to 3 properties and access the basic dashboard and inquiry management. There are no featured placements on the Free plan. Upgrade anytime for more listings and features.' },
            { q: 'Is the AI assistant really free?', a: 'Yes — the AI chat assistant on every property listing page is completely free. Ask any question about pricing, neighborhoods, or the buying process in Amharic or English.' },
          ].map(({ q, a }) => (
            <div key={q} style={{ borderBottom: '1px solid #eae9e4', paddingBottom: 20, marginBottom: 20 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 8 }}>{q}</div>
              <div style={{ fontSize: 14, color: '#666', lineHeight: 1.7 }}>{a}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '56px 24px', background: '#0d2318', textAlign: 'center' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: '#fff', marginBottom: 12, letterSpacing: '-.02em' }}>Ready to get started?</h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', marginBottom: 28 }}>Create a free account and try the AI assistant on any listing.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/auth/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#16a34a', color: '#fff', padding: '13px 28px', borderRadius: 12, fontSize: 15, fontWeight: 700, textDecoration: 'none' }}>
              Create free account <ArrowRight size={15}/>
            </Link>
            <Link href="/ai-reports" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '13px 24px', borderRadius: 12, fontSize: 15, fontWeight: 600, textDecoration: 'none' }}>
              View AI reports
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
