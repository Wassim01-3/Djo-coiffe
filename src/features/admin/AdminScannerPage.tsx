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
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '@contexts/AuthContext'
import { validateAndCompleteReservation } from '@services/reservation.service'
import {
  validateLoyaltyRewardByToken,
  redeemLoyaltyReward,
} from '@services/loyalty.service'
import type { LoyaltyReward } from '@appTypes/models'

type ScanStatus = 'idle' | 'success' | 'error'
type ScanType = 'reservation' | 'loyalty'

interface ScanResultState {
  status: ScanStatus
  message: string
  type?: ScanType
  isRewardGenerated?: boolean
  loyaltyReward?: LoyaltyReward
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
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1,
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

    // Detect QR type: loyalty rewards are prefixed with "REWARD:"
    const isLoyaltyQr = decodedText.startsWith('REWARD:')

    if (isLoyaltyQr) {
      await handleLoyaltyQr(decodedText)
    } else {
      await handleReservationQr(decodedText)
    }
  }

  const handleReservationQr = async (token: string) => {
    try {
      const { isRewardGenerated, isSubscriptionUsed } =
        await validateAndCompleteReservation(token, adminId)

      const extras: string[] = []
      if (isRewardGenerated) extras.push('🎁 Récompense fidélité débloquée !')
      if (isSubscriptionUsed) extras.push('💳 Abonnement utilisé.')

      setScanResult({
        status: 'success',
        type: 'reservation',
        message:
          extras.length > 0
            ? `Réservation validée !\n\n${extras.join('\n')}`
            : 'Réservation terminée avec succès.',
        isRewardGenerated,
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
      // Validate the loyalty reward
      const reward = await validateLoyaltyRewardByToken(token)

      // Redeem it
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
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1,
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

  return (
    <div className="flex h-screen flex-col bg-black text-white">
      {/* Top Bar */}
      <div className="relative z-10 flex items-center justify-between px-4 py-4">
        <button
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="font-heading text-lg font-bold">Scanner QR</h1>
        <div className="h-10 w-10" />
      </div>

      {/* Scanner View */}
      <div className="relative flex-1 bg-black">
        <AnimatePresence mode="wait">
          {scanResult.status === 'idle' ? (
            <motion.div
              key="scanner"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center"
            >
              <div
                id="qr-reader"
                className="overflow-hidden rounded-3xl w-full max-w-sm aspect-square bg-gray-900"
              />
              <div className="mt-8 text-center text-white/70 flex flex-col items-center gap-2">
                <QrCode className="h-8 w-8 text-white/40" />
                <p>Pointez la caméra vers le QR Code du client</p>
                <p className="text-xs text-white/40">
                  Fonctionne avec les QR de réservation et de fidélité
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center"
            >
              {scanResult.status === 'success' ? (
                <>
                  {/* Success icon — loyalty gets gold, reservation gets green */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className={`mb-6 flex h-24 w-24 items-center justify-center rounded-full ${
                      scanResult.type === 'loyalty'
                        ? 'bg-accent/20'
                        : 'bg-success/20'
                    }`}
                  >
                    {scanResult.type === 'loyalty' ? (
                      <Gift className="h-12 w-12 text-accent" />
                    ) : (
                      <CheckCircle2 className="h-12 w-12 text-success" />
                    )}
                  </motion.div>

                  <h2 className="font-heading text-2xl font-bold text-white mb-3">
                    {scanResult.type === 'loyalty' ? 'Fidélité Validée !' : 'Validé !'}
                  </h2>
                  <p className="text-white/80 whitespace-pre-line leading-relaxed">
                    {scanResult.message}
                  </p>

                  {/* Badge for loyalty */}
                  {scanResult.type === 'loyalty' && (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="mt-6 rounded-2xl border border-accent/30 bg-accent/10 px-6 py-4"
                    >
                      <p className="text-sm text-accent font-semibold">
                        🏆 Coupe gratuite accordée au client
                      </p>
                    </motion.div>
                  )}

                  {/* Badge for reward earned */}
                  {scanResult.type === 'reservation' && scanResult.isRewardGenerated && (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="mt-6 rounded-2xl border border-accent/30 bg-accent/10 px-6 py-4"
                    >
                      <p className="text-sm text-accent font-semibold">
                        🎁 Le client a débloqué une récompense fidélité !
                      </p>
                    </motion.div>
                  )}
                </>
              ) : (
                <>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-danger/20"
                  >
                    <AlertTriangle className="h-12 w-12 text-danger" />
                  </motion.div>
                  <h2 className="font-heading text-2xl font-bold text-white mb-2">
                    Erreur
                  </h2>
                  <p className="text-white/80 whitespace-pre-line">
                    {scanResult.message}
                  </p>
                </>
              )}

              <button
                onClick={restartScanner}
                className="mt-12 flex h-14 items-center gap-2 rounded-2xl bg-white/10 px-8 font-semibold text-white backdrop-blur transition-all active:scale-95"
              >
                <RefreshCcw className="h-5 w-5" /> Scanner un autre
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Decorative scanning line */}
      {isScanning && (
        <div className="pointer-events-none absolute inset-0 z-0">
          <div className="absolute left-0 right-0 h-1 bg-accent shadow-[0_0_15px_rgba(197,157,95,0.8)] animate-[scan_2s_ease-in-out_infinite_alternate]" />
        </div>
      )}

      <style>{`
        @keyframes scan {
          0%  { top: 20%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100%{ top: 80%; opacity: 0; }
        }
      `}</style>
    </div>
  )
}

export default AdminScannerPage
