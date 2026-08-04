import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  ChevronLeft,
  Calendar,
  Clock,
  Gift,
  CreditCard,
  Users,
  Megaphone,
  CheckCheck,
  Settings,
  X,
} from 'lucide-react'
import { isToday, isYesterday, format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useNotificationContext } from '@contexts/NotificationContext'
import { acceptWaitlistOffer, declineWaitlistOffer } from '@services/waitlist.service'
import { PrimaryButton } from '@components/buttons/PrimaryButton'
import { GhostButton } from '@components/buttons/GhostButton'
import { EmptyState } from '@components/ui'
import toast from 'react-hot-toast'
import type { Notification, NotificationType } from '@appTypes/models'

/* ─── Icon map per notification type ───────────────────────────────────────── */
const getIconForType = (type: NotificationType) => {
  switch (type) {
    case 'Reservation':
      return <Calendar className="h-5 w-5 text-blue-500" />
    case 'Reminder':
      return <Clock className="h-5 w-5 text-accent" />
    case 'Loyalty':
      return <Gift className="h-5 w-5 text-success" />
    case 'Subscription':
      return <CreditCard className="h-5 w-5 text-purple-500" />
    case 'Waitlist':
      return <Users className="h-5 w-5 text-orange-500" />
    case 'General':
      return <Megaphone className="h-5 w-5 text-primary" />
    default:
      return <Bell className="h-5 w-5 text-gray-500" />
  }
}

/* ─── Group notifications into Today / Yesterday / Earlier ──────────────────── */
const groupNotifications = (notifications: Notification[]) => {
  const today: Notification[] = []
  const yesterday: Notification[] = []
  const earlier: Notification[] = []

  for (const n of notifications) {
    const ms = n.createdAt?.toMillis?.() ?? Date.now()
    const date = new Date(ms)
    if (isToday(date)) today.push(n)
    else if (isYesterday(date)) yesterday.push(n)
    else earlier.push(n)
  }

  return { today, yesterday, earlier }
}

/* ─── Preference Toggle ─────────────────────────────────────────────────────── */
function PreferencesPanel({
  preferences,
  setPreference,
  onClose,
}: {
  preferences: ReturnType<typeof useNotificationContext>['preferences']
  setPreference: ReturnType<typeof useNotificationContext>['setPreference']
  onClose: () => void
}) {
  const rows: { key: keyof typeof preferences; label: string }[] = [
    { key: 'reservationReminders', label: 'Rappels de réservation' },
    { key: 'waitlistAlerts', label: 'Alertes liste d\'attente' },
    { key: 'loyaltyRewards', label: 'Récompenses fidélité' },
    { key: 'subscriptionAlerts', label: 'Alertes abonnement' },
    { key: 'announcements', label: 'Annonces générales' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="relative w-full max-w-md rounded-t-3xl bg-white px-6 pb-8 pt-5 shadow-2xl"
      >
        <div className="mb-1 flex h-1 w-10 rounded-full bg-gray-300 mx-auto" />
        <div className="mb-5 flex items-center justify-between pt-2">
          <h2 className="font-heading text-lg font-bold text-primary">Préférences de notifications</h2>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="divide-y divide-gray-100">
          {rows.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between py-4">
              <span className="text-sm font-medium text-primary">{label}</span>
              <button
                type="button"
                role="switch"
                aria-checked={preferences[key]}
                onClick={() => setPreference(key, !preferences[key])}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences[key] ? 'bg-accent' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
                    preferences[key] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

/* ─── Notification Card ─────────────────────────────────────────────────────── */
function NotifCard({ notif, onRead, navigate }: {
  notif: Notification
  onRead: (id: string) => void
  navigate: ReturnType<typeof useNavigate>
}) {
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [now] = useState(Date.now())

  const isWaitlist = notif.type === 'Waitlist' && Boolean(notif.metadata?.waitlistId)
  const createdAtMs = notif.createdAt?.toMillis?.() ?? Date.now()
  const expiresAtMs = createdAtMs + 15 * 60 * 1000
  const timeLeft = Math.max(0, Math.floor((expiresAtMs - now) / 1000))
  const minutesLeftStr = String(Math.floor(timeLeft / 60))
  const secondsLeftStr = String(timeLeft % 60).padStart(2, '0')
  const isExpired = isWaitlist && timeLeft === 0

  const dateMs = notif.createdAt?.toMillis?.() ?? Date.now()
  const dateLabel = isToday(new Date(dateMs))
    ? format(new Date(dateMs), 'HH:mm', { locale: fr })
    : format(new Date(dateMs), 'd MMM', { locale: fr })

  const handleClick = () => {
    if (!isWaitlist) {
      if (!notif.read) onRead(notif.id)
      if (notif.actionUrl) navigate(notif.actionUrl)
    }
  }

  const handleAccept = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const waitlistId = notif.metadata?.waitlistId as string
    setProcessingId(waitlistId)
    try {
      await acceptWaitlistOffer(waitlistId, '10:00', 'b1')
      toast.success('Créneau accepté avec succès !')
      onRead(notif.id)
    } catch (err: unknown) {
      toast.error((err as Error).message || "Erreur lors de l'acceptation")
    } finally {
      setProcessingId(null)
    }
  }

  const handleDecline = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const waitlistId = notif.metadata?.waitlistId as string
    setProcessingId(waitlistId)
    try {
      await declineWaitlistOffer(waitlistId, new Date().toISOString().split('T')[0])
      toast.success('Créneau refusé.')
      onRead(notif.id)
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Erreur')
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onClick={handleClick}
      className={`relative overflow-hidden rounded-2xl border p-4 transition-all ${
        notif.read
          ? 'border-gray-100 bg-white shadow-sm'
          : 'border-accent/20 bg-accent/5 shadow-md'
      } ${!isWaitlist && notif.actionUrl ? 'cursor-pointer active:scale-[0.98]' : ''}`}
    >
      {/* Unread gold dot */}
      {!notif.read && (
        <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-accent" />
      )}

      <div className="flex gap-3">
        <div className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-50">
          {getIconForType(notif.type)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className={`font-heading text-sm font-semibold leading-snug ${notif.read ? 'text-primary' : 'text-accent'}`}>
              {notif.title}
            </h3>
            <span className="shrink-0 text-[11px] text-gray-400">{dateLabel}</span>
          </div>
          <p className="mt-1 text-sm text-gray-600 leading-relaxed">{notif.message}</p>

          {/* Waitlist Actions */}
          {isWaitlist && !notif.read && !isExpired && (
            <div className="mt-3 flex flex-col gap-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-danger">
                <Clock className="h-3.5 w-3.5" />
                Expire dans {minutesLeftStr}:{secondsLeftStr}
              </div>
              <div className="flex gap-2">
                <PrimaryButton
                  className="h-9 flex-1 text-xs"
                  isLoading={processingId === notif.metadata?.waitlistId}
                  onClick={handleAccept}
                >
                  Accepter
                </PrimaryButton>
                <GhostButton
                  className="h-9 flex-1 border border-danger/30 text-danger text-xs hover:bg-danger/5"
                  disabled={processingId !== null}
                  onClick={handleDecline}
                >
                  Refuser
                </GhostButton>
              </div>
            </div>
          )}
          {isWaitlist && isExpired && !notif.read && (
            <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-gray-400">
              <X className="h-3.5 w-3.5" /> Offre expirée
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

/* ─── Section Header ─────────────────────────────────────────────────────────── */
function SectionHeader({ title }: { title: string }) {
  return (
    <div className="sticky top-[57px] z-10 -mx-4 bg-background/90 px-4 py-2 backdrop-blur-sm">
      <p className="text-xs font-bold uppercase tracking-wider text-gray-400">{title}</p>
    </div>
  )
}

/* ─── Main Page ─────────────────────────────────────────────────────────────── */
const NotificationsPage: React.FC = () => {
  const navigate = useNavigate()
  const { notifications, unreadCount, isLoading, preferences, markAsRead, markAllAsRead, setPreference } =
    useNotificationContext()
  const [showPrefs, setShowPrefs] = useState(false)

  const grouped = useMemo(() => groupNotifications(notifications), [notifications])

  const handleMarkAll = async () => {
    await markAllAsRead()
    toast.success('Toutes les notifications marquées comme lues.')
  }

  return (
    <div className="flex min-h-screen flex-col bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white/80 px-4 py-3 backdrop-blur">
        <button
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100"
        >
          <ChevronLeft className="h-6 w-6 text-primary" />
        </button>
        <h1 className="font-heading text-xl font-bold text-primary">Notifications</h1>
        <button
          onClick={() => setShowPrefs(true)}
          className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100"
        >
          <Settings className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Action bar */}
      {unreadCount > 0 && (
        <div className="flex items-center justify-between border-b border-gray-100 bg-white px-4 py-2">
          <span className="text-sm font-medium text-gray-600">
            <span className="font-bold text-accent">{unreadCount}</span> non lues
          </span>
          <button
            onClick={handleMarkAll}
            className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-accent transition-colors"
          >
            <CheckCheck className="h-4 w-4" />
            Tout marquer comme lu
          </button>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 px-4 py-3">
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl bg-gray-100" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="Aucune notification"
            message="Vous êtes à jour ! Vos alertes apparaîtront ici."
          />
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="flex flex-col gap-3">
              {grouped.today.length > 0 && (
                <>
                  <SectionHeader title="Aujourd'hui" />
                  {grouped.today.map((n) => (
                    <NotifCard key={n.id} notif={n} onRead={markAsRead} navigate={navigate} />
                  ))}
                </>
              )}
              {grouped.yesterday.length > 0 && (
                <>
                  <SectionHeader title="Hier" />
                  {grouped.yesterday.map((n) => (
                    <NotifCard key={n.id} notif={n} onRead={markAsRead} navigate={navigate} />
                  ))}
                </>
              )}
              {grouped.earlier.length > 0 && (
                <>
                  <SectionHeader title="Plus ancien" />
                  {grouped.earlier.map((n) => (
                    <NotifCard key={n.id} notif={n} onRead={markAsRead} navigate={navigate} />
                  ))}
                </>
              )}
            </div>
          </AnimatePresence>
        )}
      </div>

      {/* Preferences Sheet */}
      <AnimatePresence>
        {showPrefs && (
          <PreferencesPanel
            preferences={preferences}
            setPreference={setPreference}
            onClose={() => setShowPrefs(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default NotificationsPage
