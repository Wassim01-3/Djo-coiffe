/**
 * useFcmPermission
 *
 * Following the spec: request push notification permission only after
 * the customer has made a second reservation OR second app visit.
 * We track visit count in localStorage.
 *
 * Since we are on Firebase Spark plan (no Cloud Functions), the token
 * is saved to the user's Firestore document for future use when
 * Cloud Functions become available.
 */
import { useEffect } from 'react'
import { useAuthContext } from '@contexts/AuthContext'
import { saveFcmToken } from '@services/notification.service'

const VISIT_COUNT_KEY = 'djo_visit_count'

export const useFcmPermission = () => {
  const { customer } = useAuthContext()

  useEffect(() => {
    if (!customer?.id) return
    if (customer.notificationEnabled) return // Already registered

    // Increment visit count
    const prev = parseInt(localStorage.getItem(VISIT_COUNT_KEY) ?? '0', 10)
    const count = prev + 1
    localStorage.setItem(VISIT_COUNT_KEY, String(count))

    // Request permission on 2nd visit or later
    if (count < 2) return

    const requestPermission = async () => {
      if (!('Notification' in window)) return
      if (window.Notification.permission === 'granted') return
      if (window.Notification.permission === 'denied') return

      try {
        const permission = await window.Notification.requestPermission()
        if (permission !== 'granted') return

        // If Firebase messaging is available, get token
        // (requires vapid key in env; gracefully skip if missing)
        const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY
        if (!vapidKey) return

        // Dynamic import to keep the bundle lean when not needed
        const { getMessaging, getToken } = await import('firebase/messaging')
        const firebaseApp = await import('@appFirebase/config')
        const messaging = getMessaging(firebaseApp.default)

        const token = await getToken(messaging, { vapidKey })
        if (token) {
          await saveFcmToken(customer.id, token, customer.deviceTokens ?? [])
        }
      } catch (err) {
        // Silently fail — notification failure must never break the app
        console.warn('FCM token registration failed:', err)
      }
    }

    requestPermission()
  }, [customer])
}
