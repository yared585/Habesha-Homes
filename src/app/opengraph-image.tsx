import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Habesha Properties - Ethiopia Property Marketplace'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0d1f15 0%, #1a3d2b 60%, #0d2318 100%)',
          fontFamily: 'serif',
        }}
      >
        {/* Logo box */}
        <div style={{
          width: 100, height: 100, background: '#1a3d2b',
          borderRadius: 24, border: '3px solid #4ade80',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 32, fontSize: 48
        }}>
          🏠
        </div>

        {/* Title */}
        <div style={{
          fontSize: 72, fontWeight: 900, color: '#ffffff',
          letterSpacing: '-2px', marginBottom: 16, textAlign: 'center'
        }}>
          Habesha Properties
        </div>

        {/* Subtitle */}
        <div style={{
          fontSize: 32, color: '#86efac', marginBottom: 48, textAlign: 'center'
        }}>
          Ethiopia&apos;s #1 Property Marketplace
        </div>

        {/* Features row */}
        <div style={{ display: 'flex', gap: 24 }}>
          {['🏡 Buy & Rent', '🔍 AI Fraud Check', '📊 Valuations', '🌍 Diaspora'].map(f => (
            <div key={f} style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 12, padding: '10px 20px',
              color: '#fff', fontSize: 20
            }}>{f}</div>
          ))}
        </div>

        {/* URL */}
        <div style={{
          position: 'absolute', bottom: 40,
          fontSize: 24, color: '#4ade80', fontWeight: 600
        }}>
          habeshaproperties.com
        </div>

        {/* Ethiopian flag colors at bottom */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex', height: 8 }}>
          <div style={{ flex: 1, background: '#078930' }}/>
          <div style={{ flex: 1, background: '#FCDD09' }}/>
          <div style={{ flex: 1, background: '#DA121A' }}/>
        </div>
      </div>
    ),
    { ...size }
  )
}
