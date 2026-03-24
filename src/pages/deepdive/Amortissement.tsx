import { useState, useMemo } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
  ResponsiveContainer, Legend,
} from 'recharts'
import { AMORTISSEMENT, LigneAmortissement } from '../../data/amortissement'
import { PARAMS } from '../../data/params'
import { formatEUR } from '../../utils/format'

const TODAY_MOIS = 60 // mars 2026 = échéance 60

const card: React.CSSProperties = {
  background: '#1a1f2e',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: 12,
  padding: '18px 20px',
}

const thStyle: React.CSSProperties = {
  background: '#0f1117',
  color: '#64748b',
  fontSize: 11,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  padding: '10px 14px',
  textAlign: 'left',
  position: 'sticky',
  top: 0,
  zIndex: 1,
}

const PAGE_SIZE = 25

// Données annuelles pour le graphique
function buildChartData() {
  const byYear: Record<number, { capital: number; interet: number; count: number }> = {}
  for (const l of AMORTISSEMENT) {
    const y = parseInt(l.date.split('-')[0])
    if (!byYear[y]) byYear[y] = { capital: 0, interet: 0, count: 0 }
    byYear[y].capital += l.capitalRembourse
    byYear[y].interet += l.interet
    byYear[y].count++
  }
  return Object.entries(byYear).map(([y, v]) => ({
    year: Number(y),
    capital: Math.round(v.capital / v.count),
    interet: Math.round(v.interet / v.count),
  }))
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#1e2538', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 16px' }}>
      <div style={{ fontWeight: 700, color: '#f1f5f9', marginBottom: 8, fontSize: 14 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, fontSize: 13, marginBottom: 4 }}>
          <span style={{ color: p.fill }}>{p.name}</span>
          <span style={{ color: '#f1f5f9', fontWeight: 600 }}>{formatEUR(p.value)}/mois</span>
        </div>
      ))}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: 8, paddingTop: 8, fontSize: 12, color: '#64748b' }}>
        Mensualité totale : {formatEUR(PARAMS.mensualite)}
      </div>
    </div>
  )
}

type Filter = 'all' | 'paid' | 'upcoming'

export default function Amortissement() {
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState<Filter>('all')

  const totalInterets = useMemo(() =>
    AMORTISSEMENT.reduce((s, l) => s + l.interet, 0), [])
  const capitalAtToday = AMORTISSEMENT[TODAY_MOIS - 1]
  const interetsPayesToday = useMemo(() =>
    AMORTISSEMENT.slice(0, TODAY_MOIS).reduce((s, l) => s + l.interet, 0), [])

  const filtered: LigneAmortissement[] = useMemo(() => {
    if (filter === 'paid') return AMORTISSEMENT.filter(l => l.mois <= TODAY_MOIS)
    if (filter === 'upcoming') return AMORTISSEMENT.filter(l => l.mois > TODAY_MOIS)
    return AMORTISSEMENT
  }, [filter])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const chartData = useMemo(buildChartData, [])

  const handleFilterChange = (f: Filter) => {
    setFilter(f)
    setPage(1)
  }

  const exportCSV = () => {
    const header = 'Échéance,Date,Mensualité,Capital,Intérêts,Capital restant dû\n'
    const rows = AMORTISSEMENT.map(l =>
      `${l.mois},${l.date},${PARAMS.mensualite.toFixed(2)},${l.capitalRembourse.toFixed(2)},${l.interet.toFixed(2)},${l.capitalFin.toFixed(2)}`
    ).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'amortissement.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const filterBtn = (f: Filter, label: string) => (
    <button
      key={f}
      onClick={() => handleFilterChange(f)}
      style={{
        padding: '6px 14px',
        borderRadius: 8,
        border: filter === f ? 'none' : '1px solid rgba(255,255,255,0.12)',
        background: filter === f ? '#6366f1' : 'transparent',
        color: filter === f ? '#fff' : '#94a3b8',
        fontSize: 13,
        cursor: 'pointer',
        fontWeight: filter === f ? 600 : 400,
      }}
    >
      {label}
    </button>
  )

  const tdStyle = (l: LigneAmortissement, col: number): React.CSSProperties => ({
    padding: '9px 14px',
    fontSize: 13,
    color: col === 0 ? '#94a3b8' : '#f1f5f9',
    background: l.mois === TODAY_MOIS ? 'rgba(99,102,241,0.18)' : l.mois % 2 === 0 ? '#1a1f2e' : '#151929',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
    borderLeft: l.mois === TODAY_MOIS && col === 0 ? '3px solid #6366f1' : undefined,
  })

  return (
    <div style={{ padding: '32px 36px' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 700, color: '#f1f5f9' }}>
          Tableau d'amortissement
        </h1>
        <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>
          Prêt de {formatEUR(PARAMS.montantPret)} sur 25 ans — mensualité {formatEUR(PARAMS.mensualite)}
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        <div style={card}>
          <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            Total intérêts sur le prêt
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color: '#ef4444' }}>
            {formatEUR(Math.round(totalInterets))}
          </div>
          <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>
            Pour {formatEUR(PARAMS.montantPret)} empruntés
          </div>
        </div>
        <div style={card}>
          <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            Capital remboursé à ce jour
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color: '#6366f1' }}>
            {formatEUR(Math.round(capitalAtToday?.capitalCumule ?? 0))}
          </div>
          <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>
            Restant dû : {formatEUR(Math.round(capitalAtToday?.capitalFin ?? 0))}
          </div>
        </div>
        <div style={card}>
          <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            Intérêts payés à ce jour
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color: '#f59e0b' }}>
            {formatEUR(Math.round(interetsPayesToday))}
          </div>
          <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>
            {Math.round(interetsPayesToday / totalInterets * 100)}% du total des intérêts
          </div>
        </div>
      </div>

      {/* Area Chart */}
      <div style={{ ...card, marginBottom: 24 }}>
        <h2 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 600, color: '#f1f5f9' }}>
          Composition de la mensualité dans le temps
        </h2>
        <p style={{ margin: '0 0 20px', fontSize: 13, color: '#64748b' }}>Moyenne mensuelle par année — part capital vs intérêts</p>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="year" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={v => formatEUR(v)} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 13, color: '#94a3b8', paddingTop: 12 }} />
            <ReferenceLine y={PARAMS.mensualite} stroke="rgba(255,255,255,0.3)" strokeDasharray="6 3" label={{ value: 'Mensualité totale', fill: '#64748b', fontSize: 11, position: 'insideTopRight' }} />
            <Area type="monotone" dataKey="capital" name="Part capital" stackId="1" stroke="#6366f1" fill="rgba(99,102,241,0.4)" />
            <Area type="monotone" dataKey="interet" name="Part intérêts" stackId="1" stroke="#ef4444" fill="rgba(239,68,68,0.3)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px' }}>
          <div>
            <h2 style={{ margin: '0 0 2px', fontSize: 16, fontWeight: 600, color: '#f1f5f9' }}>
              Tableau des 300 échéances
            </h2>
            <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
              Échéance {TODAY_MOIS} (mars 2026) surlignée en indigo
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {filterBtn('all', 'Toutes')}
            {filterBtn('paid', 'Déjà payées')}
            {filterBtn('upcoming', 'À venir')}
            <button onClick={exportCSV} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: '#94a3b8', fontSize: 13, cursor: 'pointer', marginLeft: 8 }}>
              ↓ CSV
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Échéance', 'Date', 'Mensualité', 'dont Capital', 'dont Intérêts', 'Capital restant dû'].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map(l => (
                <tr key={l.mois}>
                  <td style={tdStyle(l, 0)}>{l.mois}</td>
                  <td style={tdStyle(l, 1)}>{l.date}</td>
                  <td style={tdStyle(l, 2)}>{formatEUR(PARAMS.mensualite)}</td>
                  <td style={{ ...tdStyle(l, 3), color: '#6366f1' }}>{formatEUR(Math.round(l.capitalRembourse))}</td>
                  <td style={{ ...tdStyle(l, 4), color: '#ef4444' }}>{formatEUR(Math.round(l.interet))}</td>
                  <td style={tdStyle(l, 5)}>{formatEUR(Math.round(l.capitalFin))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <span style={{ fontSize: 13, color: '#64748b' }}>
            {filtered.length} échéances — page {page}/{totalPages}
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: page === 1 ? '#475569' : '#94a3b8', cursor: page === 1 ? 'default' : 'pointer', fontSize: 13 }}
            >← Précédent</button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const mid = Math.min(Math.max(page, 3), totalPages - 2)
              const p = mid - 2 + i
              if (p < 1 || p > totalPages) return null
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  style={{ padding: '5px 10px', borderRadius: 6, border: p === page ? 'none' : '1px solid rgba(255,255,255,0.12)', background: p === page ? '#6366f1' : 'transparent', color: p === page ? '#fff' : '#94a3b8', cursor: 'pointer', fontSize: 13, minWidth: 34 }}
                >{p}</button>
              )
            })}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: page === totalPages ? '#475569' : '#94a3b8', cursor: page === totalPages ? 'default' : 'pointer', fontSize: 13 }}
            >Suivant →</button>
          </div>
        </div>
      </div>
    </div>
  )
}
