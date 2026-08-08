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
import { requestPushPermission } from '@services/push.service'

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
      try {
        // Force update the firebase messaging service worker if it exists
        // This ensures the client downloads the latest bug fixes.
        if ('serviceWorker' in navigator) {
          const regs = await navigator.serviceWorker.getRegistrations()
          for (const reg of regs) {
            if (reg.active?.scriptURL.includes('firebase-messaging-sw.js')) {
              await reg.update()
            }
          }
        }
        await requestPushPermission(customer.id)
      } catch (err) {
        // Silently fail — notification failure must never break the app
        console.warn('Push permission error:', err)
      }
    }

    // We don't automatically prompt on iOS/Android Web unless they click a button usually,
    // but the PWA specs allow it. If this is annoying, PushNotificationPrompt.tsx is better.
    requestPermission()
  }, [customer?.id, customer?.notificationEnabled])
}
