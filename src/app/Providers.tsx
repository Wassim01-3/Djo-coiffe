import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@contexts/AuthContext'
import { ReservationProvider } from '@contexts/ReservationContext'
import { NotificationProvider } from '@contexts/NotificationContext'
import { SettingsProvider } from '@contexts/SettingsContext'
import { useFcmPermission } from '@hooks/useFcmPermission'

// PWA Overlays
import OfflineBanner from '@components/pwa/OfflineBanner'
import IosInstallPrompt from '@components/pwa/IosInstallPrompt'
import PwaInstallBanner from '@components/pwa/PwaInstallBanner'
import UpdateBanner from '@components/pwa/UpdateBanner'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes (prevents refetching unchanged data immediately)
      gcTime: 1000 * 60 * 15, // 15 minutes (garbage collection time)
    },
  },
})

/** Runs the FCM hook inside the provider tree where both Auth & Notification contexts are available */
const FcmBootstrap: React.FC = () => {
  useFcmPermission()
  return null
}

interface ProvidersProps {
  children: React.ReactNode
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <SettingsProvider>
            <NotificationProvider>
              <FcmBootstrap />
              <ReservationProvider>{children}</ReservationProvider>
            </NotificationProvider>
          </SettingsProvider>

          {/* Global PWA components */}
          <OfflineBanner />
          <IosInstallPrompt />
          <PwaInstallBanner />
          <UpdateBanner />

          {/* Global toast notifications */}
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                borderRadius: '12px',
                background: '#111827',
                color: '#fff',
                fontSize: '14px',
                padding: '12px 16px',
              },
              success: {
                iconTheme: { primary: '#22C55E', secondary: '#fff' },
              },
              error: {
                iconTheme: { primary: '#EF4444', secondary: '#fff' },
              },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
