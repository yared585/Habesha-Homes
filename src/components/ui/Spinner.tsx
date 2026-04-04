// Reusable spinner — uses @keyframes spin already defined in globals.css

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: string
}

export function Spinner({ size = 'md', color = '#1a3d2b' }: SpinnerProps) {
  const px = size === 'sm' ? 16 : size === 'lg' ? 40 : 24
  const border = size === 'sm' ? 2 : 3

  return (
    // Outer div sets currentColor so both children inherit it
    <div style={{ width: px, height: px, position: 'relative', flexShrink: 0, color }}>
      {/* Faint track ring */}
      <div style={{
        position: 'absolute', inset: 0,
        borderRadius: '50%',
        border: `${border}px solid currentColor`,
        opacity: 0.2,
      }} />
      {/* Spinning arc */}
      <div style={{
        position: 'absolute', inset: 0,
        borderRadius: '50%',
        border: `${border}px solid transparent`,
        borderTopColor: 'currentColor',
        animation: 'spin 0.8s linear infinite',
      }} />
    </div>
  )
}
