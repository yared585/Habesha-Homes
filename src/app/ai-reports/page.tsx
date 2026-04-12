'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, Shield, TrendingUp, FileText, MessageCircle, Sparkles, Upload, Search, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'

// ── Fraud Check Section ────────────────────────────────────────────────────
function FraudCheckSection() {
  const { profile } = useAuth()
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [paid, setPaid] = useState(false)

  async function handleSubmit() {
    if (!file) { setError('Please upload a title document first'); return }
    if (!profile) { window.location.href = '/auth/login'; return }
    setLoading(true)
    setError('')
    try {
      // Run fraud check directly
      const formData = new FormData()
      formData.append('document', file)
      formData.append('property_id', '')
      const res = await fetch('/api/claude/fraud-check', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Fraud check failed')
      setResult(data.result)
    } catch (err: any) {
      setError(err.message || 'Valuation failed - please try again')
    } finally {
      setLoading(false)
    }
  }

  const verdictColor = result?.verdict === 'SAFE' ? '#16a34a' : result?.verdict === 'FRAUD' ? '#dc2626' : '#d97706'

  return (
    <div style={{ background: '#fff', border: '1px solid #eae9e4', borderRadius: 18, padding: 28 }}>
      <div style={{ fontSize: 36, marginBottom: 14 }}>🔍</div>
      <div style={{ fontWeight: 800, fontSize: 20, color: '#111', marginBottom: 4 }}>Title Fraud Detector</div>
      <div style={{ fontSize: 13, color: '#aaa', marginBottom: 14 }}>ማጭበርበር መፈለጊያ</div>
      <p style={{ fontSize: 14, color: '#555', lineHeight: 1.7, marginBottom: 20 }}>
        Upload a photo of any title document. Claude Vision AI analyzes stamps, signatures, ownership chain, and registration details.
      </p>

      {!result ? (
        <>
          {/* Upload area */}
          <label style={{ display: 'block', border: `2px dashed ${file ? '#16a34a' : '#e0dfd9'}`, borderRadius: 12, padding: 24, textAlign: 'center', cursor: 'pointer', background: file ? '#f0fdf4' : '#fafaf8', marginBottom: 14, transition: 'all .15s' }}>
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { setFile(e.target.files?.[0] || null); setError('') }}/>
            {file ? (
              <>
                <CheckCircle size={28} color="#16a34a" style={{ marginBottom: 8 }}/>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#111' }}>{file.name}</div>
                <div style={{ fontSize: 12, color: '#888' }}>{(file.size / 1024).toFixed(0)} KB · Click to change</div>
              </>
            ) : (
              <>
                <Upload size={28} color="#aaa" style={{ marginBottom: 8 }}/>
                <div style={{ fontSize: 14, color: '#555', fontWeight: 600 }}>Upload title document</div>
                <div style={{ fontSize: 12, color: '#aaa', marginTop: 4 }}>JPG, PNG or WebP · Max 10MB</div>
              </>
            )}
          </label>

          {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#dc2626', marginBottom: 14 }}>{error}</div>}

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, padding: '10px 14px', background: '#fef9ec', borderRadius: 8, border: '1px solid #fde68a' }}>
            <span style={{ fontSize: 13, color: '#92400e' }}>⚡ Free for registered users · Results in 30 seconds</span>
          </div>

          <button onClick={handleSubmit} disabled={!file || loading}
            style={{ width: '100%', background: !file || loading ? '#9ca3af' : '#dc2626', color: '#fff', border: 'none', padding: '13px', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: !file || loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
          >
            {loading ? 'Analyzing document...' : '🔍 Check for fraud — Free'}
          </button>
        </>
      ) : (
        <div style={{ background: `${verdictColor}10`, border: `1px solid ${verdictColor}40`, borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: verdictColor, marginBottom: 8 }}>
            {result.verdict === 'SAFE' ? '✅' : result.verdict === 'FRAUD' ? '🚨' : '⚠️'} {result.verdict}
          </div>
          <div style={{ fontSize: 14, color: '#555', lineHeight: 1.7, marginBottom: 12 }}>{result.summary}</div>
          {result.red_flags?.length > 0 && (
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#dc2626', marginBottom: 8 }}>Red flags:</div>
              {result.red_flags.map((f: string, i: number) => (
                <div key={i} style={{ fontSize: 13, color: '#555', marginBottom: 4 }}>• {f}</div>
              ))}
            </div>
          )}
          <button onClick={() => { setResult(null); setFile(null) }}
            style={{ marginTop: 16, background: 'none', border: '1px solid #e0dfd9', padding: '8px 16px', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}
          >Check another document</button>
        </div>
      )}
    </div>
  )
}

// ── Valuation Section ──────────────────────────────────────────────────────
function ValuationSection() {
  const { profile } = useAuth()
  const [propertyUrl, setPropertyUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  async function handleSubmit() {
    if (!propertyUrl) { setError('Please enter a property URL or ID'); return }
    if (!profile) { window.location.href = '/auth/login'; return }
    setLoading(true)
    setError('')
    try {
      // Extract property ID from URL
      const propertyId = propertyUrl.includes('/property/') 
        ? propertyUrl.split('/property/')[1].split('?')[0].trim()
        : propertyUrl.trim()
      
      const res = await fetch('/api/claude/valuation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ property_id: propertyId })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Valuation failed')
      if (!data.result) throw new Error('No result returned - please try again')
      setResult(data.result)
    } catch (err: any) {
      setError(err.message || 'Valuation failed - please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ background: '#fff', border: '1px solid #eae9e4', borderRadius: 18, padding: 28 }}>
      <div style={{ fontSize: 36, marginBottom: 14 }}>📊</div>
      <div style={{ fontWeight: 800, fontSize: 20, color: '#111', marginBottom: 4 }}>Property Valuation</div>
      <div style={{ fontSize: 13, color: '#aaa', marginBottom: 14 }}>AI ዋጋ ግምት</div>
      <p style={{ fontSize: 14, color: '#555', lineHeight: 1.7, marginBottom: 20 }}>
        Get an instant AI valuation for any property on Habesha Properties. Shows price range in ETB and USD, rental yield, and investment recommendation.
      </p>

      {!result ? (
        <>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>Property URL or ID</label>
            <input type="text" placeholder="https://habeshaproperties.com/property/... or paste property ID"
              value={propertyUrl} onChange={e => { setPropertyUrl(e.target.value); setError('') }}
              style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #e0dfd9', borderRadius: 9, fontSize: 13, outline: 'none', fontFamily: 'inherit' }}
              onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#1a3d2b'}
              onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#e0dfd9'}
            />
          </div>

          <div style={{ marginBottom: 14, padding: '10px 14px', background: '#eff6ff', borderRadius: 8, border: '1px solid #bfdbfe', fontSize: 13, color: '#1d4ed8' }}>
            💡 Go to any property page on our site and copy the URL, then paste it here
          </div>

          {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#dc2626', marginBottom: 14 }}>{error}</div>}

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, padding: '10px 14px', background: '#fef9ec', borderRadius: 8, border: '1px solid #fde68a' }}>
            <span style={{ fontSize: 13, color: '#92400e' }}>⚡ Free for registered users · Results in under 1 minute</span>
          </div>

          <button onClick={handleSubmit} disabled={!propertyUrl || loading}
            style={{ width: '100%', background: !propertyUrl || loading ? '#9ca3af' : '#2563eb', color: '#fff', border: 'none', padding: '13px', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: !propertyUrl || loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
          >
            {loading ? 'Generating valuation...' : '📊 Get valuation — Free'}
          </button>

          <div style={{ marginTop: 12, textAlign: 'center' }}>
            <Link href="/search" style={{ fontSize: 13, color: '#2563eb', textDecoration: 'none' }}>Browse properties to valuate →</Link>
          </div>
        </>
      ) : (
        <div>
          {/* Estimated value */}
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, padding: 20, marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>Estimated Market Value</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#1d4ed8', marginBottom: 2 }}>
              ETB {result.estimated_value_etb?.toLocaleString()}
            </div>
            <div style={{ fontSize: 14, color: '#555' }}>≈ ${result.estimated_value_usd?.toLocaleString()}</div>
          </div>

          {/* Range + price vs market */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
            <div style={{ background: '#f9f9f7', borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ fontSize: 11, color: '#aaa', marginBottom: 4 }}>Price Range</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>ETB {result.value_range_low?.toLocaleString()}</div>
              <div style={{ fontSize: 11, color: '#aaa' }}>to ETB {result.value_range_high?.toLocaleString()}</div>
            </div>
            <div style={{ background: '#f9f9f7', borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ fontSize: 11, color: '#aaa', marginBottom: 4 }}>vs Market</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: result.price_vs_market?.includes('-') ? '#16a34a' : '#dc2626' }}>{result.price_vs_market}</div>
              <div style={{ fontSize: 11, color: '#aaa' }}>avg ETB {result.market_avg_per_sqm?.toLocaleString()}/m²</div>
            </div>
          </div>

          {/* Metrics row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 12 }}>
            <div style={{ background: '#f0fdf4', borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ fontSize: 11, color: '#aaa', marginBottom: 4 }}>Rental Yield</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#16a34a' }}>{result.rental_yield}%</div>
              <div style={{ fontSize: 11, color: '#aaa' }}>per year</div>
            </div>
            <div style={{ background: '#f9f9f7', borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ fontSize: 11, color: '#aaa', marginBottom: 4 }}>Price/m²</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>ETB {result.price_per_sqm?.toLocaleString()}</div>
            </div>
            <div style={{ background: result.recommendation === 'BUY' ? '#f0fdf4' : result.recommendation === 'AVOID' ? '#fef2f2' : '#fefce8', borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ fontSize: 11, color: '#aaa', marginBottom: 4 }}>Verdict</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: result.recommendation === 'BUY' ? '#16a34a' : result.recommendation === 'AVOID' ? '#dc2626' : '#d97706' }}>{result.recommendation}</div>
              <div style={{ fontSize: 11, color: '#555' }}>{result.investment_verdict}</div>
            </div>
          </div>

          {/* Summary */}
          {result.summary && (
            <div style={{ background: '#f9f9f7', borderRadius: 10, padding: '12px 14px', marginBottom: 12 }}>
              <div style={{ fontSize: 13, color: '#444', lineHeight: 1.7 }}>{result.summary}</div>
              {result.summary_amharic && <div style={{ fontSize: 12, color: '#888', marginTop: 6, lineHeight: 1.6 }}>{result.summary_amharic}</div>}
            </div>
          )}

          <button onClick={() => { setResult(null); setPropertyUrl('') }}
            style={{ background: 'none', border: '1px solid #e0dfd9', padding: '8px 16px', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}
          >Valuate another property</button>
        </div>
      )}
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function AIReportsPage() {
  return (
    <div>
      {/* Hero */}
      <section style={{ background: '#fff', borderBottom: '1px solid #eae9e4', padding: '64px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 20, padding: '5px 14px', marginBottom: 20 }}>
            <Sparkles size={12} color="#16a34a"/>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#15803d' }}>AI-powered intelligence</span>
          </div>
          <h1 style={{ fontSize: 'clamp(32px,5vw,52px)', fontWeight: 900, color: '#111', margin: '0 0 16px', letterSpacing: '-.025em' }}>
            AI-powered property intelligence
          </h1>
          <p style={{ fontSize: 17, color: '#666', maxWidth: 540, margin: '0 auto 32px', lineHeight: 1.7 }}>
            Professional fraud detection and valuations — in Amharic and English. Free for registered users.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/search" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#1a3d2b', color: '#fff', padding: '12px 24px', borderRadius: 12, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
              Try AI chat free <ArrowRight size={14}/>
            </Link>
            <Link href="/auth/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '12px 20px', borderRadius: 12, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
              Create free account
            </Link>
          </div>
        </div>
      </section>

      {/* Main tools */}
      <section style={{ padding: '60px 24px', background: '#fafaf8' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#111', marginBottom: 8, textAlign: 'center' }}>AI Tools</h2>
          <p style={{ fontSize: 15, color: '#888', textAlign: 'center', marginBottom: 40 }}>Free for all registered users</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(340px,1fr))', gap: 24 }}>
            <FraudCheckSection/>
            <ValuationSection/>
          </div>
        </div>
      </section>

      {/* Other services */}
      <section style={{ padding: '60px 24px', background: '#fff', borderTop: '1px solid #eae9e4' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#111', marginBottom: 8, textAlign: 'center' }}>More services</h2>
          <p style={{ fontSize: 15, color: '#888', textAlign: 'center', marginBottom: 40 }}>Coming soon — contact us to request</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20 }}>
            {[
              { icon: '📄', title: 'Contract Analyzer', amh: 'ውል ፈታኝ', desc: 'Upload any lease or sale contract. Claude reads every clause and highlights dangerous ones in Amharic.', price: 'Coming soon', color: '#d97706' },
              { icon: '🏘️', title: 'Neighborhood Report', amh: 'ሰፈር ሪፖርት', desc: 'Full neighborhood intelligence — safety score, transport, flood risk, price trends, and 5-year outlook.', price: 'Coming soon', color: '#7c3aed' },
              { icon: '🌍', title: 'Diaspora Package', amh: 'ዲያስፖራ ጥቅል', desc: 'Everything needed to buy Ethiopian property from abroad — fraud check, valuation, contract, and buying guide.', price: 'Coming soon', color: '#1a3d2b' },
            ].map(({ icon, title, amh, desc, price, color }) => (
              <div key={title} style={{ background: '#f9f9f7', border: '1px solid #eae9e4', borderRadius: 16, padding: 24 }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{icon}</div>
                <div style={{ fontWeight: 700, fontSize: 16, color: '#111', marginBottom: 4 }}>{title}</div>
                <div style={{ fontSize: 12, color: '#aaa', marginBottom: 12 }}>{amh}</div>
                <div style={{ fontSize: 13, color: '#666', lineHeight: 1.6, marginBottom: 16 }}>{desc}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 12 }}>{price}</div>
                <Link href="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#1a3d2b', textDecoration: 'none', fontWeight: 600 }}>
                  Contact us <ArrowRight size={12}/>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Claude */}
      <section style={{ padding: '60px 24px', background: '#fafaf8', borderTop: '1px solid #eae9e4' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 900, color: '#111', margin: '0 0 14px' }}>Why our AI tools?</h2>
            <p style={{ fontSize: 15, color: '#666', lineHeight: 1.7, marginBottom: 24 }}>
              The only AI property platform that handles Amharic fluently — reading entire legal contracts in one shot.
            </p>
            {[
              { icon: <MessageCircle size={18}/>, t: 'Speaks Amharic fluently', d: 'Native Amharic support — not translation. Understands Ethiopian legal terminology.' },
              { icon: <FileText size={18}/>, t: 'Reads full contracts', d: 'Reads your entire lease or sale agreement in one go — no page limits.' },
              { icon: <Shield size={18}/>, t: 'Vision AI for documents', d: 'Analyzes photos of title documents, detecting forged stamps and inconsistencies.' },
            ].map(({ icon, t, d }) => (
              <div key={t} style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a', flexShrink: 0 }}>{icon}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#111', marginBottom: 4 }}>{t}</div>
                  <div style={{ fontSize: 13, color: '#666', lineHeight: 1.5 }}>{d}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: '#0d2318', borderRadius: 20, padding: 32 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#4ade80', marginBottom: 16 }}>🤖 AI Assistant — live example</div>
            {[
              { role: 'user', msg: 'ዋጋው ለቦሌ ትክክለኛ ነው? Is ETB 2.8M fair for this apartment?' },
              { role: 'ai', msg: 'Based on current Bole market data (ETB 65,000-80,000/m²), this 45m² apartment should be priced ETB 2.9M-3.6M. At ETB 2.8M it is slightly below market — a good deal. Rental yield estimate: 8.2%/year. ዋጋው ጥሩ ነው!' },
            ].map(({ role, msg }) => (
              <div key={msg} style={{ marginBottom: 12, display: 'flex', justifyContent: role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{ maxWidth: '85%', padding: '10px 14px', borderRadius: 12, background: role === 'user' ? '#1a3d2b' : 'rgba(255,255,255,0.08)', color: '#fff', fontSize: 13, lineHeight: 1.6 }}>
                  {msg}
                </div>
              </div>
            ))}
            <div style={{ marginTop: 16, padding: '10px 14px', background: 'rgba(74,222,128,0.1)', borderRadius: 10, fontSize: 12, color: '#4ade80' }}>
              ⚡ Response in under 2 seconds · Available 24/7 · Free on every listing
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
