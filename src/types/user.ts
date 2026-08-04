export interface User {
  id: string
  fullName: string
  phone: string
  isAdmin: boolean
  fcmToken?: string
  loyaltyPoints: number
  totalVisits: number
  createdAt: Date
  updatedAt: Date
}
