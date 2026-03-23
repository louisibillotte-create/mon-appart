import { formatEUR } from '../utils/format'

interface KPICardProps {
  title: string
  value: number
  subtitle?: string
  colorize?: boolean // colore en vert/rouge selon signe
  accent?: boolean
  formatter?: (v: number) => string
}

export default function KPICard({
  title,
  value,
  subtitle,
  colorize = false,
  accent = false,
  formatter = formatEUR,
}: KPICardProps) {
  const valueColor = colorize
    ? value >= 0
      ? '#10b981'
      : '#ef4444'
    : accent
    ? '#818cf8'
    : '#f1f5f9'

  return (
    <div
      style={{
        background: '#1a1f2e',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 14,
        padding: '20px 22px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {title}
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, color: valueColor, letterSpacing: '-0.5px' }}>
        {formatter(value)}
      </div>
      {subtitle && (
        <div style={{ fontSize: 12, color: '#475569' }}>{subtitle}</div>
      )}
    </div>
  )
}
