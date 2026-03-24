import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://habesha-homes.vercel.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient()

  // Get all active properties
  const { data: properties } = await supabase
    .from('properties')
    .select('id, updated_at')
    .eq('status', 'active')
    .order('updated_at', { ascending: false })
    .limit(1000)

  // Get all agents
  const { data: agents } = await supabase
    .from('agents')
    .select('id, created_at')
    .limit(500)

  const propertyUrls = (properties || []).map(p => ({
    url: `${APP_URL}/property/${p.id}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const agentUrls = (agents || []).map(a => ({
    url: `${APP_URL}/agent/${a.id}`,
    lastModified: new Date(a.created_at),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [
    { url: APP_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${APP_URL}/search`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${APP_URL}/search?intent=sale`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${APP_URL}/search?intent=rent`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${APP_URL}/ai-reports`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${APP_URL}/pricing`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${APP_URL}/diaspora`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${APP_URL}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${APP_URL}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    ...propertyUrls,
    ...agentUrls,
  ]
}
