import Link from 'next/link'
import { Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '48px 24px',
    }}>
      <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
        <div style={{
          fontSize: 80, fontWeight: 900, color: 'var(--surface-3)',
          lineHeight: 1, margin: '0 0 8px', letterSpacing: '-.04em',
          fontFamily: 'var(--font-body)',
        }}>404</div>

        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', margin: '0 0 10px', letterSpacing: '-.02em' }}>
          Page not found
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text-3)', margin: '0 0 32px', lineHeight: 1.6 }}>
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '11px 20px', background: 'var(--green)', color: '#fff',
              borderRadius: 'var(--r-lg)', fontSize: 14, fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            <Home size={15}/> Go home
          </Link>
          <Link
            href="/search"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '11px 20px', background: 'var(--surface-2)', color: 'var(--text-2)',
              borderRadius: 'var(--r-lg)', fontSize: 14, fontWeight: 500,
              textDecoration: 'none', border: '1px solid var(--border)',
            }}
          >
            <Search size={15}/> Browse properties
          </Link>
        </div>
      </div>
    </div>
  )
}
