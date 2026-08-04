import React from 'react'

export interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  success?: boolean
}

export const TextInput: React.FC<TextInputProps> = ({
  label,
  error,
  success,
  className = '',
  id,
  ...props
}) => {
  const inputBorderClass = error
    ? 'border-danger focus:border-danger focus:ring-danger/20'
    : success
      ? 'border-success focus:border-success focus:ring-success/20'
      : 'border-border focus:border-accent focus:ring-accent/20'

  return (
    <div className={`flex flex-col gap-2 w-full ${className}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-primary">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`min-h-[48px] w-full rounded-[16px] border bg-white px-4 py-3 text-primary placeholder-gray-400 outline-none transition-all focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 ${inputBorderClass}`}
        {...props}
      />
      {error && (
        <span className="text-xs text-danger font-medium">{error}</span>
      )}
    </div>
  )
}
