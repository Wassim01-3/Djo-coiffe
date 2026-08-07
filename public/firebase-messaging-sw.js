importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js')

// Hardcoded Firebase Config for the Service Worker
// (Since this runs outside of Vite's build process)
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

// ─── Background message handler ──────────────────────────────────────────────
// We handle it here so that the `notificationclick` handler below receives the
// correct `event.notification.data` with our `actionUrl`.
//
// Firebase automatically shows a notification when the payload has a
// `notification` field, which would cause DUPLICATE notifications if we also
// call showNotification(). To avoid duplicates we check if a notification
// body/title is already provided and skip manual showNotification.
//
// However, we MUST register onBackgroundMessage so the SW "owns" the message
// and our custom notificationclick handler gets invoked (otherwise Chrome uses
// Firebase's built-in handler which ignores our click logic).
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Background message received:', payload)

  // The notification is already displayed automatically by Firebase because
  // the server sends a `notification` field. We just want to make sure our
  // notificationclick handler fires, so we do NOT call showNotification again.
  // (Calling it here causes the duplicate notification the user experienced.)
})

// ─── Notification click handler ───────────────────────────────────────────────
self.addEventListener('notificationclick', function(event) {
  event.notification.close()

  // Try to extract the actionUrl from all possible FCM payload locations.
  // Firebase can nest data differently depending on SDK version.
  let urlToOpen = '/admin'
  const data = event.notification.data

  console.log('[SW] Notification clicked. data:', JSON.stringify(data))

  if (data) {
    if (data.actionUrl) {
      urlToOpen = data.actionUrl
    } else if (data.FCM_MSG) {
      // Some FCM compat versions wrap data inside FCM_MSG
      const fcmData = data.FCM_MSG.data
      if (fcmData && fcmData.actionUrl) {
        urlToOpen = fcmData.actionUrl
      }
    }
  }

  console.log('[SW] Navigating to:', urlToOpen)

  // Resolve to an absolute URL so openWindow works correctly
  const absoluteUrl = urlToOpen.startsWith('http')
    ? urlToOpen
    : self.registration.scope.replace(/\/$/, '') + urlToOpen

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // If the PWA is already open, send a message so React Router navigates
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i]
          if (client.url.includes(self.location.origin)) {
            client.postMessage({ type: 'SW_NAVIGATE', url: urlToOpen })
            return client.focus()
          }
        }
        // App is not open: open a new window at the deep-link URL
        return clients.openWindow(absoluteUrl)
      })
  )
})
