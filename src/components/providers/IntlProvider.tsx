'use client'

import { NextIntlClientProvider } from 'next-intl'

export function IntlProvider({ locale, messages, children }: {
  locale: string
  messages: Record<string, any>
  children: React.ReactNode
}) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  )
}
