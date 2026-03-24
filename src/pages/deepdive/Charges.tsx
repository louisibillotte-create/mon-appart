import { useState, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LineChart, Line,
} from 'recharts'
import {
  TRANSACTIONS, PREVISIONNEL_2025,
  getAnnualSummary, getTransactionsByCategorie,
  Categorie, Transaction,
} from '../../data/transactions'
import { formatEUR } from '../../utils/format'

const YEARS = [2021, 2022, 2023, 2024, 2025]

const CAT_CONFIG: Record<Categorie, { label: string; color: string }> = {
  travaux:  { label: 'Travaux',        color: '#f59e0b' },
  assurance:{ label: 'Assurance',      color: '#6366f1' },
  copro:    { label: 'Charges copro',  color: '#3b82f6' },
  taxe:     { label: 'Taxes',          color: '#ef4444' },
  emprunt:  { label: 'Emprunt',        color: '#94a3b8' },
}

const card: React.CSSProperties = {
  background: '#1a1f2e',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: 14,
  padding: '20px',
  marginBottom: 24,
}

// Tooltip annuel groupé
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  const total = payload.reduce((s: number, p: any) => s + Math.abs(p.value || 0), 0)
  return (
    <div style={{ background: '#1e2538', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 16px', minWidth: 200 }}>
      <div style={{ fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, fontSize: 13, marginBottom: 3 }}>
          <span style={{ color: p.fill }}>{p.name}</span>
          <span style={{ color: '#ef4444', fontWeight: 600 }}>{formatEUR(Math.abs(p.value))}</span>
        </div>
      ))}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: 8, paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700 }}>
        <span style={{ color: '#94a3b8' }}>Total charges</span>
        <span style={{ color: '#ef4444' }}>{formatEUR(total)}</span>
      </div>
    </div>
  )
}

// Mini sparkline
function Sparkline({ data }: { data: number[] }) {
  const pts = data.map((v, i) => ({ x: i, v: Math.abs(v) }))
  return (
    <ResponsiveContainer width={120} height={32}>
      <LineChart data={pts}>
        <Line type="monotone" dataKey="v" stroke="#6366f1" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}

// Accordion item par thème
function AccordionItem({ cat }: { cat: Categorie }) {
  const [open, setOpen] = useState(false)
  const txs: Transaction[] = getTransactionsByCategorie(cat)
  const total = txs.reduce((s, t) => s + t.montant, 0)
  const cfg = CAT_CONFIG[cat]
  const byYear = YEARS.map(y => txs.filter(t => t.date.startsWith(String(y))).reduce((s, t) => s + t.montant, 0))

  return (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 0', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9' }}>{cfg.label}</span>
          <span style={{ fontSize: 13, color: '#ef4444', fontWeight: 700 }}>{formatEUR(total)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Sparkline data={byYear} />
          <span style={{ color: '#64748b', fontSize: 18 }}>{open ? '▲' : '▼'}</span>
        </div>
      </button>

      {open && (
        <div style={{ paddingBottom: 16 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Date', 'Description', 'Montant'].map(h => (
                  <th key={h} style={{ background: '#0f1117', color: '#64748b', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '8px 12px', textAlign: 'left' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {txs.map((t, i) => (
                <tr key={t.id}>
                  <td style={{ padding: '7px 12px', fontSize: 13, color: '#94a3b8', background: i % 2 === 0 ? '#1a1f2e' : '#151929' }}>{t.date}</td>
                  <td style={{ padding: '7px 12px', fontSize: 13, color: '#f1f5f9', background: i % 2 === 0 ? '#1a1f2e' : '#151929' }}>
                    {t.description}
                    {t.sous_categorie && <span style={{ fontSize: 11, color: '#64748b', marginLeft: 8 }}>({t.sous_categorie})</span>}
                  </td>
                  <td style={{ padding: '7px 12px', fontSize: 13, fontWeight: 600, color: '#ef4444', background: i % 2 === 0 ? '#1a1f2e' : '#151929', textAlign: 'right' }}>
                    {formatEUR(t.montant)}
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan={2} style={{ padding: '10px 12px', fontSize: 13, fontWeight: 700, color: '#94a3b8', background: '#0f1117' }}>Total</td>
                <td style={{ padding: '10px 12px', fontSize: 14, fontWeight: 700, color: '#ef4444', background: '#0f1117', textAlign: 'right' }}>{formatEUR(total)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

type Toggle = 'charges' | 'revenus' | 'tout'

export default function Charges() {
  const [toggle, setToggle] = useState<Toggle>('charges')
  const annualSummary = useMemo(getAnnualSummary, [])

  // Bar chart data
  const barData = YEARS.map(y => {
    const s = annualSummary[y]
    const loyerAnnuel = y >= 2025 ? (y === 2025 ? 13900 : 16680) : 0
    return {
      year: String(y),
      Travaux:    s.travaux,
      Assurance:  s.assurance,
      'Charges copro': s.copro,
      Taxes:      s.taxe,
      ...(toggle === 'revenus' || toggle === 'tout' ? { Loyer: loyerAnnuel } : {}),
    }
  })

  // Réel 2025
  const reel2025 = {
    loyer:     TRANSACTIONS.filter(t => t.categorie === 'emprunt' && t.date.startsWith('2025')).reduce((s, t) => s + t.montant, 0) || PREVISIONNEL_2025.loyerEncaisse,
    copro:     annualSummary[2025]?.copro ?? 0,
    assurance: annualSummary[2025]?.assurance ?? 0,
    travaux:   annualSummary[2025]?.travaux ?? 0,
    taxe:      annualSummary[2025]?.taxe ?? 0,
  }
  const totalReel = reel2025.loyer + reel2025.copro + reel2025.assurance + reel2025.travaux + reel2025.taxe
  const totalPrevu = PREVISIONNEL_2025.loyerEncaisse + PREVISIONNEL_2025.chargesCopro + PREVISIONNEL_2025.assurance + PREVISIONNEL_2025.travaux + PREVISIONNEL_2025.taxes

  const comparRows = [
    { label: 'Loyer encaissé',    prevu: PREVISIONNEL_2025.loyerEncaisse, reel: reel2025.loyer },
    { label: 'Charges copro',     prevu: PREVISIONNEL_2025.chargesCopro,  reel: reel2025.copro },
    { label: 'Assurance',         prevu: PREVISIONNEL_2025.assurance,     reel: reel2025.assurance },
    { label: 'Travaux',           prevu: PREVISIONNEL_2025.travaux,       reel: reel2025.travaux },
    { label: 'Taxes',             prevu: PREVISIONNEL_2025.taxes,         reel: reel2025.taxe },
    { label: 'TOTAL',             prevu: totalPrevu,                      reel: totalReel, bold: true },
  ]

  const toggleBtn = (t: Toggle, label: string) => (
    <button
      key={t}
      onClick={() => setToggle(t)}
      style={{
        padding: '6px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: toggle === t ? 600 : 400,
        background: toggle === t ? '#6366f1' : 'transparent',
        color: toggle === t ? '#fff' : '#94a3b8',
        border: toggle === t ? 'none' : '1px solid rgba(255,255,255,0.12)',
      }}
    >{label}</button>
  )

  const thS: React.CSSProperties = { background: '#0f1117', color: '#64748b', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '10px 14px', textAlign: 'left' }
  const tdS = (i: number, bold?: boolean): React.CSSProperties => ({
    padding: '10px 14px', fontSize: 13, color: '#f1f5f9', fontWeight: bold ? 700 : 400,
    background: i % 2 === 0 ? '#1a1f2e' : '#151929', borderBottom: '1px solid rgba(255,255,255,0.04)',
  })

  return (
    <div style={{ padding: '32px 36px' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 700, color: '#f1f5f9' }}>
          Charges réelles vs prévisions
        </h1>
        <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>
          Toutes les dépenses enregistrées depuis mars 2021
        </p>
      </div>

      {/* Section 1 — Vue annuelle */}
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h2 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 600, color: '#f1f5f9' }}>
              Vue d'ensemble annuelle
            </h2>
            <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>Charges par thème et par année</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {toggleBtn('charges', 'Charges')}
            {toggleBtn('revenus', 'Revenus')}
            {toggleBtn('tout', 'Tout')}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData} margin={{ top: 5, right: 20, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="year" tick={{ fill: '#94a3b8', fontSize: 13 }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={v => formatEUR(v)} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} width={90} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Legend wrapperStyle={{ fontSize: 13, color: '#94a3b8', paddingTop: 12 }} />
            {toggle !== 'revenus' && Object.entries(CAT_CONFIG).map(([cat, cfg]) => (
              <Bar key={cat} dataKey={cfg.label} fill={cfg.color} stackId="charges" radius={undefined} />
            ))}
            {(toggle === 'revenus' || toggle === 'tout') && (
              <Bar dataKey="Loyer" fill="#10b981" stackId="loyer" />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Section 2 — Détail par thème */}
      <div style={card}>
        <h2 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 600, color: '#f1f5f9' }}>
          Détail par thème
        </h2>
        <p style={{ margin: '0 0 16px', fontSize: 13, color: '#64748b' }}>Cliquez sur un thème pour voir le détail des transactions</p>
        {(Object.keys(CAT_CONFIG) as Categorie[]).map(cat => (
          <AccordionItem key={cat} cat={cat} />
        ))}
      </div>

      {/* Section 3 — Réel vs Prévisionnel */}
      <div style={{ ...card, marginBottom: 0 }}>
        <h2 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 600, color: '#f1f5f9' }}>
          Réel vs Prévisionnel 2025
        </h2>
        <p style={{ margin: '0 0 16px', fontSize: 13, color: '#64748b' }}>Comparaison avec les hypothèses du modèle</p>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Catégorie', 'Prévu', 'Réel', 'Écart', '% écart'].map(h => (
                <th key={h} style={thS}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comparRows.map((row, i) => {
              const ecart = row.reel - row.prevu
              const pct = row.prevu !== 0 ? (ecart / Math.abs(row.prevu)) * 100 : 0
              const ecartColor = ecart > 0 ? '#10b981' : ecart < 0 ? '#ef4444' : '#64748b'
              return (
                <tr key={row.label}>
                  <td style={{ ...tdS(i, row.bold), color: row.bold ? '#a5b4fc' : '#f1f5f9' }}>{row.label}</td>
                  <td style={tdS(i, row.bold)}>{formatEUR(row.prevu)}</td>
                  <td style={tdS(i, row.bold)}>{formatEUR(row.reel)}</td>
                  <td style={{ ...tdS(i, row.bold), color: ecartColor }}>{ecart > 0 ? '+' : ''}{formatEUR(ecart)}</td>
                  <td style={{ ...tdS(i, row.bold), color: ecartColor }}>{ecart > 0 ? '+' : ''}{pct.toFixed(1)}%</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
