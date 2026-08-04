import React from 'react'
import { cn } from '@utils/cn'

interface TimelineItem {
  id: string
  label: string
  sublabel?: string
  date?: string
  icon?: React.ReactNode
  completed?: boolean
  active?: boolean
}

export interface TimelineProps {
  items: TimelineItem[]
  className?: string
}

export const Timeline: React.FC<TimelineProps> = ({
  items,
  className = '',
}) => {
  return (
    <div className={cn('flex flex-col', className)}>
      {items.map((item, index) => (
        <div key={item.id} className="flex gap-3">
          {/* Left column: dot + line */}
          <div className="flex flex-col items-center">
            <div
              className={cn(
                'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors',
                item.active
                  ? 'border-accent bg-accent text-white'
                  : item.completed
                    ? 'border-success bg-success text-white'
                    : 'border-border bg-white text-gray-400',
              )}
            >
              {item.icon ?? index + 1}
            </div>
            {index < items.length - 1 && (
              <div
                className={cn(
                  'mt-1 w-0.5 flex-1',
                  item.completed ? 'bg-success' : 'bg-border',
                )}
              />
            )}
          </div>
          {/* Right column: content */}
          <div className="pb-6 pt-1 min-w-0">
            <p
              className={cn(
                'text-sm font-semibold leading-tight',
                item.active
                  ? 'text-accent'
                  : item.completed
                    ? 'text-primary'
                    : 'text-gray-400',
              )}
            >
              {item.label}
            </p>
            {item.sublabel && (
              <p className="text-xs text-gray-500 mt-0.5">{item.sublabel}</p>
            )}
            {item.date && (
              <p className="text-xs text-gray-400 mt-0.5">{item.date}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
