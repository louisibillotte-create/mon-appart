import { PARAMS } from './params'
import { getCapitalAtDate } from './amortissement'
import { getPropertyValue, ScenarioKey } from './scenarios'
import { getCashFlowCumule } from './cashflow'

export interface EnrichissementDetail {
  capitalRembourse: number
  variationValeur: number
  cashFlowCumule: number
  fraisInitiaux: number
  total: number
  valeurBien: number
  capitalRestantDu: number
}

export function calcEnrichissement(date: string, scenario: ScenarioKey): EnrichissementDetail {
  const { rembourse, restantDu } = getCapitalAtDate(date)
  const valeurBien = getPropertyValue(date, scenario)
  const variationValeur = valeurBien - PARAMS.prixAchat
  const cashFlowCumule = getCashFlowCumule(date)
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

// Cash réel si vente
export function calcVente(prixVente: number, date: string): {
  cashNet: number
  indemnite: number
  fraisTotal: number
} {
  const { restantDu } = getCapitalAtDate(date)

  // Indemnité remboursement anticipé = min(6 mois d'intérêts, 3% du capital restant dû)
  const tauxMensuel = PARAMS.tauxAnnuel / 12
  const sixMoisInterets = restantDu * tauxMensuel * 6
  const troisPourcent = restantDu * 0.03
  const indemnite = Math.min(sixMoisInterets, troisPourcent)

  const fraisTotal = PARAMS.fraisVente + PARAMS.fraisDivers + indemnite
  const cashNet = prixVente - restantDu - fraisTotal

  return {
    cashNet: Math.round(cashNet),
    indemnite: Math.round(indemnite),
    fraisTotal: Math.round(fraisTotal),
  }
}

// Enrichissement si vente
export function calcEnrichissementVente(prixVente: number, date: string): number {
  const { cashNet } = calcVente(prixVente, date)
  const cashFlowCumule = getCashFlowCumule(date)
  const fraisInitiaux = PARAMS.apportInitial + PARAMS.fraisNotaire
  return Math.round(cashNet + cashFlowCumule - fraisInitiaux)
}

// Génère la timeline annuelle pour les graphiques
export interface TimelinePoint {
  year: number
  date: string
  low: number
  medium: number
  best: number
}

export function generateEnrichissementTimeline(): TimelinePoint[] {
  const points: TimelinePoint[] = []
  for (let year = 2021; year <= 2046; year++) {
    const month = year === 2021 ? '03' : year === 2046 ? '03' : '01'
    const date = `${year}-${month}`
    points.push({
      year,
      date,
      low: calcEnrichissement(date, 'low').total,
      medium: calcEnrichissement(date, 'medium').total,
      best: calcEnrichissement(date, 'best').total,
    })
  }
  return points
}
