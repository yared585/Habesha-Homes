import Link from 'next/link'
import { ArrowRight, Shield, TrendingUp, Globe, Sparkles, Heart, Users, Home } from 'lucide-react'

export const metadata = {
  title: 'About — Habesha Homes',
  description: "Learn about Habesha Homes — Ethiopia's smartest AI-powered property marketplace",
}

export default function AboutPage() {
  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>

      {/* Hero */}
      <section style={{ background: '#0d2318', padding: '72px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 24 }}>
            {['#078930','#FCDD09','#DA121A'].map(c => <div key={c} style={{ width: 36, height: 4, borderRadius: 2, background: c }}/>)}
          </div>
          <h1 style={{ fontSize: 'clamp(32px,6vw,52px)', fontWeight: 900, color: '#fff', margin: '0 0 16px', letterSpacing: '-.025em', lineHeight: 1.1 }}>
            Ethiopia's smartest<br/><span style={{ color: '#4ade80' }}>property marketplace</span>
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.65)', margin: '0 auto', maxWidth: 580, lineHeight: 1.7 }}>
            Building the infrastructure for transparent, safe, and intelligent real estate in Ethiopia — for Ethiopians at home and in the diaspora.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section style={{ padding: '72px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#16a34a', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 12 }}>Our mission</div>
              <h2 style={{ fontSize: 'clamp(22px,4vw,32px)', fontWeight: 900, color: '#111', margin: '0 0 16px', letterSpacing: '-.02em', lineHeight: 1.2 }}>
                Making Ethiopian real estate transparent and safe
              </h2>
              <p style={{ fontSize: 15, color: '#666', lineHeight: 1.8, marginBottom: 16 }}>
                Ethiopia's property market has long been plagued by fraud, opacity, and information asymmetry. Buyers lose millions to fake titles. Diaspora investors are deceived from abroad. Agents operate without accountability.
              </p>
              <p style={{ fontSize: 15, color: '#666', lineHeight: 1.8 }}>
                We built Habesha Homes to change that. With AI-powered fraud detection, instant valuations, and Amharic support — we're giving every Ethiopian buyer the tools they deserve.
              </p>
            </div>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 20, padding: 32 }}>
              {[
                { num: '30 sec', label: 'Fraud check speed' },
                { num: '$49', label: 'vs $500+ lawyer fees' },
                { num: '24/7', label: 'AI assistant in Amharic' },
                { num: '100%', label: 'Transparent pricing' },
              ].map(({ num, label }, i, arr) => (
                <div key={label} style={{ marginBottom: i < arr.length - 1 ? 20 : 0, paddingBottom: i < arr.length - 1 ? 20 : 0, borderBottom: i < arr.length - 1 ? '1px solid #dcfce7' : 'none' }}>
                  <div style={{ fontSize: 30, fontWeight: 900, color: '#16a34a', lineHeight: 1 }}>{num}</div>
                  <div style={{ fontSize: 14, color: '#555', marginTop: 4 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section style={{ padding: '72px 24px', background: '#f9f9f7' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#dc2626', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 12 }}>The problem</div>
            <h2 style={{ fontSize: 'clamp(24px,4vw,36px)', fontWeight: 900, color: '#111', margin: 0, letterSpacing: '-.02em' }}>Ethiopian real estate is broken</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16 }}>
            {[
              { emoji: '🚨', title: 'Title fraud is rampant', desc: 'Forged title documents cost Ethiopian buyers millions every year. Without verification tools, buyers are vulnerable.' },
              { emoji: '💸', title: 'Diaspora are easy targets', desc: 'Ethiopians abroad lose entire savings to fraudulent deals they cannot verify in person.' },
              { emoji: '📊', title: 'No price transparency', desc: 'Without reliable market data, buyers and sellers are flying blind on pricing — leading to bad deals.' },
              { emoji: '🗣️', title: 'Language barrier', desc: 'Most platforms ignore Amharic speakers. Important property details are lost in translation.' },
            ].map(({ emoji, title, desc }) => (
              <div key={title} style={{ background: '#fff', border: '1px solid #eae9e4', borderRadius: 14, padding: 20 }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{emoji}</div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 7 }}>{title}</h3>
                <p style={{ fontSize: 13, color: '#666', lineHeight: 1.7, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution */}
      <section style={{ padding: '72px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#16a34a', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 12 }}>Our solution</div>
            <h2 style={{ fontSize: 'clamp(24px,4vw,36px)', fontWeight: 900, color: '#111', margin: 0, letterSpacing: '-.02em' }}>AI-powered protection for every buyer</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16 }}>
            {[
              { icon: <Shield size={20} color="#16a34a"/>, title: 'Fraud Detection', desc: 'Claude AI analyzes title documents in 30 seconds — spotting forgeries and red flags instantly.', bg: '#f0fdf4', border: '#bbf7d0' },
              { icon: <TrendingUp size={20} color="#2563eb"/>, title: 'Instant Valuations', desc: 'AI property valuations based on real market data — know if you\'re paying fair price.', bg: '#eff6ff', border: '#bfdbfe' },
              { icon: <Sparkles size={20} color="#d97706"/>, title: 'AI Assistant', desc: 'Ask anything in Amharic or English 24/7. Claude explains documents, trends, and tips.', bg: '#fffbeb', border: '#fde68a' },
              { icon: <Globe size={20} color="#7c3aed"/>, title: 'Diaspora Package', desc: 'Complete remote due diligence — fraud check, valuation, contract and neighborhood report.', bg: '#f5f3ff', border: '#ddd6fe' },
            ].map(({ icon, title, desc, bg, border }) => (
              <div key={title} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 14, padding: 20 }}>
                <div style={{ marginBottom: 10 }}>{icon}</div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 7 }}>{title}</h3>
                <p style={{ fontSize: 13, color: '#555', lineHeight: 1.7, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section style={{ padding: '72px 24px', background: '#0d2318' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(24px,4vw,36px)', fontWeight: 900, color: '#fff', margin: '0 0 40px', letterSpacing: '-.02em', textAlign: 'center' }}>
            Built for everyone in Ethiopian real estate
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14 }}>
            {[
              { icon: <Home size={18}/>, title: 'Home buyers', desc: 'Find verified properties, check fraud, get fair valuations — buy with confidence.' },
              { icon: <Heart size={18}/>, title: 'Renters', desc: 'Browse thousands of rental listings with AI assistance in Amharic and English.' },
              { icon: <Globe size={18}/>, title: 'Ethiopian diaspora', desc: 'Buy safely from abroad with complete remote due diligence.' },
              { icon: <Users size={18}/>, title: 'Real estate agents', desc: 'List properties, reach verified buyers, grow with AI tools.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: 20 }}>
                <div style={{ color: '#4ade80', marginBottom: 10 }}>{icon}</div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 7 }}>{title}</h3>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '64px 24px', background: '#f0fdf4', borderTop: '1px solid #bbf7d0' }}>
        <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(24px,4vw,34px)', fontWeight: 900, color: '#111', margin: '0 0 12px', letterSpacing: '-.02em' }}>
            Ready to buy or list in Ethiopia?
          </h2>
          <p style={{ fontSize: 15, color: '#666', marginBottom: 28 }}>Join thousands of buyers and agents on Ethiopia's smartest property platform.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/search" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#16a34a', color: '#fff', padding: '13px 28px', borderRadius: 12, fontSize: 15, fontWeight: 700, textDecoration: 'none' }}>
              Browse properties <ArrowRight size={15}/>
            </Link>
            <Link href="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', border: '1.5px solid #16a34a', color: '#16a34a', padding: '13px 24px', borderRadius: 12, fontSize: 15, fontWeight: 600, textDecoration: 'none' }}>
              Contact us
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
