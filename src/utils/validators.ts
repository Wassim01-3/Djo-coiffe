import { z } from 'zod'

// ---------------------------------------------------------------------------
// Phone number helpers
// ---------------------------------------------------------------------------

/**
 * Normalize a Tunisian phone number to its bare 8-digit form.
 * Accepts: +216XXXXXXXX | 216XXXXXXXX | XXXXXXXX
 */
export function normalizePhone(raw: string): string {
  const trimmed = raw.trim().replace(/\s+/g, '')
  if (trimmed.startsWith('+216')) return trimmed.slice(4)
  if (trimmed.startsWith('216') && trimmed.length === 11)
    return trimmed.slice(3)
  return trimmed
}

/**
 * Zod schema for Tunisian phone number.
 * Accepts +216XXXXXXXX, 216XXXXXXXX, or bare 8-digit numbers.
 */
export const phoneSchema = z
  .string()
  .transform((val) => normalizePhone(val))
  .pipe(
    z
      .string()
      .length(8, 'Le numéro de téléphone doit contenir exactement 8 chiffres')
      .regex(
        /^[0-9]{8}$/,
        'Le numéro de téléphone ne doit contenir que des chiffres',
      ),
  )

/**
 * Zod schema for customer full name.
 */
export const fullNameSchema = z
  .string()
  .min(3, 'Le nom complet doit contenir au moins 3 caractères')
  .max(60, 'Le nom complet ne peut pas dépasser 60 caractères')
  .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Le nom ne doit contenir que des lettres')

/**
 * Zod schema for the customer login form.
 */
export const customerLoginSchema = z.object({
  fullName: fullNameSchema,
  phoneNumber: phoneSchema,
})

export type CustomerLoginFormValues = z.input<typeof customerLoginSchema>
export type CustomerLoginData = z.output<typeof customerLoginSchema>

/**
 * Zod schema for the admin login form.
 */
export const adminLoginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Mot de passe requis'),
})

export type AdminLoginFormValues = z.infer<typeof adminLoginSchema>
