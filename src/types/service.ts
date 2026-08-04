export interface Service {
  id: string
  name: string
  description: string
  price: number // in TND
  duration: number // in minutes
  imageUrl?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
