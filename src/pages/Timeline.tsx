import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ReferenceLine, ResponsiveContainer, Area, ComposedChart,
} from 'recharts'
import { generateEnrichissementTimeline } from '../data/enrichissement'
import { formatEUR } from '../utils/format'
import { calcEnrichissement } from '../data/enrichissement'

const data = generateEnrichissementTimeline()

// Trouver les dates de seuil de rentabilité
function findBreakeven(key: 'low' | 'medium' | 'best'): string | null {
  for (let i = 1; i < data.length; i++) {
    if (data[i - 1][key] < 0 && data[i][key] >= 0) {
      return String(data[i].year)
    }
  }
  return null
}

const breakevenLow = findBreakeven('low')
const breakevenMedium = findBreakeven('medium')
const breakevenBest = findBreakeven('best')

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#1e2538', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 16px', minWidth: 220 }}>
      <div style={{ fontWeight: 700, marginBottom: 8, color: '#f1f5f9', fontSize: 14 }}>{label}</div>
      {payload.map((p: any) => (
        p.dataKey !== 'confidence' && (
          <div key={p.dataKey} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, fontSize: 13, marginBottom: 4 }}>
            <span style={{ color: p.stroke || p.fill }}>{p.name}</span>
            <span style={{ fontWeight: 600, color: p.value >= 0 ? '#10b981' : '#ef4444' }}>{formatEUR(p.value)}</span>
          </div>
        )
      ))}
    </div>
  )
}

// Add confidence band data
const chartData = data.map(d => ({
  ...d,
  confidence: [d.low, d.best],
}))

export default function Timeline() {
  return (
    <div style={{ padding: '32px 36px', flex: 1 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 700, color: '#f1f5f9' }}>Timeline d'enrichissement</h1>
        <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>Enrichissement cumulé de mars 2021 à mars 2046 — 3 scénarios</p>
      </div>

      {/* Breakeven cards */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Pessimiste', year: breakevenLow, color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
          { label: 'Central', year: breakevenMedium, color: '#6366f1', bg: 'rgba(99,102,241,0.08)' },
          { label: 'Optimiste', year: breakevenBest, color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
        ].map(item => (
          <div
            key={item.label}
            style={{
              background: item.bg,
              border: `1px solid ${item.color}30`,
              borderRadius: 12,
              padding: '14px 20px',
              flex: 1,
            }}
          >
            <div style={{ fontSize: 12, color: item.color, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
              {item.label}
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9' }}>
              {item.year ? `Seuil en ${item.year}` : 'Pas atteint'}
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
              {item.year ? `Rentabilité atteinte en ${item.year}` : 'Reste négatif sur la période'}
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div
        style={{
          background: '#1a1f2e',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 14,
          padding: '24px',
        }}
      >
        <h2 style={{ margin: '0 0 20px', fontSize: 17, fontWeight: 600, color: '#f1f5f9' }}>
          Courbe d'enrichissement 2021–2046
        </h2>
        <ResponsiveContainer width="100%" height={420}>
          <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="year"
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              interval={4}
            />
            <YAxis
              tickFormatter={v => formatEUR(v)}
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={110}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: 16, fontSize: 13, color: '#94a3b8' }} />

            {/* Zone de confiance entre Low et Best */}
            <Area
              dataKey="confidence"
              fill="rgba(99,102,241,0.07)"
              stroke="none"
              name="Zone de confiance"
              legendType="none"
            />

            {/* Ligne Aujourd'hui */}
            <ReferenceLine
              x={2026}
              stroke="#6366f1"
              strokeDasharray="5 4"
              strokeWidth={1.5}
              label={{ value: "Aujourd'hui", fill: '#6366f1', fontSize: 12, position: 'top' }}
            />

            {/* Seuil de rentabilité */}
            <ReferenceLine y={0} stroke="rgba(255,255,255,0.25)" strokeWidth={1} />

            <Line
              type="monotone"
              dataKey="low"
              name="Pessimiste"
              stroke="#ef4444"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="medium"
              name="Central"
              stroke="#6366f1"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="best"
              name="Optimiste"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Values summary table */}
      <div
        style={{
          background: '#1a1f2e',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 14,
          padding: '20px 24px',
          marginTop: 20,
        }}
      >
        <h2 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: '#f1f5f9' }}>
          Enrichissement à des jalons clés
        </h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                {['Date', 'Pessimiste', 'Central', 'Optimiste'].map(h => (
                  <th key={h} style={{ textAlign: h === 'Date' ? 'left' : 'right', padding: '8px 12px', color: '#64748b', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'Aujourd\'hui (mars 2026)', date: '2026-03' },
                { label: 'Dans 5 ans (2031)', date: '2031-01' },
                { label: 'Dans 10 ans (2036)', date: '2036-01' },
                { label: 'Fin de prêt (2046)', date: '2046-03' },
              ].map(row => {
                const low = calcEnrichissement(row.date, 'low').total
                const med = calcEnrichissement(row.date, 'medium').total
                const best = calcEnrichissement(row.date, 'best').total
                return (
                  <tr key={row.date} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '10px 12px', color: '#94a3b8' }}>{row.label}</td>
                    {[low, med, best].map((v, i) => (
                      <td key={i} style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, color: v >= 0 ? '#10b981' : '#ef4444' }}>
                        {formatEUR(v)}
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
