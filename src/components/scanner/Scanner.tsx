import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flashlight, SwitchCamera, CheckCircle, XCircle } from 'lucide-react'

/** Animated scan line overlay for QR scanner view */
export const AnimatedScanLine: React.FC = () => (
  <motion.div
    animate={{ y: ['0%', '100%', '0%'] }}
    transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
    className="absolute left-0 right-0 h-0.5 bg-accent shadow-[0_0_8px_2px_rgba(197,157,95,0.8)]"
  />
)

/** Scanner frame overlay shown over the camera */
export const ScannerOverlay: React.FC = () => (
  <div className="absolute inset-0 flex items-center justify-center">
    {/* Dark vignette corners */}
    <div className="relative h-64 w-64">
      {/* Corner brackets */}
      {[
        'top-0 left-0 border-t-4 border-l-4',
        'top-0 right-0 border-t-4 border-r-4',
        'bottom-0 left-0 border-b-4 border-l-4',
        'bottom-0 right-0 border-b-4 border-r-4',
      ].map((cls, i) => (
        <div
          key={i}
          className={`absolute h-10 w-10 rounded-sm border-accent ${cls}`}
        />
      ))}
      <AnimatedScanLine />
    </div>
  </div>
)

export interface TorchButtonProps {
  enabled: boolean
  onToggle: () => void
}

export const TorchButton: React.FC<TorchButtonProps> = ({
  enabled,
  onToggle,
}) => (
  <button
    onClick={onToggle}
    aria-label="Torche"
    className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
      enabled ? 'bg-accent text-white' : 'bg-white/20 text-white'
    }`}
  >
    <Flashlight size={22} />
  </button>
)

export interface SwitchCameraButtonProps {
  onSwitch: () => void
}

export const SwitchCameraButton: React.FC<SwitchCameraButtonProps> = ({
  onSwitch,
}) => (
  <button
    onClick={onSwitch}
    aria-label="Changer de caméra"
    className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white"
  >
    <SwitchCamera size={22} />
  </button>
)

export type ScannerResultStatus = 'success' | 'error'

export interface ScannerResultProps {
  status: ScannerResultStatus
  message: string
  isVisible: boolean
}

export const ScannerResult: React.FC<ScannerResultProps> = ({
  status,
  message,
  isVisible,
}) => (
  <AnimatePresence>
    {isVisible && (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/70 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 500 }}
        >
          {status === 'success' ? (
            <CheckCircle size={80} className="text-success" />
          ) : (
            <XCircle size={80} className="text-danger" />
          )}
        </motion.div>
        <p className="text-white font-semibold text-center px-6">{message}</p>
      </motion.div>
    )}
  </AnimatePresence>
)
