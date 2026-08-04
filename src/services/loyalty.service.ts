import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  serverTimestamp,
  type FieldValue,
} from 'firebase/firestore'
import { db } from '@appFirebase/config'
import type { LoyaltyReward, LoyaltyRewardStatus, User } from '@appTypes/models'
import { createNotification } from './notification.service'

const LOYALTY_TARGET = 5

/**
 * Increment the loyalty counter for a customer after a completed eligible haircut.
 * When the counter reaches LOYALTY_TARGET (5), a reward is generated and counter resets.
 */
export const incrementLoyaltyCounter = async (
  customerId: string,
  reservationId: string,
): Promise<{ isRewardGenerated: boolean; rewardId?: string }> => {
  // Fetch current user data
  const { getDoc } = await import('firebase/firestore')
  const userRef = doc(db, 'users', customerId)
  const userSnap = await getDoc(userRef)

  if (!userSnap.exists()) {
    return { isRewardGenerated: false }
  }

  const user = userSnap.data() as User
  const newCompletedHaircuts = (user.completedHaircuts || 0) + 1
  const newLoyaltyCounter = (user.loyaltyCounter || 0) + 1

  const shouldGenerateReward = newLoyaltyCounter >= LOYALTY_TARGET

  if (shouldGenerateReward) {
    // Reset counter and flag reward
    await updateDoc(userRef, {
      completedHaircuts: newCompletedHaircuts,
      loyaltyCounter: 0,
      rewardAvailable: true,
      updatedAt: serverTimestamp(),
    })

    // Generate reward QR token — prefixed so admin scanner can identify loyalty QRs
    const rewardToken = `REWARD:${crypto.randomUUID()}`
    const rewardId = crypto.randomUUID()

    const reward: Omit<LoyaltyReward, 'generatedAt'> & { generatedAt: FieldValue } = {
      id: rewardId,
      customerId,
      rewardQr: rewardToken,
      status: 'available',
      generatedAt: serverTimestamp(),
      reservationId,
    }

    await setDoc(doc(db, 'loyaltyRewards', rewardId), reward)

    // Notify the customer
    await createNotification(
      customerId,
      '🎉 Récompense débloquée !',
      `Vous avez complété ${LOYALTY_TARGET} coupes. Votre coupe gratuite est prête !`,
      'Loyalty',
      { rewardId },
      '/loyalty',
    )

    return { isRewardGenerated: true, rewardId }
  } else {
    // Just increment the counter
    await updateDoc(userRef, {
      completedHaircuts: newCompletedHaircuts,
      loyaltyCounter: newLoyaltyCounter,
      updatedAt: serverTimestamp(),
    })

    return { isRewardGenerated: false }
  }
}

/**
 * Get the current active (available) loyalty reward for a customer.
 */
export const getActiveLoyaltyReward = async (
  customerId: string,
): Promise<LoyaltyReward | null> => {
  const rewardsRef = collection(db, 'loyaltyRewards')
  const q = query(
    rewardsRef,
    where('customerId', '==', customerId),
    where('status', '==', 'available'),
  )

  const snapshot = await getDocs(q)
  if (snapshot.empty) return null

  return snapshot.docs[0].data() as LoyaltyReward
}

/**
 * Get all loyalty reward records for a customer (history).
 */
export const getLoyaltyHistory = async (
  customerId: string,
): Promise<LoyaltyReward[]> => {
  const rewardsRef = collection(db, 'loyaltyRewards')
  const q = query(rewardsRef, where('customerId', '==', customerId))

  const snapshot = await getDocs(q)
  const rewards = snapshot.docs.map((d) => d.data() as LoyaltyReward)

  // Sort descending by generatedAt in memory
  return rewards.sort((a, b) => {
    const tA = a.generatedAt?.toMillis?.() ?? 0
    const tB = b.generatedAt?.toMillis?.() ?? 0
    return tB - tA
  })
}

/**
 * Validate a loyalty reward QR token (used by admin scanner).
 * Returns the reward if found and valid, throws otherwise.
 */
export const validateLoyaltyRewardByToken = async (
  rewardQr: string,
): Promise<LoyaltyReward> => {
  const rewardsRef = collection(db, 'loyaltyRewards')
  const q = query(rewardsRef, where('rewardQr', '==', rewardQr))

  const snapshot = await getDocs(q)
  if (snapshot.empty) {
    throw new Error('Code QR fidélité invalide ou introuvable.')
  }

  const reward = snapshot.docs[0].data() as LoyaltyReward

  if (reward.status === 'redeemed') {
    throw new Error('Cette récompense a déjà été utilisée.')
  }

  if (reward.status === 'expired') {
    throw new Error('Cette récompense a expiré.')
  }

  return reward
}

/**
 * Redeem a loyalty reward (called after admin scans the reward QR).
 */
export const redeemLoyaltyReward = async (
  rewardId: string,
  customerId: string,
  _adminId: string,
): Promise<void> => {
  const rewardRef = doc(db, 'loyaltyRewards', rewardId)

  await updateDoc(rewardRef, {
    status: 'redeemed' as LoyaltyRewardStatus,
    redeemedAt: serverTimestamp(),
  })

  // Update user flag
  const userRef = doc(db, 'users', customerId)
  await updateDoc(userRef, {
    rewardAvailable: false,
    updatedAt: serverTimestamp(),
  })

  // Notify the customer
  await createNotification(
    customerId,
    'Récompense utilisée',
    'Votre coupe gratuite a été validée. Merci de votre fidélité !',
    'Loyalty',
  )
}
