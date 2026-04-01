// ============================================================
// HABESHA HOMES — CLAUDE AI CLIENT
// All Claude-powered features: Chat, Fraud Detection,
// Valuation, Contract Analysis, Neighborhood Reports
// ============================================================

import Anthropic from '@anthropic-ai/sdk'
import type {
  Property, Language, FraudCheckResult, ValuationResult,
  ContractAnalysisResult, NeighborhoodReport, ChatMessage
} from '@/types'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const MODEL = 'claude-sonnet-4-6'

// ============================================================
// SYSTEM PROMPTS
// ============================================================

const PROPERTY_ASSISTANT_SYSTEM = (property: Property, lang: Language) => `
You are an expert Ethiopian real estate assistant for Habesha Properties — the most trusted property marketplace in Ethiopia.

${lang === 'am' ? `
IMPORTANT: The user is writing in Amharic (አማርኛ). You MUST respond entirely in Amharic. 
Use clear, simple Amharic that any Ethiopian can understand.
Only use English for numbers, prices, and technical terms that are commonly used in Amharic real estate.
` : `
Respond in clear, professional English. The user may be diaspora Ethiopian or international.
When relevant, include Amharic translations of key terms.
`}

PROPERTY CONTEXT:
- Title: ${property.title} ${property.title_amharic ? `/ ${property.title_amharic}` : ''}
- Type: ${property.property_type}
- Status: For ${property.listing_intent}
- Price: ${property.price_etb ? `ETB ${property.price_etb.toLocaleString()}` : ''} ${property.price_usd ? `/ $${property.price_usd.toLocaleString()}` : ''}
- Size: ${property.size_sqm}m²
- Bedrooms: ${property.bedrooms || 'N/A'} | Bathrooms: ${property.bathrooms || 'N/A'}
- Location: ${property.address || ''}, ${property.neighborhood?.name || ''}, ${property.city}
- Neighborhood avg price: ETB ${property.neighborhood?.avg_price_per_sqm_etb?.toLocaleString() || 'N/A'}/m²
- Title verified: ${property.title_verified ? 'YES ✓' : 'Not yet verified'}
- Agent: ${property.agent?.agency_name || 'Private seller'}

YOUR ROLE:
1. Answer questions about this specific property honestly and accurately
2. Provide market context (is this price fair? is this area good?)
3. Explain legal steps for buying/renting in Ethiopia
4. Help diaspora buyers understand the remote purchase process
5. Recommend additional AI reports (valuation, fraud check) when relevant
6. Always be honest — if something looks risky, say so clearly
7. Never make up information you don't have

Keep responses concise, helpful, and specific to this property.
`

const FRAUD_CHECK_SYSTEM = `
You are an expert Ethiopian property document verification specialist with 20 years of experience detecting real estate fraud in Ethiopia.

Your job is to analyze Ethiopian property title documents and ownership papers for fraud indicators.

Common fraud patterns in Ethiopia:
1. Duplicate titles — same property sold to multiple people
2. Forged government stamps and seals
3. Altered dates or ownership records
4. Missing required signatures from land registry
5. Inconsistent kebele/woreda numbers
6. Properties registered under incorrect names
7. Expired or void title certificates
8. Properties with unresolved boundary disputes

Return your analysis as a JSON object with this EXACT structure:
{
  "verdict": "safe" | "risky" | "fraud",
  "confidence": 0.0 to 1.0,
  "red_flags": ["list of specific issues found"],
  "analysis": {
    "title_authenticity": "assessment of title document authenticity",
    "ownership_chain": "assessment of ownership history",
    "stamp_verification": "assessment of official stamps and seals",
    "date_consistency": "assessment of date logic and consistency",
    "duplicate_check": "indicators of potential duplicate registration"
  },
  "recommendation": "Clear English recommendation of what to do next",
  "recommendation_amharic": "Same recommendation in Amharic",
  "summary": "1-2 sentence English summary",
  "summary_amharic": "Same summary in Amharic"
}

Be thorough but honest. If the image quality is too poor to make a determination, say so in the verdict explanation.
`

const VALUATION_SYSTEM = (marketData: Record<string, number>) => `
You are a certified property valuation expert specializing in the Ethiopian real estate market, particularly Addis Ababa.

CURRENT MARKET DATA (ETB per m²):
${Object.entries(marketData).map(([n, p]) => `- ${n}: ETB ${p.toLocaleString()}`).join('\n')}

CURRENT USD/ETB RATE: ${process.env.USD_TO_ETB_RATE || '56.5'}

Your task: Analyze the property details provided and generate a professional valuation.

Consider these Ethiopian market factors:
1. Location premium (Bole > Kazanchis > Megenagna > Sarbet > Gerji > Piassa > Kolfe)
2. Floor premium (+5% per floor above ground, -10% for ground floor)
3. Condition multiplier (new: +25%, good: 0%, fair: -15%, poor: -30%)
4. Amenities (generator: +8%, borehole: +5%, garden: +10%, elevator: +12%)
5. Rental yield for Addis is typically 6-9% annually

Return ONLY valid JSON with this EXACT structure:
{
  "estimated_value_etb": number,
  "estimated_value_usd": number,
  "price_range": { "low_etb": number, "high_etb": number },
  "rental_yield_percent": number,
  "estimated_monthly_rent_etb": number,
  "comparable_properties": [
    { "address": "string", "price_etb": number, "size_sqm": number, "price_per_sqm": number }
  ],
  "market_analysis": "English analysis of current market conditions",
  "market_analysis_amharic": "Amharic translation of market analysis",
  "investment_recommendation": "English investment recommendation",
  "investment_recommendation_amharic": "Amharic translation",
  "confidence": 0.0 to 1.0
}
`

const CONTRACT_ANALYSIS_SYSTEM = `
You are a senior Ethiopian property law expert with deep knowledge of:
- Ethiopian Civil Code property provisions
- Land Lease Proclamation No. 721/2011
- Urban Land Lease Holding Proclamation
- Standard Ethiopian property sale and rental contracts

Your task: Analyze the provided property contract for dangerous clauses, hidden costs, and legal issues.

Ethiopian-specific red flags to check:
1. Clauses that waive the buyer's legal rights under Ethiopian law
2. Unclear or absent title transfer conditions
3. Penalties disproportionate to the offense
4. Missing government registration requirements
5. Ambiguous possession/handover dates
6. Hidden fees not mentioned upfront
7. Clauses that favor the seller unfairly in dispute resolution
8. Missing required government stamps and witness signatures

Return ONLY valid JSON:
{
  "verdict": "sign" | "negotiate" | "avoid",
  "dangerous_clauses": [
    {
      "clause": "the exact problematic clause text",
      "risk_level": "low" | "medium" | "high",
      "explanation": "English explanation of why this is risky",
      "explanation_amharic": "Amharic explanation",
      "recommendation": "What to change or add"
    }
  ],
  "total_cost_etb": number,
  "hidden_costs": [
    { "description": "cost description", "amount_etb": number }
  ],
  "summary": "English summary",
  "summary_amharic": "Amharic summary",
  "verdict_explanation": "English explanation of verdict",
  "verdict_explanation_amharic": "Amharic explanation"
}
`

// ============================================================
// 1. PROPERTY Q&A CHAT (streaming)
// ============================================================
export async function* streamPropertyChat(
  property: Property,
  messages: ChatMessage[],
  language: Language = 'en'
): AsyncGenerator<string> {
  const systemPrompt = PROPERTY_ASSISTANT_SYSTEM(property, language)

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: systemPrompt,
    stream: true,
    messages: messages.map(m => ({
      role: m.role,
      content: m.content
    }))
  })

  for await (const chunk of response) {
    if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
      yield chunk.delta.text
    }
  }
}

// ============================================================
// 2. TITLE DOCUMENT FRAUD DETECTION (Vision)
// ============================================================
export async function analyzeTitleDocument(
  imageBase64: string,
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp' = 'image/jpeg',
  additionalContext?: string
): Promise<FraudCheckResult> {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2048,
    system: FRAUD_CHECK_SYSTEM,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: mimeType,
            data: imageBase64,
          }
        },
        {
          type: 'text',
          text: `Please analyze this Ethiopian property title document for fraud indicators and authenticity.
${additionalContext ? `Additional context: ${additionalContext}` : ''}
Return your analysis as JSON only, no other text.`
        }
      ]
    }]
  })

  const content = response.content[0]
  if (content.type !== 'text') throw new Error('Unexpected response type')

  try {
    const result = JSON.parse(content.text) as FraudCheckResult
    return { ...result, checked_at: new Date().toISOString() }
  } catch {
    // If Claude didn't return valid JSON, create a structured error response
    return {
      verdict: 'risky',
      confidence: 0.3,
      red_flags: ['Unable to fully analyze document — please ensure image is clear and complete'],
      analysis: {
        title_authenticity: 'Analysis incomplete',
        ownership_chain: 'Analysis incomplete',
        stamp_verification: 'Analysis incomplete',
        date_consistency: 'Analysis incomplete',
        duplicate_check: 'Analysis incomplete'
      },
      recommendation: 'Please re-upload a clearer image of the title document for a complete analysis.',
      recommendation_amharic: 'ግልጽ የሆነ ምስል ይስቀሉ ። ሙሉ ትንተና ለማግኘት ።',
      summary: 'Document analysis was inconclusive. Better image quality needed.',
      summary_amharic: 'የሰነድ ትንተና ሙሉ አልሆነም። ግልጽ ምስል ያስፈልጋል።',
      checked_at: new Date().toISOString()
    }
  }
}

// ============================================================
// 3. PROPERTY VALUATION
// ============================================================
export async function generateValuation(
  property: Property,
  marketData: Record<string, number>
): Promise<ValuationResult> {
  const propertyDetails = `
Property to value:
- Type: ${property.property_type}
- Size: ${property.size_sqm}m²
- Bedrooms: ${property.bedrooms || 'N/A'}
- Bathrooms: ${property.bathrooms || 'N/A'}
- Floor: ${property.floor_number || 'Ground'} of ${property.floors || 1}
- Location: ${property.neighborhood?.name || property.city}, ${property.city}
- Neighborhood avg price: ETB ${property.neighborhood?.avg_price_per_sqm_etb || 'unknown'}/m²
- Year built: ${property.year_built || 'Unknown'}
- Asking price: ${property.price_etb ? `ETB ${property.price_etb.toLocaleString()}` : 'Not specified'}
- Amenities: ${property.amenities.join(', ') || 'Standard'}
- Features: ${JSON.stringify(property.features)}
`

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2048,
    system: VALUATION_SYSTEM(marketData),
    messages: [{
      role: 'user',
      content: `${propertyDetails}\nGenerate a professional valuation report. Return JSON only.`
    }]
  })

  const content = response.content[0]
  if (content.type !== 'text') throw new Error('Unexpected response type')

  const result = JSON.parse(content.text) as Omit<ValuationResult, 'generated_at'>
  return { ...result, generated_at: new Date().toISOString() }
}

// ============================================================
// 4. CONTRACT ANALYSIS
// ============================================================
export async function analyzeContract(
  contractText: string,
  propertyContext?: Partial<Property>
): Promise<ContractAnalysisResult> {
  const context = propertyContext
    ? `Property context: ${propertyContext.property_type} in ${propertyContext.neighborhood?.name || 'Unknown'}, ${propertyContext.city}. Price: ETB ${propertyContext.price_etb?.toLocaleString() || 'N/A'}`
    : ''

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 3000,
    system: CONTRACT_ANALYSIS_SYSTEM,
    messages: [{
      role: 'user',
      content: `${context}\n\nCONTRACT TEXT:\n${contractText}\n\nAnalyze this contract. Return JSON only.`
    }]
  })

  const content = response.content[0]
  if (content.type !== 'text') throw new Error('Unexpected response type')

  return JSON.parse(content.text) as ContractAnalysisResult
}

// ============================================================
// 5. NEIGHBORHOOD INTELLIGENCE REPORT
// ============================================================
export async function generateNeighborhoodReport(
  neighborhoodName: string,
  neighborhoodData: Record<string, unknown>,
  language: Language = 'en'
): Promise<NeighborhoodReport> {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `Generate a comprehensive neighborhood intelligence report for ${neighborhoodName} in Addis Ababa, Ethiopia.

Available data: ${JSON.stringify(neighborhoodData)}

${language === 'am' ? 'Provide analysis in both English and Amharic.' : 'Provide analysis in English with Amharic translations for key sections.'}

Return ONLY valid JSON:
{
  "neighborhood": "${neighborhoodName}",
  "overall_score": number (1-10),
  "scores": {
    "safety": number (1-10),
    "transport": number (1-10),
    "amenities": number (1-10),
    "investment": number (1-10),
    "flood_risk": number (1-10, where 10 = lowest risk)
  },
  "price_analysis": "English price analysis",
  "price_analysis_amharic": "Amharic price analysis",
  "pros": ["list of advantages"],
  "cons": ["list of disadvantages"],
  "investment_outlook": "English investment outlook",
  "investment_outlook_amharic": "Amharic investment outlook",
  "nearby_amenities": ["schools", "hospitals", "transport hubs", etc.]
}`
    }]
  })

  const content = response.content[0]
  if (content.type !== 'text') throw new Error('Unexpected response type')

  return JSON.parse(content.text) as NeighborhoodReport
}

// ============================================================
// 6. AI LISTING DESCRIPTION GENERATOR
// ============================================================
export async function generateListingDescription(
  property: Partial<Property>,
  imageBase64?: string
): Promise<{ english: string; amharic: string }> {
  const messages: Anthropic.MessageParam[] = []

  const prompt = `Write a compelling property listing description for this Ethiopian property.

Property details:
- Type: ${property.property_type}
- Size: ${property.size_sqm}m²
- Bedrooms: ${property.bedrooms}, Bathrooms: ${property.bathrooms}
- Location: ${property.address || ''}, ${property.neighborhood?.name || property.city}
- Price: ETB ${property.price_etb?.toLocaleString() || 'Contact for price'}
- Amenities: ${property.amenities?.join(', ') || 'Standard'}
- Features: ${JSON.stringify(property.features || {})}

Write TWO descriptions:
1. English (200-250 words) — professional, engaging, highlights key selling points
2. Amharic (አማርኛ) — natural Amharic translation, culturally appropriate

Format as JSON: {"english": "...", "amharic": "..."}`

  if (imageBase64) {
    messages.push({
      role: 'user',
      content: [
        {
          type: 'image',
          source: { type: 'base64', media_type: 'image/jpeg', data: imageBase64 }
        },
        { type: 'text', text: prompt }
      ]
    })
  } else {
    messages.push({ role: 'user', content: prompt })
  }

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1500,
    messages
  })

  const content = response.content[0]
  if (content.type !== 'text') throw new Error('Unexpected response type')

  return JSON.parse(content.text)
}

// ============================================================
// 7. SMART PROPERTY MATCHING
// ============================================================
export async function matchPropertiesToBuyer(
  buyerRequirements: string,
  properties: Property[],
  language: Language = 'en'
): Promise<{ ranked: Array<{ property_id: string; score: number; reason: string; reason_amharic: string }> }> {
  const propertyList = properties.slice(0, 20).map(p => ({
    id: p.id,
    title: p.title,
    type: p.property_type,
    price_etb: p.price_etb,
    size_sqm: p.size_sqm,
    bedrooms: p.bedrooms,
    neighborhood: p.neighborhood?.name,
    amenities: p.amenities
  }))

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `Buyer requirements (${language === 'am' ? 'in Amharic' : 'in English'}):
"${buyerRequirements}"

Available properties:
${JSON.stringify(propertyList, null, 2)}

Match and rank these properties based on how well they fit the buyer's needs.
Return JSON only:
{
  "ranked": [
    {
      "property_id": "uuid",
      "score": 0-100,
      "reason": "English explanation of why this matches",
      "reason_amharic": "Amharic explanation"
    }
  ]
}`
    }]
  })

  const content = response.content[0]
  if (content.type !== 'text') throw new Error('Unexpected response type')

  return JSON.parse(content.text)
}
