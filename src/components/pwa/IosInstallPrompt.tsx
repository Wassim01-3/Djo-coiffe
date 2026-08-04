import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Share, Plus } from 'lucide-react'

const IOS_PROMPT_KEY = 'djo_ios_prompt_dismissed'

/** Detects if running on iOS Safari (not in standalone mode) */
const isIosSafari = (): boolean => {
  const ua = navigator.userAgent
  const isIos = /iphone|ipad|ipod/i.test(ua)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isStandalone = (navigator as any).standalone === true
  const isSafari = /safari/i.test(ua) && !/chrome|crios|fxios/i.test(ua)
  return isIos && isSafari && !isStandalone
}

/**
 * IosInstallPrompt
 * Shows an elegant bottom sheet on iOS Safari guiding the user
 * through the Add to Home Screen flow.
 * Respects "Don't show again" preference stored in localStorage.
 */
const IosInstallPrompt: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Show after a short delay so it doesn't interrupt initial load
    const dismissed = localStorage.getItem(IOS_PROMPT_KEY)
    if (!dismissed && isIosSafari()) {
      const t = setTimeout(() => setIsVisible(true), 2500)
      return () => clearTimeout(t)
    }
  }, [])

  const handleDismiss = () => setIsVisible(false)

  const handleDontShowAgain = () => {
    localStorage.setItem(IOS_PROMPT_KEY, 'true')
    setIsVisible(false)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9990] bg-black/40 backdrop-blur-sm"
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
            {/* Handle */}
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-gray-200" />

            {/* Header */}
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-md">
                  <span className="font-heading text-lg font-bold text-accent">D</span>
                </div>
                <div>
                  <p className="font-heading text-base font-bold text-primary">Installer Djo Coiffe</p>
                  <p className="text-xs text-gray-500">Application gratuite</p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                aria-label="Fermer"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Steps */}
            <div className="mb-6 space-y-4 rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">3 étapes simples</p>

              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary">
                  <span className="text-[11px] font-bold text-white">1</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-primary">Appuyez sur Partager</p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                    Icône <Share className="inline h-3.5 w-3.5" /> dans la barre Safari
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary">
                  <span className="text-[11px] font-bold text-white">2</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-primary">Sur l'écran d'accueil</p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                    Choisissez <Plus className="inline h-3.5 w-3.5" />&nbsp;«&nbsp;Sur l'écran d'accueil&nbsp;»
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent">
                  <span className="text-[11px] font-bold text-primary">3</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-primary">Lancez l'application</p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    Ouvrez Djo Coiffe depuis votre écran d'accueil
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <button
                onClick={handleDismiss}
                className="w-full rounded-2xl bg-primary py-3.5 text-sm font-bold text-white shadow transition-opacity hover:opacity-90"
              >
                Compris
              </button>
              <button
                onClick={handleDontShowAgain}
                className="w-full rounded-2xl py-3 text-sm font-medium text-gray-400 transition-colors hover:text-gray-600"
              >
                Ne plus afficher
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default IosInstallPrompt
