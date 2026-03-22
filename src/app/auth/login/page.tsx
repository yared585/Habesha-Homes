'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Sparkles, Mail, Lock, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const sb = createClient()
    const { error: err } = await sb.auth.signInWithPassword({ email, password })
    if (err) { setError(err.message); setLoading(false) }
    else router.push('/')
  }

  async function handleGoogle() {
    const sb = createClient()
    await sb.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` }
    })
  }

  const inp = (val: string, set: (v:string)=>void, placeholder: string, type: string, icon: React.ReactNode, right?: React.ReactNode) => (
    <div style={{ position:'relative' }}>
      <div style={{ position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',color:'#aaa',display:'flex' }}>{icon}</div>
      <input type={type} placeholder={placeholder} value={val} onChange={e=>set(e.target.value)} required
        style={{ width:'100%',padding:'13px 16px 13px 42px',border:'1.5px solid #e0dfd9',borderRadius:10,fontSize:14,outline:'none',color:'#111',background:'#fff',transition:'border .15s',paddingRight: right ? 44 : 16 }}
        onFocus={e=>(e.target as HTMLInputElement).style.borderColor='#16a34a'}
        onBlur={e=>(e.target as HTMLInputElement).style.borderColor='#e0dfd9'}
      />
      {right && <div style={{ position:'absolute',right:14,top:'50%',transform:'translateY(-50%)',cursor:'pointer',color:'#aaa',display:'flex' }} onClick={()=>setShowPw(!showPw)}>{right}</div>}
    </div>
  )

  return (
    <div style={{ minHeight:'100vh',background:'#f5f4f0',display:'flex',alignItems:'center',justifyContent:'center',padding:'24px' }}>
      <div style={{ width:'100%',maxWidth:420 }}>

        {/* Logo */}
        <div style={{ textAlign:'center',marginBottom:32 }}>
          <Link href="/" style={{ textDecoration:'none',display:'inline-flex',flexDirection:'column',alignItems:'center',gap:10 }}>
            <svg width="52" height="52" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="11" fill="#0d2318"/>
              <path d="M6 22L20 9L34 22" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round"/>
              <path d="M10 20v13h7v-7h6v7h7V20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="31" cy="12" r="5.5" stroke="#4ade80" strokeWidth="2.5" fill="rgba(74,222,128,0.15)"/>
              <circle cx="31" cy="12" r="2" fill="#4ade80"/>
              <path d="M31 17.5v8" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M28.5 22h5M28.5 25h5" stroke="#4ade80" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <div>
              <div style={{ fontSize:20,fontWeight:800,color:'#111',letterSpacing:'-.02em' }}>Habesha Homes</div>
              <div style={{ fontSize:10,color:'#aaa',letterSpacing:'.08em' }}>ETHIOPIA</div>
            </div>
          </Link>
        </div>

        {/* Card */}
        <div style={{ background:'#fff',border:'1px solid #eae9e4',borderRadius:20,padding:32,boxShadow:'0 4px 24px rgba(0,0,0,0.06)' }}>
          <h1 style={{ fontSize:24,fontWeight:800,color:'#111',margin:'0 0 6px',letterSpacing:'-.02em' }}>Welcome back</h1>
          <p style={{ fontSize:14,color:'#888',margin:'0 0 24px' }}>Sign in to your account · እንኳን ደህና መጡ</p>

          {/* Google */}
          <button onClick={handleGoogle}
            style={{ width:'100%',display:'flex',alignItems:'center',justifyContent:'center',gap:10,padding:'12px',border:'1.5px solid #e0dfd9',borderRadius:10,background:'#fff',fontSize:14,fontWeight:600,color:'#333',cursor:'pointer',marginBottom:20,transition:'all .15s' }}
            onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.borderColor='#16a34a'}
            onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.borderColor='#e0dfd9'}
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
              <path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div style={{ display:'flex',alignItems:'center',gap:12,marginBottom:20 }}>
            <div style={{ flex:1,height:1,background:'#eae9e4' }}/>
            <span style={{ fontSize:12,color:'#bbb',fontWeight:500 }}>or email</span>
            <div style={{ flex:1,height:1,background:'#eae9e4' }}/>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} style={{ display:'flex',flexDirection:'column',gap:14 }}>
            {inp(email, setEmail, 'Email address', 'email', <Mail size={16}/>)}
            {inp(password, setPassword, 'Password', showPw ? 'text' : 'password', <Lock size={16}/>, showPw ? <EyeOff size={16}/> : <Eye size={16}/>)}

            <div style={{ display:'flex',justifyContent:'flex-end' }}>
              <Link href="/auth/reset" style={{ fontSize:13,color:'#16a34a',textDecoration:'none',fontWeight:500 }}>Forgot password?</Link>
            </div>

            {error && (
              <div style={{ background:'#fef2f2',border:'1px solid #fecaca',borderRadius:8,padding:'10px 14px',fontSize:13,color:'#dc2626' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:8,background: loading ? '#9ca3af' : '#16a34a',color:'#fff',border:'none',padding:'14px',borderRadius:10,fontSize:15,fontWeight:700,cursor: loading ? 'not-allowed' : 'pointer',transition:'all .15s' }}
              onMouseEnter={e=>{ if(!loading)(e.currentTarget as HTMLButtonElement).style.background='#15803d' }}
              onMouseLeave={e=>{ if(!loading)(e.currentTarget as HTMLButtonElement).style.background='#16a34a' }}
            >
              {loading ? 'Signing in...' : <><ArrowRight size={16}/> Sign in</>}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p style={{ textAlign:'center',fontSize:13,color:'#888',marginTop:20 }}>
          Don't have an account?{' '}
          <Link href="/auth/signup" style={{ color:'#16a34a',fontWeight:700,textDecoration:'none' }}>Create one free</Link>
        </p>

        <div style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:5,marginTop:16 }}>
          <Sparkles size={11} color="#16a34a"/>
          <span style={{ fontSize:11,color:'#bbb' }}>Powered by Claude AI · Secured by Supabase</span>
        </div>
      </div>
    </div>
  )
}
