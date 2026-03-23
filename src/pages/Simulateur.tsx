import { useState, useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, Legend,
} from 'recharts'
import { getCapitalAtDate } from '../data/amortissement'
import { getPropertyValue } from '../data/scenarios'
import { getCashFlowCumule } from '../data/cashflow'
import { PARAMS } from '../data/params'
import { formatEUR } from '../utils/format'

const TODAY = '2026-03'
const DEFAULT_VALUE = getPropertyValue(TODAY, 'medium')

const TMI_OPTIONS = [0.11, 0.30, 0.41, 0.45]

function Slider({ label, min, max, step, value, onChange, formatter }: {
  label: string, min: number, max: number, step: number, value: number,
  onChange: (v: number) => void, formatter: (v: number) => string
}) {
  return (
    <div style={{ marginBottom: 22 }}>
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

// Calcul simplifié de l'enrichissement avec paramètres custom
function calcEnrichissementCustom(
  date: string,
  currentPropertyValue: number,
  annualGrowthRate: number,
  monthlyRent: number,
  tmi: number,
): number {
  const [year, month] = date.split('-').map(Number)
  const [todayYear, todayMonth] = TODAY.split('-').map(Number)

  const monthsFromToday = (year - todayYear) * 12 + (month - todayMonth)
  if (monthsFromToday < 0) return 0

  // Valeur future du bien
  const futureValue = currentPropertyValue * Math.pow(1 + annualGrowthRate, monthsFromToday / 12)
  const variationFuture = futureValue - PARAMS.prixAchat

  // Capital remboursé à la date
  const { rembourse } = getCapitalAtDate(date)

  // Cash flows cumulés jusqu'à aujourd'hui (réel) + projection
  const cfToday = getCashFlowCumule(TODAY)
  const annualCashflow = (monthlyRent - PARAMS.mensualite) * 12 - 3000 // estimation charges annuelles
  const adjustedCashflow = annualCashflow * (1 - tmi * 0.3) // simplification fiscale
  const cfFuture = cfToday + adjustedCashflow * (monthsFromToday / 12)

  const fraisInitiaux = -(PARAMS.apportInitial + PARAMS.fraisNotaire)
  return Math.round(rembourse + variationFuture + cfFuture + fraisInitiaux)
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#1e2538', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 16px' }}>
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

export default function Simulateur() {
  const [propertyValue, setPropertyValue] = useState(DEFAULT_VALUE)
  const [growthRate, setGrowthRate] = useState(0.008)
  const [rent, setRent] = useState(1390)
  const [tmi, setTmi] = useState(0.30)

  const milestones = useMemo(() => {
    const e5 = calcEnrichissementCustom('2031-03', propertyValue, growthRate, rent, tmi)
    const e10 = calcEnrichissementCustom('2036-03', propertyValue, growthRate, rent, tmi)
    const eFin = calcEnrichissementCustom('2046-03', propertyValue, growthRate, rent, tmi)
    return { e5, e10, eFin }
  }, [propertyValue, growthRate, rent, tmi])

  const chartData = useMemo(() => {
    const data = []
    for (let year = 2026; year <= 2046; year++) {
      const date = `${year}-03`
      data.push({
        year,
        enrichissement: calcEnrichissementCustom(date, propertyValue, growthRate, rent, tmi),
      })
    }
    return data
  }, [propertyValue, growthRate, rent, tmi])

  return (
    <div style={{ padding: '32px 36px', flex: 1 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 700, color: '#f1f5f9' }}>Simulateur</h1>
        <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>Modifiez les hypothèses et observez l'impact sur votre enrichissement</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 20, alignItems: 'start' }}>
        {/* Formulaire */}
        <div
          style={{
            background: '#1a1f2e',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 14,
            padding: '24px',
          }}
        >
          <h2 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 600, color: '#f1f5f9' }}>Hypothèses</h2>

          <Slider
            label="Valeur actuelle du bien"
            min={240000}
            max={400000}
            step={1000}
            value={propertyValue}
            onChange={setPropertyValue}
            formatter={formatEUR}
          />

          <Slider
            label="Taux d'évolution annuelle"
            min={-0.05}
            max={0.05}
            step={0.001}
            value={growthRate}
            onChange={setGrowthRate}
            formatter={v => (v >= 0 ? '+' : '') + (v * 100).toFixed(1) + ' %/an'}
          />

          <Slider
            label="Loyer mensuel"
            min={900}
            max={1800}
            step={10}
            value={rent}
            onChange={setRent}
            formatter={v => formatEUR(v) + '/mois'}
          />

          {/* TMI selector */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 10 }}>Tranche marginale d'imposition</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {TMI_OPTIONS.map(t => (
                <button
                  key={t}
                  onClick={() => setTmi(t)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 8,
                    border: `1px solid ${tmi === t ? '#6366f1' : 'rgba(255,255,255,0.1)'}`,
                    background: tmi === t ? 'rgba(99,102,241,0.15)' : 'transparent',
                    color: tmi === t ? '#818cf8' : '#64748b',
                    fontSize: 13,
                    fontWeight: tmi === t ? 700 : 400,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all 0.15s',
                  }}
                >
                  {(t * 100).toFixed(0)} %
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Résultats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Milestones */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {[
              { label: 'Dans 5 ans (2031)', value: milestones.e5, icon: '↗' },
              { label: 'Dans 10 ans (2036)', value: milestones.e10, icon: '↗' },
              { label: 'Fin de prêt (2046)', value: milestones.eFin, icon: '★' },
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
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>{item.label}</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: item.value >= 0 ? '#10b981' : '#ef4444' }}>
                  {formatEUR(item.value)}
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
              padding: '20px 24px',
            }}
          >
            <h2 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: '#f1f5f9' }}>
              Projection de l'enrichissement
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="year" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} interval={4} />
                <YAxis tickFormatter={v => formatEUR(v)} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} width={110} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={0} stroke="rgba(255,255,255,0.2)" />
                <Line
                  type="monotone"
                  dataKey="enrichissement"
                  name="Enrichissement simulé"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Summary params */}
          <div
            style={{
              background: '#1a1f2e',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 12,
              padding: '14px 18px',
              display: 'flex',
              gap: 24,
              flexWrap: 'wrap',
            }}
          >
            {[
              { label: 'Valeur actuelle', value: formatEUR(propertyValue) },
              { label: 'Croissance annuelle', value: (growthRate >= 0 ? '+' : '') + (growthRate * 100).toFixed(1) + ' %' },
              { label: 'Loyer mensuel', value: formatEUR(rent) },
              { label: 'TMI', value: (tmi * 100).toFixed(0) + ' %' },
            ].map(item => (
              <div key={item.label}>
                <div style={{ fontSize: 11, color: '#64748b', marginBottom: 2 }}>{item.label}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#a5b4fc' }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
