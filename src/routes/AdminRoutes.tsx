import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthContext } from '@contexts/AuthContext'
import { ROUTES } from '@constants/routes'

/**
 * AdminRoute — protects admin-only routes.
 * Redirects to /admin/login if Firebase Auth user is not logged in.
 */
const AdminRoute: React.FC = () => {
  const { isAdmin, isLoading } = useAuthContext()
  const location = useLocation()

  // While Firebase is initializing, show nothing (prevents flash)
  if (isLoading) return null

  if (!isAdmin) {
    return (
      <Navigate to={ROUTES.ADMIN_LOGIN} state={{ from: location }} replace />
    )
  }

  return <Outlet />
}

export default AdminRoute
