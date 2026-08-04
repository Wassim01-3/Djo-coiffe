import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Html5Qrcode } from 'html5-qrcode'
import {
  ChevronLeft,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  RefreshCcw,
  Gift,
  User,
  Scissors,
  Calendar,
  Clock,
  CreditCard,
  Star,
  Package,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '@contexts/AuthContext'
import { validateAndCompleteReservation } from '@services/reservation.service'
import {
  validateLoyaltyRewardByToken,
  redeemLoyaltyReward,
} from '@services/loyalty.service'
import { getActiveServices, getActiveBarbers } from '@services/catalog.service'
import { getUserById } from '@services/auth.service'
import type { LoyaltyReward, Reservation, Barber, Service, User } from '@appTypes/models'

type ScanStatus = 'idle' | 'success' | 'error'
type ScanType = 'reservation' | 'loyalty'

interface ReservationScanDetails {
  reservation: Reservation
  customer: User | null
  barber: Barber | null
  service: Service | null
  isRewardGenerated: boolean
  isSubscriptionUsed: boolean
}

interface ScanResultState {
  status: ScanStatus
  message: string
  type?: ScanType
  details?: ReservationScanDetails
  loyaltyReward?: LoyaltyReward
}

/** Determine payment label based on scan result flags */
function getPaymentLabel(details: ReservationScanDetails): {
  label: string
  color: string
  icon: React.ReactNode
} {
  if (details.reservation.rewardUsed) {
    return {
      label: 'Coupe gratuite (fidélité)',
      color: 'text-amber-400',
      icon: <Star className="h-4 w-4 text-amber-400" />,
    }
  }
  if (details.isSubscriptionUsed || details.reservation.subscriptionUsed) {
    return {
      label: 'Inclus dans l\'abonnement',
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

const AdminScannerPage: React.FC = () => {
  const navigate = useNavigate()
  const { adminUser } = useAuthContext()
  const scannerRef = useRef<Html5Qrcode | null>(null)

  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState<ScanResultState>({
    status: 'idle',
    message: '',
  })

  const adminId = adminUser?.uid || 'mock-admin-id'

  useEffect(() => {
    const initScanner = async () => {
      if (!document.getElementById('qr-reader')) return

      const html5QrCode = new Html5Qrcode('qr-reader')
      scannerRef.current = html5QrCode

      try {
        await html5QrCode.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            // Rectangular frame — wider than tall like a standard QR
            qrbox: { width: 280, height: 220 },
            aspectRatio: 1.7778, // 16:9 landscape
          },
          onScanSuccess,
          () => {}, // ignore per-frame failures
        )
        setIsScanning(true)
      } catch (err) {
        console.error('Scanner init failed', err)
        setScanResult({
          status: 'error',
          message: 'Impossible de démarrer la caméra. Vérifiez les permissions.',
        })
      }
    }

    initScanner()

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onScanSuccess = async (decodedText: string) => {
    // Stop scanning immediately to prevent duplicate scans
    if (scannerRef.current?.isScanning) {
      await scannerRef.current.stop()
      setIsScanning(false)
    }

    const isLoyaltyQr = decodedText.startsWith('REWARD:')

    if (isLoyaltyQr) {
      await handleLoyaltyQr(decodedText)
    } else {
      await handleReservationQr(decodedText)
    }
  }

  const handleReservationQr = async (token: string) => {
    try {
      const { reservation, isRewardGenerated, isSubscriptionUsed } =
        await validateAndCompleteReservation(token, adminId)

      // Load barber, service, and customer in parallel
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
        // non-fatal
      }

      setScanResult({
        status: 'success',
        type: 'reservation',
        message: 'Réservation validée avec succès.',
        details: {
          reservation,
          customer,
          barber,
          service,
          isRewardGenerated,
          isSubscriptionUsed,
        },
      })
    } catch (err: unknown) {
      const error = err as Error
      setScanResult({
        status: 'error',
        message: error.message || 'QR Code invalide.',
      })
    }
  }

  const handleLoyaltyQr = async (token: string) => {
    try {
      const reward = await validateLoyaltyRewardByToken(token)
      await redeemLoyaltyReward(reward.id, reward.customerId, adminId)

      setScanResult({
        status: 'success',
        type: 'loyalty',
        message: 'Récompense fidélité validée ! Coupe gratuite accordée.',
        loyaltyReward: reward,
      })
    } catch (err: unknown) {
      const error = err as Error
      setScanResult({
        status: 'error',
        message: error.message || 'QR fidélité invalide.',
      })
    }
  }

  const restartScanner = async () => {
    setScanResult({ status: 'idle', message: '' })
    if (scannerRef.current) {
      try {
        await scannerRef.current.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 280, height: 220 },
            aspectRatio: 1.7778,
          },
          onScanSuccess,
          () => {},
        )
        setIsScanning(true)
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

  return (
    <div className="flex h-screen flex-col bg-black text-white overflow-hidden">
      {/* Top Bar */}
      <div
        className="relative z-10 flex items-center justify-between px-4 py-4"
        style={{ paddingTop: `calc(1rem + env(safe-area-inset-top))` }}
      >
        <button
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="font-heading text-lg font-bold">Scanner QR</h1>
        <div className="h-10 w-10" />
      </div>

      {/* Scanner / Result Area */}
      <div className="relative flex-1">
        <AnimatePresence mode="wait">

          {/* ── IDLE: Camera View ── */}
          {scanResult.status === 'idle' && (
            <motion.div
              key="scanner"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-6"
            >
              {/* The html5-qrcode video target */}
              <div className="relative w-full max-w-sm">
                <div
                  id="qr-reader"
                  className="overflow-hidden rounded-2xl w-full bg-gray-900"
                  style={{ aspectRatio: '16/9' }}
                />

                {/* Rectangular corner brackets overlay */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="relative" style={{ width: '70%', aspectRatio: '280/220' }}>
                    {/* Top-left */}
                    <span className="absolute top-0 left-0 h-7 w-7 border-t-4 border-l-4 border-accent rounded-tl-md" />
                    {/* Top-right */}
                    <span className="absolute top-0 right-0 h-7 w-7 border-t-4 border-r-4 border-accent rounded-tr-md" />
                    {/* Bottom-left */}
                    <span className="absolute bottom-0 left-0 h-7 w-7 border-b-4 border-l-4 border-accent rounded-bl-md" />
                    {/* Bottom-right */}
                    <span className="absolute bottom-0 right-0 h-7 w-7 border-b-4 border-r-4 border-accent rounded-br-md" />

                    {/* Animated scanning line */}
                    {isScanning && (
                      <motion.div
                        className="absolute left-1 right-1 h-0.5 bg-accent shadow-[0_0_12px_rgba(197,157,95,0.9)]"
                        animate={{ top: ['5%', '90%'] }}
                        transition={{
                          duration: 2,
                          ease: 'easeInOut',
                          repeat: Infinity,
                          repeatType: 'reverse',
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="text-center text-white/70 flex flex-col items-center gap-2">
                <QrCode className="h-6 w-6 text-accent" />
                <p className="text-sm">Pointez la caméra vers le QR Code du client</p>
                <p className="text-xs text-white/40">
                  Fonctionne avec les QR de réservation et de fidélité
                </p>
              </div>
            </motion.div>
          )}

          {/* ── RESULT: Success or Error Card ── */}
          {scanResult.status !== 'idle' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="absolute inset-0 flex flex-col items-center justify-start pt-4 pb-8 px-4 overflow-y-auto"
            >
              {/* ── SUCCESS ── */}
              {scanResult.status === 'success' && (
                <>
                  {/* Status Icon */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className={`mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
                      scanResult.type === 'loyalty' ? 'bg-accent/20' : 'bg-green-500/20'
                    }`}
                  >
                    {scanResult.type === 'loyalty' ? (
                      <Gift className="h-8 w-8 text-accent" />
                    ) : (
                      <CheckCircle2 className="h-8 w-8 text-green-400" />
                    )}
                  </motion.div>

                  <h2 className="font-heading text-xl font-bold text-white mb-1">
                    {scanResult.type === 'loyalty' ? 'Fidélité Validée !' : 'Réservation Validée !'}
                  </h2>
                  <p className="text-sm text-white/60 mb-5">{scanResult.message}</p>

                  {/* ── Reservation Detail Card ── */}
                  {scanResult.type === 'reservation' && scanResult.details && (() => {
                    const { details } = scanResult
                    const payment = getPaymentLabel(details)
                    return (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="w-full max-w-sm rounded-3xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm"
                      >
                        {/* Card Header */}
                        <div className="bg-accent/10 border-b border-accent/20 px-5 py-4">
                          <p className="text-xs font-semibold uppercase tracking-widest text-accent/70 mb-1">
                            Détails de la réservation
                          </p>
                          <p className="font-heading text-lg font-bold text-white">
                            {details.service?.name ?? 'Service inconnu'}
                          </p>
                        </div>

                        {/* Card Body */}
                        <div className="px-5 py-4 space-y-3.5">
                          {/* Customer */}
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                              <User className="h-4 w-4 text-white/70" />
                            </div>
                            <div>
                              <p className="text-[11px] text-white/40 uppercase tracking-wider">Client</p>
                              <p className="text-sm font-semibold text-white">
                                {details.customer?.fullName ?? 'Client inconnu'}
                              </p>
                              {details.customer?.phoneNumber && (
                                <p className="text-xs text-white/50">{details.customer.phoneNumber}</p>
                              )}
                            </div>
                          </div>

                          <div className="border-t border-white/10" />

                          {/* Barber */}
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                              <Scissors className="h-4 w-4 text-white/70" />
                            </div>
                            <div>
                              <p className="text-[11px] text-white/40 uppercase tracking-wider">Coiffeur</p>
                              <p className="text-sm font-semibold text-white">
                                {details.barber?.name ?? 'Coiffeur inconnu'}
                              </p>
                            </div>
                          </div>

                          <div className="border-t border-white/10" />

                          {/* Date */}
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                              <Calendar className="h-4 w-4 text-white/70" />
                            </div>
                            <div>
                              <p className="text-[11px] text-white/40 uppercase tracking-wider">Date</p>
                              <p className="text-sm font-semibold text-white capitalize">
                                {formatDate(details.reservation.date)}
                              </p>
                            </div>
                          </div>

                          <div className="border-t border-white/10" />

                          {/* Time */}
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                              <Clock className="h-4 w-4 text-white/70" />
                            </div>
                            <div>
                              <p className="text-[11px] text-white/40 uppercase tracking-wider">Heure</p>
                              <p className="text-sm font-semibold text-white">
                                {details.reservation.startTime} – {details.reservation.endTime}
                              </p>
                            </div>
                          </div>

                          <div className="border-t border-white/10" />

                          {/* Payment */}
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                              {payment.icon}
                            </div>
                            <div>
                              <p className="text-[11px] text-white/40 uppercase tracking-wider">Paiement</p>
                              <p className={`text-sm font-semibold ${payment.color}`}>
                                {payment.label}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Extra badges */}
                        {(details.isRewardGenerated || details.isSubscriptionUsed) && (
                          <div className="border-t border-white/10 px-5 py-3 space-y-2">
                            {details.isRewardGenerated && (
                              <div className="flex items-center gap-2 rounded-xl bg-accent/10 border border-accent/20 px-3 py-2">
                                <Star className="h-4 w-4 text-accent shrink-0" />
                                <p className="text-xs font-semibold text-accent">
                                  🎁 Récompense fidélité débloquée !
                                </p>
                              </div>
                            )}
                            {details.isSubscriptionUsed && (
                              <div className="flex items-center gap-2 rounded-xl bg-blue-500/10 border border-blue-500/20 px-3 py-2">
                                <Package className="h-4 w-4 text-blue-400 shrink-0" />
                                <p className="text-xs font-semibold text-blue-400">
                                  💳 Séance déduite de l'abonnement
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </motion.div>
                    )
                  })()}

                  {/* ── Loyalty Card ── */}
                  {scanResult.type === 'loyalty' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                      className="w-full max-w-sm rounded-3xl border border-accent/30 bg-accent/10 px-6 py-5 text-center"
                    >
                      <p className="text-2xl mb-2">🏆</p>
                      <p className="text-base font-bold text-accent">Coupe gratuite accordée</p>
                      <p className="text-sm text-white/60 mt-1">
                        Le client a utilisé sa récompense fidélité.
                      </p>
                    </motion.div>
                  )}
                </>
              )}

              {/* ── ERROR ── */}
              {scanResult.status === 'error' && (
                <>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20"
                  >
                    <AlertTriangle className="h-8 w-8 text-red-400" />
                  </motion.div>
                  <h2 className="font-heading text-xl font-bold text-white mb-2">Erreur</h2>
                  <p className="text-center text-white/70 text-sm max-w-xs whitespace-pre-line">
                    {scanResult.message}
                  </p>
                </>
              )}

              {/* Restart Button */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                onClick={restartScanner}
                className="mt-8 flex h-14 items-center gap-2 rounded-2xl bg-white/10 px-8 font-semibold text-white backdrop-blur transition-all active:scale-95 hover:bg-white/15"
              >
                <RefreshCcw className="h-5 w-5" /> Scanner un autre
              </motion.button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}

export default AdminScannerPage
