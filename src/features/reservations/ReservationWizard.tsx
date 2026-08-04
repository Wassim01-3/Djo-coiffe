import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Check,
  ChevronLeft,
  Scissors,
  User2,
  CalendarDays,
  Clock,
  QrCode,
  Share2,
  Download,
  CheckCircle2,
} from 'lucide-react'
import { PrimaryButton } from '@components/buttons/PrimaryButton'
import { GhostButton } from '@components/buttons/GhostButton'
import { ListSkeleton } from '@components/ui'
import { getActiveBarbers, getActiveServices } from '@services/catalog.service'
import { getAvailableSlots } from '@services/reservation.service'
import { joinWaitlist } from '@services/waitlist.service'
import { useAuthContext } from '@contexts/AuthContext'
import { useReservationContext } from '@contexts/ReservationContext'
import { useSettingsContext } from '@contexts/SettingsContext'
import type { Barber, Service, Reservation } from '@appTypes/models'
import { getIconComponent } from '@utils/iconMap'
import { ROUTES } from '@constants/routes'

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────
interface WizardState {
  step: 1 | 2 | 3 | 4 | 5
  service: Service | null
  barber: Barber | null
  date: string
  time: string
}

// ──────────────────────────────────────────────
// Step Progress Bar
// ──────────────────────────────────────────────
const StepBar: React.FC<{ step: number }> = ({ step }) => {
  const steps = [
    { label: 'Service', icon: Scissors },
    { label: 'Coiffeur', icon: User2 },
    { label: 'Date & Heure', icon: CalendarDays },
    { label: 'Confirmation', icon: Check },
  ]
  return (
    <div className="flex items-center justify-between px-6 py-4">
      {steps.map((s, i) => {
        const isActive = i + 1 === step
        const isDone = i + 1 < step
        return (
          <React.Fragment key={s.label}>
            <div className="flex flex-col items-center gap-1">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                  isDone
                    ? 'bg-success text-white'
                    : isActive
                      ? 'bg-primary text-accent ring-2 ring-primary ring-offset-2'
                      : 'bg-gray-100 text-gray-400'
                }`}
              >
                {isDone ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span
                className={`hidden text-[9px] font-medium sm:block ${
                  isActive ? 'text-primary' : 'text-gray-400'
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`h-[2px] flex-1 mx-1 transition-colors ${
                  isDone ? 'bg-success' : 'bg-gray-100'
                }`}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

// ──────────────────────────────────────────────
// Step 1: Service Selection
// ──────────────────────────────────────────────
const ServiceStep: React.FC<{
  services: Service[]
  selected: Service | null
  onSelect: (s: Service) => void
}> = ({ services, selected, onSelect }) => {
  return (
    <div className="flex flex-col gap-3 px-4 py-6">
      <h2 className="font-heading text-xl font-bold text-primary mb-2">
        Choisir un Service
      </h2>
      {services.map((service) => {
        const Icon = getIconComponent(service.icon)
        return (
          <motion.button
            key={service.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(service)}
            className={`flex items-center gap-4 rounded-2xl border-2 bg-white p-4 text-left transition-all ${
              selected?.id === service.id
                ? 'border-primary shadow-md'
                : 'border-gray-100 hover:border-gray-200 shadow-sm'
            }`}
          >
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors ${
                selected?.id === service.id ? 'bg-primary' : 'bg-gray-50'
              }`}
            >
              <Icon
                className={`h-5 w-5 ${selected?.id === service.id ? 'text-accent' : 'text-gray-400'}`}
              />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-primary">{service.name}</h3>
              <p className="text-xs text-gray-500">{service.description}</p>
              <div className="mt-2 flex items-center gap-3">
                <span className="flex items-center gap-1 text-xs font-medium text-gray-500">
                  <Clock className="h-3.5 w-3.5" /> {service.durationMinutes} min
                </span>
                <span className="text-xs font-bold text-accent">
                  {service.price} DT
                </span>
              </div>
            </div>
            {selected?.id === service.id && (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
            )}
          </motion.button>
        )
      })}
    </div>
  )
}

// ──────────────────────────────────────────────
// Step 2: Barber Selection
// ──────────────────────────────────────────────
const BarberStep: React.FC<{
  barbers: Barber[]
  selected: Barber | null
  onSelect: (b: Barber) => void
}> = ({ barbers, selected, onSelect }) => {
  return (
    <div className="flex flex-col gap-3 px-4 py-6">
      <h2 className="font-heading text-xl font-bold text-primary mb-2">
        Choisir un Coiffeur
      </h2>
      {barbers.map((barber) => (
        <motion.button
          key={barber.id}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect(barber)}
          className={`flex items-center gap-4 rounded-2xl border-2 bg-white p-4 text-left transition-all ${
            selected?.id === barber.id
              ? 'border-primary shadow-md'
              : 'border-gray-100 hover:border-gray-200 shadow-sm'
          }`}
        >
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-bold transition-colors ${
              selected?.id === barber.id
                ? 'bg-primary text-accent'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {barber.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-primary">{barber.name}</h3>
            <p className="text-xs text-gray-500">Siège n°{barber.seatNumber}</p>
          </div>
          {selected?.id === barber.id && (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
          )}
        </motion.button>
      ))}
    </div>
  )
}

// ──────────────────────────────────────────────
// Step 3: Date & Time Slot Selection
// ──────────────────────────────────────────────
const DateTimeStep: React.FC<{
  service: Service
  barber: Barber
  selectedDate: string
  selectedTime: string
  onDateChange: (d: string) => void
  onTimeSelect: (t: string) => void
  customer: any
  isDayClosed: (d: string) => boolean
}> = ({
  service,
  barber,
  selectedDate,
  selectedTime,
  onDateChange,
  onTimeSelect,
  customer,
  isDayClosed,
}) => {
  const [slots, setSlots] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [waitlistLoading, setWaitlistLoading] = useState(false)

  // Generate the next 14 days, then filter to only open days
  const today = new Date()
  const dateOptions = Array.from({ length: 28 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    return d.toISOString().split('T')[0]
  }).filter((d) => !isDayClosed(d)).slice(0, 14)

  const loadSlots = useCallback(
    async (date: string) => {
      setLoadingSlots(true)
      setSlots([])
      try {
        const available = await getAvailableSlots(
          date,
          barber.id,
          service.durationMinutes,
        )
        setSlots(available)
      } catch {
        setSlots([])
      } finally {
        setLoadingSlots(false)
      }
    },
    [barber.id, service.durationMinutes],
  )

  useEffect(() => {
    if (selectedDate) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadSlots(selectedDate)
    }
  }, [selectedDate, loadSlots])

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return {
      day: d.toLocaleDateString('fr-FR', { weekday: 'short' }),
      num: d.getDate(),
      isToday: dateStr === today.toISOString().split('T')[0],
    }
  }

  const handleJoinWaitlist = async () => {
    if (!customer?.id || !selectedDate || !service || !barber) return
    setWaitlistLoading(true)
    try {
      await joinWaitlist(
        customer.id,
        selectedDate,
        'N/A',
        service.id,
        barber.id
      )
      alert("Vous avez rejoint la file d'attente !")
    } catch (e) {
      alert("Erreur lors de l'ajout à la file")
    } finally {
      setWaitlistLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-6">
      <div>
        <h2 className="font-heading text-xl font-bold text-primary mb-4">
          Choisir la Date
        </h2>
        {/* Horizontal date scroller */}
        <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-2">
          {dateOptions.map((dateStr) => {
            const { day, num, isToday } = formatDate(dateStr)
            const isSelected = selectedDate === dateStr

            return (
              <button
                key={dateStr}
                onClick={() => onDateChange(dateStr)}
                className={`flex w-14 shrink-0 flex-col items-center rounded-2xl py-3 transition-all ${
                  isSelected
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-white text-gray-600 border border-gray-100 hover:border-gray-300'
                }`}
              >
                <span
                  className={`text-[10px] font-medium uppercase ${isSelected ? 'text-accent' : 'text-gray-400'}`}
                >
                  {day}
                </span>
                <span className="mt-1 text-lg font-bold">{num}</span>
                {isToday && (
                  <span
                    className={`mt-1 h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-accent' : 'bg-primary'}`}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Time slots */}
      {selectedDate && (
        <div>
          <h2 className="font-heading text-xl font-bold text-primary mb-4">
            Choisir l'Heure
          </h2>
          {loadingSlots ? (
            <ListSkeleton />
          ) : slots.length === 0 ? (
            <div className="rounded-2xl bg-white p-6 text-center shadow-sm border border-gray-100">
              <CalendarDays className="mx-auto mb-3 h-10 w-10 text-gray-300" />
              <p className="font-medium text-gray-500">
                Aucun créneau disponible ce jour.
              </p>
              <PrimaryButton 
                onClick={handleJoinWaitlist} 
                isLoading={waitlistLoading}
                className="mt-4 w-full"
              >
                Rejoindre la file d'attente
              </PrimaryButton>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {slots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => onTimeSelect(slot)}
                  className={`rounded-xl py-3 text-sm font-semibold transition-all ${
                    selectedTime === slot
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-white border border-gray-100 text-gray-700 hover:border-primary hover:text-primary'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ──────────────────────────────────────────────
// Step 4: Confirmation
// ──────────────────────────────────────────────
const ConfirmationStep: React.FC<{
  state: WizardState
  isLoading: boolean
  error: string | null
  onConfirm: () => void
}> = ({ state, isLoading, error, onConfirm }) => {
  const { service, barber, date, time } = state
  if (!service || !barber) return null

  const endMins =
    parseInt(time.split(':')[0]) * 60 +
    parseInt(time.split(':')[1]) +
    service.durationMinutes
  const endTime = `${Math.floor(endMins / 60)
    .toString()
    .padStart(2, '0')}:${(endMins % 60).toString().padStart(2, '0')}`

  const formattedDate = new Date(date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="flex flex-col gap-5 px-4 py-6">
      <h2 className="font-heading text-xl font-bold text-primary">
        Confirmer la Réservation
      </h2>

      <div className="overflow-hidden rounded-2xl bg-white shadow-card">
        <div className="bg-primary p-5 text-center">
          <h3 className="font-heading text-xl font-bold text-accent">
            {service.name}
          </h3>
          <p className="mt-1 text-sm text-white/70">avec {barber.name}</p>
        </div>
        <div className="divide-y divide-gray-100 px-5">
          {[
            { label: 'Date', value: formattedDate },
            { label: 'Heure', value: `${time} – ${endTime}` },
            { label: 'Durée', value: `${service.durationMinutes} minutes` },
            { label: 'Prix', value: `${service.price} DT` },
            { label: 'Siège', value: `Siège n°${barber.seatNumber}` },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="flex items-center justify-between py-3.5"
            >
              <span className="text-sm text-gray-500">{label}</span>
              <span className="text-sm font-semibold text-primary">
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-danger/10 px-4 py-3 text-sm font-medium text-danger">
          {error}
        </div>
      )}

      <PrimaryButton
        onClick={onConfirm}
        isLoading={isLoading}
        className="h-14 text-base"
      >
        <Check className="mr-2 h-5 w-5" /> Confirmer la Réservation
      </PrimaryButton>
    </div>
  )
}

// ──────────────────────────────────────────────
// Step 5: Success Screen with QR
// ──────────────────────────────────────────────
const SuccessScreen: React.FC<{
  reservation: Reservation
  service: Service
  barber: Barber
}> = ({ reservation, service, barber }) => {
  const navigate = useNavigate()

  const formattedDate = new Date(reservation.date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex min-h-screen flex-col items-center px-4 py-8 pb-24 text-center"
    >
      {/* Success Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 15,
          delay: 0.15,
        }}
        className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success shadow-lg"
      >
        <Check className="h-10 w-10 text-white" strokeWidth={3} />
      </motion.div>

      <h1 className="font-heading text-2xl font-bold text-primary">
        Réservation Confirmée !
      </h1>
      <p className="mt-2 text-sm text-gray-500">
        {service.name} avec {barber.name}
      </p>
      <p className="text-sm font-medium text-primary">
        {formattedDate} à {reservation.startTime}
      </p>

      {/* QR Code Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-8 w-full max-w-xs overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-card"
      >
        <div className="bg-primary px-6 py-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">
            Votre QR Code
          </p>
          <p className="mt-1 text-xs text-white/60">Présentez-le au salon</p>
        </div>
        <div className="flex items-center justify-center p-8">
          <QrCode className="h-40 w-40 text-primary" strokeWidth={0.7} />
        </div>
        <div className="border-t border-gray-100 px-6 py-4">
          <p className="text-center font-mono text-[10px] text-gray-400 break-all">
            {reservation.qrToken}
          </p>
        </div>
      </motion.div>

      {/* Share / Download actions */}
      <div className="mt-6 flex gap-3 w-full max-w-xs">
        <GhostButton className="flex-1 gap-2 h-12 text-sm">
          <Download className="h-4 w-4" /> Sauvegarder
        </GhostButton>
        <GhostButton className="flex-1 gap-2 h-12 text-sm">
          <Share2 className="h-4 w-4" /> Partager
        </GhostButton>
      </div>

      <PrimaryButton
        onClick={() => navigate(ROUTES.MY_RESERVATIONS)}
        className="mt-4 h-14 w-full max-w-xs text-base"
      >
        Voir mes réservations
      </PrimaryButton>
    </motion.div>
  )
}

// ──────────────────────────────────────────────
// Main Wizard
// ──────────────────────────────────────────────
const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? '60%' : '-60%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? '-60%' : '60%', opacity: 0 }),
}

const ReservationWizard: React.FC = () => {
  const navigate = useNavigate()
  const { customer } = useAuthContext()
  const { createReservation, isLoading, error } = useReservationContext()
  const { isDayClosed } = useSettingsContext()

  const [direction, setDirection] = useState(1) // 1 = forward, -1 = backward
  const [completedReservation, setCompletedReservation] =
    useState<Reservation | null>(null)

  const [state, setState] = useState<WizardState>({
    step: 1,
    service: null,
    barber: null,
    date: '',
    time: '',
  })

  const [barbers, setBarbers] = useState<Barber[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    Promise.all([getActiveBarbers(), getActiveServices()])
      .then(([b, s]) => {
        setBarbers(b)
        setServices(s)
      })
      .finally(() => setLoadingData(false))
  }, [])

  const goNext = () => {
    setDirection(1)
    setState((s) => ({ ...s, step: (s.step + 1) as WizardState['step'] }))
  }

  const goPrev = () => {
    setDirection(-1)
    setState((s) => ({ ...s, step: (s.step - 1) as WizardState['step'] }))
  }

  const handleConfirm = async () => {
    if (!state.service || !state.barber || !state.date || !state.time) return
    try {
      const reservation = await createReservation(
        state.barber.id,
        state.service.id,
        state.date,
        state.time,
      )
      setCompletedReservation(reservation)
      setDirection(1)
      setState((s) => ({ ...s, step: 5 }))
    } catch {
      // Error is displayed from context
    }
  }

  // Success screen — no header needed
  if (
    state.step === 5 &&
    completedReservation &&
    state.service &&
    state.barber
  ) {
    return (
      <SuccessScreen
        reservation={completedReservation}
        service={state.service}
        barber={state.barber}
      />
    )
  }

  const canGoNext = (): boolean => {
    if (state.step === 1) return !!state.service
    if (state.step === 2) return !!state.barber
    if (state.step === 3) return !!(state.date && state.time)
    return false
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-gray-100 bg-white/80 backdrop-blur pt-[env(safe-area-inset-top)]">
        <div className="flex items-center gap-2 px-4 py-3">
          <button
            onClick={state.step === 1 ? () => navigate(-1) : goPrev}
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-gray-100"
          >
            <ChevronLeft className="h-5 w-5 text-primary" />
          </button>
          <h1 className="flex-1 font-heading font-bold text-primary text-center pr-10">
            Nouvelle Réservation
          </h1>
        </div>
        {state.step < 5 && <StepBar step={state.step} />}
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={state.step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'tween', duration: 0.25 }}
            className="pb-28"
          >
            {loadingData ? (
              <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
              </div>
            ) : state.step === 1 && (
              <ServiceStep
                services={services}
                selected={state.service}
                onSelect={(s) => setState((p) => ({ ...p, service: s }))}
              />
            )}
            {!loadingData && state.step === 2 && (
              <BarberStep
                barbers={barbers}
                selected={state.barber}
                onSelect={(b) => setState((p) => ({ ...p, barber: b }))}
              />
            )}
            {state.step === 3 && state.service && state.barber && (
              <DateTimeStep
                service={state.service}
                barber={state.barber}
                selectedDate={state.date}
                selectedTime={state.time}
                onDateChange={(d: string) => setState((p) => ({ ...p, date: d, time: '' }))}
                onTimeSelect={(t: string) => setState((p) => ({ ...p, time: t }))}
                customer={customer}
                isDayClosed={isDayClosed}
              />
            )}
            {state.step === 4 && (
              <ConfirmationStep
                state={state}
                isLoading={isLoading}
                error={error}
                onConfirm={handleConfirm}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Fixed Bottom CTA (Steps 1–3) */}
      {state.step < 4 && (
        <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-gray-100 bg-white/80 px-4 py-4 backdrop-blur-sm">
          <PrimaryButton
            onClick={goNext}
            disabled={!canGoNext()}
            className="h-14 text-base"
          >
            Continuer
          </PrimaryButton>
        </div>
      )}
    </div>
  )
}

export default ReservationWizard
