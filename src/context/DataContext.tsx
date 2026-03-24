import { createContext, useContext, useState, useMemo, ReactNode } from 'react'
import { PARAMS } from '../data/params'
import { getCapitalAtDate } from '../data/amortissement'

export type ScenarioKey = 'low' | 'medium' | 'best'

export interface AnnualRate {
  year: number
  low: number
  medium: number
  best: number
}

export const DEFAULT_ANNUAL_RATES: AnnualRate[] = [
  { year: 2021, low: -0.03, medium: -0.03, best: -0.03 },
  { year: 2022, low: -0.03, medium: -0.03, best: -0.03 },
  { year: 2023, low: -0.02, medium: -0.02, best: -0.02 },
  { year: 2024, low: -0.10, medium: -0.05, best: -0.01 },
  { year: 2025, low: -0.01, medium: 0.008, best: 0.01 },
  { year: 2026, low: -0.01, medium: 0.008, best: 0.01 },
]

export const DEFAULT_CASHFLOW_RESIDENT: Record<number, number> = {
  2021: 2327,
  2022: 4430,
  2023: 4724,
  2024: 5021,
}

export const DEFAULT_GAINS_FISCAUX: Record<number, number> = {
  2025: 181,
  2026: -135,
  2027: -180,
  2028: -270,
  2029: -360,
  2030: -450,
  2031: -540,
  2032: -630,
  2033: -720,
  2034: -810,
  2035: -900,
  2036: -990,
  2037: -1080,
}

export const GAINS_FISCAUX_DEFAULT_VALUE = -1130
export const DEFAULT_LOYER = 1390
export const DEFAULT_CHARGES_ANNUELLES = 3000
export const DEFAULT_CHARGES_EXCEPT_2025 = -4844

export type ProvisionsCategorie =
  | 'amenagements_interieurs'
  | 'etancheite'
  | 'gros_oeuvre'
  | 'installation_electrique'
  | 'toiture'
  | 'inventaire_mobilier'

export const PROVISIONS_CATEGORIES: Record<ProvisionsCategorie, string> = {
  amenagements_interieurs: 'Aménagements intérieurs',
  etancheite: 'Etanchéité',
  gros_oeuvre: 'Gros oeuvre',
  installation_electrique: 'Installation électrique',
  toiture: 'Toiture',
  inventaire_mobilier: 'Inventaire mobilier',
}

export const PROVISIONS_YEARS = Array.from({ length: 22 }, (_, i) => 2025 + i) // 2025–2046

function buildDefaultProvisions(): Record<ProvisionsCategorie, Record<number, number>> {
  const cats = Object.keys(PROVISIONS_CATEGORIES) as ProvisionsCategorie[]
  const result = {} as Record<ProvisionsCategorie, Record<number, number>>
  for (const cat of cats) {
    result[cat] = {}
    for (const y of PROVISIONS_YEARS) result[cat][y] = 0
  }
  return result
}

export const DEFAULT_PROVISIONS = buildDefaultProvisions()

export interface EnrichissementDetail {
  capitalRembourse: number
  variationValeur: number
  cashFlowCumule: number
  fraisInitiaux: number
  total: number
  valeurBien: number
  capitalRestantDu: number
}

export interface TimelinePoint {
  year: number
  date: string
  low: number
  medium: number
  best: number
}

export interface ScenarioPoint {
  date: string
  low: number
  medium: number
  best: number
}

interface DataState {
  annualRates: AnnualRate[]
  cashflowResident: Record<number, number>
  loyer: number
  chargesAnnuelles: number
  chargesExcept2025: number
  gainsFiscaux: Record<number, number>
  provisions: Record<ProvisionsCategorie, Record<number, number>>
}

function calcPropertyValue(date: string, scenario: ScenarioKey, rates: AnnualRate[]): number {
  const [year, month] = date.split('-').map(Number)
  let value = PARAMS.prixAchat

  for (let y = 2021; y <= year; y++) {
    const rateRow = rates.find(r => r.year === y)
    const annualRate = rateRow ? rateRow[scenario] : 0

    if (y === year) {
      const startMonth = y === 2021 ? 3 : 1
      const monthsElapsed = month - startMonth
      const fraction = monthsElapsed / 12
      value = value * Math.pow(1 + annualRate, fraction)
    } else if (y === 2021) {
      value = value * Math.pow(1 + annualRate, 9 / 12)
    } else {
      value = value * (1 + annualRate)
    }
  }
  return Math.round(value)
}

function calcCashFlowCumule(date: string, state: DataState): number {
  const [year, month] = date.split('-').map(Number)
  let total = 0

  for (let y = 2021; y <= Math.min(2024, year); y++) {
    if (y < year) {
      total += state.cashflowResident[y] ?? 0
    } else {
      const startMonth = y === 2021 ? 3 : 1
      const fraction = (month - startMonth + 1) / 12
      total += (state.cashflowResident[y] ?? 0) * fraction
    }
  }

  if (year >= 2025) {
    const cfLocatif = (state.loyer * 12) - (PARAMS.mensualite * 12) - state.chargesAnnuelles

    for (let y = 2025; y <= year; y++) {
      const gainFiscal = state.gainsFiscaux[y] ?? GAINS_FISCAUX_DEFAULT_VALUE
      const chargesExcep = y === 2025 ? state.chargesExcept2025 : 0
      const annualTotal = cfLocatif + gainFiscal + chargesExcep

      if (y < year) {
        total += y === 2025 ? annualTotal * (10 / 12) : annualTotal
      } else {
        const mStart = y === 2025 ? 3 : 1
        const fraction = Math.max(0, month - mStart + 1) / 12
        total += annualTotal * fraction
      }
    }
  }

  return Math.round(total)
}

function calcEnrichissementFn(date: string, scenario: ScenarioKey, state: DataState): EnrichissementDetail {
  const { rembourse, restantDu } = getCapitalAtDate(date)
  const valeurBien = calcPropertyValue(date, scenario, state.annualRates)
  const variationValeur = valeurBien - PARAMS.prixAchat
  const cashFlowCumule = calcCashFlowCumule(date, state)
  const fraisInitiaux = -(PARAMS.apportInitial + PARAMS.fraisNotaire)
  const total = rembourse + variationValeur + cashFlowCumule + fraisInitiaux

  return {
    capitalRembourse: Math.round(rembourse),
    variationValeur: Math.round(variationValeur),
    cashFlowCumule: Math.round(cashFlowCumule),
    fraisInitiaux: Math.round(fraisInitiaux),
    total: Math.round(total),
    valeurBien,
    capitalRestantDu: Math.round(restantDu),
  }
}

interface DataContextType {
  annualRates: AnnualRate[]
  cashflowResident: Record<number, number>
  loyer: number
  chargesAnnuelles: number
  chargesExcept2025: number
  gainsFiscaux: Record<number, number>
  provisions: Record<ProvisionsCategorie, Record<number, number>>

  setAnnualRates: (rates: AnnualRate[]) => void
  setCashflowResident: (cf: Record<number, number>) => void
  setLoyer: (v: number) => void
  setChargesAnnuelles: (v: number) => void
  setChargesExcept2025: (v: number) => void
  setGainsFiscaux: (gf: Record<number, number>) => void
  setProvisions: (p: Record<ProvisionsCategorie, Record<number, number>>) => void

  getPropertyValue: (date: string, scenario: ScenarioKey) => number
  getCashFlowCumule: (date: string) => number
  calcEnrichissement: (date: string, scenario: ScenarioKey) => EnrichissementDetail
  getGainFiscal: (year: number) => number
  getCashflowLocatifAnnuel: () => number
  generateEnrichissementTimeline: () => TimelinePoint[]
  generateScenarioTimeline: () => ScenarioPoint[]
}

const DataContext = createContext<DataContextType | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const [annualRates, setAnnualRates] = useState<AnnualRate[]>(DEFAULT_ANNUAL_RATES)
  const [cashflowResident, setCashflowResident] = useState<Record<number, number>>(DEFAULT_CASHFLOW_RESIDENT)
  const [loyer, setLoyer] = useState(DEFAULT_LOYER)
  const [chargesAnnuelles, setChargesAnnuelles] = useState(DEFAULT_CHARGES_ANNUELLES)
  const [chargesExcept2025, setChargesExcept2025] = useState(DEFAULT_CHARGES_EXCEPT_2025)
  const [gainsFiscaux, setGainsFiscaux] = useState<Record<number, number>>(DEFAULT_GAINS_FISCAUX)
  const [provisions, setProvisions] = useState<Record<ProvisionsCategorie, Record<number, number>>>(DEFAULT_PROVISIONS)

  const state: DataState = useMemo(() => ({
    annualRates, cashflowResident, loyer, chargesAnnuelles, chargesExcept2025, gainsFiscaux, provisions,
  }), [annualRates, cashflowResident, loyer, chargesAnnuelles, chargesExcept2025, gainsFiscaux, provisions])

  const ctx: DataContextType = useMemo(() => ({
    annualRates, cashflowResident, loyer, chargesAnnuelles, chargesExcept2025, gainsFiscaux, provisions,
    setAnnualRates, setCashflowResident, setLoyer, setChargesAnnuelles, setChargesExcept2025, setGainsFiscaux, setProvisions,
    getPropertyValue: (date, scenario) => calcPropertyValue(date, scenario, state.annualRates),
    getCashFlowCumule: (date) => calcCashFlowCumule(date, state),
    calcEnrichissement: (date, scenario) => calcEnrichissementFn(date, scenario, state),
    getGainFiscal: (year) => state.gainsFiscaux[year] ?? GAINS_FISCAUX_DEFAULT_VALUE,
    getCashflowLocatifAnnuel: () => (state.loyer * 12) - (PARAMS.mensualite * 12) - state.chargesAnnuelles,
    generateEnrichissementTimeline: () => {
      const points: TimelinePoint[] = []
      for (let year = 2021; year <= 2046; year++) {
        const month = year === 2021 || year === 2046 ? '03' : '01'
        const date = `${year}-${month}`
        points.push({
          year,
          date,
          low: calcEnrichissementFn(date, 'low', state).total,
          medium: calcEnrichissementFn(date, 'medium', state).total,
          best: calcEnrichissementFn(date, 'best', state).total,
        })
      }
      return points
    },
    generateScenarioTimeline: () => {
      const points: ScenarioPoint[] = []
      const start = new Date(2021, 2, 1)
      const end = new Date(2046, 2, 1)
      const current = new Date(start)
      while (current <= end) {
        const dateStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`
        points.push({
          date: dateStr,
          low: calcPropertyValue(dateStr, 'low', state.annualRates),
          medium: calcPropertyValue(dateStr, 'medium', state.annualRates),
          best: calcPropertyValue(dateStr, 'best', state.annualRates),
        })
        current.setMonth(current.getMonth() + 1)
      }
      return points
    },
  }), [state])

  return <DataContext.Provider value={ctx}>{children}</DataContext.Provider>
}

export function useData(): DataContextType {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
