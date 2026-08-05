import { getToken } from 'firebase/messaging'
import { doc, updateDoc, arrayUnion } from 'firebase/firestore'
import { db, getMessagingInstance } from '@appFirebase/config'

/**
 * Request notification permission and save the FCM token to the user's profile.
 */
export const requestPushPermission = async (userId: string): Promise<boolean> => {
  try {
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
      console.log('FCM Token received:', currentToken)
      
      // Save token to user profile
      const userRef = doc(db, 'users', userId)
      await updateDoc(userRef, {
        deviceTokens: arrayUnion(currentToken),
        notificationEnabled: true
      })
      
      return true
    } else {
      console.warn('No registration token available. Request permission to generate one.')
      return false
    }
  } catch (err) {
    console.error('An error occurred while retrieving token:', err)
    return false
  }
}
