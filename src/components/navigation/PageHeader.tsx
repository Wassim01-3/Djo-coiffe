import React, { useEffect, useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@utils/cn'

export interface PageHeaderProps {
  title: string
  showBack?: boolean
  onBack?: () => void
  rightAction?: React.ReactNode
  className?: string
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  showBack = false,
  onBack,
  rightAction,
  className = '',
}) => {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 4)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const handleBack = () => {
    if (onBack) onBack()
    else navigate(-1)
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex h-14 items-center justify-between bg-background px-4 transition-shadow duration-200',
        scrolled && 'shadow-sm',
        className,
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        {showBack && (
          <button
            onClick={handleBack}
            aria-label="Retour"
            className="mr-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white shadow-sm"
          >
            <ChevronLeft size={20} className="text-primary" />
          </button>
        )}
        <h1 className="truncate text-lg font-bold text-primary">{title}</h1>
      </div>
      {rightAction && <div className="flex-shrink-0">{rightAction}</div>}
    </header>
  )
}
