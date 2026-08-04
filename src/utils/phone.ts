/** Validate Tunisian phone number format (+216 XX XXX XXX) */
export function isValidPhone(phone: string): boolean {
  return /^(\+216)?[0-9]{8}$/.test(phone.replace(/\s/g, ''))
}

/** Normalize phone to +216XXXXXXXX format */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('216')) return `+${digits}`
  return `+216${digits}`
}
