import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'

const SUPPORTED = ['en', 'am'] as const

export default getRequestConfig(async () => {
  const cookieStore = cookies()
  const raw = cookieStore.get('NEXT_LOCALE')?.value
  const locale = SUPPORTED.includes(raw as any) ? (raw as string) : 'en'

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
