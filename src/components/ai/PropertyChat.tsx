'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2, Globe, Sparkles } from 'lucide-react'
import type { Property, ChatMessage, Language } from '@/types'

interface Props {
  property: Property
  initialLanguage?: Language
}

const SUGGESTIONS: Record<Language, string[]> = {
  en: ['Is this price fair for the area?', 'What documents do I need to buy?', 'Can I buy remotely from abroad?', 'What is the rental yield?', 'Is the neighborhood safe?'],
  am: ['ዋጋው ለዚህ አካባቢ ትክክለኛ ነው?', 'ለመግዛት ምን ሰነዶች ያስፈልጋሉ?', 'ከውጭ ሆኜ መግዛት እችላለሁ?', 'ወርሃዊ ኪራይ ምን ያህል ይጠበቃል?'],
}

export function PropertyChat({ property, initialLanguage = 'en' }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [lang, setLang] = useState<Language>(initialLanguage)
  const [streaming, setStreaming] = useState('')
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setMessages([{
      role: 'assistant',
      content: lang === 'am'
        ? `ሰላም! ስለ "${property.title}" ሁሉንም ጥያቄዎቻችሁን ለመመለስ ዝግጁ ነኝ። ስለ ዋጋ፣ ሰፈር፣ ሕጋዊ ሂደት ወይም ሌላ ምን ማወቅ ይፈልጋሉ?`
        : `Hello! I'm your AI assistant for "${property.title}". I can help with pricing, neighborhood info, legal steps, diaspora buying, and anything else. What would you like to know?`,
      timestamp: new Date().toISOString(),
      language: lang,
    }])
  }, [property.id, lang])

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, streaming])

  async function send(content: string) {
    if (!content.trim() || loading) return
    const userMsg: ChatMessage = { role: 'user', content: content.trim(), timestamp: new Date().toISOString(), language: lang }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    setStreaming('')

    try {
      const res = await fetch('/api/claude/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ property_id: property.id, messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })), language: lang })
      })
      const reader = res.body?.getReader()
      if (!reader) throw new Error('No reader')
      const decoder = new TextDecoder()
      let full = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        for (const line of chunk.split('\n')) {
          if (line.startsWith('data: ')) {
            const d = line.slice(6)
            if (d === '[DONE]') break
            try { const p = JSON.parse(d); if (p.text) { full += p.text; setStreaming(full) } } catch {}
          }
        }
      }
      setMessages(prev => [...prev, { role: 'assistant', content: full, timestamp: new Date().toISOString(), language: lang }])
      setStreaming('')
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: lang === 'am' ? 'ይቅርታ፣ ስህተት ተፈጥሯል።' : 'Sorry, something went wrong. Please try again.', timestamp: new Date().toISOString(), language: lang }])
      setStreaming('')
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: 520, background: 'var(--surface)' }}>
      {/* Header */}
      <div style={{ background: 'var(--green)', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={14} color="#fff" />
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>
            {lang === 'am' ? 'AI ረዳት' : 'AI Property Assistant'}
          </span>
          <span style={{ fontSize: 10, background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '2px 8px', borderRadius: 'var(--r-full)', fontWeight: 500 }}>AI Assistant</span>
        </div>
        <button onClick={() => setLang(l => l === 'en' ? 'am' : 'en')} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', padding: '4px 10px', borderRadius: 'var(--r-full)', cursor: 'pointer', fontSize: 12 }}>
          <Globe size={11} /> {lang === 'en' ? 'አማርኛ' : 'English'}
        </button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12, background: 'var(--bg)' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', gap: 9, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            {msg.role === 'assistant' && (
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                <Sparkles size={12} color="#fff" />
              </div>
            )}
            <div style={{
              maxWidth: '80%', padding: '10px 14px', borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              background: msg.role === 'user' ? 'var(--green)' : 'var(--surface)',
              color: msg.role === 'user' ? '#fff' : 'var(--text)',
              fontSize: 14, lineHeight: 1.6,
              border: msg.role === 'assistant' ? '1px solid var(--border)' : 'none',
            }}>
              {msg.content}
            </div>
            {msg.role === 'user' && (
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                <User size={12} color="#fff" />
              </div>
            )}
          </div>
        ))}

        {streaming && (
          <div style={{ display: 'flex', gap: 9 }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Sparkles size={12} color="#fff" />
            </div>
            <div style={{ maxWidth: '80%', padding: '10px 14px', borderRadius: '16px 16px 16px 4px', background: 'var(--surface)', border: '1px solid var(--border)', fontSize: 14, lineHeight: 1.6, color: 'var(--text)' }}>
              {streaming}<span style={{ animation: 'blink 1s infinite', opacity: 0.5 }}>▊</span>
            </div>
          </div>
        )}

        {loading && !streaming && (
          <div style={{ display: 'flex', gap: 9 }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Loader2 size={12} color="#fff" style={{ animation: 'spin 1s linear infinite' }} />
            </div>
            <div style={{ padding: '10px 14px', borderRadius: '16px', background: 'var(--surface)', border: '1px solid var(--border)', fontSize: 14, color: 'var(--text-3)' }}>
              {lang === 'am' ? 'በማሰብ ላይ...' : 'Thinking...'}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 7 }}>Suggested questions:</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {SUGGESTIONS[lang].slice(0, 3).map(q => (
              <button key={q} onClick={() => send(q)} style={{ background: 'var(--green-light)', border: '1px solid var(--green)', color: 'var(--green-dark)', padding: '4px 10px', borderRadius: 'var(--r-full)', fontSize: 11, cursor: 'pointer', fontWeight: 500 }}>
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div style={{ padding: '11px 14px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, background: 'var(--surface)' }}>
        <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send(input)}
          placeholder={lang === 'am' ? 'ጥያቄዎን ይጻፉ...' : 'Ask anything about this property...'}
          disabled={loading}
          style={{ flex: 1, border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '10px 14px', fontSize: 14, outline: 'none', background: loading ? 'var(--bg)' : 'var(--surface)', color: 'var(--text)' }}
        />
        <button onClick={() => send(input)} disabled={loading || !input.trim()} style={{
          background: 'var(--green)', color: '#fff', border: 'none', borderRadius: 'var(--r-lg)',
          padding: '10px 14px', cursor: 'pointer', opacity: (loading || !input.trim()) ? 0.5 : 1, transition: 'opacity .15s'
        }}>
          <Send size={15} />
        </button>
      </div>
    </div>
  )
}
