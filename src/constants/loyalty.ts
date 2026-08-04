export const LOYALTY_POINTS_PER_VISIT = 10
export const LOYALTY_REWARD_THRESHOLD = 100

export const LOYALTY_REWARD_TYPES = {
  FREE_SERVICE: 'free_service',
  DISCOUNT: 'discount',
} as const

export type LoyaltyRewardType =
  (typeof LOYALTY_REWARD_TYPES)[keyof typeof LOYALTY_REWARD_TYPES]
