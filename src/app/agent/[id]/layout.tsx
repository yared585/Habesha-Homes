import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://habeshaproperties.com'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const supabase = createClient()
  const { data: agent } = await supabase
    .from('agents')
    .select('agency_name, bio, is_verified, areas_served, profile:profiles(full_name, avatar_url)')
    .eq('id', params.id)
    .single()

  if (!agent) {
    return { title: 'Agent Profile — Habesha Properties' }
  }

  const name = agent.agency_name || (agent.profile as any)?.full_name || 'Agent'
  const areas = (agent.areas_served as string[] | null)?.join(', ') || 'Ethiopia'
  const title = `${name} — Real Estate Agent in ${areas}`
  const description = agent.bio
    ? agent.bio.slice(0, 155)
    : `View properties listed by ${name} on Habesha Properties, Ethiopia's leading real estate marketplace.`
  const avatar = (agent.profile as any)?.avatar_url

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'profile',
      url: `${APP_URL}/agent/${params.id}`,
      images: avatar ? [{ url: avatar, width: 400, height: 400, alt: name }] : [],
      siteName: 'Habesha Properties',
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: avatar ? [avatar] : [],
    },
    alternates: {
      canonical: `${APP_URL}/agent/${params.id}`,
    },
  }
}

export default function AgentProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
