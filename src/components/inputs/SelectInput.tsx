import React from 'react'

export interface SelectInputProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: { value: string; label: string }[]
  error?: string
}

export const SelectInput: React.FC<SelectInputProps> = ({
  label,
  options,
  error,
  className = '',
  id,
  ...props
}) => {
  return (
    <div className={`flex flex-col gap-2 w-full ${className}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-primary">
          {label}
        </label>
      )}
      <select
        id={id}
        className="min-h-[48px] w-full rounded-[16px] border border-border bg-white px-4 py-3 text-primary outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20"
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <span className="text-xs text-danger font-medium">{error}</span>
      )}
    </div>
  )
}
