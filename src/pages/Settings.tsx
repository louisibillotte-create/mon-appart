import { useState } from 'react'
import {
  useData,
  DEFAULT_ANNUAL_RATES,
  DEFAULT_CASHFLOW_RESIDENT,
  DEFAULT_GAINS_FISCAUX,
  DEFAULT_LOYER,
  DEFAULT_CHARGES_ANNUELLES,
  DEFAULT_CHARGES_EXCEPT_2025,
  AnnualRate,
} from '../context/DataContext'
import { PARAMS } from '../data/params'
import { formatEUR } from '../utils/format'

const TODAY = '2026-03'

const inputStyle: React.CSSProperties = {
  background: '#0f1117',
  border: '1px solid rgba(255,255,255,0.1)',
  color: '#f1f5f9',
  borderRadius: 6,
  padding: '5px 8px',
  fontSize: 13,
  width: 80,
  textAlign: 'right',
  outline: 'none',
}

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

const card: React.CSSProperties = {
  background: '#1a1f2e',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: 14,
  padding: '24px',
  marginBottom: 24,
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

const tdStyle = (i: number): React.CSSProperties => ({
  padding: '8px 14px',
  fontSize: 13,
  color: '#f1f5f9',
  background: i % 2 === 0 ? '#1a1f2e' : '#151929',
  borderBottom: '1px solid rgba(255,255,255,0.04)',
})

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 600, color: '#f1f5f9' }}>
      {children}
    </h2>
  )
}

// ─── 1A — Éditeur scénarios ────────────────────────────────────────
function ScenariosEditor() {
  const { annualRates, setAnnualRates, getPropertyValue } = useData()
  const [draft, setDraft] = useState<AnnualRate[]>(annualRates.map(r => ({ ...r })))

  const updateRate = (idx: number, field: 'low' | 'medium' | 'best', raw: string) => {
    const val = parseFloat(raw) / 100
    setDraft(prev => prev.map((r, i) => i === idx ? { ...r, [field]: isNaN(val) ? r[field] : val } : r))
  }

  const apply = () => setAnnualRates(draft.map(r => ({ ...r })))
  const reset = () => {
    const defaults = DEFAULT_ANNUAL_RATES.map(r => ({ ...r }))
    setDraft(defaults)
    setAnnualRates(defaults)
  }

  const valLow = getPropertyValue(TODAY, 'low')
  const valMed = getPropertyValue(TODAY, 'medium')
  const valBest = getPropertyValue(TODAY, 'best')

  return (
    <div style={card}>
      <SectionTitle>1A — Scénarios de valeur</SectionTitle>
      <p style={{ margin: '0 0 16px', fontSize: 13, color: '#64748b' }}>
        Taux d'évolution annuels de la valeur du bien par scénario
      </p>
      <div style={{ overflowX: 'auto', marginBottom: 16 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 400 }}>
          <thead>
            <tr>
              {['Année', 'Pessimiste', 'Central', 'Optimiste'].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {draft.map((row, i) => (
              <tr key={row.year}>
                <td style={tdStyle(i)}>{row.year}</td>
                {(['low', 'medium', 'best'] as const).map(f => (
                  <td key={f} style={{ ...tdStyle(i), padding: '6px 14px' }}>
                    <input
                      type="number"
                      step="0.1"
                      style={inputStyle}
                      defaultValue={(row[f] * 100).toFixed(1)}
                      onBlur={e => updateRate(i, f, e.target.value)}
                    />
                    <span style={{ color: '#64748b', fontSize: 12, marginLeft: 4 }}>%</span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 13 }}>
        <span style={{ color: '#a5b4fc', fontWeight: 600 }}>→ Valeur estimée aujourd'hui (mars 2026) : </span>
        <span style={{ color: '#ef4444', marginRight: 16 }}>Pessimiste {formatEUR(valLow)}</span>
        <span style={{ color: '#6366f1', marginRight: 16 }}>Central {formatEUR(valMed)}</span>
        <span style={{ color: '#10b981' }}>Optimiste {formatEUR(valBest)}</span>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button style={btnApply} onClick={apply}>Appliquer</button>
        <button style={btnReset} onClick={reset}>Réinitialiser</button>
      </div>
    </div>
  )
}

// ─── 1B — Cash flows résidents ─────────────────────────────────────
function CashflowResidentEditor() {
  const { cashflowResident, setCashflowResident } = useData()
  const [draft, setDraft] = useState<Record<number, number>>({ ...cashflowResident })

  const update = (year: number, raw: string) => {
    const val = parseFloat(raw)
    setDraft(prev => ({ ...prev, [year]: isNaN(val) ? prev[year] : val }))
  }

  const apply = () => setCashflowResident({ ...draft })
  const reset = () => {
    setDraft({ ...DEFAULT_CASHFLOW_RESIDENT })
    setCashflowResident({ ...DEFAULT_CASHFLOW_RESIDENT })
  }

  const years = [2021, 2022, 2023, 2024]

  return (
    <div style={card}>
      <SectionTitle>1B — Cash flows période résidente (2021–2024)</SectionTitle>
      <p style={{ margin: '0 0 16px', fontSize: 13, color: '#64748b' }}>
        Loyer fictif annuel net (loyer imputé - charges) pour la période d'occupation personnelle
      </p>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
        <thead>
          <tr>
            {['Année', 'Cash flow annuel'].map(h => (
              <th key={h} style={thStyle}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {years.map((y, i) => (
            <tr key={y}>
              <td style={tdStyle(i)}>{y}</td>
              <td style={{ ...tdStyle(i), padding: '6px 14px' }}>
                <input
                  type="number"
                  style={inputStyle}
                  defaultValue={draft[y]}
                  onBlur={e => update(y, e.target.value)}
                />
                <span style={{ color: '#64748b', fontSize: 12, marginLeft: 4 }}>€</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ display: 'flex', gap: 8 }}>
        <button style={btnApply} onClick={apply}>Appliquer</button>
        <button style={btnReset} onClick={reset}>Réinitialiser</button>
      </div>
    </div>
  )
}

// ─── 1B — Période locative ─────────────────────────────────────────
function CashflowLocatifEditor() {
  const { loyer, chargesAnnuelles, chargesExcept2025, setLoyer, setChargesAnnuelles, setChargesExcept2025 } = useData()
  const [dLoyer, setDLoyer] = useState(loyer)
  const [dCharges, setDCharges] = useState(chargesAnnuelles)
  const [dExcep, setDExcep] = useState(chargesExcept2025)

  const cfAnnuel = dLoyer * 12 - PARAMS.mensualite * 12 - dCharges
  const cfMensuel = cfAnnuel / 12

  const apply = () => {
    setLoyer(dLoyer)
    setChargesAnnuelles(dCharges)
    setChargesExcept2025(dExcep)
  }
  const reset = () => {
    setDLoyer(DEFAULT_LOYER)
    setDCharges(DEFAULT_CHARGES_ANNUELLES)
    setDExcep(DEFAULT_CHARGES_EXCEPT_2025)
    setLoyer(DEFAULT_LOYER)
    setChargesAnnuelles(DEFAULT_CHARGES_ANNUELLES)
    setChargesExcept2025(DEFAULT_CHARGES_EXCEPT_2025)
  }

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  }
  const labelStyle: React.CSSProperties = { fontSize: 13, color: '#94a3b8' }
  const valueBox: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 8 }

  return (
    <div style={card}>
      <SectionTitle>1B — Période locative (2025+)</SectionTitle>
      <p style={{ margin: '0 0 16px', fontSize: 13, color: '#64748b' }}>
        Paramètres financiers de la mise en location
      </p>

      <div style={{ maxWidth: 480 }}>
        <div style={rowStyle}>
          <span style={labelStyle}>Loyer mensuel brut</span>
          <div style={valueBox}>
            <input type="number" style={{ ...inputStyle, width: 90 }} value={dLoyer}
              onChange={e => setDLoyer(parseFloat(e.target.value) || dLoyer)} />
            <span style={{ fontSize: 12, color: '#64748b' }}>€/mois</span>
          </div>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>Mensualité du prêt <span style={{ color: '#475569', fontSize: 11 }}>(info)</span></span>
          <div style={valueBox}>
            <span style={{ fontSize: 13, color: '#64748b' }}>{formatEUR(PARAMS.mensualite)}/mois</span>
          </div>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>Charges annuelles estimées</span>
          <div style={valueBox}>
            <input type="number" style={{ ...inputStyle, width: 90 }} value={dCharges}
              onChange={e => setDCharges(parseFloat(e.target.value) || dCharges)} />
            <span style={{ fontSize: 12, color: '#64748b' }}>€/an</span>
          </div>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>Charges exceptionnelles 2025 (travaux)</span>
          <div style={valueBox}>
            <input type="number" style={{ ...inputStyle, width: 90 }} value={dExcep}
              onChange={e => setDExcep(parseFloat(e.target.value) || dExcep)} />
            <span style={{ fontSize: 12, color: '#64748b' }}>€</span>
          </div>
        </div>
      </div>

      <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 10, padding: '12px 16px', margin: '16px 0', fontSize: 13 }}>
        <span style={{ color: '#a5b4fc', fontWeight: 600 }}>→ Cash flow locatif annuel calculé : </span>
        <span style={{ color: cfAnnuel >= 0 ? '#10b981' : '#ef4444', fontWeight: 700 }}>
          {formatEUR(Math.round(cfAnnuel))}/an
        </span>
        <span style={{ color: '#64748b', marginLeft: 8 }}>
          ({formatEUR(Math.round(cfMensuel))}/mois)
        </span>
        <div style={{ color: '#475569', fontSize: 11, marginTop: 4 }}>
          = {dLoyer}×12 − {PARAMS.mensualite.toFixed(2)}×12 − {dCharges}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button style={btnApply} onClick={apply}>Appliquer</button>
        <button style={btnReset} onClick={reset}>Réinitialiser</button>
      </div>
    </div>
  )
}

// ─── Gains fiscaux LMNP ────────────────────────────────────────────
function GainsFiscauxEditor() {
  const { gainsFiscaux, setGainsFiscaux } = useData()
  const [draft, setDraft] = useState<Record<number, number>>({ ...gainsFiscaux })

  const years = Object.keys(DEFAULT_GAINS_FISCAUX).map(Number).sort()

  const update = (year: number, raw: string) => {
    const val = parseFloat(raw)
    setDraft(prev => ({ ...prev, [year]: isNaN(val) ? prev[year] : val }))
  }

  const apply = () => setGainsFiscaux({ ...draft })
  const reset = () => {
    setDraft({ ...DEFAULT_GAINS_FISCAUX })
    setGainsFiscaux({ ...DEFAULT_GAINS_FISCAUX })
  }

  return (
    <div style={card}>
      <SectionTitle>Gains fiscaux LMNP par année</SectionTitle>
      <p style={{ margin: '0 0 16px', fontSize: 13, color: '#64748b' }}>
        Impact fiscal annuel du régime LMNP (positif = gain, négatif = surcoût)
      </p>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
        <thead>
          <tr>
            {['Année', 'Gain fiscal'].map(h => (
              <th key={h} style={thStyle}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {years.map((y, i) => (
            <tr key={y}>
              <td style={tdStyle(i)}>{y}</td>
              <td style={{ ...tdStyle(i), padding: '6px 14px' }}>
                <input
                  type="number"
                  style={inputStyle}
                  defaultValue={draft[y] ?? 0}
                  onBlur={e => update(y, e.target.value)}
                />
                <span style={{ color: '#64748b', fontSize: 12, marginLeft: 4 }}>€</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ display: 'flex', gap: 8 }}>
        <button style={btnApply} onClick={apply}>Appliquer</button>
        <button style={btnReset} onClick={reset}>Réinitialiser</button>
      </div>
    </div>
  )
}

// ─── Page principale ───────────────────────────────────────────────
export default function Settings() {
  return (
    <div style={{ padding: '32px 36px', flex: 1, maxWidth: 860 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 700, color: '#f1f5f9' }}>
          Paramètres & Données
        </h1>
        <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>
          Modifiez les hypothèses du modèle. Les changements sont appliqués en mémoire et reflétés dans toutes les pages d'analyse.
        </p>
      </div>

      <ScenariosEditor />
      <CashflowResidentEditor />
      <CashflowLocatifEditor />
      <GainsFiscauxEditor />
    </div>
  )
}
