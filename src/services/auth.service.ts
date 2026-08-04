import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore'
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth'
import { db, auth } from '@appFirebase/config'
import type { User } from '@appTypes/models'
import { generateQrPayload } from '@utils/qr'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const USERS_COLLECTION = 'users'
const SESSION_KEY = 'djo_coiffe_customer'

// ---------------------------------------------------------------------------
// Customer session persistence (localStorage)
// ---------------------------------------------------------------------------

export function saveCustomerSession(user: User): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user))
}

export function loadCustomerSession(): User | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

export function clearCustomerSession(): void {
  localStorage.removeItem(SESSION_KEY)
}

// ---------------------------------------------------------------------------
// Customer Authentication (Firestore-based, no Firebase Auth)
// ---------------------------------------------------------------------------

/**
 * Searches Firestore for a customer by their normalized 8-digit phone number.
 * Returns the matching User document or null.
 */
export async function findCustomerByPhone(phone: string): Promise<User | null> {
  const ref = collection(db, USERS_COLLECTION)
  const q = query(ref, where('phoneNumber', '==', phone))
  const snap = await getDocs(q)
  if (snap.empty) return null
  const docSnap = snap.docs[0]
  return { id: docSnap.id, ...docSnap.data() } as User
}

/**
 * Creates a new customer account in Firestore.
 * Generates a unique customer QR token.
 * Returns the newly created User.
 */
export async function createCustomerAccount(
  fullName: string,
  phoneNumber: string,
): Promise<User> {
  const now = serverTimestamp()
  const customerQr = generateQrPayload()

  const newUser = {
    fullName: fullName.trim(),
    phoneNumber,
    createdAt: now,
    updatedAt: now,
    isBlocked: false,
    completedHaircuts: 0,
    loyaltyCounter: 0,
    rewardAvailable: false,
    activeSubscriptionId: null,
    lastReservation: null,
    lastLogin: now,
    customerQr,
    notificationEnabled: true,
    deviceTokens: [],
    platform: 'web' as const,
  }

  const ref = collection(db, USERS_COLLECTION)
  const docRef = await addDoc(ref, newUser)

  // Return a hydrated User object (timestamps approximated for client)
  const createdUser: User = {
    id: docRef.id,
    fullName: newUser.fullName,
    phoneNumber: newUser.phoneNumber,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createdAt: new Date() as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updatedAt: new Date() as any,
    isBlocked: false,
    completedHaircuts: 0,
    loyaltyCounter: 0,
    rewardAvailable: false,
    notificationEnabled: true,
    deviceTokens: [],
    platform: 'web',
    customerQr,
  }

  return createdUser
}

/**
 * Updates the lastLogin timestamp for a customer.
 */
export async function updateCustomerLastLogin(userId: string): Promise<void> {
  const ref = doc(db, USERS_COLLECTION, userId)
  await updateDoc(ref, {
    lastLogin: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

/**
 * Full customer login/register flow.
 * 1. Normalize phone
 * 2. Check if customer exists in Firestore
 * 3. If yes: update lastLogin and return existing customer
 * 4. If no: create new account and return it
 */
export async function loginOrRegisterCustomer(
  fullName: string,
  phoneNumber: string,
): Promise<User> {
  const existing = await findCustomerByPhone(phoneNumber)

  if (existing) {
    if (existing.isBlocked) {
      throw new Error(
        'Votre compte a été suspendu. Veuillez contacter le salon.',
      )
    }
    await updateCustomerLastLogin(existing.id)
    return existing
  }

  const newUser = await createCustomerAccount(fullName, phoneNumber)
  return newUser
}

// ---------------------------------------------------------------------------
// Admin Authentication (Firebase Auth)
// ---------------------------------------------------------------------------

/**
 * Signs in the administrator with Firebase Authentication.
 * Returns the Firebase user on success.
 */
export async function signInAdmin(
  email: string,
  password: string,
): Promise<FirebaseUser> {
  const credential = await signInWithEmailAndPassword(auth, email, password)
  return credential.user
}

/**
 * Signs out the admin from Firebase Authentication.
 */
export async function signOutAdmin(): Promise<void> {
  await signOut(auth)
}

/**
 * Subscribes to Firebase admin auth state changes.
 * Returns an unsubscribe function.
 */
export function onAdminAuthStateChanged(
  callback: (user: FirebaseUser | null) => void,
): () => void {
  return onAuthStateChanged(auth, callback)
}
