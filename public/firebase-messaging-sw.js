importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js')

const firebaseConfig = {
  apiKey: "AIzaSyAQr7aVtiNrjwhtbE7n57i5lPEMBh7VQ1s",
  authDomain: "djo-coiffe.firebaseapp.com",
  projectId: "djo-coiffe",
  storageBucket: "djo-coiffe.firebasestorage.app",
  messagingSenderId: "909169190616",
  appId: "1:909169190616:web:abac86418cbb2f6c6e99ad"
}

firebase.initializeApp(firebaseConfig)
const messaging = firebase.messaging()

// ─── Background message handler ────────────────────────────────────────────────
// The server now sends a "data-only" payload to Web Push (no root `notification`).
// This bypasses Firebase's automatic notification display and click hijacking.
// We must manually construct and show the notification here.
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Background message received:', payload)
  
  const data = payload.data || {}
  const title = data.title || 'Djo Coiffe'
  const body = data.body || ''
  const actionUrl = data.actionUrl || '/admin'

  const options = {
    body,
    icon: '/logo.png',
    badge: '/logo.png',
    data: { actionUrl }, // Attach our custom deep-link to the notification data
    requireInteraction: true // Keep it open until the user clicks it
  }

  self.registration.showNotification(title, options)
})

// ─── Notification click handler ────────────────────────────────────────────────
// Because we created the notification manually above, we have 100% control
// over this click event, and Firebase SDK will not interfere.
self.addEventListener('notificationclick', function(event) {
  event.notification.close()

  // 1. Extract the deep-link URL we attached when showing the notification
  const data = event.notification.data || {}
  const urlToOpen = data.actionUrl || '/admin'

  console.log('[SW] Notification clicked. Navigating to:', urlToOpen)

  event.waitUntil(
    (async () => {
      // 2. Persist the URL in CacheStorage (iOS-safe bridge)
      // On iOS PWA the app ALWAYS reopens at start_url (/admin) when a
      // notification is tapped — it ignores any deep-link URL.
      // We therefore store the pending navigation so the app can read
      // it on mount regardless of when it starts.
      try {
        const cache = await caches.open('djo-coiffe-sw-data')
        await cache.put('/__sw_pending_navigate', new Response(urlToOpen))
      } catch (e) {
        console.warn('[SW] Could not write to CacheStorage:', e)
      }

      // 3. Handle window focus / open
      const windowClients = await clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      })

      for (const client of windowClients) {
        if (client.url.includes(self.location.origin)) {
          // App is already open: send postMessage so React Router navigates
          // immediately without waiting for the cache poll.
          client.postMessage({ type: 'SW_NAVIGATE', url: urlToOpen })
          return client.focus()
        }
      }

      // App is closed: open it. On iOS this always opens at start_url,
      // but the app will read the pending URL from CacheStorage on mount.
      const absoluteUrl = urlToOpen.startsWith('http')
        ? urlToOpen
        : self.registration.scope.replace(/\/$/, '') + urlToOpen
        
      return clients.openWindow(absoluteUrl)
    })()
  )
})
