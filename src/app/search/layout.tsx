import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Search Properties in Ethiopia',
  description: 'Browse houses, apartments and land for sale and rent in Addis Ababa and across Ethiopia. Filter by price, bedrooms, neighborhood, and more.',
  openGraph: {
    title: 'Search Properties — Habesha Properties',
    description: 'Find your next home in Ethiopia. Buy, rent, or invest with AI-powered tools.',
  },
}

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
