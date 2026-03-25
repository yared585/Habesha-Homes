'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[App Error]', error)
  }, [error])

  return (
    <div style={{
      minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '48px 24px',
    }}>
      <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
        <div style={{
          width: 64, height: 64, borderRadius: 20, background: 'var(--red-light)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px',
        }}>
          <AlertTriangle size={28} color="var(--red)"/>
        </div>

        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', margin: '0 0 10px', letterSpacing: '-.02em' }}>
          Something went wrong
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text-3)', margin: '0 0 32px', lineHeight: 1.6 }}>
          {error.message || 'An unexpected error occurred. Our team has been notified.'}
        </p>

        {error.digest && (
          <p style={{ fontSize: 11, color: 'var(--text-4)', margin: '-20px 0 32px', fontFamily: 'var(--font-mono)' }}>
            Error ID: {error.digest}
          </p>
        )}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={reset}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '11px 20px', background: 'var(--green)', color: '#fff',
              border: 'none', borderRadius: 'var(--r-lg)', fontSize: 14, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            <RefreshCw size={15}/> Try again
          </button>
          <Link
            href="/"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '11px 20px', background: 'var(--surface-2)', color: 'var(--text-2)',
              borderRadius: 'var(--r-lg)', fontSize: 14, fontWeight: 500,
              textDecoration: 'none', border: '1px solid var(--border)',
            }}
          >
            <Home size={15}/> Go home
          </Link>
        </div>
      </div>
    </div>
  )
}
