export interface Barber {
  id: string
  name: string
  bio?: string
  avatarUrl?: string
  specialties: string[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
