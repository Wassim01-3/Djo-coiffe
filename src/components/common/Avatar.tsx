import React from 'react'

export interface AvatarProps {
  src?: string
  name?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZES = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-12 w-12 text-sm',
  lg: 'h-20 w-20 text-xl',
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name = 'U',
  size = 'md',
  className = '',
}) => {
  return (
    <div
      className={`flex items-center justify-center rounded-full bg-accent/10 text-accent font-semibold overflow-hidden flex-shrink-0 ${SIZES[size]} ${className}`}
    >
      {src ? (
        <img src={src} alt={name} loading="lazy" decoding="async" className="h-full w-full object-cover" />
      ) : (
        getInitials(name)
      )}
    </div>
  )
}
