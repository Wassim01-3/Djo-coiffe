import React from 'react'
import { motion } from 'framer-motion'
import { GhostButton } from '@components/buttons/GhostButton'
import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  message: string
  actionLabel?: string
  onAction?: () => void
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  message,
  actionLabel,
  onAction,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-12 px-6 text-center"
    >
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-50 ring-8 ring-gray-50/50">
        <Icon className="h-8 w-8 text-gray-400" strokeWidth={1.5} />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-primary">{title}</h3>
      <p className="mb-8 max-w-[280px] text-sm text-gray-500">{message}</p>
      {actionLabel && onAction && (
        <GhostButton onClick={onAction} className="min-w-[160px]">
          {actionLabel}
        </GhostButton>
      )}
    </motion.div>
  )
}

export default EmptyState
