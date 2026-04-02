'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import type { Profile } from '@/types'

const INACTIVITY_TIMEOUT_MS = 2 * 60 * 60 * 1000  // 2 hours
const WARNING_BEFORE_MS     = 60 * 1000             // warn 1 min before
const ACTIVITY_KEY          = 'hp_last_activity'

export function useAuth(requireAuth = false) {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const warningToastId = useRef<string | null>(null)

  const signOut = useCallback(async () => {
    localStorage.removeItem(ACTIVITY_KEY)
    await createClient().auth.signOut()
    setProfile(null)
    router.push('/')
  }, [router])

  // Record activity
  const markActive = useCallback(() => {
    localStorage.setItem(ACTIVITY_KEY, Date.now().toString())
    // Dismiss warning toast if user becomes active again
    if (warningToastId.current) {
      toast.dismiss(warningToastId.current)
      warningToastId.current = null
    }
  }, [])

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

  // Inactivity timeout — only active when logged in
  useEffect(() => {
    if (!profile) return

    // Initialise activity timestamp
    if (!localStorage.getItem(ACTIVITY_KEY)) markActive()

    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart']
    let throttle: ReturnType<typeof setTimeout> | null = null

    function onActivity() {
      if (throttle) return
      throttle = setTimeout(() => { throttle = null }, 10_000) // throttle to once per 10s
      markActive()
    }

    events.forEach(e => window.addEventListener(e, onActivity, { passive: true }))

    const interval = setInterval(() => {
      const last = parseInt(localStorage.getItem(ACTIVITY_KEY) || '0', 10)
      const idle = Date.now() - last

      if (idle >= INACTIVITY_TIMEOUT_MS) {
        clearInterval(interval)
        signOut().then(() => toast('You were signed out due to inactivity.'))
      } else if (idle >= INACTIVITY_TIMEOUT_MS - WARNING_BEFORE_MS && !warningToastId.current) {
        warningToastId.current = toast(
          'You\'ll be signed out in 1 minute due to inactivity. Move your mouse to stay signed in.',
          { duration: WARNING_BEFORE_MS, icon: '⏱' }
        )
      }
    }, 30_000) // check every 30 seconds

    return () => {
      events.forEach(e => window.removeEventListener(e, onActivity))
      clearInterval(interval)
      if (throttle) clearTimeout(throttle)
    }
  }, [profile, markActive, signOut])

  return { profile, loading, signOut, isAgent: profile?.role === 'agent', isAdmin: profile?.role === 'admin' }
}
