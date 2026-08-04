import type { ReservationStatus } from '@constants/reservation'

export interface Reservation {
  id: string
  userId: string
  barberId: string
  serviceId: string
  date: string // ISO date string
  timeSlot: string // HH:mm
  status: ReservationStatus
  qrCode?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface ReservationHistory extends Reservation {
  completedAt?: Date
  rating?: number
}
