import type { Metadata } from 'next'
import { Hero } from '@/components/home/Hero'

export const metadata: Metadata = {
  title: 'Habesha Homes — Buy, Sell & Rent Property in Ethiopia',
  description: "Ethiopia's smartest property marketplace. Find apartments, villas and houses for sale or rent in Addis Ababa. AI fraud detection, instant valuations, Amharic support.",
  keywords: ['buy house Ethiopia', 'rent apartment Addis Ababa', 'Ethiopian real estate', 'ቤት ለሽያጭ አዲስ አበባ', 'ቤት ለኪራይ ቦሌ', 'Bole apartment', 'Kazanchis property'],
  openGraph: {
    title: 'Habesha Homes — Ethiopian Property Marketplace',
    description: "Find your perfect home in Ethiopia. AI-powered search, fraud detection and valuations.",
    type: 'website',
  }
}
import { StatsBar, AIFeatures, NeighborhoodGrid, HowItWorks, DiasporaCTA, ContactStrip } from '@/components/home/Sections'
import { FeaturedProperties } from '@/components/home/FeaturedProperties'

export default function HomePage() {
  return (
    <>
      <Hero/>
      <FeaturedProperties/>
      <StatsBar/>
      <AIFeatures/>
      <NeighborhoodGrid/>
      <HowItWorks/>
      <DiasporaCTA/>
      <ContactStrip/>
    </>
  )
}
