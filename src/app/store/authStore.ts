import { create } from 'zustand'
import type { User } from '@appTypes/models'

interface AuthState {
  customer: User | null
  isLoading: boolean
  setCustomer: (user: User | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

/** Global authentication store — aligned with models.ts User type */
export const useAuthStore = create<AuthState>((set) => ({
  customer: null,
  isLoading: false,
  setCustomer: (customer) => set({ customer }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ customer: null }),
}))
