'use client'

import { useState } from 'react'
import { Phone, Mail, MapPin, MessageCircle, Clock, Send, Sparkles } from 'lucide-react'

export default function ContactPage() {
  const [form, setForm] = useState({ name:'', email:'', phone:'', subject:'', message:'' })
  const [sent, setSent] = useState(false)
  function submit(e: React.FormEvent) {
    e.preventDefault()
    setSent(true)
  }
  const inp = (field: string, placeholder: string, type = 'text') => (
    <input type={type} placeholder={placeholder} required
      value={(form as any)[field]} onChange={e=>setForm(p=>({...p,[field]:e.target.value}))}
      style={{ width:'100%',padding:'12px 16px',border:'1.5px solid #e0dfd9',borderRadius:10,fontSize:14,outline:'none',color:'#111',background:'#fff',transition:'border .15s' }}
      onFocus={e=>(e.target as HTMLInputElement).style.borderColor='#16a34a'}
      onBlur={e=>(e.target as HTMLInputElement).style.borderColor='#e0dfd9'}
    />
  )
  return (
    <div style={{ maxWidth:1100,margin:'0 auto',padding:'60px 24px' }}>
      <div style={{ marginBottom:52 }}>
        <div style={{ display:'flex',gap:5,marginBottom:20 }}>
          {['#078930','#FCDD09','#DA121A'].map(c=><div key={c} style={{ width:28,height:3,borderRadius:2,background:c }}/>)}
        </div>
        <h1 style={{ fontSize:46,fontWeight:900,color:'#111',margin:'0 0 12px',letterSpacing:'-.025em' }}>Contact us</h1>
        <p style={{ fontSize:17,color:'#666',maxWidth:480,lineHeight:1.7 }}>We are here to help you find your perfect Ethiopian property. Reach us in Amharic or English.</p>
      </div>

      <div style={{ display:'grid',gridTemplateColumns:'1fr 380px',gap:40,alignItems:'start' }}>
        {/* Form */}
        <div style={{ background:'#fff',border:'1px solid #eae9e4',borderRadius:20,padding:36 }}>
          {sent ? (
            <div style={{ textAlign:'center',padding:'40px 0' }}>
              <div style={{ fontSize:48,marginBottom:16 }}>✉️</div>
              <h2 style={{ fontSize:24,fontWeight:800,color:'#111',marginBottom:10 }}>Message sent!</h2>
              <p style={{ fontSize:15,color:'#777' }}>We will get back to you within 24 hours.</p>
              <button onClick={()=>setSent(false)} style={{ marginTop:20,background:'#16a34a',color:'#fff',border:'none',padding:'12px 28px',borderRadius:10,fontSize:14,fontWeight:700,cursor:'pointer' }}>Send another</button>
            </div>
          ) : (
            <form onSubmit={submit} style={{ display:'flex',flexDirection:'column',gap:16 }}>
              <h2 style={{ fontSize:20,fontWeight:800,color:'#111',margin:'0 0 8px' }}>Send us a message</h2>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14 }}>
                {inp('name','Your full name')}
                {inp('email','Email address','email')}
              </div>
              {inp('phone','Phone number (optional)')}
              <select value={form.subject} onChange={e=>setForm(p=>({...p,subject:e.target.value}))}
                style={{ padding:'12px 16px',border:'1.5px solid #e0dfd9',borderRadius:10,fontSize:14,color:'#555',outline:'none',background:'#fff' }}
              >
                <option value="">Select subject</option>
                <option>I want to buy a property</option>
                <option>I want to rent a property</option>
                <option>I am an agent and want to list</option>
                <option>I need an AI fraud check</option>
                <option>Diaspora investment enquiry</option>
                <option>Technical support</option>
                <option>Other</option>
              </select>
              <textarea placeholder="Your message in English or Amharic..." rows={5} required
                value={form.message} onChange={e=>setForm(p=>({...p,message:e.target.value}))}
                style={{ padding:'12px 16px',border:'1.5px solid #e0dfd9',borderRadius:10,fontSize:14,resize:'vertical',outline:'none',color:'#111',background:'#fff',transition:'border .15s',fontFamily:'inherit' }}
                onFocus={e=>(e.target as HTMLTextAreaElement).style.borderColor='#16a34a'}
                onBlur={e=>(e.target as HTMLTextAreaElement).style.borderColor='#e0dfd9'}
              />
              <button type="submit" style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:8,background:'#16a34a',color:'#fff',border:'none',padding:'14px',borderRadius:12,fontSize:15,fontWeight:700,cursor:'pointer',transition:'all .15s' }}
                onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.background='#15803d'}
                onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.background='#16a34a'}
              >
                <Send size={16}/> Send message
              </button>
            </form>
          )}
        </div>

        {/* Info */}
        <div style={{ display:'flex',flexDirection:'column',gap:16 }}>
          {[
            { icon:<Phone size={20}/>, t:'Phone', v:'+251 911 000 000', sub:'Mon–Sat 8am–8pm EAT' },
            { icon:<Mail size={20}/>, t:'Email', v:'hello@habeshahomes.com', sub:'We reply within 24 hours' },
            { icon:<MapPin size={20}/>, t:'Office', v:'Bole, Addis Ababa', sub:'Ethiopia' },
            { icon:<MessageCircle size={20}/>, t:'Telegram', v:'@HabeshaHomes', sub:'Fastest response' },
            { icon:<Clock size={20}/>, t:'AI Assistant', v:'24/7 Available', sub:'In Amharic & English' },
          ].map(({ icon, t, v, sub }) => (
            <div key={t} style={{ background:'#fff',border:'1px solid #eae9e4',borderRadius:14,padding:'16px 18px',display:'flex',alignItems:'center',gap:14 }}>
              <div style={{ width:44,height:44,borderRadius:12,background:'#f0fdf4',display:'flex',alignItems:'center',justifyContent:'center',color:'#16a34a',flexShrink:0 }}>{icon}</div>
              <div>
                <div style={{ fontSize:12,color:'#aaa',marginBottom:2 }}>{t}</div>
                <div style={{ fontSize:15,fontWeight:700,color:'#111' }}>{v}</div>
                <div style={{ fontSize:12,color:'#aaa' }}>{sub}</div>
              </div>
            </div>
          ))}

          {/* AI CTA */}
          <div style={{ background:'#0d2318',borderRadius:14,padding:20 }}>
            <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:10 }}>
              <Sparkles size={16} color="#4ade80"/>
              <span style={{ fontSize:13,fontWeight:700,color:'#4ade80' }}>Try the AI assistant first</span>
            </div>
            <p style={{ fontSize:13,color:'rgba(255,255,255,0.65)',lineHeight:1.6,margin:'0 0 14px' }}>
              Claude AI can answer most property questions instantly — in Amharic or English. Available 24/7.
            </p>
            <a href="/ai-reports" style={{ display:'inline-flex',alignItems:'center',gap:6,background:'#16a34a',color:'#fff',padding:'10px 18px',borderRadius:8,fontSize:13,fontWeight:700,textDecoration:'none' }}>
              <Sparkles size={13}/> Ask Claude AI
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
