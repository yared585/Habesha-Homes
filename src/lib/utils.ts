// src/lib/utils.ts

const USD_TO_ETB = parseFloat(process.env.NEXT_PUBLIC_USD_TO_ETB_RATE || '56.5')

// ---- Currency formatting ----
export function formatETB(amount: number | null | undefined): string {
  if (!amount) return 'Contact for price'
  if (amount >= 1_000_000) return `ETB ${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `ETB ${(amount / 1_000).toFixed(0)}K`
  return `ETB ${amount.toLocaleString()}`
}

export function formatUSD(amount: number | null | undefined): string {
  if (!amount) return ''
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`
  return `$${amount.toLocaleString()}`
}

export function etbToUsd(etb: number): number {
  return Math.round(etb / USD_TO_ETB)
}

export function usdToEtb(usd: number): number {
  return Math.round(usd * USD_TO_ETB)
}

// ---- Class merging ----
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

// ---- Property helpers ----
export function getPropertyDisplayPrice(
  property: { price_etb?: number | null; price_usd?: number | null; rent_per_month_etb?: number | null; listing_intent: string },
  currency: 'ETB' | 'USD' = 'ETB'
): string {
  const isRent = property.listing_intent === 'rent'
  const etbAmount = isRent ? property.rent_per_month_etb : property.price_etb
  const usdAmount = isRent ? (property.rent_per_month_etb ? etbToUsd(property.rent_per_month_etb) : property.price_usd) : property.price_usd

  if (currency === 'USD' && usdAmount) {
    return formatUSD(usdAmount) + (isRent ? '/mo' : '')
  }
  return formatETB(etbAmount) + (isRent ? '/mo' : '')
}

// ---- Date helpers ----
export function timeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}

// ---- Validation ----
export function isEthiopianPhone(phone: string): boolean {
  const cleaned = phone.replace(/\s+/g, '').replace(/[-+]/g, '')
  // Ethiopian phone: +251 9X XXX XXXX or 09X XXX XXXX
  return /^(251|0)9[0-9]{8}$/.test(cleaned)
}

// ---- Image helpers ----
export function getPropertyImageUrl(path: string | null, fallback = '/images/property-placeholder.jpg'): string {
  if (!path) return fallback
  if (path.startsWith('http')) return path
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/property-images/${path}`
}

// ---- Score helpers ----
export function getScoreColor(score: number): string {
  if (score >= 8) return '#1D9E75'
  if (score >= 6) return '#BA7517'
  return '#E24B4A'
}

export function getScoreLabel(score: number): string {
  if (score >= 8) return 'Excellent'
  if (score >= 6) return 'Good'
  if (score >= 4) return 'Fair'
  return 'Poor'
}

// ---- Fraud verdict helpers ----
export function getFraudVerdictColor(verdict: string): string {
  switch (verdict) {
    case 'safe': return '#1D9E75'
    case 'risky': return '#BA7517'
    case 'fraud': return '#E24B4A'
    default: return '#888'
  }
}

export function getFraudVerdictLabel(verdict: string, lang: 'en' | 'am' = 'en'): string {
  const labels: Record<string, Record<string, string>> = {
    safe: { en: '✓ Safe to proceed', am: '✓ ደህና ነው — መቀጠል ይቻላል' },
    risky: { en: '⚠ Proceed with caution', am: '⚠ ጥንቃቄ ያስፈልጋል' },
    fraud: { en: '✗ Do not proceed', am: '✗ አይቀጥሉ — አደጋ አለ' }
  }
  return labels[verdict]?.[lang] || verdict
}
