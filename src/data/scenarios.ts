import { PARAMS } from './params'

export type ScenarioKey = 'low' | 'medium' | 'best'

interface AnnualRate {
  year: number
  low: number
  medium: number
  best: number
}

const ANNUAL_RATES: AnnualRate[] = [
  { year: 2021, low: -0.03, medium: -0.03, best: -0.03 },
  { year: 2022, low: -0.03, medium: -0.03, best: -0.03 },
  { year: 2023, low: -0.02, medium: -0.02, best: -0.02 },
  { year: 2024, low: -0.10, medium: -0.05, best: -0.01 },
  { year: 2025, low: -0.01, medium: 0.008, best: 0.01 },
  { year: 2026, low: -0.01, medium: 0.008, best: 0.01 },
]

// 2027+ : 0% stagnation pour tous les scénarios

export function getPropertyValue(date: string, scenario: ScenarioKey): number {
  const [year, month] = date.split('-').map(Number)
  let value = PARAMS.prixAchat

  // Appliquer les taux annuels jusqu'à l'année cible
  for (let y = 2021; y <= year; y++) {
    const rateRow = ANNUAL_RATES.find(r => r.year === y)
    const annualRate = rateRow ? rateRow[scenario] : 0

    if (y === year) {
      // Appliquer pro-rata pour l'année en cours
      // Mars 2021 = début, donc pour 2021 on calcule depuis mars
      const startMonth = y === 2021 ? 3 : 1
      const monthsElapsed = month - startMonth
      const fraction = monthsElapsed / 12
      value = value * Math.pow(1 + annualRate, fraction)
    } else if (y === 2021) {
      // 2021 : seulement 9 mois (avril→décembre)
      value = value * Math.pow(1 + annualRate, 9 / 12)
    } else {
      value = value * (1 + annualRate)
    }
  }

  return Math.round(value)
}

// Génère la valeur pour chaque mois de 2021-03 à 2046-03
export interface ScenarioPoint {
  date: string
  low: number
  medium: number
  best: number
}

export function generateScenarioTimeline(): ScenarioPoint[] {
  const points: ScenarioPoint[] = []
  const start = new Date(2021, 2, 1) // mars 2021
  const end = new Date(2046, 2, 1)   // mars 2046

  const current = new Date(start)
  while (current <= end) {
    const dateStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`
    points.push({
      date: dateStr,
      low: getPropertyValue(dateStr, 'low'),
      medium: getPropertyValue(dateStr, 'medium'),
      best: getPropertyValue(dateStr, 'best'),
    })
    current.setMonth(current.getMonth() + 1)
  }

  return points
}
