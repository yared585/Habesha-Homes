'use client'

import Link from 'next/link'
import { Heart, Search } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export default function SavedPage() {
  const { profile, loading } = useAuth(true)

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#aaa', fontSize: 14 }}>
      Loading...
    </div>
  )

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px' }}>
      <h1 style={{ fontSize: 32, fontWeight: 900, color: '#111', marginBottom: 8, letterSpacing: '-.02em' }}>
        Saved properties
      </h1>
      <p style={{ fontSize: 15, color: '#888', marginBottom: 40 }}>Properties you have saved for later</p>

      <div style={{ textAlign: 'center', padding: '60px 0', background: '#fff', borderRadius: 16, border: '1px solid #eae9e4' }}>
        <Heart size={48} color="#d0d0cc" style={{ marginBottom: 16 }}/>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111', marginBottom: 8 }}>No saved properties yet</h3>
        <p style={{ fontSize: 14, color: '#888', marginBottom: 24 }}>
          Browse listings and click the ♥ heart icon to save properties you like
        </p>
        <Link href="/search" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#16a34a', color: '#fff', padding: '11px 22px', borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
          <Search size={15}/> Browse properties
        </Link>
      </div>
    </div>
  )
}
