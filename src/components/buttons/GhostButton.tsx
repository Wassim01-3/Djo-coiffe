import React from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'

export interface GhostButtonProps extends Omit<
  HTMLMotionProps<'button'>,
  'children'
> {
  children?: React.ReactNode
  icon?: React.ReactNode
}

export const GhostButton: React.FC<GhostButtonProps> = ({
  children,
  disabled,
  icon,
  className = '',
  ...props
}) => {
  return (
    <motion.button
      whileTap={disabled ? undefined : { scale: 0.98 }}
      disabled={disabled}
      className={`flex min-h-[48px] w-full items-center justify-center rounded-[16px] bg-transparent px-6 py-3 font-semibold text-primary transition-all active:scale-[0.98] hover:bg-black/5 disabled:cursor-not-allowed disabled:text-gray-400 ${className}`}
      {...props}
    >
      <span className="flex items-center gap-2">
        {icon && <span className="flex-shrink-0">{icon}</span>}
        {children}
      </span>
    </motion.button>
  )
}
