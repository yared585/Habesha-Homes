'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Sparkles, Mail, Lock, User, Phone, Building2, Home, ArrowRight, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState<'role' | 'details'>('role')
  const [role, setRole] = useState<'buyer' | 'agent' | null>(null)
  const [form, setForm] = useState({ fullName:'', email:'', phone:'', password:'', agencyName:'', isDiaspora:false, diasporaCountry:'' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleGoogle() {
    const sb = createClient()
    await sb.auth.signInWithOAuth({ provider:'google', options:{ redirectTo:`${window.location.origin}/auth/callback` } })
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (!role) return
    setLoading(true)
    setError('')

    const sb = createClient()

    // Step 1 — sign up
    const { data, error: signUpError } = await sb.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.fullName, role: role } }
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    // Step 2 — sign in immediately to get a valid session
    const { data: signInData, error: signInError } = await sb.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })

    if (signInError || !signInData.user) {
      setError('Account created! Please log in.')
      router.push('/auth/login')
      return
    }

    const userId = signInData.user.id

    // Step 3 — insert profile using the authenticated client (respects RLS)
    const { error: profileError } = await sb.from('profiles').upsert({
      id: userId,
      email: form.email,
      full_name: form.fullName || form.email.split('@')[0],
      phone: form.phone || null,
      role: role,
      is_diaspora: form.isDiaspora,
      diaspora_country: form.diasporaCountry || null,
      preferred_language: 'en',
    })

    if (profileError) {
      console.error('Profile error:', profileError)
      // Still redirect — user is logged in even if profile failed
    }

    // Step 4 — if agent, create agent record
    if (role === 'agent') {
      const { error: agentError } = await sb.from('agents').upsert({
        id: userId,
        agency_name: form.agencyName || form.fullName || 'My Agency',
        subscription_plan: 'free',
        is_verified: false,
        rating: 0,
        total_listings: 0,
        total_sales: 0,
      }, { onConflict: 'id' })

      if (agentError) {
        console.error('Agent record error:', agentError)
        // Try via API route as fallback
        await fetch('/api/auth/create-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: userId,
            full_name: form.fullName,
            email: form.email,
            phone: form.phone,
            role: 'agent',
            agency_name: form.agencyName || form.fullName || 'My Agency',
          })
        })
      }
    }

    // Send welcome email
    await fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'welcome',
        to: form.email,
        data: { name: form.fullName || form.email.split('@')[0], role }
      })
    }).catch(() => {}) // Don't block signup if email fails

    router.push(role === 'agent' ? '/dashboard' : '/')
  }

  const inp = (field: string, placeholder: string, type = 'text', icon: React.ReactNode, right?: React.ReactNode) => (
    <div style={{ position:'relative' }}>
      <div style={{ position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',color:'#aaa',display:'flex',pointerEvents:'none' }}>{icon}</div>
      <input
        type={type}
        placeholder={placeholder}
        required
        value={(form as any)[field]}
        onChange={e=>setForm(p=>({...p,[field]:e.target.value}))}
        className={`auth-input${right ? ' auth-input-pw' : ''}`}
      />
      {right && <div style={{ position:'absolute',right:14,top:'50%',transform:'translateY(-50%)',cursor:'pointer',color:'#aaa',display:'flex' }} onClick={()=>setShowPw(!showPw)}>{right}</div>}
    </div>
  )

  return (
    <div style={{ minHeight:'100vh',background:'#f5f4f0',display:'flex',alignItems:'center',justifyContent:'center',padding:'24px' }}>
      <div style={{ width:'100%',maxWidth: step==='role' ? 560 : 460 }}>

        <div style={{ textAlign:'center',marginBottom:28 }}>
          <Link href="/" style={{ textDecoration:'none',display:'inline-flex',flexDirection:'column',alignItems:'center',gap:8 }}>
            <svg width="48" height="48" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="11" fill="#0d2318"/>
              <path d="M6 22L20 9L34 22" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round"/>
              <path d="M10 20v13h7v-7h6v7h7V20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="31" cy="12" r="5.5" stroke="#4ade80" strokeWidth="2.5" fill="rgba(74,222,128,0.15)"/>
              <circle cx="31" cy="12" r="2" fill="#4ade80"/>
              <path d="M31 17.5v8" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M28.5 22h5M28.5 25h5" stroke="#4ade80" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <div style={{ fontSize:18,fontWeight:800,color:'#111',letterSpacing:'-.02em' }}>Habesha Properties</div>
          </Link>
        </div>

        <div style={{ background:'#fff',border:'1px solid #eae9e4',borderRadius:20,padding:32,boxShadow:'0 4px 24px rgba(0,0,0,0.06)' }}>

          {step === 'role' && (
            <>
              <h1 style={{ fontSize:24,fontWeight:800,color:'#111',margin:'0 0 6px',letterSpacing:'-.02em' }}>Create your account</h1>
              <p style={{ fontSize:14,color:'#888',margin:'0 0 24px' }}>Who are you? · እርስዎ ማን ናቸው?</p>

              <button onClick={handleGoogle} className="auth-btn-google" style={{ marginBottom:20 }}>
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
                  <path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>

              <div style={{ display:'flex',alignItems:'center',gap:12,marginBottom:24 }}>
                <div style={{ flex:1,height:1,background:'#eae9e4' }}/>
                <span style={{ fontSize:12,color:'#bbb' }}>or choose your role</span>
                <div style={{ flex:1,height:1,background:'#eae9e4' }}/>
              </div>

              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16 }}>
                {([
                  { r:'buyer' as const, icon:<Home size={26}/>, label:'I want to buy or rent', sub:'Browse, save and inquire about properties', features:['Search all properties','AI assistant free','Save favourites','Contact agents'] },
                  { r:'agent' as const, icon:<Building2 size={26}/>, label:'I am a real estate agent', sub:'List properties and manage clients', features:['List properties','AI listing writer','Dashboard analytics','Priority support'] },
                ]).map(({ r, icon, label, sub, features }) => (
                  <div key={r} onClick={()=>setRole(r)}
                    style={{ border:`2px solid ${role===r?'#16a34a':'#e0dfd9'}`,background:role===r?'#f0fdf4':'#fff',borderRadius:14,padding:16,cursor:'pointer',transition:'all .15s',position:'relative' }}
                  >
                    {role===r && <div style={{ position:'absolute',top:10,right:10,width:18,height:18,borderRadius:'50%',background:'#16a34a',display:'flex',alignItems:'center',justifyContent:'center' }}><Check size={11} color="#fff"/></div>}
                    <div style={{ color:role===r?'#16a34a':'#888',marginBottom:8 }}>{icon}</div>
                    <div style={{ fontSize:13,fontWeight:700,color:'#111',marginBottom:4,lineHeight:1.3 }}>{label}</div>
                    <div style={{ fontSize:11,color:'#888',marginBottom:10,lineHeight:1.4 }}>{sub}</div>
                    {features.map(f=>(
                      <div key={f} style={{ display:'flex',alignItems:'center',gap:5,fontSize:11,color:'#666',marginBottom:3 }}>
                        <Check size={9} color="#16a34a" style={{flexShrink:0}}/>{f}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <div onClick={()=>setForm(p=>({...p,isDiaspora:!p.isDiaspora}))}
                style={{ border:`1.5px solid ${form.isDiaspora?'#16a34a':'#e0dfd9'}`,background:form.isDiaspora?'#f0fdf4':'#fff',borderRadius:10,padding:'10px 14px',cursor:'pointer',display:'flex',alignItems:'center',gap:10,marginBottom:20,transition:'all .15s' }}
              >
                <div style={{ width:20,height:20,borderRadius:5,border:`2px solid ${form.isDiaspora?'#16a34a':'#d0d0cc'}`,background:form.isDiaspora?'#16a34a':'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                  {form.isDiaspora && <Check size={12} color="#fff"/>}
                </div>
                <div>
                  <div style={{ fontSize:13,fontWeight:600,color:'#111' }}>🌍 I live outside Ethiopia (diaspora)</div>
                  <div style={{ fontSize:11,color:'#888' }}>Get USD pricing and remote buying support</div>
                </div>
              </div>

              <button onClick={()=>{ if(role) setStep('details') }} disabled={!role} className="auth-btn-primary">
                Continue <ArrowRight size={16}/>
              </button>
            </>
          )}

          {step === 'details' && (
            <>
              <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:20 }}>
                <button onClick={()=>setStep('role')} style={{ background:'#f5f5f2',border:'none',borderRadius:8,padding:'6px 12px',fontSize:12,color:'#666',cursor:'pointer' }}>← Back</button>
                <div>
                  <h1 style={{ fontSize:20,fontWeight:800,color:'#111',margin:0 }}>{role==='agent'?'Agent details':'Your details'}</h1>
                  <p style={{ fontSize:12,color: role==='agent'?'#16a34a':'#888',margin:0,fontWeight:role==='agent'?600:400 }}>
                    {role==='agent'?'✦ Setting up as: Real estate agent':'Setting up as: Buyer / Renter'}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSignup} style={{ display:'flex',flexDirection:'column',gap:13 }}>
                {inp('fullName','Full name','text',<User size={15}/>)}
                {inp('email','Email address','email',<Mail size={15}/>)}
                {inp('phone','Phone number','tel',<Phone size={15}/>)}
                {role==='agent' && inp('agencyName','Agency or business name','text',<Building2 size={15}/>)}
                {inp('password','Create password (min 6 chars)',showPw?'text':'password',<Lock size={15}/>, showPw?<EyeOff size={15}/>:<Eye size={15}/>)}

                {form.isDiaspora && (
                  <select value={form.diasporaCountry} onChange={e=>setForm(p=>({...p,diasporaCountry:e.target.value}))}
                    style={{ padding:'13px 16px',border:'1.5px solid #e0dfd9',borderRadius:10,fontSize:14,color:'#555',outline:'none',background:'#fff' }}
                  >
                    <option value="">Select your country</option>
                    {['United States','United Kingdom','Canada','Germany','Sweden','Australia','UAE','Saudi Arabia','Other'].map(c=>(
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                )}

                {error && (
                  <div style={{ background:'#fef2f2',border:'1px solid #fecaca',borderRadius:8,padding:'10px 14px',fontSize:13,color:'#dc2626' }}>{error}</div>
                )}

                <button type="submit" disabled={loading} className="auth-btn-primary">
                  {loading ? 'Creating account...' : <><Check size={15}/> Create account</>}
                </button>

                <p style={{ fontSize:11,color:'#bbb',textAlign:'center',margin:0,lineHeight:1.6 }}>
                  By signing up you agree to our <Link href="/terms" style={{color:'#16a34a'}}>Terms</Link> and <Link href="/privacy" style={{color:'#16a34a'}}>Privacy Policy</Link>
                </p>
              </form>
            </>
          )}
        </div>

        <p style={{ textAlign:'center',fontSize:13,color:'#888',marginTop:20 }}>
          Already have an account?{' '}
          <Link href="/auth/login" style={{ color:'#16a34a',fontWeight:700,textDecoration:'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
