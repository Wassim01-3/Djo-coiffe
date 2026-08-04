/**
 * Generates a cryptographically secure random token (UUID v4).
 * Used for customer QR codes and reservation QR tokens.
 * Minimum 128 bits of entropy — impossible to guess.
 */
export function generateSecureToken(): string {
  return crypto.randomUUID()
}

/**
 * Generates a short display-safe token for QR payloads.
 * Strips hyphens for a cleaner QR content string.
 */
export function generateQrPayload(): string {
  return crypto.randomUUID().replace(/-/g, '')
}
