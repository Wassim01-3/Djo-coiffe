import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import {
  LogOut,
  User,
  Phone,
  Award,
  Calendar,
  Bell,
  Crown,
  Settings,
} from 'lucide-react'
import { useAuthContext } from '@contexts/AuthContext'
import { ROUTES } from '@constants/routes'

const ProfilePage: React.FC = () => {
  const { customer, logoutCustomer } = useAuthContext()
  const navigate = useNavigate()

  const handleLogout = () => {
    logoutCustomer()
    navigate(ROUTES.LOGIN, { replace: true })
  }

  if (!customer) return null

  const infoItems = [
    { icon: User, label: 'Nom complet', value: customer.fullName },
    { icon: Phone, label: 'Téléphone', value: customer.phoneNumber },
  ]

  const menuItems = [
    { icon: Award, label: 'Fidélité & Récompenses', to: ROUTES.LOYALTY },
    { icon: Crown, label: 'Mon Abonnement', to: ROUTES.SUBSCRIPTIONS },
    { icon: Calendar, label: 'Mes Réservations', to: ROUTES.MY_RESERVATIONS },
    { icon: Bell, label: 'Notifications', to: ROUTES.NOTIFICATIONS },
    { icon: Settings, label: 'Paramètres du compte', to: ROUTES.PROFILE_SETTINGS },
  ]

  return (
    <div className="min-h-screen bg-background px-4 py-8 pb-20">
      <div className="mx-auto max-w-sm space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="text-center"
        >
          {/* Avatar */}
          <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-primary shadow-lg">
            <span className="font-heading text-4xl font-bold text-accent">
              {customer.fullName.charAt(0).toUpperCase()}
            </span>
          </div>
          <h1 className="font-heading text-2xl font-bold text-primary">
            {customer.fullName}
          </h1>
          <p className="mt-1 text-sm text-gray-500">{customer.phoneNumber}</p>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.35 }}
          className="overflow-hidden rounded-2xl bg-white shadow-card"
        >
          {infoItems.map((item, i) => {
            const Icon = item.icon
            return (
              <div
                key={item.label}
                className={`flex items-center gap-4 px-5 py-4 ${
                  i < infoItems.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50">
                  <Icon className="h-5 w-5 text-gray-400" strokeWidth={1.5} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-400">{item.label}</p>
                  <p className="truncate font-medium text-primary">
                    {item.value}
                  </p>
                </div>
              </div>
            )
          })}
        </motion.div>

        {/* Menu Links */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.35 }}
          className="overflow-hidden rounded-2xl bg-white shadow-card"
        >
          {menuItems.map((item, i) => {
            const Icon = item.icon
            return (
              <Link
                key={item.label}
                to={item.to}
                className={`flex items-center gap-4 px-5 py-4 transition-colors hover:bg-gray-50 active:bg-gray-100 ${
                  i < menuItems.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                  <Icon className="h-5 w-5 text-accent" strokeWidth={1.5} />
                </div>
                <div className="flex-1 font-semibold text-primary">
                  {item.label}
                </div>
              </Link>
            )
          })}
        </motion.div>

        {/* Logout */}
        <motion.button
          id="customer-logout-btn"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleLogout}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl border border-danger/20 bg-danger/5 py-4 text-sm font-bold text-danger transition-all hover:bg-danger/10"
        >
          <LogOut className="h-4 w-4" strokeWidth={2} />
          Se déconnecter
        </motion.button>
      </div>
    </div>
  )
}

export default ProfilePage
