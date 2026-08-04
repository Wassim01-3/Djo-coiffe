import React from 'react'
import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Calendar,
  QrCode,
  Users,
  Scissors,
  Image,
  ShoppingBag,
  UserCheck,
  CreditCard,
  Phone,
  Settings,
  X,
} from 'lucide-react'
import { ROUTES } from '@constants/routes'
import { useSettingsContext } from '@contexts/SettingsContext'
import logoFallback from '@assets/logo.png'

interface AdminNavItem {
  to: string
  label: string
  icon: React.ReactNode
}

const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  {
    to: ROUTES.ADMIN_DASHBOARD,
    label: 'Tableau de bord',
    icon: <LayoutDashboard size={18} />,
  },
  {
    to: ROUTES.ADMIN_RESERVATIONS,
    label: 'Réservations',
    icon: <Calendar size={18} />,
  },
  { to: ROUTES.ADMIN_SCANNER, label: 'Scanner QR', icon: <QrCode size={18} /> },
  { to: ROUTES.ADMIN_BARBERS, label: 'Coiffeurs', icon: <Users size={18} /> },
  {
    to: ROUTES.ADMIN_SERVICES,
    label: 'Services',
    icon: <Scissors size={18} />,
  },
  { to: ROUTES.ADMIN_GALLERY, label: 'Galerie', icon: <Image size={18} /> },
  {
    to: ROUTES.ADMIN_PRODUCTS,
    label: 'Produits',
    icon: <ShoppingBag size={18} />,
  },
  { to: ROUTES.ADMIN_CLIENTS, label: 'Clients', icon: <UserCheck size={18} /> },
  {
    to: ROUTES.ADMIN_SUBSCRIPTIONS,
    label: 'Abonnements',
    icon: <CreditCard size={18} />,
  },
  { to: ROUTES.ADMIN_CONTACT, label: 'Contact', icon: <Phone size={18} /> },
  {
    to: ROUTES.ADMIN_SETTINGS,
    label: 'Paramètres',
    icon: <Settings size={18} />,
  },
]

export interface AdminDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export const AdminDrawer: React.FC<AdminDrawerProps> = ({ isOpen, onClose }) => {
  const { settings } = useSettingsContext()
  const logoSrc = settings.logoUrl || logoFallback
  const shopName = settings.shopName || 'Djo Coiffe'
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            className="fixed left-0 top-0 bottom-0 z-50 w-72 bg-primary text-white shadow-xl flex flex-col"
          >
            <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 overflow-hidden rounded-xl bg-white flex items-center justify-center shrink-0">
                  <img
                    src={logoSrc}
                    alt={shopName}
                    className="h-full w-full object-cover"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = logoFallback }}
                  />
                </div>
                <p className="text-lg font-bold">{shopName}</p>
              </div>
              <button
                onClick={onClose}
                aria-label="Fermer le menu"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10"
              >
                <X size={16} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-4">
              {ADMIN_NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  end={item.to === ROUTES.ADMIN_DASHBOARD}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-5 py-3.5 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-accent/20 text-accent'
                        : 'text-white/70 hover:bg-white/5 hover:text-white'
                    }`
                  }
                >
                  {item.icon}
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="px-5 py-4 border-t border-white/10">
              <p className="text-xs text-white/40 text-center">
                Djo Coiffe Admin v0.1
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
