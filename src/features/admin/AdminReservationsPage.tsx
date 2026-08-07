import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  doc,
  getDoc,
} from 'firebase/firestore'
import { db } from '@appFirebase/config'
import {
  Phone,
  QrCode,
  CheckCircle2,
  XCircle,
  Crown,
  Gift,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ROUTES } from '@constants/routes'
import type { Reservation, User, Barber, Service } from '@appTypes/models'

// ─── Enriched card type ─────────────────────────────────────────────────────
interface QueueCard {
  reservation: Reservation
  customer: User | null
  barber: Barber | null
  service: Service | null
}

// ─── Skeleton ───────────────────────────────────────────────────────────────
const CardSkeleton = () => (
  <div className="animate-pulse rounded-2xl border border-gray-200 bg-white p-4">
    <div className="flex items-start gap-4">
      <div className="h-10 w-16 rounded-xl bg-gray-100" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-32 rounded bg-gray-100" />
        <div className="h-3 w-24 rounded bg-gray-100" />
        <div className="h-3 w-40 rounded bg-gray-100" />
      </div>
    </div>
  </div>
)

// ─── Helpers ────────────────────────────────────────────────────────────────
const statusConfig = {
  pending: {
    label: 'En attente',
    className: 'bg-blue-50 text-blue-600 border-blue-100',
  },
  confirmed: {
    label: 'Confirmé',
    className: 'bg-accent/10 text-accent border-accent/20',
  },
  completed: {
    label: 'Terminé',
    className: 'bg-success/10 text-success border-success/20',
  },
  cancelled: {
    label: 'Annulé',
    className: 'bg-gray-100 text-gray-500 border-gray-200',
  },
  expired: {
    label: 'Expiré',
    className: 'bg-gray-100 text-gray-400 border-gray-200',
  },
}

const isCurrentSlot = (startTime: string, endTime: string, dateStr: string): boolean => {
  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]
  if (dateStr !== todayStr) return false
  
  const [sh, sm] = startTime.split(':').map(Number)
  const [eh, em] = endTime.split(':').map(Number)
  const start = new Date(now)
  start.setHours(sh, sm, 0, 0)
  const end = new Date(now)
  end.setHours(eh, em, 0, 0)
  return now >= start && now < end
}

const getCardBorder = (card: QueueCard, selectedDate: string): string => {
  const { reservation } = card
  if (reservation.status === 'completed') return 'border-success/30 bg-success/5'
  if (reservation.status === 'cancelled' || reservation.status === 'expired')
    return 'border-gray-200 bg-gray-50 opacity-70'
  if (isCurrentSlot(reservation.startTime, reservation.endTime, selectedDate))
    return 'border-accent shadow-md ring-1 ring-accent/30'
  return 'border-gray-200 bg-white'
}

// ─── Cache helpers ─────────
const userCache = new Map<string, User | null>()
const barberCache = new Map<string, Barber | null>()
const serviceCache = new Map<string, Service | null>()

const fetchUser = async (id: string): Promise<User | null> => {
  if (userCache.has(id)) return userCache.get(id)!
  const snap = await getDoc(doc(db, 'users', id))
  const data = snap.exists() ? (snap.data() as User) : null
  userCache.set(id, data)
  return data
}

const fetchBarber = async (id: string): Promise<Barber | null> => {
  if (barberCache.has(id)) return barberCache.get(id)!
  const snap = await getDoc(doc(db, 'barbers', id))
  const data = snap.exists() ? (snap.data() as Barber) : null
  barberCache.set(id, data)
  return data
}

const fetchService = async (id: string): Promise<Service | null> => {
  if (serviceCache.has(id)) return serviceCache.get(id)!
  const snap = await getDoc(doc(db, 'services', id))
  const data = snap.exists() ? (snap.data() as Service) : null
  serviceCache.set(id, data)
  return data
}

// ─── Component ───────────────────────────────────────────────────────────────
const AdminReservationsPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Initialize date from URL query param (e.g. ?date=2026-08-15 from push notification deep-link)
  const initialDate = (() => {
    const param = searchParams.get('date')
    if (param) {
      const parsed = new Date(param)
      if (!isNaN(parsed.getTime())) return parsed
    }
    return new Date()
  })()

  // State for date selection
  const [selectedDateObj, setSelectedDateObj] = useState(initialDate)
  const selectedDateStr = selectedDateObj.toISOString().split('T')[0]
  
  const [cards, setCards] = useState<QueueCard[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeHighlight, setActiveHighlight] = useState<string | null>(null)

  useEffect(() => {
    const highlightId = searchParams.get('highlight')
    if (highlightId && !isLoading && cards.length > 0) {
      setActiveHighlight(highlightId)
      
      // Small timeout to allow layout to settle before scrolling
      setTimeout(() => {
        const el = document.getElementById(`res-${highlightId}`)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 300)

      const timer = setTimeout(() => {
        setActiveHighlight(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [searchParams, isLoading, cards])

  // Navigation handlers
  const handlePrevDay = () => {
    const prev = new Date(selectedDateObj)
    prev.setDate(prev.getDate() - 1)
    setSelectedDateObj(prev)
  }
  
  const handleNextDay = () => {
    const next = new Date(selectedDateObj)
    next.setDate(next.getDate() + 1)
    setSelectedDateObj(next)
  }
  
  const handleToday = () => {
    setSelectedDateObj(new Date())
  }

  // Format date for display
  const dateDisplay = selectedDateObj.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  useEffect(() => {
    setIsLoading(true)
    const reservationsRef = collection(db, 'reservations')
    const q = query(
      reservationsRef,
      where('date', '==', selectedDateStr),
      orderBy('startTime', 'asc'),
    )

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const reservations = snapshot.docs.map((d) => d.data() as Reservation)

      // Enrich each reservation with related data
      const enriched = await Promise.all(
        reservations.map(async (res) => {
          const [customer, barber, service] = await Promise.all([
            fetchUser(res.customerId),
            fetchBarber(res.barberId),
            fetchService(res.serviceId),
          ])
          return { reservation: res, customer, barber, service }
        }),
      )

      setCards(enriched)
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [selectedDateStr])

  const pendingCount = cards.filter(
    (c) => c.reservation.status === 'pending' || c.reservation.status === 'confirmed',
  ).length
  const completedCount = cards.filter((c) => c.reservation.status === 'completed').length

  return (
    <div className="min-h-full p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-heading text-xl font-bold text-primary md:text-2xl">
            Gestion des Réservations
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Consultez et gérez le planning complet
          </p>
        </div>
        <button
          onClick={() => navigate(ROUTES.ADMIN_SCANNER)}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-primary shadow-sm transition-all hover:bg-accent/90 active:scale-95 md:w-auto"
        >
          <QrCode className="h-4 w-4" />
          Scanner un client
        </button>
      </div>
      
      {/* Date Navigation */}
      <div className="mb-6 flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-2 shadow-sm">
        <button
          onClick={handlePrevDay}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-gray-100"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex flex-col items-center justify-center">
          <p className="font-heading text-sm font-semibold capitalize text-primary">
            {dateDisplay}
          </p>
          <button 
            onClick={handleToday}
            className="text-[10px] font-medium text-accent hover:underline"
          >
            Aujourd'hui
          </button>
        </div>
        <button
          onClick={handleNextDay}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-gray-100"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Stats */}
      {!isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 grid grid-cols-3 gap-3"
        >
          {[
            { label: 'Total', value: cards.length, color: 'text-primary' },
            { label: 'En attente', value: pendingCount, color: 'text-blue-600' },
            { label: 'Terminés', value: completedCount, color: 'text-success' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-gray-200 bg-white px-3 py-3 text-center shadow-sm"
            >
              <p className={`font-heading text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </p>
              <p className="mt-0.5 text-xs text-gray-500">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      )}

      {/* Queue Cards */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : cards.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center"
        >
          <CalendarIcon className="mx-auto mb-3 h-12 w-12 text-gray-300" />
          <p className="font-semibold text-gray-500">Aucune réservation pour ce jour</p>
          <p className="mt-1 text-sm text-gray-400">
            Essayez de sélectionner une autre date.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {cards.map((card, idx) => {
            const { reservation: res, customer, barber, service } = card
            const cfg = statusConfig[res.status]
            const isCurrent = isCurrentSlot(res.startTime, res.endTime, selectedDateStr)
            const isCompleted = res.status === 'completed'
            const isCancelled =
              res.status === 'cancelled' || res.status === 'expired'

            const isHighlighted = res.id === activeHighlight

            return (
              <motion.div
                id={`res-${res.id}`}
                key={res.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className={`relative overflow-hidden rounded-2xl border p-4 transition-all duration-500 ${
                  isHighlighted
                    ? 'border-accent bg-accent/5 ring-4 ring-accent/30 scale-[1.02]'
                    : getCardBorder(card, selectedDateStr)
                }`}
              >
                {/* Current indicator */}
                {isCurrent && !isCompleted && !isCancelled && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent rounded-l-2xl" />
                )}

                <div className="flex items-start gap-3">
                  {/* Time block */}
                  <div className="flex w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-gray-100 py-2">
                    <span className="font-heading text-sm font-bold text-primary leading-tight">
                      {res.startTime}
                    </span>
                    <span className="text-[10px] text-gray-400">{res.endTime}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className={`font-semibold text-sm leading-tight ${isCancelled ? 'text-gray-400 line-through' : 'text-primary'}`}>
                            {customer?.fullName ?? '—'}
                          </p>
                          {/* Badges */}
                          {res.subscriptionUsed && (
                            <span
                              title="Abonnement utilisé"
                              className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/20"
                            >
                              <Crown className="h-3 w-3 text-accent" />
                            </span>
                          )}
                          {res.rewardUsed && (
                            <span
                              title="Récompense utilisée"
                              className="flex h-5 w-5 items-center justify-center rounded-full bg-success/20"
                            >
                              <Gift className="h-3 w-3 text-success" />
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-gray-500">
                          {service?.name ?? '—'}
                          {barber ? ` • ${barber.name}` : ''}
                          {res.seat ? ` • Chaise ${res.seat}` : ''}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${cfg.className}`}
                      >
                        {cfg.label}
                      </span>
                    </div>

                    {/* Actions */}
                    {!isCancelled && (
                      <div className="mt-3 flex items-center gap-2">
                        {isCompleted ? (
                          <div className="flex items-center gap-1.5 text-xs font-medium text-success">
                            <CheckCircle2 className="h-4 w-4" />
                            Terminé
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => navigate(ROUTES.ADMIN_SCANNER)}
                              className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-primary/90 active:scale-95"
                            >
                              <QrCode className="h-3.5 w-3.5" />
                              Scanner QR
                            </button>
                            {customer?.phoneNumber && (
                              <a
                                href={`tel:${customer.phoneNumber}`}
                                className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 transition-all hover:bg-gray-50 active:scale-95"
                              >
                                <Phone className="h-3.5 w-3.5" />
                                Appeler
                              </a>
                            )}
                          </>
                        )}
                      </div>
                    )}

                    {isCancelled && (
                      <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-gray-400">
                        <XCircle className="h-4 w-4" />
                        Annulée
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default AdminReservationsPage
