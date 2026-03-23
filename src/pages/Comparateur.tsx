import { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, Legend,
} from 'recharts'
import { calcVente, calcEnrichissementVente, calcEnrichissement, generateEnrichissementTimeline } from '../data/enrichissement'
import { getCapitalAtDate } from '../data/amortissement'
import { getPropertyValue } from '../data/scenarios'
import { PARAMS } from '../data/params'
import { formatEUR } from '../utils/format'

const TODAY = '2026-03'
const DEFAULT_SELL_PRICE = getPropertyValue(TODAY, 'medium')

const timelineData = generateEnrichissementTimeline()

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#1e2538', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 16px', minWidth: 200 }}>
      <div style={{ fontWeight: 700, marginBottom: 8, color: '#f1f5f9', fontSize: 14 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, fontSize: 13, marginBottom: 4 }}>
          <span style={{ color: p.stroke }}>{p.name}</span>
          <span style={{ fontWeight: 600, color: p.value >= 0 ? '#10b981' : '#ef4444' }}>{formatEUR(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

function Slider({ label, min, max, step, value, onChange, formatter }: {
  label: string, min: number, max: number, step: number, value: number,
  onChange: (v: number) => void, formatter: (v: number) => string
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 13, color: '#94a3b8' }}>{label}</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>{formatter(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: '#6366f1', cursor: 'pointer' }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#475569', marginTop: 2 }}>
        <span>{formatter(min)}</span>
        <span>{formatter(max)}</span>
      </div>
    </div>
  )
}

export default function Comparateur() {
  const [sellPrice, setSellPrice] = useState(DEFAULT_SELL_PRICE)
  const [targetYear, setTargetYear] = useState(2036)

  const { cashNet, indemnite, fraisTotal } = calcVente(sellPrice, TODAY)
  const { restantDu } = getCapitalAtDate(TODAY)
  const enrichVente = calcEnrichissementVente(sellPrice, TODAY)

  const targetDate = `${targetYear}-01`
  const enrichGarder = {
    low: calcEnrichissement(targetDate, 'low').total,
    medium: calcEnrichissement(targetDate, 'medium').total,
    best: calcEnrichissement(targetDate, 'best').total,
  }
  const capitalGarder = getCapitalAtDate(targetDate)

  // Chart data avec ligne vente horizontale
  const chartData = timelineData.filter(d => d.year >= 2026).map(d => ({
    ...d,
    vente: enrichVente,
  }))

  return (
    <div style={{ padding: '32px 36px', flex: 1 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 700, color: '#f1f5f9' }}>Comparateur</h1>
        <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>Vendre maintenant vs. garder l'appartement</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
        {/* Colonne gauche : Vendre maintenant */}
        <div
          style={{
            background: '#1a1f2e',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 14,
            padding: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: '#f1f5f9' }}>Vendre maintenant</h2>
          </div>

          <Slider
            label="Prix de vente estimé"
            min={250000}
            max={400000}
            step={1000}
            value={sellPrice}
            onChange={setSellPrice}
            formatter={formatEUR}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
            {[
              { label: 'Prix de vente', value: sellPrice, color: '#f1f5f9' },
              { label: 'Capital restant dû', value: -restantDu, color: '#ef4444' },
              { label: 'Frais de vente + divers', value: -(PARAMS.fraisVente + PARAMS.fraisDivers), color: '#ef4444' },
              { label: `Indemnité remb. anticipé`, value: -indemnite, color: '#f59e0b' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                <span style={{ fontSize: 13, color: '#94a3b8' }}>{item.label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: item.color }}>{formatEUR(item.value)}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: 'rgba(255,255,255,0.06)', borderRadius: 8, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9' }}>Cash net récupéré</span>
              <span style={{ fontSize: 16, fontWeight: 700, color: cashNet >= 0 ? '#10b981' : '#ef4444' }}>{formatEUR(cashNet)}</span>
            </div>
          </div>

          <div
            style={{
              marginTop: 16,
              padding: '14px 16px',
              background: enrichVente >= 0 ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
              border: `1px solid ${enrichVente >= 0 ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
              borderRadius: 10,
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Enrichissement si vente maintenant</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: enrichVente >= 0 ? '#10b981' : '#ef4444' }}>
              {formatEUR(enrichVente)}
            </div>
          </div>
        </div>

        {/* Colonne droite : Garder */}
        <div
          style={{
            background: '#1a1f2e',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 14,
            padding: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: '#f1f5f9' }}>Garder jusqu'à...</h2>
          </div>

          <Slider
            label="Année cible"
            min={2026}
            max={2046}
            step={1}
            value={targetYear}
            onChange={setTargetYear}
            formatter={v => String(v)}
          />

          {/* Capital remboursé à date cible */}
          <div style={{ marginBottom: 12, padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Capital remboursé en {targetYear}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#818cf8' }}>{formatEUR(capitalGarder.rembourse)}</div>
          </div>
          <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Capital restant dû en {targetYear}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#94a3b8' }}>{formatEUR(capitalGarder.restantDu)}</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {([['low', '#ef4444', 'Pessimiste'], ['medium', '#6366f1', 'Central'], ['best', '#10b981', 'Optimiste']] as const).map(([s, color, label]) => (
              <div key={s} style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: `1px solid ${color}20`, textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: color, fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: enrichGarder[s] >= 0 ? '#10b981' : '#ef4444' }}>
                  {formatEUR(enrichGarder[s])}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chart comparaison */}
      <div
        style={{
          background: '#1a1f2e',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 14,
          padding: '24px',
        }}
      >
        <h2 style={{ margin: '0 0 20px', fontSize: 17, fontWeight: 600, color: '#f1f5f9' }}>
          Vendre vs. Garder — projection 2026–2046
        </h2>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="year" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} interval={4} />
            <YAxis tickFormatter={v => formatEUR(v)} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} width={110} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: 16, fontSize: 13, color: '#94a3b8' }} />
            <ReferenceLine y={0} stroke="rgba(255,255,255,0.2)" />
            <ReferenceLine x={targetYear} stroke="#64748b" strokeDasharray="4 3" label={{ value: `Cible ${targetYear}`, fill: '#64748b', fontSize: 11, position: 'top' }} />
            <Line type="monotone" dataKey="vente" name="Vendre maintenant" stroke="#ef4444" strokeWidth={2} strokeDasharray="6 3" dot={false} />
            <Line type="monotone" dataKey="low" name="Garder — Pessimiste" stroke="#ef4444" strokeWidth={1.5} dot={false} opacity={0.5} />
            <Line type="monotone" dataKey="medium" name="Garder — Central" stroke="#6366f1" strokeWidth={2.5} dot={false} />
            <Line type="monotone" dataKey="best" name="Garder — Optimiste" stroke="#10b981" strokeWidth={1.5} dot={false} opacity={0.7} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
