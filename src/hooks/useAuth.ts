'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'

export function useAuth(requireAuth = false) {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const sb = createClient()

    async function loadProfile(userId: string, meta?: any) {
      const { data } = await sb.from('profiles').select('*').eq('id', userId).single()
      if (data) setProfile({ ...data, role: data.role || 'buyer' } as Profile)
      else setProfile({ id: userId, full_name: meta?.full_name || meta?.name || 'User', email: meta?.email, role: meta?.role || 'buyer' } as Profile)
      setLoading(false)
    }

    sb.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        setLoading(false)
        if (requireAuth) router.push('/auth/login')
        return
      }
      loadProfile(user.id, { ...user.user_metadata, email: user.email })
    })

    const { data: { subscription } } = sb.auth.onAuthStateChange((_event, session) => {
      if (session?.user) loadProfile(session.user.id, { ...session.user.user_metadata, email: session.user.email })
      else { setProfile(null); setLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [requireAuth, router])

  async function signOut() {
    await createClient().auth.signOut()
    setProfile(null)
    router.push('/')
  }

  return { profile, loading, signOut, isAgent: profile?.role === 'agent', isAdmin: profile?.role === 'admin' }
}
