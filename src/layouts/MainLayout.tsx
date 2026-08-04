import type { ReactNode } from 'react'
import React from 'react'
import { Link } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { BottomNav } from '@components/navigation'
import { ROUTES } from '@constants/routes'
import { useNotificationContext } from '@contexts/NotificationContext'
import { useSettingsContext } from '@contexts/SettingsContext'
import logoFallback from '@assets/logo.png'

interface MainLayoutProps {
  children: ReactNode
}

/** Main layout for authenticated customer pages — includes TopBar and BottomNavigation */
const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { unreadCount } = useNotificationContext()
  const { settings } = useSettingsContext()
  const logoSrc = settings.logoUrl || logoFallback
  const shopName = settings.shopName || 'Djo Coiffe'

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Sticky Top Bar */}
      <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 safe-area-top">
        <div className="mx-auto flex h-14 max-w-md items-center justify-between px-4">
          <Link to={ROUTES.HOME} className="flex items-center gap-2">
            {/* Logo — transparent background, no container bg */}
            <img
              src={logoSrc}
              alt={shopName}
              className="h-8 w-8 object-contain"
              onError={(e) => {
                ;(e.currentTarget as HTMLImageElement).src = logoFallback
              }}
            />
            <span className="font-heading text-lg font-bold text-primary">{shopName}</span>
          </Link>
          <Link
            to={ROUTES.NOTIFICATIONS}
            className="relative flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-gray-100"
          >
            <Bell className="h-5 w-5 text-gray-600" strokeWidth={1.5} />
            {unreadCount > 0 && (
              <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[9px] font-bold text-white ring-2 ring-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* Main Content Area (padding bottom for BottomNav) */}
      <main className="flex-1 pb-16">{children}</main>

      {/* Persistent Bottom Navigation */}
      <BottomNav />
    </div>
  )
}

export default MainLayout
