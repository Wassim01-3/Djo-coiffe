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

// We do NOT call messaging.onBackgroundMessage() / showNotification() here.
// Firebase automatically displays a notification when the payload contains
// a 'notification' object. Doing it manually causes duplicate notifications.

// Handle click on the FCM-generated notification
self.addEventListener('notificationclick', function(event) {
  event.notification.close()

  // Extract the actionUrl from multiple possible locations in the FCM payload
  let urlToOpen = '/'
  const data = event.notification.data

  if (data) {
    if (data.actionUrl) {
      urlToOpen = data.actionUrl
    } else if (data.FCM_MSG && data.FCM_MSG.data && data.FCM_MSG.data.actionUrl) {
      urlToOpen = data.FCM_MSG.data.actionUrl
    }
  }

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Check if there is already a window/tab open with the app
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i]
          if (client.url && client.url.includes(self.location.origin)) {
            // App is already open — tell React Router to navigate via postMessage
            // This is necessary because client.navigate() bypasses React Router
            client.postMessage({ type: 'SW_NAVIGATE', url: urlToOpen })
            return client.focus()
          }
        }

        // App is NOT open — open a new window at the correct deep-link URL
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen)
        }
      })
  )
})
