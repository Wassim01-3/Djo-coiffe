import React from 'react'
import { motion } from 'framer-motion'
import { Calendar, Scissors } from 'lucide-react'
import type { Subscription } from '@appTypes/subscription'

export interface SubscriptionCardProps {
  subscription: Subscription
  planName?: string
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  subscription,
  planName,
}) => {
  const progress =
    subscription.sessionsTotal > 0
      ? (subscription.sessionsUsed / subscription.sessionsTotal) * 100
      : 0

  const remaining = subscription.sessionsTotal - subscription.sessionsUsed
  const endDate = new Date(subscription.endDate).toLocaleDateString('fr-FR')

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full rounded-[20px] bg-gradient-to-br from-primary to-gray-800 p-5 shadow-lg text-white"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-medium text-white/60">Abonnement</p>
          <p className="text-lg font-bold">{planName ?? 'Plan Premium'}</p>
        </div>
        <Scissors size={28} className="text-accent" />
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-accent">{remaining}</p>
          <p className="text-xs text-white/60">Séances restantes</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold">{subscription.sessionsTotal}</p>
          <p className="text-xs text-white/60">Total séances</p>
        </div>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-xs text-white/60 mb-1">
          <span>Utilisation</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-white/20">
          <div
            className="h-2 rounded-full bg-accent transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-white/60">
        <Calendar size={12} />
        <span>Expire le {endDate}</span>
      </div>
    </motion.div>
  )
}
