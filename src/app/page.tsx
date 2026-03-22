import { Hero } from '@/components/home/Hero'
import { StatsBar, AIFeatures, NeighborhoodGrid, HowItWorks, DiasporaCTA, ContactStrip } from '@/components/home/Sections'
import { FeaturedProperties } from '@/components/home/FeaturedProperties'

export default function HomePage() {
  return (
    <>
      <Hero/>
      <StatsBar/>
      <AIFeatures/>
      <FeaturedProperties/>
      <NeighborhoodGrid/>
      <HowItWorks/>
      <DiasporaCTA/>
      <ContactStrip/>
    </>
  )
}
