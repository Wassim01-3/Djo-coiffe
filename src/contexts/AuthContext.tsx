import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react'
import type { ReactNode } from 'react'
import type { User as FirebaseUser } from 'firebase/auth'
import type { User } from '@appTypes/models'
import {
  loginOrRegisterCustomer,
  saveCustomerSession,
  loadCustomerSession,
  clearCustomerSession,
  signOutAdmin,
  onAdminAuthStateChanged,
} from '@services/auth.service'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface AuthContextValue {
  // Customer
  customer: User | null
  isCustomerAuthenticated: boolean
  loginCustomer: (fullName: string, phoneNumber: string) => Promise<void>
  updateCustomerState: (updatedUser: User) => void
  logoutCustomer: () => void

  // Admin
  adminUser: FirebaseUser | null
  isAdmin: boolean

  // Shared
  isLoading: boolean
  logoutAdmin: () => Promise<void>
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
const AuthContext = createContext<AuthContextValue | undefined>(undefined)

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // Lazy initializer: restore customer session from localStorage on first render
  const [customer, setCustomer] = useState<User | null>(() =>
    loadCustomerSession(),
  )
  const [adminUser, setAdminUser] = useState<FirebaseUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // On mount: listen for admin auth state changes
  // (Customer session is restored via lazy useState initializer above)
  useEffect(() => {
    // Subscribe to Firebase admin auth state
    const unsubscribe = onAdminAuthStateChanged((firebaseUser) => {
      setAdminUser(firebaseUser)
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // ---------------------------------------------------------------------------
  // Customer actions
  // ---------------------------------------------------------------------------
  const loginCustomer = useCallback(
    async (fullName: string, phoneNumber: string) => {
      const user = await loginOrRegisterCustomer(fullName, phoneNumber)
      saveCustomerSession(user)
      setCustomer(user)
    },
    [],
  )

  const updateCustomerState = useCallback((updatedUser: User) => {
    saveCustomerSession(updatedUser)
    setCustomer(updatedUser)
  }, [])

  const logoutCustomer = useCallback(() => {
    clearCustomerSession()
    setCustomer(null)
  }, [])

  // ---------------------------------------------------------------------------
  // Admin actions
  // ---------------------------------------------------------------------------
  const logoutAdmin = useCallback(async () => {
    await signOutAdmin()
    setAdminUser(null)
  }, [])

  // ---------------------------------------------------------------------------
  // Derived state
  // ---------------------------------------------------------------------------
  const isCustomerAuthenticated = customer !== null
  const isAdmin = adminUser !== null

  const value: AuthContextValue = {
    customer,
    isCustomerAuthenticated,
    loginCustomer,
    updateCustomerState,
    logoutCustomer,
    adminUser,
    isAdmin,
    isLoading,
    logoutAdmin,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export const useAuthContext = (): AuthContextValue => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used inside AuthProvider')
  return ctx
}
