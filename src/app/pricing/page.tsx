import Link from 'next/link'
import { Check, ArrowRight, Sparkles } from 'lucide-react'

export const metadata = {
  title: 'Pricing — Habesha Homes',
  description: 'Transparent pricing for Habesha Homes AI reports and agent plans',
}

const AI_REPORTS = [
  { emoji: '🤖', name: 'AI Assistant', price: 'Free', period: '', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', features: ['Ask any property question', 'Amharic & English', 'Available 24/7', 'On every listing page'] },
  { emoji: '🔍', name: 'Fraud Detection', price: '$49', period: 'per report', color: '#dc2626', bg: '#fef2f2', border: '#fecaca', features: ['Title document analysis', 'Claude Vision AI', '30 second results', 'SAFE/RISKY/FRAUD verdict', 'Red flag details'] },
  { emoji: '📊', name: 'Property Valuation', price: '$25', period: 'per report', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', features: ['ETB & USD pricing', 'Rental yield estimate', 'Investment verdict', 'Market comparison', 'Neighborhood context'] },
  { emoji: '📄', name: 'Contract Analyzer', price: '$9.99', period: 'per contract', color: '#d97706', bg: '#fffbeb', border: '#fde68a', features: ['Full contract review', 'Dangerous clause detection', 'Amharic explanations', 'SIGN/AVOID verdict', 'Negotiation tips'] },
  { emoji: '🏘️', name: 'Neighborhood Report', price: '$14.99', period: 'per area', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe', features: ['Safety score', 'Transport access', 'Flood risk assessment', 'Price trend analysis', '5-year outlook'] },
  { emoji: '🌍', name: 'Diaspora Package', price: '$99', period: 'bundle', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', best: true, features: ['All 4 reports included', 'Remote buying guide', 'Agent connection', 'Priority support', 'Best value for diaspora investors'] },
]

const AGENT_PLANS = [
  {
    name: 'Free', price: 'ETB 0', period: '/month', color: '#888', highlight: false,
    features: ['Up to 3 listings', 'Basic analytics', 'Inquiry management', 'AI assistant for clients', 'Standard support'],
    cta: 'Get started free', href: '/auth/signup',
  },
  {
    name: 'Pro', price: 'ETB 500', period: '/month', color: '#16a34a', highlight: true,
    features: ['Unlimited listings', 'Featured placement', 'AI listing writer', 'Advanced analytics', 'Priority support', 'Verified agent badge'],
    cta: 'Start Pro plan', href: '/contact',
  },
  {
    name: 'Premium', price: 'ETB 1,500', period: '/month', color: '#2563eb', highlight: false,
    features: ['Everything in Pro', 'Homepage featured listing', 'AI reports included', 'Dedicated account manager', 'Custom branding', 'API access'],
    cta: 'Contact us', href: '/contact',
  },
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

      {/* AI Reports */}
      <section style={{ padding: '64px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontSize: 30, fontWeight: 900, color: '#111', margin: '0 0 8px', letterSpacing: '-.02em' }}>AI Reports</h2>
            <p style={{ fontSize: 15, color: '#888', margin: 0 }}>Pay per report — no subscription needed for buyers</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16 }}>
            {AI_REPORTS.map(({ emoji, name, price, period, color, bg, border, features, best }) => (
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

      {/* Agent Plans */}
      <section style={{ padding: '64px 24px', background: '#fff', borderTop: '1px solid #eae9e4' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontSize: 30, fontWeight: 900, color: '#111', margin: '0 0 8px', letterSpacing: '-.02em' }}>Agent Plans</h2>
            <p style={{ fontSize: 15, color: '#888', margin: 0 }}>For real estate agents and agencies listing properties</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 16 }}>
            {AGENT_PLANS.map(({ name, price, period, color, highlight, features, cta, href }) => (
              <div key={name} style={{ background: highlight ? '#0d2318' : '#fff', border: `1px solid ${highlight ? '#0d2318' : '#eae9e4'}`, borderRadius: 16, padding: 24, position: 'relative' }}>
                {highlight && (
                  <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#16a34a', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 14px', borderRadius: 20 }}>
                    MOST POPULAR
                  </div>
                )}
                <div style={{ fontWeight: 800, fontSize: 18, color: highlight ? '#fff' : '#111', marginBottom: 8 }}>{name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 20 }}>
                  <span style={{ fontSize: 30, fontWeight: 900, color: highlight ? '#4ade80' : color }}>{price}</span>
                  <span style={{ fontSize: 13, color: highlight ? 'rgba(255,255,255,0.5)' : '#aaa' }}>{period}</span>
                </div>
                <div style={{ marginBottom: 24 }}>
                  {features.map(f => (
                    <div key={f} style={{ display: 'flex', gap: 8, marginBottom: 8, fontSize: 13, color: highlight ? 'rgba(255,255,255,0.8)' : '#555' }}>
                      <Check size={13} color={highlight ? '#4ade80' : '#16a34a'} style={{ flexShrink: 0, marginTop: 1 }}/>{f}
                    </div>
                  ))}
                </div>
                <Link href={href} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: highlight ? '#16a34a' : '#111', color: '#fff', padding: '11px', borderRadius: 9, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
                  {cta} <ArrowRight size={14}/>
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
            { q: 'Can I get a refund on AI reports?', a: 'AI reports are generated instantly and are non-refundable once processed. If you experience a technical error, contact us and we will regenerate your report at no charge.' },
            { q: 'Do I need an account to buy a report?', a: 'Yes, you need a free account to purchase reports. This allows us to deliver your report and store it in your dashboard for future reference.' },
            { q: 'Are prices in USD or ETB?', a: 'AI reports are priced in USD to accommodate diaspora buyers. Agent plans are priced in ETB. All prices are displayed clearly before payment.' },
            { q: 'How do agent plans work?', a: 'Agent plans are monthly subscriptions billed in ETB. The free plan allows up to 3 listings. Upgrade to Pro for unlimited listings and featured placement. Cancel anytime with no penalty.' },
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
