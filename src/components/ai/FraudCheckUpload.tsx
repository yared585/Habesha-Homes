'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Shield, Upload, CheckCircle, AlertTriangle, XCircle, Loader2, FileImage } from 'lucide-react'
import type { FraudCheckResult } from '@/types'

interface FraudCheckUploadProps {
  propertyId: string
  existingResult?: FraudCheckResult | null
}

export function FraudCheckUpload({ propertyId, existingResult }: FraudCheckUploadProps) {
  const [result, setResult] = useState<FraudCheckResult | null>(existingResult || null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [language, setLanguage] = useState<'en' | 'am'>('en')

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) {
      setUploadedFile(acceptedFiles[0])
      setError(null)
      setResult(null)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxSize: 10 * 1024 * 1024,
    multiple: false
  })

  async function runFraudCheck() {
    if (!uploadedFile) return
    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('document', uploadedFile)
      formData.append('property_id', propertyId)

      const res = await fetch('/api/claude/fraud-check', {
        method: 'POST',
        body: formData
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setResult(data.result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const VerdictIcon = result?.verdict === 'safe' ? CheckCircle
    : result?.verdict === 'risky' ? AlertTriangle : XCircle

  const verdictColors = {
    safe: { bg: '#e8fdf4', border: '#1D9E75', text: '#1D9E75', icon: '#1D9E75' },
    risky: { bg: '#fffbeb', border: '#BA7517', text: '#BA7517', icon: '#BA7517' },
    fraud: { bg: '#fef2f2', border: '#E24B4A', text: '#E24B4A', icon: '#E24B4A' }
  }

  const colors = result ? verdictColors[result.verdict] : null

  return (
    <div>
      <div style={{ marginBottom: 20, padding: 16, background: '#f0fdf8', borderRadius: 10, border: '1px solid #1D9E7522' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <Shield size={20} color="#1D9E75" />
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111', margin: 0 }}>
            AI Title Document Fraud Check
          </h3>
        </div>
        <p style={{ fontSize: 13, color: '#555', margin: 0, lineHeight: 1.6 }}>
          Upload the property's title document (ካርታ / ሊዝ ሰነድ) and Claude AI will scan it for fraud,
          forged stamps, duplicate registrations, and legal inconsistencies.
          Get a SAFE / RISKY / FRAUD verdict before paying any deposit.
        </p>
      </div>

      {/* Upload area */}
      {!result && (
        <div>
          <div
            {...getRootProps()}
            style={{
              border: `2px dashed ${isDragActive ? '#1D9E75' : '#ddd'}`,
              borderRadius: 10, padding: 40, textAlign: 'center', cursor: 'pointer',
              background: isDragActive ? '#f0fdf8' : '#fafafa',
              transition: 'all .2s', marginBottom: 16
            }}
          >
            <input {...getInputProps()} />
            {uploadedFile ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <FileImage size={32} color="#1D9E75" />
                <div style={{ fontSize: 15, fontWeight: 600, color: '#111' }}>{uploadedFile.name}</div>
                <div style={{ fontSize: 12, color: '#888' }}>{(uploadedFile.size / 1024).toFixed(0)} KB · Click to change</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <Upload size={32} color="#aaa" />
                <div style={{ fontSize: 15, color: '#555' }}>
                  {isDragActive ? 'Drop the document here' : 'Drag & drop title document here'}
                </div>
                <div style={{ fontSize: 12, color: '#aaa' }}>or click to browse · JPG, PNG, WebP · Max 10MB</div>
                <div style={{ fontSize: 12, color: '#888', marginTop: 8 }}>
                  Accepted: Title deed · Lease certificate · Kebele ownership letter · Land certificate
                </div>
              </div>
            )}
          </div>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', marginBottom: 12, fontSize: 13, color: '#E24B4A' }}>
              {error}
            </div>
          )}

          <button
            onClick={runFraudCheck}
            disabled={!uploadedFile || loading}
            style={{
              width: '100%', background: uploadedFile ? '#111' : '#e0e0e0',
              color: 'white', border: 'none', borderRadius: 10, padding: '14px',
              fontSize: 15, fontWeight: 600, cursor: uploadedFile ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              marginBottom: 12
            }}
          >
            {loading ? (
              <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Analyzing with Claude AI...</>
            ) : (
              <><Shield size={18} /> Run Fraud Analysis — $49</>
            )}
          </button>

          <div style={{ fontSize: 11, color: '#aaa', textAlign: 'center' }}>
            Analysis takes 15–30 seconds · Results are confidential · Payment processed after analysis
          </div>
        </div>
      )}

      {/* Results */}
      {result && colors && (
        <div>
          {/* Verdict banner */}
          <div style={{
            background: colors.bg, border: `2px solid ${colors.border}`,
            borderRadius: 12, padding: 20, marginBottom: 20
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <VerdictIcon size={28} color={colors.icon} />
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: colors.text }}>
                  {result.verdict === 'safe' ? '✓ SAFE — Document appears authentic' :
                   result.verdict === 'risky' ? '⚠ RISKY — Proceed with caution' :
                   '✗ FRAUD DETECTED — Do not proceed'}
                </div>
                <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                  Confidence: {Math.round(result.confidence * 100)}%
                </div>
              </div>
            </div>

            {/* Language toggle for results */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              {['en', 'am'].map(l => (
                <button key={l} onClick={() => setLanguage(l as 'en' | 'am')} style={{
                  background: language === l ? colors.text : 'white',
                  color: language === l ? 'white' : '#888',
                  border: `1px solid ${colors.border}33`, borderRadius: 20,
                  padding: '4px 12px', cursor: 'pointer', fontSize: 12
                }}>
                  {l === 'en' ? 'English' : 'አማርኛ'}
                </button>
              ))}
            </div>

            <p style={{ fontSize: 14, color: '#333', lineHeight: 1.6, margin: 0 }}>
              {language === 'am' ? result.summary_amharic : result.summary}
            </p>
          </div>

          {/* Red flags */}
          {result.red_flags.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: 14, fontWeight: 600, color: '#E24B4A', marginBottom: 10 }}>
                Issues Found ({result.red_flags.length})
              </h4>
              {result.red_flags.map((flag, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 10, padding: '10px 12px', background: '#fef2f2',
                  borderRadius: 8, marginBottom: 8, fontSize: 13, color: '#555'
                }}>
                  <AlertTriangle size={16} color="#E24B4A" style={{ flexShrink: 0, marginTop: 1 }} />
                  {flag}
                </div>
              ))}
            </div>
          )}

          {/* Detailed analysis */}
          <div style={{ marginBottom: 20 }}>
            <h4 style={{ fontSize: 14, fontWeight: 600, color: '#111', marginBottom: 12 }}>
              Detailed Analysis
            </h4>
            <div style={{ display: 'grid', gap: 10 }}>
              {Object.entries(result.analysis).map(([key, value]) => (
                <div key={key} style={{ background: '#f9f9f9', borderRadius: 8, padding: '10px 14px' }}>
                  <div style={{ fontSize: 11, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                    {key.replace(/_/g, ' ')}
                  </div>
                  <div style={{ fontSize: 13, color: '#333', lineHeight: 1.5 }}>{value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendation */}
          <div style={{ background: colors.bg, borderRadius: 10, padding: 16, marginBottom: 16 }}>
            <h4 style={{ fontSize: 14, fontWeight: 600, color: '#111', marginBottom: 8 }}>
              Recommendation
            </h4>
            <p style={{ fontSize: 13, color: '#333', lineHeight: 1.6, margin: 0 }}>
              {language === 'am' ? result.recommendation_amharic : result.recommendation}
            </p>
          </div>

          <button
            onClick={() => { setResult(null); setUploadedFile(null) }}
            style={{
              background: 'none', border: '1px solid #ddd', borderRadius: 8,
              padding: '10px 20px', cursor: 'pointer', fontSize: 13, color: '#666'
            }}
          >
            Check another document
          </button>
        </div>
      )}
    </div>
  )
}
