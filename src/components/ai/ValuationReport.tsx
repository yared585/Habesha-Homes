'use client'

import { useState } from 'react'
import { TrendingUp, Loader2, BarChart3, Home, DollarSign } from 'lucide-react'
import type { Property, ValuationResult } from '@/types'
import { formatETB, formatUSD } from '@/lib/utils'

interface ValuationReportProps {
  property: Property
  existingValuation?: ValuationResult | null
}

export function ValuationReport({ property, existingValuation }: ValuationReportProps) {
  const [result, setResult] = useState<ValuationResult | null>(existingValuation || null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [language, setLanguage] = useState<'en' | 'am'>('en')

  async function runValuation() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/claude/valuation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ property_id: property.id })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResult(data.result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Valuation failed')
    } finally {
      setLoading(false)
    }
  }

  // Price comparison indicator
  const priceComparison = result && property.price_etb
    ? ((property.price_etb - result.estimated_value_etb) / result.estimated_value_etb * 100)
    : null

  return (
    <div>
      <div style={{ marginBottom: 20, padding: 16, background: '#e6f1fb', borderRadius: 10, border: '1px solid #378ADD22' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <BarChart3 size={20} color="#378ADD" />
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111', margin: 0 }}>AI Property Valuation</h3>
        </div>
        <p style={{ fontSize: 13, color: '#555', margin: 0, lineHeight: 1.6 }}>
          Our AI analyzes comparable sales, neighborhood trends, and property specs to generate
          an instant professional valuation with rental yield and investment recommendation.
        </p>
      </div>

      {!result ? (
        <div>
          {/* What's included */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
            {[
              { icon: <Home size={16} />, text: 'Estimated market value' },
              { icon: <TrendingUp size={16} />, text: 'Price trend analysis' },
              { icon: <DollarSign size={16} />, text: 'Rental yield estimate' },
              { icon: <BarChart3 size={16} />, text: 'Comparable properties' },
            ].map(({ icon, text }) => (
              <div key={text} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: '#f9f9f9', borderRadius: 8, padding: '10px 12px', fontSize: 13, color: '#555'
              }}>
                <span style={{ color: '#378ADD' }}>{icon}</span> {text}
              </div>
            ))}
          </div>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', marginBottom: 12, fontSize: 13, color: '#E24B4A' }}>
              {error}
            </div>
          )}

          <button
            onClick={runValuation}
            disabled={loading}
            style={{
              width: '100%', background: '#378ADD', color: 'white', border: 'none',
              borderRadius: 10, padding: '14px', fontSize: 15, fontWeight: 600,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
            }}
          >
            {loading ? (
              <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Generating valuation...</>
            ) : (
              <><BarChart3 size={18} /> Get AI Valuation — $25</>
            )}
          </button>
        </div>
      ) : (
        <div>
          {/* Language toggle */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {['en', 'am'].map(l => (
              <button key={l} onClick={() => setLanguage(l as 'en' | 'am')} style={{
                background: language === l ? '#378ADD' : 'white',
                color: language === l ? 'white' : '#888',
                border: '1px solid #378ADD33', borderRadius: 20,
                padding: '4px 12px', cursor: 'pointer', fontSize: 12
              }}>
                {l === 'en' ? 'English' : 'አማርኛ'}
              </button>
            ))}
          </div>

          {/* Main valuation */}
          <div style={{ background: '#e6f1fb', borderRadius: 12, padding: 20, marginBottom: 20 }}>
            <div style={{ fontSize: 13, color: '#378ADD', fontWeight: 500, marginBottom: 4 }}>Estimated Market Value</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#111', marginBottom: 4 }}>
              {formatETB(result.estimated_value_etb)}
            </div>
            <div style={{ fontSize: 16, color: '#666', marginBottom: 16 }}>
              ≈ {formatUSD(result.estimated_value_usd)}
            </div>

            <div style={{ background: 'white', borderRadius: 8, padding: '10px 14px', marginBottom: 12, fontSize: 13 }}>
              <span style={{ color: '#888' }}>Price range: </span>
              <span style={{ fontWeight: 600 }}>
                {formatETB(result.price_range.low_etb)} – {formatETB(result.price_range.high_etb)}
              </span>
            </div>

            {/* Asking price comparison */}
            {priceComparison !== null && (
              <div style={{
                background: priceComparison > 5 ? '#fef2f2' : priceComparison < -5 ? '#e8fdf4' : '#fefce8',
                borderRadius: 8, padding: '10px 14px', fontSize: 13,
                color: priceComparison > 5 ? '#E24B4A' : priceComparison < -5 ? '#1D9E75' : '#92400e'
              }}>
                {priceComparison > 5
                  ? `⚠ Asking price is ${priceComparison.toFixed(0)}% above estimated value`
                  : priceComparison < -5
                  ? `✓ Asking price is ${Math.abs(priceComparison).toFixed(0)}% below estimated value — good deal`
                  : `✓ Asking price is within fair market range`}
              </div>
            )}
          </div>

          {/* Investment metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            <div style={{ background: '#f9f9f9', borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 11, color: '#aaa', marginBottom: 4 }}>Rental Yield</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#1D9E75' }}>{result.rental_yield_percent}%</div>
              <div style={{ fontSize: 11, color: '#888' }}>per year</div>
            </div>
            <div style={{ background: '#f9f9f9', borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 11, color: '#aaa', marginBottom: 4 }}>Est. Monthly Rent</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#111' }}>
                {formatETB(result.estimated_monthly_rent_etb)}
              </div>
              <div style={{ fontSize: 11, color: '#888' }}>if you rent it out</div>
            </div>
          </div>

          {/* Market analysis */}
          <div style={{ marginBottom: 16 }}>
            <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Market Analysis</h4>
            <p style={{ fontSize: 13, color: '#555', lineHeight: 1.6, background: '#f9f9f9', borderRadius: 8, padding: 12, margin: 0 }}>
              {language === 'am' ? result.market_analysis_amharic : result.market_analysis}
            </p>
          </div>

          {/* Recommendation */}
          <div style={{ background: '#e8fdf4', border: '1px solid #1D9E7522', borderRadius: 10, padding: 14, marginBottom: 16 }}>
            <h4 style={{ fontSize: 14, fontWeight: 600, color: '#1D9E75', marginBottom: 6 }}>Investment Recommendation</h4>
            <p style={{ fontSize: 13, color: '#333', lineHeight: 1.6, margin: 0 }}>
              {language === 'am' ? result.investment_recommendation_amharic : result.investment_recommendation}
            </p>
          </div>

          {/* Confidence */}
          <div style={{ fontSize: 12, color: '#aaa', textAlign: 'right' }}>
            Analysis confidence: {Math.round(result.confidence * 100)}% ·
            Generated {new Date(result.generated_at).toLocaleDateString()}
          </div>
        </div>
      )}
    </div>
  )
}
