/** Format a price in TND currency */
export function formatCurrency(amount: number): string {
  return `${amount.toFixed(2)} TND`
}
