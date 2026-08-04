import { useAuthContext } from '@contexts/AuthContext'

/** Convenience hook for consuming AuthContext throughout the application */
export const useAuth = () => useAuthContext()
