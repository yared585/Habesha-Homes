'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'

const INACTIVITY_MS = 2 * 60 * 60 * 1000  // 2 hours
const ACTIVITY_KEY  = 'hp_last_activity'

export function useAuth(requireAuth = false) {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const throttleRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const signOut = useCallback(async () => {
    localStorage.removeItem(ACTIVITY_KEY)
    await createClient().auth.signOut()
    setProfile(null)
    router.push('/')
  }, [router])

  const markActive = useCallback(() => {
    localStorage.setItem(ACTIVITY_KEY, Date.now().toString())
  }, [])

  useEffect(() => {
    const sb = createClient()

    async function loadProfile(userId: string, meta?: any) {
      const { data } = await sb.from('profiles').select('*').eq('id', userId).single()
      if (data) setProfile({ ...data, role: data.role || 'buyer' } as Profile)
      else setProfile({ id: userId, full_name: meta?.full_name || meta?.name || 'User', email: meta?.email, role: meta?.role || 'buyer' } as Profile)
      setLoading(false)
    }

    sb.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        setLoading(false)
        if (requireAuth) router.push('/auth/login')
        return
      }
      loadProfile(session.user.id, { ...session.user.user_metadata, email: session.user.email })
    })

    const { data: { subscription } } = sb.auth.onAuthStateChange((_event, session) => {
      if (session?.user) loadProfile(session.user.id, { ...session.user.user_metadata, email: session.user.email })
      else { setProfile(null); setLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [requireAuth, router])

  // Inactivity timeout — only runs when logged in
  useEffect(() => {
    if (!profile) return

    // Stamp activity on mount if not already set
    if (!localStorage.getItem(ACTIVITY_KEY)) markActive()

    // Check on page open — if already idle for 2h, sign out immediately
    const last = parseInt(localStorage.getItem(ACTIVITY_KEY) || '0', 10)
    if (Date.now() - last >= INACTIVITY_MS) {
      signOut()
      return
    }

    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart']

    function onActivity() {
      if (throttleRef.current) return
      throttleRef.current = setTimeout(() => { throttleRef.current = null }, 10_000)
      markActive()
    }

    events.forEach(e => window.addEventListener(e, onActivity, { passive: true }))

    const interval = setInterval(() => {
      const last = parseInt(localStorage.getItem(ACTIVITY_KEY) || '0', 10)
      if (Date.now() - last >= INACTIVITY_MS) {
        clearInterval(interval)
        signOut()
      }
    }, 30_000) // check every 30 seconds

    return () => {
      events.forEach(e => window.removeEventListener(e, onActivity))
      clearInterval(interval)
      if (throttleRef.current) clearTimeout(throttleRef.current)
    }
  }, [profile, markActive, signOut])

  return { profile, loading, signOut, isAgent: profile?.role === 'agent', isAdmin: profile?.role === 'admin' }
}
