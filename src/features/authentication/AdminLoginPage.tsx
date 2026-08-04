import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Lock, Mail, AlertCircle, Loader2, ShieldCheck } from 'lucide-react'
import { useAuthContext } from '@contexts/AuthContext'
import { adminLoginSchema, type AdminLoginFormValues } from '@utils/validators'
import { signInAdmin } from '@services/auth.service'
import { ROUTES } from '@constants/routes'

const AdminLoginPage: React.FC = () => {
  const { isAdmin } = useAuthContext()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)

  // If already admin — redirect immediately
  React.useEffect(() => {
    if (isAdmin) navigate(ROUTES.ADMIN_DASHBOARD, { replace: true })
  }, [isAdmin, navigate])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginSchema),
  })

  const onSubmit = async (data: AdminLoginFormValues) => {
    setServerError(null)
    try {
      await signInAdmin(data.email, data.password)
      navigate(ROUTES.ADMIN_DASHBOARD, { replace: true })
    } catch {
      setServerError('Email ou mot de passe incorrect. Veuillez réessayer.')
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-primary px-6">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent" />

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
            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent shadow-lg"
          >
            <ShieldCheck className="h-8 w-8 text-primary" strokeWidth={1.5} />
          </motion.div>
          <div className="text-center">
            <h1 className="font-heading text-2xl font-bold tracking-tight text-white">
              Administration
            </h1>
            <p className="mt-1 text-sm text-white/60">
              Espace réservé à l'administrateur
            </p>
          </div>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.35 }}
          className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm"
        >
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="space-y-5"
          >
            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="admin-email"
                className="block text-sm font-medium text-white/90"
              >
                Email
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40"
                  strokeWidth={1.5}
                />
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@djocoiffe.tn"
                  {...register('email')}
                  className={`w-full rounded-xl border bg-white/10 py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/30 outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/30 ${
                    errors.email ? 'border-danger/70' : 'border-white/20'
                  }`}
                />
              </div>
              <AnimatePresence mode="wait">
                {errors.email && (
                  <motion.p
                    key="email-err"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-1.5 text-xs text-danger"
                  >
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    {errors.email.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="admin-password"
                className="block text-sm font-medium text-white/90"
              >
                Mot de passe
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40"
                  strokeWidth={1.5}
                />
                <input
                  id="admin-password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  {...register('password')}
                  className={`w-full rounded-xl border bg-white/10 py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/30 outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/30 ${
                    errors.password ? 'border-danger/70' : 'border-white/20'
                  }`}
                />
              </div>
              <AnimatePresence mode="wait">
                {errors.password && (
                  <motion.p
                    key="pass-err"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-1.5 text-xs text-danger"
                  >
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    {errors.password.message}
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
                  className="flex items-start gap-2 rounded-xl bg-danger/20 p-3 text-sm text-danger"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>{serverError}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              id="admin-login-submit"
              type="submit"
              disabled={isSubmitting}
              whileTap={{ scale: 0.98 }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3.5 text-sm font-semibold text-primary shadow-md transition-all hover:bg-accent/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Connexion…</span>
                </>
              ) : (
                'Se connecter'
              )}
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default AdminLoginPage
