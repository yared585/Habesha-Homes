import Link from 'next/link'
import { XCircle, ArrowLeft } from 'lucide-react'

export default function PaymentCancelPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f9f9f7', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 420, width: '100%', textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#fef2f2', border: '2px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <XCircle size={36} color="#dc2626"/>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: '#111', marginBottom: 8 }}>Payment cancelled</h1>
        <p style={{ fontSize: 15, color: '#888', marginBottom: 32, lineHeight: 1.6 }}>
          No worries — you have not been charged. You can try again whenever you're ready.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <Link href="/ai-reports" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#16a34a', color: '#fff', padding: '12px 24px', borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
            Try again
          </Link>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#fff', color: '#555', border: '1px solid #eae9e4', padding: '12px 20px', borderRadius: 10, fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>
            <ArrowLeft size={14}/> Back home
          </Link>
        </div>
      </div>
    </div>
  )
}
