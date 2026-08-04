import React, { useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Gift, Clock, CheckCircle2, Sparkles } from 'lucide-react'
import QRCode from 'react-qr-code'
import { useAuthContext } from '@contexts/AuthContext'
import {
  getActiveLoyaltyReward,
  getLoyaltyHistory,
} from '@services/loyalty.service'
import { getUserById } from '@services/auth.service'
import type { LoyaltyReward } from '@appTypes/models'

const LOYALTY_TARGET = 5

// --------------------------------------------------------------------------
// Skeleton loader for the progress circle card
// --------------------------------------------------------------------------
const ProgressSkeleton: React.FC = () => (
  <div className="px-4 mb-8">
    <div className="rounded-3xl bg-white p-8 shadow-card text-center animate-pulse">
      <div className="mx-auto mb-6 h-40 w-40 rounded-full bg-gray-100" />
      <div className="mx-auto h-5 w-36 rounded-full bg-gray-100 mb-2" />
      <div className="mx-auto h-4 w-48 rounded-full bg-gray-100" />
    </div>
  </div>
)

// --------------------------------------------------------------------------
// Progress star display
// --------------------------------------------------------------------------
const LoyaltyStars: React.FC<{ count: number; target: number }> = ({
  count,
  target,
}) => (
  <div className="flex items-center justify-center gap-2 mt-4">
    {Array.from({ length: target }).map((_, i) => (
      <motion.div
        key={i}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: i * 0.08 }}
      >
        <Star
          className={`h-7 w-7 ${
            i < count ? 'fill-accent text-accent' : 'fill-gray-100 text-gray-200'
          }`}
        />
      </motion.div>
    ))}
  </div>
)

// --------------------------------------------------------------------------
// Main component
// --------------------------------------------------------------------------
const LoyaltyPage: React.FC = () => {
  const { customer } = useAuthContext()

  const [isLoading, setIsLoading] = useState(true)
  const [activeReward, setActiveReward] = useState<LoyaltyReward | null>(null)
  const [history, setHistory] = useState<LoyaltyReward[]>([])
  const [showConfetti, setShowConfetti] = useState(false)

  const [realLoyaltyCounter, setRealLoyaltyCounter] = useState(customer?.loyaltyCounter ?? 0)
  const [realCompletedHaircuts, setRealCompletedHaircuts] = useState(customer?.completedHaircuts ?? 0)

  const completedHaircuts = realLoyaltyCounter
  const totalHaircuts = realCompletedHaircuts
  const progress = Math.min((completedHaircuts / LOYALTY_TARGET) * 100, 100)

  const fetchLoyaltyData = useCallback(async () => {
    if (!customer?.id) return
    setIsLoading(true)
    try {
      const [reward, hist, freshCustomer] = await Promise.all([
        getActiveLoyaltyReward(customer.id),
        getLoyaltyHistory(customer.id),
        getUserById(customer.id),
      ])
      setActiveReward(reward)
      setHistory(hist)

      if (freshCustomer) {
        setRealLoyaltyCounter(freshCustomer.loyaltyCounter)
        setRealCompletedHaircuts(freshCustomer.completedHaircuts)
      }

      if (reward !== null) {
        setShowConfetti(true)
      }
    } catch (err) {
      console.error('Failed to load loyalty data:', err)
    } finally {
      setIsLoading(false)
    }
  }, [customer?.id])

  useEffect(() => {
    fetchLoyaltyData()
  }, [fetchLoyaltyData])

  const statusLabel = (status: LoyaltyReward['status']): string => {
    switch (status) {
      case 'available':
        return 'Disponible'
      case 'redeemed':
        return 'Utilisée'
      case 'expired':
        return 'Expirée'
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background pt-4 pb-28">
      {/* Header */}
      <div className="px-6 mb-6">
        <h1 className="font-heading text-2xl font-bold text-primary">
          Programme Fidélité
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {LOYALTY_TARGET} coupes complètes = 1 coupe gratuite.
        </p>
      </div>

      {/* Confetti burst for reward available */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ delay: 1.5, duration: 0.8 }}
            onAnimationComplete={() => setShowConfetti(false)}
          >
            {Array.from({ length: 18 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute h-3 w-3 rounded-full"
                style={{
                  background: i % 2 === 0 ? '#C59D5F' : '#F8D57E',
                  top: `${Math.random() * 80 + 10}%`,
                  left: `${Math.random() * 90 + 5}%`,
                }}
                initial={{ y: 0, opacity: 1, scale: 1 }}
                animate={{
                  y: [0, -80, 120],
                  opacity: [1, 1, 0],
                  scale: [1, 1.4, 0.5],
                  rotate: Math.random() * 360,
                }}
                transition={{ duration: 1.4, delay: i * 0.06 }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Section */}
      {isLoading ? (
        <ProgressSkeleton />
      ) : (
        <div className="px-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-3xl bg-white p-8 shadow-card text-center"
          >
            {/* SVG Progress Circle */}
            <div className="relative mx-auto mb-6 flex h-40 w-40 items-center justify-center">
              <svg
                className="absolute inset-0 h-full w-full -rotate-90"
                viewBox="0 0 100 100"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  fill="none"
                  stroke="#F3F4F6"
                  strokeWidth="12"
                />
                <motion.circle
                  initial={{ strokeDasharray: '0 300' }}
                  animate={{
                    strokeDasharray: `${(progress / 100) * 276} 300`,
                  }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                  cx="50"
                  cy="50"
                  r="44"
                  fill="none"
                  stroke="#C59D5F"
                  strokeWidth="12"
                  strokeLinecap="round"
                />
              </svg>
              <div className="flex flex-col items-center">
                <span className="font-heading text-4xl font-bold text-primary">
                  {completedHaircuts}
                </span>
                <span className="text-sm font-medium text-gray-400">
                  sur {LOYALTY_TARGET}
                </span>
              </div>
            </div>

            <h2 className="font-heading text-xl font-bold text-primary">
              Coupes complétées
            </h2>

            <LoyaltyStars count={completedHaircuts} target={LOYALTY_TARGET} />

            <p className="mt-3 text-sm text-gray-500">
              {activeReward
                ? 'Félicitations ! Vous avez gagné une coupe gratuite.'
                : completedHaircuts === 0
                  ? 'Commencez à accumuler vos points dès votre prochaine visite !'
                  : `Encore ${LOYALTY_TARGET - completedHaircuts} coupe${LOYALTY_TARGET - completedHaircuts > 1 ? 's' : ''} pour obtenir votre récompense.`}
            </p>

            {totalHaircuts > 0 && (
              <p className="mt-2 text-xs text-gray-400">
                {totalHaircuts} coupe{totalHaircuts > 1 ? 's' : ''} au total
              </p>
            )}
          </motion.div>
        </div>
      )}

      {/* Active Reward Card */}
      <AnimatePresence>
        {!isLoading && activeReward && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="px-4 mb-8"
          >
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#C59D5F] via-[#d4af37] to-[#b5952f] p-6 text-white shadow-2xl">
              {/* Background decorations */}
              <Star className="absolute -left-8 -top-8 h-36 w-36 opacity-10" />
              <Star className="absolute -bottom-8 -right-8 h-36 w-36 opacity-10" />

              <div className="relative z-10 flex flex-col items-center text-center">
                {/* Icon */}
                <motion.div
                  animate={{ rotate: [0, -8, 8, -4, 4, 0] }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md"
                >
                  <Gift className="h-8 w-8 text-white" />
                </motion.div>

                <div className="mb-1 flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  <h3 className="font-heading text-2xl font-bold">
                    Coupe Gratuite !
                  </h3>
                  <Sparkles className="h-5 w-5" />
                </div>

                <p className="text-sm text-white/85 mb-6 leading-relaxed">
                  Présentez ce QR code lors de votre prochain passage en salon.
                  Votre coiffeur le scannera pour valider votre récompense.
                </p>

                {/* QR Code */}
                <div className="rounded-2xl bg-white p-4 shadow-lg">
                  <QRCode
                    value={activeReward.rewardQr}
                    size={160}
                    level="M"
                    fgColor="#111827"
                    bgColor="#FFFFFF"
                  />
                </div>

                <p className="mt-4 text-xs text-white/60 font-mono">
                  {activeReward.id.substring(0, 8).toUpperCase()}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reward History */}
      <div className="px-4">
        <h3 className="mb-4 font-heading text-lg font-bold text-primary px-2">
          Historique des récompenses
        </h3>

        {isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm animate-pulse"
              >
                <div className="h-12 w-12 rounded-full bg-gray-100 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-28 rounded-full bg-gray-100" />
                  <div className="h-3 w-36 rounded-full bg-gray-100" />
                </div>
                <div className="h-6 w-20 rounded-full bg-gray-100" />
              </div>
            ))}
          </div>
        ) : history.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center rounded-2xl bg-white p-10 text-center shadow-sm"
          >
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gray-50">
              <Gift className="h-7 w-7 text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-500">
              Aucune récompense pour l'instant.
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Complétez {LOYALTY_TARGET} coupes pour débloquer la première.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {history.map((reward, i) => (
              <motion.div
                key={reward.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm"
              >
                <div
                  className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${
                    reward.status === 'redeemed'
                      ? 'bg-success/10'
                      : reward.status === 'available'
                        ? 'bg-accent/10'
                        : 'bg-gray-100'
                  }`}
                >
                  {reward.status === 'redeemed' ? (
                    <CheckCircle2 className="h-6 w-6 text-success" />
                  ) : reward.status === 'available' ? (
                    <Gift className="h-6 w-6 text-accent" />
                  ) : (
                    <Clock className="h-6 w-6 text-gray-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-primary">
                    Coupe gratuite
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Générée le{' '}
                    {reward.generatedAt?.toMillis?.()
                      ? new Date(
                          reward.generatedAt.toMillis(),
                        ).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })
                      : '—'}
                  </p>
                  {reward.status === 'redeemed' && reward.redeemedAt && (
                    <p className="text-xs text-success mt-0.5">
                      Utilisée le{' '}
                      {new Date(
                        reward.redeemedAt.toMillis(),
                      ).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                </div>

                <span
                  className={`flex-shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                    reward.status === 'redeemed'
                      ? 'bg-success/10 text-success'
                      : reward.status === 'available'
                        ? 'bg-accent/10 text-accent'
                        : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {statusLabel(reward.status)}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default LoyaltyPage
