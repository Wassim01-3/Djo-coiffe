import type { Timestamp } from 'firebase/firestore'

export type Platform = 'android' | 'ios' | 'web'

export interface User {
  id: string
  fullName: string
  phoneNumber: string
  createdAt: Timestamp
  updatedAt: Timestamp
  isBlocked: boolean
  completedHaircuts: number
  loyaltyCounter: number
  rewardAvailable: boolean
  activeSubscriptionId?: string
  lastReservation?: Timestamp
  lastLogin?: Timestamp
  customerQr?: string
  notificationEnabled: boolean
  deviceTokens: string[]
  platform: Platform
}

export interface Admin {
  id: string
  name: string
  phone: string
  pin: string
  createdAt: Timestamp
}

export interface Barber {
  id: string
  name: string
  phone: string
  seatNumber: number
  enabled: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
  displayOrder: number
}

export interface Service {
  id: string
  name: string
  price: number
  durationMinutes: number
  enabled: boolean
  description: string
  displayOrder: number
  icon: string
}

export type ReservationStatus =
  'pending' | 'confirmed' | 'completed' | 'cancelled' | 'expired'

export interface Reservation {
  id: string
  customerId: string
  barberId: string
  serviceId: string
  date: string // YYYY-MM-DD format
  startTime: string // HH:mm format
  endTime: string // HH:mm format
  duration: number
  status: ReservationStatus
  qrToken?: string
  subscriptionUsed?: boolean
  rewardUsed?: boolean
  seat?: number
  notes?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export type ReservationEventType =
  | 'CREATED'
  | 'UPDATED'
  | 'WAITLISTED'
  | 'CANCELLED'
  | 'COMPLETED'
  | 'QR_SCANNED'
  | 'LOYALTY_UPDATED'
  | 'SUBSCRIPTION_USED'
  | 'REWARD_USED'

export interface ReservationEvent {
  id: string
  reservationId: string
  customerId: string
  performedBy: string
  type: ReservationEventType
  timestamp: Timestamp
  details?: Record<string, unknown>
}

export interface Waitlist {
  id: string
  customerId: string
  reservationDate: string
  requestedTime: string
  serviceId: string
  barberPreference?: string
  position: number
  offerSent: boolean
  offerExpiresAt?: Timestamp
  accepted: boolean
  createdAt: Timestamp
}

export interface Product {
  id: string
  name: string
  price: number
  description: string
  imageUrl: string
  enabled: boolean
  displayOrder: number
  createdAt: Timestamp
  updatedAt: Timestamp
}

export type GalleryCategory = 'Enfant' | 'Jeune' | 'Adulte'

export interface GalleryImage {
  id: string
  category: GalleryCategory
  imageUrl: string
  displayOrder: number
  enabled: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface SubscriptionPlan {
  id: string
  name: string
  price: number
  haircutsIncluded: number
  validityDays: number
  enabled: boolean
  description: string
  displayOrder: number
  servicesIncluded?: { serviceId: string; count: number }[]
}

export type SubscriptionStatus = 'active' | 'expired' | 'finished'

export interface Subscription {
  id: string
  customerId: string
  planId: string
  remainingHaircuts: number
  startDate: string
  expirationDate: string
  status: SubscriptionStatus
  assignedBy: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export type LoyaltyRewardStatus = 'available' | 'redeemed' | 'expired'

export interface LoyaltyReward {
  id: string
  customerId: string
  rewardQr: string
  status: LoyaltyRewardStatus
  generatedAt: Timestamp
  redeemedAt?: Timestamp
  reservationId?: string
}

export type NotificationType =
  | 'Reservation'
  | 'Reminder'
  | 'Subscription'
  | 'Loyalty'
  | 'Waitlist'
  | 'General'

export interface Notification {
  id: string
  customerId: string
  title: string
  message: string
  type: NotificationType
  read: boolean
  createdAt: Timestamp
  actionUrl?: string
  metadata?: Record<string, unknown>
}

export interface OpeningHours {
  monday: { open: string; close: string; closed: boolean }
  tuesday: { open: string; close: string; closed: boolean }
  wednesday: { open: string; close: string; closed: boolean }
  thursday: { open: string; close: string; closed: boolean }
  friday: { open: string; close: string; closed: boolean }
  saturday: { open: string; close: string; closed: boolean }
  sunday: { open: string; close: string; closed: boolean }
}

export interface AppSettings {
  id: string
  shopName: string
  logoUrl: string
  phone: string
  whatsapp: string
  facebook: string
  instagram: string
  address: string
  googleMapsUrl: string
  latitude: number
  longitude: number
  openingHours: OpeningHours
  activeSeats: number
  reservationEnabled: boolean
  galleryEnabled: boolean
  productsEnabled: boolean
  loyaltyEnabled: boolean
  subscriptionEnabled: boolean
  maintenanceMode: boolean
  iosAppMessageEnabled: boolean
  androidApkUrl: string
  version: string
}

export interface Contact {
  id: string
  address: string
  phone: string
  email: string
  facebook: string
  instagram: string
  whatsapp: string
  googleMapsUrl: string
  businessHours: OpeningHours
}
