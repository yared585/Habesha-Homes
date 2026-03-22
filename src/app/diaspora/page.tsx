import Link from 'next/link'
import { ArrowRight, Shield, TrendingUp, Globe, FileText, CheckCircle, Phone } from 'lucide-react'

export const metadata = { title: 'Diaspora Investing — Habesha Homes' }

const STEPS = [
  { n:'01', icon:<Globe size={22}/>, t:'Browse with USD pricing', d:'All properties show prices in both ETB and USD. Filter by your budget in dollars.' },
  { n:'02', icon:<Shield size={22}/>, t:'AI fraud & valuation', d:'Upload title documents — Claude verifies authenticity instantly. Get a professional valuation report.' },
  { n:'03', icon:<CheckCircle size={22}/>, t:'Local agent verifies', d:'A verified Habesha Homes agent physically inspects the property and confirms at the land registry.' },
  { n:'04', icon:<FileText size={22}/>, t:'Sign remotely', d:'Sale agreement sent via DocuSign. Sign from anywhere in the world — no visit required.' },
  { n:'05', icon:<TrendingUp size={22}/>, t:'Own Ethiopian property', d:'Registration completed by local agent. You receive title documents. Rental management available.' },
]

const FAQS = [
  { q:'Can Ethiopians abroad legally buy property in Ethiopia?', a:'Yes. Ethiopian citizens living abroad have full rights to own property in Ethiopia. Foreign nationals of Ethiopian origin also have property rights under Ethiopian law.' },
  { q:'Do I need to visit Ethiopia to buy?', a:'No. With Habesha Homes you can complete the entire process remotely — from property search to title transfer — without visiting Ethiopia.' },
  { q:'How does the AI fraud check work?', a:'You upload a photo of the title document. Claude Vision AI analyzes the stamps, signatures, ownership chain, and registration details to detect forgeries. Takes 30 seconds.' },
  { q:'What is the typical rental yield in Addis Ababa?', a:'Rental yields in Addis Ababa average 7-9% annually, with prime areas like Bole reaching up to 10%. This compares favorably to most Western real estate markets.' },
  { q:'How do I send money to pay for property?', a:'International wire transfer, Western Union, or through your bank. We recommend using a verified Ethiopian bank account. Habesha Homes does not handle money transfers.' },
  { q:'What documents do I need?', a:'Ethiopian passport or Kebele ID, Power of Attorney for your local agent (notarized), and proof of funds. Our team guides you through every document.' },
]

export default function DiasporaPage() {
  return (
    <div>
      {/* Hero */}
      <section style={{ background: '#0d2318', padding: '72px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: 5, marginBottom: 24 }}>
            {['#078930','#FCDD09','#DA121A'].map(c => <div key={c} style={{ width: 32, height: 3, borderRadius: 2, background: c }}/>)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 40, alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 20, padding: '4px 12px', marginBottom: 20 }}>
                <Globe size={12} color="#4ade80"/>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#4ade80' }}>Ethiopian Diaspora Investing</span>
              </div>
              <h1 style={{ fontSize: 'clamp(32px,5vw,56px)', fontWeight: 900, color: '#fff', lineHeight: 1.05, margin: '0 0 18px', letterSpacing: '-.025em' }}>
                Own property in Ethiopia<br/><span style={{ color: '#4ade80' }}>without leaving your city</span>
              </h1>
              <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.65)', marginBottom: 32, lineHeight: 1.7, maxWidth: 520 }}>
                Claude AI runs full due diligence. Local agents verify physically. You sign via DocuSign from anywhere in the world.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link href="/search" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#16a34a', color: '#fff', padding: '13px 28px', borderRadius: 12, fontSize: 15, fontWeight: 700, textDecoration: 'none' }}>
                  Browse properties <ArrowRight size={15}/>
                </Link>
                <Link href="/ai-reports" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '13px 24px', borderRadius: 12, fontSize: 15, fontWeight: 600, textDecoration: 'none' }}>
                  Due diligence — $99
                </Link>
              </div>
            </div>
            {/* Stats */}
            <div style={{ display: 'grid', gap: 12, minWidth: 200 }}>
              {[
                { val: '$8B+', label: 'Ethiopian property market' },
                { val: '180%', label: 'Addis price growth (10yr)' },
                { val: '7-9%', label: 'Annual rental yield' },
                { val: '$5B+', label: 'Annual diaspora remittances' },
              ].map(({ val, label }) => (
                <div key={label} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '14px 18px' }}>
                  <div style={{ fontSize: 24, fontWeight: 900, color: '#4ade80' }}>{val}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 3 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '80px 24px', background: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ fontSize: 36, fontWeight: 900, color: '#111', margin: '0 0 8px', letterSpacing: '-.025em' }}>How it works</h2>
          <p style={{ fontSize: 15, color: '#888', marginBottom: 48 }}>5 steps to owning Ethiopian property from abroad</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 24 }}>
            {STEPS.map(({ n, icon, t, d }) => (
              <div key={n}>
                <div style={{ width: 50, height: 50, borderRadius: '50%', background: '#f0fdf4', border: '2px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a', marginBottom: 14 }}>{icon}</div>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#d0d0cc', letterSpacing: '.1em', marginBottom: 6 }}>{n}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 6 }}>{t}</div>
                <div style={{ fontSize: 13, color: '#888', lineHeight: 1.6 }}>{d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Due diligence package */}
      <section style={{ padding: '80px 24px', background: '#fafaf8' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
            <div>
              <h2 style={{ fontSize: 32, fontWeight: 900, color: '#111', margin: '0 0 14px', letterSpacing: '-.025em' }}>Diaspora Due Diligence Package</h2>
              <p style={{ fontSize: 15, color: '#666', marginBottom: 24, lineHeight: 1.7 }}>Everything you need to buy Ethiopian property safely from abroad — in one package.</p>
              <div style={{ fontSize: 36, fontWeight: 900, color: '#16a34a', marginBottom: 4 }}>$99</div>
              <div style={{ fontSize: 14, color: '#888', marginBottom: 28 }}>One-time fee per property</div>
              {[
                'Title document fraud check',
                'Professional property valuation',
                'Neighborhood safety & ROI report',
                'Contract analysis (lease or sale)',
                'Remote buying process guide',
                'Direct agent connection',
              ].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, fontSize: 14, color: '#333' }}>
                  <CheckCircle size={16} color="#16a34a" style={{ flexShrink: 0 }}/>{f}
                </div>
              ))}
              <Link href="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#16a34a', color: '#fff', padding: '13px 28px', borderRadius: 12, fontSize: 15, fontWeight: 700, textDecoration: 'none', marginTop: 8 }}>
                Get started <ArrowRight size={15}/>
              </Link>
            </div>
            {/* FAQ */}
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: '#111', marginBottom: 20 }}>Frequently asked questions</h3>
              {FAQS.map(({ q, a }) => (
                <div key={q} style={{ borderBottom: '1px solid #eae9e4', paddingBottom: 16, marginBottom: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 6 }}>{q}</div>
                  <div style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>{a}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '60px 24px', background: '#0d2318', textAlign: 'center' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <h2 style={{ fontSize: 32, fontWeight: 900, color: '#fff', marginBottom: 14, letterSpacing: '-.025em' }}>Ready to invest in Ethiopia?</h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', marginBottom: 28 }}>Browse thousands of verified listings or contact our diaspora team today.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/search" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#16a34a', color: '#fff', padding: '13px 28px', borderRadius: 12, fontSize: 15, fontWeight: 700, textDecoration: 'none' }}>
              Browse properties <ArrowRight size={15}/>
            </Link>
            <Link href="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '13px 24px', borderRadius: 12, fontSize: 15, fontWeight: 600, textDecoration: 'none' }}>
              <Phone size={15}/> Contact diaspora team
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
