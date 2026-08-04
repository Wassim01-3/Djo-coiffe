import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, Scissors, X, Plus } from 'lucide-react'
import { EmptyState } from '@components/ui'
import { GhostButton } from '@components/buttons/GhostButton'
import { DangerButton } from '@components/buttons/DangerButton'
import { PrimaryButton } from '@components/buttons/PrimaryButton'
import { ListSkeleton } from '@components/ui'
import { useReservationContext } from '@contexts/ReservationContext'
import { getActiveServices, getActiveBarbers } from '@services/catalog.service'
import type { Barber, Service, Reservation } from '@appTypes/models'
import { ROUTES } from '@constants/routes'

const statusColors: Record<string, string> = {
  pending: 'bg-[#3B82F6]/10 text-[#3B82F6]',
  confirmed: 'bg-success/10 text-success',
  completed: 'bg-success/10 text-success',
  cancelled: 'bg-danger/10 text-danger',
  expired: 'bg-gray-100 text-gray-500',
}

const statusLabels: Record<string, string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  completed: 'Terminée',
  cancelled: 'Annulée',
  expired: 'Expirée',
}

const MyReservationsPage: React.FC = () => {
  const navigate = useNavigate()
  const { reservations, isLoading, fetchMyReservations, cancelReservation } =
    useReservationContext()
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming')
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  const [barbers, setBarbers] = useState<Barber[]>([])
  const [services, setServices] = useState<Service[]>([])

  useEffect(() => {
    fetchMyReservations()
    Promise.all([getActiveBarbers(), getActiveServices()]).then(([b, s]) => {
      setBarbers(b)
      setServices(s)
    })
  }, [fetchMyReservations])

  const today = new Date().toISOString().split('T')[0]

  const upcoming: Reservation[] = reservations.filter(
    (r) =>
      (r.status === 'pending' || r.status === 'confirmed') && r.date >= today,
  )
  const history: Reservation[] = reservations.filter(
    (r) =>
      r.status === 'completed' ||
      r.status === 'cancelled' ||
      r.status === 'expired' ||
      r.date < today,
  )

  const currentList = activeTab === 'upcoming' ? upcoming : history

  const getServiceName = (serviceId: string) =>
    services.find((s) => s.id === serviceId)?.name ?? 'Service'

  const getBarberName = (barberId: string) =>
    barbers.find((b) => b.id === barberId)?.name ?? 'Coiffeur'

  const handleCancel = async (id: string) => {
    setCancellingId(id)
    try {
      await cancelReservation(id)
    } finally {
      setCancellingId(null)
    }
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    })

  return (
    <div className="flex min-h-screen flex-col bg-background pt-4 pb-20">
      <div className="mb-4 flex items-center justify-between px-6">
        <h1 className="font-heading text-2xl font-bold text-primary">
          Réservations
        </h1>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(ROUTES.RESERVATION)}
          className="flex h-10 items-center gap-1.5 rounded-full bg-primary px-4 text-sm font-semibold text-accent shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Nouveau
        </motion.button>
      </div>

      {/* Tabs */}
      <div className="px-6 mb-6">
        <div className="flex rounded-xl bg-gray-100 p-1">
          {(['upcoming', 'history'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${
                activeTab === tab
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'upcoming' ? 'À venir' : 'Historique'}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <ListSkeleton />
      ) : currentList.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={Calendar}
            title={
              activeTab === 'upcoming'
                ? 'Aucune réservation'
                : 'Historique vide'
            }
            message={
              activeTab === 'upcoming'
                ? "Vous n'avez pas de rendez-vous prévu."
                : "Vous n'avez pas encore de réservations passées."
            }
            actionLabel={
              activeTab === 'upcoming' ? 'Réserver maintenant' : undefined
            }
            onAction={() => navigate(ROUTES.RESERVATION)}
          />
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="flex flex-col gap-4 px-4">
            {currentList.map((res, i) => (
              <motion.div
                key={res.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl bg-white p-5 shadow-card"
              >
                <div className="flex items-start justify-between border-b border-gray-100 pb-4">
                  <div>
                    <h3 className="font-semibold text-primary">
                      {getServiceName(res.serviceId)}
                    </h3>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                      <Scissors className="h-3.5 w-3.5" />
                      <span>Avec {getBarberName(res.barberId)}</span>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${statusColors[res.status] ?? ''}`}
                  >
                    {statusLabels[res.status] ?? res.status}
                  </span>
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-accent" />
                    <span className="text-sm font-medium text-gray-700">
                      {formatDate(res.date)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-accent" />
                    <span className="text-sm font-medium text-gray-700">
                      {res.startTime} – {res.endTime}
                    </span>
                  </div>
                </div>

                {/* Upcoming actions */}
                {activeTab === 'upcoming' && (
                  <div className="mt-4 flex gap-2">
                    <GhostButton 
                      className="h-10 flex-1 gap-1.5 text-xs border border-primary text-primary"
                      onClick={() => navigate(`/reservations/${res.id}/qr`)}
                    >
                      Voir le QR
                    </GhostButton>
                    <DangerButton
                      isLoading={cancellingId === res.id}
                      className="h-10 px-4 text-xs"
                      onClick={() => handleCancel(res.id)}
                    >
                      <X className="h-4 w-4" />
                    </DangerButton>
                  </div>
                )}

                {/* History actions */}
                {activeTab === 'history' && res.status === 'completed' && (
                  <div className="mt-4">
                    <PrimaryButton
                      onClick={() => navigate(ROUTES.RESERVATION)}
                      className="h-10 text-xs"
                    >
                      Réserver à nouveau
                    </PrimaryButton>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  )
}

export default MyReservationsPage
