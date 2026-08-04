import React from 'react'
import { motion } from 'framer-motion'
import { PrimaryButton } from '../buttons/PrimaryButton'
import type { Barber } from '@appTypes/barber'

export interface BarberCardProps {
  barber: Barber
  nextSlot?: string
  onReserve?: () => void
}

export const BarberCard: React.FC<BarberCardProps> = React.memo(({
  barber,
  nextSlot,
  onReserve,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex w-40 flex-col items-center gap-3 rounded-[20px] bg-white p-4 shadow-sm"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-2xl font-bold text-accent overflow-hidden">
        {barber.avatarUrl ? (
          <img
            src={barber.avatarUrl}
            alt={barber.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        ) : (
          barber.name.charAt(0).toUpperCase()
        )}
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-primary">{barber.name}</p>
        {nextSlot && <p className="text-xs text-gray-500 mt-0.5">{nextSlot}</p>}
      </div>
      <PrimaryButton
        className="!min-h-[36px] !text-xs !py-2 !px-3"
        onClick={onReserve}
      >
        Réserver
      </PrimaryButton>
    </motion.div>
  )
})
BarberCard.displayName = 'BarberCard'
