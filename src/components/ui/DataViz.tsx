'use client'

import { useEffect, useRef, useState } from 'react'

// ── Animated counter ──────────────────────────────────────────────────────────
export function Counter({ end, suffix = '', prefix = '' }: { end: number; suffix?: string; prefix?: string }) {
  const [val, setVal] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (end === 0) return
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      obs.disconnect()
      let cur = 0
      const step = Math.max(end / 50, 1)
      const t = setInterval(() => {
        cur += step
        if (cur >= end) { setVal(end); clearInterval(t) }
        else setVal(Math.floor(cur))
      }, 20)
    })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [end])

  return <span ref={ref}>{prefix}{val.toLocaleString()}{suffix}</span>
}

// ── Sparkline chart ───────────────────────────────────────────────────────────
export function Sparkline({ data, color = '#16a34a', width = 72, height = 28 }: { data: number[]; color?: string; width?: number; height?: number }) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  const pts = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * height}`).join(' ')

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={pts}/>
    </svg>
  )
}

// ── Live stat item ────────────────────────────────────────────────────────────
export function LiveStatItem({ label, value, suffix = '', color = '#111', note }: { label: string; value: number; suffix?: string; color?: string; note?: string }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 28, fontWeight: 900, color, lineHeight: 1 }}>
        <Counter end={value} suffix={suffix}/>
      </div>
      <div style={{ fontSize: 12, color: '#aaa', marginTop: 3 }}>{label}</div>
      {note && <div style={{ fontSize: 10, color: '#ccc', marginTop: 1 }}>{note}</div>}
    </div>
  )
}
