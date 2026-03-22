// src/app/api/claude/chat/route.ts
// Streaming property assistant — handles Amharic and English

import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { streamPropertyChat } from '@/lib/claude'
import type { ChatMessage, Language } from '@/types'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const body = await request.json()
    const { property_id, messages, language = 'en' } = body as {
      property_id: string
      messages: ChatMessage[]
      language: Language
    }

    if (!property_id || !messages?.length) {
      return Response.json({ error: 'Missing property_id or messages' }, { status: 400 })
    }

    // Fetch property with neighborhood data
    const { data: property, error } = await supabase
      .from('properties')
      .select(`
        *,
        neighborhood:neighborhoods(*),
        agent:agents(*, profile:profiles(*))
      `)
      .eq('id', property_id)
      .single()

    if (error || !property) {
      return Response.json({ error: 'Property not found' }, { status: 404 })
    }

    // Save session to database if user is logged in
    if (user) {
      await supabase.from('ai_chat_sessions').upsert({
        user_id: user.id,
        property_id,
        session_type: 'property_qa',
        language,
        messages: messages,
        updated_at: new Date().toISOString()
      })
    }

    // Stream the response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamPropertyChat(property, messages, language)) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`))
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
        'Connection': 'keep-alive',
      }
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
