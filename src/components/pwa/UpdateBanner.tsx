import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, Sparkles } from 'lucide-react'

/**
 * UpdateBanner
 *
 * Listens for service worker updates via the PWA plugin's virtual module.
 * When a new version is available, shows a banner prompting the user to refresh.
 *
 * Uses a manual registration check rather than the vite-plugin-pwa hook
 * to avoid requiring the virtual:pwa-register module at compile time
 * (it only exists after vite-plugin-pwa processes the build).
 */
const UpdateBanner: React.FC = () => {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    // Listen for a new service worker becoming available
    navigator.serviceWorker.ready.then((reg) => {
      setRegistration(reg)

      // New SW waiting — update available
      if (reg.waiting) {
        setIsUpdateAvailable(true)
      }

      const handleUpdate = (r: ServiceWorkerRegistration) => {
        if (r.waiting) {
          setIsUpdateAvailable(true)
          setRegistration(r)
        }
      }

      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing
        newWorker?.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setIsUpdateAvailable(true)
          }
        })
      })

      void handleUpdate
    })
  }, [])

  const handleUpdate = () => {
    if (!registration?.waiting) {
      window.location.reload()
      return
    }
    // Tell waiting SW to take control
    registration.waiting.postMessage({ type: 'SKIP_WAITING' })
    // Reload once the new SW activates
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload()
    })
  }

  return (
    <AnimatePresence>
      {isUpdateAvailable && (
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed left-0 right-0 top-0 z-[9995] mx-auto max-w-md px-4 pt-2"
        >
          <div className="flex items-center gap-3 rounded-2xl bg-accent px-4 py-3 shadow-2xl">
            <Sparkles className="h-5 w-5 shrink-0 text-primary" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-primary leading-snug">Mise à jour disponible</p>
              <p className="text-[11px] text-primary/70">Une nouvelle version de l'app est prête</p>
            </div>
            <button
              onClick={handleUpdate}
              className="flex shrink-0 items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-white transition-opacity hover:opacity-90"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Actualiser
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default UpdateBanner
