export type Categorie = 'travaux' | 'assurance' | 'copro' | 'taxe' | 'emprunt'

export interface Transaction {
  id: string
  date: string // YYYY-MM
  categorie: Categorie
  sous_categorie?: string
  montant: number // négatif = dépense
  description: string
}

export const TRANSACTIONS: Transaction[] = [
  // ─── TRAVAUX 2025 ────────────────────────────────────────────────
  { id: 't1',  date: '2025-01', categorie: 'travaux', sous_categorie: 'Diagnostic', montant: -300,  description: 'DPE' },
  { id: 't2',  date: '2025-01', categorie: 'travaux', sous_categorie: 'Peinture',   montant: -950,  description: 'Enduit + peinture salon' },
  { id: 't3',  date: '2025-01', categorie: 'travaux', sous_categorie: 'Électricité',montant: -187,  description: 'Interphone' },
  { id: 't4',  date: '2025-02', categorie: 'travaux', sous_categorie: 'Peinture',   montant: -900,  description: 'Peinture cuisine' },
  { id: 't5',  date: '2025-02', categorie: 'travaux', sous_categorie: 'Humidité',   montant: -2474, description: 'Traitement humidité salon' },
  { id: 't6',  date: '2025-02', categorie: 'travaux', sous_categorie: 'Plomberie',  montant: -185,  description: 'Chasse d\'eau' },
  { id: 't7',  date: '2025-02', categorie: 'travaux', sous_categorie: 'Plomberie',  montant: -421,  description: 'Toilettes' },
  { id: 't8',  date: '2025-02', categorie: 'travaux', sous_categorie: 'Matériaux',  montant: -19,   description: 'Castorama (1)' },
  { id: 't9',  date: '2025-02', categorie: 'travaux', sous_categorie: 'Matériaux',  montant: -48,   description: 'Castorama (2)' },
  { id: 't10', date: '2025-03', categorie: 'travaux', sous_categorie: 'Peinture',   montant: -330,  description: 'Peinture WC' },
  { id: 't11', date: '2025-03', categorie: 'travaux', sous_categorie: 'Chauffage',  montant: -149,  description: 'Chaudière' },
  { id: 't12', date: '2025-03', categorie: 'travaux', sous_categorie: 'Chauffage',  montant: -40,   description: 'Radiateur' },

  // ─── TAXE FONCIÈRE ──────────────────────────────────────────────
  { id: 'tf2021', date: '2021-10', categorie: 'taxe', montant: -396, description: 'Taxe foncière 2021' },
  { id: 'tf2022', date: '2022-10', categorie: 'taxe', montant: -396, description: 'Taxe foncière 2022' },
  { id: 'tf2023', date: '2023-10', categorie: 'taxe', montant: -396, description: 'Taxe foncière 2023' },
  { id: 'tf2024', date: '2024-10', categorie: 'taxe', montant: -396, description: 'Taxe foncière 2024' },
  { id: 'tf2025', date: '2025-10', categorie: 'taxe', montant: -396, description: 'Taxe foncière 2025' },

  // ─── ASSURANCE EMPRUNTEUR ────────────────────────────────────────
  { id: 'ae2021', date: '2021-04', categorie: 'assurance', sous_categorie: 'Emprunteur', montant: -220, description: 'Assurance emprunteur 2021' },
  { id: 'ae2022', date: '2022-01', categorie: 'assurance', sous_categorie: 'Emprunteur', montant: -220, description: 'Assurance emprunteur 2022' },
  { id: 'ae2023', date: '2023-01', categorie: 'assurance', sous_categorie: 'Emprunteur', montant: -220, description: 'Assurance emprunteur 2023' },
  { id: 'ae2024', date: '2024-01', categorie: 'assurance', sous_categorie: 'Emprunteur', montant: -220, description: 'Assurance emprunteur 2024' },
  { id: 'ae2025', date: '2025-01', categorie: 'assurance', sous_categorie: 'Emprunteur', montant: -220, description: 'Assurance emprunteur 2025' },
  { id: 'ae2026', date: '2026-01', categorie: 'assurance', sous_categorie: 'Emprunteur', montant: -220, description: 'Assurance emprunteur 2026' },

  // ─── ASSURANCE PNO ───────────────────────────────────────────────
  { id: 'pno2025', date: '2025-03', categorie: 'assurance', sous_categorie: 'PNO', montant: -338, description: 'Assurance PNO 2025' },
  { id: 'pno2026', date: '2026-01', categorie: 'assurance', sous_categorie: 'PNO', montant: -338, description: 'Assurance PNO 2026' },

  // ─── CHARGES COPROPRIÉTÉ ─────────────────────────────────────────
  // 2021–2024 : ~1 200€/an (4 trimestres × 300€)
  { id: 'co21q1', date: '2021-04', categorie: 'copro', montant: -300, description: 'Charges copro T1 2021' },
  { id: 'co21q2', date: '2021-07', categorie: 'copro', montant: -300, description: 'Charges copro T2 2021' },
  { id: 'co21q3', date: '2021-10', categorie: 'copro', montant: -300, description: 'Charges copro T3 2021' },
  { id: 'co21q4', date: '2022-01', categorie: 'copro', montant: -300, description: 'Charges copro T4 2021' },
  { id: 'co22q1', date: '2022-04', categorie: 'copro', montant: -300, description: 'Charges copro T1 2022' },
  { id: 'co22q2', date: '2022-07', categorie: 'copro', montant: -300, description: 'Charges copro T2 2022' },
  { id: 'co22q3', date: '2022-10', categorie: 'copro', montant: -300, description: 'Charges copro T3 2022' },
  { id: 'co22q4', date: '2023-01', categorie: 'copro', montant: -300, description: 'Charges copro T4 2022' },
  { id: 'co23q1', date: '2023-04', categorie: 'copro', montant: -300, description: 'Charges copro T1 2023' },
  { id: 'co23q2', date: '2023-07', categorie: 'copro', montant: -300, description: 'Charges copro T2 2023' },
  { id: 'co23q3', date: '2023-10', categorie: 'copro', montant: -300, description: 'Charges copro T3 2023' },
  { id: 'co23q4', date: '2024-01', categorie: 'copro', montant: -300, description: 'Charges copro T4 2023' },
  { id: 'co24q1', date: '2024-04', categorie: 'copro', montant: -300, description: 'Charges copro T1 2024' },
  { id: 'co24q2', date: '2024-07', categorie: 'copro', montant: -300, description: 'Charges copro T2 2024' },
  { id: 'co24q3', date: '2024-10', categorie: 'copro', montant: -300, description: 'Charges copro T3 2024' },
  { id: 'co24q4', date: '2025-01', categorie: 'copro', montant: -300, description: 'Charges copro T4 2024' },
  // 2025+ : ~1 700€/an (4 trimestres × 425€)
  { id: 'co25q1', date: '2025-04', categorie: 'copro', montant: -425, description: 'Charges copro T1 2025' },
  { id: 'co25q2', date: '2025-07', categorie: 'copro', montant: -425, description: 'Charges copro T2 2025' },
  { id: 'co25q3', date: '2025-10', categorie: 'copro', montant: -425, description: 'Charges copro T3 2025' },
  { id: 'co25q4', date: '2026-01', categorie: 'copro', montant: -425, description: 'Charges copro T4 2025' },
]

// Données prévisionnelles 2025 (pour comparaison réel vs prévu)
export const PREVISIONNEL_2025 = {
  loyerEncaisse: 13900,       // 10 mois × 1390€ (mars–déc 2025)
  chargesCopro: -1700,
  assurance: -558,            // emprunteur + PNO
  travaux: -4844,             // charges exceptionnelles
  taxes: -396,
  total: 13900 - 1700 - 558 - 4844 - 396,
}

// Helpers
export function getTransactionsByCategorie(cat: Categorie): Transaction[] {
  return TRANSACTIONS.filter(t => t.categorie === cat)
}

export function getTotalByCategorie(cat: Categorie, year?: number): number {
  return TRANSACTIONS
    .filter(t => t.categorie === cat && (!year || t.date.startsWith(String(year))))
    .reduce((sum, t) => sum + t.montant, 0)
}

export function getTransactionsByYear(year: number): Transaction[] {
  return TRANSACTIONS.filter(t => t.date.startsWith(String(year)))
}

export function getAnnualSummary(): Record<number, Record<Categorie, number>> {
  const result: Record<number, Record<Categorie, number>> = {}
  for (let y = 2021; y <= 2026; y++) {
    result[y] = { travaux: 0, assurance: 0, copro: 0, taxe: 0, emprunt: 0 }
    for (const cat of ['travaux', 'assurance', 'copro', 'taxe', 'emprunt'] as Categorie[]) {
      result[y][cat] = getTotalByCategorie(cat, y)
    }
  }
  return result
}
