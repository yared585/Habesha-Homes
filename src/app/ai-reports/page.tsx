import Link from 'next/link'
import { PayButton } from '@/components/ui/PayButton'
import { ArrowRight, Shield, TrendingUp, FileText, MessageCircle, Map, Sparkles } from 'lucide-react'

export const metadata = { title: 'AI Reports — Habesha Properties' }

const REPORTS = [
  {
    icon: '🤖', title: 'AI Property Assistant', amh: 'አማርኛ AI ረዳት',
    desc: 'Ask any question about any property in Amharic or English. AI answers 24/7 with full property context — pricing, neighborhood, legal steps, diaspora buying.',
    price: 'Free', priceNote: 'Available on every property page',
    color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0',
    features: ['Amharic & English', 'Streaming responses', '24/7 availability', 'Full property context'],
    href: '/search',
    btnLabel: 'Browse properties',
  },
  {
    icon: '🔍', title: 'Title Fraud Detector', amh: 'ማጭበርበር መፈለጊያ',
    desc: 'Upload a photo of any title document. AI Vision analyzes stamps, signatures, ownership chain, and registration details. Returns SAFE / RISKY / FRAUD verdict with specific red flags.',
    price: '$49', priceNote: 'Per document check',
    color: '#dc2626', bg: '#fef2f2', border: '#fecaca',
    features: ['AI Vision', '30 second results', 'Red flag details', 'Confidence score'],
    href: '/contact',
    btnLabel: 'Order fraud check',
    id: 'fraud',
  },
  {
    icon: '📊', title: 'Property Valuation', amh: 'AI ዋጋ ግምት',
    desc: 'Instant professional valuation based on neighborhood data, comparable sales, size, and amenities. Shows price range in ETB and USD, rental yield, and investment recommendation.',
    price: '$25', priceNote: 'Per property report',
    color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe',
    features: ['ETB & USD pricing', 'Rental yield calc', 'Investment verdict', 'Market comparison'],
    href: '/contact',
    btnLabel: 'Order valuation',
    id: 'valuation',
  },
  {
    icon: '📄', title: 'Contract Analyzer', amh: 'ውል ፈታኝ',
    desc: 'Upload any lease or sale contract. AI reads every clause and highlights dangerous ones in Amharic — illegal rent increases, waived eviction rights, hidden fees. SIGN / NEGOTIATE / AVOID verdict.',
    price: '$9.99', priceNote: 'Per contract',
    color: '#d97706', bg: '#fffbeb', border: '#fde68a',
    features: ['Amharic explanations', 'Danger highlighting', 'SIGN/AVOID verdict', 'Negotiation tips'],
    href: '/contact',
    btnLabel: 'Analyze contract',
    id: 'contract',
  },
  {
    icon: '🏘️', title: 'Neighborhood Report', amh: 'ሰፈር ሪፖርት',
    desc: 'Full neighborhood intelligence for any area in Addis Ababa — safety score, transport access, flood risk, amenity density, price trends, and 5-year investment outlook.',
    price: '$14.99', priceNote: 'Per neighborhood',
    color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe',
    features: ['Safety score', 'Flood risk map', 'Price trends', 'Investment outlook'],
    href: '/contact',
    btnLabel: 'Order report',
  },
  {
    icon: '🌍', title: 'Diaspora Package', amh: 'ዲያስፖራ ጥቅል',
    desc: 'Everything needed to buy Ethiopian property from abroad — fraud check, valuation, contract analysis, neighborhood report, and remote buying guide. Best value for diaspora investors.',
    price: '$99', priceNote: 'Full due diligence bundle',
    color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0',
    features: ['All 4 reports included', 'Remote buying guide', 'Agent connection', 'Priority support'],
    href: '/diaspora',
    btnLabel: 'Get diaspora package',
  },
]

export default function AIReportsPage() {
  return (
    <div>
      {/* Hero */}
      <section style={{ background: '#fff', borderBottom: '1px solid #eae9e4', padding: '64px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 20, padding: '5px 14px', marginBottom: 20 }}>
            <Sparkles size={12} color="#16a34a"/>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#15803d' }}>AI-powered reports</span>
          </div>
          <h1 style={{ fontSize: 'clamp(32px,5vw,52px)', fontWeight: 900, color: '#111', margin: '0 0 16px', letterSpacing: '-.025em' }}>
            AI-powered property intelligence
          </h1>
          <p style={{ fontSize: 17, color: '#666', maxWidth: 540, margin: '0 auto 32px', lineHeight: 1.7 }}>
            Professional fraud detection, valuations, and contract analysis — in Amharic and English. Available 24/7.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/search" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#16a34a', color: '#fff', padding: '12px 24px', borderRadius: 12, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
              Try AI chat free <ArrowRight size={14}/>
            </Link>
            <Link href="/diaspora" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '12px 20px', borderRadius: 12, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
              Diaspora package — $99
            </Link>
          </div>
        </div>
      </section>

      {/* Reports grid */}
      <section style={{ padding: '80px 24px', background: '#fafaf8' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 20 }}>
            {REPORTS.map(({ icon, title, amh, desc, price, priceNote, color, bg, border, features, href, btnLabel, id }) => (
              <div key={title} id={id} style={{ background: '#fff', border: '1px solid #eae9e4', borderRadius: 18, padding: 26, display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: 36, marginBottom: 14 }}>{icon}</div>
                <div style={{ fontWeight: 800, fontSize: 18, color: '#111', marginBottom: 3 }}>{title}</div>
                <div style={{ fontSize: 13, color: '#aaa', marginBottom: 14 }}>{amh}</div>
                <div style={{ fontSize: 14, color: '#555', lineHeight: 1.7, marginBottom: 18, flex: 1 }}>{desc}</div>

                {/* Features */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                  {features.map(f => (
                    <span key={f} style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: bg, color, border: `1px solid ${border}` }}>{f}</span>
                  ))}
                </div>

                {/* Price */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 16 }}>
                  <span style={{ fontSize: 28, fontWeight: 900, color }}>{price}</span>
                  <span style={{ fontSize: 12, color: '#aaa' }}>{priceNote}</span>
                </div>

                {price === 'Free' ? (
                  <Link href={href} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: color, color: '#fff', padding: '12px', borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
                    {btnLabel} <ArrowRight size={14}/>
                  </Link>
                ) : (
                  <PayButton reportType={id as any || 'fraud_check'} label={`${btnLabel} — ${price}`} style={{ background: color }}/>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How AI works */}
      <section style={{ padding: '80px 24px', background: '#fff', borderTop: '1px solid #eae9e4' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: 32, fontWeight: 900, color: '#111', margin: '0 0 14px', letterSpacing: '-.025em' }}>Why our AI?</h2>
            <p style={{ fontSize: 15, color: '#666', lineHeight: 1.7, marginBottom: 24 }}>
              Our AI handles Amharic fluently. With a 200,000 token context window, it can read entire legal contracts in one shot — something most AIs cannot do.
            </p>
            {[
              { icon: <MessageCircle size={18}/>, t: 'Speaks Amharic fluently', d: 'Native Amharic support — not translation. Understands Ethiopian legal and property terminology.' },
              { icon: <FileText size={18}/>, t: 'Reads full contracts', d: '200K context window means the AI reads your entire lease or sale agreement in one go, missing nothing.' },
              { icon: <Shield size={18}/>, t: 'Vision AI for documents', d: 'AI can analyze photos of title documents, detecting forged stamps and inconsistencies visually.' },
            ].map(({ icon, t, d }) => (
              <div key={t} style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a', flexShrink: 0 }}>{icon}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#111', marginBottom: 4 }}>{t}</div>
                  <div style={{ fontSize: 13, color: '#666', lineHeight: 1.5 }}>{d}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: '#0d2318', borderRadius: 20, padding: 32 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#4ade80', marginBottom: 16 }}>🤖 AI Assistant — live example</div>
            {[
              { role: 'user', msg: 'ዋጋው ለቦሌ ትክክለኛ ነው? Is ETB 2.8M fair for this apartment?' },
              { role: 'ai', msg: 'Based on current Bole market data (ETB 65,000-80,000/m²), this 45m² apartment should be priced ETB 2.9M-3.6M. At ETB 2.8M it is slightly below market — a good deal. Rental yield estimate: 8.2%/year. ዋጋው ጥሩ ነው!' },
            ].map(({ role, msg }) => (
              <div key={msg} style={{ marginBottom: 12, display: 'flex', justifyContent: role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{ maxWidth: '85%', padding: '10px 14px', borderRadius: 12, background: role === 'user' ? '#16a34a' : 'rgba(255,255,255,0.08)', color: '#fff', fontSize: 13, lineHeight: 1.6 }}>
                  {msg}
                </div>
              </div>
            ))}
            <div style={{ marginTop: 16, padding: '10px 14px', background: 'rgba(74,222,128,0.1)', borderRadius: 10, fontSize: 12, color: '#4ade80' }}>
              ⚡ Response in under 2 seconds · Available 24/7 · Free on every listing
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
