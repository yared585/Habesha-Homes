'use client'

import Link from 'next/link'
import { Sparkles, Shield, TrendingUp, Users, Globe, ArrowRight } from 'lucide-react'

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section style={{ background:'#fff',borderBottom:'1px solid #eae9e4',padding:'72px 24px' }}>
        <div style={{ maxWidth:900,margin:'0 auto' }}>
          <div style={{ display:'flex',gap:5,marginBottom:24 }}>
            {['#078930','#FCDD09','#DA121A'].map(c=><div key={c} style={{ width:32,height:3,borderRadius:2,background:c }}/>)}
          </div>
          <h1 style={{ fontSize:'clamp(34px,5vw,58px)',fontWeight:900,color:'#111',lineHeight:1.05,margin:'0 0 20px',letterSpacing:'-.025em' }}>
            We are building the future<br/>of <span style={{ color:'#16a34a' }}>Ethiopian real estate</span>
          </h1>
          <p style={{ fontSize:18,color:'#666',lineHeight:1.8,maxWidth:640 }}>
            Habesha Homes is Ethiopia's first AI-powered property marketplace — combining Claude AI with deep local knowledge to make buying, selling, and renting property safe, transparent, and accessible to every Ethiopian and diaspora buyer worldwide.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section style={{ padding:'72px 24px',background:'#fafaf8' }}>
        <div style={{ maxWidth:1100,margin:'0 auto',display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:20 }}>
          {[
            { icon:<Shield size={24}/>, t:'Trust & transparency', d:'Fraud is the biggest problem in Ethiopian real estate. Our Claude AI title verification gives every buyer confidence before they hand over a single birr.' },
            { icon:<Sparkles size={24}/>, t:'AI in Amharic', d:'Claude AI speaks Amharic fluently. For the first time, every Ethiopian can get expert property guidance in their own language, 24 hours a day.' },
            { icon:<Globe size={24}/>, t:'Diaspora inclusion', d:'Over 3 million Ethiopians live abroad and want to invest at home. We make remote buying safe, simple, and fully digital — without requiring a single visit.' },
            { icon:<TrendingUp size={24}/>, t:'Market intelligence', d:'Real-time price data, neighborhood trends, and investment analysis give Ethiopian buyers and agents the information they need to make smart decisions.' },
          ].map(({ icon, t, d }) => (
            <div key={t} style={{ background:'#fff',border:'1px solid #eae9e4',borderRadius:16,padding:24 }}>
              <div style={{ width:48,height:48,borderRadius:12,background:'#f0fdf4',display:'flex',alignItems:'center',justifyContent:'center',color:'#16a34a',marginBottom:16 }}>{icon}</div>
              <div style={{ fontSize:17,fontWeight:800,color:'#111',marginBottom:8 }}>{t}</div>
              <div style={{ fontSize:14,color:'#666',lineHeight:1.7 }}>{d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding:'72px 24px',background:'#0d2318' }}>
        <div style={{ maxWidth:1100,margin:'0 auto',display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:32,textAlign:'center' }}>
          {[
            { n:'$8B+', l:'Ethiopian property market' },
            { n:'180%', l:'Addis price growth (10yr)' },
            { n:'$5B+', l:'Annual diaspora remittances' },
            { n:'7-9%', l:'Rental yield in Addis Ababa' },
          ].map(({ n, l }) => (
            <div key={l}>
              <div style={{ fontSize:40,fontWeight:900,color:'#4ade80',marginBottom:8 }}>{n}</div>
              <div style={{ fontSize:14,color:'rgba(255,255,255,0.55)' }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding:'72px 24px',background:'#fff',textAlign:'center' }}>
        <div style={{ maxWidth:560,margin:'0 auto' }}>
          <h2 style={{ fontSize:36,fontWeight:900,color:'#111',marginBottom:16,letterSpacing:'-.025em' }}>Ready to get started?</h2>
          <p style={{ fontSize:16,color:'#666',marginBottom:32,lineHeight:1.7 }}>Browse thousands of verified listings or try our AI assistant free today.</p>
          <div style={{ display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap' }}>
            <Link href="/search" style={{ display:'inline-flex',alignItems:'center',gap:8,background:'#16a34a',color:'#fff',padding:'13px 28px',borderRadius:12,fontSize:15,fontWeight:700,textDecoration:'none' }}>
              Browse properties <ArrowRight size={15}/>
            </Link>
            <Link href="/contact" style={{ display:'inline-flex',alignItems:'center',gap:8,background:'#f5f5f2',color:'#111',padding:'13px 24px',borderRadius:12,fontSize:15,fontWeight:600,textDecoration:'none' }}>
              <Users size={15}/> Contact us
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
