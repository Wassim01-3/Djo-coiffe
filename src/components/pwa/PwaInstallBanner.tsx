import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const BANNER_DISMISSED_KEY = 'djo_pwa_install_dismissed'

/**
 * PwaInstallBanner
 * Captures the browser's `beforeinstallprompt` event (Chrome/Android/Edge)
 * and shows a bottom install banner. Hidden on iOS (IosInstallPrompt handles it).
 */
const PwaInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const dismissed = localStorage.getItem(BANNER_DISMISSED_KEY)
    if (dismissed) return

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsVisible(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const result = await deferredPrompt.userChoice
    if (result.outcome === 'accepted') {
      setIsVisible(false)
      setDeferredPrompt(null)
    }
  }

  const handleDismiss = () => {
    localStorage.setItem(BANNER_DISMISSED_KEY, 'true')
    setIsVisible(false)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-20 left-0 right-0 z-[9980] mx-auto max-w-md px-4"
        >
          <div className="flex items-center gap-3 rounded-2xl bg-primary px-4 py-3.5 shadow-2xl">
            {/* App icon */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent">
              <span className="font-heading text-sm font-bold text-primary">D</span>
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white leading-snug">Installer Djo Coiffe</p>
              <p className="text-[11px] text-white/60">Accès rapide depuis votre écran d'accueil</p>
            </div>

            {/* Install button */}
            <button
              onClick={handleInstall}
              className="flex shrink-0 items-center gap-1.5 rounded-xl bg-accent px-3 py-2 text-xs font-bold text-primary transition-opacity hover:opacity-90"
            >
              <Download className="h-3.5 w-3.5" />
              Installer
            </button>

            {/* Dismiss */}
            <button
              onClick={handleDismiss}
              aria-label="Ignorer"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-white/20 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default PwaInstallBanner
