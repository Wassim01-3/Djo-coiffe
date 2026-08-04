import { collection } from 'firebase/firestore'
import type { CollectionReference, DocumentData } from 'firebase/firestore'
import { db } from './config'
import type {
  User,
  Admin,
  Barber,
  Service,
  Reservation,
  ReservationEvent,
  Waitlist,
  Product,
  GalleryImage,
  SubscriptionPlan,
  Subscription,
  LoyaltyReward,
  Notification,
  AppSettings,
  Contact,
} from '../types/models'

// Helper function to create strongly-typed collection references
const createCollection = <T = DocumentData>(collectionName: string) => {
  return collection(db, collectionName) as CollectionReference<T>
}

export const collections = {
  users: createCollection<Omit<User, 'id'>>('users'),
  admins: createCollection<Omit<Admin, 'id'>>('admins'),
  barbers: createCollection<Omit<Barber, 'id'>>('barbers'),
  services: createCollection<Omit<Service, 'id'>>('services'),
  reservations: createCollection<Omit<Reservation, 'id'>>('reservations'),
  reservationEvents:
    createCollection<Omit<ReservationEvent, 'id'>>('reservation_events'),
  waitlists: createCollection<Omit<Waitlist, 'id'>>('waitlists'),
  products: createCollection<Omit<Product, 'id'>>('products'),
  gallery: createCollection<Omit<GalleryImage, 'id'>>('gallery'),
  subscriptionPlans:
    createCollection<Omit<SubscriptionPlan, 'id'>>('subscription_plans'),
  subscriptions: createCollection<Omit<Subscription, 'id'>>('subscriptions'),
  loyaltyRewards:
    createCollection<Omit<LoyaltyReward, 'id'>>('loyalty_rewards'),
  notifications: createCollection<Omit<Notification, 'id'>>('notifications'),
  settings: createCollection<Omit<AppSettings, 'id'>>('settings'),
  contact: createCollection<Omit<Contact, 'id'>>('contact'),
}
