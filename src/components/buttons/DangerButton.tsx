import React from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { Loader } from '../feedback/Loader'

export interface DangerButtonProps extends Omit<
  HTMLMotionProps<'button'>,
  'children'
> {
  children?: React.ReactNode
  icon?: React.ReactNode
  isLoading?: boolean
}

export const DangerButton: React.FC<DangerButtonProps> = ({
  children,
  disabled,
  isLoading,
  icon,
  className = '',
  ...props
}) => {
  return (
    <motion.button
      whileTap={disabled || isLoading ? undefined : { scale: 0.98 }}
      disabled={disabled || isLoading}
      className={`flex min-h-[48px] w-full items-center justify-center rounded-[16px] bg-danger px-6 py-3 font-semibold text-white transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <Loader size="sm" light />
          Chargement...
        </span>
      ) : (
        <span className="flex items-center gap-2">
          {icon && <span className="flex-shrink-0">{icon}</span>}
          {children}
        </span>
      )}
    </motion.button>
  )
}
