export const NOTIFICATION_TYPES = {
  RESERVATION_CONFIRMED: 'reservation_confirmed',
  RESERVATION_CANCELLED: 'reservation_cancelled',
  RESERVATION_REMINDER: 'reservation_reminder',
  REWARD_EARNED: 'reward_earned',
  SUBSCRIPTION_EXPIRING: 'subscription_expiring',
  ANNOUNCEMENT: 'announcement',
} as const

export type NotificationType =
  (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES]
