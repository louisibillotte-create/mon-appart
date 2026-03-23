export function formatEUR(value: number): string {
  return value.toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  })
}

export function formatPct(value: number): string {
  return (value * 100).toFixed(1) + ' %'
}
