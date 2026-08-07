import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * useNotificationNavigation
 *
 * Listens for SW_NAVIGATE messages posted by the Firebase messaging service
 * worker (firebase-messaging-sw.js) when a push notification is clicked.
 *
 * Because service workers cannot directly invoke React Router, they send a
 * postMessage({ type: 'SW_NAVIGATE', url: '...' }) to the active window.
 * This hook picks that up and delegates to React Router's navigate(), which
 * correctly updates the app state, URL, and triggers all related effects
 * (including the `highlight` animation in AdminReservationsPage).
 */
export const useNotificationNavigation = () => {
  const navigate = useNavigate()

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'SW_NAVIGATE' && event.data.url) {
        const url: string = event.data.url
        // Extract just the pathname + search (e.g. "/admin/reservations?date=...&highlight=...")
        try {
          const parsed = new URL(url, window.location.origin)
          navigate(parsed.pathname + parsed.search, { replace: false })
        } catch {
          // Fallback: treat url as a relative path
          navigate(url, { replace: false })
        }
      }
    }

    navigator.serviceWorker.addEventListener('message', handleMessage)
    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage)
    }
  }, [navigate])
}
