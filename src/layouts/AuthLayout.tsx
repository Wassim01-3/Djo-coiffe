import type { ReactNode } from 'react'
import React from 'react'

interface AuthLayoutProps {
  children: ReactNode
}

/** Auth layout — centered card layout for login screens */
const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">{children}</div>
    </div>
  )
}

export default AuthLayout
