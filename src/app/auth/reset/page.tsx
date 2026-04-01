'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const sb = createClient()
    const { error: err } = await sb.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    })

    if (err) { setError(err.message); setLoading(false); return }
    setSent(true)
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f4f0', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <svg width="44" height="44" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="11" fill="#0d2318"/>
              <path d="M6 22L20 9L34 22" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round"/>
              <path d="M10 20v13h7v-7h6v7h7V20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="31" cy="12" r="5.5" stroke="#4ade80" strokeWidth="2.5" fill="rgba(74,222,128,0.15)"/>
              <circle cx="31" cy="12" r="2" fill="#4ade80"/>
              <path d="M31 17.5v8" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M28.5 22h5M28.5 25h5" stroke="#4ade80" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#111' }}>Habesha Properties</div>
          </Link>
        </div>

        <div style={{ background: '#fff', border: '1px solid #eae9e4', borderRadius: 20, padding: 32, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>

          {sent ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f0fdf4', border: '2px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <CheckCircle size={32} color="#16a34a"/>
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111', marginBottom: 8 }}>Check your email</h2>
              <p style={{ fontSize: 14, color: '#888', lineHeight: 1.6, marginBottom: 24 }}>
                We sent a password reset link to <strong style={{ color: '#111' }}>{email}</strong>. Click the link in the email to reset your password.
              </p>
              <Link href="/auth/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#16a34a', color: '#fff', padding: '11px 24px', borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
                Back to login
              </Link>
            </div>
          ) : (
            <>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111', margin: '0 0 6px', letterSpacing: '-.02em' }}>Reset password</h1>
              <p style={{ fontSize: 14, color: '#888', margin: '0 0 24px' }}>Enter your email and we'll send you a reset link</p>

              <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#aaa', display: 'flex' }}>
                    <Mail size={15}/>
                  </div>
                  <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} required
                    style={{ width: '100%', padding: '13px 16px 13px 42px', border: '1.5px solid #e0dfd9', borderRadius: 10, fontSize: 14, outline: 'none', color: '#111', background: '#fff', fontFamily: 'inherit', transition: 'border .15s' }}
                    onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#16a34a'}
                    onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#e0dfd9'}
                  />
                </div>

                {error && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#dc2626' }}>{error}</div>
                )}

                <button type="submit" disabled={loading}
                  style={{ background: loading ? '#9ca3af' : '#16a34a', color: '#fff', border: 'none', padding: '13px', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
                >
                  {loading ? 'Sending...' : 'Send reset link'}
                </button>
              </form>
            </>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Link href="/auth/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#888', textDecoration: 'none' }}>
            <ArrowLeft size={13}/> Back to login
          </Link>
        </div>
      </div>
    </div>
  )
}
