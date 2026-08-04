import React from 'react'
import { Info, AlertCircle, CheckCircle } from 'lucide-react'

type InformationVariant = 'info' | 'success' | 'warning'

export interface InformationCardProps {
  title: string
  message?: string
  variant?: InformationVariant
}

const VARIANT_STYLES: Record<
  InformationVariant,
  { bg: string; text: string; icon: React.ReactNode }
> = {
  info: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    icon: <Info size={18} className="text-blue-500" />,
  },
  success: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    icon: <CheckCircle size={18} className="text-green-500" />,
  },
  warning: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    icon: <AlertCircle size={18} className="text-yellow-500" />,
  },
}

export const InformationCard: React.FC<InformationCardProps> = ({
  title,
  message,
  variant = 'info',
}) => {
  const style = VARIANT_STYLES[variant]
  return (
    <div className={`flex items-start gap-3 rounded-[16px] p-4 ${style.bg}`}>
      <div className="flex-shrink-0 mt-0.5">{style.icon}</div>
      <div>
        <p className={`text-sm font-semibold ${style.text}`}>{title}</p>
        {message && (
          <p className={`text-xs mt-0.5 ${style.text} opacity-80`}>{message}</p>
        )}
      </div>
    </div>
  )
}
