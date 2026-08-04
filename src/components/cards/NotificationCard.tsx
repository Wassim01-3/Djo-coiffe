import React from 'react'
import { motion } from 'framer-motion'
import type { Notification } from '@appTypes/notification'

const TYPE_ICONS: Record<string, string> = {
  reservation_confirmed: '✅',
  reservation_cancelled: '❌',
  reservation_reminder: '🔔',
  reward_earned: '⭐',
  subscription_expiring: '⏳',
  announcement: '📢',
}

export interface NotificationCardProps {
  notification: Notification
  onClick?: () => void
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onClick,
}) => {
  return (
    <motion.div
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={`flex w-full items-start gap-3 rounded-[16px] bg-white p-4 shadow-sm cursor-pointer ${
        !notification.isRead ? 'border-l-4 border-accent' : ''
      }`}
    >
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-xl">
        {TYPE_ICONS[notification.type] ?? '🔔'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={`text-sm font-semibold leading-snug ${notification.isRead ? 'text-gray-700' : 'text-primary'}`}
          >
            {notification.title}
          </p>
          {!notification.isRead && (
            <div className="h-2 w-2 flex-shrink-0 rounded-full bg-accent mt-1.5" />
          )}
        </div>
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
          {notification.body}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {new Date(notification.createdAt).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </motion.div>
  )
}
