import { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { calcEnrichissement } from '../data/enrichissement'
import { ScenarioKey } from '../data/scenarios'
import { formatEUR } from '../utils/format'
import KPICard from '../components/KPICard'
import ScenarioBadge from '../components/ScenarioBadge'

const TODAY = '2026-03'
const SCENARIOS: ScenarioKey[] = ['low', 'medium', 'best']
const SCENARIO_LABELS: Record<ScenarioKey, string> = { low: 'Pessimiste', medium: 'Central', best: 'Optimiste' }
const SCENARIO_COLORS: Record<ScenarioKey, string> = { low: '#ef4444', medium: '#6366f1', best: '#10b981' }

const BARS = [
  { key: 'capitalRembourse', label: 'Capital remboursé', color: '#6366f1' },
  { key: 'variationValeur', label: 'Variation valeur', color: '#f59e0b' },
  { key: 'cashFlowCumule', label: 'Cash flows cumulés', color: '#10b981' },
  { key: 'fraisInitiaux', label: 'Frais initiaux', color: '#ef4444' },
]

function buildChartData() {
  return SCENARIOS.map(s => {
    const d = calcEnrichissement(TODAY, s)
    return {
      scenario: SCENARIO_LABELS[s],
      key: s,
      capitalRembourse: d.capitalRembourse,
      variationValeur: d.variationValeur,
      cashFlowCumule: d.cashFlowCumule,
      fraisInitiaux: d.fraisInitiaux,
      total: d.total,
    }
  })
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  const total = payload.reduce((sum: number, p: any) => sum + (p.value || 0), 0)
  return (
    <div style={{ background: '#1e2538', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 16px', minWidth: 200 }}>
      <div style={{ fontWeight: 700, marginBottom: 8, color: '#f1f5f9', fontSize: 14 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, fontSize: 13, marginBottom: 4 }}>
          <span style={{ color: p.fill }}>{p.name}</span>
          <span style={{ color: p.value >= 0 ? '#10b981' : '#ef4444', fontWeight: 600 }}>{formatEUR(p.value)}</span>
        </div>
      ))}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: 8, paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700 }}>
        <span style={{ color: '#94a3b8' }}>Enrichissement net</span>
        <span style={{ color: total >= 0 ? '#10b981' : '#ef4444' }}>{formatEUR(total)}</span>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [activeScenario, setActiveScenario] = useState<ScenarioKey>('medium')
  const data = calcEnrichissement(TODAY, activeScenario)
  const chartData = buildChartData()

  return (
    <div style={{ padding: '32px 36px', flex: 1 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: '#f1f5f9' }}>Dashboard</h1>
          <span style={{ fontSize: 13, color: '#64748b', background: 'rgba(99,102,241,0.12)', padding: '3px 10px', borderRadius: 20, border: '1px solid rgba(99,102,241,0.2)' }}>
            Mars 2026
          </span>
        </div>
        <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>Situation patrimoniale au 1er mars 2026 — mois 60 depuis l'achat</p>
      </div>

      {/* Scenario selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {SCENARIOS.map(s => (
          <ScenarioBadge key={s} scenario={s} selected={activeScenario === s} onClick={() => setActiveScenario(s)} />
        ))}
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        <KPICard
          title="Valeur estimée du bien"
          value={data.valeurBien}
          subtitle={`Scénario ${SCENARIO_LABELS[activeScenario]}`}
        />
        <KPICard
          title="Capital remboursé"
          value={data.capitalRembourse}
          subtitle="Depuis avril 2021"
          accent
        />
        <KPICard
          title="Capital restant dû"
          value={data.capitalRestantDu}
          subtitle="Sur 337 800 € empruntés"
        />
        <KPICard
          title="Enrichissement net"
          value={data.total}
          subtitle={`Scénario ${SCENARIO_LABELS[activeScenario]}`}
          colorize
        />
      </div>

      {/* Breakdown section */}
      <div
        style={{
          background: '#1a1f2e',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 14,
          padding: '24px',
          marginBottom: 24,
        }}
      >
        <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ margin: '0 0 4px', fontSize: 17, fontWeight: 600, color: '#f1f5f9' }}>
              Décomposition de l'enrichissement
            </h2>
            <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
              3 scénarios côte à côte — les 4 composantes de l'enrichissement net
            </p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={chartData} margin={{ top: 10, right: 20, left: 20, bottom: 0 }} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="scenario"
              tick={{ fill: '#94a3b8', fontSize: 13 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={v => formatEUR(v)}
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={100}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <ReferenceLine y={0} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
            <Legend
              wrapperStyle={{ paddingTop: 16, fontSize: 13, color: '#94a3b8' }}
            />
            {BARS.map(b => (
              <Bar key={b.key} dataKey={b.key} name={b.label} stackId="a" fill={b.color} radius={b.key === 'fraisInitiaux' ? [0, 0, 4, 4] : undefined} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detail cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {[
          { label: 'Capital remboursé', value: data.capitalRembourse, desc: 'Remboursement du prêt' },
          { label: 'Variation de valeur', value: data.variationValeur, desc: `vs prix achat 340 000 €` },
          { label: 'Cash flows cumulés', value: data.cashFlowCumule, desc: 'Loyers fictifs + locatifs - charges' },
        ].map(item => (
          <div
            key={item.label}
            style={{
              background: '#1a1f2e',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 12,
              padding: '16px 18px',
            }}
          >
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{item.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: item.value >= 0 ? '#10b981' : '#ef4444', marginBottom: 4 }}>
              {formatEUR(item.value)}
            </div>
            <div style={{ fontSize: 12, color: '#475569' }}>{item.desc}</div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 16,
          background: '#1a1f2e',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 12,
          padding: '16px 18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Frais initiaux engagés</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#ef4444' }}>{formatEUR(data.fraisInitiaux)}</div>
        </div>
        <div style={{ display: 'flex', gap: 32 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: '#64748b' }}>Apport initial</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#f1f5f9' }}>{formatEUR(-27900)}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: '#64748b' }}>Frais de notaire</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#f1f5f9' }}>{formatEUR(-25700)}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
