import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X } from 'lucide-react'
import { PrimaryButton } from '@components/buttons/PrimaryButton'
import { GhostButton } from '@components/buttons/GhostButton'
import { requestPushPermission } from '@services/push.service'
import { useAuthContext } from '@contexts/AuthContext'

export const PushNotificationPrompt: React.FC = () => {
  const { customer } = useAuthContext()
  const [isVisible, setIsVisible] = useState(false)
  const [isRequesting, setIsRequesting] = useState(false)

  useEffect(() => {
    // Only check once customer is loaded
    if (!customer?.id) return

    // 1. Check if they are running in standalone mode (PWA/Home Screen)
    // Sometimes iOS requires specifically checking navigator.standalone as well
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true
    
    // 2. Check if we've already prompted them
    const hasPrompted = localStorage.getItem('hasPromptedForPush')

    // 3. Check native permission status (don't prompt if already granted or denied)
    const permission = Notification.permission

    if (isStandalone && !hasPrompted && permission === 'default') {
      // Delay prompt slightly for better UX
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [customer?.id])

  const handleDismiss = () => {
    localStorage.setItem('hasPromptedForPush', 'true')
    setIsVisible(false)
  }

  const handleAccept = async () => {
    if (!customer?.id) return
    setIsRequesting(true)
    
    try {
      // This will trigger the native OS prompt
      await requestPushPermission(customer.id)
    } catch (err) {
      console.error('Push permission error:', err)
    } finally {
      // Always mark as prompted so we don't ask again
      localStorage.setItem('hasPromptedForPush', 'true')
      setIsVisible(false)
      setIsRequesting(false)
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-[80px] left-4 right-4 z-50 overflow-hidden rounded-2xl bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100"
        >
          <button
            onClick={handleDismiss}
            className="absolute right-3 top-3 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
          
          <div className="flex items-start gap-4 mb-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent/10">
              <Bell className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h3 className="font-heading text-base font-bold text-primary">
                Restez informé !
              </h3>
              <p className="mt-1 text-sm text-gray-500 leading-relaxed">
                Autorisez les notifications pour recevoir des rappels pour vos rendez-vous et vos récompenses de fidélité.
              </p>
            </div>
          </div>
          
          <div className="flex gap-3 mt-5">
            <GhostButton onClick={handleDismiss} className="flex-1 text-sm py-2.5">
              Plus tard
            </GhostButton>
            <PrimaryButton 
              onClick={handleAccept} 
              disabled={isRequesting}
              className="flex-1 text-sm py-2.5 bg-accent hover:bg-accent/90"
            >
              {isRequesting ? 'Activation...' : 'Activer'}
            </PrimaryButton>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
