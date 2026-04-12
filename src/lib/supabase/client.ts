// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

// Singleton — one client shared across all components in the browser.
// Multiple instances each compete for the same navigator.lock on getUser(),
// causing "lock was released because another request stole it" errors.
let client: SupabaseClient | null = null

export function createClient() {
  if (client) return client
  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  return client
}

// Use this instead of createClient().auth.getUser() in all client components.
// getSession() reads from localStorage — no navigator.lock, no race conditions.
// getUser() makes a network request and acquires a lock; concurrent calls steal it.
export async function getClientUser() {
  const { data: { session } } = await createClient().auth.getSession()
  return session?.user ?? null
}

// src/lib/supabase/server.ts  — save this as a separate file
// import { createServerClient, type CookieOptions } from '@supabase/ssr'
// import { cookies } from 'next/headers'
//
// export function createClient() {
//   const cookieStore = cookies()
//   return createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       cookies: {
//         get(name: string) { return cookieStore.get(name)?.value },
//         set(name: string, value: string, options: CookieOptions) {
//           try { cookieStore.set({ name, value, ...options }) } catch {}
//         },
//         remove(name: string, options: CookieOptions) {
//           try { cookieStore.set({ name, value: '', ...options }) } catch {}
//         },
//       },
//     }
//   )
// }
