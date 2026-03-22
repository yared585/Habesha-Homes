// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
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
