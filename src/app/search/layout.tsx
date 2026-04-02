import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Search Properties in Ethiopia — Houses & Apartments for Sale and Rent',
  description: 'Browse houses, apartments, villas and land for sale and rent across Ethiopia. Filter by neighborhood (Bole, CMC, Kazanchis, Megenagna, Ayat, Sarbet, Gerji, Lideta), price, bedrooms and property type. Find your perfect home in Addis Ababa.',
  keywords: [
    'search properties Ethiopia',
    'houses for sale Addis Ababa',
    'apartments for rent Bole',
    'apartments for rent CMC',
    'apartments for rent Kazanchis',
    'apartments for rent Megenagna',
    'houses for sale Ayat',
    'property search Ethiopia',
    'Addis Ababa property listings',
    'rent apartment Addis Ababa',
    'buy house Addis Ababa',
    'ቤት ለኪራይ አዲስ አበባ',
    'ቤት ለሽያጭ',
  ],
  openGraph: {
    title: 'Search Properties in Ethiopia — Habesha Properties',
    description: 'Browse houses and apartments for sale and rent in Addis Ababa. Filter by neighborhood, price and bedrooms.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Search Properties in Ethiopia — Habesha Properties',
    description: 'Find houses and apartments for sale and rent in Addis Ababa neighborhoods.',
  },
}

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
