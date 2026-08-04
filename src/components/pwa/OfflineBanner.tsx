import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WifiOff, RefreshCw } from 'lucide-react'

/**
 * OfflineBanner
 * Detects network connectivity changes and shows a persistent banner
 * when the user goes offline. Auto-dismisses when back online.
 */
const OfflineBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [justCameBack, setJustCameBack] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setJustCameBack(true)
      // Brief "back online" flash then auto-hide
      const t = setTimeout(() => setJustCameBack(false), 3000)
      return () => clearTimeout(t)
    }
    const handleOffline = () => {
      setIsOnline(false)
      setJustCameBack(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const showBanner = !isOnline || justCameBack

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={`fixed left-0 right-0 top-0 z-[9999] flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white shadow-lg ${
            justCameBack ? 'bg-success' : 'bg-gray-800'
          }`}
          role="alert"
          aria-live="polite"
        >
          {justCameBack ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Connexion rétablie
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4" />
              Vous êtes hors ligne — Certaines fonctionnalités sont limitées
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default OfflineBanner
