import React from 'react'
import QRCode from 'react-qr-code'
import { Download, Share2 } from 'lucide-react'
import { GhostButton } from '../buttons/GhostButton'

export interface QRCodeGeneratorProps {
  value: string
  size?: number
}

export const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  value,
  size = 200,
}) => {
  return (
    <div className="flex items-center justify-center rounded-[16px] bg-white p-4">
      <QRCode value={value} size={size} level="H" />
    </div>
  )
}

export interface QRCodeCardProps {
  value: string
  title: string
  subtitle?: string
  onDownload?: () => void
  onShare?: () => void
}

export const QRCodeCard: React.FC<QRCodeCardProps> = ({
  value,
  title,
  subtitle,
  onDownload,
  onShare,
}) => {
  return (
    <div className="flex flex-col items-center gap-4 rounded-[20px] bg-white p-6 shadow-sm w-full">
      <div>
        <h2 className="text-center text-base font-bold text-primary">
          {title}
        </h2>
        {subtitle && (
          <p className="text-center text-sm text-gray-500 mt-1">{subtitle}</p>
        )}
      </div>
      <QRCodeGenerator value={value} size={180} />
      {(onDownload || onShare) && (
        <div className="flex gap-3 w-full">
          {onDownload && (
            <GhostButton
              icon={<Download size={16} />}
              onClick={onDownload}
              className="!text-sm"
            >
              Télécharger
            </GhostButton>
          )}
          {onShare && (
            <GhostButton
              icon={<Share2 size={16} />}
              onClick={onShare}
              className="!text-sm"
            >
              Partager
            </GhostButton>
          )}
        </div>
      )}
    </div>
  )
}

export const ReservationQRCode: React.FC<{
  reservationId: string
  date: string
  time: string
}> = ({ reservationId, date, time }) => (
  <QRCodeCard
    value={`reservation:${reservationId}`}
    title="QR Code Réservation"
    subtitle={`${date} — ${time}`}
  />
)

export const RewardQRCode: React.FC<{ rewardId: string }> = ({ rewardId }) => (
  <QRCodeCard
    value={`reward:${rewardId}`}
    title="⭐ Récompense"
    subtitle="Présentez ce QR au coiffeur"
  />
)
