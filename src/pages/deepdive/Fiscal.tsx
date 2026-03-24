import { useState, useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine,
} from 'recharts'
import { AMORTISSEMENT } from '../../data/amortissement'
import { useData, ProvisionsCategorie, PROVISIONS_CATEGORIES } from '../../context/DataContext'
import { formatEUR } from '../../utils/format'

const card: React.CSSProperties = {
  background: '#1a1f2e',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: 14,
  padding: '20px',
  marginBottom: 24,
}

const inputStyle: React.CSSProperties = {
  background: '#0f1117',
  border: '1px solid rgba(255,255,255,0.1)',
  color: '#f1f5f9',
  borderRadius: 6,
  padding: '6px 10px',
  fontSize: 13,
  width: 100,
  outline: 'none',
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
}

// Intérêts annuels depuis le tableau d'amortissement
function getInteretsAnnuels(year: number): number {
  return AMORTISSEMENT
    .filter(l => l.date.startsWith(String(year)))
    .reduce((s, l) => s + l.interet, 0)
}

interface LMNPParams {
  valeurAmortissable: number
  dureeAmortBien: number
  valeurMobilier: number
  dureeAmortMobilier: number
  tmi: number
}

interface FiscalRow {
  year: number
  revenusBruts: number
  chargesDeductibles: number
  provisionsComposants: number
  amortBien: number
  amortMobilier: number
  resultat: number
  deficitReporte: number
  assietteFiscale: number
  impot: number
  gainVsMicroFoncier: number
}

function computeFiscalRows(
  params: LMNPParams,
  loyer: number,
  chargesAnnuelles: number,
  provisions: Record<ProvisionsCategorie, Record<number, number>>,
): FiscalRow[] {
  const cats = Object.keys(PROVISIONS_CATEGORIES) as ProvisionsCategorie[]
  const rows: FiscalRow[] = []
  let deficitCumul = 0

  for (let year = 2025; year <= 2046; year++) {
    const mois = year === 2025 ? 10 : 12
    const revenusBruts = Math.round(loyer * mois)

    const interets = getInteretsAnnuels(year)
    const assurance = 558 // emprunteur 220 + PNO 338
    const copro = 1700
    const chargesDeductibles = Math.round(interets + assurance + copro + (chargesAnnuelles - copro))
    const provisionsComposants = cats.reduce((s, c) => s + (provisions[c]?.[year] ?? 0), 0)

    const amortBien = Math.round(params.valeurAmortissable / params.dureeAmortBien)
    const amortMobilier = year <= 2025 + params.dureeAmortMobilier - 1
      ? Math.round(params.valeurMobilier / params.dureeAmortMobilier)
      : 0

    const resultatBrut = revenusBruts - chargesDeductibles - provisionsComposants - amortBien - amortMobilier

    // En LMNP non-pro : déficit reportable sur revenus locatifs futurs uniquement
    let assietteFiscale = 0
    if (resultatBrut + deficitCumul >= 0) {
      assietteFiscale = resultatBrut + deficitCumul
      deficitCumul = 0
    } else {
      deficitCumul = resultatBrut + deficitCumul
    }

    const tauxGlobal = params.tmi + 0.172
    const impot = Math.round(Math.max(0, assietteFiscale) * tauxGlobal)

    // Gain vs micro-foncier (abattement 50%, plafonné 15k€)
    const basesMicro = Math.min(revenusBruts, 15000) * 0.5
    const impotMicro = Math.round(basesMicro * tauxGlobal)
    const gainVsMicroFoncier = impotMicro - impot

    rows.push({
      year,
      revenusBruts,
      chargesDeductibles,
      provisionsComposants,
      amortBien,
      amortMobilier,
      resultat: resultatBrut,
      deficitReporte: Math.abs(Math.min(0, deficitCumul + (resultatBrut < 0 ? -resultatBrut : 0))),
      assietteFiscale,
      impot,
      gainVsMicroFoncier,
    })
  }
  return rows
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#1e2538', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 16px' }}>
      <div style={{ fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, fontSize: 13, marginBottom: 3 }}>
          <span style={{ color: p.stroke }}>{p.name}</span>
          <span style={{ color: '#f1f5f9', fontWeight: 600 }}>{formatEUR(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

const TMI_OPTIONS = [
  { value: 0.11, label: '11%' },
  { value: 0.30, label: '30%' },
  { value: 0.41, label: '41%' },
  { value: 0.45, label: '45%' },
]

export default function Fiscal() {
  const { loyer, chargesAnnuelles, provisions } = useData()

  const [params, setParams] = useState<LMNPParams>({
    valeurAmortissable: 286000,
    dureeAmortBien: 30,
    valeurMobilier: 13050,
    dureeAmortMobilier: 3,
    tmi: 0.11,
  })

  const rows = useMemo(
    () => computeFiscalRows(params, loyer, chargesAnnuelles, provisions),
    [params, loyer, chargesAnnuelles, provisions]
  )

  const chartData = rows.map(r => ({
    year: String(r.year),
    'Résultat fiscal': r.resultat,
    'Impôt dû': r.impot,
  }))

  // Sensitivity table: TMI x duréeAmort
  const tmiOptions = [0.11, 0.30, 0.41]
  const amortOptions = [0.02, 0.03, 0.04] // taux d'amort -> duree = 1/taux

  const sensitivityData = tmiOptions.map(tmi => ({
    tmi,
    cols: amortOptions.map(tauxAmort => {
      const duree = Math.round(1 / tauxAmort)
      const testParams = { ...params, tmi, dureeAmortBien: duree }
      const testRows = computeFiscalRows(testParams, loyer, chargesAnnuelles, provisions)
      return testRows.slice(0, 10).reduce((s, r) => s + r.impot, 0)
    }),
  }))

  const setParam = (k: keyof LMNPParams, v: number) =>
    setParams(prev => ({ ...prev, [k]: v }))

  const rowStyle = (i: number): React.CSSProperties => ({
    background: i % 2 === 0 ? '#1a1f2e' : '#151929',
  })

  const tdS = (i: number, color?: string): React.CSSProperties => ({
    padding: '8px 12px',
    fontSize: 12,
    color: color || '#f1f5f9',
    background: i % 2 === 0 ? '#1a1f2e' : '#151929',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
  })

  return (
    <div style={{ padding: '32px 36px' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 700, color: '#f1f5f9' }}>
          Simulation fiscale LMNP
        </h1>
        <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>
          Régime Loueur Meublé Non Professionnel — amortissement et optimisation fiscale
        </p>
      </div>

      {/* Section 1 — Résumé 2025 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Net imposable total 2025', value: '~48 000 €', sub: 'Salaires + revenus fonciers', color: '#f1f5f9' },
          { label: 'Impôt PAS prélevé', value: '~6 153 €', sub: 'Acompte à la source', color: '#f59e0b' },
          { label: 'Impôt net dû', value: '~1 867 €', sub: 'Après déduction LMNP', color: '#ef4444' },
          { label: 'Remboursement estimé', value: '~4 300 €', sub: 'Gain LMNP sur IR 2025', color: '#10b981' },
        ].map(kpi => (
          <div key={kpi.label} style={{ background: '#1a1f2e', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '18px 20px' }}>
            <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{kpi.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: kpi.color, marginBottom: 4 }}>{kpi.value}</div>
            <div style={{ fontSize: 12, color: '#475569' }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Section 2 — Paramètres LMNP */}
      <div style={card}>
        <h2 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 600, color: '#f1f5f9' }}>
          Paramètres LMNP
        </h2>
        <p style={{ margin: '0 0 16px', fontSize: 13, color: '#64748b' }}>
          Modifiez les paramètres pour recalculer la simulation en temps réel
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[
            { key: 'valeurAmortissable' as const, label: 'Valeur du bien amortissable', unit: '€', hint: 'Valeur à la mise en location' },
            { key: 'dureeAmortBien' as const, label: 'Durée amortissement bien', unit: 'ans' },
            { key: 'valeurMobilier' as const, label: 'Valeur mobilier amortissable', unit: '€' },
            { key: 'dureeAmortMobilier' as const, label: 'Durée amortissement mobilier', unit: 'ans' },
          ].map(f => (
            <div key={f.key}>
              <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>{f.label}</div>
              {f.hint && <div style={{ fontSize: 11, color: '#475569', marginBottom: 4 }}>{f.hint}</div>}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="number"
                  style={inputStyle}
                  value={params[f.key]}
                  onChange={e => setParam(f.key, parseFloat(e.target.value) || params[f.key])}
                />
                <span style={{ fontSize: 12, color: '#64748b' }}>{f.unit}</span>
              </div>
            </div>
          ))}

          <div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 8 }}>Tranche marginale d'imposition</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {TMI_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setParam('tmi', opt.value)}
                  style={{
                    padding: '5px 12px', borderRadius: 6, fontSize: 13, cursor: 'pointer', fontWeight: params.tmi === opt.value ? 700 : 400,
                    background: params.tmi === opt.value ? '#6366f1' : 'transparent',
                    color: params.tmi === opt.value ? '#fff' : '#94a3b8',
                    border: params.tmi === opt.value ? 'none' : '1px solid rgba(255,255,255,0.12)',
                  }}
                >{opt.label}</button>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>Prélèvements sociaux</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#64748b', padding: '6px 10px', background: '#0f1117', borderRadius: 6, display: 'inline-block' }}>
              17,2 % (fixe)
            </div>
          </div>
        </div>
      </div>

      {/* Section 3 — Résultat annuel projeté */}
      <div style={card}>
        <h2 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 600, color: '#f1f5f9' }}>
          Résultat fiscal annuel projeté (2025–2046)
        </h2>
        <p style={{ margin: '0 0 20px', fontSize: 13, color: '#64748b' }}>
          TMI {(params.tmi * 100).toFixed(0)}% + PS 17,2% — amortissement {(100 / params.dureeAmortBien).toFixed(1)}%/an
        </p>

        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="year" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={v => formatEUR(v)} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} width={90} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 13, color: '#94a3b8', paddingTop: 12 }} />
            <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)" />
            <Line type="monotone" dataKey="Résultat fiscal" stroke="#6366f1" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="Impôt dû" stroke="#ef4444" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>

        <div style={{ overflowX: 'auto', marginTop: 20 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
            <thead>
              <tr>
                {['Année', 'Revenus bruts', 'Charges déduc.', 'Prov. composants', 'Amort. bien', 'Amort. mobilier', 'Résultat', 'Impôt dû', 'Gain vs micro'].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.year} style={rowStyle(i)}>
                  <td style={tdS(i, '#94a3b8')}>{r.year}</td>
                  <td style={tdS(i, '#10b981')}>{formatEUR(r.revenusBruts)}</td>
                  <td style={tdS(i, '#ef4444')}>{formatEUR(-r.chargesDeductibles)}</td>
                  <td style={tdS(i, r.provisionsComposants > 0 ? '#f59e0b' : '#475569')}>
                    {r.provisionsComposants > 0 ? formatEUR(-r.provisionsComposants) : '—'}
                  </td>
                  <td style={tdS(i, '#ef4444')}>{formatEUR(-r.amortBien)}</td>
                  <td style={tdS(i, r.amortMobilier > 0 ? '#ef4444' : '#475569')}>{r.amortMobilier > 0 ? formatEUR(-r.amortMobilier) : '—'}</td>
                  <td style={tdS(i, r.resultat >= 0 ? '#10b981' : '#6366f1')}>{formatEUR(r.resultat)}</td>
                  <td style={tdS(i, r.impot > 0 ? '#ef4444' : '#64748b')}>{r.impot > 0 ? formatEUR(r.impot) : '—'}</td>
                  <td style={tdS(i, r.gainVsMicroFoncier >= 0 ? '#10b981' : '#ef4444')}>{formatEUR(r.gainVsMicroFoncier)}</td>
                </tr>
              ))}
              <tr>
                <td style={{ padding: '10px 12px', fontSize: 13, fontWeight: 700, color: '#a5b4fc', background: '#0f1117' }}>Total</td>
                <td style={{ padding: '10px 12px', fontSize: 13, fontWeight: 700, color: '#10b981', background: '#0f1117' }}>
                  {formatEUR(rows.reduce((s, r) => s + r.revenusBruts, 0))}
                </td>
                <td colSpan={4} style={{ background: '#0f1117' }} />
                <td style={{ background: '#0f1117' }} />
                <td style={{ padding: '10px 12px', fontSize: 13, fontWeight: 700, color: '#ef4444', background: '#0f1117' }}>
                  {formatEUR(rows.reduce((s, r) => s + r.impot, 0))}
                </td>
                <td style={{ padding: '10px 12px', fontSize: 13, fontWeight: 700, color: '#10b981', background: '#0f1117' }}>
                  {formatEUR(rows.reduce((s, r) => s + r.gainVsMicroFoncier, 0))}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 4 — Sensibilité */}
      <div style={{ ...card, marginBottom: 0 }}>
        <h2 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 600, color: '#f1f5f9' }}>
          Analyse de sensibilité — Impôt total sur 10 ans
        </h2>
        <p style={{ margin: '0 0 16px', fontSize: 13, color: '#64748b' }}>
          TMI × taux d'amortissement annuel du bien
        </p>
        <table style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ ...thStyle, minWidth: 120 }}>TMI \ Taux amort.</th>
              {amortOptions.map(t => (
                <th key={t} style={{ ...thStyle, minWidth: 140 }}>
                  {(t * 100).toFixed(0)}%/an ({Math.round(1 / t)} ans)
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sensitivityData.map((row, i) => (
              <tr key={row.tmi}>
                <td style={{ ...thStyle, background: i % 2 === 0 ? '#1a1f2e' : '#151929', color: '#a5b4fc', fontWeight: 700 }}>
                  TMI {(row.tmi * 100).toFixed(0)}%
                </td>
                {row.cols.map((val, j) => (
                  <td key={j} style={{ padding: '10px 14px', fontSize: 13, color: val === 0 ? '#10b981' : '#ef4444', fontWeight: 600, background: i % 2 === 0 ? '#1a1f2e' : '#151929', textAlign: 'right' }}>
                    {val === 0 ? '0 €' : formatEUR(val)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
