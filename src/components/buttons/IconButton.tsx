import React from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'

export interface IconButtonProps extends HTMLMotionProps<'button'> {
  icon: React.ReactNode
}

export const IconButton: React.FC<IconButtonProps> = ({
  disabled,
  icon,
  className = '',
  ...props
}) => {
  return (
    <motion.button
      whileTap={disabled ? undefined : { scale: 0.95 }}
      disabled={disabled}
      className={`flex h-12 w-12 items-center justify-center rounded-[16px] border border-border bg-white text-primary transition-all active:scale-[0.95] hover:bg-black/5 disabled:cursor-not-allowed disabled:text-gray-400 ${className}`}
      {...props}
    >
      {icon}
    </motion.button>
  )
}
