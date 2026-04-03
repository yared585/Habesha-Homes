'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles } from 'lucide-react'

export default function DashboardAIPage() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/dashboard/listings/new')
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 16 }}>
      <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f0fdf4', border: '2px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Sparkles size={28} color="#16a34a"/>
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111', margin: 0 }}>AI Listing Writer</h2>
      <p style={{ fontSize: 14, color: '#888', margin: 0 }}>Loading AI writer...</p>
      <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
        {[0,1,2].map(i => (
          <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a', animation: `bounce 1s ${i * 0.2}s infinite` }}/>
        ))}
      </div>
      <style>{`@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }`}</style>
    </div>
  )
}
