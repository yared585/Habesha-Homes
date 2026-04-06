// Add CRON_SECRET=your-random-secret to Vercel environment variables
// Generate one at: https://generate-secret.vercel.app/32

export const runtime = 'nodejs'
export const maxDuration = 60

import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

async function runUpdate() {
  const supabase = createClient()
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const { data: neighborhoods } = await supabase
    .from('neighborhoods')
    .select('id, name, name_amharic, avg_price_per_sqm_etb, price_trend_12m')

  if (!neighborhoods?.length) return { updated: 0, timestamp: new Date().toISOString() }

  const response = await anthropic.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `You are an Ethiopian real estate market analyst.

Based on your knowledge of Addis Ababa real estate market, provide updated price estimates for these neighborhoods.

Current data:
${neighborhoods.map(n => `- ${n.name}: ETB ${n.avg_price_per_sqm_etb}/m², trend: ${n.price_trend_12m}%`).join('\n')}

Consider:
- General inflation in Ethiopia
- Neighborhood development trends
- Demand patterns in Addis Ababa
- Typical annual appreciation rates (8-15% in growing areas)

Return ONLY a JSON array with no markdown:
[
  {
    "name": "Bole",
    "avg_price_per_sqm_etb": 82000,
    "price_trend_12m": 14.5,
    "market_summary": "High demand area, growing commercial development"
  }
]

Include all ${neighborhoods.length} neighborhoods. Keep changes realistic (max 20% change from current).`
    }]
  })

  const content = response.content[0]
  if (content.type !== 'text') throw new Error('Unexpected response')

  const cleanText = content.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  const updates = JSON.parse(cleanText)

  let updatedCount = 0
  for (const update of updates) {
    const { error } = await supabase
      .from('neighborhoods')
      .update({
        avg_price_per_sqm_etb: update.avg_price_per_sqm_etb,
        price_trend_12m: update.price_trend_12m,
        updated_at: new Date().toISOString(),
      })
      .eq('name', update.name)

    if (!error) updatedCount++
  }

  console.log(`Updated ${updatedCount} neighborhoods`)
  return { updated: updatedCount, timestamp: new Date().toISOString() }
}

// Called by Vercel Cron
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const result = await runUpdate()
  return Response.json(result)
}

// Called manually by admin panel
export async function POST() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return new Response('Forbidden', { status: 403 })
  }

  const result = await runUpdate()
  return Response.json(result)
}
