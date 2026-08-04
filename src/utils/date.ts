import { format, parseISO, isValid } from 'date-fns'

/** Format a Date or ISO string to DD/MM/YYYY */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(d)) return '—'
  return format(d, 'dd/MM/yyyy')
}

/** Format a Date or ISO string to HH:mm (24h) */
export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(d)) return '—'
  return format(d, 'HH:mm')
}

/** Format a Date or ISO string to DD/MM/YYYY HH:mm */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(d)) return '—'
  return format(d, 'dd/MM/yyyy HH:mm')
}
