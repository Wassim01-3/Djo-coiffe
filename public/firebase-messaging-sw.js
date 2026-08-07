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

// Register onBackgroundMessage so the SW "owns" the message and our
// custom notificationclick handler is invoked instead of Firebase's default.
// We do NOT call showNotification() here because Firebase already shows the
// notification automatically (the server sends a `notification` field).
// Calling it here would cause the duplicate notification bug.
messaging.onBackgroundMessage((_payload) => {
  // Intentionally empty — Firebase displays the notification automatically.
})

// ─── Notification click handler ────────────────────────────────────────────────
self.addEventListener('notificationclick', function(event) {
  event.notification.close()

  // ── 1. Extract the deep-link URL from the FCM data payload ──
  let urlToOpen = '/admin'
  const data = event.notification.data

  if (data) {
    if (data.actionUrl) {
      urlToOpen = data.actionUrl
    } else if (data.FCM_MSG && data.FCM_MSG.data && data.FCM_MSG.data.actionUrl) {
      urlToOpen = data.FCM_MSG.data.actionUrl
    }
  }

  event.waitUntil(
    (async () => {
      // ── 2. Persist the URL in CacheStorage (iOS-safe bridge) ──
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

      // ── 3. Handle window focus / open ──
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
      return clients.openWindow(self.registration.scope)
    })()
  )
})
