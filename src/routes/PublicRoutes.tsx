import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthContext } from '@contexts/AuthContext'
import { ROUTES } from '@constants/routes'

/**
 * PublicOnlyRoute — prevents already-authenticated users from accessing login pages.
 * Customers already logged in are redirected to the home page.
 * Admins already logged in are redirected to the admin dashboard.
 */
const PublicOnlyRoute: React.FC<{ forAdmin?: boolean }> = ({
  forAdmin = false,
}) => {
  const { isCustomerAuthenticated, isAdmin, isLoading } = useAuthContext()

  if (isLoading) return null

  if (forAdmin && isAdmin) {
    return <Navigate to={ROUTES.ADMIN_DASHBOARD} replace />
  }

  if (!forAdmin && isCustomerAuthenticated) {
    return <Navigate to={ROUTES.HOME} replace />
  }

  return <Outlet />
}

export default PublicOnlyRoute
