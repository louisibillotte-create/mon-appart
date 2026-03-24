import { useState, useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine,
} from 'recharts'
import { useData } from '../../context/DataContext'
import { PARAMS } from '../../data/params'
import { formatEUR } from '../../utils/format'

const CAPITAL_INITIAL = PARAMS.apportInitial + PARAMS.fraisNotaire // 27 900 + 25 700 = 53 600€
const START_YEAR = 2021
const END_YEAR = 2046
const TODAY = '2026-03'

const card: React.CSSProperties = {
  background: '#1a1f2e',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: 14,
  padding: '20px',
  marginBottom: 24,
}

function compound(capital: number, rate: number, years: number): number {
  return Math.round(capital * Math.pow(1 + rate, years))
}

interface ChartPoint {
  year: number
  immobilier: number
  livretA: number
  etf: number
  scpi: number
}

const COLORS = {
  immobilier: '#6366f1',
  livretA:    '#3b82f6',
  etf:        '#10b981',
  scpi:       '#f59e0b',
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#1e2538', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 16px', minWidth: 220 }}>
      <div style={{ fontWeight: 700, color: '#f1f5f9', marginBottom: 8, fontSize: 14 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, fontSize: 13, marginBottom: 4 }}>
          <span style={{ color: p.stroke }}>{p.name}</span>
          <span style={{ color: '#f1f5f9', fontWeight: 600 }}>{formatEUR(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

function SliderRow({ label, value, min, max, step, unit, onChange }: {
  label: string; value: number; min: number; max: number; step: number; unit: string; onChange: (v: number) => void
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 13, color: '#94a3b8' }}>{label}</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>{value.toFixed(1)}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{ width: '100%', accentColor: '#6366f1', cursor: 'pointer' }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#475569', marginTop: 2 }}>
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  )
}

export default function Alternatives() {
  const { calcEnrichissement } = useData()

  const [tauxLivret, setTauxLivret] = useState(3.0)
  const [tauxETF, setTauxETF] = useState(7.0)
  const [tauxSCPI, setTauxSCPI] = useState(4.5)

  const chartData: ChartPoint[] = useMemo(() => {
    return Array.from({ length: END_YEAR - START_YEAR + 1 }, (_, i) => {
      const year = START_YEAR + i
      const yearsElapsed = year - START_YEAR
      const date = year === START_YEAR ? '2021-03' : year === END_YEAR ? '2046-03' : `${year}-01`

      // Immobilier : enrichissement net scénario central
      const immobilier = calcEnrichissement(date, 'medium').total

      // Alternatives : capital composé - capital investi initial
      const capitalLivret = compound(CAPITAL_INITIAL, tauxLivret / 100, yearsElapsed) - CAPITAL_INITIAL
      const capitalETF    = compound(CAPITAL_INITIAL, tauxETF / 100,    yearsElapsed) - CAPITAL_INITIAL
      const capitalSCPI   = compound(CAPITAL_INITIAL, tauxSCPI / 100,   yearsElapsed) - CAPITAL_INITIAL

      return {
        year,
        immobilier,
        livretA: capitalLivret,
        etf: capitalETF,
        scpi: capitalSCPI,
      }
    })
  }, [calcEnrichissement, tauxLivret, tauxETF, tauxSCPI])

  // Trouver quand ETF dépasse l'immobilier
  const etfCrossYear = useMemo(() => {
    for (const pt of chartData) {
      if (pt.etf > pt.immobilier) return pt.year
    }
    return null
  }, [chartData])

  // Horizons fixes pour le tableau
  const todayIdx = chartData.findIndex(p => p.year === 2026) || 5
  const in5Idx   = chartData.findIndex(p => p.year === 2031)
  const in10Idx  = chartData.findIndex(p => p.year === 2036)
  const finPretIdx = chartData.findIndex(p => p.year === 2046)

  const tableHorizons = [
    { label: "Aujourd'hui (2026)",  pt: chartData[todayIdx] },
    { label: 'Dans 5 ans (2031)',   pt: chartData[in5Idx] },
    { label: 'Dans 10 ans (2036)',  pt: chartData[in10Idx] },
    { label: 'Fin prêt (2046)',     pt: chartData[finPretIdx] },
  ]

  const thStyle: React.CSSProperties = {
    background: '#0f1117',
    color: '#64748b',
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    padding: '10px 14px',
    textAlign: 'left',
  }

  const tdS = (i: number, color?: string): React.CSSProperties => ({
    padding: '12px 14px',
    fontSize: 13,
    color: color || '#f1f5f9',
    fontWeight: color ? 600 : 400,
    background: i % 2 === 0 ? '#1a1f2e' : '#151929',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
  })

  // Leader à chaque horizon
  const getLeader = (pt: ChartPoint) => {
    const vals = {
      'Immobilier': pt.immobilier,
      'Livret A': pt.livretA,
      'ETF World': pt.etf,
      'SCPI': pt.scpi,
    }
    return Object.entries(vals).sort((a, b) => b[1] - a[1])[0][0]
  }

  // Texte dynamique
  const dynamicText = useMemo(() => {
    const lines: string[] = []
    if (etfCrossYear) {
      lines.push(`Avec un rendement ETF de ${tauxETF.toFixed(1)}%/an, la bourse dépasse l'immobilier à partir de ${etfCrossYear}.`)
    } else {
      lines.push(`Avec un rendement ETF de ${tauxETF.toFixed(1)}%/an, l'immobilier reste devant sur toute la durée du prêt.`)
    }
    const end = chartData[finPretIdx]
    if (end) {
      const leader = getLeader(end)
      lines.push(`En 2046, ${leader} est en tête avec ${formatEUR(Math.max(end.immobilier, end.livretA, end.etf, end.scpi))}.`)
      if (end.immobilier > end.livretA) {
        lines.push(`Le Livret A (${tauxLivret.toFixed(1)}%/an) génère ${formatEUR(end.livretA)} vs ${formatEUR(end.immobilier)} pour l'immobilier.`)
      } else {
        lines.push(`Le Livret A (${tauxLivret.toFixed(1)}%/an) génère ${formatEUR(end.livretA)}, soit ${formatEUR(end.livretA - end.immobilier)} de plus que l'immobilier.`)
      }
    }
    return lines
  }, [chartData, etfCrossYear, tauxETF, tauxLivret, finPretIdx])

  return (
    <div style={{ padding: '32px 36px' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 700, color: '#f1f5f9' }}>
          Et si j'avais investi autrement ?
        </h1>
        <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>
          Capital immobilisé : {formatEUR(CAPITAL_INITIAL)} (apport {formatEUR(PARAMS.apportInitial)} + frais notaire {formatEUR(PARAMS.fraisNotaire)}) — investi dès mars 2021
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24, marginBottom: 24, alignItems: 'start' }}>
        {/* Sliders */}
        <div style={card}>
          <h2 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: '#f1f5f9' }}>
            Paramètres de comparaison
          </h2>
          <SliderRow
            label="Rendement Livret A"
            value={tauxLivret} min={0} max={5} step={0.1} unit="%/an"
            onChange={setTauxLivret}
          />
          <SliderRow
            label="Rendement ETF World"
            value={tauxETF} min={0} max={12} step={0.1} unit="%/an"
            onChange={setTauxETF}
          />
          <SliderRow
            label="Rendement SCPI"
            value={tauxSCPI} min={0} max={8} step={0.1} unit="%/an"
            onChange={setTauxSCPI}
          />
          <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: '#a5b4fc' }}>
            Immobilier = scénario central, enrichissement net (capital remboursé + variation valeur + cashflows − frais initiaux)
          </div>
        </div>

        {/* Chart */}
        <div style={card}>
          <h2 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 600, color: '#f1f5f9' }}>Enrichissement net comparé</h2>
          <p style={{ margin: '0 0 16px', fontSize: 13, color: '#64748b' }}>Gain net par rapport au capital initial investi (2021–2046)</p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="year" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => formatEUR(v)} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} width={90} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 13, color: '#94a3b8', paddingTop: 12 }} />
              <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)" />
              {etfCrossYear && (
                <ReferenceLine x={etfCrossYear} stroke="rgba(16,185,129,0.4)" strokeDasharray="4 3"
                  label={{ value: `ETF > Immo (${etfCrossYear})`, fill: '#10b981', fontSize: 11, position: 'insideTopLeft' }}
                />
              )}
              <Line type="monotone" dataKey="immobilier" name="Immobilier (Central)" stroke={COLORS.immobilier} strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="livretA"    name={`Livret A (${tauxLivret.toFixed(1)}%)`}  stroke={COLORS.livretA}    strokeWidth={2} dot={false} strokeDasharray="5 3" />
              <Line type="monotone" dataKey="etf"        name={`ETF World (${tauxETF.toFixed(1)}%)`}    stroke={COLORS.etf}        strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="scpi"       name={`SCPI (${tauxSCPI.toFixed(1)}%)`}        stroke={COLORS.scpi}       strokeWidth={2} dot={false} strokeDasharray="3 3" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tableau comparatif */}
      <div style={card}>
        <h2 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 600, color: '#f1f5f9' }}>
          Tableau comparatif à horizons fixes
        </h2>
        <p style={{ margin: '0 0 16px', fontSize: 13, color: '#64748b' }}>
          Enrichissement net (gain par rapport aux {formatEUR(CAPITAL_INITIAL)} investis initialement)
        </p>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>Horizon</th>
              <th style={{ ...thStyle, color: COLORS.immobilier }}>Immobilier</th>
              <th style={{ ...thStyle, color: COLORS.livretA }}>Livret A</th>
              <th style={{ ...thStyle, color: COLORS.etf }}>ETF World</th>
              <th style={{ ...thStyle, color: COLORS.scpi }}>SCPI</th>
              <th style={thStyle}>Leader</th>
            </tr>
          </thead>
          <tbody>
            {tableHorizons.map(({ label, pt }, i) => {
              if (!pt) return null
              const leader = getLeader(pt)
              const maxVal = Math.max(pt.immobilier, pt.livretA, pt.etf, pt.scpi)
              return (
                <tr key={label}>
                  <td style={tdS(i, '#94a3b8')}>{label}</td>
                  <td style={tdS(i, pt.immobilier === maxVal ? '#6366f1' : '#f1f5f9')}>{formatEUR(pt.immobilier)}</td>
                  <td style={tdS(i, pt.livretA === maxVal ? '#3b82f6' : '#f1f5f9')}>{formatEUR(pt.livretA)}</td>
                  <td style={tdS(i, pt.etf === maxVal ? '#10b981' : '#f1f5f9')}>{formatEUR(pt.etf)}</td>
                  <td style={tdS(i, pt.scpi === maxVal ? '#f59e0b' : '#f1f5f9')}>{formatEUR(pt.scpi)}</td>
                  <td style={{ ...tdS(i), fontWeight: 700, color: leader === 'Immobilier' ? COLORS.immobilier : leader === 'Livret A' ? COLORS.livretA : leader === 'ETF World' ? COLORS.etf : COLORS.scpi }}>
                    {leader}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Analyse dynamique */}
      <div style={{ ...card, marginBottom: 0, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)' }}>
        <h2 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 600, color: '#a5b4fc' }}>
          Analyse dynamique
        </h2>
        {dynamicText.map((line, i) => (
          <p key={i} style={{ margin: '0 0 8px', fontSize: 14, color: '#e2e8f0', lineHeight: 1.6 }}>
            {i === 0 ? '→' : '→'} {line}
          </p>
        ))}
      </div>
    </div>
  )
}
