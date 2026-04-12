'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, Phone, MapPin, MessageSquare, CheckCircle } from 'lucide-react'

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px', border: '1.5px solid #e0dfd9',
  borderRadius: 10, fontSize: 14, outline: 'none', color: '#111',
  background: '#fff', transition: 'border .15s', fontFamily: 'inherit',
}

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: 'General inquiry', message: '' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    setError('')
    try {
      await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'contact', data: form })
      })
      setSent(true)
    } catch { setError('Something went wrong. Please try again.') }
    setSending(false)
  }

  return (
    <div style={{ background: '#f9f9f7', minHeight: '100vh' }}>
      <div style={{ background: '#0d2318', padding: '48px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h1 style={{ fontSize: 'clamp(28px,5vw,42px)', fontWeight: 900, color: '#fff', margin: '0 0 10px', letterSpacing: '-.025em' }}>Get in touch</h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', margin: 0 }}>We're here to help with support, partnerships, or general questions.</p>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px' }}>
        <div className="contact-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 32, alignItems: 'start' }}>

          {/* Left */}
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#111', marginBottom: 24 }}>Contact information</h2>
            {[
              { icon: <Mail size={17} color="#16a34a"/>, label: 'Email', value: 'yohanesy585@gmail.com', href: 'mailto:yohanesy585@gmail.com' },
              { icon: <Phone size={17} color="#16a34a"/>, label: 'Phone (Local)', value: '301-605-0766', href: 'tel:3016050766' },
              { icon: <Phone size={17} color="#16a34a"/>, label: 'Phone (Ethiopia)', value: '+251 913 964 204', href: 'tel:+251913964204' },
              { icon: <MapPin size={17} color="#16a34a"/>, label: 'Office', value: 'Bole, Addis Ababa, Ethiopia', href: null },
            ].map(({ icon, label, value, href }) => (
              <div key={label} style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#f0fdf4', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</div>
                <div>
                  <div style={{ fontSize: 11, color: '#aaa', marginBottom: 2 }}>{label}</div>
                  {href ? <a href={href} style={{ fontSize: 14, fontWeight: 600, color: '#111', textDecoration: 'none' }}>{value}</a>
                        : <div style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>{value}</div>}
                </div>
              </div>
            ))}

            <div style={{ background: '#fff', border: '1px solid #eae9e4', borderRadius: 14, padding: 18, marginTop: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#111', marginBottom: 12 }}>Quick help</div>
              {[
                { label: 'List a property as agent', href: '/auth/signup' },
                { label: 'AI fraud detection', href: '/ai-reports' },
                { label: 'Pricing plans', href: '/pricing' },
                { label: 'Terms of service', href: '/terms' },
                { label: 'Privacy policy', href: '/privacy' },
              ].map(({ label, href }) => (
                <Link key={label} href={href} style={{ display: 'block', fontSize: 13, color: '#16a34a', textDecoration: 'none', padding: '7px 0', borderBottom: '1px solid #f5f5f2' }}>
                  {label} →
                </Link>
              ))}
            </div>
          </div>

          {/* Right — form */}
          <div style={{ background: '#fff', border: '1px solid #eae9e4', borderRadius: 16, padding: 28 }}>
            {sent ? (
              <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                <CheckCircle size={52} color="#16a34a" style={{ marginBottom: 16 }}/>
                <h3 style={{ fontSize: 22, fontWeight: 800, color: '#111', marginBottom: 8 }}>Message sent!</h3>
                <p style={{ fontSize: 14, color: '#888', lineHeight: 1.6, marginBottom: 20 }}>We'll get back to you within 24 hours.</p>
                <button onClick={() => setSent(false)} style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '11px 24px', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Send another
                </button>
              </div>
            ) : (
              <>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#111', marginBottom: 4 }}>Send us a message</h2>
                <p style={{ fontSize: 13, color: '#aaa', marginBottom: 22 }}>We usually respond within 24 hours</p>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 14 }}>
                  <div className="contact-name-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 5 }}>Full name *</label>
                      <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="Your name" style={inputStyle}
                        onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#16a34a'}
                        onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#e0dfd9'}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 5 }}>Email *</label>
                      <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required placeholder="your@email.com" style={inputStyle}
                        onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#16a34a'}
                        onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#e0dfd9'}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 5 }}>Phone</label>
                    <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+251 9XX XXX XXXX" style={inputStyle}
                      onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#16a34a'}
                      onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#e0dfd9'}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 5 }}>Subject</label>
                    <select value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                      style={{ ...inputStyle, cursor: 'pointer' }}
                      onFocus={e => (e.target as HTMLSelectElement).style.borderColor = '#16a34a'}
                      onBlur={e => (e.target as HTMLSelectElement).style.borderColor = '#e0dfd9'}
                    >
                      {['General inquiry','Agent support','Buyer support','Report a listing','Partnership','Technical issue','Other'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 5 }}>Message *</label>
                    <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} required rows={5}
                      placeholder="How can we help you?"
                      style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                      onFocus={e => (e.target as HTMLTextAreaElement).style.borderColor = '#16a34a'}
                      onBlur={e => (e.target as HTMLTextAreaElement).style.borderColor = '#e0dfd9'}
                    />
                  </div>
                  {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#dc2626' }}>{error}</div>}
                  <button type="submit" disabled={sending}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: sending ? '#9ca3af' : '#16a34a', color: '#fff', border: 'none', padding: '13px', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: sending ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
                    onMouseEnter={e => { if (!sending) (e.currentTarget as HTMLButtonElement).style.background = '#15803d' }}
                    onMouseLeave={e => { if (!sending) (e.currentTarget as HTMLButtonElement).style.background = '#16a34a' }}
                  >
                    <MessageSquare size={16}/> {sending ? 'Sending...' : 'Send message'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
