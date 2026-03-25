import { NextRequest } from 'next/server'
import { rateLimit, getIP } from '@/lib/rate-limit'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  const { success } = rateLimit(getIP(request), { limit: 20, windowMs: 60_000 })
  if (!success) {
    return Response.json({ error: 'Too many requests. Please wait a minute.' }, {
      status: 429, headers: { 'Retry-After': '60' }
    })
  }

  try {
    const body = await request.json()
    const { messages, language = 'en' } = body

    if (!messages?.length) {
      return Response.json({ error: 'Missing messages' }, { status: 400 })
    }

    const isAmharic = language === 'am'
    const systemPrompt = isAmharic
      ? `አንተ የሀበሻ ሆምስ AI ረዳት ነህ። ስለ ቤት ዋጋ፣ ሰፈር፣ ሕጋዊ ሂደት ጥያቄዎችን መልስ ስጥ። አጠር ያሉ መልሶችን ስጥ።`
      : `You are the Habesha Homes AI assistant for Ethiopian real estate. Answer questions about pricing, neighborhoods, legal steps, buying/renting process, and investment potential. Be concise and helpful. Prices in Ethiopian Birr (ETB). Key areas: Bole, Kazanchis, Megenagna, CMC, Sarbet, Gerji, Piassa.`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: systemPrompt,
        stream: true,
        messages: messages.map((m: any) => ({
          role: m.role,
          content: m.content,
        })),
      }),
    })

    if (!response.ok) {
      const err = await response.json()
      return Response.json({ error: err.error?.message || 'API error' }, { status: 500 })
    }

    // Pass through the stream directly
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body!.getReader()
        const decoder = new TextDecoder()
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            const chunk = decoder.decode(value)
            for (const line of chunk.split('\n')) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6)
                if (data === '[DONE]') continue
                try {
                  const parsed = JSON.parse(data)
                  if (parsed.type === 'content_block_delta' && parsed.delta?.type === 'text_delta') {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: parsed.delta.text })}\n\n`))
                  }
                } catch {}
              }
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (err) {
          controller.error(err)
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
      }
    })

  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}