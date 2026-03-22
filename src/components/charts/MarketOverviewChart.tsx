'use client'

import { useEffect, useRef } from 'react'

const NEIGHBORHOODS = [
  { name: 'Bole', price: 78, trend: 14.3 },
  { name: 'Megenagna', price: 58, trend: 12.1 },
  { name: 'Kazanchis', price: 52, trend: 11.2 },
  { name: 'CMC', price: 49, trend: 11.0 },
  { name: 'Sarbet', price: 44, trend: 10.8 },
  { name: 'Gerji', price: 41, trend: 9.5 },
  { name: 'Lideta', price: 38, trend: 10.2 },
  { name: 'Piassa', price: 32, trend: 8.5 },
  { name: 'Kolfe', price: 22, trend: 9.7 },
  { name: 'Lebu', price: 15, trend: 8.0 },
]

export function MarketOverviewChart() {
  const ref = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<any>(null)

  useEffect(() => {
    if (!ref.current) return
    const load = async () => {
      const { Chart, registerables } = await import('chart.js')
      Chart.register(...registerables)
      if (chartRef.current) chartRef.current.destroy()

      chartRef.current = new Chart(ref.current!, {
        type: 'bar',
        data: {
          labels: NEIGHBORHOODS.map(n => n.name),
          datasets: [
            {
              label: '2024 (ETB K/m²)',
              data: NEIGHBORHOODS.map(n => n.price),
              backgroundColor: NEIGHBORHOODS.map(n => n.trend > 11 ? '#16a34a' : n.trend > 9 ? '#4ade80' : '#bbf7d0'),
              borderRadius: 6,
              borderSkipped: false,
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#fff',
              titleColor: '#1a1a18',
              bodyColor: '#4a4a46',
              borderColor: '#e5e4df',
              borderWidth: 1,
              callbacks: {
                label: ctx => ` ETB ${ctx.raw}K/m² · +${NEIGHBORHOODS[ctx.dataIndex].trend}% growth`,
              }
            }
          },
          scales: {
            x: { grid: { display: false }, ticks: { color: '#8a8a84', font: { size: 10 }, maxRotation: 35 } },
            y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#8a8a84', font: { size: 10 }, callback: v => `${v}K` } }
          }
        }
      })
    }
    load()
    return () => { if (chartRef.current) chartRef.current.destroy() }
  }, [])

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '16px 20px' }}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>Price per m² by neighborhood</div>
        <div style={{ display: 'flex', gap: 14, fontSize: 11, color: 'var(--text-3)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: '#16a34a', display: 'inline-block' }} /> High growth (&gt;11%)</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: '#4ade80', display: 'inline-block' }} /> Medium growth</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: '#bbf7d0', display: 'inline-block' }} /> Steady growth</span>
        </div>
      </div>
      <div style={{ position: 'relative', height: 220 }}>
        <canvas ref={ref} />
      </div>
    </div>
  )
}
