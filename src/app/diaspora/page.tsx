import Link from 'next/link'
import { ArrowRight, Shield, TrendingUp, Globe, FileText, CheckCircle, Phone, DollarSign, MapPin, Star, AlertTriangle } from 'lucide-react'

export const metadata = {
  title: 'Diaspora Investing — Buy Property in Ethiopia from Abroad | Habesha Homes',
  description: 'Buy Ethiopian property safely from anywhere in the world. AI fraud detection, remote due diligence, USD pricing. Trusted by Ethiopian diaspora worldwide.',
}

const COUNTRIES = ['🇺🇸 United States', '🇬🇧 United Kingdom', '🇨🇦 Canada', '🇩🇪 Germany', '🇸🇪 Sweden', '🇦🇺 Australia', '🇦🇪 UAE', '🇸🇦 Saudi Arabia', '🇳🇴 Norway', '🇮🇹 Italy']

const STEPS = [
  { n: '01', icon: <Globe size={20}/>, title: 'Browse with USD pricing', desc: 'All properties show prices in both ETB and USD. Filter by your budget in dollars. Save favorites to compare later.', color: '#16a34a' },
  { n: '02', icon: <Shield size={20}/>, title: 'AI fraud check in 30 seconds', desc: 'Upload the title document photo. Claude AI instantly detects forgeries, fake stamps, and ownership chain issues before you invest.', color: '#dc2626' },
  { n: '03', icon: <TrendingUp size={20}/>, title: 'Get AI valuation report', desc: 'Know the fair market value before negotiating. Our AI compares recent sales data and gives you a verdict — overprice, fair, or undervalue.', color: '#2563eb' },
  { n: '04', icon: <FileText size={20}/>, title: 'Contract analysis', desc: 'Upload the sale agreement. Claude reads every clause and highlights dangerous terms, missing protections, and negotiation opportunities.', color: '#d97706' },
  { n: '05', icon: <MapPin size={20}/>, title: 'Neighborhood intelligence', desc: 'Safety score, transport access, flood risk, price trend and 5-year outlook for the area — all in one report.', color: '#7c3aed' },
  { n: '06', icon: <CheckCircle size={20}/>, title: 'Buy with confidence', desc: 'Connect with a verified local agent to complete the transaction. Your title documents are secured and registered properly.', color: '#16a34a' },
]

const RISKS = [
  { emoji: '🚨', title: 'Fake title documents', desc: 'The most common fraud — forged titles sold to diaspora who cannot visit in person to verify at the land registry.' },
  { emoji: '👻', title: 'Ghost properties', desc: 'Properties listed that don\'t exist or have already been sold. Diaspora pay deposits and never hear from the agent again.' },
  { emoji: '💸', title: 'Price manipulation', desc: 'Sellers charge diaspora 2-3x the real market rate, knowing buyers cannot easily compare prices from abroad.' },
  { emoji: '📜', title: 'Dangerous contracts', desc: 'Sale agreements written to favor the seller with clauses that strip buyer protections. Hidden fees revealed at closing.' },
]

const FAQS = [
  { q: 'Can Ethiopians abroad legally buy property in Ethiopia?', a: 'Yes. Ethiopian citizens abroad have full rights to own property in Ethiopia. Foreign nationals of Ethiopian origin also have property rights under Ethiopian law.' },
  { q: 'Do I need to visit Ethiopia to buy?', a: 'No. With Habesha Homes you can complete the entire process remotely — from property search to title transfer — without visiting Ethiopia.' },
  { q: 'How does the AI fraud check work?', a: 'You upload a photo of the title document. Claude AI analyzes the stamps, signatures, ownership chain, and registration details to detect forgeries. Takes 30 seconds.' },
  { q: 'What is the typical rental yield in Addis Ababa?', a: 'Rental yields in Addis Ababa average 7-9% annually, with prime areas like Bole reaching up to 10%. This compares favorably to most Western real estate markets.' },
  { q: 'How do I send money to pay for property?', a: 'International wire transfer or through your bank. We recommend using a verified Ethiopian bank account. Habesha Homes does not handle money transfers directly.' },
  { q: 'What documents do I need?', a: 'Ethiopian passport or Kebele ID, Power of Attorney for your local agent (notarized), and proof of funds. Our verified agents guide you through every document.' },
  { q: 'What languages does the AI assistant support?', a: 'Both Amharic and English. You can ask questions and receive explanations in whichever language you prefer — 24 hours a day.' },
  { q: 'How much does the Diaspora Due Diligence package cost?', a: 'The full diaspora package — fraud check, valuation, contract analysis, and neighborhood report — costs $99. Individually, reports range from $9.99 to $49.' },
]

export default function DiasporaPage() {
  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>

      {/* Hero */}
      <section style={{ background: '#0d2318', padding: '80px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: 5, marginBottom: 20 }}>
            {['#078930','#FCDD09','#DA121A'].map(c => <div key={c} style={{ width: 32, height: 4, borderRadius: 2, background: c }}/>)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#4ade80', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 14 }}>
                🌍 For the Ethiopian diaspora
              </div>
              <h1 style={{ fontSize: 'clamp(28px,5vw,46px)', fontWeight: 900, color: '#fff', margin: '0 0 16px', letterSpacing: '-.025em', lineHeight: 1.1 }}>
                Own a piece of Ethiopia.<br/>
                <span style={{ color: '#4ade80' }}>From anywhere in the world.</span>
              </h1>
              <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.65)', margin: '0 0 28px', lineHeight: 1.7 }}>
                Buy property in Ethiopia safely and confidently from the US, UK, Canada, or anywhere. AI fraud detection, USD pricing, and remote due diligence — all in one place.
              </p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <Link href="/search" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#16a34a', color: '#fff', padding: '13px 26px', borderRadius: 12, fontSize: 15, fontWeight: 700, textDecoration: 'none' }}>
                  Browse properties <ArrowRight size={15}/>
                </Link>
                <Link href="/ai-reports" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '13px 22px', borderRadius: 12, fontSize: 15, fontWeight: 600, textDecoration: 'none' }}>
                  View AI reports
                </Link>
              </div>
            </div>
            {/* Stats card */}
            <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 20, padding: 28 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#4ade80', marginBottom: 20 }}>Why invest in Ethiopia?</div>
              {[
                { label: 'Annual price growth in Bole', value: '+14%' },
                { label: 'Rental yield in prime areas', value: '7–10%' },
                { label: 'Population growth rate', value: '2.6%/yr' },
                { label: 'Diaspora remittances yearly', value: '$5B+' },
              ].map(({ label, value }, i, arr) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{label}</span>
                  <span style={{ fontSize: 18, fontWeight: 800, color: '#4ade80' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Diaspora countries */}
          <div style={{ marginTop: 40, paddingTop: 32, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 12, letterSpacing: '.08em', textTransform: 'uppercase' }}>Trusted by Ethiopians in</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {COUNTRIES.map(c => (
                <span key={c} style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.07)', padding: '5px 12px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)' }}>{c}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Risks section */}
      <section style={{ padding: '72px 24px', background: '#fff8f8' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 32 }}>
            <AlertTriangle size={24} color="#dc2626"/>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#dc2626', letterSpacing: '.08em', textTransform: 'uppercase' }}>The risks</div>
              <h2 style={{ fontSize: 'clamp(22px,4vw,30px)', fontWeight: 900, color: '#111', margin: 0, letterSpacing: '-.02em' }}>
                Why diaspora buyers get scammed
              </h2>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14 }}>
            {RISKS.map(({ emoji, title, desc }) => (
              <div key={title} style={{ background: '#fff', border: '1px solid #fecaca', borderRadius: 14, padding: 20 }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{emoji}</div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 7 }}>{title}</h3>
                <p style={{ fontSize: 13, color: '#666', lineHeight: 1.7, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 24, padding: '16px 20px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, fontSize: 14, color: '#dc2626', fontWeight: 500 }}>
            ⚠️ Ethiopian fraud cases involving diaspora buyers have grown significantly. Our AI fraud detection has caught forgeries that cost buyers up to $200,000.
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '72px 24px', background: '#fff' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#16a34a', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 12 }}>How it works</div>
            <h2 style={{ fontSize: 'clamp(24px,4vw,36px)', fontWeight: 900, color: '#111', margin: 0, letterSpacing: '-.02em' }}>
              Buy Ethiopian property safely — step by step
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 16 }}>
            {STEPS.map(({ n, icon, title, desc, color }) => (
              <div key={n} style={{ background: '#f9f9f7', border: '1px solid #eae9e4', borderRadius: 14, padding: 22, position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>{icon}</div>
                  <span style={{ fontSize: 11, fontWeight: 800, color: '#ddd', letterSpacing: '.1em' }}>{n}</span>
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: 13, color: '#666', lineHeight: 1.7, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Diaspora package */}
      <section style={{ padding: '72px 24px', background: '#0d2318' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#4ade80', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 14 }}>Best value</div>
          <h2 style={{ fontSize: 'clamp(24px,4vw,38px)', fontWeight: 900, color: '#fff', margin: '0 0 14px', letterSpacing: '-.025em' }}>
            Diaspora Due Diligence Package
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', marginBottom: 36, lineHeight: 1.7 }}>
            Everything you need to buy Ethiopian property safely from abroad — all in one bundle.
          </p>
          <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 20, padding: 28, marginBottom: 28, textAlign: 'left' }}>
            {[
              { icon: <Shield size={16}/>, title: 'Title Fraud Detection', price: '$49', desc: 'AI verifies your title document in 30 seconds' },
              { icon: <TrendingUp size={16}/>, title: 'Property Valuation', price: '$25', desc: 'Know the fair market value before buying' },
              { icon: <FileText size={16}/>, title: 'Contract Analysis', price: '$9.99', desc: 'Dangerous clauses detected and explained' },
              { icon: <MapPin size={16}/>, title: 'Neighborhood Report', price: '$14.99', desc: 'Safety, transport, flood risk, price trends' },
            ].map(({ icon, title, price, desc }) => (
              <div key={title} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ color: '#4ade80', flexShrink: 0 }}>{icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{title}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{desc}</div>
                </div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textDecoration: 'line-through' }}>{price}</div>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, marginTop: 4 }}>
              <div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Total value: $98.98</div>
                <div style={{ fontSize: 13, color: '#4ade80', fontWeight: 600 }}>You save $0 — pay just</div>
              </div>
              <div style={{ fontSize: 38, fontWeight: 900, color: '#4ade80' }}>$99</div>
            </div>
          </div>
          <Link href="/ai-reports" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#16a34a', color: '#fff', padding: '15px 36px', borderRadius: 14, fontSize: 16, fontWeight: 700, textDecoration: 'none' }}>
            Get diaspora package <ArrowRight size={16}/>
          </Link>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 14 }}>
            Reports delivered in minutes · Available 24/7 · English & Amharic
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '72px 24px', background: '#f9f9f7' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(24px,4vw,32px)', fontWeight: 900, color: '#111', marginBottom: 36, textAlign: 'center', letterSpacing: '-.02em' }}>
            Frequently asked questions
          </h2>
          {FAQS.map(({ q, a }) => (
            <div key={q} style={{ borderBottom: '1px solid #eae9e4', paddingBottom: 20, marginBottom: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 8 }}>{q}</h3>
              <p style={{ fontSize: 14, color: '#666', lineHeight: 1.8, margin: 0 }}>{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ padding: '64px 24px', background: '#fff', borderTop: '1px solid #eae9e4' }}>
        <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(22px,4vw,32px)', fontWeight: 900, color: '#111', marginBottom: 12, letterSpacing: '-.02em' }}>
            Ready to invest in Ethiopia?
          </h2>
          <p style={{ fontSize: 15, color: '#888', marginBottom: 28, lineHeight: 1.6 }}>
            Start by browsing verified listings. Use AI fraud check before you commit to anything.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/search" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#16a34a', color: '#fff', padding: '13px 28px', borderRadius: 12, fontSize: 15, fontWeight: 700, textDecoration: 'none' }}>
              Browse properties <ArrowRight size={15}/>
            </Link>
            <Link href="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', border: '1.5px solid #eae9e4', color: '#555', padding: '13px 22px', borderRadius: 12, fontSize: 15, textDecoration: 'none' }}>
              <Phone size={14}/> Talk to us
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
