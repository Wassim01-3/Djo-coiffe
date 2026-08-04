import type { NotificationType } from '@constants/notifications'

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  body: string
  isRead: boolean
  data?: Record<string, string>
  createdAt: Date
}
