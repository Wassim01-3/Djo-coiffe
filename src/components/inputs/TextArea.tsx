import React from 'react'

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  error,
  className = '',
  id,
  ...props
}) => {
  const borderClass = error
    ? 'border-danger focus:border-danger focus:ring-danger/20'
    : 'border-border focus:border-accent focus:ring-accent/20'

  return (
    <div className={`flex flex-col gap-2 w-full ${className}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-primary">
          {label}
        </label>
      )}
      <textarea
        id={id}
        rows={4}
        className={`w-full rounded-[16px] border bg-white px-4 py-3 text-primary placeholder-gray-400 outline-none transition-all focus:ring-2 resize-none disabled:cursor-not-allowed disabled:bg-gray-100 ${borderClass}`}
        {...props}
      />
      {error && (
        <span className="text-xs text-danger font-medium">{error}</span>
      )}
    </div>
  )
}
