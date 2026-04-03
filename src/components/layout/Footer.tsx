'use client'

import Link from 'next/link'

export function Footer() {
  return (
    <footer style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', padding: '56px 24px 32px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 40, marginBottom: 48 }}>
          {[
            { title: 'Properties', links: [['Buy a home', '/search?intent=sale'], ['Rent a home', '/search?intent=rent'], ['Diaspora investing', '/diaspora'], ['New developments', '/developments']] },
            { title: 'AI Tools', links: [['Property assistant', '/ai-reports'], ['Fraud detection', '/ai-reports'], ['Valuation report', '/ai-reports'], ['Contract analyzer', '/ai-reports']] },
            { title: 'For agents', links: [['List properties', '/auth/signup'], ['Dashboard', '/dashboard'], ['Pricing plans', '/pricing'], ['AI listing writer', '/dashboard/listings/new']] },
          ].map(({ title, links }) => (
            <div key={title}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 14 }}>{title}</div>
              {links.map(([label, href]) => (
                <Link key={label} href={href} style={{ display: 'block', fontSize: 13, color: 'var(--text-3)', textDecoration: 'none', marginBottom: 9, transition: 'color .15s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--green)'}
                  onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-3)'}
                >
                  {label}
                </Link>
              ))}
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontSize: 12, color: 'var(--text-4)' }}>© 2026 Habesha Properties · Built for Ethiopia 🇪🇹</span>
          <div style={{ display: 'flex', gap: 20 }}>
            {['Privacy', 'Terms', 'Contact'].map(l => (
              <Link key={l} href={`/${l.toLowerCase()}`} style={{ fontSize: 12, color: 'var(--text-4)', textDecoration: 'none' }}>{l}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
