import React from 'react'
import { motion } from 'framer-motion'
import { Star, QrCode } from 'lucide-react'
import { GhostButton } from '../buttons/GhostButton'

export interface LoyaltyCardProps {
  points: number
  pointsThreshold: number
  totalVisits: number
  hasReward: boolean
  onShowRewardQR?: () => void
}

export const LoyaltyCard: React.FC<LoyaltyCardProps> = ({
  points,
  pointsThreshold,
  totalVisits,
  hasReward,
  onShowRewardQR,
}) => {
  const progress = Math.min((points / pointsThreshold) * 100, 100)
  const starsEarned = Math.floor(progress / 20) // 5 stars max

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full rounded-[20px] bg-white p-5 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-gray-500">Programme fidélité</p>
          <p className="text-lg font-bold text-primary">{points} pts</p>
        </div>
        <p className="text-sm text-gray-500">{totalVisits} visites</p>
      </div>

      <div className="flex gap-1 mb-3">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            size={20}
            className={
              i < starsEarned
                ? 'text-accent fill-accent'
                : 'text-gray-200 fill-gray-200'
            }
          />
        ))}
        <span className="ml-auto text-sm font-semibold text-primary">
          {starsEarned} / 5
        </span>
      </div>

      <div className="h-2 w-full rounded-full bg-gray-100 mb-4">
        <div
          className="h-2 rounded-full bg-accent transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {hasReward && onShowRewardQR && (
        <div className="rounded-[12px] bg-accent/10 p-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-accent">
              Récompense disponible!
            </p>
            <p className="text-xs text-gray-500">Coupe gratuite</p>
          </div>
          <GhostButton
            icon={<QrCode size={16} />}
            onClick={onShowRewardQR}
            className="!min-h-[36px] !w-auto !text-accent !text-xs"
          >
            QR
          </GhostButton>
        </div>
      )}
    </motion.div>
  )
}
