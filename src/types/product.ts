export interface Product {
  id: string
  name: string
  description: string
  price: number // in TND
  imageUrl?: string
  category: string
  isAvailable: boolean
  createdAt: Date
  updatedAt: Date
}
