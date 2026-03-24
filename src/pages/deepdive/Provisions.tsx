import { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import {
  useData,
  PROVISIONS_CATEGORIES,
  PROVISIONS_YEARS,
  DEFAULT_PROVISIONS,
  ProvisionsCategorie,
} from '../../context/DataContext'
import { formatEUR } from '../../utils/format'

const card: React.CSSProperties = {
  background: '#1a1f2e',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: 14,
  padding: '24px',
  marginBottom: 24,
}

const inputStyle: React.CSSProperties = {
  background: '#0f1117',
  border: '1px solid rgba(255,255,255,0.1)',
  color: '#f1f5f9',
  borderRadius: 6,
  padding: '4px 6px',
  fontSize: 12,
  width: 72,
  textAlign: 'right',
  outline: 'none',
}

const thStyle: React.CSSProperties = {
  background: '#0f1117',
  color: '#64748b',
  fontSize: 10,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  padding: '10px 8px',
  textAlign: 'right',
  whiteSpace: 'nowrap',
}

const tdStyle = (i: number, right = true): React.CSSProperties => ({
  padding: '6px 8px',
  fontSize: 12,
  color: '#f1f5f9',
  background: i % 2 === 0 ? '#1a1f2e' : '#151929',
  borderBottom: '1px solid rgba(255,255,255,0.04)',
  textAlign: right ? 'right' : 'left',
})

const CAT_COLORS: Record<ProvisionsCategorie, string> = {
  amenagements_interieurs: '#6366f1',
  etancheite: '#3b82f6',
  gros_oeuvre: '#f59e0b',
  installation_electrique: '#10b981',
  toiture: '#ef4444',
  inventaire_mobilier: '#8b5cf6',
}

const CATS = Object.keys(PROVISIONS_CATEGORIES) as ProvisionsCategorie[]

const btnApply: React.CSSProperties = {
  background: '#6366f1',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  padding: '8px 18px',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
}

const btnReset: React.CSSProperties = {
  background: 'transparent',
  color: '#94a3b8',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: 8,
  padding: '8px 18px',
  fontSize: 13,
  fontWeight: 500,
  cursor: 'pointer',
}

function deepCopy(p: Record<ProvisionsCategorie, Record<number, number>>) {
  const r = {} as Record<ProvisionsCategorie, Record<number, number>>
  for (const cat of CATS) r[cat] = { ...p[cat] }
  return r
}

export default function Provisions() {
  const { provisions, setProvisions } = useData()
  const [draft, setDraft] = useState(() => deepCopy(provisions))

  const update = (cat: ProvisionsCategorie, year: number, raw: string) => {
    const val = parseFloat(raw)
    setDraft(prev => {
      const next = deepCopy(prev)
      next[cat][year] = isNaN(val) ? prev[cat][year] : val
      return next
    })
  }

  const apply = () => setProvisions(deepCopy(draft))
  const reset = () => {
    const d = deepCopy(DEFAULT_PROVISIONS)
    setDraft(d)
    setProvisions(d)
  }

  // Totaux par année
  const totalByYear = PROVISIONS_YEARS.map(y => ({
    year: y,
    total: CATS.reduce((s, c) => s + (draft[c][y] || 0), 0),
    ...Object.fromEntries(CATS.map(c => [c, draft[c][y] || 0])),
  }))

  const grandTotal = totalByYear.reduce((s, r) => s + r.total, 0)

  // Totaux par catégorie
  const totalByCat = Object.fromEntries(
    CATS.map(c => [c, PROVISIONS_YEARS.reduce((s, y) => s + (draft[c][y] || 0), 0)])
  )

  const chartData = totalByYear.map(r => ({ name: String(r.year), ...Object.fromEntries(CATS.map(c => [c, r[c]])) }))

  return (
    <div style={{ padding: '32px 36px' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 700, color: '#f1f5f9' }}>
          Amortissements &amp; Provisions
        </h1>
        <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>
          Dotations annuelles prévisionnelles par composant — 2025 à 2046
        </p>
      </div>

      {/* Graphique */}
      <div style={card}>
        <h2 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 600, color: '#f1f5f9' }}>
          Vue d'ensemble par année
        </h2>
        <p style={{ margin: '0 0 16px', fontSize: 13, color: '#64748b' }}>
          Provisions cumulées par composant
        </p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={v => formatEUR(v)} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
            <Tooltip
              formatter={(v: number, name: string) => [formatEUR(v), PROVISIONS_CATEGORIES[name as ProvisionsCategorie] ?? name]}
              contentStyle={{ background: '#1e2538', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 12 }}
              labelStyle={{ color: '#f1f5f9', fontWeight: 700, marginBottom: 4 }}
            />
            <Legend
              formatter={(v: string) => PROVISIONS_CATEGORIES[v as ProvisionsCategorie] ?? v}
              wrapperStyle={{ fontSize: 12, color: '#94a3b8', paddingTop: 12 }}
            />
            {CATS.map(c => (
              <Bar key={c} dataKey={c} stackId="a" fill={CAT_COLORS[c]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tableau de saisie */}
      <div style={card}>
        <h2 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 600, color: '#f1f5f9' }}>
          Saisie des dotations annuelles (€)
        </h2>
        <p style={{ margin: '0 0 16px', fontSize: 13, color: '#64748b' }}>
          Entrez les montants de provisions pour chaque composant et chaque année
        </p>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', minWidth: 900 }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, textAlign: 'left', position: 'sticky', left: 0, zIndex: 1, minWidth: 64 }}>Année</th>
                {CATS.map(c => (
                  <th key={c} style={thStyle}>
                    <span style={{ color: CAT_COLORS[c] }}>■</span>{' '}
                    {PROVISIONS_CATEGORIES[c]}
                  </th>
                ))}
                <th style={{ ...thStyle, color: '#a5b4fc' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {PROVISIONS_YEARS.map((y, i) => {
                const rowTotal = CATS.reduce((s, c) => s + (draft[c][y] || 0), 0)
                return (
                  <tr key={y}>
                    <td style={{ ...tdStyle(i, false), fontWeight: 600, position: 'sticky', left: 0, zIndex: 1 }}>{y}</td>
                    {CATS.map(c => (
                      <td key={c} style={{ ...tdStyle(i), padding: '5px 8px' }}>
                        <input
                          type="number"
                          min="0"
                          step="100"
                          style={inputStyle}
                          defaultValue={draft[c][y] || 0}
                          key={`${c}-${y}`}
                          onBlur={e => update(c, y, e.target.value)}
                        />
                      </td>
                    ))}
                    <td style={{ ...tdStyle(i), fontWeight: 700, color: rowTotal > 0 ? '#a5b4fc' : '#475569' }}>
                      {rowTotal > 0 ? formatEUR(rowTotal) : '—'}
                    </td>
                  </tr>
                )
              })}
              {/* Ligne totaux */}
              <tr>
                <td style={{ padding: '10px 8px', fontSize: 12, fontWeight: 700, color: '#94a3b8', background: '#0f1117', textAlign: 'left' }}>
                  TOTAL
                </td>
                {CATS.map(c => (
                  <td key={c} style={{ padding: '10px 8px', fontSize: 12, fontWeight: 700, color: totalByCat[c] > 0 ? '#f1f5f9' : '#475569', background: '#0f1117', textAlign: 'right' }}>
                    {totalByCat[c] > 0 ? formatEUR(totalByCat[c]) : '—'}
                  </td>
                ))}
                <td style={{ padding: '10px 8px', fontSize: 13, fontWeight: 700, color: '#a5b4fc', background: '#0f1117', textAlign: 'right' }}>
                  {formatEUR(grandTotal)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
          <button style={btnApply} onClick={apply}>Appliquer</button>
          <button style={btnReset} onClick={reset}>Réinitialiser</button>
        </div>
      </div>

      {/* Récapitulatif par composant */}
      <div style={{ ...card, marginBottom: 0 }}>
        <h2 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600, color: '#f1f5f9' }}>
          Récapitulatif par composant (2025–2046)
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          {CATS.map(c => {
            const total = totalByCat[c]
            const avg = total / PROVISIONS_YEARS.length
            return (
              <div key={c} style={{
                background: '#0f1117',
                border: `1px solid ${CAT_COLORS[c]}33`,
                borderRadius: 10,
                padding: '14px 16px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: CAT_COLORS[c], flexShrink: 0 }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#f1f5f9' }}>{PROVISIONS_CATEGORIES[c]}</span>
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: total > 0 ? CAT_COLORS[c] : '#475569' }}>
                  {total > 0 ? formatEUR(total) : '—'}
                </div>
                {total > 0 && (
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                    moy. {formatEUR(Math.round(avg))}/an
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
