import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, X, Smartphone, CheckCircle } from 'lucide-react'
import { useSettingsContext } from '@contexts/SettingsContext'

const BANNER_DISMISSED_KEY = 'djo_apk_install_dismissed'

/** Detects Android browser (NOT the installed APK / standalone mode) */
const isAndroidBrowser = (): boolean => {
  const ua = navigator.userAgent
  const isAndroid = /android/i.test(ua)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isStandalone = (navigator as any).standalone === true || window.matchMedia('(display-mode: standalone)').matches
  return isAndroid && !isStandalone
}

/**
 * AndroidApkInstallBanner
 *
 * Shown to users visiting the webapp on an Android browser (Chrome, Firefox, etc.)
 * Prompts them to download and install the native APK for a better experience.
 * The APK download URL is fetched from the admin-configured settings in Firestore.
 *
 * Hidden if:
 * - User is on iOS (IosInstallPrompt handles iOS)
 * - User is NOT on Android browser (desktop, already installed APK, etc.)
 * - APK URL is not configured in admin settings
 * - User has previously dismissed it
 */
const PwaInstallBanner: React.FC = () => {
  const { settings } = useSettingsContext()
  const [isVisible, setIsVisible] = useState(false)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    const dismissed = localStorage.getItem(BANNER_DISMISSED_KEY)
    if (dismissed) return
    if (!isAndroidBrowser()) return

    // Wait for settings to load and APK URL to be available
    if (!settings.androidApkUrl) return

    // Show after a short delay to not interrupt initial load
    const t = setTimeout(() => setIsVisible(true), 3000)
    return () => clearTimeout(t)
  }, [settings.androidApkUrl])

  const handleDownload = () => {
    if (!settings.androidApkUrl) return
    setDownloading(true)
    // Trigger the APK download
    const link = document.createElement('a')
    link.href = settings.androidApkUrl
    link.download = 'djo-coiffe.apk'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // After a short delay, dismiss the banner
    setTimeout(() => {
      localStorage.setItem(BANNER_DISMISSED_KEY, 'true')
      setIsVisible(false)
    }, 2000)
  }

  const handleDismiss = () => {
    localStorage.setItem(BANNER_DISMISSED_KEY, 'true')
    setIsVisible(false)
  }

  if (!settings.androidApkUrl) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9990] bg-black/50 backdrop-blur-sm"
            onClick={handleDismiss}
          />

          {/* Bottom sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[9991] mx-auto max-w-md rounded-t-3xl bg-white px-6 pb-10 pt-5 shadow-2xl"
          >
            {/* Handle bar */}
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-gray-200" />

            {/* Header */}
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-md">
                  <Smartphone className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-heading text-base font-bold text-primary">Application Android</p>
                  <p className="text-xs text-gray-500">Meilleure expérience garantie</p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                aria-label="Fermer"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Benefits */}
            <div className="mb-6 space-y-3 rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Pourquoi installer l'app ?</p>

              {[
                'Notifications push en temps réel',
                'Accès rapide depuis l\'écran d\'accueil',
                'Expérience fluide et optimisée',
              ].map((benefit, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 shrink-0 text-green-500" />
                  <p className="text-sm text-gray-700">{benefit}</p>
                </div>
              ))}
            </div>

            {/* Steps hint */}
            <div className="mb-5 rounded-xl bg-amber-50 border border-amber-100 px-4 py-3">
              <p className="text-xs text-amber-700 leading-relaxed">
                <span className="font-bold">Comment installer :</span> Téléchargez le fichier APK, ouvrez-le depuis vos notifications ou le gestionnaire de fichiers, puis appuyez sur <span className="font-semibold">«&nbsp;Installer&nbsp;»</span>.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-white shadow transition-opacity hover:opacity-90 disabled:opacity-70"
              >
                {downloading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                    />
                    Téléchargement en cours…
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Télécharger l'application
                  </>
                )}
              </button>
              <button
                onClick={handleDismiss}
                className="w-full rounded-2xl py-3 text-sm font-medium text-gray-400 transition-colors hover:text-gray-600"
              >
                Continuer dans le navigateur
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default PwaInstallBanner
