'use client'

import { ReactNode } from 'react'

// ── Button ───────────────────────────────────────────────────────────────────
interface ButtonProps {
  children: ReactNode
  onClick?: () => void
  href?: string
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  type?: 'button' | 'submit'
}

const btnStyles = {
  primary:   { background: '#16a34a', color: '#fff', border: '1px solid #15803d' },
  secondary: { background: '#0d2318', color: '#fff', border: '1px solid #0d2318' },
  outline:   { background: 'transparent', color: '#16a34a', border: '1.5px solid #16a34a' },
  ghost:     { background: 'transparent', color: '#555', border: '1.5px solid #e0dfd9' },
  danger:    { background: '#dc2626', color: '#fff', border: '1px solid #b91c1c' },
}

const sizeStyles = {
  sm: { padding: '6px 14px', fontSize: 12, borderRadius: 8 },
  md: { padding: '10px 20px', fontSize: 14, borderRadius: 10 },
  lg: { padding: '13px 28px', fontSize: 15, borderRadius: 12 },
}

export function Button({ children, onClick, variant = 'primary', size = 'md', disabled, loading, fullWidth, type = 'button' }: ButtonProps) {
  const vs = btnStyles[variant]
  const ss = sizeStyles[size]
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        ...vs, ...ss,
        fontWeight: 600, cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled || loading ? 0.6 : 1,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
        width: fullWidth ? '100%' : 'auto', transition: 'all .15s', fontFamily: 'inherit',
      }}
      onMouseEnter={e => { if (!disabled && !loading) (e.currentTarget as HTMLButtonElement).style.opacity = '0.85' }}
      onMouseLeave={e => { if (!disabled && !loading) (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}
    >
      {loading ? <Spinner size={14}/> : children}
    </button>
  )
}

// ── Card ─────────────────────────────────────────────────────────────────────
interface CardProps {
  children: ReactNode
  padding?: number
  hover?: boolean
  accent?: string
  style?: React.CSSProperties
}

export function Card({ children, padding = 20, hover = false, accent, style }: CardProps) {
  return (
    <div
      style={{
        background: '#fff', border: `1px solid #eae9e4`, borderRadius: 14, padding,
        borderLeft: accent ? `3px solid ${accent}` : undefined,
        transition: hover ? 'all .2s' : 'none', ...style,
      }}
      onMouseEnter={e => { if (hover) { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 32px rgba(0,0,0,0.09)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)' } }}
      onMouseLeave={e => { if (hover) { (e.currentTarget as HTMLDivElement).style.boxShadow = ''; (e.currentTarget as HTMLDivElement).style.transform = '' } }}
    >
      {children}
    </div>
  )
}

// ── Badge ─────────────────────────────────────────────────────────────────────
interface BadgeProps {
  children: ReactNode
  color?: 'green' | 'blue' | 'red' | 'amber' | 'purple' | 'grey'
}

const badgeColors = {
  green:  { background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' },
  blue:   { background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' },
  red:    { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' },
  amber:  { background: '#fffbeb', color: '#d97706', border: '1px solid #fde68a' },
  purple: { background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe' },
  grey:   { background: '#f9f9f7', color: '#888', border: '1px solid #e0dfd9' },
}

export function Badge({ children, color = 'green' }: BadgeProps) {
  return (
    <span style={{ ...badgeColors[color], fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, display: 'inline-block' }}>
      {children}
    </span>
  )
}

// ── StatCard ──────────────────────────────────────────────────────────────────
interface StatCardProps {
  icon: ReactNode
  label: string
  value: string | number
  color?: string
}

export function StatCard({ icon, label, value, color = '#16a34a' }: StatCardProps) {
  return (
    <Card>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, marginBottom: 12 }}>
        {icon}
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: '#111', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 13, color: '#888', marginTop: 5 }}>{label}</div>
    </Card>
  )
}

// ── Input ─────────────────────────────────────────────────────────────────────
interface InputProps {
  placeholder?: string
  value: string
  onChange: (v: string) => void
  type?: string
  required?: boolean
  icon?: ReactNode
  rightIcon?: ReactNode
  onRightClick?: () => void
}

export function Input({ placeholder, value, onChange, type = 'text', required, icon, rightIcon, onRightClick }: InputProps) {
  return (
    <div style={{ position: 'relative' }}>
      {icon && <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#aaa', display: 'flex' }}>{icon}</div>}
      <input
        type={type} placeholder={placeholder} value={value} required={required}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%', padding: `13px ${rightIcon ? '44px' : '16px'} 13px ${icon ? '42px' : '16px'}`,
          border: '1.5px solid #e0dfd9', borderRadius: 10, fontSize: 14, outline: 'none',
          color: '#111', background: '#fff', transition: 'border .15s', fontFamily: 'inherit',
        }}
        onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#16a34a'}
        onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#e0dfd9'}
      />
      {rightIcon && (
        <div onClick={onRightClick} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#aaa', display: 'flex' }}>
          {rightIcon}
        </div>
      )}
    </div>
  )
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ size = 20, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <div style={{ width: size, height: size, border: `2px solid ${color}33`, borderTop: `2px solid ${color}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}/>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────
interface EmptyProps {
  icon: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyProps) {
  return (
    <div style={{ textAlign: 'center', padding: '56px 24px', background: '#fff', borderRadius: 16, border: '1px solid #eae9e4' }}>
      <div style={{ color: '#d0d0cc', marginBottom: 16, display: 'flex', justifyContent: 'center' }}>{icon}</div>
      <h3 style={{ fontSize: 17, fontWeight: 700, color: '#111', marginBottom: 8 }}>{title}</h3>
      {description && <p style={{ fontSize: 13, color: '#888', marginBottom: 20, lineHeight: 1.6 }}>{description}</p>}
      {action}
    </div>
  )
}

// ── Section header ────────────────────────────────────────────────────────────
interface SectionHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
  centered?: boolean
}

export function SectionHeader({ title, subtitle, action, centered = false }: SectionHeaderProps) {
  return (
    <div style={{ display: 'flex', justifyContent: centered ? 'center' : 'space-between', alignItems: 'flex-end', marginBottom: 32, flexDirection: centered ? 'column' : 'row', gap: 12, textAlign: centered ? 'center' : 'left', flexWrap: 'wrap' }}>
      <div>
        <h2 style={{ fontSize: 'clamp(22px, 3vw, 34px)', fontWeight: 900, color: '#111', margin: '0 0 6px', letterSpacing: '-.025em' }}>{title}</h2>
        {subtitle && <p style={{ fontSize: 14, color: '#aaa', margin: 0 }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

// ── Flag accent ───────────────────────────────────────────────────────────────
export function EthiopianFlag({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const widths = { sm: 20, md: 32, lg: 44 }
  const heights = { sm: 2, md: 3, lg: 4 }
  const w = widths[size], h = heights[size]
  return (
    <div style={{ display: 'flex', gap: size === 'sm' ? 3 : 5 }}>
      {['#078930','#FCDD09','#DA121A'].map(c => (
        <div key={c} style={{ width: w, height: h, borderRadius: h, background: c }}/>
      ))}
    </div>
  )
}

// ── AI pill ───────────────────────────────────────────────────────────────────
export function AIPill({ label = 'CLAUDE AI' }: { label?: string }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 20, padding: '4px 12px' }}>
      <span style={{ fontSize: 12 }}>⚡</span>
      <span style={{ fontSize: 12, fontWeight: 700, color: '#15803d' }}>{label}</span>
    </div>
  )
}

// ── Skeleton loader ───────────────────────────────────────────────────────────
export function Skeleton({ height, borderRadius = 10 }: { height: number; borderRadius?: number }) {
  return (
    <div className="skeleton" style={{ height, borderRadius }}/>
  )
}
