import React from 'react'
import { PrimaryButton } from '../buttons/PrimaryButton'

export interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Quelque chose s'est mal passé",
  message = 'Veuillez réessayer.',
  onRetry,
}) => (
  <div className="flex flex-col items-center justify-center gap-4 py-16 px-6 text-center">
    <div className="text-7xl mb-2">⚠️</div>
    <h3 className="text-lg font-bold text-primary">{title}</h3>
    <p className="text-sm text-gray-500 max-w-xs">{message}</p>
    {onRetry && (
      <div className="mt-2 w-full max-w-xs">
        <PrimaryButton onClick={onRetry}>Réessayer</PrimaryButton>
      </div>
    )}
  </div>
)
