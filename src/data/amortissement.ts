import { PARAMS } from './params'

export interface LigneAmortissement {
  mois: number         // 1 à 300
  date: string         // YYYY-MM
  capitalDebut: number
  interet: number
  capitalRembourse: number
  capitalFin: number
  capitalCumule: number
}

function genererTableau(): LigneAmortissement[] {
  const { montantPret, tauxAnnuel, dureesMois, mensualite } = PARAMS
  const tauxMensuel = tauxAnnuel / 12

  const lignes: LigneAmortissement[] = []
  let capital = montantPret
  let capitalCumule = 0

  // Première échéance : 1er avril 2021
  const dateDebut = new Date(2021, 3, 1) // avril 2021

  for (let mois = 1; mois <= dureesMois; mois++) {
    const d = new Date(dateDebut)
    d.setMonth(d.getMonth() + (mois - 1))
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`

    const interet = capital * tauxMensuel
    let capitalRembourse = mensualite - interet

    // Dernier mois : solder le reste
    if (mois === dureesMois) {
      capitalRembourse = capital
    }

    capitalCumule += capitalRembourse
    const capitalFin = Math.max(0, capital - capitalRembourse)

    lignes.push({
      mois,
      date: dateStr,
      capitalDebut: capital,
      interet,
      capitalRembourse,
      capitalFin,
      capitalCumule,
    })

    capital = capitalFin
  }

  return lignes
}

export const AMORTISSEMENT: LigneAmortissement[] = genererTableau()

// Utilitaire : capital remboursé et restant dû à une date donnée (YYYY-MM)
export function getCapitalAtDate(date: string): { rembourse: number; restantDu: number } {
  const ligne = [...AMORTISSEMENT].reverse().find(l => l.date <= date)
  if (!ligne) return { rembourse: 0, restantDu: PARAMS.montantPret }
  return { rembourse: ligne.capitalCumule, restantDu: ligne.capitalFin }
}
