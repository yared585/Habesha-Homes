'use client'

import React from 'react'
import Link from 'next/link'
import { usePropertyCounts } from '@/hooks/useProperties'

const CATEGORIES = [
  {
    key: 'house',
    label: 'Houses',
    href: '/search?types=house',
    icon: (
      <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
        <rect x="8" y="26" width="36" height="22" rx="2" fill="#d4e8d0"/>
        <polygon points="26,8 6,28 46,28" fill="#1a3d2b"/>
        <rect x="20" y="32" width="12" height="16" rx="1" fill="#1a3d2b" opacity="0.7"/>
        <rect x="22" y="34" width="4" height="6" rx="0.5" fill="#fff" opacity="0.6"/>
        <rect x="28" y="34" width="4" height="6" rx="0.5" fill="#fff" opacity="0.6"/>
        <circle cx="38" cy="18" r="6" fill="#4ade80" opacity="0.8"/>
        <rect x="36" y="16" width="4" height="10" rx="1" fill="#15803d"/>
      </svg>
    ),
  },
  {
    key: 'apartment',
    label: 'Apartments',
    href: '/search?types=apartment',
    icon: (
      <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
        <rect x="10" y="10" width="32" height="34" rx="2" fill="#dbeafe"/>
        <rect x="10" y="10" width="32" height="8" rx="2" fill="#3b82f6" opacity="0.7"/>
        <rect x="14" y="22" width="6" height="5" rx="0.5" fill="#93c5fd"/>
        <rect x="23" y="22" width="6" height="5" rx="0.5" fill="#93c5fd"/>
        <rect x="32" y="22" width="6" height="5" rx="0.5" fill="#93c5fd"/>
        <rect x="14" y="30" width="6" height="5" rx="0.5" fill="#93c5fd"/>
        <rect x="23" y="30" width="6" height="5" rx="0.5" fill="#93c5fd"/>
        <rect x="32" y="30" width="6" height="5" rx="0.5" fill="#93c5fd"/>
        <rect x="21" y="38" width="10" height="6" rx="1" fill="#2563eb" opacity="0.6"/>
      </svg>
    ),
  },
  {
    key: 'developments',
    label: 'New developments',
    href: '/developments',
    icon: (
      <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
        <rect x="6" y="44" width="40" height="3" rx="1" fill="#d1d5db"/>
        <rect x="14" y="24" width="14" height="20" rx="1" fill="#fbbf24" opacity="0.8"/>
        <rect x="30" y="30" width="12" height="14" rx="1" fill="#f59e0b" opacity="0.7"/>
        <polygon points="14,24 21,12 28,24" fill="#1a3d2b"/>
        <rect x="18" y="30" width="4" height="6" rx="0.5" fill="#fff" opacity="0.7"/>
        <rect x="10" y="20" width="4" height="24" rx="1" fill="#9ca3af" opacity="0.6"/>
        <rect x="8" y="16" width="8" height="2" rx="1" fill="#ef4444"/>
      </svg>
    ),
  },
  {
    key: 'land',
    label: 'Land plots',
    href: '/search?types=land',
    icon: (
      <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
        <ellipse cx="26" cy="40" rx="20" ry="6" fill="#d4a574" opacity="0.5"/>
        <path d="M6 38 Q14 20 26 22 Q36 24 46 38" fill="#86efac" opacity="0.7"/>
        <path d="M6 38 Q14 28 22 30 Q28 32 36 26 Q42 22 46 38" fill="#4ade80" opacity="0.5"/>
        <circle cx="36" cy="18" r="5" fill="#fbbf24" opacity="0.9"/>
        <path d="M32 24 L28 32" stroke="#92400e" strokeWidth="1.5" strokeLinecap="round"/>
        <rect x="10" y="32" width="3" height="8" rx="1" fill="#92400e"/>
        <ellipse cx="11.5" cy="28" rx="5" ry="6" fill="#16a34a" opacity="0.8"/>
      </svg>
    ),
  },
  {
    key: 'commercial',
    label: 'Commercial',
    href: '/search?types=commercial',
    icon: (
      <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
        <rect x="8" y="20" width="36" height="26" rx="2" fill="#e9d5ff" opacity="0.8"/>
        <rect x="8" y="20" width="36" height="8" rx="2" fill="#7c3aed" opacity="0.7"/>
        <rect x="12" y="30" width="5" height="5" rx="0.5" fill="#a78bfa"/>
        <rect x="20" y="30" width="5" height="5" rx="0.5" fill="#a78bfa"/>
        <rect x="28" y="30" width="5" height="5" rx="0.5" fill="#a78bfa"/>
        <rect x="36" y="30" width="5" height="5" rx="0.5" fill="#a78bfa"/>
        <rect x="20" y="37" width="12" height="9" rx="1" fill="#6d28d9" opacity="0.6"/>
        <rect x="18" y="14" width="16" height="6" rx="1" fill="#7c3aed" opacity="0.4"/>
        <rect x="22" y="10" width="8" height="4" rx="1" fill="#7c3aed" opacity="0.3"/>
      </svg>
    ),
  },
]

export function PropertyCategories() {
  const { counts, loading } = usePropertyCounts()

  function fmt(key: string, n: number): React.ReactNode {
    if (loading) return '...'
    if (key === 'developments') return n === 0 ? '0 projects' : `${n} projects`
    if (n === 0) return <span style={{ background: '#f0f0ec', color: '#bbb', fontSize: 10, fontWeight: 600, padding: '1px 7px', borderRadius: 10 }}>Soon</span>
    return n === 1 ? '1 listing' : `${n.toLocaleString()} listings`
  }

  return (
    <section style={{ background: '#fff', borderTop: '1px solid #ebebeb', borderBottom: '1px solid #ebebeb' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', overflowX: 'auto', scrollbarWidth: 'none' as const, gap: 4 }}>
        {CATEGORIES.map(({ key, label, href, icon }) => (
          <Link
            key={key}
            href={href}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 8, padding: '18px 28px', textDecoration: 'none',
              borderBottom: '2px solid transparent', transition: 'all .2s',
              flexShrink: 0, opacity: 0.85,
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.borderBottomColor = '#1a3d2b'
              el.style.opacity = '1'
              el.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.borderBottomColor = 'transparent'
              el.style.opacity = '0.85'
              el.style.transform = 'none'
            }}
          >
            {icon}
            <span style={{ fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap', color: '#222' }}>{label}</span>
            <span style={{ fontSize: 11, color: '#aaa', whiteSpace: 'nowrap' }}>{fmt(key, counts[key] || 0)}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
