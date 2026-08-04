import type { LoyaltyRewardType } from '@constants/loyalty'

export interface LoyaltyReward {
  id: string
  userId: string
  type: LoyaltyRewardType
  pointsCost: number
  description: string
  isRedeemed: boolean
  qrCode?: string
  expiresAt?: Date
  createdAt: Date
}
