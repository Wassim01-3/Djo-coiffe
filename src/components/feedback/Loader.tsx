import React from 'react'

export interface LoaderProps {
  size?: 'sm' | 'md' | 'lg'
  light?: boolean
}

export const Loader: React.FC<LoaderProps> = ({
  size = 'md',
  light = false,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-[3px]',
    lg: 'w-12 h-12 border-4',
  }

  const colorClass = light
    ? 'border-white/30 border-t-white'
    : 'border-accent/30 border-t-accent'

  return (
    <div
      className={`animate-spin rounded-full ${sizeClasses[size]} ${colorClass}`}
      role="status"
      aria-label="Chargement"
    />
  )
}
