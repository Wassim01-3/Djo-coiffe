import React, { useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  CalendarDays,
  QrCode,
  Users,
  Scissors,
  Package,
  Image,
  UserCircle,
  CreditCard,
  Phone,
  Settings,
  LogOut,
  Menu,
  X,
  Megaphone,
} from 'lucide-react'
import { ROUTES } from '@constants/routes'
import { useAuthContext } from '@contexts/AuthContext'
import { useSettingsContext } from '@contexts/SettingsContext'
import logoFallback from '@assets/logo.png'

interface NavItem {
  label: string
  icon: React.ElementType
  path: string
}

const NAV_ITEMS: NavItem[] = [
  { label: "File d'attente", icon: LayoutDashboard, path: ROUTES.ADMIN_DASHBOARD },
  { label: 'Réservations', icon: CalendarDays, path: ROUTES.ADMIN_RESERVATIONS },
  { label: 'Scanner QR', icon: QrCode, path: ROUTES.ADMIN_SCANNER },
  { label: 'Coiffeurs', icon: Scissors, path: ROUTES.ADMIN_BARBERS },
  { label: 'Services', icon: Scissors, path: ROUTES.ADMIN_SERVICES },
  { label: 'Produits', icon: Package, path: ROUTES.ADMIN_PRODUCTS },
  { label: 'Galerie', icon: Image, path: ROUTES.ADMIN_GALLERY },
  { label: 'Clients', icon: Users, path: ROUTES.ADMIN_CLIENTS },
  { label: 'Abonnements', icon: CreditCard, path: ROUTES.ADMIN_SUBSCRIPTIONS },
  { label: 'Annonces', icon: Megaphone, path: ROUTES.ADMIN_ANNOUNCEMENTS },
  { label: 'Contact', icon: Phone, path: ROUTES.ADMIN_CONTACT },
  { label: 'Paramètres', icon: Settings, path: ROUTES.ADMIN_SETTINGS },
]

interface AdminLayoutProps {
  children: ReactNode
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { logoutAdmin } = useAuthContext()
  const { settings } = useSettingsContext()
  const logoSrc = settings.logoUrl || logoFallback
  const shopName = settings.shopName || 'Djo Coiffe'
  const navigate = useNavigate()
  const location = useLocation()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // Close drawer on route change
  useEffect(() => {
    setIsDrawerOpen(false)
  }, [location.pathname])

  const handleLogout = async () => {
    await logoutAdmin()
    navigate(ROUTES.ADMIN_LOGIN)
  }

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo / Brand */}
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
        <img
          src={logoSrc}
          alt={shopName}
          className="h-9 w-9 object-contain"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = logoFallback }}
        />
        <div>
          <p className="font-heading text-sm font-bold leading-tight text-white">{shopName}</p>
          <p className="text-[10px] text-white/40 font-medium tracking-wide uppercase">Admin</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          // Exact match for dashboard, prefix match for others
          const isActive =
            item.path === ROUTES.ADMIN_DASHBOARD
              ? location.pathname === ROUTES.ADMIN_DASHBOARD
              : location.pathname.startsWith(item.path)

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === ROUTES.ADMIN_DASHBOARD}
              className={() =>
                `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-accent text-primary'
                    : 'text-white/60 hover:bg-white/8 hover:text-white'
                }`
              }
            >
              <Icon
                className={`h-4 w-4 shrink-0 transition-colors ${
                  isActive ? 'text-primary' : 'text-white/40 group-hover:text-white'
                }`}
              />
              {item.label}
            </NavLink>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-white/10 p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/60 transition-all hover:bg-danger/10 hover:text-danger"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Déconnexion
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-background">
      {/* ─── Desktop Sidebar ─── */}
      <aside className="hidden w-60 shrink-0 md:flex flex-col bg-primary min-h-screen fixed top-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* ─── Mobile Drawer Overlay ─── */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={() => setIsDrawerOpen(false)}
            />
            <motion.aside
              key="drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 z-50 h-full w-72 bg-primary md:hidden"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ─── Main Content ─── */}
      <div className="flex flex-1 flex-col md:ml-60">
        {/* Mobile Sticky Top Bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 md:hidden">
          <button
            id="admin-menu-button"
            onClick={() => setIsDrawerOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-primary hover:bg-gray-50"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent">
              <Scissors className="h-3.5 w-3.5 text-primary" strokeWidth={2} />
            </div>
            <span className="font-heading text-sm font-bold text-primary">Djo Coiffe</span>
          </div>
          <div className="w-9" /> {/* spacer */}
        </header>

        {/* Desktop Top Bar */}
        <header className="hidden md:flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
          <div>
            <h2 className="font-heading text-lg font-bold text-primary">
              {NAV_ITEMS.find(
                (n) =>
                  n.path === location.pathname ||
                  (n.path !== ROUTES.ADMIN_DASHBOARD && location.pathname.startsWith(n.path)),
              )?.label ?? "File d'attente"}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10">
              <UserCircle className="h-5 w-5 text-accent" />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
