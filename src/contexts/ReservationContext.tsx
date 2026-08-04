import type { ReactNode } from 'react'
import React, { createContext, useContext, useState, useCallback } from 'react'
import type { Reservation } from '@appTypes/models'
import {
  createReservation as apiCreateReservation,
  cancelReservation as apiCancelReservation,
  getCustomerReservations,
} from '@services/reservation.service'
import { useAuthContext } from './AuthContext'

interface ReservationContextValue {
  reservations: Reservation[]
  isLoading: boolean
  error: string | null
  fetchMyReservations: () => Promise<void>
  createReservation: (
    barberId: string,
    serviceId: string,
    date: string,
    startTime: string,
  ) => Promise<Reservation>
  cancelReservation: (reservationId: string) => Promise<void>
}

const ReservationContext = createContext<ReservationContextValue | undefined>(
  undefined,
)

export const ReservationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { customer } = useAuthContext()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMyReservations = useCallback(async () => {
    if (!customer) return
    setIsLoading(true)
    setError(null)
    try {
      const res = await getCustomerReservations(customer.id)
      setReservations(res)
    } catch (err: unknown) {
      const error = err as Error
      setError(error.message || 'Erreur de chargement')
    } finally {
      setIsLoading(false)
    }
  }, [customer])

  const createReservation = async (
    barberId: string,
    serviceId: string,
    date: string,
    startTime: string,
  ): Promise<Reservation> => {
    if (!customer) throw new Error('Vous devez être connecté.')

    setIsLoading(true)
    setError(null)
    try {
      const res = await apiCreateReservation(
        customer.id,
        barberId,
        serviceId,
        date,
        startTime,
      )
      setReservations((prev) => [res, ...prev])
      return res
    } catch (err: unknown) {
      const error = err as Error
      setError(error.message || 'Erreur lors de la réservation')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const cancelReservation = async (reservationId: string): Promise<void> => {
    if (!customer) throw new Error('Vous devez être connecté.')

    setIsLoading(true)
    setError(null)
    try {
      await apiCancelReservation(reservationId, customer.id)
      setReservations((prev) =>
        prev.map((r) =>
          r.id === reservationId ? { ...r, status: 'cancelled' } : r,
        ),
      )
    } catch (err: unknown) {
      const error = err as Error
      setError(error.message || "Erreur lors de l'annulation")
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ReservationContext.Provider
      value={{
        reservations,
        isLoading,
        error,
        fetchMyReservations,
        createReservation,
        cancelReservation,
      }}
    >
      {children}
    </ReservationContext.Provider>
  )
}

export const useReservationContext = (): ReservationContextValue => {
  const ctx = useContext(ReservationContext)
  if (!ctx)
    throw new Error(
      'useReservationContext must be used inside ReservationProvider',
    )
  return ctx
}
