import React from 'react'

export interface RadioOption {
  value: string
  label: string
}

export interface RadioGroupProps {
  name: string
  options: RadioOption[]
  value: string
  onChange: (value: string) => void
  label?: string
  error?: string
  disabled?: boolean
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  options,
  value,
  onChange,
  label,
  error,
  disabled,
}) => {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <span className="text-sm font-semibold text-primary">{label}</span>
      )}
      <div className="flex flex-col gap-3">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={value === option.value}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className="flex items-center gap-3 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <div
              className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all ${
                value === option.value ? 'border-accent' : 'border-border'
              }`}
            >
              {value === option.value && (
                <div className="h-2.5 w-2.5 rounded-full bg-accent" />
              )}
            </div>
            <span className="text-sm font-medium text-primary">
              {option.label}
            </span>
          </button>
        ))}
      </div>
      {error && (
        <span className="text-xs text-danger font-medium">{error}</span>
      )}
      <input type="hidden" name={name} value={value} readOnly />
    </div>
  )
}
