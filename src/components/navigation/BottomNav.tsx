import React from 'react'
import { NavLink } from 'react-router-dom'
import { Home, Calendar, Image, Package, Menu } from 'lucide-react'
import { ROUTES } from '@constants/routes'

interface NavItem {
  icon: React.ElementType
  label: string
  to: string
}

const navItems: NavItem[] = [
  { icon: Home, label: 'Accueil', to: ROUTES.HOME },
  { icon: Calendar, label: 'Réservation', to: ROUTES.MY_RESERVATIONS },
  { icon: Image, label: 'Galerie', to: ROUTES.GALLERY },
  { icon: Package, label: 'Produits', to: ROUTES.PRODUCTS },
  { icon: Menu, label: 'Plus', to: ROUTES.PROFILE },
]

const BottomNav: React.FC = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-white shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] safe-area-bottom">
      <div className="mx-auto flex h-full max-w-md items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `group relative flex h-full w-16 flex-col items-center justify-center gap-1 transition-colors ${
                  isActive ? 'text-accent' : 'text-gray-400 hover:text-gray-600'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`h-5 w-5 transition-transform duration-200 ${
                      isActive ? 'scale-110' : 'scale-100'
                    }`}
                    strokeWidth={isActive ? 2 : 1.5}
                  />
                  <span className="text-[10px] font-medium tracking-wide">
                    {item.label}
                  </span>
                  {isActive && (
                    <span className="absolute -top-px left-1/2 h-[3px] w-8 -translate-x-1/2 rounded-b-full bg-accent" />
                  )}
                </>
              )}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}

export default BottomNav
