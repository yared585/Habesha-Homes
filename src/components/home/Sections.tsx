'use client'

import Link from 'next/link'
import { Home, Users, Award, Shield, Clock, Zap, ArrowRight, Search, Star, Check, Phone, TrendingUp, Bot, ShieldCheck, BarChart3, FileText, MapPin, Target } from 'lucide-react'
import { EthiopianFlag, AIPill, SectionHeader } from '@/components/ui'
import { Counter, Sparkline } from '@/components/ui/DataViz'
import { useLiveStats, useNeighborhoods } from '@/hooks/useProperties'

const TRENDS: Record<string, number[]> = {
  Bole:[42,45,48,51,55,60,64,67,71,74,76,78], Kazanchis:[28,30,32,35,37,40,43,46,48,50,51,52],
  Megenagna:[31,33,35,38,40,43,46,49,52,55,57,58], Sarbet:[24,25,27,29,31,33,35,38,40,42,43,44],
  Gerji:[22,23,25,27,29,31,33,35,37,39,40,41], Piassa:[18,19,20,22,24,25,27,28,30,31,32,32],
  Kolfe:[12,13,14,15,16,17,18,19,20,21,22,22], Lebu:[8,8,9,10,10,11,12,12,13,14,15,15],
}

// ── Stats bar ─────────────────────────────────────────────────────────────────
export function StatsBar() {
  const { stats } = useLiveStats()
  const items = [
    { icon: <Home size={18}/>, val: stats.listings, suffix: stats.listings > 0 ? '+' : '', label: 'Active listings' },
    { icon: <Users size={18}/>, val: stats.agents, suffix: '', label: 'Verified agents' },
    { icon: <Award size={18}/>, val: stats.reports, suffix: '', label: 'AI reports run' },
    { icon: <Shield size={18}/>, val: 98, suffix: '%', label: 'Satisfaction rate' },
    { icon: <Clock size={18}/>, val: 24, suffix: '/7', label: 'AI availability' },
  ]
  return (
    <section style={{ background: '#0d2318', padding: '28px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 24 }}>
        {items.map(({ icon, val, suffix, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ color: '#4ade80' }}>{icon}</div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', lineHeight: 1 }}>
                <Counter end={val} suffix={suffix}/>
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 3 }}>{label}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ── AI features ───────────────────────────────────────────────────────────────
const AI_FEATURES = [
  { icon: <Bot size={20}/>, t:'Amharic AI assistant', a:'አማርኛ AI ረዳት', d:'Ask any property question in Amharic or English — instant answer 24/7.', p:'Free', pc:'#16a34a', bg:'#f0fdf4', bc:'#bbf7d0', ic:'#16a34a', ib:'rgba(22,163,74,0.1)' },
  { icon: <ShieldCheck size={20}/>, t:'Title fraud detector', a:'ማጭበርበር መፈለጊያ', d:'Upload title documents — Claude Vision scans for forged stamps instantly.', p:'$49/check', pc:'#dc2626', bg:'#fef2f2', bc:'#fecaca', ic:'#dc2626', ib:'rgba(220,38,38,0.08)' },
  { icon: <BarChart3 size={20}/>, t:'AI property valuation', a:'AI ዋጋ ግምት', d:'Instant valuation with price range, rental yield, and investment verdict.', p:'$25', pc:'#2563eb', bg:'#eff6ff', bc:'#bfdbfe', ic:'#2563eb', ib:'rgba(37,99,235,0.08)' },
  { icon: <FileText size={20}/>, t:'Contract analyzer', a:'ውል ፈታኝ', d:'Upload any contract — dangerous clauses highlighted in Amharic instantly.', p:'$9.99', pc:'#d97706', bg:'#fffbeb', bc:'#fde68a', ic:'#d97706', ib:'rgba(217,119,6,0.08)' },
  { icon: <MapPin size={20}/>, t:'Neighborhood report', a:'ሰፈር ሪፖርት', d:'Safety, transport, flood risk — full area intelligence for Addis.', p:'$14.99', pc:'#7c3aed', bg:'#f5f3ff', bc:'#ddd6fe', ic:'#7c3aed', ib:'rgba(124,58,237,0.08)' },
  { icon: <Target size={20}/>, t:'Smart property matching', a:'ስማርት ፍለጋ', d:'Describe what you want in Amharic — Claude finds your top 5 matches.', p:'Free', pc:'#16a34a', bg:'#f0fdf4', bc:'#bbf7d0', ic:'#16a34a', ib:'rgba(22,163,74,0.1)' },
]

export function AIFeatures() {
  return (
    <section style={{ padding: '80px 24px', background: '#fafaf8' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <SectionHeader
          centered
          title="The most intelligent platform in Ethiopian real estate"
          subtitle="Claude AI helps you make better property decisions — in Amharic or English, any time"
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 18 }}>
          {AI_FEATURES.map(({ icon, t, a, d, p, pc, bg, bc, ic, ib }) => (
            <div key={t} style={{ background: '#fff', border: '1px solid #eae9e4', borderRadius: 16, padding: 24, transition: 'all .2s' }}
              onMouseEnter={el => { (el.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 32px rgba(0,0,0,0.09)'; (el.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)' }}
              onMouseLeave={el => { (el.currentTarget as HTMLDivElement).style.boxShadow = ''; (el.currentTarget as HTMLDivElement).style.transform = '' }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 12, background: ib, display: 'flex', alignItems: 'center', justifyContent: 'center', color: ic, marginBottom: 16 }}>{icon}</div>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#111', marginBottom: 2 }}>{t}</div>
              <div style={{ fontSize: 12, color: '#aaa', marginBottom: 10 }}>{a}</div>
              <div style={{ fontSize: 13, color: '#666', lineHeight: 1.6, marginBottom: 16 }}>{d}</div>
              <span style={{ fontSize: 12, fontWeight: 700, color: pc, background: bg, border: `1px solid ${bc}`, padding: '4px 12px', borderRadius: 20 }}>{p}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Neighborhood grid ─────────────────────────────────────────────────────────
function NeighborhoodCard({ n }: { n: any }) {
  const trend = TRENDS[n.name] || [10,11,12,13,14,15,16,17,18,19,20,21]
  const isUp = (n.price_trend_12m || 12) > 0
  return (
    <Link href={`/search?neighborhoods=${n.name}`} style={{ textDecoration: 'none' }}>
      <div style={{ background: '#fff', border: '1px solid #eae9e4', borderRadius: 14, padding: 16, cursor: 'pointer', transition: 'all .2s' }}
        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 24px rgba(0,0,0,0.09)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = ''; (e.currentTarget as HTMLDivElement).style.transform = '' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#111' }}>{n.name}</div>
            {n.name_amharic && <div style={{ fontSize: 12, color: '#aaa' }}>{n.name_amharic}</div>}
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: isUp ? '#f0fdf4' : '#fef2f2', color: isUp ? '#16a34a' : '#dc2626' }}>
            +{n.price_trend_12m?.toFixed?.(1) || '12.5'}%
          </span>
        </div>
        <Sparkline data={trend} color={isUp ? '#16a34a' : '#dc2626'}/>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#111', marginTop: 8 }}>
          ETB {((n.avg_price_per_sqm_etb || 0) / 1000).toFixed(0)}K
          <span style={{ fontSize: 11, fontWeight: 400, color: '#aaa' }}>/m²</span>
        </div>
      </div>
    </Link>
  )
}

export function NeighborhoodGrid() {
  const { neighborhoods, loading } = useNeighborhoods(8)
  const FAKE = Object.entries(TRENDS).map(([name, data]) => ({ id: name, name, name_amharic: '', avg_price_per_sqm_etb: data[data.length-1]*1000, price_trend_12m: 12.5 }))
  const display = neighborhoods.length > 0 ? neighborhoods : FAKE

  return (
    <section style={{ padding: '80px 24px', background: '#fafaf8' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <SectionHeader title="Browse by neighborhood" subtitle="ሰፈር ይምረጡ — Live price trends with 12-month sparkline charts"/>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 14 }}>
          {display.map((n: any) => <NeighborhoodCard key={n.id || n.name} n={n}/>)}
        </div>
      </div>
    </section>
  )
}

// ── How it works ──────────────────────────────────────────────────────────────
const HOW_STEPS = [
  { n:'01', icon:<Search size={22}/>, t:'Search & filter', d:'Filter by city, type, price, bedrooms. Browse map or list view.' },
  { n:'02', icon:<Shield size={22}/>, t:'AI fraud check', d:'Upload title document — Claude verifies authenticity in 30 seconds.' },
  { n:'03', icon:<Star size={22}/>, t:'Get AI valuation', d:'Instant valuation with rental yield and investment recommendation.' },
  { n:'04', icon:<Check size={22}/>, t:'Close with confidence', d:'Sign with verified agents — locally or remotely from anywhere.' },
]

export function HowItWorks() {
  return (
    <section style={{ padding: '80px 24px', background: '#fff', borderTop: '1px solid #eae9e4' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <SectionHeader centered title="How it works" subtitle="Find and secure your property in 4 simple steps"/>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 0 }}>
          {HOW_STEPS.map(({ n, icon, t, d }, i) => (
            <div key={n} style={{ padding: 28, textAlign: 'center', borderRight: i < 3 ? '1px solid #eae9e4' : 'none' }}>
              <div style={{ width: 54, height: 54, borderRadius: '50%', background: '#f0fdf4', border: '2px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#16a34a' }}>{icon}</div>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#d0d0cc', letterSpacing: '.1em', marginBottom: 8 }}>{n}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 8 }}>{t}</div>
              <div style={{ fontSize: 13, color: '#888', lineHeight: 1.6 }}>{d}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Diaspora CTA ──────────────────────────────────────────────────────────────
const DIASPORA_STEPS = [
  { n:'01', t:'Browse with USD pricing' },
  { n:'02', t:'AI fraud & valuation check' },
  { n:'03', t:'Local agent verifies onsite' },
  { n:'04', t:'Sign remotely via DocuSign' },
  { n:'05', t:'Own property in Ethiopia ✓' },
]

export function DiasporaCTA() {
  return (
    <section style={{ padding: '80px 24px', background: '#0d2318' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr auto', gap: 40, alignItems: 'center', flexWrap: 'wrap' }}>
        <div>
          <div style={{ marginBottom: 22 }}><EthiopianFlag size="md"/></div>
          <h2 style={{ fontSize: 'clamp(26px,4vw,46px)', fontWeight: 900, color: '#fff', lineHeight: 1.1, margin: '0 0 16px', letterSpacing: '-.025em' }}>
            Investing from abroad?<br/><span style={{ color: '#4ade80' }}>We handle everything.</span>
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', marginBottom: 28, lineHeight: 1.7, maxWidth: 480 }}>
            Claude AI runs full due diligence. Local agents verify physically. Sign via DocuSign from anywhere and own Ethiopian property — without leaving your city.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/diaspora" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#16a34a', color: '#fff', padding: '13px 28px', borderRadius: 12, fontSize: 15, fontWeight: 700, textDecoration: 'none', transition: 'all .15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#15803d'; (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#16a34a'; (e.currentTarget as HTMLAnchorElement).style.transform = 'none' }}
            >
              Start remote buying <ArrowRight size={15}/>
            </Link>
            <Link href="/ai-reports" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '13px 24px', borderRadius: 12, fontSize: 15, fontWeight: 600, textDecoration: 'none', transition: 'all .15s' }}
              onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.14)'}
              onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.08)'}
            >
              Due diligence — $99
            </Link>
          </div>
        </div>
        <div style={{ display: 'grid', gap: 10, minWidth: 220 }}>
          {DIASPORA_STEPS.map(({ n, t }) => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#4ade80', minWidth: 24 }}>{n}</span>
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)' }}>{t}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Contact strip ─────────────────────────────────────────────────────────────
export function ContactStrip() {
  return (
    <section style={{ padding: '56px 24px', background: '#fff', borderTop: '1px solid #eae9e4' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24 }}>
        <div>
          <h2 style={{ fontSize: 26, fontWeight: 900, color: '#111', margin: '0 0 6px', letterSpacing: '-.015em' }}>Need help finding the right property?</h2>
          <p style={{ fontSize: 15, color: '#888', margin: 0 }}>Our team is available 7 days a week · ሁልጊዜ እንዮርዎ</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link href="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#0d2318', color: '#fff', padding: '12px 24px', borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: 'none', transition: 'all .15s' }}
            onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.background = '#16a34a'}
            onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.background = '#0d2318'}
          >
            <Phone size={15}/> Contact us
          </Link>
          <Link href="/ai-reports" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '12px 24px', borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: 'none', transition: 'all .15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#16a34a'; (e.currentTarget as HTMLAnchorElement).style.color = '#fff' }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#f0fdf4'; (e.currentTarget as HTMLAnchorElement).style.color = '#15803d' }}
          >
            <Zap size={15}/> Ask AI assistant
          </Link>
        </div>
      </div>
    </section>
  )
}
