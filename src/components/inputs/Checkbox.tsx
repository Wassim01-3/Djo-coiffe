import React from 'react'
import { Check } from 'lucide-react'
import { motion } from 'framer-motion'

export interface CheckboxProps {
  id?: string
  label?: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  error?: string
}

export const Checkbox: React.FC<CheckboxProps> = ({
  id,
  label,
  checked,
  onChange,
  disabled,
  error,
}) => {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-3">
        <button
          id={id}
          role="checkbox"
          aria-checked={checked}
          disabled={disabled}
          onClick={() => onChange(!checked)}
          className={`flex h-6 w-6 items-center justify-center rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-50 ${
            checked ? 'border-accent bg-accent' : 'border-border bg-white'
          }`}
        >
          {checked && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.15 }}
            >
              <Check size={14} className="text-white" strokeWidth={3} />
            </motion.span>
          )}
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
      {error && (
        <span className="text-xs text-danger font-medium">{error}</span>
      )}
    </div>
  )
}
