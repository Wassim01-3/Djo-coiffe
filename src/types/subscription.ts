import type { SubscriptionStatus } from '@constants/subscriptions'

export interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price: number // in TND
  durationDays: number
  sessionsIncluded: number
  createdAt: Date
  updatedAt: Date
}

export interface Subscription {
  id: string
  userId: string
  planId: string
  status: SubscriptionStatus
  startDate: Date
  endDate: Date
  sessionsUsed: number
  sessionsTotal: number
  createdAt: Date
  updatedAt: Date
}
