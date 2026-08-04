import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  serverTimestamp,
  deleteDoc,
  type FieldValue,
} from 'firebase/firestore'
import { db } from '@appFirebase/config'
import type {
  Subscription,
  SubscriptionPlan,
  SubscriptionStatus,
  User,
} from '@appTypes/models'
import { createNotification } from './notification.service'

/**
 * Fetch all subscription plans for the admin.
 */
export const getSubscriptionPlans = async (): Promise<SubscriptionPlan[]> => {
  const plansRef = collection(db, 'subscriptionPlans')
  const snapshot = await getDocs(plansRef)
  const plans = snapshot.docs.map((d) => d.data() as SubscriptionPlan)

  return plans.sort((a, b) => a.displayOrder - b.displayOrder)
}

/**
 * Create a new subscription plan (Admin).
 */
export const createSubscriptionPlan = async (
  plan: Omit<SubscriptionPlan, 'id'>,
): Promise<void> => {
  const id = crypto.randomUUID()
  await setDoc(doc(db, 'subscriptionPlans', id), { ...plan, id })
}

/**
 * Update an existing subscription plan (Admin).
 */
export const updateSubscriptionPlan = async (
  id: string,
  updates: Partial<Omit<SubscriptionPlan, 'id'>>,
): Promise<void> => {
  await updateDoc(doc(db, 'subscriptionPlans', id), updates)
}

/**
 * Delete a subscription plan (Admin).
 */
export const deleteSubscriptionPlan = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'subscriptionPlans', id))
}

/**
 * Find a user by exact phone number to assign a subscription.
 */
export const findUserByPhone = async (phone: string): Promise<User | null> => {
  const usersRef = collection(db, 'users')
  const q = query(usersRef, where('phoneNumber', '==', phone))
  const snapshot = await getDocs(q)
  if (snapshot.empty) return null
  return snapshot.docs[0].data() as User
}

/**
 * Assign a subscription to a customer.
 */
export const assignSubscription = async (
  customerId: string,
  plan: SubscriptionPlan,
  adminId: string,
): Promise<void> => {
  // First, deactivate any existing active subscription
  const existingSub = await getActiveSubscription(customerId)
  if (existingSub) {
    await updateDoc(doc(db, 'subscriptions', existingSub.id), {
      status: 'finished' as SubscriptionStatus,
      updatedAt: serverTimestamp(),
    })
  }

  // Create new subscription
  const id = crypto.randomUUID()
  const today = new Date()
  const startDate = today.toISOString().split('T')[0]

  const expDateObj = new Date(today)
  expDateObj.setDate(expDateObj.getDate() + plan.validityDays)
  const expirationDate = expDateObj.toISOString().split('T')[0]

  const sub: Omit<Subscription, 'createdAt' | 'updatedAt'> & {
    createdAt: FieldValue
    updatedAt: FieldValue
  } = {
    id,
    customerId,
    planId: plan.id,
    remainingHaircuts: plan.haircutsIncluded,
    startDate,
    expirationDate,
    status: 'active',
    assignedBy: adminId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }

  await setDoc(doc(db, 'subscriptions', id), sub)

  // Notify customer
  await createNotification(
    customerId,
    'Nouvel abonnement VIP !',
    `Votre pass ${plan.name} est actif. Profitez de ${plan.haircutsIncluded} coupes gratuites.`,
    'Subscription',
    { subscriptionId: id },
    '/subscription',
  )
}

/**
 * Get the active subscription for a customer, if any.
 * Also automatically marks it as expired if the expiration date has passed.
 */
export const getActiveSubscription = async (
  customerId: string,
): Promise<Subscription | null> => {
  const subsRef = collection(db, 'subscriptions')
  const q = query(
    subsRef,
    where('customerId', '==', customerId),
    where('status', '==', 'active'),
  )

  const snapshot = await getDocs(q)
  if (snapshot.empty) return null

  const sub = snapshot.docs[0].data() as Subscription

  // Check expiration (lazy evaluation)
  const todayStr = new Date().toISOString().split('T')[0]
  if (sub.expirationDate < todayStr) {
    await updateDoc(doc(db, 'subscriptions', sub.id), {
      status: 'expired' as SubscriptionStatus,
      updatedAt: serverTimestamp(),
    })
    return null
  }

  // Also catch edge case where remaining is 0 but status was somehow active
  if (sub.remainingHaircuts <= 0) {
    await updateDoc(doc(db, 'subscriptions', sub.id), {
      status: 'finished' as SubscriptionStatus,
      updatedAt: serverTimestamp(),
    })
    return null
  }

  return sub
}

/**
 * Decrements the remaining haircuts on a customer's active subscription.
 * Called automatically when a reservation QR is scanned and validated.
 * Returns true if a subscription was used, false otherwise.
 */
export const decrementSubscription = async (
  customerId: string,
): Promise<boolean> => {
  const activeSub = await getActiveSubscription(customerId)
  if (!activeSub) return false

  const newRemaining = activeSub.remainingHaircuts - 1
  const newStatus: SubscriptionStatus =
    newRemaining <= 0 ? 'finished' : 'active'

  await updateDoc(doc(db, 'subscriptions', activeSub.id), {
    remainingHaircuts: newRemaining,
    status: newStatus,
    updatedAt: serverTimestamp(),
  })

  // Optionally send a notification if it's finished
  if (newStatus === 'finished') {
    await createNotification(
      customerId,
      'Abonnement terminé',
      "Vous avez utilisé toutes les coupes de votre abonnement. N'hésitez pas à le renouveler au salon !",
      'Subscription',
    )
  }

  return true
}
