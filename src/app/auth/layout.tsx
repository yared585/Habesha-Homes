import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In — Habesha Homes',
  description: 'Sign in or create your Habesha Homes account to browse, save, and inquire about properties in Ethiopia.',
  robots: { index: false, follow: false },
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
