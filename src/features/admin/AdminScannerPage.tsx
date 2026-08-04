import React, { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Html5Qrcode } from 'html5-qrcode'
import {
  ChevronLeft,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  RefreshCcw,
  Gift,
  User as UserIcon,
  Scissors,
  Calendar,
  Clock,
  CreditCard,
  Star,
  Package,
  Loader2,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '@contexts/AuthContext'
import {
  fetchReservationByToken,
  validateAndCompleteReservation,
} from '@services/reservation.service'
import {
  validateLoyaltyRewardByToken,
  redeemLoyaltyReward,
} from '@services/loyalty.service'
import { getActiveServices, getActiveBarbers } from '@services/catalog.service'
import { getUserById } from '@services/auth.service'
import type {
  LoyaltyReward,
  Reservation,
  Barber,
  Service,
  User,
} from '@appTypes/models'

// ─── Types ─────────────────────────────────────────────────────────────────

type ScanStep = 'idle' | 'preview' | 'confirming' | 'done' | 'error'

interface PreviewData {
  token: string
  isLoyalty: boolean
  reservation?: Reservation
  customer?: User | null
  barber?: Barber | null
  service?: Service | null
  loyaltyReward?: LoyaltyReward
}

interface DoneData {
  isLoyalty: boolean
  isRewardGenerated?: boolean
  isSubscriptionUsed?: boolean
  loyaltyReward?: LoyaltyReward
  customer?: User | null
  service?: Service | null
  barber?: Barber | null
  reservation?: Reservation
}

// ─── Payment label helper ───────────────────────────────────────────────────

function getPaymentLabel(
  reservation: Reservation,
  isSubscriptionUsed: boolean,
): { label: string; color: string; icon: React.ReactNode } {
  if (reservation.rewardUsed) {
    return {
      label: 'Coupe gratuite (fidélité)',
      color: 'text-amber-400',
      icon: <Star className="h-4 w-4 text-amber-400" />,
    }
  }
  if (isSubscriptionUsed || reservation.subscriptionUsed) {
    return {
      label: "Inclus dans l'abonnement",
      color: 'text-blue-400',
      icon: <Package className="h-4 w-4 text-blue-400" />,
    }
  }
  return {
    label: 'Paiement normal',
    color: 'text-white/70',
    icon: <CreditCard className="h-4 w-4 text-white/70" />,
  }
}

// ─── Detail Row ─────────────────────────────────────────────────────────────

const Row: React.FC<{
  icon: React.ReactNode
  label: string
  value: string
  valueClass?: string
}> = ({ icon, label, value, valueClass = 'text-white' }) => (
  <div className="flex items-center gap-3">
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10">
      {icon}
    </div>
    <div>
      <p className="text-[11px] uppercase tracking-wider text-white/40">{label}</p>
      <p className={`text-sm font-semibold ${valueClass}`}>{value}</p>
    </div>
  </div>
)

// ─── Main Component ─────────────────────────────────────────────────────────

const AdminScannerPage: React.FC = () => {
  const navigate = useNavigate()
  const { adminUser } = useAuthContext()
  const scannerRef = useRef<Html5Qrcode | null>(null)

  const [step, setStep] = useState<ScanStep>('idle')
  const [preview, setPreview] = useState<PreviewData | null>(null)
  const [done, setDone] = useState<DoneData | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  const adminId = adminUser?.uid || 'mock-admin-id'

  // ── Start scanner ──────────────────────────────────────────────────────────
  const startScanner = useCallback(async () => {
    if (!document.getElementById('qr-reader')) return
    const html5QrCode =
      scannerRef.current ?? new Html5Qrcode('qr-reader')
    scannerRef.current = html5QrCode

    try {
      await html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: 250 },
        onScanSuccess,
        () => {},
      )
    } catch (err) {
      console.error('Scanner init failed', err)
      setErrorMsg('Impossible de démarrer la caméra. Vérifiez les permissions.')
      setStep('error')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    startScanner()
    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(console.error)
      }
    }
  }, [startScanner])

  // ── Step 1: QR detected → fetch preview (NO confirmation yet) ────────────
  const onScanSuccess = async (decodedText: string) => {
    if (scannerRef.current?.isScanning) {
      await scannerRef.current.stop()
      setIsScanning(false)
    }

    const isLoyalty = decodedText.startsWith('REWARD:')

    try {
      if (isLoyalty) {
        // For loyalty QR — validate (read-only check) and show preview
        const reward = await validateLoyaltyRewardByToken(decodedText)
        let customer: User | null = null
        try {
          customer = await getUserById(reward.customerId)
        } catch {
          // ignore
        }
        setPreview({ token: decodedText, isLoyalty: true, loyaltyReward: reward, customer })
        setStep('preview')
      } else {
        // For reservation QR — fetch details without completing
        const reservation = await fetchReservationByToken(decodedText)

        // Load supporting data in parallel
        const [barbers, services] = await Promise.all([
          getActiveBarbers(),
          getActiveServices(),
        ])
        const barber = barbers.find((b) => b.id === reservation.barberId) ?? null
        const service = services.find((s) => s.id === reservation.serviceId) ?? null

        let customer: User | null = null
        try {
          customer = await getUserById(reservation.customerId)
        } catch {
          /* non-fatal */
        }

        setPreview({ token: decodedText, isLoyalty: false, reservation, customer, barber, service })
        setStep('preview')
      }
    } catch (err: unknown) {
      const error = err as Error
      setErrorMsg(error.message || 'QR Code invalide.')
      setStep('error')
    }
  }

  // ── Step 2: Admin clicks "Confirmer" → complete the reservation ───────────
  const handleConfirm = async () => {
    if (!preview) return
    setStep('confirming')

    try {
      if (preview.isLoyalty && preview.loyaltyReward) {
        const reward = preview.loyaltyReward
        await redeemLoyaltyReward(reward.id, reward.customerId, adminId)
        setDone({ isLoyalty: true, loyaltyReward: reward, customer: preview.customer })
        setStep('done')
      } else {
        const { isRewardGenerated, isSubscriptionUsed, reservation } =
          await validateAndCompleteReservation(preview.token, adminId)
        setDone({
          isLoyalty: false,
          isRewardGenerated,
          isSubscriptionUsed,
          reservation,
          customer: preview.customer,
          barber: preview.barber,
          service: preview.service,
        })
        setStep('done')
      }
    } catch (err: unknown) {
      const error = err as Error
      setErrorMsg(error.message || 'Erreur lors de la confirmation.')
      setStep('error')
    }
  }

  // ── Reset ─────────────────────────────────────────────────────────────────
  const handleReset = async () => {
    setPreview(null)
    setDone(null)
    setErrorMsg('')
    setStep('idle')

    if (scannerRef.current) {
      try {
        await scannerRef.current.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: 250 },
          onScanSuccess,
          () => {},
        )
      } catch (err) {
        console.error('Restart failed', err)
      }
    }
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen flex-col bg-black text-white overflow-hidden">

      {/* Top Bar */}
      <div
        className="relative z-10 flex items-center justify-between px-4 py-4"
        style={{ paddingTop: `calc(1rem + env(safe-area-inset-top))` }}
      >
        <button
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="font-heading text-lg font-bold">Scanner QR</h1>
        <div className="h-10 w-10" />
      </div>

      {/* Content */}
      <div className="relative flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">

          {/* ── IDLE: Camera ── */}
          {step === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-6"
            >
              <div className="relative w-full max-w-sm">
                <div
                  id="qr-reader"
                  className="overflow-hidden rounded-2xl w-full bg-gray-900"
                />
              </div>
              <div className="text-center flex flex-col items-center gap-2">
                <QrCode className="h-6 w-6 text-accent" />
                <p className="text-sm text-white/70">Pointez la caméra vers le QR Code du client</p>
                <p className="text-xs text-white/40">Réservation · Fidélité</p>
              </div>
            </motion.div>
          )}

          {/* ── PREVIEW: Reservation details + Confirm button ── */}
          {(step === 'preview' || step === 'confirming') && preview && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ type: 'spring', stiffness: 280, damping: 26 }}
              className="flex flex-col items-center px-4 pt-2 pb-10"
            >
              <p className="text-xs uppercase tracking-widest text-accent/70 mb-3">
                QR Code détecté — vérifiez avant de confirmer
              </p>

              {/* Card */}
              <div className="w-full max-w-sm rounded-3xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm">

                {/* Header */}
                <div className="bg-accent/10 border-b border-accent/20 px-5 py-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-accent/70 mb-0.5">
                    {preview.isLoyalty ? 'Récompense Fidélité' : 'Réservation'}
                  </p>
                  <p className="font-heading text-lg font-bold text-white">
                    {preview.isLoyalty
                      ? '🏆 Coupe Gratuite'
                      : preview.service?.name ?? 'Service inconnu'}
                  </p>
                </div>

                {/* Body */}
                <div className="px-5 py-4 space-y-3.5">
                  {/* Customer */}
                  <Row
                    icon={<UserIcon className="h-4 w-4 text-white/70" />}
                    label="Client"
                    value={
                      preview.customer?.fullName ??
                      preview.loyaltyReward?.customerId ??
                      'Inconnu'
                    }
                  />
                  {preview.customer?.phoneNumber && (
                    <p className="-mt-2.5 ml-11 text-xs text-white/40">
                      {preview.customer.phoneNumber}
                    </p>
                  )}

                  {!preview.isLoyalty && preview.reservation && (
                    <>
                      <div className="border-t border-white/10" />
                      <Row
                        icon={<Scissors className="h-4 w-4 text-white/70" />}
                        label="Coiffeur"
                        value={preview.barber?.name ?? 'Inconnu'}
                      />
                      <div className="border-t border-white/10" />
                      <Row
                        icon={<Calendar className="h-4 w-4 text-white/70" />}
                        label="Date"
                        value={formatDate(preview.reservation.date)}
                      />
                      <div className="border-t border-white/10" />
                      <Row
                        icon={<Clock className="h-4 w-4 text-white/70" />}
                        label="Heure"
                        value={`${preview.reservation.startTime} – ${preview.reservation.endTime}`}
                      />
                      <div className="border-t border-white/10" />
                      {(() => {
                        const payment = getPaymentLabel(preview.reservation, false)
                        return (
                          <Row
                            icon={payment.icon}
                            label="Paiement"
                            value={payment.label}
                            valueClass={payment.color}
                          />
                        )
                      })()}
                    </>
                  )}

                  {preview.isLoyalty && (
                    <>
                      <div className="border-t border-white/10" />
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10">
                          <Gift className="h-4 w-4 text-accent" />
                        </div>
                        <div>
                          <p className="text-[11px] uppercase tracking-wider text-white/40">Type</p>
                          <p className="text-sm font-semibold text-accent">Coupe gratuite (fidélité)</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex w-full max-w-sm flex-col gap-3">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleConfirm}
                  disabled={step === 'confirming'}
                  className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-accent font-bold text-primary text-base shadow-lg disabled:opacity-60 transition-all"
                >
                  {step === 'confirming' ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Confirmation…
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-5 w-5" />
                      Confirmer
                    </>
                  )}
                </motion.button>

                <button
                  onClick={handleReset}
                  disabled={step === 'confirming'}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-white/10 text-sm font-medium text-white/70 disabled:opacity-40 transition-all hover:bg-white/15"
                >
                  <RefreshCcw className="h-4 w-4" />
                  Annuler et rescanner
                </button>
              </div>
            </motion.div>
          )}

          {/* ── DONE: Success result ── */}
          {step === 'done' && done && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              className="flex flex-col items-center px-4 pt-4 pb-10"
            >
              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.1 }}
                className={`mb-4 flex h-20 w-20 items-center justify-center rounded-full ${
                  done.isLoyalty ? 'bg-accent/20' : 'bg-green-500/20'
                }`}
              >
                {done.isLoyalty ? (
                  <Gift className="h-10 w-10 text-accent" />
                ) : (
                  <CheckCircle2 className="h-10 w-10 text-green-400" />
                )}
              </motion.div>

              <h2 className="font-heading text-2xl font-bold text-white mb-1">
                {done.isLoyalty ? 'Fidélité Validée !' : 'Réservation Confirmée !'}
              </h2>
              <p className="text-sm text-white/50 mb-6 text-center">
                {done.isLoyalty
                  ? 'La coupe gratuite a été accordée au client.'
                  : 'La réservation a été marquée comme terminée.'}
              </p>

              {/* Summary card */}
              <div className="w-full max-w-sm rounded-3xl overflow-hidden border border-white/10 bg-white/5">
                <div className="bg-accent/10 border-b border-accent/20 px-5 py-3">
                  <p className="font-heading text-base font-bold text-white">
                    {done.isLoyalty ? '🏆 Coupe Gratuite' : done.service?.name ?? 'Service'}
                  </p>
                </div>
                <div className="px-5 py-4 space-y-3.5">
                  {done.customer && (
                    <Row
                      icon={<UserIcon className="h-4 w-4 text-white/70" />}
                      label="Client"
                      value={done.customer.fullName}
                    />
                  )}
                  {!done.isLoyalty && done.barber && (
                    <>
                      <div className="border-t border-white/10" />
                      <Row
                        icon={<Scissors className="h-4 w-4 text-white/70" />}
                        label="Coiffeur"
                        value={done.barber.name}
                      />
                    </>
                  )}
                  {!done.isLoyalty && done.reservation && (
                    <>
                      <div className="border-t border-white/10" />
                      <Row
                        icon={<Calendar className="h-4 w-4 text-white/70" />}
                        label="Date"
                        value={formatDate(done.reservation.date)}
                      />
                      <div className="border-t border-white/10" />
                      <Row
                        icon={<Clock className="h-4 w-4 text-white/70" />}
                        label="Heure"
                        value={`${done.reservation.startTime} – ${done.reservation.endTime}`}
                      />
                    </>
                  )}
                  {!done.isLoyalty && done.reservation && (
                    <>
                      <div className="border-t border-white/10" />
                      {(() => {
                        const payment = getPaymentLabel(done.reservation, done.isSubscriptionUsed ?? false)
                        return (
                          <Row
                            icon={payment.icon}
                            label="Paiement"
                            value={payment.label}
                            valueClass={payment.color}
                          />
                        )
                      })()}
                    </>
                  )}
                </div>

                {/* Extra badges */}
                {(done.isRewardGenerated || done.isSubscriptionUsed) && (
                  <div className="border-t border-white/10 px-5 py-3 space-y-2">
                    {done.isRewardGenerated && (
                      <div className="flex items-center gap-2 rounded-xl bg-accent/10 border border-accent/20 px-3 py-2">
                        <Star className="h-4 w-4 text-accent shrink-0" />
                        <p className="text-xs font-semibold text-accent">
                          🎁 Récompense fidélité débloquée !
                        </p>
                      </div>
                    )}
                    {done.isSubscriptionUsed && (
                      <div className="flex items-center gap-2 rounded-xl bg-blue-500/10 border border-blue-500/20 px-3 py-2">
                        <Package className="h-4 w-4 text-blue-400 shrink-0" />
                        <p className="text-xs font-semibold text-blue-400">
                          💳 Séance déduite de l'abonnement
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={handleReset}
                className="mt-8 flex h-14 items-center gap-2 rounded-2xl bg-white/10 px-8 font-semibold text-white transition-all hover:bg-white/15 active:scale-95"
              >
                <RefreshCcw className="h-5 w-5" /> Scanner un autre
              </button>
            </motion.div>
          )}

          {/* ── ERROR ── */}
          {step === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/20"
              >
                <AlertTriangle className="h-10 w-10 text-red-400" />
              </motion.div>
              <h2 className="font-heading text-xl font-bold text-white mb-2">Erreur</h2>
              <p className="text-sm text-white/70 max-w-xs whitespace-pre-line">{errorMsg}</p>
              <button
                onClick={handleReset}
                className="mt-10 flex h-14 items-center gap-2 rounded-2xl bg-white/10 px-8 font-semibold text-white transition-all hover:bg-white/15 active:scale-95"
              >
                <RefreshCcw className="h-5 w-5" /> Réessayer
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}

export default AdminScannerPage
