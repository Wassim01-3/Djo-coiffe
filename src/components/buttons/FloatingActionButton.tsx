import React from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'

export interface FloatingActionButtonProps extends HTMLMotionProps<'button'> {
  icon: React.ReactNode
  variant?: 'primary' | 'whatsapp'
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  disabled,
  icon,
  variant = 'primary',
  className = '',
  ...props
}) => {
  const variantClasses = {
    primary: 'bg-accent text-white shadow-lg shadow-accent/20',
    whatsapp: 'bg-[#25D366] text-white shadow-lg shadow-green-500/20',
  }

  return (
    <motion.button
      whileTap={disabled ? undefined : { scale: 0.95 }}
      disabled={disabled}
      className={`fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full transition-all active:scale-[0.95] disabled:cursor-not-allowed disabled:bg-unavailable ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {icon}
    </motion.button>
  )
}
