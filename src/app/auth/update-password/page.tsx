'use client'

// NOTE FOR DEVELOPERS:
// To change the password reset email sender name from "Supabase Auth" to "Habesha Properties":
// Go to Supabase Dashboard → Authentication → Settings → SMTP Settings
// Change "Sender name" to "Habesha Properties" and update the From email accordingly.

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Lock, ArrowRight, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function UpdatePasswordPage() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const supabase = createClient()

    // Check if we have tokens in the URL hash (Supabase puts them there)
    const hash = window.location.hash
    if (hash && hash.includes('access_token')) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) setReady(true)
      })
    }

    // Also listen for the event as backup
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
        setReady(true)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    const sb = createClient()
    const { error: err } = await sb.auth.updateUser({ password })
    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
    setTimeout(() => router.push('/'), 2000)
  }

  const inputStyle = (focused = false): React.CSSProperties => ({
    width: '100%',
    padding: '12px 42px 12px 40px',
    border: `1.5px solid ${focused ? '#1a3d2b' : '#eae9e4'}`,
    borderRadius: 10,
    fontSize: 14,
    outline: 'none',
    color: '#111',
    background: focused ? '#fff' : '#fafaf8',
    fontFamily: 'inherit',
    transition: 'all .15s',
  })

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0d1f15 0%, #1a3d2b 40%, #111 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(26,61,43,0.3)', pointerEvents: 'none' }}/>
      <div style={{ position: 'absolute', bottom: -150, left: -100, width: 500, height: 500, borderRadius: '50%', background: 'rgba(26,61,43,0.2)', pointerEvents: 'none' }}/>

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 62, height: 62, borderRadius: 16, background: '#1a3d2b', border: '2px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
              <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
                <path d="M7 22L20 9L33 22" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="14" y="22" width="12" height="11" rx="2" fill="white" opacity="0.95"/>
                <rect x="17" y="25" width="6" height="8" rx="1.5" fill="#1a3d2b"/>
                <circle cx="31" cy="13" r="4" fill="none" stroke="white" strokeWidth="1.8"/>
                <circle cx="31" cy="13" r="1.5" fill="white" opacity="0.4"/>
                <line x1="35" y1="13" x2="38" y2="13" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                <line x1="37.2" y1="13" x2="37.2" y2="15.5" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                <line x1="35.8" y1="13" x2="35.8" y2="16" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: '-.02em' }}>Habesha Properties</div>
          </Link>
        </div>

        {/* Card */}
        <div style={{ background: '#fff', borderRadius: 24, padding: '36px 32px', boxShadow: '0 32px 80px rgba(0,0,0,0.4)' }}>

          {success ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f0fdf4', border: '2px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111', marginBottom: 8 }}>Password updated!</h2>
              <p style={{ fontSize: 14, color: '#888', lineHeight: 1.6, marginBottom: 0 }}>
                Your password has been changed successfully. Redirecting you home…
              </p>
            </div>
          ) : (
            <>
              <h1 style={{ fontSize: 26, fontWeight: 900, color: '#111', margin: '0 0 4px', letterSpacing: '-.025em', textAlign: 'center' }}>
                Set new password
              </h1>
              <p style={{ fontSize: 14, color: '#aaa', margin: '0 0 28px', textAlign: 'center' }}>
                {ready ? 'Choose a strong password for your account.' : 'Waiting for your reset link to be verified…'}
              </p>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                {/* New password */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>New password</label>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#ccc', display: 'flex', pointerEvents: 'none' }}>
                      <Lock size={15}/>
                    </div>
                    <input
                      type={showPw ? 'text' : 'password'}
                      placeholder="Min. 8 characters"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      disabled={!ready}
                      style={{ width: '100%', padding: '12px 42px 12px 40px', border: '1.5px solid #eae9e4', borderRadius: 10, fontSize: 14, outline: 'none', color: '#111', background: ready ? '#fafaf8' : '#f5f5f5', fontFamily: 'inherit', transition: 'all .15s' }}
                      onFocus={e => { (e.target as HTMLInputElement).style.borderColor = '#1a3d2b'; (e.target as HTMLInputElement).style.background = '#fff' }}
                      onBlur={e => { (e.target as HTMLInputElement).style.borderColor = '#eae9e4'; (e.target as HTMLInputElement).style.background = ready ? '#fafaf8' : '#f5f5f5' }}
                    />
                    <div onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#ccc', display: 'flex' }}>
                      {showPw ? <EyeOff size={15}/> : <Eye size={15}/>}
                    </div>
                  </div>
                </div>

                {/* Confirm password */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>Confirm password</label>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#ccc', display: 'flex', pointerEvents: 'none' }}>
                      <Lock size={15}/>
                    </div>
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Re-enter password"
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      required
                      disabled={!ready}
                      style={{ width: '100%', padding: '12px 42px 12px 40px', border: '1.5px solid #eae9e4', borderRadius: 10, fontSize: 14, outline: 'none', color: '#111', background: ready ? '#fafaf8' : '#f5f5f5', fontFamily: 'inherit', transition: 'all .15s' }}
                      onFocus={e => { (e.target as HTMLInputElement).style.borderColor = '#1a3d2b'; (e.target as HTMLInputElement).style.background = '#fff' }}
                      onBlur={e => { (e.target as HTMLInputElement).style.borderColor = '#eae9e4'; (e.target as HTMLInputElement).style.background = ready ? '#fafaf8' : '#f5f5f5' }}
                    />
                    <div onClick={() => setShowConfirm(!showConfirm)} style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#ccc', display: 'flex' }}>
                      {showConfirm ? <EyeOff size={15}/> : <Eye size={15}/>}
                    </div>
                  </div>
                </div>

                {error && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 9, padding: '10px 14px', fontSize: 13, color: '#dc2626' }}>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !ready}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: (loading || !ready) ? '#9ca3af' : '#1a3d2b', color: '#fff', border: 'none', padding: '14px', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: (loading || !ready) ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'all .15s', marginTop: 4, boxShadow: (loading || !ready) ? 'none' : '0 4px 14px rgba(26,61,43,0.35)' }}
                  onMouseEnter={e => { if (!loading && ready) { (e.currentTarget as HTMLButtonElement).style.background = '#2d5a3d'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)' }}}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = (loading || !ready) ? '#9ca3af' : '#1a3d2b'; (e.currentTarget as HTMLButtonElement).style.transform = 'none' }}
                >
                  {loading ? 'Updating…' : <><span>Update password</span><ArrowRight size={16}/></>}
                </button>
              </form>
            </>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, marginTop: 20 }}>
          <Sparkles size={11} color="rgba(255,255,255,0.3)"/>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>Secured by Supabase</span>
        </div>
      </div>
    </div>
  )
}
