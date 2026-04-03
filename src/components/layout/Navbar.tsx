'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { Search, LogOut, LayoutDashboard, Plus, User, Home, Building2, ChevronDown, Menu, X, Shield, Heart } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { SearchOverlay } from '@/components/layout/SearchOverlay'

function HabeshaLogo({ size = 46 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="10" fill="#1a3d2b"/>
      <path d="M7 22L20 9L33 22" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="14" y="22" width="12" height="11" rx="2" fill="white" opacity="0.95"/>
      <rect x="17" y="25" width="6" height="8" rx="1.5" fill="#1a3d2b"/>
      <circle cx="31" cy="13" r="4" fill="none" stroke="white" strokeWidth="1.8"/>
      <circle cx="31" cy="13" r="1.5" fill="white" opacity="0.4"/>
      <line x1="35" y1="13" x2="38" y2="13" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="37.2" y1="13" x2="37.2" y2="15.5" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="35.8" y1="13" x2="35.8" y2="16" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}

function NavLink({ label, href, badge }: { label: string; href: string; badge?: string }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [hov, setHov] = useState(false)
  const base = href.split('?')[0]
  const hrefParams = new URLSearchParams(href.split('?')[1] || '')
  const intentParam = hrefParams.get('intent')
  const pathnameMatch = pathname === base || (base !== '/' && pathname.startsWith(base))
  const active = pathnameMatch && (!intentParam || searchParams.get('intent') === intentParam)

  return (
    <Link href={href} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '7px 13px', borderRadius: 8, textDecoration: 'none', fontSize: 13.5,
        fontWeight: active ? 600 : 500,
        letterSpacing: '-.01em',
        color: active ? '#1a3d2b' : hov ? '#1a3d2b' : '#1a1a18',
        background: active ? 'rgba(26,61,43,0.08)' : hov ? 'rgba(26,61,43,0.06)' : 'transparent',
        transition: 'all .15s', whiteSpace: 'nowrap',
      }}
    >
      {label}
      {badge && <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.06em', color: '#4ade80', background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)', padding: '1px 5px', borderRadius: 20 }}>{badge}</span>}
    </Link>
  )
}

function SearchBtn({ onClick }: { onClick: () => void }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', background: '#fff', border: `1px solid ${hov ? 'rgba(26,61,43,0.35)' : '#e5e4df'}`, borderRadius: 9, padding: '7px 13px', transition: 'all .18s', fontFamily: 'inherit', boxShadow: hov ? '0 2px 12px rgba(26,61,43,0.1)' : '0 1px 3px rgba(0,0,0,0.07)' }}
    >
      <Search size={13} color={hov ? '#1a3d2b' : '#888'}/>
      <span className="nav-search-text" style={{ fontSize: 13, color: hov ? '#1a3d2b' : '#888', fontWeight: 500 }}>Search</span>
      <kbd className="nav-search-kbd" style={{ fontSize: 10, color: '#c0bfba', background: '#f5f5f2', padding: '1px 5px', borderRadius: 4, fontFamily: 'monospace', border: '1px solid #e8e7e2' }}>⌘K</kbd>
    </button>
  )
}

function UserMenu({ profile, signOut }: { profile: any; signOut: () => void }) {
  const [open, setOpen] = useState(false)
  const isAgent = profile.role === 'agent'
  const isAdmin = profile.role === 'admin'
  const isDeveloper = profile.role === 'developer'

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
  const developerLinks = [
    { icon: <Building2 size={14}/>, label: 'Developer dashboard', href: '/dashboard/developer' },
    { icon: <User size={14}/>, label: 'My profile', href: '/profile' },
  ]
  const buyerLinks = [
    { icon: <Heart size={14}/>, label: 'Saved properties', href: '/saved' },
    { icon: <User size={14}/>, label: 'Profile', href: '/profile' },
  ]
  const menuLinks = isAdmin ? adminLinks : isDeveloper ? developerLinks : isAgent ? agentLinks : buyerLinks

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(!open)}
        style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(26,61,43,0.05)', border: '1px solid rgba(26,61,43,0.18)', borderRadius: 24, padding: '5px 10px 5px 5px', cursor: 'pointer', transition: 'all .18s', fontFamily: 'inherit', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(26,61,43,0.1)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(26,61,43,0.35)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(26,61,43,0.05)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(26,61,43,0.18)' }}
      >
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#1a3d2b,#2d5a3d)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#fff', fontWeight: 700 }}>
          {profile.full_name?.[0]?.toUpperCase() || 'U'}
        </div>
        <div>
          <div style={{ fontSize: 13, color: '#111', fontWeight: 600, lineHeight: 1.2 }}>{profile.full_name?.split(' ')[0]}</div>
          <div style={{ fontSize: 10, color: '#1a3d2b', fontWeight: 700, letterSpacing: '.04em', textTransform: 'capitalize' }}>{profile.role}</div>
        </div>
        <ChevronDown size={12} color="#aaa" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}/>
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
              ><span style={{ color: '#9ca3af' }}>{icon}</span>{label}</Link>
            ))}
            <button onClick={signOut}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', width: '100%', background: 'none', border: 'none', color: '#dc2626', fontSize: 14, cursor: 'pointer', transition: 'background .1s', fontFamily: 'inherit' }}
              onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = '#fef2f2'}
              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}
            ><LogOut size={14}/> Sign out</button>
          </div>
        </>
      )}
    </div>
  )
}

const NAV_LINKS = [
  { label: 'Buy',          href: '/search?intent=sale' },
  { label: 'Rent',         href: '/search?intent=rent' },
  { label: 'Diaspora',     href: '/diaspora' },
  { label: 'Real Estates', href: '/developments' },
  { label: 'AI Reports',   href: '/ai-reports', badge: 'AI' },
  { label: 'About',        href: '/about' },
  { label: 'Contact',      href: '/contact' },
]

export function Navbar() {
  const { profile, signOut } = useAuth()
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll)
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(true) }
    }
    window.addEventListener('keydown', onKey)
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('keydown', onKey) }
  }, [])

  return (
    <>
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: scrolled ? 'rgba(255,255,255,0.97)' : '#ffffff', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(0,0,0,0.08)', boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.07)' : 'none', transition: 'all .25s' }}>
        <div className="nav-inner" style={{ maxWidth: 1280, margin: '0 auto', height: 68, padding: '0 28px', display: 'flex', alignItems: 'center', gap: 4 }}>

          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginRight: 16, flexShrink: 0 }}>
            <HabeshaLogo/>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#111', lineHeight: 1.15, letterSpacing: '-.02em' }}>Habesha Properties</div>
              <div style={{ fontSize: 8.5, color: '#bbb', letterSpacing: '.14em', fontWeight: 600 }}>ETHIOPIA</div>
            </div>
          </Link>

          <div className="nav-links-desktop" style={{ display: 'flex', gap: 1, flex: 1, alignItems: 'center' }}>
            <Suspense fallback={null}>
              {NAV_LINKS.map(l => <NavLink key={l.label} label={l.label} href={l.href} badge={(l as any).badge}/>)}
            </Suspense>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginLeft: 'auto' }}>
            <SearchBtn onClick={() => setSearchOpen(true)}/>
            {profile ? (
              <>
                <Link
                  href={profile.role === 'buyer' ? '/saved' : profile.role === 'admin' ? '/admin' : profile.role === 'developer' ? '/dashboard/developer' : '/dashboard'}
                  className="nav-dashboard-btn"
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', fontSize: 13, fontWeight: 600, color: '#1a3d2b', background: 'rgba(26,61,43,0.07)', border: '1px solid rgba(26,61,43,0.25)', borderRadius: 8, textDecoration: 'none', whiteSpace: 'nowrap', transition: 'all .15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(26,61,43,0.14)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(26,61,43,0.4)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(26,61,43,0.07)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(26,61,43,0.25)' }}
                >
                  {profile.role === 'buyer' ? <Heart size={13}/> : <LayoutDashboard size={13}/>}
                  {profile.role === 'buyer' ? 'Saved' : 'Dashboard'}
                </Link>
                <UserMenu profile={profile} signOut={signOut}/>
              </>
            ) : (
              <div className="nav-auth-desktop" style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <Link href="/auth/login"
                  style={{ padding: '7px 13px', fontSize: 13.5, fontWeight: 500, color: '#555', textDecoration: 'none', borderRadius: 8, transition: 'all .15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#111'; (e.currentTarget as HTMLAnchorElement).style.background = '#f5f5f2' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#555'; (e.currentTarget as HTMLAnchorElement).style.background = 'transparent' }}
                >Log in</Link>
                <Link href="/auth/signup"
                  style={{ padding: '8px 20px', fontSize: 13.5, fontWeight: 600, background: '#1a3d2b', color: '#fff', borderRadius: 9, textDecoration: 'none', transition: 'all .18s', letterSpacing: '-.01em' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#2d5a3d'; (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-1px)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#1a3d2b'; (e.currentTarget as HTMLAnchorElement).style.transform = 'none' }}
                >Get started</Link>
              </div>
            )}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="mobile-menu-btn"
              style={{ background: '#f5f5f2', border: '1px solid #e8e7e2', borderRadius: 8, padding: 7, cursor: 'pointer', color: '#555', display: 'none', alignItems: 'center', fontFamily: 'inherit' }}>
              {mobileOpen ? <X size={18}/> : <Menu size={18}/>}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div style={{ background: '#fff', borderTop: '1px solid #e8e7e2', padding: '8px 20px 24px' }}>
            {NAV_LINKS.map(l => (
              <Link key={l.label} href={l.href} onClick={() => setMobileOpen(false)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 4px', fontSize: 15, color: '#333', textDecoration: 'none', borderBottom: '1px solid #f0f0ee' }}
              >
                {l.label}
                {(l as any).badge && <span style={{ fontSize: 10, fontWeight: 700, color: '#4ade80', background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)', padding: '2px 7px', borderRadius: 20 }}>{(l as any).badge}</span>}
              </Link>
            ))}
            {profile ? (
              <div style={{ marginTop: 16 }}>
                <div style={{ padding: '12px 4px', borderBottom: '1px solid #f0f0ee', marginBottom: 4 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>{profile.full_name}</div>
                  <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>{profile.email}</div>
                </div>
                {['agent', 'admin', 'developer'].includes(profile.role) && (
                  <Link href={profile.role === 'developer' ? '/dashboard/developer' : '/dashboard'} onClick={() => setMobileOpen(false)}
                    style={{ display: 'block', padding: '12px 4px', fontSize: 14, color: '#333', textDecoration: 'none', borderBottom: '1px solid #f0f0ee' }}>Dashboard</Link>
                )}
                {profile.role === 'buyer' && (
                  <Link href="/saved" onClick={() => setMobileOpen(false)} style={{ display: 'block', padding: '12px 4px', fontSize: 14, color: '#333', textDecoration: 'none', borderBottom: '1px solid #f0f0ee' }}>Saved properties</Link>
                )}
                <button onClick={() => { setMobileOpen(false); signOut() }}
                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '13px 4px', fontSize: 14, color: '#f87171', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', marginTop: 4 }}
                >Sign out</button>
              </div>
            ) : (
              <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                <Link href="/auth/login" onClick={() => setMobileOpen(false)} style={{ flex: 1, textAlign: 'center', padding: 12, background: '#f5f5f2', color: '#333', borderRadius: 10, textDecoration: 'none', fontSize: 14, border: '1px solid #e8e7e2' }}>Log in</Link>
                <Link href="/auth/signup" onClick={() => setMobileOpen(false)} style={{ flex: 1, textAlign: 'center', padding: 12, background: '#1a3d2b', color: '#fff', borderRadius: 10, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>Get started</Link>
              </div>
            )}
          </div>
        )}
      </nav>
      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)}/>}
    </>
  )
}
