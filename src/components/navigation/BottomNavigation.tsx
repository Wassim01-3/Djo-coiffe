import React from 'react'
import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Home,
  Calendar,
  Image,
  ShoppingBag,
  MoreHorizontal,
} from 'lucide-react'
import { ROUTES } from '@constants/routes'
import { UnreadBadge } from '../common/Badge'

interface NavItem {
  to: string
  label: string
  icon: React.ReactNode
  badge?: number
}

const NAV_ITEMS: NavItem[] = [
  { to: ROUTES.HOME, label: 'Accueil', icon: <Home size={22} /> },
  { to: ROUTES.RESERVATION, label: 'Réserver', icon: <Calendar size={22} /> },
  { to: ROUTES.GALLERY, label: 'Galerie', icon: <Image size={22} /> },
  { to: ROUTES.PRODUCTS, label: 'Produits', icon: <ShoppingBag size={22} /> },
  { to: '/more', label: 'Plus', icon: <MoreHorizontal size={22} /> },
]

export interface BottomNavigationProps {
  unreadNotifications?: number
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  unreadNotifications = 0,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex h-16 items-stretch border-t border-divider bg-white pb-[env(safe-area-inset-bottom)]">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === ROUTES.HOME}
          className="relative flex flex-1 flex-col items-center justify-center gap-0.5"
        >
          {({ isActive }) => (
            <>
              <div className="relative">
                <motion.span
                  animate={{ color: isActive ? '#C59D5F' : '#9CA3AF' }}
                  transition={{ duration: 0.2 }}
                >
                  {item.icon}
                </motion.span>
                {item.label === 'Plus' && unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1">
                    <UnreadBadge count={unreadNotifications} />
                  </span>
                )}
              </div>
              <motion.span
                animate={{ color: isActive ? '#C59D5F' : '#9CA3AF' }}
                className="text-[10px] font-medium leading-none"
              >
                {item.label}
              </motion.span>
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute top-0 h-0.5 w-8 rounded-full bg-accent"
                />
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
