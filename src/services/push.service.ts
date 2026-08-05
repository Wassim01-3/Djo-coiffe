import { getToken } from 'firebase/messaging'
import { doc, updateDoc, arrayUnion, getDoc, collection, getDocs, query, where } from 'firebase/firestore'
import { db, getMessagingInstance } from '@appFirebase/config'
import { Capacitor } from '@capacitor/core'
import { PushNotifications } from '@capacitor/push-notifications'

const NOTIFY_URL = import.meta.env.VITE_NOTIFY_SERVER_URL
const NOTIFY_API_KEY = import.meta.env.VITE_NOTIFY_API_KEY

/**
 * Request notification permission and save the FCM token to the user's profile.
 */
export const requestPushPermission = async (userId: string): Promise<boolean> => {
  try {
    const isNative = Capacitor.isNativePlatform()
    let currentToken: string | null = null

    if (isNative) {
      // --- CAPACITOR NATIVE PUSH LOGIC (ANDROID/IOS APK) ---
      let permStatus = await PushNotifications.checkPermissions()
      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions()
      }

      if (permStatus.receive !== 'granted') {
        console.log('Permission not granted for native notifications')
        return false
      }

      // Register with Apple / Google to receive token
      await PushNotifications.register()

      // We wait for the registration event to get the token
      currentToken = await new Promise<string>((resolve, reject) => {
        PushNotifications.addListener('registration', (token) => {
          resolve(token.value)
        })
        PushNotifications.addListener('registrationError', (error) => {
          console.error('Registration error: ', error.error)
          reject(error.error)
        })
      })
    } else {
      // --- WEB PWA PUSH LOGIC ---
      if (!('Notification' in window)) {
        console.warn('Notification API not supported on this platform.')
        return false
      }

      const permission = await window.Notification.requestPermission()
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
      currentToken = await getToken(messaging, { vapidKey })
    }

    if (currentToken) {
      console.log('FCM Token received (Native or Web)')
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

/**
 * Send a push notification to all users who have notifications enabled.
 * This is useful for global announcements.
 */
export const sendPushToAllUsers = async (
  title: string,
  body: string,
  actionUrl?: string,
): Promise<void> => {
  if (!NOTIFY_URL || !NOTIFY_API_KEY) {
    console.warn('VITE_NOTIFY_SERVER_URL or VITE_NOTIFY_API_KEY not configured.')
    return
  }

  try {
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('notificationEnabled', '==', true))
    const snap = await getDocs(q)
    
    let allTokens: string[] = []
    
    snap.forEach((docSnap) => {
      const data = docSnap.data()
      if (data.deviceTokens && Array.isArray(data.deviceTokens)) {
        allTokens.push(...data.deviceTokens)
      }
    })

    if (allTokens.length === 0) {
      console.log('No users with device tokens found for announcement.')
      return
    }

    // Call the Render server
    const response = await fetch(`${NOTIFY_URL}/notify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': NOTIFY_API_KEY,
      },
      body: JSON.stringify({ tokens: allTokens, title, body, actionUrl }),
    })

    if (!response.ok) {
      const err = await response.json()
      console.error('Notify server error (bulk):', err)
    } else {
      const result = await response.json()
      console.log('Bulk push sent:', result)
    }
  } catch (err) {
    console.error('Failed to send bulk push notification:', err)
  }
}
