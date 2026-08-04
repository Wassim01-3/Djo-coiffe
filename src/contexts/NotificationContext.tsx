import React, {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useState,
  type ReactNode,
} from 'react'
import type { Notification } from '@appTypes/models'
import {
  subscribeToNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '@services/notification.service'
import { useAuthContext } from './AuthContext'

interface NotificationPreferences {
  reservationReminders: boolean
  waitlistAlerts: boolean
  loyaltyRewards: boolean
  subscriptionAlerts: boolean
  announcements: boolean
}

interface NotificationContextValue {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  preferences: NotificationPreferences
  fetchNotifications: () => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  setPreference: (key: keyof NotificationPreferences, value: boolean) => void
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  reservationReminders: true,
  waitlistAlerts: true,
  loyaltyRewards: true,
  subscriptionAlerts: true,
  announcements: true,
}

const PREFS_KEY = 'djo_notif_prefs'

const loadPreferences = (): NotificationPreferences => {
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    if (raw) return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) }
  } catch {}
  return DEFAULT_PREFERENCES
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined)

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { customer } = useAuthContext()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [preferences, setPreferences] = useState<NotificationPreferences>(loadPreferences)

  /* ─── Real-time subscription ─────────────────────────────────────────────── */
  useEffect(() => {
    if (!customer?.id) {
      setNotifications([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    const unsubscribe = subscribeToNotifications(customer.id, (notifs) => {
      setNotifications(notifs)
      setIsLoading(false)
    })
    return () => unsubscribe()
  }, [customer?.id])

  /* ─── Compat: kept so existing components that call fetchNotifications() don't break ── */
  const fetchNotifications = useCallback(async () => {
    // No-op: real-time listener keeps state updated
  }, [])

  const markAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id)
      // Optimistic update
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    } catch (err) {
      console.error('Failed to mark notification as read:', err)
    }
  }

  const markAllAsRead = async () => {
    if (!customer?.id) return
    try {
      await markAllNotificationsAsRead(customer.id)
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err)
    }
  }

  const setPreference = (key: keyof NotificationPreferences, value: boolean) => {
    setPreferences((prev) => {
      const next = { ...prev, [key]: value }
      localStorage.setItem(PREFS_KEY, JSON.stringify(next))
      return next
    })
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        preferences,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        setPreference,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotificationContext = (): NotificationContextValue => {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotificationContext must be used within NotificationProvider')
  return ctx
}
