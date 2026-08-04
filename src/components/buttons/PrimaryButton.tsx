import React from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { Loader } from '../feedback/Loader'

export interface PrimaryButtonProps extends Omit<
  HTMLMotionProps<'button'>,
  'children'
> {
  children?: React.ReactNode
  isLoading?: boolean
  icon?: React.ReactNode
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  children,
  isLoading,
  disabled,
  icon,
  className = '',
  ...props
}) => {
  return (
    <motion.button
      whileTap={disabled || isLoading ? undefined : { scale: 0.98 }}
      disabled={disabled || isLoading}
      className={`relative flex min-h-[48px] w-full items-center justify-center rounded-[16px] bg-accent px-6 py-3 font-semibold text-white transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-unavailable ${className}`}
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
