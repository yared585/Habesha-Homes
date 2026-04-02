'use client'

import { useEffect, useRef } from 'react'

const PRICE_DATA: Record<string, number[]> = {
  'Bole':      [42,45,48,51,55,60,64,67,71,74,76,78],
  'Kazanchis': [28,30,32,35,37,40,43,46,48,50,51,52],
  'Megenagna': [31,33,35,38,40,43,46,49,52,55,57,58],
  'Sarbet':    [24,25,27,29,31,33,35,38,40,42,43,44],
  'Gerji':     [22,23,25,27,29,31,33,35,37,39,40,41],
  'Piassa':    [18,19,20,22,24,25,27,28,30,31,32,32],
  'Kolfe':     [12,13,14,15,16,17,18,19,20,21,22,22],
  'Lebu':      [8,8,9,10,10,11,12,12,13,14,15,15],
}

const MONTHS = ['Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar']

interface Props {
  neighborhood: string
  showComparison?: boolean
}

export function PriceHistoryChart({ neighborhood, showComparison = true }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<any>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const load = async () => {
      const { Chart, registerables } = await import('chart.js')
      Chart.register(...registerables)

      if (chartRef.current) chartRef.current.destroy()

      const data = PRICE_DATA[neighborhood] || PRICE_DATA['Bole']
      const avgData = MONTHS.map((_, i) => {
        const vals = Object.values(PRICE_DATA).map(d => d[i])
        return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
      })

      const datasets: any[] = [
        {
          label: neighborhood,
          data,
          borderColor: '#16a34a',
          backgroundColor: 'rgba(22,163,74,0.08)',
          borderWidth: 2.5,
          pointRadius: 4,
          pointBackgroundColor: '#16a34a',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          tension: 0.4,
          fill: true,
        }
      ]

      if (showComparison) {
        datasets.push({
          label: 'Addis avg',
          data: avgData,
          borderColor: '#d1d5db',
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderDash: [5, 4],
          pointRadius: 0,
          tension: 0.4,
          fill: false,
        })
      }

      chartRef.current = new Chart(canvasRef.current!, {
        type: 'line',
        data: { labels: MONTHS, datasets },
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
              padding: 10,
              callbacks: {
                label: (ctx) => ` ETB ${ctx.raw}K/m²`,
              }
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: '#8a8a84', font: { size: 11 } }
            },
            y: {
              grid: { color: 'rgba(0,0,0,0.04)' },
              ticks: {
                color: '#8a8a84',
                font: { size: 11 },
                callback: (v) => `${v}K`
              }
            }
          }
        }
      })
    }

    load()
    return () => { if (chartRef.current) chartRef.current.destroy() }
  }, [neighborhood, showComparison])

  const data = PRICE_DATA[neighborhood] || PRICE_DATA['Bole']
  const growth = (((data[data.length - 1] - data[0]) / data[0]) * 100).toFixed(1)
  const isUp = parseFloat(growth) > 0

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '16px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{neighborhood} price/m² — 12 months</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)' }}>ETB thousands per square meter</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: isUp ? 'var(--green)' : 'var(--red)' }}>
            {isUp ? '+' : ''}{growth}%
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>12-month change</div>
        </div>
      </div>

      {/* Custom legend */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-3)' }}>
          <span style={{ width: 16, height: 2, background: '#16a34a', borderRadius: 1, display: 'inline-block' }} />
          {neighborhood}
        </span>
        {showComparison && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-3)' }}>
            <span style={{ width: 16, height: 0, border: '1px dashed #d1d5db', display: 'inline-block' }} />
            Addis average
          </span>
        )}
      </div>

      <div style={{ position: 'relative', height: 200, width: '100%' }}>
        <canvas ref={canvasRef} style={{ maxWidth: '100%' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 14 }}>
        {[
          { label: 'Current price', value: `ETB ${data[data.length-1]}K/m²` },
          { label: '12mo ago', value: `ETB ${data[0]}K/m²` },
          { label: 'Growth', value: `+${growth}%` },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: 'var(--bg)', borderRadius: 'var(--r-md)', padding: '9px 11px' }}>
            <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '.04em' }}>{label}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
