import React from 'react'
import { cn } from '@utils/cn'

export interface ProgressBarProps {
  value: number
  max?: number
  label?: string
  showPercent?: boolean
  color?: 'accent' | 'success' | 'danger' | 'reserved'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const COLOR_CLASSES: Record<string, string> = {
  accent: 'bg-accent',
  success: 'bg-success',
  danger: 'bg-danger',
  reserved: 'bg-reserved',
}

const SIZE_CLASSES: Record<string, string> = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  showPercent = false,
  color = 'accent',
  size = 'md',
  className = '',
}) => {
  const percent = Math.min(Math.max((value / max) * 100, 0), 100)

  return (
    <div className={cn('w-full', className)}>
      {(label || showPercent) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && (
            <span className="text-xs font-medium text-gray-600">{label}</span>
          )}
          {showPercent && (
            <span className="text-xs font-semibold text-primary">
              {Math.round(percent)}%
            </span>
          )}
        </div>
      )}
      <div
        className={cn('w-full rounded-full bg-gray-100', SIZE_CLASSES[size])}
      >
        <div
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          className={cn(
            'rounded-full transition-all duration-500',
            SIZE_CLASSES[size],
            COLOR_CLASSES[color],
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

export interface CircularProgressProps {
  value: number
  max?: number
  size?: number
  strokeWidth?: number
  label?: string
  sublabel?: string
  color?: string
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  max = 100,
  size = 120,
  strokeWidth = 10,
  label,
  sublabel,
  color = '#C59D5F',
}) => {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const percent = Math.min(Math.max(value / max, 0), 1)
  const offset = circumference * (1 - percent)

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#F3F4F6"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      {(label || sublabel) && (
        <div className="absolute flex flex-col items-center text-center">
          {label && (
            <span className="text-lg font-bold text-primary leading-tight">
              {label}
            </span>
          )}
          {sublabel && (
            <span className="text-xs text-gray-500">{sublabel}</span>
          )}
        </div>
      )}
    </div>
  )
}
