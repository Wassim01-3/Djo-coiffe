import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthContext } from '@contexts/AuthContext'
import { ROUTES } from '@constants/routes'

/**
 * AdminRoute — protects admin-only routes.
 * Redirects to /admin/login if Firebase Auth user is not logged in.
 *
 * Note: We show a spinner instead of null during loading to prevent a blank
 * page on iOS Safari, which has slower Firebase Auth initialization.
 */
const AdminRoute: React.FC = () => {
  const { isAdmin, isLoading } = useAuthContext()
  const location = useLocation()

  // Show a spinner while Firebase Auth initializes.
  // Returning null causes a blank white page on iOS Safari (slow Firebase init).
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          <p className="text-sm text-gray-400">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <Navigate to={ROUTES.ADMIN_LOGIN} state={{ from: location }} replace />
    )
  }

  return <Outlet />
}

export default AdminRoute
