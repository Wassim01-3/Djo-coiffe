import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X } from 'lucide-react'
import { PrimaryButton } from '@components/buttons/PrimaryButton'
import { GhostButton } from '@components/buttons/GhostButton'
import { requestPushPermission } from '@services/push.service'
import { useAuthContext } from '@contexts/AuthContext'

const STORAGE_KEY = 'admin_hasPromptedForPush'

export const AdminPushPrompt: React.FC = () => {
  const { adminUser } = useAuthContext()
  const [isVisible, setIsVisible] = useState(false)
  const [isRequesting, setIsRequesting] = useState(false)

  useEffect(() => {
    // Only show when admin is logged in
    if (!adminUser?.uid) return

    // Don't show if already prompted
    if (localStorage.getItem(STORAGE_KEY)) return

    // Check API availability
    if (!('Notification' in window)) return

    // Show if not yet granted
    if (window.Notification.permission === 'default') {
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [adminUser?.uid])

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true')
    setIsVisible(false)
  }

  const handleAccept = async () => {
    if (!adminUser?.uid) return
    if (!('Notification' in window)) {
      handleDismiss()
      return
    }
    setIsRequesting(true)
    try {
      await requestPushPermission(adminUser.uid, 'admins')
    } catch (err) {
      console.error('Admin push permission error:', err)
    } finally {
      localStorage.setItem(STORAGE_KEY, 'true')
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
                Activer les notifications
              </h3>
              <p className="mt-1 text-sm text-gray-500 leading-relaxed">
                Recevez une alerte instantanée à chaque nouvelle réservation client.
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
