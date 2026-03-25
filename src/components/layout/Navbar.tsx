'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { Search, LogOut, LayoutDashboard, Plus, User, Sparkles, Home, Building2, Globe, TrendingUp, ChevronDown, Menu, X, Shield } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { SearchOverlay } from '@/components/layout/SearchOverlay'

// ── Logo ──────────────────────────────────────────────────────────────────────
function HabeshaLogo({ size = 38 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="11" fill="#0d2318"/>
      <path d="M6 22L20 9L34 22" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round"/>
      <path d="M10 20v13h7v-7h6v7h7V20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="31" cy="12" r="5.5" stroke="#4ade80" strokeWidth="2.5" fill="rgba(74,222,128,0.15)"/>
      <circle cx="31" cy="12" r="2" fill="#4ade80"/>
      <path d="M31 17.5v8" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M28.5 22h5M28.5 25h5" stroke="#4ade80" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

// ── Nav link ──────────────────────────────────────────────────────────────────
function NavLink({ label, href }: { label: string; href: string }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [hov, setHov] = useState(false)
  const base = href.split('?')[0]
  const hrefParams = new URLSearchParams(href.split('?')[1] || '')
  // Check if pathname matches AND query params match (for Buy/Rent distinction)
  const pathnameMatch = pathname === base || (base !== '/' && pathname.startsWith(base))
  const intentParam = hrefParams.get('intent')
  const active = pathnameMatch && (
    !intentParam || searchParams.get('intent') === intentParam
  )
  return (
    <Link href={href} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
      padding: '6px 11px', borderRadius: 8, fontSize: 13, fontWeight: active ? 600 : 400,
      color: active ? '#fff' : hov ? '#fff' : 'rgba(255,255,255,0.65)',
      background: active ? 'rgba(255,255,255,0.15)' : hov ? 'rgba(255,255,255,0.09)' : 'transparent',
      textDecoration: 'none', transition: 'all .15s', whiteSpace: 'nowrap',
      borderBottom: active ? '2px solid #4ade80' : '2px solid transparent',
    }}>{label}</Link>
  )
}

// ── Search button ─────────────────────────────────────────────────────────────
function SearchBtn({ onClick }: { onClick: () => void }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
      display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer',
      background: hov ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.07)',
      border: '1px solid rgba(255,255,255,0.14)', borderRadius: 8, padding: '7px 12px',
      transition: 'all .15s', transform: hov ? 'translateY(-1px)' : 'none', fontFamily: 'inherit',
    }}>
      <Search size={14} color={hov ? '#fff' : 'rgba(255,255,255,0.65)'}/>
      <span style={{ fontSize: 13, color: hov ? '#fff' : 'rgba(255,255,255,0.5)', transition: 'color .15s' }}>Search</span>
      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.07)', padding: '1px 5px', borderRadius: 4, fontFamily: 'monospace' }}>⌘K</span>
    </button>
  )
}

// ── User menu ─────────────────────────────────────────────────────────────────
function UserMenu({ profile, signOut }: { profile: any; signOut: () => void }) {
  const [open, setOpen] = useState(false)
  const isAgent = profile.role === 'agent'

  const agentLinks = [
    { icon: <LayoutDashboard size={14}/>, label: 'Dashboard', href: '/dashboard' },
    { icon: <Plus size={14}/>, label: 'Add listing', href: '/dashboard/listings/new' },
    { icon: <User size={14}/>, label: 'My profile', href: '/profile' },
    { icon: <Building2 size={14}/>, label: 'Public profile', href: `/agent/${profile.id}` },
  ]
  const adminLinks = [
    { icon: <Shield size={14}/>, label: 'Admin panel', href: '/admin' },
    { icon: <User size={14}/>, label: 'My profile', href: '/profile' },
  ]
  const buyerLinks = [
    { icon: <Home size={14}/>, label: 'Saved properties', href: '/saved' },
    { icon: <User size={14}/>, label: 'Profile', href: '/profile' },
  ]
  const isAdmin = profile.role === 'admin'
  const menuLinks = isAdmin ? adminLinks : isAgent ? agentLinks : buyerLinks

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(!open)}
        style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 24, padding: '5px 10px 5px 5px', cursor: 'pointer', transition: 'all .15s', fontFamily: 'inherit' }}
        onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.15)'}
        onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.09)'}
      >
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#16a34a,#15803d)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#fff', fontWeight: 700 }}>
          {profile.full_name?.[0]?.toUpperCase() || 'U'}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <span style={{ fontSize: 13, color: '#fff', fontWeight: 600, lineHeight: 1.2 }}>{profile.full_name?.split(' ')[0]}</span>
          <span style={{ fontSize: 9, color: profile.role === 'admin' ? '#f87171' : isAgent ? '#4ade80' : 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '.05em' }}>
            {profile.role === 'admin' ? '⚡ Admin' : isAgent ? '✦ Agent' : 'Buyer'}
          </span>
        </div>
        <ChevronDown size={12} color="rgba(255,255,255,0.5)" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}/>
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 150 }}/>
          <div style={{ position: 'absolute', top: 'calc(100% + 10px)', right: 0, background: '#fff', border: '1px solid #e5e4df', borderRadius: 14, boxShadow: '0 20px 60px rgba(0,0,0,0.18)', minWidth: 215, overflow: 'hidden', zIndex: 200 }}>
            <div style={{ padding: '13px 16px', borderBottom: '1px solid #f0f0ee' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a18' }}>{profile.full_name}</div>
              <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{profile.email}</div>
            </div>
            {menuLinks.map(({ icon, label, href }) => (
              <Link key={label} href={href} onClick={() => setOpen(false)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', textDecoration: 'none', color: '#1a1a18', fontSize: 14, borderBottom: '1px solid #f5f5f2', transition: 'background .1s' }}
                onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.background = '#f9f9f7'}
                onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'}
              >
                <span style={{ color: '#6b7280' }}>{icon}</span>{label}
              </Link>
            ))}
            <button onClick={signOut}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', width: '100%', background: 'none', border: 'none', color: '#dc2626', fontSize: 14, cursor: 'pointer', transition: 'background .1s', fontFamily: 'inherit' }}
              onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = '#fef2f2'}
              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}
            >
              <LogOut size={14}/> Sign out
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// ── Main Navbar ───────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: 'Buy', href: '/search?intent=sale' },
  { label: 'Rent', href: '/search?intent=rent' },
  { label: 'Diaspora', href: '/diaspora' },
  { label: 'AI Reports', href: '/ai-reports' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

export function Navbar() {
  const { profile, signOut } = useAuth()
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll)
    const onKey = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(true) } }
    window.addEventListener('keydown', onKey)
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('keydown', onKey) }
  }, [])

  return (
    <>
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: scrolled ? 'rgba(10,28,17,0.97)' : '#0d2318', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.07)', boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.3)' : 'none', transition: 'all .25s' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', height: 64, padding: '0 24px', display: 'flex', alignItems: 'center', gap: 6 }}>

          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 11, textDecoration: 'none', marginRight: 8, flexShrink: 0 }}>
            <HabeshaLogo/>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', lineHeight: 1.15, letterSpacing: '-.015em' }}>Habesha Homes</div>
              <div style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.38)', letterSpacing: '.09em' }}>ETHIOPIA</div>
            </div>
          </Link>

          {/* AI pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(22,163,74,0.18)', border: '1px solid rgba(22,163,74,0.32)', borderRadius: 20, padding: '3px 9px', marginRight: 6, flexShrink: 0 }}>
            <Sparkles size={11} color="#4ade80"/>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#4ade80', letterSpacing: '.05em' }}>CLAUDE AI</span>
          </div>

          {/* Desktop nav - hidden on mobile */}
          <div className="nav-links-desktop" style={{ display: 'flex', gap: 1, flex: 1, overflow: 'hidden' }}>
            <Suspense fallback={null}>
              {NAV_LINKS.map(l => <NavLink key={l.label} label={l.label} href={l.href}/>)}
            </Suspense>
          </div>

          {/* Right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <SearchBtn onClick={() => setSearchOpen(true)}/>

            {profile ? (
              <UserMenu profile={profile} signOut={signOut}/>
            ) : (
              <div style={{ display: 'flex', gap: 6 }}>
                <Link href="/auth/login"
                  style={{ padding: '7px 14px', fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.7)', textDecoration: 'none', borderRadius: 8, transition: 'all .15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#fff'; (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.09)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.7)'; (e.currentTarget as HTMLAnchorElement).style.background = 'transparent' }}
                >Log in</Link>
                <Link href="/auth/signup"
                  style={{ padding: '7px 18px', fontSize: 13, fontWeight: 600, background: '#16a34a', color: '#fff', borderRadius: 20, textDecoration: 'none', border: '1px solid #15803d', transition: 'all .15s', display: 'inline-block' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#15803d'; (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-1px)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#16a34a'; (e.currentTarget as HTMLAnchorElement).style.transform = 'none' }}
                >Get started</Link>
              </div>
            )}

            <button onClick={() => setMobileOpen(!mobileOpen)} className="mobile-menu-btn" style={{ background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 8, padding: 7, cursor: 'pointer', color: '#fff', display: 'none', alignItems: 'center', fontFamily: 'inherit' }}>
              {mobileOpen ? <X size={18}/> : <Menu size={18}/>}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div style={{ background: '#0d2318', borderTop: '1px solid rgba(255,255,255,0.07)', padding: '8px 24px 20px' }}>
            {NAV_LINKS.map(l => (
              <Link key={l.label} href={l.href} onClick={() => setMobileOpen(false)}
                style={{ display: 'block', padding: '13px 0', fontSize: 15, color: 'rgba(255,255,255,0.85)', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
              >{l.label}</Link>
            ))}
            {profile ? (
              <div style={{ marginTop: 16 }}>
                <div style={{ padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 4 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{profile.full_name}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{profile.email}</div>
                </div>
                {(profile.role === 'agent' || profile.role === 'admin') && (
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)}
                    style={{ display: 'block', padding: '12px 0', fontSize: 14, color: 'rgba(255,255,255,0.8)', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                  >Dashboard</Link>
                )}
                {profile.role === 'agent' && (
                  <Link href="/dashboard/listings/new" onClick={() => setMobileOpen(false)}
                    style={{ display: 'block', padding: '12px 0', fontSize: 14, color: 'rgba(255,255,255,0.8)', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                  >Add listing</Link>
                )}
                {profile.role === 'buyer' && (
                  <Link href="/saved" onClick={() => setMobileOpen(false)}
                    style={{ display: 'block', padding: '12px 0', fontSize: 14, color: 'rgba(255,255,255,0.8)', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                  >Saved properties</Link>
                )}
                <button onClick={() => { setMobileOpen(false); signOut() }}
                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '12px 0', fontSize: 14, color: '#f87171', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', marginTop: 4 }}
                >Sign out</button>
              </div>
            ) : (
              <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                <Link href="/auth/login" onClick={() => setMobileOpen(false)} style={{ flex: 1, textAlign: 'center', padding: 11, background: 'rgba(255,255,255,0.09)', color: '#fff', borderRadius: 10, textDecoration: 'none', fontSize: 14 }}>Log in</Link>
                <Link href="/auth/signup" onClick={() => setMobileOpen(false)} style={{ flex: 1, textAlign: 'center', padding: 11, background: '#16a34a', color: '#fff', borderRadius: 10, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>Get started</Link>
              </div>
            )}
          </div>
        )}
      </nav>
      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)}/>}
    </>
  )
}
