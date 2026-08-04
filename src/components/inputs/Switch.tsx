import React from 'react'
import { motion } from 'framer-motion'

export interface SwitchProps {
  id?: string
  label?: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

export const Switch: React.FC<SwitchProps> = ({
  id,
  label,
  checked,
  onChange,
  disabled,
}) => {
  return (
    <div className="flex items-center gap-3">
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-50 ${
          checked ? 'bg-accent' : 'bg-gray-300'
        }`}
      >
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 700, damping: 30 }}
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm ${
            checked ? 'left-[26px]' : 'left-1'
          }`}
        />
      </button>
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium text-primary cursor-pointer"
        >
          {label}
        </label>
      )}
    </div>
  )
}
