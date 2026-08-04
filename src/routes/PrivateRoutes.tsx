import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthContext } from '@contexts/AuthContext'
import { ROUTES } from '@constants/routes'

/**
 * PrivateRoute — protects customer-only routes.
 * Redirects to /login if the customer is not authenticated.
 * Preserves the attempted location so we can redirect back after login.
 */
const PrivateRoute: React.FC = () => {
  const { isCustomerAuthenticated, isLoading } = useAuthContext()
  const location = useLocation()

  // While Firebase is initializing, show nothing (prevents flash)
  if (isLoading) return null

  if (!isCustomerAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
  }

  return <Outlet />
}

export default PrivateRoute
