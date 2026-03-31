// ============================================================
// HABESHA HOMES — APPLICATION TYPES
// ============================================================

export type PropertyType = 
  | 'apartment' | 'villa' | 'house' | 'condominium'
  | 'commercial' | 'land' | 'office' | 'warehouse'

export type ListingStatus = 
  | 'draft' | 'pending_review' | 'active' | 'sold'
  | 'rented' | 'withdrawn' | 'expired'

export type ListingIntent = 'sale' | 'rent' | 'both'
export type UserRole = 'buyer' | 'seller' | 'agent' | 'admin' | 'developer'
export type Language = 'en' | 'am'
export type ReportType = 'valuation' | 'fraud_check' | 'contract_analysis' | 'neighborhood' | 'investment_roi'

// ---- Profile ----
export interface Profile {
  id: string
  email: string
  full_name: string | null
  full_name_amharic: string | null
  phone: string | null
  avatar_url: string | null
  role: UserRole
  preferred_language: Language
  is_diaspora: boolean
  diaspora_country: string | null
  verification_status: 'unverified' | 'pending' | 'verified' | 'rejected'
  created_at: string
}

// ---- Agent ----
export interface Agent {
  id: string
  profile_id: string
  profile?: Profile
  license_number: string | null
  agency_name: string | null
  agency_name_amharic: string | null
  bio: string | null
  bio_amharic: string | null
  specializations: string[]
  areas_served: string[]
  total_listings: number
  total_sales: number
  rating: number
  review_count: number
  is_verified: boolean
  subscription_plan: 'free' | 'basic' | 'pro' | 'enterprise'
  subscription_expires_at: string | null
}

// ---- Neighborhood ----
export interface Neighborhood {
  id: string
  name: string
  name_amharic: string | null
  city: string
  avg_price_per_sqm_etb: number
  avg_rent_per_sqm_etb: number | null
  price_trend_12m: number | null
  safety_score: number | null
  transport_score: number | null
  amenities_score: number | null
  flood_risk: 'low' | 'medium' | 'high' | null
}

// ---- Property ----
export interface PropertyImage {
  url: string
  caption: string | null
  order: number
}

export interface PropertyFeatures {
  has_garden?: boolean
  has_pool?: boolean
  has_generator?: boolean
  has_borehole?: boolean
  has_elevator?: boolean
  has_gym?: boolean
  has_security?: boolean
  is_furnished?: boolean
}

export interface Property {
  id: string
  title: string
  title_amharic: string | null
  description: string | null
  description_amharic: string | null
  property_type: PropertyType
  listing_intent: ListingIntent
  status: ListingStatus
  price_etb: number | null
  price_usd: number | null
  rent_per_month_etb: number | null
  rent_per_month_usd: number | null
  is_negotiable: boolean
  size_sqm: number | null
  bedrooms: number | null
  bathrooms: number | null
  floors: number | null
  floor_number: number | null
  parking_spaces: number
  year_built: number | null
  neighborhood_id: string | null
  neighborhood?: Neighborhood
  address: string | null
  address_amharic: string | null
  city: string
  coordinates: { lat: number; lng: number } | null
  cover_image_url: string | null
  images: PropertyImage[]
  amenities: string[]
  features: PropertyFeatures
  agent_id: string | null
  agent?: Agent
  title_verified: boolean
  title_verification_report: FraudCheckResult | null
  is_featured: boolean
  ai_description: string | null
  ai_description_amharic: string | null
  ai_valuation_etb: number | null
  views: number
  saves: number
  inquiries: number
  listed_at: string | null
  created_at: string
  updated_at: string
}

// ---- Search & Filters ----
export interface PropertyFilters {
  query?: string
  neighborhoods?: string[]
  property_types?: PropertyType[]
  listing_intent?: ListingIntent
  min_price_etb?: number
  max_price_etb?: number
  min_price_usd?: number
  max_price_usd?: number
  min_bedrooms?: number
  max_bedrooms?: number
  min_size_sqm?: number
  max_size_sqm?: number
  is_featured?: boolean
  is_verified?: boolean
  currency?: 'ETB' | 'USD'
  furnished?: string
  sort?: string
}

export interface SearchResult {
  properties: Property[]
  total: number
  page: number
  per_page: number
}

// ---- AI Types ----
export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  language?: Language
}

export interface FraudCheckResult {
  verdict: 'safe' | 'risky' | 'fraud'
  confidence: number
  red_flags: string[]
  analysis: {
    title_authenticity: string
    ownership_chain: string
    stamp_verification: string
    date_consistency: string
    duplicate_check: string
  }
  recommendation: string
  recommendation_amharic: string
  summary: string
  summary_amharic: string
  checked_at: string
}

export interface ValuationResult {
  estimated_value_etb: number
  estimated_value_usd: number
  price_range: {
    low_etb: number
    high_etb: number
  }
  rental_yield_percent: number
  estimated_monthly_rent_etb: number
  comparable_properties: {
    address: string
    price_etb: number
    size_sqm: number
    price_per_sqm: number
  }[]
  market_analysis: string
  market_analysis_amharic: string
  investment_recommendation: string
  investment_recommendation_amharic: string
  confidence: number
  generated_at: string
}

export interface ContractAnalysisResult {
  verdict: 'sign' | 'negotiate' | 'avoid'
  dangerous_clauses: {
    clause: string
    risk_level: 'low' | 'medium' | 'high'
    explanation: string
    explanation_amharic: string
    recommendation: string
  }[]
  total_cost_etb: number
  hidden_costs: {
    description: string
    amount_etb: number
  }[]
  summary: string
  summary_amharic: string
  verdict_explanation: string
  verdict_explanation_amharic: string
}

export interface NeighborhoodReport {
  neighborhood: string
  overall_score: number
  scores: {
    safety: number
    transport: number
    amenities: number
    investment: number
    flood_risk: number
  }
  price_analysis: string
  price_analysis_amharic: string
  pros: string[]
  cons: string[]
  investment_outlook: string
  investment_outlook_amharic: string
  nearby_amenities: string[]
}

// ---- Payments ----
export interface SubscriptionPlan {
  id: string
  name: 'free' | 'basic' | 'pro' | 'enterprise'
  price_usd: number
  price_etb: number
  max_listings: number
  max_featured: number
  ai_reports_per_month: number
  features: string[]
  stripe_price_id: string
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'free',
    price_usd: 0,
    price_etb: 0,
    max_listings: 3,
    max_featured: 0,
    ai_reports_per_month: 2,
    features: ['3 active listings', '2 AI reports/month', 'Basic analytics'],
    stripe_price_id: ''
  },
  {
    id: 'basic',
    name: 'basic',
    price_usd: 29,
    price_etb: 1640,
    max_listings: 15,
    max_featured: 2,
    ai_reports_per_month: 10,
    features: ['15 active listings', '2 featured listings', '10 AI reports/month', 'Priority support'],
    stripe_price_id: 'price_basic_monthly'
  },
  {
    id: 'pro',
    name: 'pro',
    price_usd: 59,
    price_etb: 3340,
    max_listings: 50,
    max_featured: 8,
    ai_reports_per_month: 30,
    features: ['50 active listings', '8 featured listings', '30 AI reports/month', 'CRM tools', 'Analytics dashboard'],
    stripe_price_id: 'price_pro_monthly'
  },
  {
    id: 'enterprise',
    name: 'enterprise',
    price_usd: 149,
    price_etb: 8440,
    max_listings: -1, // unlimited
    max_featured: -1,
    ai_reports_per_month: -1,
    features: ['Unlimited listings', 'Unlimited featured', 'Unlimited AI reports', 'White-label option', 'Dedicated support'],
    stripe_price_id: 'price_enterprise_monthly'
  }
]

// ---- API Response types ----
export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  per_page: number
  has_more: boolean
}