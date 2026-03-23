// Cash flows annuels (période résidente 2021-2024)
export const CASHFLOW_RESIDENT: Record<number, number> = {
  2021: 2327,
  2022: 4430,
  2023: 4724,
  2024: 5021,
}

// Cash flow locatif annuel récurrent (avant gains fiscaux)
export const CASHFLOW_LOCATIF_ANNUEL = -2871

// Gains fiscaux annuels (LMNP)
export const GAINS_FISCAUX: Record<number, number> = {
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
  // 2038+ : ~-1130 stable
}

const GAINS_FISCAUX_DEFAULT = -1130

export function getGainFiscal(year: number): number {
  if (year < 2025) return 0
  return GAINS_FISCAUX[year] ?? GAINS_FISCAUX_DEFAULT
}

// Charges exceptionnelles 2025 (travaux mise en location)
export const CHARGES_EXCEPTIONNELLES_2025 = -4844

// Calcul du cash flow cumulé jusqu'à une date donnée (YYYY-MM)
export function getCashFlowCumule(date: string): number {
  const [year, month] = date.split('-').map(Number)
  let total = 0

  // Période résidente : 2021 à 2024
  for (let y = 2021; y <= Math.min(2024, year); y++) {
    if (y < year) {
      total += CASHFLOW_RESIDENT[y] ?? 0
    } else {
      // Année en cours : pro-rata mois (mars 2021 = début)
      const startMonth = y === 2021 ? 3 : 1
      const fraction = (month - startMonth + 1) / 12
      total += (CASHFLOW_RESIDENT[y] ?? 0) * fraction
    }
  }

  // Période locative : 2025+
  if (year >= 2025) {
    const startYear = 2025
    const startMonth2025 = 3 // mars 2025

    for (let y = startYear; y <= year; y++) {
      const gainFiscal = getGainFiscal(y)
      const chargesExcep = y === 2025 ? CHARGES_EXCEPTIONNELLES_2025 : 0
      const annualTotal = CASHFLOW_LOCATIF_ANNUEL + gainFiscal + chargesExcep

      if (y < year) {
        if (y === 2025) {
          // 2025 : 10 mois (mars→décembre)
          total += annualTotal * (10 / 12)
        } else {
          total += annualTotal
        }
      } else {
        // Année en cours
        const mStart = y === 2025 ? startMonth2025 : 1
        const mois = month - mStart + 1
        const fraction = Math.max(0, mois) / 12
        total += annualTotal * fraction
      }
    }
  }

  return Math.round(total)
}

// Gains fiscaux cumulés jusqu'à une date
export function getGainsFiscauxCumules(date: string): number {
  const [year, month] = date.split('-').map(Number)
  if (year < 2025) return 0

  let total = 0
  for (let y = 2025; y <= year; y++) {
    const gf = getGainFiscal(y)
    if (y < year) {
      if (y === 2025) {
        total += gf * (10 / 12)
      } else {
        total += gf
      }
    } else {
      const mStart = y === 2025 ? 3 : 1
      const fraction = Math.max(0, (month - mStart + 1)) / 12
      total += gf * fraction
    }
  }
  return Math.round(total)
}
