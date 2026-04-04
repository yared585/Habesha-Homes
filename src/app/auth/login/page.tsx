'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Spinner } from '@/components/ui/Spinner'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const sb = createClient()
    const { data, error: err } = await sb.auth.signInWithPassword({ email, password })
    if (err) { setError(err.message); setLoading(false); return }
    const { data: profile } = await sb.from('profiles').select('role').eq('id', data.user.id).single()
    const role = profile?.role
    if (role === 'admin') router.push('/admin')
    else if (role === 'developer') router.push('/dashboard/developer')
    else if (role === 'agent') router.push('/dashboard')
    else router.push('/saved')
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    const sb = createClient()
    await sb.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    })
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0d1f15 0%, #1a3d2b 40%, #111 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', position: 'relative', overflow: 'hidden'
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
          <h1 style={{ fontSize: 26, fontWeight: 900, color: '#111', margin: '0 0 4px', letterSpacing: '-.025em', textAlign: 'center' }}>
            Welcome back
          </h1>
          <p style={{ fontSize: 14, color: '#aaa', margin: '0 0 28px', textAlign: 'center' }}>
            Sign in to your Habesha Properties account
          </p>

          {/* Google */}
          <button onClick={handleGoogle} disabled={googleLoading}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%', padding: '13px', background: '#f9f9f7', border: '1.5px solid #eae9e4', borderRadius: 12, fontSize: 14, fontWeight: 600, color: '#333', cursor: googleLoading ? 'not-allowed' : 'pointer', marginBottom: 20, fontFamily: 'inherit', transition: 'all .15s' }}
            onMouseEnter={e => { if (!googleLoading) { (e.currentTarget as HTMLButtonElement).style.background = '#f0fdf4'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#1a3d2b' }}}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#f9f9f7'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#eae9e4' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {googleLoading ? 'Redirecting...' : 'Continue with Google'}
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: '#f0f0ec' }}/>
            <span style={{ fontSize: 12, color: '#ccc', fontWeight: 500 }}>or</span>
            <div style={{ flex: 1, height: 1, background: '#f0f0ec' }}/>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>Email address</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#ccc', display: 'flex', pointerEvents: 'none' }}>
                  <Mail size={15}/>
                </div>
                <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required
                  style={{ width: '100%', padding: '12px 14px 12px 40px', border: '1.5px solid #eae9e4', borderRadius: 10, fontSize: 14, outline: 'none', color: '#111', background: '#fafaf8', fontFamily: 'inherit', transition: 'all .15s' }}
                  onFocus={e => { (e.target as HTMLInputElement).style.borderColor = '#1a3d2b'; (e.target as HTMLInputElement).style.background = '#fff' }}
                  onBlur={e => { (e.target as HTMLInputElement).style.borderColor = '#eae9e4'; (e.target as HTMLInputElement).style.background = '#fafaf8' }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#555' }}>Password</label>
                <Link href="/auth/reset" style={{ fontSize: 12, color: '#1a3d2b', textDecoration: 'none', fontWeight: 500 }}>Forgot password?</Link>
              </div>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#ccc', display: 'flex', pointerEvents: 'none' }}>
                  <Lock size={15}/>
                </div>
                <input type={showPw ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required
                  style={{ width: '100%', padding: '12px 42px 12px 40px', border: '1.5px solid #eae9e4', borderRadius: 10, fontSize: 14, outline: 'none', color: '#111', background: '#fafaf8', fontFamily: 'inherit', transition: 'all .15s' }}
                  onFocus={e => { (e.target as HTMLInputElement).style.borderColor = '#1a3d2b'; (e.target as HTMLInputElement).style.background = '#fff' }}
                  onBlur={e => { (e.target as HTMLInputElement).style.borderColor = '#eae9e4'; (e.target as HTMLInputElement).style.background = '#fafaf8' }}
                />
                <div onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#ccc', display: 'flex' }}>
                  {showPw ? <EyeOff size={15}/> : <Eye size={15}/>}
                </div>
              </div>
            </div>

            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 9, padding: '10px 14px', fontSize: 13, color: '#dc2626' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: loading ? '#9ca3af' : '#1a3d2b', color: '#fff', border: 'none', padding: '14px', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'all .15s', marginTop: 4, boxShadow: loading ? 'none' : '0 4px 14px rgba(26,61,43,0.35)' }}
              onMouseEnter={e => { if (!loading) { (e.currentTarget as HTMLButtonElement).style.background = '#2d5a3d'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)' }}}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#1a3d2b'; (e.currentTarget as HTMLButtonElement).style.transform = 'none' }}
            >
              {loading ? <><Spinner size="sm" color="#fff"/><span>Signing in...</span></> : <><span>Sign in</span><ArrowRight size={16}/></>}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 13, color: '#aaa', marginTop: 22, marginBottom: 0 }}>
            Don't have an account?{' '}
            <Link href="/auth/signup" style={{ color: '#1a3d2b', fontWeight: 700, textDecoration: 'none' }}>Create account</Link>
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, marginTop: 20 }}>
          <Sparkles size={11} color="rgba(255,255,255,0.3)"/>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>Secured by Supabase</span>
        </div>
      </div>
    </div>
  )
}
