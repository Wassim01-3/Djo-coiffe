import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const SW_CACHE_NAME = 'djo-coiffe-sw-data'
const SW_PENDING_NAVIGATE_KEY = '/__sw_pending_navigate'

/**
 * useNotificationNavigation
 *
 * Two-pronged strategy so deep links from push notifications work on ALL
 * platforms — including iOS PWA, which always reopens the app at start_url
 * regardless of the deep-link URL.
 *
 * Strategy A – CacheStorage bridge (handles iOS & "app was closed")
 *   The SW writes the pending URL to CacheStorage before opening the window.
 *   On every mount of this hook the app checks for a pending entry, navigates
 *   to it via React Router, and immediately deletes it so it only fires once.
 *
 * Strategy B – postMessage (handles "app already open")
 *   When the app is already focused the SW sends SW_NAVIGATE via postMessage.
 *   Because the listener is already registered, this is instantaneous.
 */
export const useNotificationNavigation = () => {
  const navigate = useNavigate()

  useEffect(() => {
    // ── Strategy A: Check CacheStorage for a pending navigation ──
    const checkPendingNavigation = async (): Promise<boolean> => {
      if (!('caches' in window)) return false
      try {
        const cache = await caches.open(SW_CACHE_NAME)
        const response = await cache.match(SW_PENDING_NAVIGATE_KEY)
        if (response) {
          const url = await response.text()
          // Delete immediately so it's consumed only once
          await cache.delete(SW_PENDING_NAVIGATE_KEY)
          if (url && url !== '/admin') {
            try {
              const parsed = new URL(url, window.location.origin)
              navigate(parsed.pathname + parsed.search, { replace: false })
            } catch {
              navigate(url, { replace: false })
            }
          }
          return true
        }
      } catch (err) {
        console.warn('[useNotificationNavigation] CacheStorage check failed:', err)
      }
      return false
    }

    // Because of race conditions where the UI might boot up faster than the
    // Service Worker can write to CacheStorage on iOS, we poll a few times.
    let attempts = 0
    const maxAttempts = 6 // Poll 6 times (up to 3 seconds)
    const interval = setInterval(async () => {
      const found = await checkPendingNavigation()
      attempts++
      if (found || attempts >= maxAttempts) {
        clearInterval(interval)
      }
    }, 500)
    // Run immediately as well
    checkPendingNavigation().then(found => {
      if (found) clearInterval(interval)
    })

    // ── Strategy B: Listen for real-time postMessage from SW ──
    if (!('serviceWorker' in navigator)) return

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SW_NAVIGATE' && event.data.url) {
        try {
          const parsed = new URL(event.data.url, window.location.origin)
          navigate(parsed.pathname + parsed.search, { replace: false })
        } catch {
          navigate(event.data.url, { replace: false })
        }
        // Also clear the CacheStorage entry since we handled it via postMessage
        caches.open(SW_CACHE_NAME)
          .then(cache => cache.delete(SW_PENDING_NAVIGATE_KEY))
          .catch(() => {})
      }
    }

    navigator.serviceWorker.addEventListener('message', handleMessage)
    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage)
    }
  }, [navigate])
}
