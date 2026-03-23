import { ScenarioKey } from '../data/scenarios'

const CONFIG: Record<ScenarioKey, { label: string; color: string; bg: string }> = {
  low: { label: 'Pessimiste', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  medium: { label: 'Central', color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
  best: { label: 'Optimiste', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
}

interface ScenarioBadgeProps {
  scenario: ScenarioKey
  selected?: boolean
  onClick?: () => void
}

export default function ScenarioBadge({ scenario, selected, onClick }: ScenarioBadgeProps) {
  const { label, color, bg } = CONFIG[scenario]
  return (
    <button
      onClick={onClick}
      style={{
        padding: '5px 12px',
        borderRadius: 20,
        border: `1px solid ${selected ? color : 'transparent'}`,
        background: selected ? bg : 'rgba(255,255,255,0.04)',
        color: selected ? color : '#64748b',
        fontSize: 13,
        fontWeight: selected ? 600 : 400,
        cursor: onClick ? 'pointer' : 'default',
        fontFamily: 'inherit',
        transition: 'all 0.15s',
      }}
    >
      {label}
    </button>
  )
}
