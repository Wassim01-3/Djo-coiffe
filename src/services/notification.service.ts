import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  writeBatch,
  onSnapshot,
  orderBy,
  limit,
  serverTimestamp,
  type FieldValue,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '@appFirebase/config'
import type { Notification, NotificationType } from '@appTypes/models'
import { sendPushToUser, sendPushToAllUsers } from './push.service'

/** Fetch latest 20 notifications for a customer (one-time) */
export const getUserNotifications = async (customerId: string): Promise<Notification[]> => {
  const q = query(
    collection(db, 'notifications'),
    where('customerId', 'in', [customerId, 'ALL']),
    orderBy('createdAt', 'desc'),
    limit(20),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => d.data() as Notification)
}

/** Subscribe to real-time notifications (latest 20) */
export const subscribeToNotifications = (
  customerId: string,
  callback: (notifs: Notification[]) => void,
): Unsubscribe => {
  const q = query(
    collection(db, 'notifications'),
    where('customerId', 'in', [customerId, 'ALL']),
    orderBy('createdAt', 'desc'),
    limit(20),
  )
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => d.data() as Notification))
  })
}

/** Create a new notification */
export const createNotification = async (
  customerId: string,
  title: string,
  message: string,
  type: NotificationType,
  metadata?: Record<string, unknown>,
  actionUrl?: string,
): Promise<void> => {
  const notifId = crypto.randomUUID()

  const notification: Omit<Notification, 'createdAt'> & { createdAt: FieldValue } = {
    id: notifId,
    customerId,
    title,
    message,
    type,
    read: false,
    createdAt: serverTimestamp(),
    ...(actionUrl && { actionUrl }),
    ...(metadata && { metadata }),
  }

  await setDoc(doc(db, 'notifications', notifId), notification)

  // Also send a real push notification (non-blocking, best-effort)
  if (customerId !== 'ALL') {
    sendPushToUser(customerId, title, message, actionUrl).catch((err) =>
      console.warn('Push notification failed (non-fatal):', err),
    )
  }
}

/** Create a general announcement targeting ALL users */
export const createAnnouncement = async (
  title: string,
  message: string,
): Promise<void> => {
  const notifId = crypto.randomUUID()

  const notification: Omit<Notification, 'createdAt'> & { createdAt: FieldValue } = {
    id: notifId,
    customerId: 'ALL',
    title,
    message,
    type: 'General',
    read: false,
    createdAt: serverTimestamp(),
  }

  await setDoc(doc(db, 'notifications', notifId), notification)

  // Send real push notification to all users (non-blocking)
  sendPushToAllUsers(title, message, '/notifications').catch((err) =>
    console.warn('Bulk push notification failed:', err),
  )
}

/** Mark a single notification as read */
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  await updateDoc(doc(db, 'notifications', notificationId), { read: true })
}

/** Mark all unread notifications for a customer as read */
export const markAllNotificationsAsRead = async (customerId: string): Promise<void> => {
  const q = query(
    collection(db, 'notifications'),
    where('customerId', 'in', [customerId, 'ALL']),
    where('read', '==', false),
  )
  const snap = await getDocs(q)
  if (snap.empty) return
  const batch = writeBatch(db)
  snap.docs.forEach((d) => batch.update(d.ref, { read: true }))
  await batch.commit()
}

/** Save an FCM device token for the customer */
export const saveFcmToken = async (
  customerId: string,
  token: string,
  existingTokens: string[],
): Promise<void> => {
  if (existingTokens.includes(token)) return
  await updateDoc(doc(db, 'users', customerId), {
    deviceTokens: [...existingTokens, token],
    notificationEnabled: true,
  })
}
