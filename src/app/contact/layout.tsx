import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us — Habesha Homes',
  description: 'Get in touch with the Habesha Homes team. We\'re here to help with buying, selling, and renting property in Ethiopia.',
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
