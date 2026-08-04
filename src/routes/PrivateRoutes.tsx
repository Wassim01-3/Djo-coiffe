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

  // Show a spinner while Firebase Auth initializes.
  // Returning null causes a blank white page on iOS Safari (slow Firebase init).
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    )
  }

  if (!isCustomerAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
  }

  return <Outlet />
}

export default PrivateRoute
