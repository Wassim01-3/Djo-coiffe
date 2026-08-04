import React from 'react'
import { motion } from 'framer-motion'
import { Clock, Scissors, QrCode } from 'lucide-react'
import type { Reservation } from '@appTypes/reservation'
import type { ReservationStatus } from '@constants/reservation'
import { GhostButton } from '../buttons/GhostButton'

const STATUS_STYLES: Record<
  ReservationStatus,
  { bg: string; text: string; label: string }
> = {
  pending: { bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'En attente' },
  confirmed: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Confirmé' },
  completed: { bg: 'bg-green-50', text: 'text-green-700', label: 'Terminé' },
  cancelled: { bg: 'bg-red-50', text: 'text-red-700', label: 'Annulé' },
  no_show: { bg: 'bg-gray-50', text: 'text-gray-700', label: 'Absent' },
}

export interface ReservationCardProps {
  reservation: Reservation
  serviceName?: string
  barberName?: string
  onShowQR?: () => void
}

export const ReservationCard: React.FC<ReservationCardProps> = ({
  reservation,
  serviceName,
  barberName,
  onShowQR,
}) => {
  const style = STATUS_STYLES[reservation.status]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full rounded-[20px] bg-white p-4 shadow-sm"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-semibold text-primary">
            {serviceName ?? 'Service'}
          </p>
          <p className="text-sm text-gray-500">{barberName ?? 'Coiffeur'}</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${style.bg} ${style.text}`}
        >
          {style.label}
        </span>
      </div>
      <div className="flex items-center gap-4 text-sm text-gray-500">
        <span className="flex items-center gap-1.5">
          <Clock size={14} />
          {reservation.date} — {reservation.timeSlot}
        </span>
        <span className="flex items-center gap-1.5">
          <Scissors size={14} />
          {barberName}
        </span>
      </div>
      {reservation.status === 'confirmed' && onShowQR && (
        <div className="mt-3 border-t border-divider pt-3">
          <GhostButton
            icon={<QrCode size={16} />}
            onClick={onShowQR}
            className="!min-h-[40px] !text-sm !text-accent"
          >
            Voir le QR Code
          </GhostButton>
        </div>
      )}
    </motion.div>
  )
}
