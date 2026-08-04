import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import { Scissors, Phone, User, AlertCircle, Loader2 } from 'lucide-react'
import { useAuthContext } from '@contexts/AuthContext'
import {
  normalizePhone,
  customerLoginSchema,
  type CustomerLoginFormValues,
} from '@utils/validators'
import { ROUTES } from '@constants/routes'

const CustomerLoginPage: React.FC = () => {
  const { loginCustomer } = useAuthContext()
  const navigate = useNavigate()
  const location = useLocation()
  const [serverError, setServerError] = useState<string | null>(null)

  const from =
    (location.state as { from?: Location } | null)?.from?.pathname ??
    ROUTES.HOME

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CustomerLoginFormValues>({
    resolver: zodResolver(customerLoginSchema),
  })

  const onSubmit = async (data: CustomerLoginFormValues) => {
    setServerError(null)
    try {
      const normalized = normalizePhone(data.phoneNumber)
      await loginCustomer(data.fullName, normalized)
      navigate(from, { replace: true })
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Une erreur est survenue. Veuillez réessayer.'
      setServerError(message)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      {/* Background subtle gradient */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative w-full max-w-sm"
      >
        {/* Logo & Title */}
        <div className="mb-10 flex flex-col items-center gap-3">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.35 }}
            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg"
          >
            <Scissors className="h-8 w-8 text-accent" strokeWidth={1.5} />
          </motion.div>
          <div className="text-center">
            <h1 className="font-heading text-2xl font-bold tracking-tight text-primary">
              Djo Coiffe
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Bienvenue ! Connectez-vous pour continuer.
            </p>
          </div>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.35 }}
          className="rounded-2xl bg-white p-6 shadow-card"
        >
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="space-y-5"
          >
            {/* Full Name */}
            <div className="space-y-1.5">
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-primary"
              >
                Nom complet
              </label>
              <div className="relative">
                <User
                  className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                  strokeWidth={1.5}
                />
                <input
                  id="fullName"
                  type="text"
                  autoComplete="name"
                  placeholder="Ahmed Ben Ali"
                  {...register('fullName')}
                  className={`w-full rounded-xl border bg-background py-3 pl-10 pr-4 text-sm text-primary placeholder:text-gray-400 outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20 ${
                    errors.fullName ? 'border-danger' : 'border-gray-200'
                  }`}
                />
              </div>
              <AnimatePresence mode="wait">
                {errors.fullName && (
                  <motion.p
                    key="fullName-err"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-1.5 text-xs text-danger"
                  >
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    {errors.fullName.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label
                htmlFor="phoneNumber"
                className="block text-sm font-medium text-primary"
              >
                Numéro de téléphone
              </label>
              <div className="relative">
                <Phone
                  className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                  strokeWidth={1.5}
                />
                <input
                  id="phoneNumber"
                  type="tel"
                  autoComplete="tel"
                  inputMode="numeric"
                  placeholder="XX XXX XXX"
                  {...register('phoneNumber')}
                  className={`w-full rounded-xl border bg-background py-3 pl-10 pr-4 text-sm text-primary placeholder:text-gray-400 outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20 ${
                    errors.phoneNumber ? 'border-danger' : 'border-gray-200'
                  }`}
                />
              </div>
              <AnimatePresence mode="wait">
                {errors.phoneNumber && (
                  <motion.p
                    key="phone-err"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-1.5 text-xs text-danger"
                  >
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    {errors.phoneNumber.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Server Error */}
            <AnimatePresence mode="wait">
              {serverError && (
                <motion.div
                  key="server-err"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  className="flex items-start gap-2 rounded-xl bg-danger/10 p-3 text-sm text-danger"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>{serverError}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              id="customer-login-submit"
              type="submit"
              disabled={isSubmitting}
              whileTap={{ scale: 0.98 }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-primary/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Connexion en cours…</span>
                </>
              ) : (
                'Continuer'
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-gray-400">
          Votre compte est créé automatiquement si vous êtes nouveau.
        </p>
      </motion.div>
    </div>
  )
}

export default CustomerLoginPage
