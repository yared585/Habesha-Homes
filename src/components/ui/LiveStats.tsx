'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

function Counter({ end, suffix = '' }: { end: number; suffix?: string }) {
  const [val, setVal] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (end === 0) return
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      obs.disconnect()
      let cur = 0; const step = Math.max(end / 50, 1)
      const t = setInterval(() => { cur += step; if (cur >= end) { setVal(end); clearInterval(t) } else setVal(Math.floor(cur)) }, 20)
    })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [end])
  return <div ref={ref}>{val.toLocaleString()}{suffix}</div>
}

export function LiveStats() {
  const [stats, setStats] = useState({ listings:0, agents:0, reports:0, hoods:0 })
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const sb = createClient()
    Promise.all([
      sb.from('properties').select('*',{count:'exact',head:true}).eq('status','active'),
      sb.from('agents').select('*',{count:'exact',head:true}).eq('is_verified',true),
      sb.from('ai_reports').select('*',{count:'exact',head:true}).eq('is_paid',true),
      sb.from('neighborhoods').select('*',{count:'exact',head:true}),
    ]).then(([p,a,r,n]) => {
      setStats({ listings:p.count||0, agents:a.count||0, reports:r.count||0, hoods:n.count||0 })
      setLoaded(true)
    })
  }, [])

  return (
    <div>
      <div style={{ fontSize:11,fontWeight:700,color:'#bbb',letterSpacing:'.07em',textTransform:'uppercase',marginBottom:14 }}>
        {loaded ? '🟢 Live data' : '⏳ Loading...'}
      </div>
      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:16 }}>
        {[
          { label:'Active listings', val:stats.listings, suffix:stats.listings>0?'+':'' },
          { label:'Verified agents', val:stats.agents, suffix:'' },
          { label:'AI reports run', val:stats.reports, suffix:'' },
          { label:'Neighborhoods', val:stats.hoods, suffix:'' },
        ].map(({ label, val, suffix }) => (
          <div key={label} style={{ background:'#fff',borderRadius:10,padding:'11px 13px',border:'1px solid #eae9e4' }}>
            <div style={{ fontSize:20,fontWeight:800,color:'#16a34a',lineHeight:1 }}>
              {loaded ? <Counter end={val} suffix={suffix}/> : <span style={{color:'#ddd'}}>—</span>}
            </div>
            <div style={{ fontSize:11,color:'#aaa',marginTop:3 }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
