'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, ArrowRight, CreditCard, Building2, X, MessageCircle } from 'lucide-react'

type Plan = {
  name: string
  planKey: string
  etb: string
  usd: string | null
  period: string
  badge: string | null
  cardBg: string
  cardBorder: string
  nameCo: string
  priceCo: string
  subpriceCo: string
  featureCo: string
  checkCo: string
  free?: boolean
  features: string[]
}

const PLANS: Plan[] = [
  {
    name: 'Free', planKey: 'free', etb: 'ETB 0', usd: null, period: '/month',
    badge: null,
    cardBg: '#fff', cardBorder: '#e5e4df',
    nameCo: '#111', priceCo: '#888', subpriceCo: '#bbb', featureCo: '#555', checkCo: '#16a34a',
    free: true,
    features: ['3 listings max', 'No featured listings', 'Basic dashboard', 'Inquiry management', 'AI assistant for clients'],
  },
  {
    name: 'Basic', planKey: 'basic', etb: 'ETB 100', usd: '$1', period: '/month',
    badge: null,
    cardBg: '#fff', cardBorder: '#1a3d2b',
    nameCo: '#111', priceCo: '#1a3d2b', subpriceCo: '#888', featureCo: '#555', checkCo: '#1a3d2b',
    features: ['10 listings', '1 featured listing/month', 'Analytics dashboard', 'Inquiry management', 'Email support'],
  },
  {
    name: 'Pro', planKey: 'pro', etb: 'ETB 500', usd: '$3', period: '/month',
    badge: 'MOST POPULAR',
    cardBg: '#1a3d2b', cardBorder: '#1a3d2b',
    nameCo: '#fff', priceCo: '#4ade80', subpriceCo: 'rgba(255,255,255,0.45)', featureCo: 'rgba(255,255,255,0.82)', checkCo: '#4ade80',
    features: ['Unlimited listings', '3 featured listings/month', 'Priority support', 'AI listing writer', 'Advanced analytics', 'Verified agent badge'],
  },
  {
    name: 'Premium', planKey: 'premium', etb: 'ETB 1,000', usd: '$5', period: '/month',
    badge: null,
    cardBg: '#fff', cardBorder: '#f59e0b',
    nameCo: '#111', priceCo: '#b45309', subpriceCo: '#888', featureCo: '#555', checkCo: '#d97706',
    features: ['Unlimited listings', '10 featured listings/month', 'Priority support', 'Dedicated account manager', 'AI tools unlimited', 'Custom branding'],
  },
]

function BankTransferModal({ plan, onClose }: { plan: Plan; onClose: () => void }) {
  const [notified, setNotified] = useState(false)
  const [sending, setSending] = useState(false)
  const [agentName, setAgentName] = useState('')
  const [agentEmail, setAgentEmail] = useState('')

  async function notifyAdmin() {
    if (!agentName || !agentEmail) { alert('Please enter your name and email'); return }
    setSending(true)
    await fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'bank_transfer_notify',
        to: 'yohanesy585@gmail.com',
        data: { agentName, agentEmail, plan: plan.name, planEtb: plan.etb },
      }),
    }).catch(() => {})
    setSending(false)
    setNotified(true)
  }

  const whatsappMsg = encodeURIComponent(`Hi, I've sent a bank transfer for the ${plan.name} plan (${plan.etb}/month). My email is: ${agentEmail || '[your email]'}. Please activate my account. Thank you!`)

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ background: '#fff', borderRadius: 20, padding: '32px 28px', maxWidth: 480, width: '100%', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
        <button onClick={onClose}
          style={{ position: 'absolute', top: 14, right: 14, background: '#f5f5f2', border: 'none', borderRadius: 8, padding: '6px 7px', cursor: 'pointer', display: 'flex', alignItems: 'center', lineHeight: 1 }}>
          <X size={16} color="#888"/>
        </button>

        <div style={{ fontSize: 21, fontWeight: 800, color: '#111', marginBottom: 2 }}>Pay via Bank Transfer</div>
        <div style={{ fontSize: 14, color: '#888', marginBottom: 24 }}>{plan.name} plan · {plan.etb}/month</div>

        {/* Bank details box */}
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '16px 18px', marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#15803d', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 12 }}>Bank Details</div>
          {[
            { label: 'Bank', value: 'Commercial Bank of Ethiopia (CBE)' },
            { label: 'Account Name', value: 'Habesha Properties' },
            { label: 'Account Number', value: '1000XXXXXXXXXX' },
            { label: 'Amount', value: `${plan.etb}/month` },
            { label: 'Reference', value: `${plan.name} Plan – ${agentEmail || 'your email'}` },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', gap: 10, marginBottom: 7, fontSize: 13 }}>
              <span style={{ color: '#888', width: 110, flexShrink: 0 }}>{label}</span>
              <span style={{ fontWeight: 600, color: '#111' }}>{value}</span>
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div style={{ background: '#f9f9f7', border: '1px solid #eae9e4', borderRadius: 10, padding: '14px 16px', marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 10 }}>Instructions</div>
          {[
            'Send exact amount to the account above',
            'Take a screenshot of the transfer confirmation',
            'Email screenshot to yohanesy585@gmail.com',
            'Include your email and plan name in the message',
            'We activate your plan within 24 hours',
          ].map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 7, fontSize: 13, color: '#555' }}>
              <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#1a3d2b', color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
              {step}
            </div>
          ))}
        </div>

        {!notified ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input placeholder="Your full name" value={agentName} onChange={e => setAgentName(e.target.value)}
              style={{ padding: '11px 14px', border: '1.5px solid #e0dfd9', borderRadius: 9, fontSize: 14, outline: 'none', fontFamily: 'inherit' }}
              onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#1a3d2b'}
              onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#e0dfd9'}
            />
            <input type="email" placeholder="Your email address" value={agentEmail} onChange={e => setAgentEmail(e.target.value)}
              style={{ padding: '11px 14px', border: '1.5px solid #e0dfd9', borderRadius: 9, fontSize: 14, outline: 'none', fontFamily: 'inherit' }}
              onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#1a3d2b'}
              onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#e0dfd9'}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={notifyAdmin} disabled={sending}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: sending ? '#9ca3af' : '#1a3d2b', color: '#fff', border: 'none', padding: '12px', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: sending ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
              >
                {sending ? 'Sending...' : "I've sent payment — notify admin"}
              </button>
              <a href={`https://wa.me/251911000000?text=${whatsappMsg}`} target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#25d366', color: '#fff', padding: '12px 14px', borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}
              >
                <MessageCircle size={15}/> WhatsApp
              </a>
            </div>
          </div>
        ) : (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '20px 18px', textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>✓</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#15803d', marginBottom: 6 }}>Admin notified!</div>
            <div style={{ fontSize: 13, color: '#555', lineHeight: 1.6 }}>
              We'll activate your <strong>{plan.name}</strong> plan within 24 hours after confirming your payment.
              <br/>You'll receive a confirmation email at <strong>{agentEmail}</strong>.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function AgentPlans() {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [stripeLoading, setStripeLoading] = useState<string | null>(null)
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  async function handleStripe(plan: Plan) {
    setStripeLoading(plan.planKey)
    const res = await fetch('/api/stripe/subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: plan.planKey }),
    })
    const { url, error } = await res.json()
    if (error) { alert(error); setStripeLoading(null); return }
    window.location.href = url
  }

  return (
    <>
      {selectedPlan && <BankTransferModal plan={selectedPlan} onClose={() => setSelectedPlan(null)}/>}

      <style>{`
        .plan-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
        }
        @media (max-width: 1024px) {
          .plan-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .plan-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <section style={{ padding: '64px 24px 56px', background: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>

          {/* Section header */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <h2 style={{ fontSize: 'clamp(24px,4vw,34px)', fontWeight: 900, color: '#111', margin: '0 0 8px', letterSpacing: '-.025em' }}>
              Agent Plans
            </h2>
            <p style={{ fontSize: 15, color: '#888', margin: '0 0 18px' }}>
              For real estate agents and agencies listing properties
            </p>
            {/* Launch special banner */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '10px 20px' }}>
              <span style={{ fontSize: 16 }}>🎉</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#15803d' }}>
                Launch special — prices will increase as we grow. Lock in your rate today!
              </span>
            </div>
          </div>

          {/* Plan cards */}
          <div className="plan-grid">
            {PLANS.map(plan => {
              const hovered = hoveredCard === plan.name
              const isPro = plan.planKey === 'pro'

              return (
                <div key={plan.name}
                  onMouseEnter={() => setHoveredCard(plan.name)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{
                    background: plan.cardBg,
                    border: `2px solid ${plan.cardBorder}`,
                    borderRadius: 18,
                    padding: '26px 22px',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform .2s, box-shadow .2s',
                    transform: hovered && !isPro ? 'translateY(-4px)' : isPro ? 'translateY(-6px)' : 'none',
                    boxShadow: isPro
                      ? '0 12px 40px rgba(26,61,43,0.35)'
                      : hovered ? '0 8px 28px rgba(0,0,0,0.12)' : '0 2px 8px rgba(0,0,0,0.05)',
                    marginTop: isPro ? -6 : 0,
                  }}
                >
                  {/* Badge */}
                  {plan.badge && (
                    <div style={{
                      position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)',
                      background: '#16a34a', color: '#fff',
                      fontSize: 10, fontWeight: 800, padding: '4px 14px', borderRadius: 20,
                      letterSpacing: '.06em', whiteSpace: 'nowrap',
                    }}>
                      {plan.badge}
                    </div>
                  )}

                  {/* Plan name */}
                  <div style={{ fontSize: 16, fontWeight: 800, color: plan.nameCo, marginBottom: 6, letterSpacing: '-.01em' }}>
                    {plan.name}
                  </div>

                  {/* Price */}
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 2 }}>
                    <span style={{ fontSize: 26, fontWeight: 900, color: plan.priceCo, letterSpacing: '-.02em' }}>{plan.etb}</span>
                    <span style={{ fontSize: 13, color: plan.subpriceCo }}>{plan.period}</span>
                  </div>
                  <div style={{ fontSize: 12, color: plan.subpriceCo, marginBottom: 20, minHeight: 18 }}>
                    {plan.usd ? `or ${plan.usd}/month via card` : ''}
                  </div>

                  {/* Features */}
                  <div style={{ flex: 1, marginBottom: 22 }}>
                    {plan.features.map(f => (
                      <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 9, fontSize: 13, color: plan.featureCo, lineHeight: 1.45 }}>
                        <Check size={13} color={plan.checkCo} style={{ flexShrink: 0, marginTop: 1 }}/>
                        {f}
                      </div>
                    ))}
                  </div>

                  {/* CTA buttons */}
                  {plan.free ? (
                    <Link href="/auth/signup"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#1a3d2b', color: '#fff', padding: '12px', borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}
                    >
                      Get started free <ArrowRight size={14}/>
                    </Link>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {/* Stripe / card */}
                      <button
                        onClick={() => handleStripe(plan)}
                        disabled={stripeLoading === plan.planKey}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                          background: isPro ? '#4ade80' : '#1a3d2b',
                          color: isPro ? '#0d2318' : '#fff',
                          padding: '11px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                          border: 'none', cursor: stripeLoading === plan.planKey ? 'not-allowed' : 'pointer',
                          fontFamily: 'inherit', opacity: stripeLoading === plan.planKey ? 0.65 : 1,
                          transition: 'opacity .15s',
                        }}
                      >
                        <CreditCard size={13}/>
                        {stripeLoading === plan.planKey ? 'Redirecting...' : `Pay ${plan.usd}/mo · Card`}
                      </button>

                      {/* Bank transfer */}
                      <button
                        onClick={() => setSelectedPlan(plan)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                          background: 'transparent',
                          color: isPro ? 'rgba(255,255,255,0.75)' : '#555',
                          padding: '10px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                          border: `1px solid ${isPro ? 'rgba(255,255,255,0.25)' : '#d1d5db'}`,
                          cursor: 'pointer', fontFamily: 'inherit',
                          transition: 'background .15s',
                        }}
                        onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = isPro ? 'rgba(255,255,255,0.08)' : '#f9f9f7'}
                        onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}
                      >
                        <Building2 size={13}/> Pay {plan.etb}/mo · Bank transfer
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}
