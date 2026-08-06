import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  serverTimestamp,
  updateDoc,
  limit,
  type FieldValue,
} from 'firebase/firestore'
import { db } from '@appFirebase/config'
import type { Reservation, ReservationEvent, Service } from '@appTypes/models'
import { triggerWaitlistOffers } from './waitlist.service'
import { incrementLoyaltyCounter } from './loyalty.service'
import { decrementSubscriptionService } from './subscription.service'
import { getAppSettings } from './settings.service'
import { sendPushToAllAdmins } from './push.service'

/**
 * Helper to convert "HH:mm" string to minutes since midnight
 */
export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

/**
 * Helper to convert minutes since midnight to "HH:mm"
 */
export const minutesToTime = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

/**
 * Generates available 30-minute slots for a given date, barber, and service duration.
 */
export const getAvailableSlots = async (
  date: string, // YYYY-MM-DD
  barberId: string,
  serviceDuration: number,
): Promise<string[]> => {
  // Determine day of week
  const dateObj = new Date(date)
  const days = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ] as const
  const dayOfWeek = days[dateObj.getDay()]

  // Get live opening hours from Firestore
  const appSettings = await getAppSettings()
  const hours = appSettings.openingHours[dayOfWeek]
  if (hours.closed) {
    return [] // Shop is closed
  }


  // 1. Generate all possible 30-min slots from open to close
  const openMins = timeToMinutes(hours.open)
  const closeMins = timeToMinutes(hours.close)
  const allSlots: number[] = []

  const now = new Date()
  // Generate today's date in local timezone to match the 'YYYY-MM-DD' passed in
  const today = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
  const todayStr = today.toISOString().split('T')[0]
  const isToday = date === todayStr
  const currentMins = now.getHours() * 60 + now.getMinutes()

  for (let t = openMins; t < closeMins; t += 30) {
    // Skip slots that are already in the past for today
    if (isToday && t <= currentMins) {
      continue
    }
    allSlots.push(t)
  }

  // 2. Fetch existing reservations for this barber on this date
  const reservationsRef = collection(db, 'reservations')
  const q = query(
    reservationsRef,
    where('date', '==', date),
    where('barberId', '==', barberId),
    where('status', 'in', ['pending', 'confirmed']),
  )

  let existingReservations: { start: number; end: number }[] = []
  try {
    const querySnapshot = await getDocs(q)
    existingReservations = querySnapshot.docs.map((doc) => {
      const data = doc.data() as Reservation
      return {
        start: timeToMinutes(data.startTime),
        end: timeToMinutes(data.endTime),
      }
    })
  } catch (error) {
    console.warn(
      'Failed to fetch from Firestore, defaulting to mock empty',
      error,
    )
  }

  // 3. Filter slots
  const availableSlots = allSlots.filter((slotTime) => {
    const slotEndTime = slotTime + serviceDuration

    // Check if service finishes after closing time
    if (slotEndTime > closeMins) {
      return false
    }

    // Check for overlap with existing reservations
    const overlaps = existingReservations.some(
      (res) => slotTime < res.end && slotEndTime > res.start,
    )

    return !overlaps
  })

  // Convert back to HH:mm format
  return availableSlots.map(minutesToTime)
}

/**
 * Validates no double booking for the user across ALL barbers at the chosen time.
 */
export const checkUserOverlap = async (
  customerId: string,
  date: string,
  startTime: string,
  endTime: string,
): Promise<boolean> => {
  const reservationsRef = collection(db, 'reservations')
  const q = query(
    reservationsRef,
    where('date', '==', date),
    where('customerId', '==', customerId),
    where('status', 'in', ['pending', 'confirmed']),
  )

  try {
    const querySnapshot = await getDocs(q)
    const existing = querySnapshot.docs.map((doc) => doc.data() as Reservation)

    const newStart = timeToMinutes(startTime)
    const newEnd = timeToMinutes(endTime)

    const overlaps = existing.some((res) => {
      const resStart = timeToMinutes(res.startTime)
      const resEnd = timeToMinutes(res.endTime)
      return newStart < resEnd && newEnd > resStart
    })

    return overlaps
  } catch (error) {
    console.error('Error checking user overlap:', error)
    return false // Assume no overlap if fetch fails for some reason
  }
}

/**
 * Creates a new reservation and generates a secure QR Token.
 */
export const createReservation = async (
  customerId: string,
  barberId: string,
  serviceId: string,
  date: string,
  startTime: string,
): Promise<Reservation> => {
  // Get service details
  const { getDoc } = await import('firebase/firestore')
  const serviceSnap = await getDoc(doc(db, 'services', serviceId))
  const service = serviceSnap.exists() ? (serviceSnap.data() as Service) : null
  if (!service) throw new Error('Service not found')

  // Calculate end time
  const startMins = timeToMinutes(startTime)
  const endMins = startMins + service.durationMinutes
  const endTime = minutesToTime(endMins)

  // Double check overlaps
  const hasOverlap = await checkUserOverlap(
    customerId,
    date,
    startTime,
    endTime,
  )
  if (hasOverlap) {
    throw new Error('Vous avez déjà une réservation à cette heure.')
  }

  // Double check slot availability again
  const availableSlots = await getAvailableSlots(
    date,
    barberId,
    service.durationMinutes,
  )
  if (!availableSlots.includes(startTime)) {
    throw new Error("Ce créneau n'est plus disponible.")
  }

  const reservationId = crypto.randomUUID()
  const qrToken = crypto.randomUUID() // Secure v4 UUID as requested

  const reservation: Omit<Reservation, 'createdAt' | 'updatedAt'> & {
    createdAt: FieldValue
    updatedAt: FieldValue
  } = {
    id: reservationId,
    customerId,
    barberId,
    serviceId,
    date,
    startTime,
    endTime,
    duration: service.durationMinutes,
    status: 'pending',
    qrToken,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }

  // Save Reservation
  const reservationRef = doc(db, 'reservations', reservationId)
  await setDoc(reservationRef, reservation)

  // Save Event Log
  const eventId = crypto.randomUUID()
  const event: Omit<ReservationEvent, 'timestamp'> & { timestamp: FieldValue } =
    {
      id: eventId,
      reservationId,
      customerId,
      performedBy: customerId,
      type: 'CREATED',
      timestamp: serverTimestamp(),
    }
  await setDoc(doc(db, 'reservationEvents', eventId), event)

  // Notify all admins immediately (fire-and-forget, non-fatal)
  const dateFormatted = new Date(`${date}T${startTime}`).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
  sendPushToAllAdmins(
    'Nouvelle réservation 📅',
    `Réservation le ${dateFormatted} à ${startTime}`,
    `/admin/reservations?date=${date}`,
  ).catch(console.error)

  return reservation as unknown as Reservation
}

/**
 * Fetch a customer's reservations
 */
export const getCustomerReservations = async (
  customerId: string,
): Promise<Reservation[]> => {
  const reservationsRef = collection(db, 'reservations')
  const q = query(reservationsRef, where('customerId', '==', customerId), limit(50))

  const querySnapshot = await getDocs(q)
  const results = querySnapshot.docs.map((doc) => doc.data() as Reservation)

  // Sort by date/time (in memory for simplicity)
  return results.sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.startTime}`)
    const dateB = new Date(`${b.date}T${b.startTime}`)
    return dateB.getTime() - dateA.getTime() // Descending
  })
}

/**
 * Cancel a reservation
 */
export const cancelReservation = async (
  reservationId: string,
  customerId: string,
): Promise<void> => {
  const { getDoc } = await import('firebase/firestore')
  const ref = doc(db, 'reservations', reservationId)

  await updateDoc(ref, {
    status: 'cancelled',
    updatedAt: serverTimestamp(),
  })

  // Save Event Log
  const eventId = crypto.randomUUID()
  const event: Omit<ReservationEvent, 'timestamp'> & { timestamp: FieldValue } =
    {
      id: eventId,
      reservationId,
      customerId,
      performedBy: customerId,
      type: 'CANCELLED',
      timestamp: serverTimestamp(),
    }
  await setDoc(doc(db, 'reservationEvents', eventId), event)

  // Trigger waitlist check since a slot freed up
  const reservationDoc = await getDoc(ref)
  if (reservationDoc.exists()) {
    const data = reservationDoc.data() as Reservation
    // We fire and forget this trigger
    triggerWaitlistOffers(data.date).catch(console.error)
  }
}

/**
 * Fetch a reservation by its QR token without modifying it.
 * Used by the admin scanner to preview reservation details before confirming.
 */
export const fetchReservationByToken = async (
  qrToken: string,
): Promise<Reservation> => {
  const reservationsRef = collection(db, 'reservations')
  const q = query(reservationsRef, where('qrToken', '==', qrToken))
  const querySnapshot = await getDocs(q)

  if (querySnapshot.empty) {
    throw new Error('QR Code invalide ou introuvable.')
  }

  const reservation = querySnapshot.docs[0].data() as Reservation

  if (reservation.status === 'completed') {
    throw new Error('Ce QR Code a déjà été scanné (réservation terminée).')
  }
  if (reservation.status === 'cancelled') {
    throw new Error('Cette réservation a été annulée.')
  }
  if (reservation.status === 'expired') {
    throw new Error('Cette réservation a expiré.')
  }

  return reservation
}

/**
 * Validate QR Token and Complete Reservation
 */
export const validateAndCompleteReservation = async (
  qrToken: string,
  adminId: string,
): Promise<{ reservation: Reservation; isRewardGenerated: boolean; isSubscriptionUsed: boolean }> => {
  const reservationsRef = collection(db, 'reservations')
  const q = query(reservationsRef, where('qrToken', '==', qrToken))
  
  const querySnapshot = await getDocs(q)
  if (querySnapshot.empty) {
    throw new Error('QR Code invalide ou introuvable.')
  }

  const reservationDoc = querySnapshot.docs[0]
  const reservation = reservationDoc.data() as Reservation

  if (reservation.status === 'completed') {
    throw new Error('Ce QR Code a déjà été scanné (réservation terminée).')
  }
  
  if (reservation.status === 'cancelled') {
    throw new Error('Cette réservation a été annulée.')
  }
  
  if (reservation.status === 'expired') {
    throw new Error('Cette réservation a expiré.')
  }

  // Update status to completed
  await updateDoc(reservationDoc.ref, {
    status: 'completed',
    updatedAt: serverTimestamp(),
  })

  // Log QR Scanned
  const scanEventId = crypto.randomUUID()
  const scanEvent: Omit<ReservationEvent, 'timestamp'> & { timestamp: FieldValue } = {
    id: scanEventId,
    reservationId: reservation.id,
    customerId: reservation.customerId,
    performedBy: adminId,
    type: 'QR_SCANNED',
    timestamp: serverTimestamp(),
  }
  await setDoc(doc(db, 'reservationEvents', scanEventId), scanEvent)

  // Log Completed
  const completeEventId = crypto.randomUUID()
  const completeEvent: Omit<ReservationEvent, 'timestamp'> & { timestamp: FieldValue } = {
    id: completeEventId,
    reservationId: reservation.id,
    customerId: reservation.customerId,
    performedBy: adminId,
    type: 'COMPLETED',
    timestamp: serverTimestamp(),
  }
  await setDoc(doc(db, 'reservationEvents', completeEventId), completeEvent)

  // Update loyalty counter for the customer
  let isRewardGenerated = false
  try {
    const loyaltyResult = await incrementLoyaltyCounter(
      reservation.customerId,
      reservation.id,
    )
    isRewardGenerated = loyaltyResult.isRewardGenerated
  } catch (err) {
    // Non-fatal: loyalty error should not fail the scan
    console.error('Loyalty update failed:', err)
  }

  // Log LOYALTY_UPDATED event if counter was updated
  const loyaltyEventId = crypto.randomUUID()
  const loyaltyEvent: Omit<ReservationEvent, 'timestamp'> & { timestamp: FieldValue } = {
    id: loyaltyEventId,
    reservationId: reservation.id,
    customerId: reservation.customerId,
    performedBy: adminId,
    type: 'LOYALTY_UPDATED',
    timestamp: serverTimestamp(),
    details: { isRewardGenerated },
  }
  await setDoc(doc(db, 'reservationEvents', loyaltyEventId), loyaltyEvent)

  // Decrement subscription if customer has an active one
  let isSubscriptionUsed = false
  try {
    isSubscriptionUsed = await decrementSubscriptionService(reservation.customerId, reservation.serviceId)
    if (isSubscriptionUsed) {
      const subEventId = crypto.randomUUID()
      const subEvent: Omit<ReservationEvent, 'timestamp'> & { timestamp: FieldValue } = {
        id: subEventId,
        reservationId: reservation.id,
        customerId: reservation.customerId,
        performedBy: adminId,
        type: 'SUBSCRIPTION_USED',
        timestamp: serverTimestamp(),
      }
      await setDoc(doc(db, 'reservationEvents', subEventId), subEvent)
    }
  } catch (err) {
    console.error('Subscription update failed:', err)
  }

  return {
    reservation: { ...reservation, status: 'completed' } as unknown as Reservation,
    isRewardGenerated,
    isSubscriptionUsed,
  }
}
