import { getToken } from 'firebase/messaging'
import { doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore'
import { db, getMessagingInstance } from '@appFirebase/config'

const NOTIFY_URL = import.meta.env.VITE_NOTIFY_SERVER_URL
const NOTIFY_API_KEY = import.meta.env.VITE_NOTIFY_API_KEY

/**
 * Request notification permission and save the FCM token to the user's profile.
 */
export const requestPushPermission = async (userId: string): Promise<boolean> => {
  try {
    // Guard: Notification API not available on standard iOS Safari (only in standalone/PWA mode iOS 16.4+)
    if (typeof Notification === 'undefined') {
      console.warn('Notification API not supported on this platform.')
      return false
    }

    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      console.log('Permission not granted for notifications')
      return false
    }

    const messaging = await getMessagingInstance()
    if (!messaging) {
      console.warn('Messaging is not supported on this browser/OS.')
      return false
    }

    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY
    const currentToken = await getToken(messaging, { vapidKey })

    if (currentToken) {
      console.log('FCM Token received')
      const userRef = doc(db, 'users', userId)
      await updateDoc(userRef, {
        deviceTokens: arrayUnion(currentToken),
        notificationEnabled: true,
      })
      return true
    } else {
      console.warn('No registration token available.')
      return false
    }
  } catch (err) {
    console.error('An error occurred while retrieving token:', err)
    return false
  }
}

/**
 * Send a push notification to a specific user via the Render notification server.
 * This is called from the admin frontend whenever a notification is created.
 */
export const sendPushToUser = async (
  userId: string,
  title: string,
  body: string,
  actionUrl?: string,
): Promise<void> => {
  if (!NOTIFY_URL || !NOTIFY_API_KEY) {
    console.warn('VITE_NOTIFY_SERVER_URL or VITE_NOTIFY_API_KEY not configured.')
    return
  }

  try {
    // Fetch the user's device tokens from Firestore
    const userSnap = await getDoc(doc(db, 'users', userId))
    if (!userSnap.exists()) return

    const userData = userSnap.data()
    const tokens: string[] = userData?.deviceTokens ?? []
    const notificationEnabled: boolean = userData?.notificationEnabled ?? false

    if (!notificationEnabled || tokens.length === 0) {
      console.log(`User ${userId} has no tokens or disabled notifications.`)
      return
    }

    // Call the Render server
    const response = await fetch(`${NOTIFY_URL}/notify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': NOTIFY_API_KEY,
      },
      body: JSON.stringify({ tokens, title, body, actionUrl }),
    })

    if (!response.ok) {
      const err = await response.json()
      console.error('Notify server error:', err)
    } else {
      const result = await response.json()
      console.log('Push sent:', result)
    }
  } catch (err) {
    console.error('Failed to send push notification:', err)
  }
}
