import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const runtime = 'edge'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { property_id, messages, language = 'en' } = body

    if (!messages?.length) {
      return Response.json({ error: 'Missing messages' }, { status: 400 })
    }

    // Build system prompt
    const isAmharic = language === 'am'
    const systemPrompt = isAmharic
      ? `አንተ የሀበሻ ሆምስ AI ረዳት ነህ - ኢትዮጵያ ውስጥ ያለ ቤት ለሚፈልጉ ሰዎች ትረዳለህ። ስለ ዋጋ፣ ሰፈር፣ ሕጋዊ ሂደት፣ እና ቤት ስለ መግዛት ወይም ስለ መከራየት ጥያቄዎችን መልስ ስጥ። አጠር ያሉ፣ ጠቃሚ መልሶችን ስጥ።`
      : `You are the Habesha Homes AI assistant helping users find and evaluate Ethiopian properties. Answer questions about pricing, neighborhoods, legal steps, buying/renting process, and investment potential. Be concise, helpful, and knowledgeable about the Ethiopian real estate market. Prices are in Ethiopian Birr (ETB). Key areas: Bole, Kazanchis, Megenagna, CMC, Sarbet, Gerji, Piassa.`

    const formattedMessages = messages.map((m: any) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }))

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const response = await client.messages.create({
            model: 'claude-sonnet-4-6',
            max_tokens: 1024,
            system: systemPrompt,
            messages: formattedMessages,
            stream: true,
          })

          for await (const chunk of response) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`))
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (err: any) {
          console.error('Stream error:', err)
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: 'Sorry, I encountered an error. Please try again.' })}\n\n`))
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    })

  } catch (error: any) {
    console.error('Chat API error:', error)
    return Response.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}